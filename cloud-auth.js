(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const config = window.RESIN_ROUTE_CLOUD || {};
  let client, store, planner, user = null, timer, recovery = false, status = 'local', starting;
  const text = (pt, en) => planner?.snapshot().lang === 'en' ? en : pt;
  const messages = {
    local:['Salvo neste navegador','Saved in this browser'], loading:['Conectando…','Connecting…'],
    pending:['Alterações aguardando envio','Changes waiting to sync'], saving:['Salvando online…','Saving online…'],
    saved:['Sincronizado','Synced'], offline:['Sem sincronização · tentar novamente','Not synced · retry'],
    conflict:['Duas versões · escolha qual manter','Two versions · choose which to keep'],
    'storage-error':['Não foi possível salvar a cópia local. Baixe um backup.','Could not save the local copy. Download a backup.'],
    unconfigured:['Login ainda não configurado','Login is not configured yet'],
  };
  function repaint() {
    $('cloudAccountBtn').textContent = user ? text('Minha conta','My account') : text('Entrar','Sign in');
    $('cloudStatus').textContent = text(...(messages[status] || messages.local));
    $('cloudStatus').dataset.status = status;
    $('cloudTitle').textContent = recovery ? text('Definir nova senha','Set new password') : text('Sua conta','Your account');
    $('cloudEmailLabel').textContent = text('Email','Email');
    $('cloudPasswordLabel').textContent = recovery ? text('Nova senha (mínimo 8 caracteres)','New password (8 characters minimum)') : text('Senha','Password');
    $('cloudSubmit').textContent = recovery ? text('Salvar nova senha','Save new password') : text('Entrar','Sign in');
    $('cloudSignup').textContent = text('Criar conta','Create account');
    $('cloudReset').textContent = text('Esqueci minha senha','Forgot password');
    $('cloudSignout').textContent = text('Sair da conta','Sign out');
    $('cloudImport').textContent = text('Importar plano sem login','Import guest plan');
    $('cloudRetry').textContent = text('Sincronizar agora','Sync now');
    $('cloudKeepLocal').textContent = text('Manter esta versão','Keep this version');
    $('cloudKeepRemote').textContent = text('Usar versão online','Use online version');
    $('cloudConflictText').textContent = text('O plano online mudou em outro dispositivo ou aba. Escolha qual versão manter. A versão descartada terá uma cópia de recuperação neste navegador.','The online plan changed on another device or tab. Choose which version to keep. A recovery copy of the discarded version will remain in this browser.');
    $('cloudAccountEmail').textContent = user?.email || '';
    $('cloudSignedIn').hidden = !user || recovery;
    $('cloudGoogle').hidden = !!user || recovery;
    $('cloudGoogle').textContent = text('Entrar com Google','Sign in with Google');
    $('cloudGoogleHelp').hidden = !!user || recovery;
    $('cloudGoogleHelp').textContent = text('Use sua conta Google para salvar seu cronograma e acessar em outros dispositivos.','Use your Google account to save your plan and access it on other devices.');
    $('cloudForm').hidden = !recovery && (!!user || config.enableEmailPassword !== true);
    $('cloudEmailField').hidden = recovery;
    $('cloudEmail').required = !recovery;
    $('cloudPassword').minLength = recovery ? 8 : 1;
    $('cloudPassword').autocomplete = recovery ? 'new-password' : 'current-password';
    $('cloudSignup').hidden = recovery; $('cloudReset').hidden = recovery;
    $('cloudConflict').hidden = status !== 'conflict';
    $('cloudClose').setAttribute('aria-label',text('Fechar','Close'));
  }
  function setStatus(value) { status = value; repaint(); }
  function notice(value) { $('cloudMessage').textContent = value; }
  function errorMessage(error) {
    const message = String(error?.message || '');
    if (/invalid login credentials/i.test(message)) return text('Email ou senha incorretos.','Incorrect email or password.');
    if (/email not confirmed/i.test(message)) return text('Confirme seu email antes de entrar.','Confirm your email before signing in.');
    if (/rate|too many|seconds/i.test(message)) return text('Muitas tentativas. Aguarde um pouco e tente novamente.','Too many attempts. Wait a little and try again.');
    return text('Não foi possível concluir. Confira a conexão e tente novamente.','Could not complete this action. Check your connection and retry.');
  }
  function redirectURL() { return location.origin + location.pathname; }
  async function loadSDK() {
    if (window.supabase) return;
    await new Promise((resolve,reject) => {
      const script=document.createElement('script');
      script.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
      const timeout=setTimeout(()=>{script.remove();reject(new Error('timeout'));},15000);
      script.onload=()=>{clearTimeout(timeout);resolve();};
      script.onerror=()=>{clearTimeout(timeout);script.remove();reject(new Error('network'));};
      document.head.appendChild(script);
    });
  }
  async function start() {
    if (starting) return starting;
    if (client) return true;
    if (!/^https:\/\/[^/]+$/.test(config.url || '') || !config.publishableKey) {
      setStatus('unconfigured'); notice(text('O salvamento local continua funcionando. Falta conectar o Supabase em supabase-config.js.','Local saving still works. Supabase must be connected in supabase-config.js.')); return false;
    }
    starting = (async () => {
      try {
        await loadSDK();
        client=window.supabase.createClient(config.url,config.publishableKey,{
          auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'implicit'},
        });
        const repository = {
          async read(id) {
            const {data,error}=await client.from('resin_route_plans').select('document,revision').eq('user_id',id).abortSignal(AbortSignal.timeout(15000)).maybeSingle();
            if(error) throw error; return data;
          },
          async save(id,document,revision) {
            // Capture the token for this exact owner. A sign-out/account switch
            // during the request must never save this plan under another user.
            const {data:auth,error:authError}=await client.auth.getSession();
            if(authError || auth.session?.user.id !== id) throw new Error('Session changed');
            const response=await fetch(`${config.url}/rest/v1/rpc/save_resin_route_plan`,{
              method:'POST', headers:{apikey:config.publishableKey,Authorization:`Bearer ${auth.session.access_token}`,'Content-Type':'application/json'},
              body:JSON.stringify({p_document:document,p_revision:revision}),
              signal:AbortSignal.timeout(15000),
            });
            if(!response.ok) throw new Error('Save failed');
            const data=await response.json(); return data?.[0] || null;
          },
        };
        store=new window.CloudPlannerStore({storage:localStorage,repository,onChange:doc=>planner.apply(doc),onStatus:setStatus});
        // Never await another auth call inside Supabase's auth event callback.
        client.auth.onAuthStateChange((event,session)=>setTimeout(()=>{
          if(event==='PASSWORD_RECOVERY') { recovery=true; $('cloudDialog').showModal(); }
          handleSession(session).catch(()=>setStatus('offline'));
        },0));
        const {data,error}=await client.auth.getSession();
        if(error) throw error;
        await handleSession(data.session);
        return true;
      } catch(error) { setStatus('offline');notice(errorMessage(error));return false; }
      finally { starting=null; }
    })();
    return starting;
  }
  async function handleSession(session) {
    const next=session?.user || null;
    if(next?.id===user?.id) { repaint();return; }
    clearTimeout(timer);
    user=next;
    if(user) await store.connect(user.id,planner.empty());
    else { store.disconnect(); recovery=false; planner.apply(planner.guest());setStatus('local'); }
    repaint();
  }
  async function action(run) {
    const buttons=[...$('cloudDialog').querySelectorAll('button:not(#cloudClose)')];
    buttons.forEach(b=>b.disabled=true); notice('');
    try { if(await start()) await run(); }
    catch(error) { notice(errorMessage(error)); }
    finally { buttons.forEach(b=>b.disabled=false);$('cloudPassword').value=''; }
  }
  window.ResinCloud = {
    attach(bridge) {
      planner=bridge; repaint();
      $('cloudAccountBtn').addEventListener('click',()=>{$('cloudDialog').showModal();if(!client)start();});
      $('cloudClose').addEventListener('click',()=>{$('cloudPassword').value='';$('cloudDialog').close();});
      $('cloudDialog').addEventListener('close',()=>{$('cloudPassword').value='';});
      $('cloudGoogle').addEventListener('click',()=>action(async()=>{
        const {error}=await client.auth.signInWithOAuth({
          provider:'google',
          options:{redirectTo:redirectURL(),queryParams:{prompt:'select_account'}},
        });
        if(error)throw error;
      }));
      $('cloudForm').addEventListener('submit',event=>{
        event.preventDefault();
        const email=$('cloudEmail').value.trim(),password=$('cloudPassword').value;
        action(async()=>{
          if(recovery) {
            const {error}=await client.auth.updateUser({password});if(error)throw error;
            recovery=false;repaint();notice(text('Senha atualizada.','Password updated.'));
          } else {
            const {data,error}=await client.auth.signInWithPassword({email,password});if(error)throw error;
            await handleSession(data.session);
          }
        });
      });
      $('cloudSignup').addEventListener('click',()=>{
        $('cloudPassword').minLength=8;
        if(!$('cloudForm').reportValidity())return;
        const email=$('cloudEmail').value.trim(),password=$('cloudPassword').value;
        action(async()=>{
          const {data,error}=await client.auth.signUp({email,password,options:{emailRedirectTo:redirectURL()}});if(error)throw error;
          if(data.session)await handleSession(data.session);
          else notice(text('Confira seu email para confirmar o cadastro. Se já tiver conta, entre ou recupere a senha.','Check your email to confirm signup. If you already have an account, sign in or reset your password.'));
        });
      });
      $('cloudReset').addEventListener('click',()=>{
        if(!$('cloudEmail').reportValidity())return;
        const email=$('cloudEmail').value.trim();
        action(async()=>{const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:redirectURL()});if(error)throw error;
          notice(text('Se houver uma conta para esse email, você receberá um link para redefinir a senha.','If an account exists for this email, you will receive a password reset link.'));});
      });
      $('cloudSignout').addEventListener('click',()=>action(async()=>{
        if(store.dirty && !confirm(text('Há alterações não sincronizadas. Elas ficarão neste navegador para esta conta. Sair mesmo assim?','Unsynced changes will remain in this browser for this account. Sign out anyway?')))return;
        const {error}=await client.auth.signOut({scope:'local'});if(error)throw error;
        await handleSession(null);
      }));
      $('cloudImport').addEventListener('click',()=>action(async()=>{
        if(!confirm(text('Substituir o plano desta conta pelo plano sem login deste navegador? O plano sem login será preservado.','Replace this account’s plan with this browser’s guest plan? The guest plan will be preserved.')))return;
        // Retain the current account plan before an explicit import.
        localStorage.setItem(`${store.key()}:before-import`,JSON.stringify(planner.snapshot()));
        planner.apply(planner.guest());store.change(planner.snapshot());await store.flush();
      }));
      $('cloudRetry').addEventListener('click',()=>action(()=>store.refresh()));
      $('cloudKeepLocal').addEventListener('click',()=>action(()=>store.resolve(true)));
      $('cloudKeepRemote').addEventListener('click',()=>action(()=>store.resolve(false)));
      window.addEventListener('online',()=>{if(user)store.refresh();else if(!client)start();});
      window.addEventListener('focus',()=>{if(user)store.refresh();});
      document.addEventListener('visibilitychange',()=>{if(!document.hidden && user)store.refresh();});
      window.addEventListener('beforeunload',event=>{if(store?.dirty){event.preventDefault();event.returnValue='';}});
      const callbackError = new URLSearchParams(location.hash.slice(1)).get('error');
      if(callbackError) {
        notice(text('O login não foi concluído. Tente novamente pelo botão Google.','Sign-in was not completed. Try again using the Google button.'));
        $('cloudDialog').showModal();
      }
      if(config.url && config.publishableKey)start();
    },
    save(document) {
      repaint();
      if(!user)return false;
      store.change(document);clearTimeout(timer);timer=setTimeout(()=>store.flush(),700);return true;
    },
    refreshLabels:repaint,
  };
})();
