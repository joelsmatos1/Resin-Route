/* Account-scoped local cache and optimistic concurrency; no auth secrets here. */
(function(root) {
  'use strict';
  const clone = value => JSON.parse(JSON.stringify(value));
  class CloudPlannerStore {
    constructor({storage, repository, onChange = () => {}, onStatus = () => {}}) {
      Object.assign(this, {storage, repository, onChange, onStatus});
      this.user = null; this.epoch = 0; this.dirty = false; this.ready = false;
      this.busy = false; this.conflict = null; this.revision = null; this.edit = 0;
    }
    key() { return `resin-route-account-v1:${this.user}`; }
    persist() {
      try { this.storage.setItem(this.key(), JSON.stringify({document:this.document, revision:this.revision, dirty:this.dirty})); }
      catch { this.onStatus('storage-error'); return false; }
      return true;
    }
    async connect(user, empty) {
      this.epoch++; this.user = user; this.ready = false; this.busy = false; this.conflict = null; this.edit = 0;
      let cached;
      try { cached = JSON.parse(this.storage.getItem(this.key())); } catch {}
      this.document = clone(cached?.document || empty);
      this.revision = cached?.revision ?? null; this.dirty = !!cached?.dirty;
      this.onChange(clone(this.document));
      await this.refresh();
    }
    disconnect() { this.epoch++; this.user = null; this.ready = false; this.busy = false; this.conflict = null; }
    async refresh() {
      if (!this.user || this.busy) return;
      const epoch = this.epoch; this.busy = true; this.onStatus('loading');
      try {
        const remote = await this.repository.read(this.user);
        if (epoch !== this.epoch) return;
        this.ready = true;
        if (this.dirty && (remote?.revision ?? null) !== this.revision) {
          this.conflict = remote || {document:null, revision:null}; this.onStatus('conflict'); return;
        }
        if (!this.dirty && remote) {
          this.document = clone(remote.document); this.revision = remote.revision;
          this.onChange(clone(this.document)); this.persist();
        }
        this.conflict = null; this.onStatus(this.dirty ? 'pending' : 'saved');
      } catch { if (epoch === this.epoch) this.onStatus('offline'); return; }
      finally { if (epoch === this.epoch) this.busy = false; }
      if (epoch === this.epoch && this.dirty && !this.conflict) await this.flush();
    }
    change(document) {
      if (!this.user) return;
      this.document = clone(document); this.dirty = true; this.edit++;
      if (this.persist()) this.onStatus(this.conflict ? 'conflict' : 'pending');
    }
    async flush() {
      if (!this.user || this.busy || this.conflict || !this.dirty) return;
      if (!this.ready) return this.refresh();
      const epoch = this.epoch, edit = this.edit;
      const document = clone(this.document), revision = this.revision, user = this.user;
      this.busy = true; this.onStatus('saving');
      try {
        const result = await this.repository.save(user, document, revision);
        if (epoch !== this.epoch) return;
        if (!result) { this.ready = false; }
        else {
          this.revision = result.revision; this.dirty = this.edit !== edit;
          if (this.persist()) this.onStatus(this.dirty ? 'pending' : 'saved');
        }
      } catch { if (epoch === this.epoch) this.onStatus('offline'); return; }
      finally { if (epoch === this.epoch) this.busy = false; }
      if (epoch === this.epoch && this.dirty) {
        if (!this.ready) await this.refresh(); else await this.flush();
      }
    }
    async resolve(useLocal) {
      if (!this.conflict) return;
      // Keep the discarded version in a local recovery slot before resolving.
      const discarded = useLocal ? this.conflict.document : this.document;
      try { this.storage.setItem(`${this.key()}:before-conflict`, JSON.stringify(discarded)); }
      catch { this.onStatus('storage-error'); return; }
      const remote = this.conflict; this.conflict = null; this.revision = remote.revision; this.ready = true;
      if (useLocal) { this.dirty = true; this.persist(); await this.flush(); }
      else {
        if (remote.document) this.document = clone(remote.document);
        this.dirty = false; this.persist(); this.onChange(clone(this.document)); this.onStatus('saved');
      }
    }
  }
  root.CloudPlannerStore = CloudPlannerStore;
  if (typeof module !== 'undefined') module.exports = CloudPlannerStore;
})(typeof window === 'undefined' ? globalThis : window);
