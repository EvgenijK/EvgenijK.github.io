(() => {
  const root = document.documentElement;
  const {
    PY_MAX_EXP,PLAYER_GOLD,PLAYER_EXP,INVENTORY_CAPACITY,BAGS_DEFAULT_ROW_LIMIT,INVENTORY_ICONS,INVENTORY_ITEMS,BAGS,FLOOR_ITEMS,
    EQUIPMENT_ICONS,CHARACTER_SOURCE_ICONS,TERM_COLORS,EQUIPMENT_SLOT_META,EQUIPMENT_ITEMS,MESSAGE_STREAM,RIGHT_PANEL_WIDGETS,DEFAULT_RIGHT_PANEL_ORDER,
    LEFT_PANEL_WIDGETS,DEFAULT_LEFT_PANEL_ORDER,DEFAULT_LEFT_PANEL_VISIBILITY,
    CHARACTER_DATA,CHARACTER_SOURCES,CHARACTER_SOURCE_EQUIPMENT,CHARACTER_RESIST_GROUPS,ENCUMBRANCE_STATUSES,STATUS_ICONS,STATUS_INDICATORS,
    SHIELD_OPTIONS,CONDITION_DEFINITIONS,CONDITION_BASES,STATUS_SLOTS,DEFAULT_INDICATORS,DEFAULT_CONDITIONS,DEFAULT_ENCUMBRANCE,SKILL_TREE_DATA,ABILITY_DATA,
    SPELL_DEFINITIONS,SPELLBOOK_SOURCES,MIMIC_POWERS,MIMIC_FORMS,MIMIC_IMMUNITIES,COMBAT_STANCES,MELEE_TECHNIQUES,RANGED_TECHNIQUES,DRAGON_BREATH_ELEMENTS,DRAGON_LINEAGES,
    RUNES,RUNE_MODES,RUNE_TYPES,RUNE_ENHANCED_TYPES,calculateRuneSpell,
    MINI_MAP_LOCAL_PRIORITY,MINI_MAP_TERM_PALETTE,MINI_MAP_WORLD_DEMO,LOOK_DEMO_POINTS
  } = window.TomeNetPrototype.data;
  const storedNumber = (key, fallback) => {
    const value = localStorage.getItem(`tomenet.${key}`);
    return value === null ? fallback : +value;
  };
  const storedBoolean = (key, fallback) => {
    const value = localStorage.getItem(`tomenet.${key}`);
    return value === null ? fallback : value === "true";
  };
  const storedString = (key, fallback) => localStorage.getItem(`tomenet.${key}`) || fallback;
  const storedObject = (key, fallback) => {
    const value = localStorage.getItem(`tomenet.${key}`);
    if (value === null) return {...fallback};
    try { return {...fallback, ...JSON.parse(value)}; }
    catch { return {...fallback}; }
  };
  const storedArray = (key, fallback) => {
    const value = localStorage.getItem(`tomenet.${key}`);
    if (value === null) return [...fallback];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [...fallback];
    }
    catch { return [...fallback]; }
  };
  const layoutVersion = "reference-1672-v1";
  const layoutScale = Math.max(.82, Math.min(1.18, window.innerWidth / 1672));
  const defaultLeftWidth = Math.round(320 * layoutScale);
  const defaultRightWidth = Math.round(481 * layoutScale);
  const hasCurrentLayout = localStorage.getItem("tomenet.layoutVersion") === layoutVersion;
  const legacyMessageMode = storedBoolean("chatVisible",false) && !storedBoolean("msgChatVisible",true) ? "chat" : "all";
  const state = {
    leftWidth: +(hasCurrentLayout && localStorage.getItem("tomenet.leftWidth") || defaultLeftWidth),
    rightWidth: +(hasCurrentLayout && localStorage.getItem("tomenet.rightWidth") || defaultRightWidth),
    ping: +(localStorage.getItem("tomenet.ping") || 193),
    hp: +(localStorage.getItem("tomenet.hp") || 1912),
    mp: +(localStorage.getItem("tomenet.mp") || 275),
    st: +(localStorage.getItem("tomenet.st") || 10),
    sanity: storedNumber("sanity", 100),
    sanityDisplay: storedString("sanityDisplay", "word"),
    wideHp: storedBoolean("wideHp", storedBoolean("wideVitals", false)),
    wideMp: storedBoolean("wideMp", storedBoolean("wideVitals", false)),
    wideSanity: storedBoolean("wideSanity", storedBoolean("wideVitals", false)),
    wideVitalValues: storedBoolean("wideVitalValues", true),
    enemyPresent: storedBoolean("enemyPresent", true),
    enemyHealth: storedNumber("enemyHealth", 72),
    speed: storedNumber("speed", 41),
    speedBoosted: storedBoolean("speedBoosted", false),
    noTele: storedBoolean("noTele", false),
    bpr: storedNumber("bpr", 4),
    bprBoosted: storedBoolean("bprBoosted", false),
    bprMode: storedString("bprMode", "numeric"),
    indicators: storedObject("indicators", DEFAULT_INDICATORS),
    shield: storedString("shield", "none"),
    conditions: storedObject("conditions", DEFAULT_CONDITIONS),
    xpLevel: storedNumber("xpLevel", 57),
    xpProgress: storedNumber("xpProgress", 68),
    xpHideNumber: storedBoolean("xpHideNumber", false),
    xpDrained: storedBoolean("xpDrained", false),
    xpDrainPercent: storedNumber("xpDrainPercent", 20),
    xpRemainingOnly: storedBoolean("xpRemainingOnly", false),
    encumbrance: storedObject("encumbrance", DEFAULT_ENCUMBRANCE),
    rightPanelHeadersHidden: storedBoolean("rightPanelHeadersHidden", false),
    rightPanelHeaderHeight: storedNumber("rightPanelHeaderHeight", 30),
    msgChatVisible: storedBoolean("msgChatVisible", true),
    msgChatRows: storedNumber("msgChatRows", 10),
    msgChatFontSize: storedNumber("msgChatFontSize", 12),
    rightPanelMessageMode: storedString("rightPanelMessageMode", legacyMessageMode),
    messageHistoryMode: storedString("messageHistoryMode", "all"),
    messageHistoryFontSize: storedNumber("messageHistoryFontSize", 14),
    messageHistoryOpacity: storedNumber("messageHistoryOpacity", 70),
    messageHistoryDataState: storedString("messageHistoryDataState", "ready"),
    inventoryVisible: storedBoolean("inventoryVisible", true),
    inventoryFontSize: storedNumber("inventoryFontSize", 12),
    inventoryWindowFontSize: storedNumber("inventoryWindowFontSize", 14),
    equipmentVisible: storedBoolean("equipmentVisible", false),
    equipmentFontSize: storedNumber("equipmentFontSize", 12),
    equipmentWindowFontSize: storedNumber("equipmentWindowFontSize", 14),
    combinedItemsWindow: storedBoolean("combinedItemsWindow", false),
    browseWindowFontSize: storedNumber("browseWindowFontSize", 14),
    browseDataState: storedString("browseDataState", "ready"),
    browseInventoryFull: storedBoolean("browseInventoryFull", false),
    itemSelectorDemoAction: storedString("itemSelectorDemoAction", "inspect"),
    deviceOutcome: storedString("deviceOutcome", "success"),
    deviceReadiness: storedString("deviceReadiness", "data"),
    deviceWrappingSkill: storedString("deviceWrappingSkill", "sufficient"),
    bagsVisible: storedBoolean("bagsVisible", true),
    bagsFontSize: storedNumber("bagsFontSize", 12),
    bagsRowLimit: storedNumber("bagsRowLimit", BAGS_DEFAULT_ROW_LIMIT),
    characterVisible: storedBoolean("characterVisible", true),
    characterHeight: storedNumber("characterHeight", 30),
    characterFontSize: storedNumber("characterFontSize", 9),
    characterWindowFontSize: storedNumber("characterWindowFontSize", 12),
    skillsWindowFontSize: storedNumber("skillsWindowFontSize", 12),
    skillsShowUnavailable: storedBoolean("skillsShowUnavailable", false),
    abilitiesWindowFontSize: storedNumber("abilitiesWindowFontSize", 12),
    abilitiesExpanded: storedBoolean("abilitiesExpanded", true),
    spellbookWindowFontSize: storedNumber("spellbookWindowFontSize", 12),
    mimicPowersFontSize: storedNumber("mimicPowersFontSize", 12),
    combatStancesFontSize: storedNumber("combatStancesFontSize", 12),
    meleeTechniquesFontSize: storedNumber("meleeTechniquesFontSize", 12),
    rangedTechniquesFontSize: storedNumber("rangedTechniquesFontSize", 12),
    rangedDemoLauncher: storedString("rangedDemoLauncher", "bow"),
    rangedDemoShield: storedBoolean("rangedDemoShield", false),
    rangedDemoAmmo: storedNumber("rangedDemoAmmo", 42),
    rangedDemoAmmoCondition: storedString("rangedDemoAmmoCondition", "normal"),
    rangedDemoAmmoProtected: storedBoolean("rangedDemoAmmoProtected", false),
    rangedDemoOil: storedBoolean("rangedDemoOil", true),
    rangedDemoMaterials: storedString("rangedDemoMaterials", "inventory"),
    dragonBreathFontSize: storedNumber("dragonBreathFontSize", 12),
    runecraftFontSize: storedNumber("runecraftFontSize", 12),
    dragonDemoLineage: storedString("dragonDemoLineage", "multi"),
    dragonDemoForm: storedString("dragonDemoForm", "native"),
    ghostDemoState: storedString("ghostDemoState", "living"),
    stanceDemoLoadout: storedString("stanceDemoLoadout", "shield"),
    combatStance:"balanced",
    combatStanceRank:"STANDARD",
    dualWieldMode:"dual-hand",
    mycorrhiza:null,
    characterPage: storedString("characterPage", "profile"),
    characterSummaryPage: storedString("characterSummaryPage", "profile"),
    characterResistsLegendHidden: storedBoolean("characterResistsLegendHidden", false),
    leftPanelVisibility: storedObject("leftPanelVisibility", DEFAULT_LEFT_PANEL_VISIBILITY),
    leftPanelOrder: storedArray("leftPanelOrder", DEFAULT_LEFT_PANEL_ORDER),
    rightPanelOrder: storedArray("rightPanelOrder", DEFAULT_RIGHT_PANEL_ORDER),
    mapGrid: storedBoolean("mapGrid", false),
    mapCellInfo: storedBoolean("mapCellInfo", true),
    mapFollow: storedBoolean("mapFollow", true),
    mapViewportWidth: storedNumber("mapViewportWidth", 66),
    mapViewportHeight: storedNumber("mapViewportHeight", 44),
    miniMapContext: storedString("miniMapContext", "local"),
    miniMapDataState: storedString("miniMapDataState", "ready"),
    lookAvailability: storedString("lookAvailability", "ready"),
    cursorTheme: storedString("cursorTheme", "mithril"),
    controlsTab: localStorage.getItem("tomenet.controlsTab") || "general",
    windowControlsTab: storedString("windowControlsTab", "inventory"),
  };

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const formatNumber = new Intl.NumberFormat("en-US");
  const windowManager = window.TomeNetPrototype.service("windowManager");
  const inputRouter = window.TomeNetPrototype.service("inputRouter");
  let itemFeature = null;
  let equipmentWindowFeature = null;
  let combinedItemsWindowFeature = null;
  let browseWindowFeature = null;
  let itemSelectorFeature = null;
  let itemUseFeature = null;
  let itemDeviceFeature = null;
  let itemEquipFeature = null;
  let skillsWindowFeature = null;
  let abilitiesWindowFeature = null;
  let spellbookWindowFeature = null;
  let mimicPowersFeature = null;
  let combatStancesFeature = null;
  let meleeTechniquesFeature = null;
  let rangedTechniquesFeature = null;
  let dragonBreathFeature = null;
  let runecraftFeature = null;
  let ghostPowersFeature = null;
  let mycorrhizaFeature = null;
  let trappingFeature = null;
  let gameMenuFeature = null;
  let miniMapFeature = null;
  let locateFeature = null;
  let lookFeature = null;
  const mapFeature = window.TomeNetPrototype.createMapFeature({
    state,persist,$,clamp,
    getThrowTarget:() => itemFeature?.getThrowTarget() || null,
    updateThrowTarget:(col,row) => itemFeature?.updateThrowTarget(col,row),
    mapOverlays:LOOK_DEMO_POINTS
  });
  const {mapCanvas,mapState,mapViewport,mapCellAt,recenterMapCamera,renderMap,fitMapCanvas,mapPointerCell,showMapCellInfo,moveMapPlayer,mapMovementDelta,applyMapControls,setMapViewport,resetMapPlayer,initMap,clampMapCamera} = mapFeature;
  const leftPanelFeature = window.TomeNetPrototype.createLeftPanelFeature({
    state,$,LEFT_PANEL_WIDGETS,DEFAULT_LEFT_PANEL_ORDER,DEFAULT_LEFT_PANEL_VISIBILITY
  });
  const {applyLeftPanel,isWidgetVisible:isLeftPanelWidgetVisible} = leftPanelFeature;
  const rightPanelFeature = window.TomeNetPrototype.createRightPanelFeature({
    root,state,$,$$,clamp,BAGS,DEFAULT_RIGHT_PANEL_ORDER,RIGHT_PANEL_WIDGETS,fitMapCanvas,renderCharacter:() => renderCharacter()
  });
  const {applyLayout,applyRightPanel,scrollMessagesToBottom} = rightPanelFeature;
  const hudFeature = window.TomeNetPrototype.createHudFeature({
    root,state,$,$$,clamp,formatNumber,PLAYER_EXP,PY_MAX_EXP,STATUS_ICONS,STATUS_INDICATORS,STATUS_SLOTS,SHIELD_OPTIONS,CONDITION_DEFINITIONS,
    isLeftPanelWidgetVisible,renderCharacter:() => renderCharacter()
  });
  const {applyVitals,applyEnemyHealth,buildStatusUi,applyCombatStatuses,experienceRange,applyExperience} = hudFeature;
  function persist() {
    const sessionOnly=new Set(["combatStance","combatStanceRank","dualWieldMode","mycorrhiza"]);
    for (const [k,v] of Object.entries(state)) if(!sessionOnly.has(k))localStorage.setItem(`tomenet.${k}`, typeof v === "object" ? JSON.stringify(v) : v);
    localStorage.setItem("tomenet.layoutVersion", layoutVersion);
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    })[character]);
  }

  const messageFeature = window.TomeNetPrototype.createMessageFeature({
    $,$$,state,persist,clamp,MESSAGE_STREAM,escapeHtml,scrollMessagesToBottom,
    restoreFocus:() => locateFeature?.isOpen() ? locateFeature.restoreFocus() : lookFeature?.isOpen() ? lookFeature.restoreFocus() : miniMapFeature?.isOpen() ? miniMapFeature.restoreFocus() : gameMenuFeature?.isOpen() ? gameMenuFeature.restoreFocus() : runecraftFeature?.isOpen() ? runecraftFeature.restoreFocus() : dragonBreathFeature?.isOpen() ? dragonBreathFeature.restoreFocus() : rangedTechniquesFeature?.isOpen() ? rangedTechniquesFeature.restoreFocus() : meleeTechniquesFeature?.isOpen() ? meleeTechniquesFeature.restoreFocus() : combatStancesFeature?.isOpen() ? combatStancesFeature.restoreFocus() : mimicPowersFeature?.isOpen() ? mimicPowersFeature.restoreFocus() : spellbookWindowFeature?.isOpen() ? spellbookWindowFeature.restoreFocus() : abilitiesWindowFeature?.isOpen() ? abilitiesWindowFeature.restoreFocus() : skillsWindowFeature?.isOpen() ? skillsWindowFeature.restoreFocus() : combinedItemsWindowFeature?.isOpen() ? combinedItemsWindowFeature.restoreFocus() : equipmentWindowFeature?.isOpen() ? equipmentWindowFeature.restoreFocus() : itemFeature?.restoreFocus(),
    closePrimaryWindow:() => combinedItemsWindowFeature?.isOpen() ? combinedItemsWindowFeature.closeWindow() : itemFeature?.closeInventoryWindow(),windowManager
  });
  const {buildMessageFeeds,appendDemoMessage,appendGameMessage,setPinnedMessageMode,openMapChatEditor,closeMapChatEditor,mapChatEditor,handleKeydown:handleMessageKeydown,applyHistoryControls} = messageFeature;
  locateFeature = window.TomeNetPrototype.createLocateFeature({
    state,$,windowManager,mapState,mapViewport,clampMapCamera,renderMap,applyMapControls,recenterMapCamera,appendGameMessage
  });
  const activityActionsFeature = window.TomeNetPrototype.createActivityActionsFeature({
    state,persist,applyCombatStatuses,appendGameMessage,escapeHtml
  });
  lookFeature = window.TomeNetPrototype.createLookFeature({
    state,$,windowManager,mapState,mapViewport,mapCellAt,mapPointerCell,recenterMapCamera,renderMap,applyMapControls,appendGameMessage,activityActions:activityActionsFeature,points:LOOK_DEMO_POINTS
  });
  itemUseFeature = window.TomeNetPrototype.createItemUseFeature({escapeHtml,appendGameMessage});
  const rangedActionFeature = window.TomeNetPrototype.createRangedActionFeature({state,escapeHtml,appendGameMessage});
  itemDeviceFeature = window.TomeNetPrototype.createItemDeviceFeature({state,escapeHtml,appendGameMessage});
  itemEquipFeature = window.TomeNetPrototype.createItemEquipFeature({escapeHtml,appendGameMessage,EQUIPMENT_ITEMS,EQUIPMENT_SLOT_META});
  const systemOverlayFeature = window.TomeNetPrototype.createSystemOverlayFeature({$,windowManager});
  const cursorFeature = window.TomeNetPrototype.createCursorFeature({root,state,$,persist});
  const {buildCursorControls,applyCursorTheme} = cursorFeature;
  const itemListFeature = window.TomeNetPrototype.createItemListFeature({
    $,INVENTORY_CAPACITY,INVENTORY_ITEMS,INVENTORY_ICONS,EQUIPMENT_ITEMS,EQUIPMENT_ICONS,TERM_COLORS,BAGS
  });
  const {buildInventoryUi,buildEquipmentUi,buildBagsUi} = itemListFeature;
  const characterFeature = window.TomeNetPrototype.createCharacterFeature({
    state,$,$$,persist,formatNumber,experienceRange,PY_MAX_EXP,PLAYER_GOLD,CHARACTER_DATA,CHARACTER_SOURCES,CHARACTER_SOURCE_EQUIPMENT,
    CHARACTER_RESIST_GROUPS,CHARACTER_SOURCE_ICONS,TERM_COLORS
  });
  const {CHARACTER_PAGES,renderCharacter,setCharacterPage,characterFieldsForPage,getSelectedCharacterField,selectCharacterField} = characterFeature;
  const guideWindowFeature = window.TomeNetPrototype.createGuideWindowFeature({$,escapeHtml,windowManager});
  skillsWindowFeature = window.TomeNetPrototype.createSkillsWindowFeature({
    state,$,clamp,persist,windowManager,guideFeature:guideWindowFeature,appendGameMessage,escapeHtml,skillsData:SKILL_TREE_DATA
  });
  const {handleKeydown:handleSkillsWindowKeydown,applyControls:applySkillsWindowControls} = skillsWindowFeature;
  spellbookWindowFeature = window.TomeNetPrototype.createSpellbookWindowFeature({
    state,$,clamp,persist,windowManager,appendGameMessage,escapeHtml,INVENTORY_ITEMS,INVENTORY_ICONS,
    spellDefinitions:SPELL_DEFINITIONS,spellbookSources:SPELLBOOK_SOURCES,skillsFeature:skillsWindowFeature
  });
  const {handleKeydown:handleSpellbookKeydown,applyControls:applySpellbookControls} = spellbookWindowFeature;
  mimicPowersFeature = window.TomeNetPrototype.createMimicPowersWindowFeature({
    state,$,clamp,persist,windowManager,appendGameMessage,escapeHtml,forms:MIMIC_FORMS,powers:MIMIC_POWERS,immunities:MIMIC_IMMUNITIES,
    CHARACTER_DATA,renderCharacter,getTargetingFeature:()=>itemFeature
  });
  const {handleKeydown:handleMimicPowersKeydown,applyControls:applyMimicPowersControls} = mimicPowersFeature;
  combatStancesFeature = window.TomeNetPrototype.createCombatStancesWindowFeature({
    state,$,clamp,persist,windowManager,appendGameMessage,escapeHtml,stances:COMBAT_STANCES,CHARACTER_DATA,applyCombatStatuses
  });
  const {handleKeydown:handleCombatStancesKeydown,applyControls:applyCombatStancesControls} = combatStancesFeature;
  meleeTechniquesFeature = window.TomeNetPrototype.createMeleeTechniquesWindowFeature({
    state,$,clamp,persist,windowManager,appendGameMessage,escapeHtml,techniques:MELEE_TECHNIQUES,CHARACTER_DATA,skillsFeature:skillsWindowFeature
  });
  const {handleKeydown:handleMeleeTechniquesKeydown,applyControls:applyMeleeTechniquesControls} = meleeTechniquesFeature;
  rangedTechniquesFeature = window.TomeNetPrototype.createRangedTechniquesWindowFeature({
    state,$,clamp,persist,windowManager,appendGameMessage,escapeHtml,techniques:RANGED_TECHNIQUES,skillsFeature:skillsWindowFeature
  });
  const {handleKeydown:handleRangedTechniquesKeydown,applyControls:applyRangedTechniquesControls} = rangedTechniquesFeature;
  dragonBreathFeature = window.TomeNetPrototype.createDragonBreathWindowFeature({
    state,$,$$,clamp,persist,windowManager,appendGameMessage,escapeHtml,lineages:DRAGON_LINEAGES,elements:DRAGON_BREATH_ELEMENTS,getTargetingFeature:()=>itemFeature
  });
  const {handleKeydown:handleDragonBreathKeydown,applyControls:applyDragonBreathControls} = dragonBreathFeature;
  runecraftFeature = window.TomeNetPrototype.createRunecraftWindowFeature({
    state,$,clamp,persist,windowManager,appendGameMessage,escapeHtml,runes:RUNES,modes:RUNE_MODES,types:RUNE_TYPES,enhancedTypes:RUNE_ENHANCED_TYPES,
    calculate:calculateRuneSpell,skillsFeature:skillsWindowFeature,getTargetingFeature:()=>itemFeature
  });
  const {handleKeydown:handleRunecraftKeydown,applyControls:applyRunecraftControls} = runecraftFeature;
  ghostPowersFeature = window.TomeNetPrototype.createGhostPowersFeature({state,$});
  const {applyControls:applyGhostPowersControls} = ghostPowersFeature;
  mycorrhizaFeature = window.TomeNetPrototype.createMycorrhizaFeature({
    state,windowManager,appendGameMessage,escapeHtml,applyCombatStatuses,
    getItemSelectorFeature:()=>itemSelectorFeature,getAbilitiesFeature:()=>abilitiesWindowFeature
  });
  trappingFeature = window.TomeNetPrototype.createTrappingFeature({
    state,windowManager,appendGameMessage,escapeHtml,
    getItemSelectorFeature:()=>itemSelectorFeature,getAbilitiesFeature:()=>abilitiesWindowFeature
  });
  abilitiesWindowFeature = window.TomeNetPrototype.createAbilitiesWindowFeature({
    state,$,$$,clamp,persist,windowManager,appendGameMessage,escapeHtml,applyCombatStatuses,abilitiesData:ABILITY_DATA,skillsFeature:skillsWindowFeature,spellbookFeature:spellbookWindowFeature,mimicPowersFeature,combatStancesFeature,meleeTechniquesFeature,rangedTechniquesFeature,dragonBreathFeature,runecraftFeature,ghostPowersFeature,mycorrhizaFeature,trappingFeature
  });
  const {handleKeydown:handleAbilitiesWindowKeydown,applyControls:applyAbilitiesWindowControls} = abilitiesWindowFeature;
  $("#combatStanceBadge").addEventListener("click",()=>combatStancesFeature.cycleFromHud());
  $("#dualWieldBadge").addEventListener("click",()=>abilitiesWindowFeature.toggleDualMode());
  const characterWindowFeature = window.TomeNetPrototype.createCharacterWindowFeature({
    state,$,$$,clamp,persist,renderCharacter,setCharacterPage,CHARACTER_PAGES,windowManager,
    guideFeature:guideWindowFeature,appendGameMessage,escapeHtml,CHARACTER_DATA,
    characterFieldsForPage,getSelectedCharacterField,selectCharacterField
  });
  const {handleKeydown:handleCharacterWindowKeydown,applyControls:applyCharacterWindowControls} = characterWindowFeature;
  miniMapFeature = window.TomeNetPrototype.createMiniMapFeature({
    state,$,windowManager,mapState,mapViewport,mapCellAt,
    localPriority:MINI_MAP_LOCAL_PRIORITY,termPalette:MINI_MAP_TERM_PALETTE,worldData:MINI_MAP_WORLD_DEMO
  });
  gameMenuFeature = window.TomeNetPrototype.createGameMenuFeature({
    $,windowManager,
    openMessages:opener => messageFeature.openHistory("all",opener),
    openMiniMap:opener => miniMapFeature.openWindow(opener)
  });
  function buildEncumbranceUi() {
    const slots = Array.from({length:12}, (_, slot) => {
      const statuses = ENCUMBRANCE_STATUSES.filter(status => status.slot === slot);
      return `<span class="encumbrance-slot" data-enc-slot="${slot}">${statuses.map(status => `<span class="encumbrance-state" data-enc-status="${status.id}" style="--enc-color:${status.color}" title="${status.label}: ${status.description}" aria-label="${status.label}: ${status.description}">${status.icon}</span>`).join("")}</span>`;
    });
    $("#encumbranceSlots").innerHTML = slots.join("");
    $("#encumbranceControls").innerHTML = ENCUMBRANCE_STATUSES.map(status => `<label class="encumbrance-control" style="--enc-color:${status.color}"><span class="encumbrance-control-icon">${status.icon}</span><span>${status.label}</span><input type="checkbox" data-enc-control="${status.id}"></label>`).join("");
  }

  function applyEncumbrance() {
    ENCUMBRANCE_STATUSES.forEach(status => {
      const enabled = Boolean(state.encumbrance[status.id]);
      const icon = $(`[data-enc-status="${status.id}"]`);
      const control = $(`[data-enc-control="${status.id}"]`);
      if (icon) icon.classList.toggle("active", enabled);
      if (control) control.checked = enabled;
    });
    $("#encumbranceSlots").classList.toggle("is-clear", !ENCUMBRANCE_STATUSES.some(status => state.encumbrance[status.id]));
  }

  // Prototype drawer
  const drawer = $("#controlsDrawer");
  windowManager.register({
    kind:"prototype-controls",layer:"technical",blocksGameplay:true,allowsChat:true,
    focusTarget:() => $("#closeControls"),
    onOpen:() => { drawer.classList.add("open");drawer.setAttribute("aria-hidden","false");requestAnimationFrame(() => $("#closeControls").focus()); },
    onClose:() => { drawer.classList.remove("open");drawer.setAttribute("aria-hidden","true"); }
  });
  $("#openControls").addEventListener("click", event => windowManager.open("prototype-controls",{}, {opener:event.currentTarget}));
  $("#closeControls").addEventListener("click", () => windowManager.closeKind("prototype-controls"));

  function activateControlsTab(name) {
    const target = ["general", "leftpanel", "rightpanel", "windows", "map", "cursor", "experience", "encumbrance", "statuses"].includes(name) ? name : "general";
    state.controlsTab = target;
    $$("[data-controls-tab]").forEach(button => {
      const active = button.dataset.controlsTab === target;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", active ? "true" : "false");
    });
    $$("[data-controls-page]").forEach(page => {
      page.classList.toggle("active", page.dataset.controlsPage === target);
    });
  }

  function activateWindowControlsTab(name) {
    const target = ["game-menu","mini-map","items","browse","selector","devices","inventory","messages","equipment","character","skills","abilities","spellbook","mimic-powers","combat-stances","melee-techniques","ranged-techniques","dragon-breath","runecraft","ghost-powers"].includes(name) ? name : "inventory";
    state.windowControlsTab = target;
    $$('[data-window-controls-tab]').forEach(button => {
      const active = button.dataset.windowControlsTab === target;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", active ? "true" : "false");
    });
    $$('[data-window-controls-page]').forEach(page => {
      page.classList.toggle("active", page.dataset.windowControlsPage === target);
    });
  }

  $(".controls-tabs").addEventListener("click", e => {
    const button = e.target.closest("[data-controls-tab]");
    if (!button) return;
    activateControlsTab(button.dataset.controlsTab);
    persist();
  });

  $(".window-controls-tabs").addEventListener("click", e => {
    const button = e.target.closest("[data-window-controls-tab]");
    if (!button || button.disabled) return;
    activateWindowControlsTab(button.dataset.windowControlsTab);
    persist();
  });

  $(".character-tabs").addEventListener("click", e => {
    const button = e.target.closest("[data-character-tab]");
    if (!button) return;
    setCharacterPage(button.dataset.characterTab);
  });

  itemFeature = window.TomeNetPrototype.createItemsFeature({
    state,$, $$, clamp, escapeHtml, INVENTORY_ITEMS, INVENTORY_ICONS, EQUIPMENT_ITEMS, TERM_COLORS, BAGS, FLOOR_ITEMS,
    mapCanvas, mapViewport, mapPointerCell, mapState, renderMap,
    openMapChatEditor,appendGameMessage,windowManager,itemUseFeature,itemDeviceFeature,itemEquipFeature,rangedActionFeature,PLAYER_GOLD,formatNumber,
    getItemSelectorFeature:() => itemSelectorFeature,
    getCombinedItemsFeature:() => combinedItemsWindowFeature,getBrowseFeature:() => browseWindowFeature
  });
  equipmentWindowFeature = window.TomeNetPrototype.createEquipmentWindowFeature({
    state,$,$$,clamp,persist,EQUIPMENT_ITEMS,windowManager,
    openItemContextMenu:itemFeature.openItemContextMenu,
    closeItemContextMenu:itemFeature.closeItemContextMenu,
    invokeItemActionForRow:itemFeature.invokeItemActionForRow,
    getCombinedItemsFeature:() => combinedItemsWindowFeature
  });
  browseWindowFeature = window.TomeNetPrototype.createBrowseWindowFeature({
    state,$,$$,clamp,escapeHtml,INVENTORY_ITEMS,INVENTORY_ICONS,BAGS,windowManager,
    openItemContextMenu:itemFeature.openItemContextMenu,
    closeItemContextMenu:itemFeature.closeItemContextMenu,
    invokeItemActionForRow:itemFeature.invokeItemActionForRow,spellbookFeature:spellbookWindowFeature
  });
  combinedItemsWindowFeature = window.TomeNetPrototype.createCombinedItemsWindowFeature({
    state,$,$$,clamp,EQUIPMENT_ITEMS,INVENTORY_ITEMS,windowManager,
    openItemContextMenu:itemFeature.openItemContextMenu,
    closeItemContextMenu:itemFeature.closeItemContextMenu,
    invokeItemActionForRow:itemFeature.invokeItemActionForRow,
    getInventoryFeature:() => itemFeature,
    getEquipmentFeature:() => equipmentWindowFeature
  });
  itemSelectorFeature = window.TomeNetPrototype.createItemSelectorFeature({
    state,$,$$,escapeHtml,INVENTORY_ITEMS,INVENTORY_ICONS,EQUIPMENT_ITEMS,EQUIPMENT_ICONS,TERM_COLORS,BAGS,FLOOR_ITEMS,windowManager,
    canInvokeSelectionAction:itemFeature.canInvokeSelectionAction,
    getSelectionActionAvailability:itemFeature.getSelectionActionAvailability,
    invokeSelectionAction:itemFeature.invokeSelectionAction
  });
  const {handleKeydown:handleEquipmentWindowKeydown,applyControls:applyEquipmentWindowControls} = equipmentWindowFeature;
  const {handleKeydown:handleCombinedItemsKeydown,applyControls:applyCombinedItemsControls} = combinedItemsWindowFeature;
  const {handleKeydown:handleBrowseKeydown,applyControls:applyBrowseControls} = browseWindowFeature;
  $("#messagesWidgetTitle").addEventListener("click",event => messageFeature.openHistory(state.rightPanelMessageMode,event.currentTarget));
  $("#inventoryWidgetTitle").addEventListener("click",event => {
    if(state.combinedItemsWindow)combinedItemsWindowFeature.openSection("inventory",event.currentTarget);
    else itemFeature.openInventoryWindow(event.currentTarget);
  });
  $("#equipmentWidgetTitle").addEventListener("click",event => {
    if(state.combinedItemsWindow)combinedItemsWindowFeature.openSection("equipment",event.currentTarget);
    else equipmentWindowFeature.openWindow(event.currentTarget);
  });
  $("#bagsWidgetTitle").addEventListener("click",event => browseWindowFeature.openBrowse(event.currentTarget));
  $("#characterWidgetTitle").addEventListener("click",event => characterWindowFeature.openWindow(event.currentTarget));
  mapCanvas.addEventListener("pointerdown", event => {
    mapCanvas.focus();
    if (locateFeature?.isOpen() || lookFeature?.isOpen() || !event.shiftKey || event.button !== 0 || itemFeature?.getThrowTarget()) return;
    event.preventDefault();
    mapCanvas.setPointerCapture(event.pointerId);
    mapCanvas.classList.add("is-panning");
    mapState.drag = {pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,cameraX:mapState.cameraX,cameraY:mapState.cameraY};
  });
  mapCanvas.addEventListener("pointermove", event => {
    if (mapState.drag?.pointerId === event.pointerId) {
      const rect = mapCanvas.getBoundingClientRect();
      const viewport = mapViewport();
      mapState.cameraX = mapState.drag.cameraX - (event.clientX - mapState.drag.startX) / (rect.width / viewport.width);
      mapState.cameraY = mapState.drag.cameraY - (event.clientY - mapState.drag.startY) / (rect.height / viewport.height);
      clampMapCamera();
      state.mapFollow = false;
      mapState.returnToPlayerOnMove = true;
      applyMapControls();
      renderMap();
      return;
    }
    const pointer = mapPointerCell(event.clientX,event.clientY);
    mapState.hover = pointer ? {x:pointer.x,y:pointer.y} : null;
    showMapCellInfo(pointer ? mapCellAt(pointer.x,pointer.y) : null);
    renderMap();
  });
  function finishMapPan(event) {
    if (mapState.drag?.pointerId !== event.pointerId) return;
    if (mapCanvas.hasPointerCapture(event.pointerId)) mapCanvas.releasePointerCapture(event.pointerId);
    mapState.drag = null;
    mapCanvas.classList.remove("is-panning");
    persist();
  }
  mapCanvas.addEventListener("pointerup", finishMapPan);
  mapCanvas.addEventListener("pointercancel", finishMapPan);
  mapCanvas.addEventListener("pointerleave", () => {
    if (mapState.drag) return;
    mapState.hover = null;
    showMapCellInfo(null);
    renderMap();
  });

  inputRouter.registerHandler("system-overlay",700,() => Boolean(windowManager.top("system")));
  inputRouter.registerHandler("chat-editor",600,event => {
    if (mapChatEditor.hidden) return false;
    if (event.key === "Escape") { closeMapChatEditor();return true; }
    return false;
  });
  inputRouter.registerHandler("prototype-controls",500,event => {
    if (!windowManager.has("prototype-controls")) return false;
    if (event.key === "Escape") windowManager.closeKind("prototype-controls");
    return true;
  });
  inputRouter.registerHandler("message-history",450,event => handleMessageKeydown(event));
  inputRouter.registerHandler("locate",448,event => locateFeature.handleKeydown(event));
  inputRouter.registerHandler("look",447,event => lookFeature.handleKeydown(event));
  inputRouter.registerHandler("guide-window",440,event => guideWindowFeature.handleKeydown(event));
  inputRouter.registerHandler("mimic-powers-window",439,event => handleMimicPowersKeydown(event));
  inputRouter.registerHandler("combat-stances-window",439,event => handleCombatStancesKeydown(event));
  inputRouter.registerHandler("melee-techniques-window",439,event => handleMeleeTechniquesKeydown(event));
  inputRouter.registerHandler("ranged-techniques-window",439,event => handleRangedTechniquesKeydown(event));
  inputRouter.registerHandler("dragon-breath-window",439,event => handleDragonBreathKeydown(event));
  inputRouter.registerHandler("runecraft-window",439,event => handleRunecraftKeydown(event));
  inputRouter.registerHandler("spellbook-window",438,event => handleSpellbookKeydown(event));
  inputRouter.registerHandler("abilities-window",435,event => handleAbilitiesWindowKeydown(event));
  inputRouter.registerHandler("skills-window",430,event => handleSkillsWindowKeydown(event));
  inputRouter.registerHandler("mini-map",427,event => miniMapFeature.handleKeydown(event));
  inputRouter.registerHandler("character-window",425,event => handleCharacterWindowKeydown(event));
  inputRouter.registerHandler("item-windows",400,event => {
    const editing = event.target.matches("input, textarea, select");
    if (itemSelectorFeature.handleKeydown(event,editing)) return true;
    if (event.key === "Escape" && itemFeature.handleEscape()) return true;
    if (itemFeature.handleKeydown(event,editing)) return true;
    if (handleBrowseKeydown(event,editing)) return true;
    if (handleCombinedItemsKeydown(event,editing)) return true;
    return handleEquipmentWindowKeydown(event,editing);
  });
  inputRouter.registerHandler("game-menu",350,event => gameMenuFeature.handleKeydown(event));
  inputRouter.registerHandler("open-chat",300,event => {
    const editing = event.target.matches("input, textarea, select");
    if (event.key !== ":" || editing || !windowManager.chatAllowed()) return false;
    openMapChatEditor();
    return true;
  });
  inputRouter.registerHandler("gameplay",0,event => {
    const editing = event.target.matches("input, textarea, select");
    if (event.key === "Escape" && editing) { event.target.blur();return true; }
    if (editing || windowManager.gameplayBlocked()) return false;
    if (activityActionsFeature.handleKeydown(event)) return true;
    if (event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) return false;
    if (event.key === "Home") { recenterMapCamera(true);persist();return true; }
    const movement = mapMovementDelta(event);
    if (!movement) return false;
    moveMapPlayer(movement[0],movement[1]);
    return true;
  });
  inputRouter.start();

  $("#leftWidth").addEventListener("input", e => { state.leftWidth = +e.target.value; applyLayout(); persist(); });
  $("#rightWidth").addEventListener("input", e => { state.rightWidth = +e.target.value; applyLayout(); persist(); });
  $("#mapGridControl").addEventListener("change", e => { state.mapGrid = e.target.checked;applyMapControls();renderMap();persist(); });
  $("#mapCellInfoControl").addEventListener("change", e => { state.mapCellInfo = e.target.checked;applyMapControls();showMapCellInfo(mapState.hover ? mapCellAt(mapState.hover.x,mapState.hover.y) : null);persist(); });
  $("#mapFollowControl").addEventListener("change", e => { state.mapFollow = e.target.checked;mapState.returnToPlayerOnMove = false;if (state.mapFollow) recenterMapCamera(false);applyMapControls();renderMap();persist(); });
  $("#mapViewportWidthControl").addEventListener("input", e => { setMapViewport(+e.target.value,state.mapViewportHeight);persist(); });
  $("#mapViewportHeightControl").addEventListener("input", e => { setMapViewport(state.mapViewportWidth,+e.target.value);persist(); });
  $("#mapRecenterControl").addEventListener("click", () => { recenterMapCamera(true);persist(); });
  $("#mapResetPlayerControl").addEventListener("click", () => { resetMapPlayer();persist(); });
  $("#locateDemoOpen").addEventListener("click", () => {
    windowManager.closeKind("prototype-controls",{restoreFocus:false,force:true});
    requestAnimationFrame(() => locateFeature.open($("#openControls")));
  });
  $("#lookAvailabilityControl").addEventListener("change",e => { state.lookAvailability=e.target.value;lookFeature.applyControls();persist(); });
  $("#lookDemoOpen").addEventListener("click", () => {
    windowManager.closeKind("prototype-controls",{restoreFocus:false,force:true});
    requestAnimationFrame(() => lookFeature.open($("#openControls")));
  });
  $("#pingControl").addEventListener("input", e => { state.ping = +e.target.value; applyVitals(); persist(); });
  $("#hpControl").addEventListener("input", e => { state.hp = +e.target.value; applyVitals();dragonBreathFeature.refreshAvailability();persist(); });
  $("#mpControl").addEventListener("input", e => { state.mp = +e.target.value; applyVitals();runecraftFeature.refreshPreview();persist(); });
  $("#stControl").addEventListener("input", e => { state.st = +e.target.value; applyVitals();meleeTechniquesFeature.refreshAvailability();rangedTechniquesFeature.refreshAvailability();dragonBreathFeature.refreshAvailability();persist(); });
  $("#sanityControl").addEventListener("input", e => { state.sanity = +e.target.value; applyVitals(); persist(); });
  $("#sanityDisplayControl").addEventListener("change", e => { state.sanityDisplay = e.target.value; applyVitals(); persist(); });
  $("#wideHpControl").addEventListener("change", e => { state.wideHp = e.target.checked; applyVitals(); persist(); });
  $("#wideMpControl").addEventListener("change", e => { state.wideMp = e.target.checked; applyVitals(); persist(); });
  $("#wideSanityControl").addEventListener("change", e => { state.wideSanity = e.target.checked; applyVitals(); persist(); });
  $("#wideVitalValuesControl").addEventListener("change", e => { state.wideVitalValues = e.target.checked; applyVitals(); persist(); });
  $("#enemyPresentControl").addEventListener("change", e => { state.enemyPresent = e.target.checked; applyEnemyHealth(); persist(); });
  $("#enemyHealthControl").addEventListener("input", e => { state.enemyHealth = +e.target.value; applyEnemyHealth(); persist(); });
  $("#leftPanelOrderControls").addEventListener("change", e => {
    const checkbox = e.target.closest("[data-left-panel-visible]");
    if (!checkbox) return;
    state.leftPanelVisibility[checkbox.dataset.leftPanelVisible] = checkbox.checked;
    applyLeftPanel();
    applyVitals();
    persist();
  });
  $("#leftPanelOrderControls").addEventListener("click", e => {
    const button = e.target.closest("[data-left-order-move]");
    if (!button || button.disabled) return;
    const index = state.leftPanelOrder.indexOf(button.dataset.leftOrderId);
    const target = index + (button.dataset.leftOrderMove === "up" ? -1 : 1);
    if (index < 0 || target < 0 || target >= state.leftPanelOrder.length) return;
    [state.leftPanelOrder[index],state.leftPanelOrder[target]] = [state.leftPanelOrder[target],state.leftPanelOrder[index]];
    applyLeftPanel();
    persist();
  });
  $("#rightPanelHeadersHiddenControl").addEventListener("change", e => { state.rightPanelHeadersHidden = e.target.checked; applyRightPanel(); persist(); });
  $("#rightPanelHeaderHeightControl").addEventListener("input", e => { state.rightPanelHeaderHeight = +e.target.value; applyRightPanel(); persist(); });
  $("#msgChatVisibleControl").addEventListener("change", e => {
    state.msgChatVisible = e.target.checked;
    applyRightPanel();
    if (state.msgChatVisible) scrollMessagesToBottom("msgChatWidget");
    persist();
  });
  $("#msgChatRowsControl").addEventListener("input", e => { state.msgChatRows = +e.target.value; applyRightPanel(); persist(); });
  $("#msgChatFontSizeControl").addEventListener("input", e => { state.msgChatFontSize = +e.target.value; applyRightPanel(); persist(); });
  $("#rightPanelMessageModeControl").addEventListener("change", e => setPinnedMessageMode(e.target.value));
  $("#messageHistoryFontSizeControl").addEventListener("input", e => { state.messageHistoryFontSize = +e.target.value; applyHistoryControls(); persist(); });
  $("#messageHistoryOpacityControl").addEventListener("input", e => { state.messageHistoryOpacity = +e.target.value; applyHistoryControls(); persist(); });
  $("#messageHistoryDataStateControl").addEventListener("change", e => { state.messageHistoryDataState = e.target.value; applyHistoryControls(); persist(); });
  $("#messageHistoryAppendDemoControl").addEventListener("click", appendDemoMessage);
  $("#gameMenuDemoOpen").addEventListener("click", () => {
    windowManager.closeKind("prototype-controls",{restoreFocus:false,force:true});
    requestAnimationFrame(() => gameMenuFeature.openWindow($("#openControls")));
  });
  $("#miniMapContextControl").addEventListener("change", e => { state.miniMapContext = e.target.value;miniMapFeature.applyControls();persist(); });
  $("#miniMapDataStateControl").addEventListener("change", e => { state.miniMapDataState = e.target.value;miniMapFeature.applyControls();persist(); });
  $("#miniMapDemoOpen").addEventListener("click", () => {
    windowManager.closeKind("prototype-controls",{restoreFocus:false,force:true});
    requestAnimationFrame(() => miniMapFeature.openWindow($("#openControls")));
  });
  $("#inventoryVisibleControl").addEventListener("change", e => { state.inventoryVisible = e.target.checked; applyRightPanel(); persist(); });
  $("#inventoryFontSizeControl").addEventListener("input", e => { state.inventoryFontSize = +e.target.value; applyRightPanel(); persist(); });
  $("#inventoryWindowFontSizeControl").addEventListener("input", e => { state.inventoryWindowFontSize = +e.target.value; applyRightPanel(); applyCombinedItemsControls(); persist(); });
  $("#characterWindowFontSizeControl").addEventListener("input", e => { state.characterWindowFontSize = +e.target.value; applyCharacterWindowControls(); persist(); });
  $("#skillsWindowFontSizeControl").addEventListener("input", e => { state.skillsWindowFontSize = +e.target.value; applySkillsWindowControls(); persist(); });
  $("#skillsShowUnavailableControl").addEventListener("change", e => { state.skillsShowUnavailable = e.target.checked; applySkillsWindowControls(); persist(); });
  $("#abilitiesWindowFontSizeControl").addEventListener("input", e => { state.abilitiesWindowFontSize = +e.target.value; applyAbilitiesWindowControls(); persist(); });
  $("#abilitiesExpandedControl").addEventListener("change", e => { state.abilitiesExpanded = e.target.checked; applyAbilitiesWindowControls(); persist(); });
  $("#abilitiesDemoOpen").addEventListener("click", () => {
    windowManager.closeKind("prototype-controls",{restoreFocus:false,force:true});
    requestAnimationFrame(() => abilitiesWindowFeature.openWindow($("#openControls")));
  });
  $("#spellbookWindowFontSizeControl").addEventListener("input", e => { state.spellbookWindowFontSize = +e.target.value; applySpellbookControls(); persist(); });
  $("#spellbookDemoOpen").addEventListener("click", () => {
    windowManager.closeKind("prototype-controls",{restoreFocus:false,force:true});
    requestAnimationFrame(() => spellbookWindowFeature.openBrowse($("#openControls")));
  });
  $("#mimicPowersFontSizeControl").addEventListener("input", e => { state.mimicPowersFontSize = +e.target.value; applyMimicPowersControls(); persist(); });
  $("#mimicPowersDemoOpen").addEventListener("click", () => {
    windowManager.closeKind("prototype-controls",{restoreFocus:false,force:true});
    requestAnimationFrame(() => mimicPowersFeature.openUse($("#openControls")));
  });
  $("#combatStancesFontSizeControl").addEventListener("input", e => { state.combatStancesFontSize = +e.target.value; applyCombatStancesControls(); persist(); });
  $("#stanceDemoLoadoutControl").addEventListener("change", e => { state.stanceDemoLoadout=e.target.value;applyCombatStancesControls({announce:true});persist(); });
  $("#combatStancesDemoOpen").addEventListener("click", () => {
    windowManager.closeKind("prototype-controls",{restoreFocus:false,force:true});
    requestAnimationFrame(() => combatStancesFeature.openUse($("#openControls")));
  });
  $("#meleeTechniquesFontSizeControl").addEventListener("input", e => { state.meleeTechniquesFontSize=+e.target.value;applyMeleeTechniquesControls();persist(); });
  $("#meleeTechniquesDemoOpen").addEventListener("click", () => {
    windowManager.closeKind("prototype-controls",{restoreFocus:false,force:true});
    requestAnimationFrame(() => meleeTechniquesFeature.openUse($("#openControls")));
  });
  $("#rangedTechniquesFontSizeControl").addEventListener("input", e => { state.rangedTechniquesFontSize=+e.target.value;applyRangedTechniquesControls();persist(); });
  $("#rangedDemoLauncherControl").addEventListener("change", e => { state.rangedDemoLauncher=e.target.value;applyRangedTechniquesControls();persist(); });
  $("#rangedDemoShieldControl").addEventListener("change", e => { state.rangedDemoShield=e.target.checked;applyRangedTechniquesControls();persist(); });
  $("#rangedDemoAmmoControl").addEventListener("input", e => { state.rangedDemoAmmo=+e.target.value;applyRangedTechniquesControls();persist(); });
  $("#rangedDemoAmmoConditionControl").addEventListener("change", e => { state.rangedDemoAmmoCondition=e.target.value;applyRangedTechniquesControls();persist(); });
  $("#rangedDemoAmmoProtectedControl").addEventListener("change", e => { state.rangedDemoAmmoProtected=e.target.checked;applyRangedTechniquesControls();persist(); });
  $("#rangedDemoOilControl").addEventListener("change", e => { state.rangedDemoOil=e.target.checked;applyRangedTechniquesControls();persist(); });
  $("#rangedDemoMaterialsControl").addEventListener("change", e => { state.rangedDemoMaterials=e.target.value;applyRangedTechniquesControls();persist(); });
  $("#rangedTechniquesDemoOpen").addEventListener("click", () => {
    windowManager.closeKind("prototype-controls",{restoreFocus:false,force:true});
    requestAnimationFrame(() => rangedTechniquesFeature.openUse($("#openControls")));
  });
  $("#dragonBreathFontSizeControl").addEventListener("input", e => { state.dragonBreathFontSize=+e.target.value;applyDragonBreathControls();persist(); });
  $("#dragonDemoLineageControl").addEventListener("change", e => { state.dragonDemoLineage=e.target.value;applyDragonBreathControls();persist(); });
  $("#dragonDemoFormControl").addEventListener("change", e => { state.dragonDemoForm=e.target.value;applyDragonBreathControls();persist(); });
  $("#dragonBreathDemoOpen").addEventListener("click", () => {
    windowManager.closeKind("prototype-controls",{restoreFocus:false,force:true});
    requestAnimationFrame(() => dragonBreathFeature.openElementPicker($("#openControls")));
  });
  $("#runecraftFontSizeControl").addEventListener("input", e => { state.runecraftFontSize=+e.target.value;applyRunecraftControls();persist(); });
  $("#runecraftDemoOpen").addEventListener("click", () => {
    windowManager.closeKind("prototype-controls",{restoreFocus:false,force:true});
    requestAnimationFrame(() => runecraftFeature.openDraw($("#openControls")));
  });
  $("#ghostDemoStateControl").addEventListener("change", e => {state.ghostDemoState=e.target.value;applyGhostPowersControls();persist();});
  $("#equipmentVisibleControl").addEventListener("change", e => { state.equipmentVisible = e.target.checked; applyRightPanel(); persist(); });
  $("#equipmentFontSizeControl").addEventListener("input", e => { state.equipmentFontSize = +e.target.value; applyRightPanel(); persist(); });
  $("#equipmentWindowFontSizeControl").addEventListener("input", e => { state.equipmentWindowFontSize = +e.target.value; applyEquipmentWindowControls(); applyCombinedItemsControls(); persist(); });
  $("#combinedItemsWindowControl").addEventListener("change", e => {
    state.combinedItemsWindow = e.target.checked;
    combinedItemsWindowFeature.applyModeChange(state.combinedItemsWindow);
    persist();
  });
  $("#browseWindowFontSizeControl").addEventListener("input", e => { state.browseWindowFontSize = +e.target.value;applyBrowseControls();persist(); });
  $("#browseDataStateControl").addEventListener("change", e => { state.browseDataState = e.target.value;applyBrowseControls();persist(); });
  $("#browseInventoryFullControl").addEventListener("change", e => { state.browseInventoryFull = e.target.checked;applyBrowseControls();persist(); });
  $("#itemSelectorDemoActionControl").addEventListener("change", e => { state.itemSelectorDemoAction = e.target.value;persist(); });
  $("#itemSelectorDemoOpen").addEventListener("click", () => {
    windowManager.closeKind("prototype-controls",{restoreFocus:false,force:true});
    requestAnimationFrame(() => itemSelectorFeature.openDemo(state.itemSelectorDemoAction,$("#openControls")));
  });
  $("#deviceOutcomeControl").addEventListener("change", e => { state.deviceOutcome = e.target.value;persist(); });
  $("#deviceReadinessControl").addEventListener("change", e => { state.deviceReadiness = e.target.value;persist(); });
  $("#deviceWrappingSkillControl").addEventListener("change", e => { state.deviceWrappingSkill = e.target.value;persist(); });
  $("#bagsVisibleControl").addEventListener("change", e => { state.bagsVisible = e.target.checked; applyRightPanel(); persist(); });
  $("#bagsFontSizeControl").addEventListener("input", e => { state.bagsFontSize = +e.target.value; applyRightPanel(); persist(); });
  $("#bagsRowLimitControl").addEventListener("input", e => { state.bagsRowLimit = +e.target.value; applyRightPanel(); persist(); });
  $("#characterVisibleControl").addEventListener("change", e => { state.characterVisible = e.target.checked; applyRightPanel(); persist(); });
  $("#characterHeightControl").addEventListener("input", e => { state.characterHeight = +e.target.value; applyRightPanel(); persist(); });
  $("#characterFontSizeControl").addEventListener("input", e => { state.characterFontSize = +e.target.value; applyRightPanel(); persist(); });
  $("#characterPageControl").addEventListener("change", e => setCharacterPage(e.target.value));
  $("#characterResistsLegendHiddenControl").addEventListener("change", e => { state.characterResistsLegendHidden = e.target.checked; renderCharacter(); persist(); });
  $("#rightPanelOrderControls").addEventListener("click", e => {
    const button = e.target.closest("[data-order-move]");
    if (!button || button.disabled) return;
    const index = state.rightPanelOrder.indexOf(button.dataset.orderId);
    const target = index + (button.dataset.orderMove === "up" ? -1 : 1);
    if (index < 0 || target < 0 || target >= state.rightPanelOrder.length) return;
    [state.rightPanelOrder[index],state.rightPanelOrder[target]] = [state.rightPanelOrder[target],state.rightPanelOrder[index]];
    applyRightPanel();
    persist();
  });
  $("#speedControl").addEventListener("input", e => { state.speed = +e.target.value; applyCombatStatuses(); persist(); });
  $("#speedBoostedControl").addEventListener("change", e => { state.speedBoosted = e.target.checked; applyCombatStatuses(); persist(); });
  $("#noTeleControl").addEventListener("change", e => { state.noTele = e.target.checked; applyCombatStatuses(); persist(); });
  $("#bprControl").addEventListener("input", e => { state.bpr = +e.target.value; applyCombatStatuses(); persist(); });
  $("#bprBoostedControl").addEventListener("change", e => { state.bprBoosted = e.target.checked; applyCombatStatuses(); persist(); });
  $("#bprModeControl").addEventListener("change", e => { state.bprMode = e.target.value; applyCombatStatuses(); persist(); });
  $("#shieldControl").addEventListener("change", e => { state.shield = e.target.value; applyCombatStatuses(); persist(); });
  $("#statusIndicatorControls").addEventListener("change", e => {
    const checkbox = e.target.closest("[data-indicator-control]");
    if (!checkbox) return;
    state.indicators[checkbox.dataset.indicatorControl] = checkbox.checked;
    applyCombatStatuses(); persist();
  });
  $("#conditionControls").addEventListener("change", e => {
    const select = e.target.closest("[data-condition-control]");
    if (!select) return;
    state.conditions[select.dataset.conditionControl] = select.value;
    applyCombatStatuses();rangedTechniquesFeature.refreshAvailability();dragonBreathFeature.refreshAvailability();runecraftFeature.refreshPreview();persist();
  });
  $("#levelControl").addEventListener("input", e => { state.xpLevel = +e.target.value; applyExperience(); skillsWindowFeature.refreshLimit();combatStancesFeature.refreshLevel();meleeTechniquesFeature.refreshAvailability();rangedTechniquesFeature.refreshAvailability();dragonBreathFeature.refreshAvailability();persist(); });
  $("#xpProgressControl").addEventListener("input", e => { state.xpProgress = +e.target.value; applyExperience(); persist(); });
  $("#drainedAmountControl").addEventListener("input", e => { state.xpDrainPercent = +e.target.value; applyExperience(); persist(); });
  $("#hideXpNumber").addEventListener("change", e => {
    state.xpHideNumber = e.target.checked;
    if (state.xpHideNumber) state.xpRemainingOnly = false;
    applyExperience(); persist();
  });
  $("#xpRemainingOnly").addEventListener("change", e => {
    state.xpRemainingOnly = e.target.checked;
    if (state.xpRemainingOnly) state.xpHideNumber = false;
    applyExperience(); persist();
  });
  $("#xpDrained").addEventListener("change", e => {
    state.xpDrained = e.target.checked;
    applyExperience(); persist();
  });
  $("#encumbranceControls").addEventListener("change", e => {
    const checkbox = e.target.closest("[data-enc-control]");
    if (!checkbox) return;
    const status = ENCUMBRANCE_STATUSES.find(item => item.id === checkbox.dataset.encControl);
    if (!status) return;
    if (checkbox.checked && status.group) {
      ENCUMBRANCE_STATUSES.filter(item => item.group === status.group).forEach(item => { state.encumbrance[item.id] = false; });
    }
    state.encumbrance[status.id] = checkbox.checked;
    applyEncumbrance(); persist();
  });

  $("#resetControls").addEventListener("click", () => {
    Object.assign(state, {
      leftWidth:defaultLeftWidth,rightWidth:defaultRightWidth,ping:193,hp:1912,mp:275,st:10,sanity:100,sanityDisplay:"word",wideHp:false,wideMp:false,wideSanity:false,wideVitalValues:true,enemyPresent:true,enemyHealth:72,
      speed:41,speedBoosted:false,noTele:false,bpr:4,bprBoosted:false,bprMode:"numeric",
      indicators:{...DEFAULT_INDICATORS},shield:"none",conditions:{...DEFAULT_CONDITIONS},
      xpLevel:57,xpProgress:68,xpHideNumber:false,xpDrained:false,
      xpDrainPercent:20,xpRemainingOnly:false,encumbrance:{...DEFAULT_ENCUMBRANCE},
      rightPanelHeadersHidden:false,rightPanelHeaderHeight:30,
      msgChatVisible:true,msgChatRows:10,msgChatFontSize:12,rightPanelMessageMode:"all",messageHistoryMode:"all",messageHistoryFontSize:14,messageHistoryOpacity:70,messageHistoryDataState:"ready",inventoryVisible:true,inventoryFontSize:12,inventoryWindowFontSize:14,equipmentVisible:false,equipmentFontSize:12,equipmentWindowFontSize:14,combinedItemsWindow:false,browseWindowFontSize:14,browseDataState:"ready",browseInventoryFull:false,itemSelectorDemoAction:"inspect",deviceOutcome:"success",deviceReadiness:"data",deviceWrappingSkill:"sufficient",bagsVisible:true,bagsFontSize:12,bagsRowLimit:BAGS_DEFAULT_ROW_LIMIT,
      characterVisible:true,characterHeight:30,characterFontSize:9,characterWindowFontSize:12,skillsWindowFontSize:12,skillsShowUnavailable:false,abilitiesWindowFontSize:12,abilitiesExpanded:true,spellbookWindowFontSize:12,mimicPowersFontSize:12,combatStancesFontSize:12,meleeTechniquesFontSize:12,rangedTechniquesFontSize:12,rangedDemoLauncher:"bow",rangedDemoShield:false,rangedDemoAmmo:42,rangedDemoAmmoCondition:"normal",rangedDemoAmmoProtected:false,rangedDemoOil:true,rangedDemoMaterials:"inventory",dragonBreathFontSize:12,dragonDemoLineage:"multi",dragonDemoForm:"native",runecraftFontSize:12,ghostDemoState:"living",stanceDemoLoadout:"shield",combatStance:"balanced",combatStanceRank:"STANDARD",dualWieldMode:"dual-hand",mycorrhiza:null,characterPage:"profile",characterSummaryPage:"profile",characterResistsLegendHidden:false,
      leftPanelVisibility:{...DEFAULT_LEFT_PANEL_VISIBILITY},leftPanelOrder:[...DEFAULT_LEFT_PANEL_ORDER],rightPanelOrder:[...DEFAULT_RIGHT_PANEL_ORDER],mapGrid:false,mapCellInfo:true,mapFollow:true,mapViewportWidth:66,mapViewportHeight:44,miniMapContext:"local",miniMapDataState:"ready",lookAvailability:"ready",cursorTheme:"mithril",controlsTab:"general",windowControlsTab:"inventory"
    });
    $("#itemSelectorDemoActionControl").value = state.itemSelectorDemoAction;
    $("#deviceOutcomeControl").value = state.deviceOutcome;
    $("#deviceReadinessControl").value = state.deviceReadiness;
    $("#deviceWrappingSkillControl").value = state.deviceWrappingSkill;
    skillsWindowFeature.resetSimulation();ghostPowersFeature.resetSimulation();mycorrhizaFeature.resetSimulation();trappingFeature.resetSimulation();abilitiesWindowFeature.resetSimulation();spellbookWindowFeature.resetSimulation();mimicPowersFeature.resetSimulation();combatStancesFeature.resetSimulation();meleeTechniquesFeature.resetSimulation();rangedTechniquesFeature.resetSimulation();dragonBreathFeature.resetSimulation();runecraftFeature.resetSimulation();miniMapFeature.resetSimulation();locateFeature.reset();lookFeature.reset();combinedItemsWindowFeature.applyModeChange(false);resetMapPlayer();buildMessageFeeds();applyLayout(); applyLeftPanel(); applyRightPanel(); applyHistoryControls(); applyCharacterWindowControls(); applySkillsWindowControls(); applyAbilitiesWindowControls(); applySpellbookControls(); applyMimicPowersControls(); applyCombatStancesControls(); applyMeleeTechniquesControls(); applyRangedTechniquesControls(); applyDragonBreathControls(); applyRunecraftControls(); applyGhostPowersControls(); applyEquipmentWindowControls(); applyCombinedItemsControls(); applyBrowseControls(); miniMapFeature.applyControls(); lookFeature.applyControls(); scrollMessagesToBottom(); applyVitals(); applyEnemyHealth(); applyCombatStatuses(); applyExperience(); applyEncumbrance(); applyCursorTheme(); activateControlsTab(state.controlsTab); activateWindowControlsTab(state.windowControlsTab); persist();
  });

  // Draggable splitters
  $$(".splitter").forEach(split => {
    split.addEventListener("pointerdown", e => {
      e.preventDefault();
      split.setPointerCapture(e.pointerId);
      split.classList.add("dragging");
      const startX = e.clientX;
      const startLeft = state.leftWidth;
      const startRight = state.rightWidth;
      const side = split.dataset.split;

      const move = ev => {
        const dx = ev.clientX - startX;
        if (side === "left") state.leftWidth = clamp(startLeft + dx, 220, 380);
        else state.rightWidth = clamp(startRight - dx, 320, 620);
        applyLayout();
      };
      const up = ev => {
        split.releasePointerCapture(ev.pointerId);
        split.classList.remove("dragging");
        split.removeEventListener("pointermove", move);
        split.removeEventListener("pointerup", up);
        persist();
      };
      split.addEventListener("pointermove", move);
      split.addEventListener("pointerup", up);
    });
  });

  buildEncumbranceUi();
  $("#goldValue").textContent = formatNumber.format(PLAYER_GOLD);
  buildMessageFeeds();
  buildInventoryUi();
  buildEquipmentUi();
  buildBagsUi();
  buildStatusUi();
  buildCursorControls();
  $("#itemSelectorDemoActionControl").value = state.itemSelectorDemoAction;
  $("#deviceOutcomeControl").value = state.deviceOutcome;
  $("#deviceReadinessControl").value = state.deviceReadiness;
  $("#deviceWrappingSkillControl").value = state.deviceWrappingSkill;
  initMap();
  miniMapFeature.applyControls();
  lookFeature.applyControls();
  applyLayout();
  applyLeftPanel();
  applyRightPanel();
  applyHistoryControls();
  applyCharacterWindowControls();
  applySkillsWindowControls();
  applyGhostPowersControls();
  applyAbilitiesWindowControls();
  applySpellbookControls();
  applyMimicPowersControls();
  applyCombatStancesControls();
  applyMeleeTechniquesControls();
  applyRangedTechniquesControls();
  applyDragonBreathControls();
  applyRunecraftControls();
  applyEquipmentWindowControls();
  applyCombinedItemsControls();
  applyBrowseControls();
  scrollMessagesToBottom();
  applyVitals();
  applyEnemyHealth();
  applyCombatStatuses();
  applyExperience();
  applyEncumbrance();
  activateControlsTab(state.controlsTab);
  activateWindowControlsTab(state.windowControlsTab);
  window.addEventListener("resize", applyRightPanel);
})();
