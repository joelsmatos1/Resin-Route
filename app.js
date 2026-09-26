(() => {
  'use strict';

  const DB_CDN = 'https://cdn.jsdelivr.net/gh/theBowja/genshin-db-dist@main';
  const ASSET_CDNS = [
    filename => `https://gi.yatta.moe/assets/UI/${encodeURIComponent(cleanAssetName(filename))}.png`,
    filename => `https://static.nanoka.cc/gi/UI/${encodeURIComponent(cleanAssetName(filename))}.webp`,
    filename => `https://enka.network/ui/${encodeURIComponent(cleanAssetName(filename))}.png`,
  ];
  // Release supplement. Full live records always take precedence over these
  // basic entries. Sources and validation limits are documented in LEIA-ME.md.
  const RELEASE_71 = {
    characters: [
      { name:'Vesna', elementText:'Anemo', weaponText:'Sword', rarity:5 },
      { name:'Vodyanitsa', elementText:'Hydro', weaponText:'Catalyst', rarity:5 },
    ],
    weapons: [
      { name:'Beyond the Chrysalis', weaponText:'Sword', rarity:5 },
      { name:'Hymn of the Maelstrom', weaponText:'Catalyst', rarity:5 },
      { name:'New Bough', weaponText:'Sword', rarity:4 },
      { name:"Winter's Heavy Heart", weaponText:'Catalyst', rarity:4 },
      { name:'Breezeborne Refrain', weaponText:'Bow', rarity:4 },
      { name:'Silver Light', weaponText:'Sword', rarity:4 },
    ],
  };
  const pendingFarmMessage = () => state.lang === 'en'
    ? 'Farming details not available yet. Days and materials have not been verified.'
    : 'Dados de farm ainda indisponíveis. Dias e materiais não foram verificados.';

  const STORAGE_KEY = 'resin-route-state-v1';
  const CURRENT_STRONGBOX_MAX_VERSION = 6.0; // v7.0 includes the two artifact sets released in 6.0/Luna I.
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const DAY_NAMES = {
    pt: { Monday:'Segunda-feira', Tuesday:'Terça-feira', Wednesday:'Quarta-feira', Thursday:'Quinta-feira', Friday:'Sexta-feira', Saturday:'Sábado', Sunday:'Domingo' },
    en: { Monday:'Monday', Tuesday:'Tuesday', Wednesday:'Wednesday', Thursday:'Thursday', Friday:'Friday', Saturday:'Saturday', Sunday:'Sunday' },
  };
  const DAY_SHORT = {
    pt: { Monday:'Seg', Tuesday:'Ter', Wednesday:'Qua', Thursday:'Qui', Friday:'Sex', Saturday:'Sáb', Sunday:'Dom' },
    en: { Monday:'Mon', Tuesday:'Tue', Wednesday:'Wed', Thursday:'Thu', Friday:'Fri', Saturday:'Sat', Sunday:'Sun' },
  };
  const CATEGORY_LABELS = {
    pt: { domain:'Domínio', boss:'Chefe', weekly:'Chefe semanal', leyline:'Linha Ley', artifact:'Artefatos', talent:'Materiais de talento', weapon:'Materiais de arma', character:'Materiais de personagem', route:'Rota', strongbox:'Strongbox', custom:'Personalizado', characters:'Personagem', weapons:'Arma', artifacts:'Conjunto de artefatos', domains:'Domínio', materials:'Material', misc:'Miscelânea' },
    en: { domain:'Domain', boss:'Boss', weekly:'Weekly Boss', leyline:'Ley Line', artifact:'Artifacts', talent:'Talent Materials', weapon:'Weapon Materials', character:'Character Materials', route:'Route', strongbox:'Strongbox', custom:'Custom', characters:'Character', weapons:'Weapon', artifacts:'Artifact Set', domains:'Domain', materials:'Material', misc:'Miscellaneous' },
  };
  const I18N = {
    pt: {
      brandSubtitle:'planejador semanal de Genshin', language:'Idioma', export:'Baixar backup (.json)', exportImage:'Exportar imagem', import:'Restaurar backup (.json)', backup:'Backup', backupTitle:'Backup do planejamento', backupDesc:'Baixe uma cópia do seu plano ou restaure um arquivo salvo anteriormente.', backupHelp:'O backup inclui tarefas, progresso, notas e limite diário de Resina.', copyBackup:'Copiar backup', custom:'+ Tarefa personalizada',
      heroEyebrow:'SUA SEMANA EM UM OLHAR', heroTitle:'Use sua resina com propósito.', heroText:'Escolha o que quer farmar, defina o dia e mantenha sua rota semanal de resina sempre visível.',
      thisWeek:'Esta semana', plannedResin:'resina planejada', completed:'Concluído', attemptsPlanned:'das tentativas planejadas', dailyLimit:'Limite diário', editable:'editável',
      plan:'PLANO', nothing:'Nada planejado ainda', nothingText:'Escolha algo da biblioteca do jogo ou adicione uma tarefa personalizada.', browse:'Ver dados do jogo',
      gameLibrary:'BIBLIOTECA DO JOGO', chooseFarm:'Escolha o que farmar', weekView:'VISÃO DA SEMANA', resinDistribution:'Distribuição de resina', clearWeek:'Limpar semana',
      search:'Buscar', clickPlan:'Clique em um item para planejá-lo', item:'item', items:'itens', loading:'Carregando dados do jogo…',
      taskName:'Nome da tarefa', day:'Dia', category:'Categoria', resinPerRun:'Resina por tentativa', attempts:'Tentativas', note:'Nota', optional:'opcional', totalPlanned:'Total planejado', cancel:'Cancelar', addPlan:'Adicionar ao plano',
      customType:'TAREFA PERSONALIZADA', customTitle:'Criar uma tarefa personalizada de resina', customSubtitle:'Adicione qualquer coisa que não esteja na biblioteca do jogo.',
      artifactMethod:'Como obter este conjunto', farmDomain:'Farmar domínio', strongboxMethod:'Strongbox / Oferecer Artefato', strongboxAvailable:'Este conjunto está disponível na Oferenda Mística atual.', strongboxUnavailable:'Este conjunto ainda não está disponível na Oferenda Mística atual.',
      strongboxEyebrow:'OFERECER ARTEFATO', strongboxTitle:'Escolha o conjunto da Strongbox', strongboxDesc:'Escolha um conjunto disponível na Oferenda Mística. Ele será adicionado ao plano usando a miniatura do próprio conjunto e sem custo de Resina.', strongboxSearch:'Buscar conjunto…',
      noStrongbox:'Nenhum conjunto disponível encontrado.', noItems:'Nenhum item encontrado.', available:'Disponível', currentData:'Dados atuais do genshin-db', emergency:'Dados locais de emergência',
      miscHint:'Rotas sem Resina, Strongbox e tarefas livres.', artifactRoute:'Rota de artefatos', artifactRouteSub:'Rota de investigação · sem Resina', moraRoute:'Rota de Mora', moraRouteSub:'Mundo aberto · sem Resina', oreRoute:'Rota de minério', oreRouteSub:'Mineração · sem Resina', strongbox:'Strongbox de artefatos', strongboxSub:'Escolher conjunto da Oferenda Mística', customMisc:'Tarefa personalizada', customMiscSub:'Adicione qualquer atividade ao seu plano',
      routeArtifactTask:'Fazer rota de artefatos', routeMoraTask:'Fazer rota de Mora', routeOreTask:'Fazer rota de minério',
      domainMethodSubtitle:'Farmar o domínio deste conjunto.', strongboxMethodSubtitle:'Planejar conversões na Oferenda Mística · 0 Resina.',
      characterFarm:'O que farmar', charBoss:'Chefe de ascensão', charAscension:'Materiais para upar', charTalents:'Talentos', charWeekly:'Chefe semanal', materialPreview:'Materiais relacionados', today:'hoje', task:'tarefa', tasks:'tarefas', above:'acima', plannedTask:'tarefa planejada', plannedTasks:'tarefas planejadas', resin:'resina', refresh:'Atualizar dados', footer1:'Ferramenta de planejamento feita por fãs. Genshin Impact e seus recursos pertencem à HoYoverse.', domainSearchHint:'Busque pelo domínio, personagem ou arma', usedBy:'Usado por', unavailableDay:'Esse material não está disponível nesse dia.', availableOn:'Disponível em', talentDomain:'Domínio de talento', weaponDomain:'Domínio de arma',
    },
    en: {
      brandSubtitle:'weekly Genshin planner', language:'Language', export:'Download backup (.json)', exportImage:'Export image', import:'Restore backup (.json)', backup:'Backup', backupTitle:'Planner backup', backupDesc:'Download a copy of your plan or restore a previously saved file.', backupHelp:'The backup includes tasks, progress, notes, and your daily Resin limit.', copyBackup:'Copy backup', custom:'+ Custom task',
      heroEyebrow:'YOUR WEEK AT A GLANCE', heroTitle:'Use your Resin with purpose.', heroText:'Choose what you want to farm, set the day, and keep your weekly Resin route visible.',
      thisWeek:'This week', plannedResin:'planned Resin', completed:'Completed', attemptsPlanned:'of planned runs', dailyLimit:'Daily limit', editable:'editable',
      plan:'PLAN', nothing:'Nothing planned yet', nothingText:'Choose something from the game library or add a custom task.', browse:'Browse game data',
      gameLibrary:'GAME LIBRARY', chooseFarm:'Choose what to farm', weekView:'WEEK VIEW', resinDistribution:'Resin distribution', clearWeek:'Clear week',
      search:'Search', clickPlan:'Click an item to plan it', item:'item', items:'items', loading:'Loading game data…',
      taskName:'Task name', day:'Day', category:'Category', resinPerRun:'Resin per run', attempts:'Runs', note:'Note', optional:'optional', totalPlanned:'Total planned', cancel:'Cancel', addPlan:'Add to plan',
      customType:'CUSTOM TASK', customTitle:'Create a custom task', customSubtitle:'Add anything that is not in the game library.',
      artifactMethod:'How to obtain this set', farmDomain:'Farm domain', strongboxMethod:'Artifact Strongbox / Mystic Offering', strongboxAvailable:'This set is available in the current Mystic Offering.', strongboxUnavailable:'This set is not available in the current Mystic Offering yet.',
      strongboxEyebrow:'MYSTIC OFFERING', strongboxTitle:'Choose an Artifact Strongbox', strongboxDesc:'Choose a set available in Mystic Offering. It will be added to the plan using the set thumbnail and with no Resin cost.', strongboxSearch:'Search set…',
      noStrongbox:'No available Strongbox set found.', noItems:'No items found.', available:'Available', currentData:'Current genshin-db data', emergency:'Emergency local data',
      miscHint:'Resin-free routes, Strongbox and free-form tasks.', artifactRoute:'Artifact route', artifactRouteSub:'Investigation route · no Resin', moraRoute:'Mora route', moraRouteSub:'Overworld · no Resin', oreRoute:'Ore route', oreRouteSub:'Mining · no Resin', strongbox:'Artifact Strongbox', strongboxSub:'Choose a Mystic Offering set', customMisc:'Custom task', customMiscSub:'Add any activity to your plan',
      routeArtifactTask:'Run artifact route', routeMoraTask:'Run Mora route', routeOreTask:'Run ore route',
      domainMethodSubtitle:'Farm this set from its domain.', strongboxMethodSubtitle:'Plan Mystic Offering conversions · 0 Resin.',
      characterFarm:'What to farm', charBoss:'Ascension boss', charAscension:'Level-up materials', charTalents:'Talents', charWeekly:'Weekly boss', materialPreview:'Related materials', today:'today', task:'task', tasks:'tasks', above:'over', plannedTask:'planned task', plannedTasks:'planned tasks', resin:'Resin', refresh:'Refresh data', footer1:'Fan-made planning tool. Genshin Impact and its assets belong to HoYoverse.', domainSearchHint:'Search by domain, character, or weapon', usedBy:'Used by', unavailableDay:'This material is not available on that day.', availableOn:'Available on', talentDomain:'Talent domain', weaponDomain:'Weapon domain',
    }
  };
  const LIBRARY_TYPES = [
    { id:'characters', label:'Personagens', labelEn:'Characters', singular:'Personagem', singularEn:'Character', folder:'characters' },
    { id:'weapons', label:'Armas', labelEn:'Weapons', singular:'Arma', singularEn:'Weapon', folder:'weapons' },
    { id:'artifacts', label:'Artefatos', labelEn:'Artifacts', singular:'Conjunto de artefatos', singularEn:'Artifact Set', folder:'artifacts' },
    { id:'domains', label:'Domínios', labelEn:'Domains', singular:'Talento / Arma', singularEn:'Talent / Weapon', folder:'domains' },
    { id:'boss', label:'Semanais', labelEn:'Weekly Bosses', singular:'Chefe semanal', singularEn:'Weekly Boss', folder:'enemies' },
    { id:'misc', label:'Miscelânea', labelEn:'Misc', singular:'Miscelânea', singularEn:'Miscellaneous', folder:null },
  ];

  const state = loadState();
  const libraryCache = new Map();
  const loadedDataScripts = new Set();
  const scriptPromises = new Map();
  const folderLanguages = new Map();
  let activeLibraryType = 'characters';
  let activeDomainKind = 'all';
  let activeDay = state.activeDay || getTodayName();
  if (!DAYS.includes(activeDay)) activeDay = 'Monday';
  let draggedTaskId = null;
  let dialogEntity = null;
  let dialogOptions = {};
  let dialogAllowedDays = [];
  let dialogAvailabilityContext = '';
  let dialogAvailabilityPromise = Promise.resolve();
  let toastTimer = null;

  const el = {
    dayTabs: document.querySelector('#dayTabs'),
    taskList: document.querySelector('#taskList'),
    emptyState: document.querySelector('#emptyState'),
    activeDayTitle: document.querySelector('#activeDayTitle'),
    weeklyTotal: document.querySelector('#weeklyTotal'),
    weeklyDone: document.querySelector('#weeklyDone'),
    resinCapInput: document.querySelector('#resinCapInput'),
    dayBudgetText: document.querySelector('#dayBudgetText'),
    dayBudgetBar: document.querySelector('#dayBudgetBar'),
    weekBars: document.querySelector('#weekBars'),
    libraryTabs: document.querySelector('#libraryTabs'),
    domainKindFilters: document.querySelector('#domainKindFilters'),
    librarySearch: document.querySelector('#librarySearch'),
    libraryGrid: document.querySelector('#libraryGrid'),
    libraryCount: document.querySelector('#libraryCount'),
    libraryHint: document.querySelector('#libraryHint'),
    languageSelect: document.querySelector('#languageSelect'),
    languageLabel: document.querySelector('#languageLabel'),
    libraryPanel: document.querySelector('#libraryPanel'),
    refreshDataBtn: document.querySelector('#refreshDataBtn'),
    backupDialog: document.querySelector('#backupDialog'),
    backupOpenBtn: document.querySelector('#backupOpenBtn'),
    closeBackupBtn: document.querySelector('#closeBackupBtn'),
    exportBtn: document.querySelector('#exportBtn'),
    importBtn: document.querySelector('#importBtn'),
    importInput: document.querySelector('#importInput'),
    copyBackupBtn: document.querySelector('#copyBackupBtn'),
    emptyBrowseBtn: document.querySelector('#emptyBrowseBtn'),
    clearWeekBtn: document.querySelector('#clearWeekBtn'),
    taskDialog: document.querySelector('#taskDialog'),
    taskForm: document.querySelector('#taskForm'),
    closeTaskDialogBtn: document.querySelector('#closeTaskDialogBtn'),
    dialogImage: document.querySelector('#dialogImage'),
    dialogFallback: document.querySelector('#dialogFallback'),
    dialogType: document.querySelector('#dialogType'),
    dialogTitle: document.querySelector('#dialogTitle'),
    dialogSubtitle: document.querySelector('#dialogSubtitle'),
    taskNameField: document.querySelector('#taskNameField'),
    taskNameInput: document.querySelector('#taskNameInput'),
    taskDayInput: document.querySelector('#taskDayInput'),
    taskCategoryField: document.querySelector('#taskCategoryField'),
    taskCategoryInput: document.querySelector('#taskCategoryInput'),
    artifactMethodField: document.querySelector('#artifactMethodField'),
    artifactMethodInput: document.querySelector('#artifactMethodInput'),
    artifactMethodLabel: document.querySelector('#artifactMethodLabel'),
    artifactMethodNote: document.querySelector('#artifactMethodNote'),
    characterFarmField: document.querySelector('#characterFarmField'),
    characterFarmInput: document.querySelector('#characterFarmInput'),
    characterMaterialPreview: document.querySelector('#characterMaterialPreview'),
    resinPerRunInput: document.querySelector('#resinPerRunInput'),
    runsInput: document.querySelector('#runsInput'),
    noteInput: document.querySelector('#noteInput'),
    entityTypeInput: document.querySelector('#entityTypeInput'),
    entityIdInput: document.querySelector('#entityIdInput'),
    entityImageInput: document.querySelector('#entityImageInput'),
    dialogTotal: document.querySelector('#dialogTotal'),
    cancelDialogBtn: document.querySelector('#cancelDialogBtn'),
    strongboxDialog: document.querySelector('#strongboxDialog'),
    strongboxGrid: document.querySelector('#strongboxGrid'),
    strongboxSearch: document.querySelector('#strongboxSearch'),
    closeStrongboxBtn: document.querySelector('#closeStrongboxBtn'),
    taskTemplate: document.querySelector('#taskTemplate'),
  };

  init();

  function init() {
    seedFallbackLibraries();
    setApiStatus('fallback');
    el.languageSelect.value = state.lang || 'pt';
    applyLanguage();
    el.resinCapInput.value = state.resinCap;
    el.taskDayInput.innerHTML = DAYS.map(day => `<option value="${day}">${dayLabel(day)}</option>`).join('');
    renderLibraryTabs();
    bindEvents();
    renderAll();
    renderLibraryGrid(activeLibraryType);
    loadLibrary(activeLibraryType);
    window.ResinCloud?.attach({
      snapshot: () => JSON.parse(JSON.stringify(state)),
      empty: defaultState,
      guest: loadState,
      apply: applyCloudState,
    });
  }

  function defaultState() {
    return {
      resinCap: 200,
      lang: 'pt',
      activeDay: getTodayName(),
      tasks: DAYS.reduce((acc, day) => (acc[day] = [], acc), {}),
    };
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!saved || typeof saved !== 'object') return defaultState();
      const base = defaultState();
      return {
        ...base,
        ...saved,
        resinCap: Number(saved.resinCap) || 200,
        lang: saved.lang === 'en' ? 'en' : 'pt',
        tasks: DAYS.reduce((acc, day) => {
          acc[day] = Array.isArray(saved.tasks?.[day]) ? saved.tasks[day] : [];
          return acc;
        }, {}),
      };
    } catch {
      return defaultState();
    }
  }

  function saveState() {
    state.activeDay = activeDay;
    if (window.ResinCloud?.save(state)) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch { toast(state.lang === 'en' ? 'Could not save locally. Download a backup.' : 'Não foi possível salvar. Baixe um backup.'); }
  }

  function applyCloudState(incoming) {
    if (!incoming || typeof incoming !== 'object' || !incoming.tasks) return;
    state.resinCap = clamp(Number(incoming.resinCap) || 200, 20, 2000);
    state.lang = incoming.lang === 'en' ? 'en' : 'pt';
    state.tasks = DAYS.reduce((tasks, day) => {
      tasks[day] = Array.isArray(incoming.tasks[day]) ? incoming.tasks[day].filter(task => task && typeof task === 'object') : [];
      return tasks;
    }, {});
    activeDay = DAYS.includes(incoming.activeDay) ? incoming.activeDay : getTodayName();
    state.activeDay = activeDay;
    el.resinCapInput.value = state.resinCap;
    el.taskDialog.close(); el.strongboxDialog.close(); el.backupDialog.close();
    libraryCache.clear(); seedFallbackLibraries(); applyLanguage();
    el.taskDayInput.innerHTML = DAYS.map(day => `<option value="${day}">${dayLabel(day)}</option>`).join('');
    renderAll(); renderLibraryGrid(activeLibraryType); loadLibrary(activeLibraryType);
  }

  function bindEvents() {
    el.languageSelect.addEventListener('change', changeLanguage);
    el.dayTabs.addEventListener('click', event => {
      const btn = event.target.closest('[data-day]');
      if (!btn) return;
      activeDay = btn.dataset.day;
      saveState();
      renderAll();
    });

    el.libraryTabs.addEventListener('click', event => {
      const btn = event.target.closest('[data-library-type]');
      if (!btn) return;
      activeLibraryType = btn.dataset.libraryType;
      if (activeLibraryType !== 'domains') activeDomainKind = 'all';
      el.librarySearch.value = '';
      renderLibraryTabs();
      loadLibrary(activeLibraryType);
    });
    el.domainKindFilters.addEventListener('click', event => {
      const btn = event.target.closest('[data-domain-kind]');
      if (!btn) return;
      activeDomainKind = btn.dataset.domainKind;
      renderDomainKindFilters();
      renderLibraryGrid('domains');
    });

    el.librarySearch.addEventListener('input', () => renderLibraryGrid(activeLibraryType));
    el.refreshDataBtn.addEventListener('click', () => {
      loadLibrary(activeLibraryType, true);
    });

    el.libraryGrid.addEventListener('click', event => {
      const card = event.target.closest('.entity-card');
      if (!card) return;
      const items = libraryCache.get(activeLibraryType) || [];
      const entity = items.find(item => item.id === card.dataset.id);
      if (!entity) return;
      if (entity.action === 'strongbox') openStrongboxDialog();
      else if (entity.action === 'custom') openTaskDialog(null);
      else openTaskDialog(entity);
    });

    el.emptyBrowseBtn.addEventListener('click', () => el.libraryPanel.scrollIntoView({ behavior: 'smooth', block: 'start' }));

    el.resinCapInput.addEventListener('change', () => {
      const next = clamp(Number(el.resinCapInput.value) || 200, 20, 2000);
      state.resinCap = next;
      el.resinCapInput.value = next;
      saveState();
      renderAll();
    });

    el.taskList.addEventListener('click', handleTaskListClick);
    el.taskList.addEventListener('dragstart', event => {
      const card = event.target.closest('.task-card');
      if (!card) return;
      draggedTaskId = card.dataset.taskId;
      card.classList.add('dragging');
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', draggedTaskId);
    });
    el.taskList.addEventListener('dragend', event => {
      event.target.closest('.task-card')?.classList.remove('dragging');
      draggedTaskId = null;
    });

    el.taskForm.addEventListener('submit', event => {
      event.preventDefault();
      if (event.submitter?.value === 'cancel') { el.taskDialog.close(); return; }
      addTaskFromDialog();
    });
    el.closeTaskDialogBtn.addEventListener('click', () => el.taskDialog.close());
    el.cancelDialogBtn.addEventListener('click', () => el.taskDialog.close());
    el.taskDialog.addEventListener('click', event => { if (event.target === el.taskDialog) el.taskDialog.close(); });
    el.taskDayInput.addEventListener('change', () => {
      if (dialogAllowedDays.length && !dialogAllowedDays.includes(el.taskDayInput.value)) showAvailabilityError(el.taskDayInput.value);
    });
    document.querySelectorAll('[data-resin]').forEach(btn => {
      btn.addEventListener('click', () => {
        el.resinPerRunInput.value = btn.dataset.resin;
        updateDialogTotal();
      });
    });
    el.artifactMethodInput.addEventListener('change', applyArtifactMethod);
    el.characterFarmInput.addEventListener('change', () => { applyCharacterFarmMode(); populateCharacterMaterialPreview(dialogEntity); dialogAvailabilityPromise = applyRelatedDomainAvailability(dialogEntity, el.characterFarmInput.value); });
    el.resinPerRunInput.addEventListener('input', updateDialogTotal);
    el.runsInput.addEventListener('input', updateDialogTotal);

    el.closeStrongboxBtn.addEventListener('click', () => el.strongboxDialog.close());
    el.strongboxSearch.addEventListener('input', renderStrongboxGrid);
    el.strongboxGrid.addEventListener('click', event => {
      const card = event.target.closest('.entity-card');
      if (!card) return;
      const artifacts = libraryCache.get('artifacts') || [];
      const entity = artifacts.find(item => item.id === card.dataset.id);
      if (!entity) return;
      el.strongboxDialog.close();
      openTaskDialog(entity, { artifactMethod: 'strongbox' });
    });

    el.backupOpenBtn.addEventListener('click', () => el.backupDialog.showModal());
    el.closeBackupBtn.addEventListener('click', () => el.backupDialog.close());
    el.backupDialog.addEventListener('click', event => { if (event.target === el.backupDialog) el.backupDialog.close(); });
    el.exportBtn.addEventListener('click', exportPlanner);
    el.importBtn.addEventListener('click', () => el.importInput.click());
    el.copyBackupBtn.addEventListener('click', copyPlannerBackup);
    el.importInput.addEventListener('change', importPlanner);
    el.clearWeekBtn.addEventListener('click', clearWeek);
  }

  function renderAll() {
    renderDayTabs();
    renderTasks();
    renderSummary();
    renderWeekBars();
  }

  function renderDayTabs() {
    const today = getTodayName();
    el.dayTabs.innerHTML = DAYS.map(day => {
      const total = totalForDay(day);
      const percent = Math.min(100, (total / state.resinCap) * 100 || 0);
      return `
        <button type="button" class="day-tab ${day === activeDay ? 'active' : ''} ${day === today ? 'today' : ''}" data-day="${day}">
          <span class="day-name">${dayShort(day)}</span>
          <span class="day-resin"><span>${state.tasks[day].length} ${state.tasks[day].length === 1 ? tr('task') : tr('tasks')}</span><strong>${total}</strong></span>
        </button>`;
    }).join('');
  }

  function renderTasks() {
    const tasks = state.tasks[activeDay];
    el.activeDayTitle.textContent = dayLabel(activeDay);
    el.taskList.innerHTML = '';
    el.emptyState.hidden = tasks.length > 0;

    tasks.forEach(task => {
      const node = el.taskTemplate.content.firstElementChild.cloneNode(true);
      node.dataset.taskId = task.id;
      node.querySelector('.task-category').textContent = categoryLabel(task.category || task.entityType || 'custom');
      node.querySelector('.task-total').textContent = `${task.resinPerRun * task.runs} ${tr('resin')}`;
      node.querySelector('.task-title').textContent = task.name;
      const note = node.querySelector('.task-note');
      note.textContent = task.note || `${task.runs} ${task.runs === 1 ? (state.lang === 'en' ? 'run' : 'tentativa') : (state.lang === 'en' ? 'runs' : 'tentativas')} × ${task.resinPerRun} ${tr('resin')}`;

      node.querySelector('.move-task').title = state.lang === 'en' ? 'Move to another day' : 'Mover para outro dia';
      node.querySelector('.duplicate-task').title = state.lang === 'en' ? 'Duplicate' : 'Duplicar';
      node.querySelector('.delete-task').title = state.lang === 'en' ? 'Delete' : 'Excluir';
      const img = node.querySelector('.task-image');
      const fallback = node.querySelector('.task-image-fallback');
      setSafeImage(img, fallback, task.imageUrls || task.imageUrl, task.name);

      const runControls = node.querySelector('.run-controls');
      const visibleDots = Math.min(task.runs, 12);
      for (let i = 0; i < visibleDots; i++) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = `run-dot ${i < task.doneRuns ? 'done' : ''}`;
        dot.dataset.runIndex = String(i);
        dot.title = i < task.doneRuns ? (state.lang === 'en' ? 'Mark this run as pending' : 'Marcar esta tentativa como pendente') : (state.lang === 'en' ? 'Mark this run as complete' : 'Marcar esta tentativa como concluída');
        dot.setAttribute('aria-label', dot.title);
        runControls.appendChild(dot);
      }
      if (task.runs > 12) {
        const count = document.createElement('span');
        count.className = 'run-count';
        count.textContent = `${task.doneRuns}/${task.runs} ${state.lang === 'en' ? 'done' : 'concluídas'}`;
        runControls.appendChild(count);
      }
      el.taskList.appendChild(node);
    });
  }

  function handleTaskListClick(event) {
    const card = event.target.closest('.task-card');
    if (!card) return;
    const task = state.tasks[activeDay].find(item => item.id === card.dataset.taskId);
    if (!task) return;

    const dot = event.target.closest('.run-dot');
    if (dot) {
      const index = Number(dot.dataset.runIndex);
      task.doneRuns = index < task.doneRuns ? index : index + 1;
      saveState();
      renderAll();
      return;
    }

    if (event.target.closest('.delete-task')) {
      state.tasks[activeDay] = state.tasks[activeDay].filter(item => item.id !== task.id);
      saveState();
      renderAll();
      toast(state.lang === 'en' ? 'Task removed' : 'Tarefa removida');
      return;
    }

    if (event.target.closest('.duplicate-task')) {
      state.tasks[activeDay].push({ ...task, id: uid(), doneRuns: 0 });
      saveState();
      renderAll();
      toast(state.lang === 'en' ? 'Task duplicated' : 'Tarefa duplicada');
      return;
    }

    if (event.target.closest('.move-task')) {
      const nextDay = prompt(`Mover para qual dia?\n${DAYS.map(dayLabel).join(', ')}`, dayLabel(activeDay));
      if (!nextDay) return;
      const normalized = normalizeDayInput(nextDay);
      if (!normalized || normalized === activeDay) {
        if (!normalized) toast(state.lang === 'en' ? 'Day not recognized' : 'Dia não reconhecido');
        return;
      }
      state.tasks[activeDay] = state.tasks[activeDay].filter(item => item.id !== task.id);
      state.tasks[normalized].push(task);
      saveState();
      renderAll();
      toast(state.lang === 'en' ? `Moved to ${dayLabel(normalized)}` : `Movido para ${dayLabel(normalized)}`);
    }
  }

  function renderSummary() {
    const total = DAYS.reduce((sum, day) => sum + totalForDay(day), 0);
    const totalRuns = DAYS.reduce((sum, day) => sum + state.tasks[day].reduce((a, t) => a + t.runs, 0), 0);
    const doneRuns = DAYS.reduce((sum, day) => sum + state.tasks[day].reduce((a, t) => a + (t.doneRuns || 0), 0), 0);
    const dayTotal = totalForDay(activeDay);
    const percent = Math.min(100, (dayTotal / state.resinCap) * 100 || 0);

    el.weeklyTotal.textContent = formatNumber(total);
    el.weeklyDone.textContent = `${totalRuns ? Math.round((doneRuns / totalRuns) * 100) : 0}%`;
    el.dayBudgetText.textContent = `${dayTotal} / ${state.resinCap} ${tr('resin')}${dayTotal > state.resinCap ? ` · +${dayTotal - state.resinCap} ${tr('above')}` : ''}`;
    if (el.dayBudgetBar) {
      el.dayBudgetBar.style.width = `${percent}%`;
      el.dayBudgetBar.classList.toggle('over', dayTotal > state.resinCap);
    }
  }

  function renderWeekBars() {
    const max = Math.max(state.resinCap, ...DAYS.map(totalForDay));
    el.weekBars.innerHTML = DAYS.map(day => {
      const total = totalForDay(day);
      const height = Math.max(total ? 4 : 0, (total / max) * 100);
      return `
        <div class="week-bar-card">
          <header><span>${dayShort(day)}</span><strong>${total}</strong></header>
          <div class="vertical-bar"><span style="height:${height}%"></span></div>
          <small>${state.tasks[day].length} ${state.tasks[day].length === 1 ? tr('plannedTask') : tr('plannedTasks')}</small>
        </div>`;
    }).join('');
  }

  function renderLibraryTabs() {
    el.libraryTabs.innerHTML = LIBRARY_TYPES.map(type => `
      <button class="library-tab ${type.id === activeLibraryType ? 'active' : ''}" type="button" data-library-type="${type.id}" role="tab">${escapeHtml(libraryLabel(type))}</button>
    `).join('');
    const meta = LIBRARY_TYPES.find(type => type.id === activeLibraryType);
    el.librarySearch.placeholder = activeLibraryType === 'domains' ? `${tr('domainSearchHint')}…` : `${tr('search')} ${String(libraryLabel(meta) || tr('items')).toLowerCase()}…`;
    const showDomainFilters = activeLibraryType === 'domains';
    el.domainKindFilters.hidden = !showDomainFilters;
    el.domainKindFilters.style.display = showDomainFilters ? 'flex' : 'none';
    if (showDomainFilters) renderDomainKindFilters();
  }

  function renderDomainKindFilters() {
    const labels = state.lang === 'en'
      ? { all:'All', talent:'Talents', weapon:'Weapons' }
      : { all:'Todos', talent:'Talentos', weapon:'Armas' };
    el.domainKindFilters.innerHTML = ['all','talent','weapon'].map(kind => `<button type="button" class="domain-kind-filter ${activeDomainKind===kind?'active':''}" data-domain-kind="${kind}">${labels[kind]}</button>`).join('');
  }

  function setApiStatus() { /* status técnico mantido apenas internamente; sem UI */ }

  function seedFallbackLibraries() {
    LIBRARY_TYPES.forEach(({ id }) => {
      if (!libraryCache.has(id)) libraryCache.set(id, fallbackEntries(id));
    });
  }

  function queryFolder(folder, language) {
    const query = window.GenshinDb?.[folder];
    if (typeof query !== 'function') return [];
    const options = { matchCategories:true, verboseCategories:true, queryLanguages:[language], resultLanguage:language };
    const result = query('names', options);
    const records = Array.isArray(result) ? result : (result ? [result] : []);
    return records.map(record => typeof record === 'string' ? query(record, options) : record).filter(Boolean);
  }

  function releaseEntries(type) {
    const meta = LIBRARY_TYPES.find(item => item.id === type);
    return (RELEASE_71[type] || []).map(record => {
      const entity = normalizeDbEntity(type, { ...record, version:'7.1' }, meta);
      entity.pendingFarmData = true;
      entity.subtitle += state.lang === 'en' ? ' · Farming data pending' : ' · Dados de farm pendentes';
      return entity;
    });
  }

  function mergeReleaseEntries(type, items) {
    const names = new Set(items.map(item => slugify(item.raw?.nameEnglish || item.name)));
    return [...items, ...releaseEntries(type).filter(item => !names.has(slugify(item.name)))];
  }

  async function loadLibrary(type, force = false) {
    const meta = LIBRARY_TYPES.find(item => item.id === type);
    if (!meta) return;

    if (type === 'misc') {
      libraryCache.set('misc', miscEntries());
      if (activeLibraryType === 'misc') renderLibraryGrid('misc');
      el.libraryHint.textContent = tr('miscHint');
      return;
    }

    if (!libraryCache.has(type)) libraryCache.set(type, fallbackEntries(type));
    if (activeLibraryType === type) renderLibraryGrid(type);

    const cached = libraryCache.get(type);
    if (!force && cached?._liveLoaded && cached?._lang === state.lang) return;
    // Sincroniza os dados silenciosamente; a biblioteca permanece utilizável durante a atualização.

    try {
      await ensureGenshinDbFolder(meta.folder, force);
      const db = window.GenshinDb;
      if (!db || typeof db[meta.folder] !== 'function') throw new Error(`genshin-db folder unavailable: ${meta.folder}`);

      const dataLanguage = folderLanguages.get(`${state.lang}:${meta.folder}`) || (state.lang === 'en' ? 'English' : 'Portuguese');
      let rawItems = queryFolder(meta.folder, dataLanguage);
      // Translations sometimes lag behind the English catalog. Merge by game ID,
      // keeping localized records where both languages contain the same item.
      if (RELEASE_71[type] && dataLanguage !== 'English') {
        try {
          await loadExternalScript(`${DB_CDN}/data/scripts/english-${meta.folder}.js`, `genshindb-english-${meta.folder}`, force);
          const english = queryFolder(meta.folder, 'English');
          const byId = new Map(english.filter(item => item.id != null).map(item => [String(item.id), item]));
          rawItems = rawItems.map(item => ({ ...item, nameEnglish:byId.get(String(item.id))?.name || item.name }));
          const ids = new Set(rawItems.map(item => String(item.id ?? slugify(item.name))));
          rawItems.push(...english.filter(item => !ids.has(String(item.id ?? slugify(item.name)))));
        } catch (error) { console.warn('English catalog supplement unavailable', error); }
      }

      if (type === 'domains') rawItems = groupDomainChallenges(rawItems).filter(isResinMaterialDomain);
      if (type === 'boss') {
        await ensureGenshinDbFolder('talents', force);
        const weeklyDropIds = getWeeklyTalentDropIds(db, dataLanguage);
        rawItems = rawItems.filter(item => isWeeklyBoss(item, weeklyDropIds));
      }

      const items = mergeReleaseEntries(type, rawItems.map(item => normalizeDbEntity(type, item, meta)).filter(item => item?.name)).sort((a,b) => a.name.localeCompare(b.name));
      if (type === 'domains') {
        await hydrateDomainDropIcons(items, force);
        await hydrateDomainRelations(items, force);
      }
      if (type === 'weapons') await hydrateWeaponDomainLinks(items, force);
      if (type === 'boss') await hydrateWeeklyBossVisuals(items, force);
      if (!items.length) throw new Error(`No ${type} returned by current database`);
      Object.defineProperty(items, '_liveLoaded', { value:true, enumerable:false });
      Object.defineProperty(items, '_lang', { value:state.lang, enumerable:false });
      libraryCache.set(type, items);
      refreshSavedTaskImages(type, items);
      if (activeLibraryType === type) renderLibraryGrid(type);
      setApiStatus('online', tr('currentData'));
      if (activeLibraryType === type) el.libraryHint.textContent = `${items.length} ${tr('items')} · ${tr('clickPlan')}`;
    } catch (error) {
      console.warn('Current Genshin database load failed:', type, error);
      if (!libraryCache.has(type) || !libraryCache.get(type).length) libraryCache.set(type, fallbackEntries(type));
      if (activeLibraryType === type) {
        renderLibraryGrid(type);
        el.libraryHint.textContent = state.lang === 'en' ? 'Could not reach the current database · local data is still available' : 'Não foi possível acessar o banco atual · os dados locais continuam disponíveis';
      }
      setApiStatus('offline', tr('emergency'));
    }
  }

  async function ensureGenshinDbFolder(folder, force = false) {
    await loadExternalScript(`${DB_CDN}/genshindb-nodata.js`, 'genshindb-core');
    if (!window.GenshinDb) throw new Error('genshin-db core did not initialize');

    const preferred = state.lang === 'en' ? 'English' : 'Portuguese';
    const preferredKey = `${preferred.toLowerCase()}-${folder}`;
    try {
      if (force || !loadedDataScripts.has(preferredKey)) {
        await loadExternalScript(`${DB_CDN}/data/scripts/${preferred.toLowerCase()}-${folder}.js`, `genshindb-${preferredKey}`, force);
        loadedDataScripts.add(preferredKey);
      }
      folderLanguages.set(`${state.lang}:${folder}`, preferred);
    } catch (error) {
      if (preferred === 'English') throw error;
      const fallbackKey = `english-${folder}`;
      if (force || !loadedDataScripts.has(fallbackKey)) {
        await loadExternalScript(`${DB_CDN}/data/scripts/english-${folder}.js`, `genshindb-${fallbackKey}`, force);
        loadedDataScripts.add(fallbackKey);
      }
      folderLanguages.set(`${state.lang}:${folder}`, 'English');
    }
  }

  function loadExternalScript(src, key, force = false) {
    if (!force && key === 'genshindb-core' && window.GenshinDb) return Promise.resolve();
    if (scriptPromises.has(key)) return scriptPromises.get(key);

    const promise = new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[data-genshin-script="${key}"]`);
      if (existing && force) existing.remove();
      else if (existing?.dataset.loaded === 'true') return resolve();

      const script = document.createElement('script');
      script.src = `${src}${force ? `${src.includes('?') ? '&' : '?'}t=${Date.now()}` : ''}`;
      script.async = true;
      script.dataset.genshinScript = key;
      const timer = setTimeout(() => { script.remove(); reject(new Error(`Timed out loading ${key}`)); }, 12000);
      script.onload = () => { clearTimeout(timer); script.dataset.loaded='true'; resolve(); };
      script.onerror = () => { clearTimeout(timer); script.remove(); reject(new Error(`Failed to load ${key}`)); };
      document.head.appendChild(script);
    }).finally(() => scriptPromises.delete(key));
    scriptPromises.set(key, promise);
    return promise;
  }

  function groupDomainChallenges(items) {
    const map = new Map();
    for (const item of items) {
      const baseName = String(item.name || '')
        .replace(/\s+(?:I|II|III|IV|V|VI)$/i, '')
        .trim();
      const key = `${baseName}|${item.entranceName || item.domainentrance || ''}`;
      const current = map.get(key);
      if (!current || Number(item.recommendedLevel || item.recommendedlevel || 0) >= Number(current.recommendedLevel || current.recommendedlevel || 0)) {
        const mergedDays = [...new Set([...(current?.daysOfWeek || current?.daysofweek || []), ...(item.daysOfWeek || item.daysofweek || [])])];
        map.set(key, { ...item, name: baseName || item.name, daysOfWeek: mergedDays });
      } else {
        current.daysOfWeek = [...new Set([...(current.daysOfWeek || []), ...(item.daysOfWeek || item.daysofweek || [])])];
      }
    }
    return [...map.values()];
  }

  function isResinMaterialDomain(item) {
    const type = String(item.domainType || item.domaintype || '').toUpperCase();
    return type.includes('WEAPON_PROMOTE') || type.includes('AVATAR_PROUD');
  }

  function collectMaterialIds(value, out = new Set()) {
    if (!value) return out;
    if (Array.isArray(value)) { value.forEach(v => collectMaterialIds(v, out)); return out; }
    if (typeof value === 'object') {
      if (value.id !== undefined && value.id !== null) out.add(String(value.id));
      Object.values(value).forEach(v => collectMaterialIds(v, out));
    }
    return out;
  }

  function domainRewardIds(entity) {
    const raw = entity?.raw || entity || {};
    return collectMaterialIds(raw.rewardPreview || raw.rewardpreview || raw.rewards || raw.reward || []);
  }

  function domainRewardEntries(entity) {
    const raw = entity?.raw || entity || {};
    const rewards = raw.rewardPreview || raw.rewardpreview || raw.rewards || raw.reward || [];
    const out = [];
    const visit = value => {
      if (!value) return;
      if (Array.isArray(value)) return value.forEach(visit);
      if (typeof value !== 'object') return;
      if (value.id !== undefined || value.name) out.push(value);
      else Object.values(value).forEach(visit);
    };
    visit(rewards);
    return out;
  }

  function materialLooksLikeDomainDrop(material, kind) {
    if (!material) return false;
    const text = `${material.name || ''} ${material.typeText || ''} ${material.materialtype || ''} ${material.type || ''}`.toLowerCase();
    if (/mora|adventure exp|companionship|amizade|enhancement ore|minério de aprimoramento|character exp|exp do personagem/.test(text)) return false;
    if (kind === 'talent') return /talent|talento|teachings|ensinamentos|guide|guia|philosoph|filosof/.test(text) || Number(material.rarity || 0) >= 2;
    if (kind === 'weapon') return /weapon|arma|ascension|ascensão|decarabian|boreal|dandelion|guyun|mist veiled|aerosiderite|narukami|mask|coral|talisman|echo|oasis|scorching|sacred dew|night-wind|blazing|delirious|artful|long night|far-north|mistshroud/.test(text) || Number(material.rarity || 0) >= 2;
    return true;
  }

  async function hydrateDomainDropIcons(items, force = false) {
    if (!items?.length) return;
    try {
      await ensureGenshinDbFolder('materials', force);
      const db = window.GenshinDb;
      const lang = folderLanguages.get(`${state.lang}:materials`) || (state.lang === 'en' ? 'English' : 'Portuguese');
      const opts = { matchCategories:true, verboseCategories:true, queryLanguages:[lang], resultLanguage:lang };
      let all = db.materials?.('names', opts) || [];
      if (!Array.isArray(all)) all = all ? [all] : [];
      if (all.length && typeof all[0] === 'string') all = all.map(name => db.materials(name, { queryLanguages:[lang], resultLanguage:lang })).filter(Boolean);
      const byId = new Map(all.map(mat => [String(mat.id), mat]));
      const byName = new Map(all.map(mat => [String(mat.name || '').toLowerCase(), mat]));

      for (const domain of items) {
        const rewards = domainRewardEntries(domain);
        const kind = domain.domainKind || (String(domain.raw?.domainType || '').toUpperCase().includes('WEAPON_PROMOTE') ? 'weapon' : 'talent');
        let mats = rewards.map(reward => byId.get(String(reward.id)) || byName.get(String(reward.name || '').toLowerCase())).filter(Boolean);
        mats = mats.filter(mat => materialLooksLikeDomainDrop(mat, kind));
        const unique = [];
        const seen = new Set();
        for (const mat of mats.sort((a,b)=>Number(b.rarity||0)-Number(a.rarity||0))) {
          const family = String(mat.name || mat.id).replace(/^(Teachings|Guide|Philosophies|Ensinamentos|Guia|Filosofias) (of|de|da|do) /i,'').toLowerCase();
          if (seen.has(family)) continue;
          seen.add(family);
          unique.push(mat);
        }
        const main = unique[0] || mats[0];
        domain.dropItems = unique.slice(0,3).map(mat => ({ id:String(mat.id || ''), name:mat.name || '', rarity:Number(mat.rarity||0), imageUrls:resolveImageUrls('materials', mat) }));
        if (main) {
          const urls = resolveImageUrls('materials', main);
          if (urls.length) { domain.imageUrls = urls; domain.imageUrl = urls[0]; }
          domain.primaryDropName = main.name || '';
          domain.searchAliases = `${domain.searchAliases || ''} ${main.name || ''}`.trim();
        }
      }
    } catch (error) {
      console.warn('Could not hydrate domain drop icons', error);
    }
  }

  async function hydrateWeaponDomainLinks(items, force = false) {
    if (!items?.length) return;
    try {
      await ensureGenshinDbFolder('domains', force);
      const db = window.GenshinDb;
      const lang = folderLanguages.get(`${state.lang}:domains`) || (state.lang === 'en' ? 'English' : 'Portuguese');
      const opts = { matchCategories:true, verboseCategories:true, queryLanguages:[lang], resultLanguage:lang };
      let rawDomains = db.domains?.('names', opts) || [];
      if (!Array.isArray(rawDomains)) rawDomains = rawDomains ? [rawDomains] : [];
      if (rawDomains.length && typeof rawDomains[0] === 'string') rawDomains = rawDomains.map(name => db.domains(name, { queryLanguages:[lang], resultLanguage:lang })).filter(Boolean);
      const domains = groupDomainChallenges(rawDomains).filter(isResinMaterialDomain).filter(raw => String(raw.domainType || raw.domaintype || '').toUpperCase().includes('WEAPON_PROMOTE'));
      const info = domains.map(raw => ({ raw, ids:domainRewardIds(raw), name:domainDisplayName('domains', raw.name || raw.fullname || ''), days:normalizeAvailableDays(raw.daysOfWeek || raw.daysofweek || []) }));
      for (const weapon of items) {
        const ids = collectMaterialIds(weapon.raw?.costs || weapon.raw?.ascensionCosts || weapon.raw?.ascensioncosts || {});
        const match = info.find(domain => intersectsSet(ids, domain.ids));
        if (!match) continue;
        weapon.relatedDomainName = match.name;
        weapon.daysOfWeek = match.days;
        weapon.searchAliases = `${weapon.searchAliases || ''} ${match.name}`.trim();
        const dayText = match.days.length ? match.days.map(dayShort).join('/') : '';
        if (dayText && !String(weapon.subtitle || '').includes(dayText)) weapon.subtitle = `${weapon.subtitle}${weapon.subtitle ? ' · ' : ''}${dayText}`;
      }
    } catch (error) {
      console.warn('Could not connect weapons to farming domains', error);
    }
  }

  function inferredBossAssetNames(raw) {
    const ids = new Set();
    const add = value => {
      if (value === undefined || value === null) return;
      const text = String(value);
      if (/^\d{4,}$/.test(text)) ids.add(text);
    };
    ['id','monsterId','monsterid','enemyId','enemyid','monsterID','enemyID'].forEach(key => add(raw?.[key]));
    const out = [];
    for (const id of ids) {
      out.push(`UI_MonsterIcon_${id}`, `UI_MonsterIcon_${id}_01`, `UI_MonsterIcon_${id}_1`);
    }
    return out;
  }

  async function hydrateWeeklyBossVisuals(items, force = false) {
    if (!items?.length) return;
    try {
      await ensureGenshinDbFolder('materials', force);
      const db = window.GenshinDb;
      const lang = folderLanguages.get(`${state.lang}:materials`) || (state.lang === 'en' ? 'English' : 'Portuguese');
      const opts = { matchCategories:true, verboseCategories:true, queryLanguages:[lang], resultLanguage:lang };
      let mats = db.materials?.('names', opts) || [];
      if (!Array.isArray(mats)) mats = mats ? [mats] : [];
      if (mats.length && typeof mats[0] === 'string') mats = mats.map(name => db.materials(name, { queryLanguages:[lang], resultLanguage:lang })).filter(Boolean);
      const byId = new Map(mats.map(mat => [String(mat.id), mat]));
      for (const boss of items) {
        const inferred = inferredBossAssetNames(boss.raw).flatMap(urlsForAssetFilename);
        const rewardMats = domainRewardEntries(boss).map(reward => byId.get(String(reward.id))).filter(Boolean).filter(mat => Number(mat.rarity || 0) >= 5);
        const rewardUrls = rewardMats.flatMap(mat => resolveImageUrls('materials', mat));
        const existing = (boss.imageUrls || []).filter(url => !String(url).startsWith('data:image/svg+xml'));
        const candidates = [...new Set([...existing, ...inferred, ...rewardUrls])];
        if (candidates.length) { boss.imageUrls = candidates; boss.imageUrl = candidates[0]; }
      }
    } catch (error) {
      console.warn('Could not improve weekly boss images', error);
    }
  }

  function intersectsSet(a, b) {
    for (const value of a) if (b.has(value)) return true;
    return false;
  }

  async function hydrateDomainRelations(items, force = false) {
    if (!items?.length) return;
    try {
      await Promise.all([ensureGenshinDbFolder('characters', force), ensureGenshinDbFolder('weapons', force), ensureGenshinDbFolder('talents', force)]);
      const db = window.GenshinDb;
      const preferred = state.lang === 'en' ? 'English' : 'Portuguese';
      const opts = { matchCategories:true, verboseCategories:true, queryLanguages:[preferred], resultLanguage:preferred };
      let chars = db.characters?.('names', opts) || [];
      let weapons = db.weapons?.('names', opts) || [];
      if (!Array.isArray(chars)) chars = chars ? [chars] : [];
      if (!Array.isArray(weapons)) weapons = weapons ? [weapons] : [];

      const domainInfo = items.map(domain => ({
        domain,
        rewardIds: domainRewardIds(domain),
        weapon: String(domain.raw?.domainType || domain.raw?.domaintype || '').toUpperCase().includes('WEAPON_PROMOTE'),
        characters: new Set(),
        weapons: new Set(),
      }));

      for (const character of chars) {
        let talent;
        try { talent = db.talents?.(character.name, { queryLanguages:[preferred], resultLanguage:preferred }); } catch {}
        const ids = collectMaterialIds(talent?.costs || {});
        if (!ids.size) continue;
        for (const info of domainInfo) if (!info.weapon && intersectsSet(ids, info.rewardIds)) info.characters.add(character.name);
      }

      for (const weapon of weapons) {
        const ids = collectMaterialIds(weapon.costs || weapon.ascensionCosts || weapon.ascensioncosts || {});
        if (!ids.size) continue;
        for (const info of domainInfo) if (info.weapon && intersectsSet(ids, info.rewardIds)) info.weapons.add(weapon.name);
      }

      for (const info of domainInfo) {
        info.domain.relatedCharacters = [...info.characters].sort((a,b)=>a.localeCompare(b));
        info.domain.relatedWeapons = [...info.weapons].sort((a,b)=>a.localeCompare(b));
        info.domain.searchAliases = `${info.domain.searchAliases || ''} ${[...info.domain.relatedCharacters, ...info.domain.relatedWeapons].join(' ')}`.trim();
      }
      const cachedWeapons = libraryCache.get('weapons');
      if (Array.isArray(cachedWeapons) && cachedWeapons.length) {
        for (const weapon of cachedWeapons) {
          const match = domainInfo.find(info => info.weapon && info.domain.relatedWeapons?.some(name => String(name).toLowerCase() === String(weapon.name).toLowerCase()));
          if (!match) continue;
          weapon.relatedDomainName = match.domain.name;
          weapon.daysOfWeek = [...(match.domain.daysOfWeek || [])];
        }
      }
    } catch (error) {
      console.warn('Could not build domain relations', error);
    }
  }

  async function findRelatedDomain(entity, mode = '') {
    if (!entity) return null;
    await loadLibrary('domains');
    const domains = libraryCache.get('domains') || [];
    const name = String(entity.name || '').toLocaleLowerCase();
    if (entity.entityType === 'characters' && mode === 'talent') {
      return domains.find(domain => (domain.relatedCharacters || []).some(n => String(n).toLocaleLowerCase() === name)) || null;
    }
    if (entity.entityType === 'weapons') {
      return domains.find(domain => (domain.relatedWeapons || []).some(n => String(n).toLocaleLowerCase() === name)) || null;
    }
    return null;
  }

  function getWeeklyTalentDropIds(db, dataLanguage) {
    const opts = { matchCategories:true, verboseCategories:true, queryLanguages:[dataLanguage], resultLanguage:dataLanguage };
    let talents = db.talents?.('names', opts) || [];
    if (!Array.isArray(talents)) talents = talents ? [talents] : [];
    if (talents.length && typeof talents[0] === 'string') talents = talents.map(name => db.talents(name, opts)).filter(Boolean);
    const early = new Set();
    const late = new Set();
    for (const talent of talents) {
      const costs = talent?.costs || {};
      for (const lvl of ['lvl2','lvl3','lvl4','lvl5','lvl6']) for (const item of (costs[lvl] || [])) early.add(String(item.id));
      for (const lvl of ['lvl7','lvl8','lvl9','lvl10']) for (const item of (costs[lvl] || [])) late.add(String(item.id));
    }
    return new Set([...late].filter(id => !early.has(id)));
  }

  function isWeeklyBoss(item, weeklyDropIds) {
    const type = String(item.enemyType || item.type || item.monsterType || '').toUpperCase();
    if (!type.includes('BOSS') && String(item.categoryType || '').toUpperCase() !== 'CODEX_SUBTYPE_BOSS') return false;
    return (item.rewardPreview || item.rewardpreview || []).some(reward => weeklyDropIds.has(String(reward.id)));
  }

  function normalizeDbEntity(type, raw, meta) {
    const name = domainDisplayName(type, raw.name || raw.fullname || raw.id || 'Unknown');
    const imageUrls = resolveImageUrls(type, raw);
    const id = String(raw.id ?? slugify(name));
    const days = normalizeAvailableDays(raw.daysOfWeek || raw.daysofweek || []);

    let subtitle = librarySingular(meta);
    if (type === 'characters') {
      subtitle = [raw.elementText || raw.element, raw.weaponText || raw.weapontype, raw.rarity ? `${raw.rarity}★` : '', raw.region].filter(Boolean).join(' · ');
    } else if (type === 'weapons') {
      subtitle = [raw.weaponText || raw.weapontype, raw.rarity ? `${raw.rarity}★` : '', raw.weaponMaterialType || raw.weaponmaterialtype].filter(Boolean).join(' · ');
    } else if (type === 'artifacts') {
      const rarity = raw.rarityList || raw.rarity;
      subtitle = `${Array.isArray(rarity) ? rarity.join('/') : rarity || (state.lang === 'en' ? 'Artifact' : 'Artefato')}★ · ${state.lang === 'en' ? 'set' : 'conjunto'}`;
    } else if (type === 'domains') {
      const kind = String(raw.domainType || raw.domaintype || '').includes('WEAPON_PROMOTE') ? (state.lang === 'en' ? 'Weapon materials' : 'Materiais de arma') : (state.lang === 'en' ? 'Talent materials' : 'Materiais de talento');
      subtitle = [kind, raw.entranceName || raw.domainentrance, raw.regionName || raw.region, days.length ? days.map(dayShort).join('/') : (state.lang === 'en' ? 'Every day' : 'Todos os dias')].filter(Boolean).join(' · ');
    } else if (type === 'materials') {
      subtitle = [raw.typeText || raw.materialtype, raw.rarity ? `${raw.rarity}★` : '', days.length ? days.map(dayShort).join('/') : ''].filter(Boolean).join(' · ');
    } else if (type === 'boss') {
      subtitle = [state.lang === 'en' ? 'Weekly Boss' : 'Chefe semanal', raw.categoryText || raw.category].filter(Boolean).join(' · ');
    }

    const safeImageUrls = imageUrls.length ? imageUrls : [makeFallbackIcon(name, type)];
    return {
      id,
      name,
      entityType: type,
      typeLabel: librarySingular(meta),
      subtitle: subtitle || librarySingular(meta),
      imageUrl: safeImageUrls[0],
      imageUrls: safeImageUrls,
      daysOfWeek: days,
      domainKind: type === 'domains' ? (String(raw.domainType || raw.domaintype || '').toUpperCase().includes('WEAPON_PROMOTE') ? 'weapon' : 'talent') : '',
      raw,
    };
  }

  function domainDisplayName(type, name) {
    if (type !== 'domains') return String(name);
    return String(name)
      .replace(/^Domain of (?:Mastery|Forgery|Blessing):\s*/i, '')
      .replace(/\s+(?:I|II|III|IV|V|VI)$/i, '')
      .trim();
  }

  function cleanAssetName(value) {
    return String(value || '').split('/').pop().replace(/\.(png|webp|jpg|jpeg)$/i, '');
  }

  function urlsForAssetFilename(filename) {
    if (!filename) return [];
    const clean = cleanAssetName(filename);
    return ASSET_CDNS.map(buildUrl => buildUrl(clean));
  }

  function resolveImageUrls(type, raw) {
    const images = raw?.images || {};
    const values = [];
    const filenames = [];
    const addUrl = value => {
      if (!value || typeof value !== 'string') return;
      let url = value.trim();
      if (url.startsWith('http://')) url = 'https://' + url.slice(7);
      if (/^https:\/\//i.test(url) && !values.includes(url)) values.push(url);
    };
    const addFilename = value => {
      if (!value || typeof value !== 'string') return;
      const filename = cleanAssetName(value);
      if (/^UI_/i.test(filename) && !filenames.includes(filename)) filenames.push(filename);
    };
    const scan = value => {
      if (!value) return;
      if (typeof value === 'string') { /^https?:\/\//i.test(value) ? addUrl(value) : addFilename(value); return; }
      if (Array.isArray(value)) { value.forEach(scan); return; }
      if (typeof value === 'object') Object.values(value).forEach(scan);
    };

    // Prefer the compact in-game icon for every library type. In particular, characters
    // must use UI_AvatarIcon / filename_icon before splash or full portrait artwork.
    const preferred = type === 'characters'
      ? [images.filename_icon, images.mihoyo_icon, images['hoyolab-avatar'], images.hoyowiki_icon, images.filename_sideIcon, images.mihoyo_sideIcon]
      : type === 'weapons'
        ? [images.filename_icon, images.mihoyo_icon, images.filename_awakenIcon]
        : type === 'artifacts'
          ? [images.mihoyo_flower, images.filename_flower, images.mihoyo_circlet, images.filename_circlet]
          : type === 'domains'
            ? [images.filename_image]
            : type === 'boss'
              ? [images.filename_icon, images.filename_investigationIcon, images.filename_sideIcon, images.filename_monsterIcon, images.filename_image, images.mihoyo_icon, images.hoyowiki_icon]
              : type === 'materials'
                ? [images.filename_icon]
                : [];
    preferred.forEach(scan);
    scan(images);
    scan(raw?.icon);
    scan(raw?.image);
    scan(raw?.portrait);
    if (type === 'boss') scan(raw);

    for (const filename of filenames) {
      for (const buildUrl of ASSET_CDNS) {
        const url = buildUrl(filename);
        if (!values.includes(url)) values.push(url);
      }
    }
    return values;
  }

  function renderLibraryGrid(type) {
    const query = el.librarySearch.value.trim().toLowerCase();
    let source = libraryCache.get(type) || [];
    if (type === 'domains' && activeDomainKind !== 'all') source = source.filter(item => item.domainKind === activeDomainKind);
    const filtered = query ? source.filter(item => `${item.name} ${item.subtitle || ''} ${item.id} ${item.searchAliases || ''}`.toLowerCase().includes(query)) : source;
    const display = filtered.slice(0, 240);

    el.libraryCount.textContent = `${filtered.length} ${filtered.length === 1 ? tr('item') : tr('items')}${filtered.length > display.length ? ` · ${state.lang === 'en' ? 'showing' : 'mostrando'} ${display.length}` : ''}`;
    el.libraryHint.textContent = type === 'misc' ? tr('miscHint') : tr('clickPlan');
    el.libraryGrid.innerHTML = '';

    display.forEach(item => {
      const relations = [...(item.relatedCharacters || []), ...(item.relatedWeapons || [])];
      const matchedRelations = query ? relations.filter(name => String(name).toLowerCase().includes(query)) : [];
      const relationPreview = (matchedRelations.length ? matchedRelations : relations).slice(0,3);
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `entity-card ${type === 'misc' ? 'misc-card' : ''}`;
      card.dataset.id = item.id;
      card.dataset.entityType = type;
      card.innerHTML = `
        <span class="entity-thumb"><span class="thumb-fallback">✦</span><img alt="" loading="eager" decoding="async"></span>
        <strong title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</strong>
        <small title="${escapeHtml(item.subtitle || item.typeLabel)}">${escapeHtml(item.subtitle || item.typeLabel)}</small>
        ${type === 'domains' && item.primaryDropName ? `<span class="domain-drop-line"><span class="domain-drop-icon"><span class="thumb-fallback">✦</span><img alt=""></span><span class="domain-drop-name" title="${escapeHtml(item.primaryDropName)}">${escapeHtml(item.primaryDropName)}</span></span>` : ''}
        ${type === 'domains' && query && item.searchAliases ? `<span class="domain-relation-hint">${escapeHtml(tr('usedBy'))}: ${escapeHtml(relationPreview.join(', '))}${relations.length>relationPreview.length?'…':''}</span>` : ''}
        ${type === 'weapons' && (item.relatedDomainName || item.daysOfWeek?.length) ? `<span class="weapon-farm-info">${(item.daysOfWeek||[]).map(day => `<span class="farm-day-badge">${escapeHtml(dayShort(day))}</span>`).join('')}${item.relatedDomainName ? `<span class="weapon-domain-name">${escapeHtml(item.relatedDomainName)}</span>` : ''}</span>` : ''}
        ${type === 'artifacts' && isStrongboxEligible(item) ? `<span class="method-badge">${escapeHtml(state.lang === 'en' ? 'Strongbox' : 'Strongbox')}</span>` : ''}`;
      const img = card.querySelector('img');
      const fallback = card.querySelector('.thumb-fallback');
      fallback.textContent = item.fallbackGlyph || '✦';
      setSafeImage(img, fallback, item.imageUrls || item.imageUrl, item.name);
      const dropImg = card.querySelector('.domain-drop-icon img');
      if (dropImg) {
        const dropFallback = card.querySelector('.domain-drop-icon .thumb-fallback');
        setSafeImage(dropImg, dropFallback, item.dropItems?.[0]?.imageUrls || item.imageUrls || item.imageUrl, item.primaryDropName || item.name);
      }
      el.libraryGrid.appendChild(card);
    });

    if (!display.length) {
      el.libraryGrid.innerHTML = `<div style="grid-column:1/-1;padding:65px 20px;text-align:center;color:var(--muted);font-size:12px;">${tr('noItems')}</div>`;
    }
  }

  function refreshSavedTaskImages(type, items) {
    const byId = new Map(items.map(item => [String(item.id), item]));
    let changed = false;
    for (const day of DAYS) {
      for (const task of state.tasks[day]) {
        if (task.entityType !== type || !task.entityId) continue;
        const current = byId.get(String(task.entityId));
        if (!current?.imageUrls?.length) continue;
        if (JSON.stringify(task.imageUrls || []) !== JSON.stringify(current.imageUrls)) {
          task.imageUrls = [...current.imageUrls];
          task.imageUrl = current.imageUrl || current.imageUrls[0];
          changed = true;
        }
      }
    }
    if (changed) { saveState(); renderTasks(); }
  }


  function fallbackEntries(type) {
    const pt = {
      characters:['Viajante','Amber','Kaeya','Lisa','Barbara','Xiangling'], weapons:['Espada','Arco','Catalisador','Lança','Espadão'],
      artifacts:['Emblem of Severed Fate','Golden Troupe','Marechaussee Hunter','Deepwood Memories'], boss:['Chefe semanal'], domains:['Domínio de Talentos','Domínio de Armas'],
    };
    const en = {
      characters:['Traveler','Amber','Kaeya','Lisa','Barbara','Xiangling'], weapons:['Sword','Bow','Catalyst','Polearm','Claymore'],
      artifacts:['Emblem of Severed Fate','Golden Troupe','Marechaussee Hunter','Deepwood Memories'], boss:['Weekly Boss'], domains:['Talent Domain','Weapon Domain'],
    };
    if (type === 'misc') return miscEntries();
    const data = state.lang === 'en' ? en : pt;
    const meta = LIBRARY_TYPES.find(item => item.id === type);
    return mergeReleaseEntries(type, (data[type] || []).map(name => ({ id:slugify(name), name, entityType:type, typeLabel:librarySingular(meta), subtitle:librarySingular(meta), imageUrl:makeFallbackIcon(name, type), imageUrls:[makeFallbackIcon(name, type)], raw:type === 'artifacts' ? { rarityList:[5], effect2Pc:'fallback', effect4Pc:'fallback', version:'4.0' } : null })));
  }

  function miscEntries() {
    const meta = LIBRARY_TYPES.find(x=>x.id==='misc');
    return [
      { id:'artifact-route', name:tr('artifactRoute'), entityType:'misc', typeLabel:librarySingular(meta), subtitle:tr('artifactRouteSub'), category:'route', resin:0, taskName:tr('routeArtifactTask'), action:'task', miscType:'artifact-route', imageUrls:[...urlsForAssetFilename('UI_RelicIcon_15001_1'), makeMiscSvg('artifact')] },
      { id:'mora-route', name:tr('moraRoute'), entityType:'misc', typeLabel:librarySingular(meta), subtitle:tr('moraRouteSub'), category:'route', resin:0, taskName:tr('routeMoraTask'), action:'task', miscType:'mora-route', imageUrls:[...urlsForAssetFilename('UI_ItemIcon_202'), makeMiscSvg('mora')] },
      { id:'ore-route', name:tr('oreRoute'), entityType:'misc', typeLabel:librarySingular(meta), subtitle:tr('oreRouteSub'), category:'route', resin:0, taskName:tr('routeOreTask'), action:'task', miscType:'ore-route', imageUrls:[...urlsForAssetFilename('UI_ItemIcon_101003'), makeMiscSvg('ore')] },
      { id:'strongbox', name:tr('strongbox'), entityType:'misc', typeLabel:librarySingular(meta), subtitle:tr('strongboxSub'), category:'strongbox', resin:0, action:'strongbox', miscType:'strongbox', imageUrls:[makeMiscSvg('strongbox')] },
      { id:'custom-task', name:tr('customMisc'), entityType:'misc', typeLabel:librarySingular(meta), subtitle:tr('customMiscSub'), category:'custom', resin:0, action:'custom', miscType:'custom', imageUrls:[makeMiscSvg('custom')] },
    ];
  }

  function openTaskDialog(entity, options = {}) {
    dialogEntity = entity;
    dialogOptions = options || {};
    dialogAllowedDays = [];
    dialogAvailabilityContext = '';
    dialogAvailabilityPromise = Promise.resolve();
    const isCustom = !entity;
    const typeMeta = entity ? LIBRARY_TYPES.find(type => type.id === entity.entityType) : null;
    const category = entity?.category || suggestedCategory(entity?.entityType);
    const resin = Number.isFinite(entity?.resin) ? entity.resin : suggestedResin(category);

    // Library items already know their name/category. Keep those technical fields only
    // for custom tasks so the dialog stays contextual instead of repeating metadata.
    el.taskNameField.hidden = !isCustom;
    el.taskCategoryField.hidden = !isCustom;

    el.dialogType.textContent = isCustom ? tr('customType') : (librarySingular(typeMeta) || entity.typeLabel || (state.lang === 'en' ? 'GAME DATA' : 'DADOS DO JOGO')).toUpperCase();
    el.dialogTitle.textContent = isCustom ? tr('customTitle') : entity.name;
    el.dialogSubtitle.textContent = isCustom ? tr('customSubtitle') : (state.lang === 'en' ? `Add ${entity.name} to your weekly route.` : `Adicionar ${entity.name} à sua rota semanal.`);
    el.taskNameInput.value = isCustom ? '' : (entity.taskName || defaultTaskName(entity));
    [...el.taskDayInput.options].forEach(option => option.textContent = dayLabel(option.value));
    el.taskDayInput.value = activeDay;
    el.taskCategoryInput.value = category;
    el.resinPerRunInput.value = resin;
    el.runsInput.value = 1;
    el.noteInput.value = '';
    el.entityTypeInput.value = entity?.entityType || 'custom';
    el.entityIdInput.value = entity?.id || '';
    el.entityImageInput.value = entity?.imageUrl || '';

    const isArtifact = entity?.entityType === 'artifacts';
    const isCharacter = entity?.entityType === 'characters';
    el.artifactMethodField.hidden = !isArtifact;
    el.characterFarmField.hidden = !isCharacter;
    el.characterMaterialPreview.innerHTML = '';
    document.querySelector('#dialogImageWrap').classList.toggle('character-portrait', isCharacter);
    if (isCharacter) {
      el.characterFarmInput.value = options.characterFarm || 'talent';
      applyCharacterFarmMode();
    }
    if (isArtifact) {
      const eligible = isStrongboxEligible(entity);
      el.artifactMethodInput.innerHTML = `<option value="domain">${escapeHtml(tr('farmDomain'))}</option>${eligible ? `<option value="strongbox">${escapeHtml(tr('strongboxMethod'))}</option>` : ''}`;
      el.artifactMethodInput.value = options.artifactMethod === 'strongbox' && eligible ? 'strongbox' : 'domain';
      el.artifactMethodNote.textContent = eligible ? tr('strongboxAvailable') : tr('strongboxUnavailable');
    }

    updateDialogTotal();
    el.taskDialog.showModal();
    // Start image loading only after the dialog is visible. Some preview environments
    // deprioritize images inside a closed <dialog> and never paint the portrait.
    requestAnimationFrame(() => setSafeImage(el.dialogImage, el.dialogFallback, entity?.imageUrls || entity?.imageUrl || '', entity?.name || tr('customTitle')));
    if (entity?.entityType === 'characters') populateCharacterMaterialPreview(entity);
    if (entity) applyFarmAvailability(entity);
    if (entity?.entityType === 'characters') dialogAvailabilityPromise = applyRelatedDomainAvailability(entity, el.characterFarmInput.value);
    if (entity?.entityType === 'weapons') {
      if (entity.relatedDomainName && entity.daysOfWeek?.length) {
        setDialogAvailability(entity.daysOfWeek, entity.relatedDomainName);
        el.dialogSubtitle.textContent = `${tr('weaponDomain')}: ${entity.relatedDomainName} · ${tr('available')}: ${entity.daysOfWeek.map(dayShort).join(' / ')}`;
      }
      dialogAvailabilityPromise = applyRelatedDomainAvailability(entity, 'weapon');
    }
    if (isArtifact) requestAnimationFrame(applyArtifactMethod);
    setTimeout(() => el.taskNameInput.focus(), 30);
  }

  function resetDayOptionLabels() {
    [...el.taskDayInput.options].forEach(option => option.textContent = dayLabel(option.value));
  }

  function setDialogAvailability(days, context = '') {
    dialogAllowedDays = normalizeAvailableDays(days || []);
    dialogAvailabilityContext = context || '';
    resetDayOptionLabels();
    if (!dialogAllowedDays.length) return;
    [...el.taskDayInput.options].forEach(option => {
      const allowed = dialogAllowedDays.includes(option.value);
      option.textContent = allowed
        ? `★ ${dayLabel(option.value)} — ${String(tr('available')).toLowerCase()}`
        : `⚠ ${dayLabel(option.value)} — ${state.lang === 'en' ? 'unavailable' : 'indisponível'}`;
    });
  }

  function showAvailabilityError(day) {
    const shortDays = dialogAllowedDays.map(dayShort).join(' / ');
    toast(`${tr('unavailableDay')} ${tr('availableOn')}: ${shortDays}${dialogAvailabilityContext ? ` · ${dialogAvailabilityContext}` : ''}`);
  }

  async function applyFarmAvailability(entity) {
    if (entity.pendingFarmData) { el.dialogSubtitle.textContent = pendingFarmMessage(); return; }
    const days = normalizeAvailableDays(entity.daysOfWeek || entity.raw?.daysOfWeek || entity.raw?.daysofweek || []);
    const raw = entity.raw || {};
    const extra = [];

    if (entity.entityType === 'domains') {
      if (raw.entranceName || raw.domainentrance) extra.push(raw.entranceName || raw.domainentrance);
      if (raw.regionName || raw.region) extra.push(raw.regionName || raw.region);
    }

    if (days.length) {
      const shortDays = days.map(dayShort).join(' / ');
      setDialogAvailability(days, entity.name);
      el.dialogSubtitle.textContent = [...extra, `${tr('available')}: ${shortDays}`].filter(Boolean).join(' · ');
      el.noteInput.placeholder = `${entity.name} · ${shortDays}`;
      return;
    }

    if (extra.length) el.dialogSubtitle.textContent = extra.join(' · ');
  }

  async function applyRelatedDomainAvailability(entity, mode = '') {
    if (!entity) return;
    if (entity.pendingFarmData) {
      setDialogAvailability([]);
      el.dialogSubtitle.textContent = pendingFarmMessage();
      return;
    }
    if (entity.entityType === 'characters' && mode !== 'talent') {
      dialogAllowedDays = [];
      dialogAvailabilityContext = '';
      resetDayOptionLabels();
      return;
    }
    if (entity.entityType !== 'characters' && entity.entityType !== 'weapons') return;

    try {
      const domain = await findRelatedDomain(entity, mode);
      if (!domain) {
        dialogAllowedDays = [];
        dialogAvailabilityContext = '';
        resetDayOptionLabels();
        return;
      }
      const days = normalizeAvailableDays(domain.daysOfWeek || []);
      setDialogAvailability(days, domain.name);
      const kind = entity.entityType === 'weapons' ? tr('weaponDomain') : tr('talentDomain');
      const shortDays = days.map(dayShort).join(' / ');
      el.dialogSubtitle.textContent = `${kind}: ${domain.name}${shortDays ? ` · ${tr('available')}: ${shortDays}` : ''}`;
      el.noteInput.placeholder = `${domain.name}${shortDays ? ` · ${shortDays}` : ''}`;
    } catch (error) {
      console.warn('Could not resolve related domain', error);
    }
  }


  function applyCharacterFarmMode() {
    if (!dialogEntity || dialogEntity.entityType !== 'characters') return;
    const mode = el.characterFarmInput.value;
    const name = dialogEntity.name;
    const configs = {
      boss: { category:'boss', resin:40, pt:`Chefe de ascensão — ${name}`, en:`Ascension boss — ${name}` },
      ascension: { category:'character', resin:0, pt:`Materiais para upar — ${name}`, en:`Level-up materials — ${name}` },
      talent: { category:'talent', resin:20, pt:`Talentos — ${name}`, en:`Talents — ${name}` },
      weekly: { category:'weekly', resin:30, pt:`Chefe semanal — ${name}`, en:`Weekly boss — ${name}` },
    };
    const config = configs[mode] || configs.talent;
    el.taskCategoryInput.value = config.category;
    el.resinPerRunInput.value = config.resin;
    el.taskNameInput.value = state.lang === 'en' ? config.en : config.pt;
    updateDialogTotal();
  }

  async function populateCharacterMaterialPreview(entity) {
    if (!entity || entity !== dialogEntity || entity.entityType !== 'characters') return;
    const mode = el.characterFarmInput.value;
    if (entity.pendingFarmData) { el.characterMaterialPreview.textContent = pendingFarmMessage(); return; }
    el.characterMaterialPreview.innerHTML = `<span class="material-preview-loading">${escapeHtml(tr('loading'))}</span>`;
    try {
      await ensureGenshinDbFolder('materials');
      if (mode === 'talent' || mode === 'weekly') await ensureGenshinDbFolder('talents');
      const db = window.GenshinDb;
      const dataLanguage = folderLanguages.get(`${state.lang}:materials`) || (state.lang === 'en' ? 'English' : 'Portuguese');
      const opts = { queryLanguages:[dataLanguage], resultLanguage:dataLanguage };
      let items = [];
      if (mode === 'ascension' || mode === 'boss') {
        items = Object.values(entity.raw?.costs || {}).flat();
      } else if (mode === 'talent' || mode === 'weekly') {
        const talentLanguage = folderLanguages.get(`${state.lang}:talents`) || dataLanguage;
        const talentOpts = { queryLanguages:[talentLanguage], resultLanguage:talentLanguage };
        const talent = db.talents?.(entity.name, talentOpts);
        const levels = mode === 'weekly' ? ['lvl7','lvl8','lvl9','lvl10'] : ['lvl2','lvl3','lvl4','lvl5','lvl6','lvl7','lvl8','lvl9','lvl10'];
        items = levels.flatMap(level => talent?.costs?.[level] || []);
      } else {
        items = [];
      }
      const unique = [];
      const seen = new Set();
      for (const item of items) {
        const key = String(item.id || item.name || '');
        if (!key || seen.has(key)) continue;
        seen.add(key);
        let material = item.name ? db.materials?.(item.name, opts) : null;
        if (!material && item.id) {
          const all = db.materials?.('names', { matchCategories:true, verboseCategories:true, queryLanguages:[dataLanguage], resultLanguage:dataLanguage }) || [];
          material = Array.isArray(all) ? all.find(mat => String(mat.id) === String(item.id)) : null;
        }
        const materialName = String(material?.name || item.name || '').toLowerCase();
        const rarity = Number(material?.rarity || 0);
        if (mode === 'weekly') {
          if (rarity < 5 || /mora|crown|coroa|insight|perspic/.test(materialName)) continue;
        }
        if (mode === 'boss') {
          const count = Number(item.count || item.amount || 0);
          if (/mora|exp|sliver|fragment|chunk|gemstone|lasca|fragmento|pedaço|gema/.test(materialName)) continue;
          if (count > 24 || (rarity && rarity < 4)) continue;
        }
        unique.push({ name:material?.name || item.name || String(item.id || ''), imageUrls:material ? resolveImageUrls('materials', material) : [] });
      }
      if (!unique.length) {
        el.characterMaterialPreview.innerHTML = `<span class="material-preview-loading">${escapeHtml(state.lang === 'en' ? 'Character-specific task' : 'Tarefa específica do personagem')}</span>`;
        return;
      }
      el.characterMaterialPreview.innerHTML = '';
      for (const mat of unique.slice(0,8)) {
        const chip = document.createElement('span');
        chip.className='material-chip';
        chip.innerHTML=`<span class="material-chip-image"><span class="thumb-fallback">✦</span><img alt=""></span><span>${escapeHtml(mat.name)}</span>`;
        setSafeImage(chip.querySelector('img'), chip.querySelector('.thumb-fallback'), mat.imageUrls.length ? mat.imageUrls : [makeFallbackIcon(mat.name,'materials')], mat.name);
        el.characterMaterialPreview.appendChild(chip);
      }
    } catch (error) {
      console.warn('Could not load character material preview', error);
      el.characterMaterialPreview.innerHTML = `<span class="material-preview-loading">${escapeHtml(state.lang === 'en' ? 'Materials will still be tracked with the character.' : 'Os materiais ainda serão registrados junto do personagem.')}</span>`;
    }
  }

  function applyArtifactMethod() {
    if (!dialogEntity || dialogEntity.entityType !== 'artifacts') return;
    const method = el.artifactMethodInput.value;
    if (method === 'strongbox' && isStrongboxEligible(dialogEntity)) {
      el.taskCategoryInput.value = 'strongbox';
      el.resinPerRunInput.value = 0;
      el.taskNameInput.value = state.lang === 'en' ? `Strongbox — ${dialogEntity.name}` : `Strongbox — ${dialogEntity.name}`;
      el.dialogSubtitle.textContent = tr('strongboxMethodSubtitle');
      el.noteInput.placeholder = state.lang === 'en' ? 'e.g. do 10 conversions' : 'ex.: fazer 10 conversões';
    } else {
      el.taskCategoryInput.value = 'artifact';
      el.resinPerRunInput.value = 20;
      el.taskNameInput.value = defaultTaskName(dialogEntity);
      el.dialogSubtitle.textContent = tr('domainMethodSubtitle');
      el.noteInput.placeholder = state.lang === 'en' ? 'e.g. farm until a usable 4-piece set' : 'ex.: farmar até fechar um 4 peças utilizável';
    }
    updateDialogTotal();
  }

  function isStrongboxEligible(entity) {
    if (!entity || entity.entityType !== 'artifacts') return false;
    const raw = entity.raw || {};
    const rarities = Array.isArray(raw.rarityList) ? raw.rarityList.map(Number) : [Number(raw.rarity || 0)];
    if (!rarities.includes(5)) return false;
    const hasSetBonus = Boolean(raw.effect2Pc || raw.effect2pc || raw.effect4Pc || raw.effect4pc);
    if (!hasSetBonus) return false;
    const match = String(raw.version || '').match(/\d+(?:\.\d+)?/);
    if (!match) return false;
    return Number(match[0]) <= CURRENT_STRONGBOX_MAX_VERSION;
  }

  async function openStrongboxDialog() {
    el.strongboxSearch.value = '';
    el.strongboxGrid.innerHTML = `<div class="strongbox-empty">${escapeHtml(tr('loading'))}</div>`;
    el.strongboxDialog.showModal();
    await loadLibrary('artifacts');
    renderStrongboxGrid();
  }

  function renderStrongboxGrid() {
    const query = el.strongboxSearch.value.trim().toLowerCase();
    const artifacts = (libraryCache.get('artifacts') || []).filter(isStrongboxEligible);
    const filtered = query ? artifacts.filter(item => `${item.name} ${item.subtitle || ''}`.toLowerCase().includes(query)) : artifacts;
    el.strongboxGrid.innerHTML = '';
    for (const item of filtered) {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'entity-card';
      card.dataset.id = item.id;
      card.innerHTML = `<span class="entity-thumb"><span class="thumb-fallback">✦</span><img alt="" loading="eager" decoding="async"></span><strong title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</strong><small>${escapeHtml(tr('strongboxMethod'))}</small>`;
      const img = card.querySelector('img');
      const fallback = card.querySelector('.thumb-fallback');
      setSafeImage(img, fallback, item.imageUrls || item.imageUrl, item.name);
      el.strongboxGrid.appendChild(card);
    }
    if (!filtered.length) el.strongboxGrid.innerHTML = `<div class="strongbox-empty">${escapeHtml(tr('noStrongbox'))}</div>`;
  }
  async function addTaskFromDialog() {
    await dialogAvailabilityPromise;
    const day = el.taskDayInput.value;
    if (dialogAllowedDays.length && !dialogAllowedDays.includes(day)) { showAvailabilityError(day); return; }
    const task = {
      id: uid(),
      name: el.taskNameInput.value.trim(),
      day,
      category: el.taskCategoryInput.value,
      resinPerRun: clamp(Number(el.resinPerRunInput.value) || 0, 0, 2000),
      runs: clamp(Number(el.runsInput.value) || 1, 1, 99),
      doneRuns: 0,
      note: el.noteInput.value.trim(),
      entityType: el.entityTypeInput.value || 'custom',
      entityId: el.entityIdInput.value || '',
      acquisitionMethod: dialogEntity?.entityType === 'artifacts' ? el.artifactMethodInput.value : (dialogEntity?.entityType === 'characters' ? el.characterFarmInput.value : (dialogEntity?.miscType || '')),
      imageUrl: el.entityImageInput.value || '',
      imageUrls: dialogEntity?.imageUrls || (el.entityImageInput.value ? [el.entityImageInput.value] : []),
    };
    if (!task.name) return;
    state.tasks[day].push(task);
    activeDay = day;
    saveState();
    el.taskDialog.close();
    renderAll();
    toast(state.lang === 'en' ? `Added to ${dayLabel(day)}` : `Adicionado a ${dayLabel(day)}`);
  }

  function updateDialogTotal() {
    const resin = Number(el.resinPerRunInput.value) || 0;
    const runs = Number(el.runsInput.value) || 0;
    el.dialogTotal.textContent = formatNumber(resin * runs);
  }

  function suggestedCategory(type) {
    switch (type) {
      case 'characters': return 'character';
      case 'weapons': return 'weapon';
      case 'artifacts': return 'artifact';
      case 'boss': return 'weekly';
      case 'domains': return 'domain';
      case 'misc': return 'route';
      default: return 'custom';
    }
  }

  function suggestedResin(category) {
    if (category === 'boss') return 40;
    if (category === 'weekly') return 30;
    if (category === 'route' || category === 'strongbox') return 0;
    return 20;
  }

  function defaultTaskName(entity) {
    switch (entity.entityType) {
      case 'characters': return state.lang === 'en' ? `Farm for ${entity.name}` : `Farmar para ${entity.name}`;
      case 'weapons': return state.lang === 'en' ? `Farm ${entity.name}` : `Farmar ${entity.name}`;
      case 'artifacts': return state.lang === 'en' ? `${entity.name} domain` : `Domínio de ${entity.name}`;
      case 'boss': return entity.name;
      case 'domains': return entity.name;
      case 'misc': return entity.taskName || entity.name;
      default: return entity.name;
    }
  }

  function clearWeek() {
    const count = DAYS.reduce((sum, day) => sum + state.tasks[day].length, 0);
    if (!count) return toast(state.lang === 'en' ? 'The week is already empty' : 'A semana já está vazia');
    if (!confirm(state.lang === 'en' ? `Clear all ${count} planned tasks for the week?` : `Limpar todas as ${count} tarefas planejadas da semana?`)) return;
    DAYS.forEach(day => state.tasks[day] = []);
    saveState();
    renderAll();
    toast(state.lang === 'en' ? 'Week cleared' : 'Semana limpa');
  }

  function buildBackupPayload() {
    return {
      app: 'Resin Route',
      version: 1,
      exportedAt: new Date().toISOString(),
      state,
    };
  }

  async function exportPlanner() {
    const filename = `resin-route-backup-${new Date().toISOString().slice(0,10)}.json`;
    const json = JSON.stringify(buildBackupPayload(), null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });

    // Chrome/Edge can show the native Save As picker when the page is opened normally.
    // Embedded previews may forbid it, so the Blob download below remains the fallback.
    if (window.isSecureContext && typeof window.showSaveFilePicker === 'function') {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: filename,
          types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        el.backupDialog.close();
        toast(state.lang === 'en' ? 'Backup saved' : 'Backup salvo');
        return;
      } catch (error) {
        if (error?.name === 'AbortError') return;
        // SecurityError is common inside embedded previews; continue to Blob fallback.
      }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    el.backupDialog.close();
    toast(state.lang === 'en' ? 'Backup download started' : 'Download do backup iniciado');
  }

  async function copyPlannerBackup() {
    const json = JSON.stringify(buildBackupPayload(), null, 2);
    try {
      await navigator.clipboard.writeText(json);
      el.backupDialog.close();
      toast(state.lang === 'en' ? 'Backup copied to clipboard' : 'Backup copiado para a área de transferência');
    } catch (error) {
      // Clipboard can also be restricted by embedded previews. Use a textarea fallback.
      const area = document.createElement('textarea');
      area.value = json;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand('copy');
      area.remove();
      if (!ok) return toast(state.lang === 'en' ? 'Could not copy the backup' : 'Não foi possível copiar o backup');
      el.backupDialog.close();
      toast(state.lang === 'en' ? 'Backup copied to clipboard' : 'Backup copiado para a área de transferência');
    }
  }

  async function importPlanner(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const incoming = parsed.state || parsed;
      if (!incoming.tasks || typeof incoming.tasks !== 'object') throw new Error('Arquivo de planejamento inválido');
      state.resinCap = Number(incoming.resinCap) || 200;
      DAYS.forEach(day => state.tasks[day] = Array.isArray(incoming.tasks[day]) ? incoming.tasks[day] : []);
      activeDay = DAYS.includes(incoming.activeDay) ? incoming.activeDay : activeDay;
      el.resinCapInput.value = state.resinCap;
      saveState();
      renderAll();
      if (el.backupDialog?.open) el.backupDialog.close();
      toast(state.lang === 'en' ? 'Backup restored' : 'Backup restaurado');
    } catch (error) {
      console.error(error);
      if (el.backupDialog?.open) el.backupDialog.close();
      toast(state.lang === 'en' ? 'Could not restore this backup' : 'Não foi possível restaurar esse backup');
    }
  }

  function totalForDay(day) {
    return state.tasks[day].reduce((sum, task) => sum + (Number(task.resinPerRun) || 0) * (Number(task.runs) || 0), 0);
  }

  function makeFallbackIcon(label, type='item') {
    const initial=(String(label||'?').trim()[0]||'?').toUpperCase();
    const palette={characters:['#6ba6c5','#325a78'],weapons:['#c5a766','#6f5941'],artifacts:['#9d78c4','#57436f'],domains:['#6ca9a0','#365f60'],boss:['#c87973','#704447'],materials:['#6e9ec9','#3b5c7b'],item:['#8aa0b4','#4c6073']}[type]||['#8aa0b4','#4c6073'];
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${palette[0]}"/><stop offset="1" stop-color="${palette[1]}"/></linearGradient></defs><rect width="160" height="160" rx="28" fill="url(#g)"/><circle cx="80" cy="72" r="42" fill="rgba(255,255,255,.12)" stroke="rgba(255,255,255,.28)" stroke-width="2"/><text x="80" y="89" text-anchor="middle" font-family="Georgia,serif" font-size="52" font-weight="700" fill="#fff7df">${escapeHtml(initial)}</text><path d="M36 127h88" stroke="#eed79b" stroke-width="3" stroke-linecap="round" opacity=".8"/></svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  function makeMiscSvg(kind) {
    let art='';
    if(kind==='artifact') art='<path d="M80 30c15 7 24 22 18 37 17-3 31 9 32 25-1 17-16 29-33 24-3 17-17 28-34 25-15-5-24-21-18-36-17 2-30-11-30-27 2-17 17-28 33-23 3-16 17-28 32-25Z" fill="#f4e5bb" stroke="#b99756" stroke-width="5"/><circle cx="80" cy="84" r="20" fill="#78b5ca" stroke="#e8cf8f" stroke-width="5"/>';
    else if(kind==='mora') art='<circle cx="80" cy="80" r="48" fill="#dfb84f" stroke="#fff0b0" stroke-width="7"/><circle cx="80" cy="80" r="30" fill="none" stroke="#8b6726" stroke-width="6"/><path d="M80 54 96 80 80 106 64 80Z" fill="#fff0b0" stroke="#8b6726" stroke-width="4"/>';
    else if(kind==='ore') art='<path d="m80 22 34 43-15 64-39 11-24-49 19-54Z" fill="#6dc5e5" stroke="#d7f4ff" stroke-width="6"/><path d="m80 22-8 72 27 35M55 37l17 57-36-3m78-26L72 94" fill="none" stroke="#3d82a1" stroke-width="5"/>';
    else if(kind==='custom') art='<rect x="40" y="31" width="80" height="98" rx="12" fill="#f5e8c5" stroke="#9e8050" stroke-width="5"/><path d="M57 60h46M57 79h30M57 98h25" stroke="#718da2" stroke-width="6" stroke-linecap="round"/><circle cx="103" cy="103" r="25" fill="#6f9db9" stroke="#f3dda1" stroke-width="5"/><path d="M103 91v24M91 103h24" stroke="#fff6df" stroke-width="6" stroke-linecap="round"/>';
    else art='<path d="M31 66h98v62H31Z" fill="#739dc5" stroke="#e6cf91" stroke-width="6"/><path d="M42 44h76l11 22H31Z" fill="#a8c5df" stroke="#e6cf91" stroke-width="6"/><path d="M70 65h20v63H70Z" fill="#d5b86d"/><circle cx="80" cy="88" r="12" fill="#f6e8bd" stroke="#8b7040" stroke-width="4"/><path d="M80 82v13" stroke="#8b7040" stroke-width="4" stroke-linecap="round"/>';
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><defs><radialGradient id="bg"><stop stop-color="#f7f0d9"/><stop offset="1" stop-color="#c9dce6"/></radialGradient></defs><rect width="160" height="160" rx="26" fill="url(#bg)"/>${art}</svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  function setSafeImage(img, fallback, urls, label) {
    const candidates = Array.isArray(urls) ? urls.filter(Boolean) : (urls ? [urls] : []);
    img.onload = null;
    img.onerror = null;
    img.removeAttribute('src');
    img.alt = label || '';
    img.loading = 'eager';
    img.decoding = 'async';
    img.referrerPolicy = 'no-referrer';
    fallback.hidden = false;

    if (!candidates.length) {
      img.hidden = true;
      return;
    }

    // Não usamos <img hidden loading="lazy">: alguns previews não iniciam o download
    // de imagens preguiçosas que começam com display:none. Mantemos o elemento renderizado
    // e invisível até a primeira URL válida carregar.
    img.hidden = false;
    img.style.visibility = 'hidden';
    img.style.opacity = '0';
    let index = 0;

    const tryNext = () => {
      if (index >= candidates.length) {
        img.hidden = true;
        img.style.visibility = '';
        img.style.opacity = '';
        fallback.hidden = false;
        return;
      }
      const url = candidates[index++];
      img.onload = () => {
        img.hidden = false;
        img.style.visibility = 'visible';
        img.style.opacity = '1';
        fallback.hidden = true;
      };
      img.onerror = tryNext;
      img.src = url;
    };
    tryNext();
  }

  function tr(key) {
    return I18N[state.lang]?.[key] ?? I18N.pt[key] ?? key;
  }

  function libraryLabel(meta) {
    if (!meta) return '';
    return state.lang === 'en' ? (meta.labelEn || meta.label) : meta.label;
  }

  function librarySingular(meta) {
    if (!meta) return '';
    return state.lang === 'en' ? (meta.singularEn || meta.singular) : meta.singular;
  }

  function dayLabel(day) { return DAY_NAMES[state.lang]?.[day] || day; }
  function dayShort(day) { return DAY_SHORT[state.lang]?.[day] || String(day || '').slice(0,3); }
  function categoryLabel(value) { return CATEGORY_LABELS[state.lang]?.[value] || humanize(value); }

  function applyLanguage() {
    document.documentElement.lang = state.lang === 'en' ? 'en' : 'pt-BR';
    document.title = state.lang === 'en' ? 'Resin Route — Genshin Weekly Planner' : 'Resin Route — Planejador Semanal de Genshin';
    el.languageSelect.value = state.lang;
    el.languageLabel.textContent = tr('language');
    document.querySelector('.brand small').textContent = tr('brandSubtitle');
    el.exportBtn.querySelector('span:last-child').textContent = tr('export');
    document.querySelector('.import-label').textContent = tr('import');
    el.backupOpenBtn.textContent = tr('backup');
    document.querySelector('#backupEyebrow').textContent = tr('backup').toUpperCase();
    document.querySelector('#backupTitle').textContent = tr('backupTitle');
    document.querySelector('#backupDescription').textContent = tr('backupDesc');
    document.querySelector('#backupHelp').textContent = tr('backupHelp');
    document.querySelector('.copy-backup-label').textContent = tr('copyBackup');
    const hero = document.querySelector('.hero');
    hero.querySelector('.eyebrow').textContent = tr('heroEyebrow');
    hero.querySelector('h1').textContent = tr('heroTitle');
    hero.querySelector('p').textContent = tr('heroText');
    const stats = hero.querySelectorAll('.stat');
    stats[0].querySelector('span').textContent = tr('thisWeek'); stats[0].querySelector('small').textContent = tr('plannedResin');
    stats[1].querySelector('span').textContent = tr('completed'); stats[1].querySelector('small').textContent = tr('attemptsPlanned');
    stats[2].querySelector('span').textContent = tr('dailyLimit'); stats[2].querySelector('small').textContent = tr('editable');
    document.querySelector('.planner-column .eyebrow').textContent = tr('plan');
    document.querySelector('#emptyState h3').textContent = tr('nothing');
    document.querySelector('#emptyState p').textContent = tr('nothingText');
    el.emptyBrowseBtn.textContent = tr('browse');
    document.querySelector('.library-column .eyebrow').textContent = tr('gameLibrary');
    document.querySelector('.library-column h2').textContent = tr('chooseFarm');
    document.querySelector('.week-overview .eyebrow').textContent = tr('weekView');
    document.querySelector('.week-overview h2').textContent = tr('resinDistribution');
    el.clearWeekBtn.textContent = tr('clearWeek');
    document.querySelector('#taskNameInput').closest('.field').querySelector('span').textContent = tr('taskName');
    document.querySelector('#taskDayInput').closest('.field').querySelector('span').textContent = tr('day');
    document.querySelector('#taskCategoryInput').closest('.field').querySelector('span').textContent = tr('category');
    document.querySelector('#resinPerRunInput').closest('.field').querySelector('span').textContent = tr('resinPerRun');
    document.querySelector('#runsInput').closest('.field').querySelector('span').textContent = tr('attempts');
    document.querySelector('#noteInput').closest('.field').querySelector('span').innerHTML = `${escapeHtml(tr('note'))} <small>${escapeHtml(tr('optional'))}</small>`;
    document.querySelector('.dialog-summary > span').textContent = tr('totalPlanned');
    el.cancelDialogBtn.textContent = tr('cancel');
    el.taskForm.querySelector('.dialog-actions .primary').textContent = tr('addPlan');
    document.querySelector('.dialog-summary strong').lastChild.nodeValue = ` ${tr('resin')}`;
    el.taskNameInput.placeholder = state.lang === 'en' ? 'e.g. Farm talent books' : 'ex.: Farmar livros de talento';
    el.noteInput.placeholder = state.lang === 'en' ? 'e.g. need 12 more Philosophies' : 'ex.: faltam mais 12 Filosofias';
    el.artifactMethodLabel.textContent = tr('artifactMethod');
    document.querySelector('#characterFarmLabel').textContent = tr('characterFarm');
    el.characterFarmInput.options[0].textContent = tr('charBoss');
    el.characterFarmInput.options[1].textContent = tr('charAscension');
    el.characterFarmInput.options[2].textContent = tr('charTalents');
    el.characterFarmInput.options[3].textContent = tr('charWeekly');
    document.querySelector('#strongboxEyebrow').textContent = tr('strongboxEyebrow');
    document.querySelector('#strongboxTitle').textContent = tr('strongboxTitle');
    document.querySelector('#strongboxDescription').textContent = tr('strongboxDesc');
    el.strongboxSearch.placeholder = tr('strongboxSearch');
    document.querySelector('.footer p:first-child').textContent = tr('footer1');
    document.querySelector('.footer p:last-child').textContent = state.lang === 'en' ? 'Without an account, your plan stays in this browser. Sign in to sync across devices.' : 'Sem login, seu plano fica neste navegador. Entre para sincronizar entre dispositivos.';
    el.refreshDataBtn.title = tr('refresh');
    el.refreshDataBtn.setAttribute('aria-label', tr('refresh'));
    [...el.taskCategoryInput.options].forEach(option => { option.textContent = categoryLabel(option.value); });
    renderLibraryTabs();
  }

  function changeLanguage() {
    const next = el.languageSelect.value === 'en' ? 'en' : 'pt';
    if (next === state.lang) return;
    state.lang = next;
    saveState();
    libraryCache.clear();
    seedFallbackLibraries();
    applyLanguage();
    el.taskDayInput.innerHTML = DAYS.map(day => `<option value="${day}">${dayLabel(day)}</option>`).join('');
    renderAll();
    renderLibraryGrid(activeLibraryType);
    setApiStatus(activeLibraryType === 'misc' ? 'online' : 'loading');
    loadLibrary(activeLibraryType);
    if (el.strongboxDialog.open) loadLibrary('artifacts').then(renderStrongboxGrid);
  }

  function normalizeDayInput(value) {
    const normalized = String(value || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const aliases = {
      monday: 'Monday', mon: 'Monday', segunda: 'Monday', 'segunda-feira': 'Monday', seg: 'Monday',
      tuesday: 'Tuesday', tue: 'Tuesday', terca: 'Tuesday', 'terca-feira': 'Tuesday', ter: 'Tuesday',
      wednesday: 'Wednesday', wed: 'Wednesday', quarta: 'Wednesday', 'quarta-feira': 'Wednesday', qua: 'Wednesday',
      thursday: 'Thursday', thu: 'Thursday', quinta: 'Thursday', 'quinta-feira': 'Thursday', qui: 'Thursday',
      friday: 'Friday', fri: 'Friday', sexta: 'Friday', 'sexta-feira': 'Friday', sex: 'Friday',
      saturday: 'Saturday', sat: 'Saturday', sabado: 'Saturday', sab: 'Saturday',
      sunday: 'Sunday', sun: 'Sunday', domingo: 'Sunday', dom: 'Sunday',
    };
    return aliases[normalized] || DAYS.find(day => day.toLowerCase() === normalized) || null;
  }

  function normalizeAvailableDays(days) {
    return [...new Set((Array.isArray(days) ? days : [days]).map(normalizeDayInput).filter(Boolean))];
  }

  function getTodayName() {
    const jsDay = new Date().getDay();
    return DAYS[(jsDay + 6) % 7];
  }

  function slugify(value) {
    return String(value || '')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function titleFromSlug(slug) {
    return slug
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase())
      .replace(/\bDps\b/g, 'DPS')
      .replace(/\bHp\b/g, 'HP');
  }

  function humanize(value) {
    return titleFromSlug(String(value || ''));
  }

  function formatNumber(value) {
    return new Intl.NumberFormat('pt-BR').format(value || 0);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function uid() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));
  }

  function toast(message) {
    let node = document.querySelector('.toast');
    if (!node) {
      node = document.createElement('div');
      node.className = 'toast';
      document.body.appendChild(node);
    }
    node.textContent = message;
    node.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.classList.remove('show'), 1900);
  }
})();
