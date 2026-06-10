let gameData = {};
let lookups = {};
let questHeaders = [];
const form = document.querySelector("#questForm");
const output = document.querySelector("#questOutput");
const issues = document.querySelector("#issues");
const appLayout = document.querySelector("#appLayout");
const questListPanel = document.querySelector("#questListPanel");
const toggleQuestList = document.querySelector("#toggleQuestList");
const questListBody = document.querySelector("#questListBody");
const questListCount = document.querySelector("#questListCount");
const loadQuestFileButton = document.querySelector("#loadQuestFile");
const questFileInput = document.querySelector("#questFileInput");
const questImportStatus = document.querySelector("#questImportStatus");
const previewPanel = document.querySelector("#previewPanel");
const togglePreview = document.querySelector("#togglePreview");
const monsterformSearch = document.querySelector("#monsterformSearch");
const monsterformSuggestions = document.querySelector("#monsterformSuggestions");
const monsterformSelected = document.querySelector("#monsterformSelected");
const prerequisiteSearch = document.querySelector("#prerequisiteSearch");
const prerequisitesSelect = document.querySelector("#prerequisitesSelect");
const prerequisitesPreview = document.querySelector("#prerequisitesPreview");
const questorList = document.querySelector("#questorList");
const questorEditor = document.querySelector("#questorEditor");
const addQuestorButton = document.querySelector("#addQuestor");
const duplicateQuestorButton = document.querySelector("#duplicateQuestor");
const removeQuestorButton = document.querySelector("#removeQuestor");
const stageList = document.querySelector("#stageList");
const stageEditor = document.querySelector("#stageEditor");
const addStageButton = document.querySelector("#addStage");
const duplicateStageButton = document.querySelector("#duplicateStage");
const moveStageUpButton = document.querySelector("#moveStageUp");
const moveStageDownButton = document.querySelector("#moveStageDown");
const removeStageButton = document.querySelector("#removeStage");
const editorTabs = [...document.querySelectorAll("[data-editor-tab]")];
const editorTabPanels = [...document.querySelectorAll("[data-editor-tab-panel]")];

if (previewPanel?.classList.contains("is-folded")) {
  appLayout?.classList.add("preview-folded");
}

let selectedMonsterform = null;
let questors = [];
let selectedQuestorIndex = 0;
let stages = {};
let stageOrder = [];
let selectedStageId = "0";
let stageEntrySequence = 0;
const sharedStageId = "__shared__";
let sharedStage = null;
const defaultSpawnTimes = "1:1:1:1:1:1:1:1:1:-1:-1";
const defaultEndingRespawn = "0:0:0";
const spawnTimeBooleanFields = [
  "time_night",
  "time_day",
  "time_morning",
  "time_forenoon",
  "time_noon",
  "time_afternoon",
  "time_evening",
  "time_midnight",
  "time_deepnight",
];
let maskPickers = [];
const nameflagOptions = [
  { value: 1, label: "Male", description: "RF1_MALE" },
  { value: 2, label: "Female", description: "RF1_FEMALE" },
  { value: 4, label: "Pseudo-unique", description: "RF8_PSEUDO_UNIQUE" },
  { value: 8, label: "Plural", description: "RF8_PLURAL" },
  { value: 16, label: "Related to all", description: 'name behaves like "your ..."' },
];
const knownNameflagsMask = nameflagOptions.reduce((mask, option) => mask | option.value, 0);
const visualAttrOptions = [
  ["d", "d - Black / TERM_DARK"],
  ["D", "D - Dark Gray / TERM_L_DARK"],
  ["w", "w - White / TERM_WHITE"],
  ["W", "W - Light Gray / TERM_L_WHITE"],
  ["s", "s - Gray / TERM_SLATE"],
  ["r", "r - Red / TERM_RED"],
  ["R", "R - Light Red / TERM_L_RED"],
  ["g", "g - Green / TERM_GREEN"],
  ["G", "G - Light Green / TERM_L_GREEN"],
  ["b", "b - Blue / TERM_BLUE"],
  ["B", "B - Light Blue / TERM_L_BLUE"],
  ["v", "v - Violet / TERM_VIOLET"],
  ["o", "o - Orange / TERM_ORANGE"],
  ["u", "u - Brown / TERM_UMBER"],
  ["U", "U - Light Brown / TERM_L_UMBER"],
  ["y", "y - Yellow / TERM_YELLOW"],
];
const liteTypeOptions = [
  ["0", "0 - no light"],
  ["fire", "fire - fire/torch-style"],
  ["white", "white - white/Feanorian"],
  ["vampire", "vampire - vampire"],
];
const locationTypeOptions = [
  { value: 1, label: "World surface", description: "QI_SLOC_SURFACE" },
  { value: 2, label: "Town", description: "QI_SLOC_TOWN" },
  { value: 4, label: "Dungeon", description: "QI_SLOC_DUNGEON" },
];
const terrainOptions = [
  { value: 8, label: "Shore", description: "RF8_WILD_SHORE" },
  { value: 16, label: "Ocean", description: "RF8_WILD_OCEAN" },
  { value: 32, label: "Wasteland", description: "RF8_WILD_WASTE" },
  { value: 64, label: "Wood/forest", description: "RF8_WILD_WOOD" },
  { value: 128, label: "Volcano", description: "RF8_WILD_VOLCANO" },
  { value: 256, label: "Lake", description: "RF8_WILD_LAKE" },
  { value: 512, label: "Mountain", description: "RF8_WILD_MOUNTAIN" },
  { value: 1024, label: "Grassland", description: "RF8_WILD_GRASS" },
  { value: 524288, label: "Desert", description: "RF8_WILD_DESERT" },
  { value: 1048576, label: "Ice", description: "RF8_WILD_ICE" },
  { value: 1073741824, label: "Swamp", description: "RF8_WILD_SWAMP" },
  { value: 2147483648, label: "Any wilderness terrain", description: "RF8_WILD_TOO" },
];
const townOptions = [
  { value: 1, label: "Bree", description: "QI_STOWN_BREE" },
  { value: 2, label: "Gondolin", description: "QI_STOWN_GONDOLIN" },
  { value: 4, label: "Minas Anor", description: "QI_STOWN_MINASANOR" },
  { value: 8, label: "Lothlorien", description: "QI_STOWN_LOTHLORIEN" },
  { value: 16, label: "Khazad-dum", description: "QI_STOWN_KHAZADDUM" },
];
const dungeonFlag1Options = [
  { value: 1, label: "DF1_RANDOM_VEINS", description: "random treasure veins" },
  { value: 2, label: "DF1_MAZE", description: "maze-type dungeon" },
  { value: 4, label: "DF1_SMALLEST", description: "very small levels" },
  { value: 8, label: "DF1_SMALL", description: "small levels" },
  { value: 16, label: "DF1_BIG", description: "big levels" },
  { value: 32, label: "DF1_NO_DOORS", description: "rooms have no doors" },
  { value: 64, label: "DF1_WATER_RIVER", description: "one water river" },
  { value: 128, label: "DF1_LAVA_RIVER", description: "one lava river" },
  { value: 256, label: "DF1_WATER_RIVERS", description: "multiple water rivers" },
  { value: 512, label: "DF1_LAVA_RIVERS", description: "multiple lava rivers" },
  { value: 1024, label: "DF1_CAVE", description: "cave/room style" },
  { value: 2048, label: "DF1_CAVERN", description: "cavern style" },
  { value: 4096, label: "DF1_NO_UP", description: "disallow up stairs" },
  { value: 8192, label: "DF1_HOT_PLACE", description: "hot place" },
  { value: 16384, label: "DF1_COLD_PLACE", description: "cold place" },
  { value: 32768, label: "DF1_FORCE_DOWN", description: "forced down; hard mode 1 also adds this" },
  { value: 65536, label: "DF1_FORGET", description: "features are forgotten" },
  { value: 131072, label: "DF1_NO_DESTROY", description: "no destroyed levels" },
  { value: 262144, label: "DF1_SAND_VEIN", description: "sandworm-style veins" },
  { value: 524288, label: "DF1_CIRCULAR_ROOMS", description: "allow circular rooms" },
  { value: 1048576, label: "DF1_EMPTY", description: "arena/empty levels" },
  { value: 2097152, label: "DF1_UNLISTED", description: "not listed; runtime always adds this" },
  { value: 4194304, label: "DF1_FLAT", description: "flat/path style" },
  { value: 8388608, label: "DF1_TOWER", description: "tower traversal flag" },
  { value: 16777216, label: "DF1_RANDOM_TOWNS", description: "relic, not implemented" },
  { value: 33554432, label: "DF1_DOUBLE", description: "double-walled; not implemented" },
  { value: 67108864, label: "DF1_LIFE_LEVEL", description: "life algorithm; not implemented" },
  { value: 134217728, label: "DF1_EVOLVE", description: "evolving levels; not implemented" },
  { value: 268435456, label: "DF1_ADJUST_LEVEL_1", description: "not implemented" },
  { value: 536870912, label: "DF1_ADJUST_LEVEL_2", description: "not implemented" },
  { value: 1073741824, label: "DF1_NO_RECALL", description: "no recall" },
  { value: 2147483648, label: "DF1_STREAMERS", description: "streamers: water, lava, trees" },
];
const dungeonFlag2Options = [
  { value: 1, label: "DF2_RANDOM", description: "random dungeon; runtime always adds this" },
  { value: 2, label: "DF2_IRON", description: "one-way dungeon; hard mode 2 also adds this" },
  { value: 4, label: "DF2_HELL", description: "hellish dungeon" },
  { value: 8, label: "DF2_NO_RECALL_INTO", description: "cannot recall into this dungeon/tower" },
  { value: 16, label: "DF2_NO_MAGIC_MAP", description: "non magic-mappable" },
  { value: 32, label: "DF2_MISC_STORES", description: "low-level dungeon stores" },
  { value: 64, label: "DF2_TOWNS_IRONRECALL", description: "iron recall towns" },
  { value: 128, label: "DF2_NO_DEATH", description: "reduced death penalty" },
  { value: 256, label: "DF2_IRONFIX1", description: "iron recall every 250 ft" },
  { value: 512, label: "DF2_IRONFIX2", description: "iron recall every 500 ft" },
  { value: 1024, label: "DF2_IRONFIX3", description: "iron recall every 750 ft" },
  { value: 2048, label: "DF2_IRONFIX4", description: "iron recall every 1000 ft" },
  { value: 4096, label: "DF2_IRONRND1", description: "20% recall chance per level" },
  { value: 8192, label: "DF2_IRONRND2", description: "10% recall chance per level" },
  { value: 16384, label: "DF2_IRONRND3", description: "7% recall chance per level" },
  { value: 32768, label: "DF2_IRONRND4", description: "5% recall chance per level" },
  { value: 65536, label: "DF2_NO_ENTRY_STAIR", description: "cannot enter by stairs" },
  { value: 131072, label: "DF2_NO_ENTRY_WOR", description: "cannot enter by word-of-recall" },
  { value: 262144, label: "DF2_NO_ENTRY_PROB", description: "cannot enter by probability travel" },
  { value: 524288, label: "DF2_NO_ENTRY_FLOAT", description: "cannot enter by floating" },
  { value: 1048576, label: "DF2_NO_EXIT_STAIR", description: "cannot exit by stairs" },
  { value: 2097152, label: "DF2_NO_EXIT_WOR", description: "cannot exit by word-of-recall" },
  { value: 4194304, label: "DF2_NO_EXIT_PROB", description: "cannot exit by probability travel" },
  { value: 8388608, label: "DF2_NO_EXIT_FLOAT", description: "cannot exit by floating" },
  { value: 16777216, label: "DF2_NO_STAIRS_UP", description: "no up stairs inside" },
  { value: 33554432, label: "DF2_NO_STAIRS_DOWN", description: "no down stairs inside" },
  { value: 67108864, label: "DF2_TOWNS_FIX", description: "fixed generated towns" },
  { value: 134217728, label: "DF2_TOWNS_RND", description: "random generated towns" },
  { value: 268435456, label: "DF2_ADJUST_LEVEL_1_2", description: "not implemented" },
  { value: 536870912, label: "DF2_NO_SHAFT", description: "no shafts; currently disabled in source" },
  { value: 1073741824, label: "DF2_WALL_STREAMER_ADD", description: "extra wall streamers" },
  { value: 2147483648, label: "DF2_DELETED", description: "deleted, not yet removed" },
];
const dungeonFlag3Options = [
  { value: 1, label: "DF3_JAIL_DUNGEON", description: "display as Jail Dungeon" },
  { value: 2, label: "DF3_HIDDENLIB", description: "allow Hidden Library store" },
  { value: 4, label: "DF3_NO_SIMPLE_STORES", description: "disallow simple stores" },
  { value: 8, label: "DF3_NO_DUNGEON_BONUS", description: "no dungeon visit bonus" },
  { value: 16, label: "DF3_EXP_5", description: "+5% experience" },
  { value: 32, label: "DF3_EXP_10", description: "+10% experience" },
  { value: 64, label: "DF3_EXP_20", description: "+20% experience" },
  { value: 128, label: "DF3_LUCK_1", description: "+1 luck" },
  { value: 256, label: "DF3_LUCK_5", description: "+5 luck" },
  { value: 512, label: "DF3_LUCK_20", description: "+20 luck" },
  { value: 1024, label: "DF3_LUCK_PROG_IDDC", description: "progressive IDDC luck" },
  { value: 2048, label: "DF3_SHORT_IDDC", description: "half-length IDDC style" },
  { value: 4096, label: "DF3_DERARE_MONSTERS", description: "monster rarity treated as common" },
  { value: 8192, label: "DF3_MANY_MONSTERS", description: "1.5x monsters" },
  { value: 16384, label: "DF3_VMANY_MONSTERS", description: "2x monsters" },
  { value: 32768, label: "DF3_DEEPSUPPLY", description: "deep supply stores" },
  { value: 65536, label: "DF3_WALL_STREAMERS", description: "wall-type streamers" },
  { value: 131072, label: "DF3_NOT_EMPTY", description: "disallow arena levels" },
  { value: 262144, label: "DF3_NOT_WATERY", description: "no watery dungeon" },
  { value: 524288, label: "DF3_FEW_ROOMS", description: "fewer rooms" },
  { value: 1048576, label: "DF3_NO_VAULTS", description: "no vaults" },
  { value: 2097152, label: "DF3_NO_MAZE", description: "no mazes" },
  { value: 4194304, label: "DF3_OUTDOORS", description: "outdoors dungeon" },
  { value: 8388608, label: "DF3_NO_DESTROYED", description: "no destroyed levels" },
  { value: 16777216, label: "DF3_NO_TELE", description: "no teleportation" },
  { value: 33554432, label: "DF3_NO_ESP", description: "no ESP" },
  { value: 67108864, label: "DF3_NO_SUMMON", description: "no summoning" },
  { value: 134217728, label: "DF3_LIMIT_ESP", description: "limit ESP range" },
  { value: 268435456, label: "DF3_DARK", description: "all levels unlit" },
  { value: 536870912, label: "DF3_NO_DARK", description: "do not build unlit levels" },
  { value: 1073741824, label: "DF3_SALT_WATER", description: "salt water" },
  { value: 2147483648, label: "DF3_CYCLIC_STAIRS", description: "cyclic final stairs out" },
];
const dropTypeOptions = [
  { value: 1, label: "Regular monster loot", description: "drops bit 1" },
  { value: 2, label: "Specific item / reward / gold", description: "drops bit 2" },
];
const generatedRewardOptions = [
  ["0", "0 - none"],
  ["1", "1 - low power"],
  ["2", "2 - low-2 power"],
  ["3", "3 - mid power"],
  ["4", "4 - high power, no artifacts"],
  ["5", "5 - unrestricted, randarts allowed"],
];
const dungeonSpecialOptions = [
  { id: "0", name: "All wilderness/non-d_info dungeons" },
  { id: "255", name: "IDDC" },
];

function buildLookups(data) {
  const result = {};
  for (const [key, rows] of Object.entries(data)) {
    if (!Array.isArray(rows)) {
      continue;
    }

    result[key] = {
      byId: new Map(),
      byName: new Map(),
    };

    for (const row of rows || []) {
      result[key].byId.set(String(row.id), row);
      result[key].byName.set(String(row.name).toLowerCase(), row);
    }
  }
  return result;
}

async function loadJson(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status}`);
  }
  return response.json();
}

function refreshMaskPickers() {
  maskPickers = [
    {
      noun: "race",
      plural: "races",
      picker: document.querySelector("#racesPicker"),
      toggle: document.querySelector("#racesToggle"),
      panel: document.querySelector("#racesPanel"),
      summary: document.querySelector("#racesSummary"),
      all: document.querySelector("#raceAll"),
      checkboxes: [...document.querySelectorAll(".race-checkbox")],
      hiddenName: "races",
      preview: document.querySelector("#racesMaskPreview"),
    },
    {
      noun: "class",
      plural: "classes",
      picker: document.querySelector("#classesPicker"),
      toggle: document.querySelector("#classesToggle"),
      panel: document.querySelector("#classesPanel"),
      summary: document.querySelector("#classesSummary"),
      all: document.querySelector("#classAll"),
      checkboxes: [...document.querySelectorAll(".class-checkbox")],
      hiddenName: "classes",
      preview: document.querySelector("#classesMaskPreview"),
    },
  ];
}

function renderDatalists() {
  const sources = {
    monsterList: "monsters",
    monsterEgoList: "monsterEgos",
    itemList: "items",
    artifactList: "artifacts",
    egoItemList: "egoItems",
    featureList: "features",
    dungeonList: "dungeons",
    templateList: "templates",
  };

  for (const [listId, source] of Object.entries(sources)) {
    const list = document.getElementById(listId);
    if (!list) {
      continue;
    }

    const rows = Array.isArray(gameData[source]) ? gameData[source] : [];
    list.innerHTML = rows
      .map((record) => `<option value="${escapeHtml(record.name)}" data-id="${escapeHtml(record.id)}" label="${escapeHtml(record.id)}"></option>`)
      .join("");
  }
}

function renderMaskPickerOptions() {
  const pickerConfigs = [
    {
      rows: Array.isArray(gameData.races) ? gameData.races : [],
      panelId: "racesPanel",
      allId: "raceAll",
      allLabel: "All races",
      checkboxClass: "race-checkbox",
      inputName: "race_option",
      allMask: "FFFFF",
      pickerId: "racesPicker",
      hiddenName: "races",
    },
    {
      rows: Array.isArray(gameData.classes) ? gameData.classes : [],
      panelId: "classesPanel",
      allId: "classAll",
      allLabel: "All classes",
      checkboxClass: "class-checkbox",
      inputName: "class_option",
      allMask: "FFFF",
      pickerId: "classesPicker",
      hiddenName: "classes",
    },
  ];

  for (const config of pickerConfigs) {
    const panel = document.getElementById(config.panelId);
    const picker = document.getElementById(config.pickerId);
    if (!panel) {
      continue;
    }

    panel.innerHTML = [
      `<label class="picker-option">
        <input type="checkbox" id="${config.allId}" value="all" checked>
        <span>${config.allLabel}</span>
      </label>`,
      ...config.rows.map((row) => `
        <label class="picker-option">
          <input type="checkbox" class="${config.checkboxClass}" name="${config.inputName}" value="${escapeHtml(row.id)}" checked>
          <span>${escapeHtml(row.name)} (${escapeHtml(row.id)})</span>
        </label>
      `),
    ].join("");

    picker?.setAttribute("data-all-mask", config.allMask);
    setValue(config.hiddenName, config.allMask);
  }

  refreshMaskPickers();
}

function renderQuestList(quests) {
  if (questListCount) {
    questListCount.textContent = String(quests.length);
  }

  if (!questListBody) {
    return;
  }

  if (quests.length === 0) {
    questListBody.innerHTML = '<p class="empty-note">No quests found in q_info.txt.</p>';
    return;
  }

  questListBody.innerHTML = `
    <div class="quest-list">
      ${quests.map((quest, index) => `
        <button type="button" class="quest-list-item" data-quest-row="${index}">
          <strong>№${escapeHtml(quest.index || "0")}: ${escapeHtml(quest.name || "")}</strong>
          <span>code: ${escapeHtml(quest.codename || "")}</span>
          <span>author: ${escapeHtml(quest.creator || "")}</span>
        </button>
      `).join("")}
    </div>
  `;
}

function loadQuest(quest, button = null) {
  document.querySelectorAll(".quest-list-item").forEach((item) => item.classList.remove("is-active"));
  button?.classList.add("is-active");

  setValue("quest_index", quest.index || "0");
  setValue("codename", quest.codename || "");
  setValue("quest_name", quest.name || "");
  setValue("creator", quest.creator || "");
  setValue("repeatable", quest.repeatable || "-1");
  setValue("auto_accept", quest.autoAccept || "0");
  setValue("local", quest.local || "0");
  setValue("accept_stages", quest.acceptStages || "");
  setValue("prerequisites", quest.prerequisites || "");
  setSpawnTimes(quest.spawnTimes || defaultSpawnTimes);
  setEndingRespawn(quest.endingRespawn || defaultEndingRespawn);
  setQuestorsFromRaw(quest.questors || []);
  initializeStagesFromLegacy(quest.stages || {});
  renderPrerequisiteOptions();
  render();
}

function setQuestImportStatus(message = "", type = "") {
  if (!questImportStatus) {
    return;
  }

  questImportStatus.textContent = message;
  questImportStatus.hidden = message === "";
  questImportStatus.classList.toggle("is-error", type === "error");
  questImportStatus.classList.toggle("is-success", type === "success");
}

function resetEditorState() {
  form?.reset();
  selectedMonsterform = null;
  if (prerequisiteSearch) {
    prerequisiteSearch.value = "";
  }
  if (monsterformSearch) {
    monsterformSearch.value = "";
  }
  setValue("accept_stages", "");
  setValue("prerequisites", "");
  setValue("races", "FFFFF");
  setValue("classes", "FFFF");
  setSpawnTimes(defaultSpawnTimes);
  setEndingRespawn(defaultEndingRespawn);
  setQuestorsFromRaw([]);
  initializeStagesFromLegacy();
  renderPrerequisiteOptions();
  syncMaskPickers();
  renderMonsterformSelected();
  render();
}

function emptyRawStage() {
  return { a: "", af: [] };
}

function ensureRawStage(quest, stageId) {
  quest.stages[stageId] ??= emptyRawStage();
  return quest.stages[stageId];
}

function addRawStageLine(quest, stageId, line) {
  const stage = ensureRawStage(quest, stageId);
  stage.rawLines ??= [];
  stage.rawLines.push(line);
}

function validIntegerList(values, min = 1, max = 5) {
  return values.length >= min && values.length <= max && values.every((value) => /^-?\d+$/.test(value));
}

function parseQuestInfoText(text) {
  const quests = [];
  let currentQuest = null;
  let latestQuestItemByStage = {};
  let morphsByStageQuestor = {};
  let hostilitiesByStageQuestor = {};
  let actionsByStageQuestor = {};
  let dungeonsByStage = {};
  let latestMonsterSpawnByStage = {};
  let latestKeywordStage = null;
  let latestKeywordIndex = null;
  let latestReplyStage = null;
  let latestReplyIndex = null;
  let killGoalsByStageGoal = {};
  let retrieveGoalsByStageGoal = {};

  const resetQuestTrackers = () => {
    latestQuestItemByStage = {};
    morphsByStageQuestor = {};
    hostilitiesByStageQuestor = {};
    actionsByStageQuestor = {};
    dungeonsByStage = {};
    latestMonsterSpawnByStage = {};
    latestKeywordStage = null;
    latestKeywordIndex = null;
    latestReplyStage = null;
    latestReplyIndex = null;
    killGoalsByStageGoal = {};
    retrieveGoalsByStageGoal = {};
  };

  const ensureKillGoal = (stageId, goal) => {
    const stage = ensureRawStage(currentQuest, stageId);
    stage.k ??= [];
    const key = `${stageId}:${goal}`;
    if (killGoalsByStageGoal[key] === undefined) {
      stage.k.push({ goal, minlev: "", maxlev: "", number: "", names: "", ridx: "", reidx: "", visuals: "" });
      killGoalsByStageGoal[key] = stage.k.length - 1;
    }
    return killGoalsByStageGoal[key];
  };

  const ensureRetrieveGoal = (stageId, goal) => {
    const stage = ensureRawStage(currentQuest, stageId);
    stage.r ??= [];
    const key = `${stageId}:${goal}`;
    if (retrieveGoalsByStageGoal[key] === undefined) {
      stage.r.push({ goal, minValue: "", number: "", allowOwned: "", names: "", items: "", values: "" });
      retrieveGoalsByStageGoal[key] = stage.r.length - 1;
    }
    return retrieveGoalsByStageGoal[key];
  };

  const lines = String(text || "").replace(/\r\n?/g, "\n").split("\n").filter((line) => line !== "");

  for (const line of lines) {
    let match = line.match(/^N:([^:]*):([^:]*):([^:]*):([^:]*):([^:]*):([^:]*):([^:]*)/);
    if (match) {
      currentQuest = {
        index: match[1],
        codename: match[2],
        creator: match[3],
        name: match[4],
        repeatable: match[5],
        autoAccept: match[6],
        local: match[7],
        acceptStages: "",
        prerequisites: "",
        spawnTimes: "",
        endingRespawn: "",
        questors: [],
        stages: {},
      };
      quests.push(currentQuest);
      resetQuestTrackers();
      continue;
    }

    if (!currentQuest) {
      continue;
    }

    if ((match = line.match(/^C:(.*)$/))) {
      currentQuest.acceptStages = match[1];
      continue;
    }
    if ((match = line.match(/^E:(.*)$/))) {
      currentQuest.prerequisites = match[1];
      continue;
    }
    if ((match = line.match(/^T:(.*)$/))) {
      currentQuest.spawnTimes = match[1];
      continue;
    }
    if ((match = line.match(/^U:(.*)$/))) {
      currentQuest.endingRespawn = match[1];
      continue;
    }
    if ((match = line.match(/^Af:(\d+):(.*)$/))) {
      const stage = ensureRawStage(currentQuest, match[1]);
      stage.af ??= [];
      stage.af.push(match[2]);
      continue;
    }
    if ((match = line.match(/^A:(\d+):(.*)$/))) {
      ensureRawStage(currentQuest, match[1]).a = match[2];
      continue;
    }
    if ((match = line.match(/^X:(\d+):([^:]*):(.*)$/))) {
      const stage = ensureRawStage(currentQuest, match[1]);
      stage.xNarration ??= [];
      stage.xNarration.push({ flags: match[2], text: match[3] });
      continue;
    }
    if ((match = line.match(/^x:(\d+):([^:]*):(.*)$/))) {
      const stage = ensureRawStage(currentQuest, match[1]);
      stage.xLog ??= [];
      stage.xLog.push({ flags: match[2], text: match[3] });
      continue;
    }
    if ((match = line.match(/^W:([^:]*):(\d+):([^:]*):([^:]*):(.*)$/))) {
      const stage = ensureRawStage(currentQuest, match[2]);
      stage.w ??= [];
      stage.w.push({ questor: match[1], examine: match[3], flags: match[4], text: match[5] });
      continue;
    }
    if ((match = line.match(/^W:(.*)$/))) {
      addRawStageLine(currentQuest, "0", `W:${match[1]}`);
      continue;
    }
    if ((match = line.match(/^Wr:([^:]*):(\d+):(.*)$/))) {
      const stage = ensureRawStage(currentQuest, match[2]);
      stage.wr ??= [];
      stage.wr.push({ questor: match[1], text: match[3] });
      continue;
    }
    if ((match = line.match(/^Wr:(.*)$/))) {
      addRawStageLine(currentQuest, "0", `Wr:${match[1]}`);
      continue;
    }
    if ((match = line.match(/^Y:([^:]*):(-?\d+):([^:]*):([^:]*):([^:]*):(-?\d+)$/))) {
      const stage = ensureRawStage(currentQuest, match[2]);
      stage.y ??= [];
      stage.y.push({ questor: match[1], stage: match[2], flags: match[3], keyword: match[4], changeFlags: match[5], nextstage: match[6], yq: "", ys: "" });
      latestKeywordStage = match[2];
      latestKeywordIndex = stage.y.length - 1;
      continue;
    }
    if ((match = line.match(/^Y:(.*)$/))) {
      addRawStageLine(currentQuest, "0", `Y:${match[1]}`);
      latestKeywordStage = null;
      latestKeywordIndex = null;
      continue;
    }
    if ((match = line.match(/^YQ:(.*)$/))) {
      if (latestKeywordStage !== null && latestKeywordIndex !== null) {
        currentQuest.stages[latestKeywordStage].y[latestKeywordIndex].yq = match[1];
      } else {
        addRawStageLine(currentQuest, "0", `YQ:${match[1]}`);
      }
      continue;
    }
    if ((match = line.match(/^YS:(.*)$/))) {
      if (latestKeywordStage !== null && latestKeywordIndex !== null) {
        currentQuest.stages[latestKeywordStage].y[latestKeywordIndex].ys = match[1];
      } else {
        addRawStageLine(currentQuest, "0", `YS:${match[1]}`);
      }
      continue;
    }
    if ((match = line.match(/^y:([^:]*):(-?\d+):([^:]*):([^:]*)$/))) {
      const stage = ensureRawStage(currentQuest, match[2]);
      stage.yr ??= [];
      stage.yr.push({ questor: match[1], stage: match[2], flags: match[3], keyword: match[4], yy: "", yq: "", ys: "", replies: [] });
      latestReplyStage = match[2];
      latestReplyIndex = stage.yr.length - 1;
      continue;
    }
    if ((match = line.match(/^y:(.*)$/))) {
      addRawStageLine(currentQuest, "0", `y:${match[1]}`);
      latestReplyStage = null;
      latestReplyIndex = null;
      continue;
    }
    if ((match = line.match(/^yY:(.*)$/))) {
      if (latestReplyStage !== null && latestReplyIndex !== null) {
        currentQuest.stages[latestReplyStage].yr[latestReplyIndex].yy = match[1];
      } else {
        addRawStageLine(currentQuest, "0", `yY:${match[1]}`);
      }
      continue;
    }
    if ((match = line.match(/^yQ:(.*)$/))) {
      if (latestReplyStage !== null && latestReplyIndex !== null) {
        currentQuest.stages[latestReplyStage].yr[latestReplyIndex].yq = match[1];
      } else {
        addRawStageLine(currentQuest, "0", `yQ:${match[1]}`);
      }
      continue;
    }
    if ((match = line.match(/^yS:(.*)$/))) {
      if (latestReplyStage !== null && latestReplyIndex !== null) {
        currentQuest.stages[latestReplyStage].yr[latestReplyIndex].ys = match[1];
      } else {
        addRawStageLine(currentQuest, "0", `yS:${match[1]}`);
      }
      continue;
    }
    if ((match = line.match(/^yR:([^:]*):(.*)$/))) {
      if (latestReplyStage !== null && latestReplyIndex !== null) {
        currentQuest.stages[latestReplyStage].yr[latestReplyIndex].replies.push({ flags: match[1], text: match[2] });
      } else {
        addRawStageLine(currentQuest, "0", `yR:${match[1]}:${match[2]}`);
      }
      continue;
    }
    if ((match = line.match(/^k:(\d+):(-?\d+):(-?\d+):(-?\d+):(-?\d+)$/))) {
      const index = ensureKillGoal(match[1], match[2]);
      Object.assign(currentQuest.stages[match[1]].k[index], { minlev: match[3], maxlev: match[4], number: match[5] });
      continue;
    }
    if ((match = line.match(/^kN:(\d+):(-?\d+):(.+)$/))) {
      const index = ensureKillGoal(match[1], match[2]);
      currentQuest.stages[match[1]].k[index].names = match[3];
      continue;
    }
    if ((match = line.match(/^kI:(\d+):(-?\d+):(.+)$/))) {
      const index = ensureKillGoal(match[1], match[2]);
      currentQuest.stages[match[1]].k[index].ridx = match[3];
      continue;
    }
    if ((match = line.match(/^kE:(\d+):(-?\d+):(.+)$/))) {
      const index = ensureKillGoal(match[1], match[2]);
      currentQuest.stages[match[1]].k[index].reidx = match[3];
      continue;
    }
    if ((match = line.match(/^kV:(\d+):(-?\d+):(.+)$/))) {
      const index = ensureKillGoal(match[1], match[2]);
      currentQuest.stages[match[1]].k[index].visuals = match[3];
      continue;
    }
    if ((match = line.match(/^(k|kN|kI|kE|kV):(.*)$/))) {
      addRawStageLine(currentQuest, "0", `${match[1]}:${match[2]}`);
      continue;
    }
    if ((match = line.match(/^r:(\d+):(-?\d+):(-?\d+):(-?\d+):([01])$/))) {
      const index = ensureRetrieveGoal(match[1], match[2]);
      Object.assign(currentQuest.stages[match[1]].r[index], { minValue: match[3], number: match[4], allowOwned: match[5] });
      continue;
    }
    if ((match = line.match(/^rN:(\d+):(-?\d+):(.+)$/))) {
      const index = ensureRetrieveGoal(match[1], match[2]);
      currentQuest.stages[match[1]].r[index].names = match[3];
      continue;
    }
    if ((match = line.match(/^rI:(\d+):(-?\d+):(.+)$/))) {
      const index = ensureRetrieveGoal(match[1], match[2]);
      currentQuest.stages[match[1]].r[index].items = match[3];
      continue;
    }
    if ((match = line.match(/^rV:(\d+):(-?\d+):(.+)$/))) {
      const index = ensureRetrieveGoal(match[1], match[2]);
      currentQuest.stages[match[1]].r[index].values = match[3];
      continue;
    }
    if ((match = line.match(/^(r|rN|rI|rV):(.*)$/))) {
      addRawStageLine(currentQuest, "0", `${match[1]}:${match[2]}`);
      continue;
    }
    if ((match = line.match(/^P:(\d+):(-?\d+):(-?\d+):(-?\d+):(-?\d+):(-?\d+):(-?\d+):(-?\d+):(-?\d+):([^:]*):(-?\d+):(-?\d+)$/))) {
      const stage = ensureRawStage(currentQuest, match[1]);
      stage.p ??= [];
      stage.p.push({ goal: match[2], wx: match[3], wy: match[4], wz: match[5], terrainPatch: match[6], x: match[7], y: match[8], radius: match[9], map: match[10], mapX: match[11], mapY: match[12] });
      continue;
    }
    if ((match = line.match(/^G:(\d+):(\d+):(-?\d+(?::-?\d+){0,4})$/))) {
      const goals = match[3].split(":");
      if (validIntegerList(goals)) {
        const stage = ensureRawStage(currentQuest, match[1]);
        stage.g ??= [];
        stage.g.push({ nextStage: match[2], goals });
      } else {
        addRawStageLine(currentQuest, "0", `G:${match[1]}:${match[2]}:${match[3]}`);
      }
      continue;
    }
    if ((match = line.match(/^O:(\d+):(-?\d+):(-?\d+(?::-?\d+){0,4})$/))) {
      const goals = match[3].split(":");
      if (validIntegerList(goals)) {
        const stage = ensureRawStage(currentQuest, match[1]);
        stage.o ??= [];
        stage.o.push({ rewardIndex: match[2], goals });
      } else {
        addRawStageLine(currentQuest, "0", `O:${match[1]}:${match[2]}:${match[3]}`);
      }
      continue;
    }
    if ((match = line.match(/^(P|G|O):(.*)$/))) {
      addRawStageLine(currentQuest, "0", `${match[1]}:${match[2]}`);
      continue;
    }
    if ((match = line.match(/^R:(\d+):(-?\d+):(-?\d+):(-?\d+):(-?\d+):(-?\d+):(-?\d+):(-?\d+):([01]):([01]):([01]):([0-5]):(-?\d+):(-?\d+):(-?\d+)$/))) {
      const stage = ensureRawStage(currentQuest, match[1]);
      stage.reward ??= [];
      stage.reward.push({ tval: match[2], sval: match[3], pval: match[4], bpval: match[5], name1: match[6], name2: match[7], name2b: match[8], good: match[9], great: match[10], vgreat: match[11], reward: match[12], gold: match[13], exp: match[14], statusEffect: match[15] });
      continue;
    }
    if ((match = line.match(/^M:(\d+):(-?\d+):(-?\d+):(-?\d+):(-?\d+):(-?\d+):(-?\d+):(-?\d+):(-?\d+):(-?\d+):([^:]*):(-?\d+):(-?\d+)$/))) {
      const stage = ensureRawStage(currentQuest, match[1]);
      stage.mg ??= [];
      stage.mg.push({ goal: match[2], returnQuestor: match[3], wx: match[4], wy: match[5], wz: match[6], terrainPatch: match[7], x: match[8], y: match[9], radius: match[10], map: match[11], mapX: match[12], mapY: match[13] });
      continue;
    }
    if ((match = line.match(/^Z:(\d+):(-?\d+):([^:]*)$/))) {
      const stage = currentQuest.stages[match[1]];
      const validGoal = Boolean(stage && ["k", "r", "mg"].some((bucket) => (stage[bucket] || []).some((goalRow) => String(goalRow.goal || "") === match[2])));
      if (validGoal) {
        stage.z ??= [];
        stage.z.push({ goal: match[2], changeFlags: match[3] });
      } else {
        addRawStageLine(currentQuest, "0", `Z:${match[1]}:${match[2]}:${match[3]}`);
      }
      continue;
    }
    if ((match = line.match(/^(R|M|Z):(.*)$/))) {
      addRawStageLine(currentQuest, "0", `${match[1]}:${match[2]}`);
      continue;
    }
    if ((match = line.match(/^B:(\d+):(.*)$/))) {
      const stage = ensureRawStage(currentQuest, match[1]);
      stage.b ??= [];
      stage.b.push({ b: match[2], bl: "" });
      latestQuestItemByStage[match[1]] = stage.b.length - 1;
      continue;
    }
    if ((match = line.match(/^Bl:(\d+):(.*)$/))) {
      const stage = ensureRawStage(currentQuest, match[1]);
      if (latestQuestItemByStage[match[1]] !== undefined) {
        stage.b[latestQuestItemByStage[match[1]]].bl = match[2];
      } else {
        stage.blOrphans ??= [];
        stage.blOrphans.push(match[2]);
      }
      continue;
    }
    if ((match = line.match(/^m:(\d+):(.*)$/))) {
      const stage = ensureRawStage(currentQuest, match[1]);
      stage.b ??= [];
      stage.m ??= [];
      stage.m.push({ m: match[2], ml: "", mh: "" });
      latestMonsterSpawnByStage[match[1]] = stage.m.length - 1;
      continue;
    }
    if ((match = line.match(/^ml:(\d+):(.*)$/))) {
      const stage = ensureRawStage(currentQuest, match[1]);
      stage.b ??= [];
      if (latestMonsterSpawnByStage[match[1]] !== undefined) {
        stage.m[latestMonsterSpawnByStage[match[1]]].ml = match[2];
      } else {
        addRawStageLine(currentQuest, match[1], `ml:${match[1]}:${match[2]}`);
      }
      continue;
    }
    if ((match = line.match(/^mh:(\d+):(.*)$/))) {
      const stage = ensureRawStage(currentQuest, match[1]);
      stage.b ??= [];
      if (latestMonsterSpawnByStage[match[1]] !== undefined) {
        stage.m[latestMonsterSpawnByStage[match[1]]].mh = match[2];
      } else {
        addRawStageLine(currentQuest, match[1], `mh:${match[1]}:${match[2]}`);
      }
      continue;
    }
    if ((match = line.match(/^D:(\d+):(.*)$/))) {
      const stage = ensureRawStage(currentQuest, match[1]);
      stage.b ??= [];
      if (!dungeonsByStage[match[1]]) {
        stage.d = { d: match[2], dl: "" };
        dungeonsByStage[match[1]] = true;
      } else {
        addRawStageLine(currentQuest, match[1], `D:${match[1]}:${match[2]}`);
      }
      continue;
    }
    if ((match = line.match(/^Dl:(\d+):(.*)$/))) {
      const stage = ensureRawStage(currentQuest, match[1]);
      stage.b ??= [];
      if (stage.d && stage.d.dl === "") {
        stage.d.dl = match[2];
      } else {
        addRawStageLine(currentQuest, match[1], `Dl:${match[1]}:${match[2]}`);
      }
      continue;
    }
    if ((match = line.match(/^S:(\d+):([^:]*):(.*)$/))) {
      const stage = ensureRawStage(currentQuest, match[1]);
      stage.b ??= [];
      const key = `${match[1]}:${match[2]}`;
      if (!morphsByStageQuestor[key]) {
        stage.s ??= [];
        stage.s.push(`${match[2]}:${match[3]}`);
        morphsByStageQuestor[key] = true;
      } else {
        addRawStageLine(currentQuest, match[1], `S:${match[1]}:${match[2]}:${match[3]}`);
      }
      continue;
    }
    if ((match = line.match(/^H:(\d+):([^:]*):(.*)$/))) {
      const stage = ensureRawStage(currentQuest, match[1]);
      stage.b ??= [];
      const key = `${match[1]}:${match[2]}`;
      if (!hostilitiesByStageQuestor[key]) {
        stage.h ??= [];
        stage.h.push(`${match[2]}:${match[3]}`);
        hostilitiesByStageQuestor[key] = true;
      } else {
        addRawStageLine(currentQuest, match[1], `H:${match[1]}:${match[2]}:${match[3]}`);
      }
      continue;
    }
    if ((match = line.match(/^J:(\d+):([^:]*):(.*)$/))) {
      const stage = ensureRawStage(currentQuest, match[1]);
      stage.b ??= [];
      const key = `${match[1]}:${match[2]}`;
      if (!actionsByStageQuestor[key]) {
        stage.j ??= [];
        stage.j.push(`${match[2]}:${match[3]}`);
        actionsByStageQuestor[key] = true;
      } else {
        addRawStageLine(currentQuest, match[1], `J:${match[1]}:${match[2]}:${match[3]}`);
      }
      continue;
    }
    if ((match = line.match(/^Q:(.*)$/))) {
      currentQuest.questors.push({ q: match[1], l: "", ld: "", f: "", k: "" });
      continue;
    }
    if (currentQuest.questors.length > 0) {
      const questor = currentQuest.questors[currentQuest.questors.length - 1];
      if ((match = line.match(/^L:(.*)$/))) {
        questor.l = match[1];
        continue;
      }
      if ((match = line.match(/^Ld:(.*)$/))) {
        questor.ld = match[1];
        continue;
      }
      if ((match = line.match(/^F:(.*)$/))) {
        questor.f = match[1];
        continue;
      }
      if ((match = line.match(/^K:(.*)$/))) {
        questor.k = match[1];
        continue;
      }
    }
  }

  return quests;
}

function field(name) {
  return form.elements[name];
}

function value(name) {
  return field(name)?.value.trim() ?? "";
}

function setValue(name, nextValue) {
  const element = field(name);
  if (element) {
    element.value = String(nextValue);
  }
}

function setChecked(name, checked) {
  const element = field(name);
  if (element) {
    element.checked = checked;
  }
}

function selectedRecord(source, text, visible = null) {
  const lookup = lookups[source];
  if (!lookup) {
    return null;
  }

  const raw = String(text || "").trim();
  const list = visible?.list || document.getElementById(visible?.getAttribute("list") || "");
  const selectedOption = [...(list?.options || [])].find((option) => option.value.trim() === raw);
  const optionId = selectedOption?.dataset.id;
  if (optionId && lookup.byId.has(optionId)) {
    return lookup.byId.get(optionId);
  }

  const prefixedId = raw.match(/^(\d+)\s*[-:]/)?.[1];
  if (prefixedId && lookup.byId.has(prefixedId)) {
    return lookup.byId.get(prefixedId);
  }

  const directRecord = lookup.byName.get(raw.toLowerCase()) || lookup.byId.get(raw);
  if (directRecord) {
    return directRecord;
  }

  return null;
}

function syncSearchField(wrapper) {
  const source = wrapper.dataset.source;
  const emptyId = wrapper.dataset.emptyId || "";
  const visible = wrapper.querySelector(".search-select");
  const hidden = wrapper.querySelector('input[type="hidden"]');
  if (!source || !visible || !hidden) {
    return;
  }

  const record = selectedRecord(source, visible.value, visible);
  if (record) {
    hidden.value = record.id;
    visible.value = record.name;
    wrapper.dataset.selected = `${record.id}`;
    return;
  }

  if (visible.value.trim() === "") {
    hidden.value = emptyId;
    wrapper.dataset.selected = "";
    return;
  }

  if (wrapper.dataset.idOnly === "true") {
    hidden.value = emptyId;
    wrapper.dataset.selected = "unmatched";
    return;
  }

  hidden.value = visible.value.trim();
  wrapper.dataset.selected = "unmatched";
}

function hydrateSearchField(wrapper) {
  const source = wrapper.dataset.source;
  const visible = wrapper.querySelector(".search-select");
  const hidden = wrapper.querySelector('input[type="hidden"]');
  if (!source || !visible || !hidden) {
    return;
  }

  if (wrapper.dataset.emptyId !== undefined && hidden.value === wrapper.dataset.emptyId && visible.value.trim() === "") {
    wrapper.dataset.selected = "";
    return;
  }

  const record = lookups[source]?.byId.get(hidden.value);
  if (record && visible.value.trim() === "") {
    visible.value = record.name;
    wrapper.dataset.selected = `${record.id}`;
    return;
  }

  syncSearchField(wrapper);
}

function hydrateSearchFields() {
  document.querySelectorAll(".search-field").forEach(hydrateSearchField);
}

function syncSearchFields() {
  document.querySelectorAll(".search-field").forEach(syncSearchField);
}

function parseLiteValue(rawLite) {
  const liteNumber = Number.parseInt(String(rawLite || "0"), 10);
  if (!Number.isInteger(liteNumber) || liteNumber < 0 || liteNumber > 255) {
    return { type: "0", radius: "0", invalid: String(rawLite || "0") };
  }
  if (liteNumber === 0) {
    return { type: "0", radius: "0", invalid: "" };
  }
  if (liteNumber < 100) {
    return { type: "fire", radius: String(liteNumber), invalid: "" };
  }
  if (liteNumber < 200) {
    return { type: "white", radius: String(liteNumber - 100), invalid: "" };
  }
  return { type: "vampire", radius: String(liteNumber - 200), invalid: "" };
}

function liteValue(questor) {
  const radiusText = String(questor.liteRadius || "0");
  const radius = /^\d+$/.test(radiusText) ? Number.parseInt(radiusText, 10) : 0;
  if (questor.liteType === "fire") {
    return String(radius);
  }
  if (questor.liteType === "white") {
    return String(100 + radius);
  }
  if (questor.liteType === "vampire") {
    return String(200 + radius);
  }
  return "0";
}

function defaultQuestor() {
  return {
    type: "1",
    liteType: "0",
    liteRadius: "0",
    liteInvalid: "",
    name: "Questor",
    nameflags: "0",
    npc: { ridx: "37", reidx: "0", rmapcnt: "0", rcharidx: "37", rattr: "T", minlv: "-1", maxlv: "-1" },
    parchment: { sval: "0", attr: "P", level: "0" },
    object: {
      tval: "22",
      sval: "30",
      pval: "0",
      bpval: "0",
      name1: "0",
      name2: "0",
      name2b: "0",
      good: "0",
      great: "0",
      vgreat: "0",
      attr: "P",
      level: "0",
    },
    location: {
      loc: "0",
      terrains: "0",
      towns: "0",
      wx: "0",
      wy: "0",
      wz: "0",
      terrainPatch: "0",
      x: "0",
      y: "0",
      radius: "0",
      map: "-",
      mapX: "0",
      mapY: "0",
    },
    dungeon: { enabled: false, min: "0", max: "0", ids: "" },
    flags: { emit: true, acceptLos: "0", acceptInteract: "1", talkable: "1", despawned: "0", invincible: "1", staticFloor: "0", quitFloor: "0" },
    drops: {
      enabled: false,
      type: "0",
      tval: "0",
      sval: "0",
      pval: "0",
      bpval: "0",
      name1: "0",
      name2: "0",
      name2b: "0",
      good: "0",
      great: "0",
      vgreat: "0",
      reward: "0",
      gold: "0",
      exp: "-1",
    },
    raw: {},
  };
}

function cloneQuestor(questor) {
  return JSON.parse(JSON.stringify(questor));
}

function parseQuestorGroup(rawQuestor) {
  const questor = defaultQuestor();
  questor.raw = { ...rawQuestor };

  const q = String(rawQuestor.q || "").split(":");
  questor.type = q[0] || "1";
  const lite = parseLiteValue(q[1] || "0");
  questor.liteType = lite.type;
  questor.liteRadius = lite.radius;
  questor.liteInvalid = lite.invalid;
  if (questor.type === "1") {
    [questor.npc.ridx, questor.npc.reidx, questor.npc.rmapcnt, questor.npc.rcharidx, questor.npc.rattr, questor.npc.minlv, questor.npc.maxlv, questor.name, questor.nameflags] = [
      q[2] || "37", q[3] || "0", q[4] || "0", q[5] || "37", q[6] || "T", q[7] || "-1", q[8] || "-1", q[9] || "Questor", q[10] || "0",
    ];
  } else if (questor.type === "2") {
    [questor.parchment.sval, questor.parchment.attr, questor.parchment.level, questor.name, questor.nameflags] = [
      q[2] || "0", q[3] || "P", q[4] || "0", q[5] || "Parchment", q[6] || "0",
    ];
  } else if (questor.type === "3") {
    [
      questor.object.tval, questor.object.sval, questor.object.pval, questor.object.bpval,
      questor.object.name1, questor.object.name2, questor.object.name2b, questor.object.good,
      questor.object.great, questor.object.vgreat, questor.object.attr, questor.object.level,
      questor.name, questor.nameflags,
    ] = [
      q[2] || "0", q[3] || "0", q[4] || "0", q[5] || "0", q[6] || "0", q[7] || "0", q[8] || "0",
      q[9] || "0", q[10] || "0", q[11] || "0", q[12] || "P", q[13] || "0", q[14] || "Quest item", q[15] || "0",
    ];
  }

  const l = String(rawQuestor.l || "").split(":");
  if (l.length >= 13) {
    [
      questor.location.loc, questor.location.terrains, questor.location.towns, questor.location.wx,
      questor.location.wy, questor.location.wz, questor.location.terrainPatch, questor.location.x,
      questor.location.y, questor.location.radius, questor.location.map, questor.location.mapX, questor.location.mapY,
    ] = l.slice(0, 13);
  }

  const ld = String(rawQuestor.ld || "").split(":").filter((part) => part !== "");
  if (ld.length >= 3) {
    questor.dungeon.enabled = true;
    questor.dungeon.min = ld[0] || "0";
    questor.dungeon.max = ld[1] || "0";
    questor.dungeon.ids = ld.slice(2).join(":");
  }

  const f = String(rawQuestor.f || "").split(":");
  if (f.length >= 5) {
    questor.flags.emit = true;
    [questor.flags.acceptLos, questor.flags.acceptInteract, questor.flags.talkable, questor.flags.despawned, questor.flags.invincible] = f.slice(0, 5);
    questor.flags.staticFloor = f[5] || "0";
    questor.flags.quitFloor = f[6] || "0";
  }

  const k = String(rawQuestor.k || "").split(":");
  if (k.length >= 14) {
    questor.drops.enabled = true;
    [
      questor.drops.type, questor.drops.tval, questor.drops.sval, questor.drops.pval, questor.drops.bpval,
      questor.drops.name1, questor.drops.name2, questor.drops.name2b, questor.drops.good, questor.drops.great,
      questor.drops.vgreat, questor.drops.reward, questor.drops.gold, questor.drops.exp,
    ] = k.slice(0, 14);
  }

  return questor;
}

function questorTitle(questor, index) {
  const types = { "1": "NPC", "2": "parchment", "3": "item pickup", "0": "rumour", "4": "item touch" };
  return `#${index}: ${questor.name || "Questor"} (${types[questor.type] || `type ${questor.type}`})`;
}

function checkboxValue(name) {
  return field(name)?.checked ? "1" : "0";
}

function spawnTimeValues() {
  return [
    ...spawnTimeBooleanFields.map(checkboxValue),
    value("time_start") || "-1",
    value("time_stop") || "-1",
  ];
}

function setSpawnTimes(spawnTimes = defaultSpawnTimes) {
  const parts = String(spawnTimes || defaultSpawnTimes).split(":");
  const values = parts.length === 11 ? parts : defaultSpawnTimes.split(":");

  spawnTimeBooleanFields.forEach((name, index) => {
    setChecked(name, values[index] !== "0");
  });
  setValue("time_start", values[9] ?? "-1");
  setValue("time_stop", values[10] ?? "-1");
}

function setEndingRespawn(endingRespawn = defaultEndingRespawn) {
  const parts = String(endingRespawn || defaultEndingRespawn).split(":");
  const values = parts.length === 3 ? parts : defaultEndingRespawn.split(":");

  setValue("ending_stage", values[0] ?? "0");
  setValue("duration", values[1] ?? "0");
  setValue("cooldown", values[2] ?? "0");
}

function legacyStageReferences() {
  const stages = new Set(["0"]);

  for (const stage of value("accept_stages").split(":").filter(Boolean)) {
    if (/^\d+$/.test(stage) && Number(stage) <= 49) {
      stages.add(String(Number(stage)));
    }
  }

  const endingStage = value("ending_stage");
  if (/^\d+$/.test(endingStage) && Number(endingStage) <= 49) {
    stages.add(String(Number(endingStage)));
  }

  return [...stages].sort((a, b) => Number(a) - Number(b));
}

function defaultStageAutomatic() {
  return {
    enabled: false,
    activateQuest: "-1",
    autoAccept: "0",
    changeMode: "disabled",
    changeStage: "255",
    randomSteps: "1",
    ingameHour: "-1",
    realMinutes: "0",
    quiet: "0",
    flags: "-",
    genocideEnabled: false,
    wx: "-1",
    wy: "0",
    wz: "0",
  };
}

function parseStageAutomatic(raw) {
  const automatic = defaultStageAutomatic();
  const parts = String(raw || "").split(":");
  if (parts.length < 11) {
    return automatic;
  }
  automatic.enabled = true;
  [
    automatic.activateQuest,
    automatic.autoAccept,
    automatic.changeStage,
    ,
    automatic.ingameHour,
    automatic.realMinutes,
    automatic.quiet,
    automatic.flags,
    automatic.wx,
    automatic.wy,
    automatic.wz,
  ] = parts.slice(0, 11);
  const changeStage = Number(automatic.changeStage);
  automatic.changeMode = automatic.changeStage === "255" ? "disabled" : changeStage < 0 ? "random" : "exact";
  automatic.randomSteps = changeStage < 0 ? String(Math.abs(changeStage)) : "1";
  automatic.genocideEnabled = automatic.wx !== "-1";
  return automatic;
}

function defaultStageFeature() {
  return {
    source: "specific",
    questor: "255",
    questItem: "255",
    wx: "0",
    wy: "0",
    wz: "0",
    x: "0",
    y: "0",
    feature: "0",
  };
}

function parseStageFeature(raw) {
  const feature = defaultStageFeature();
  const parts = String(raw || "").split(":");
  if (parts.length < 8) {
    return feature;
  }
  [
    feature.questor,
    feature.questItem,
    feature.wx,
    feature.wy,
    feature.wz,
    feature.x,
    feature.y,
    feature.feature,
  ] = parts.slice(0, 8);
  feature.source = feature.questor !== "255"
    ? "questor"
    : feature.questItem !== "255"
      ? "questItem"
      : "specific";
  return feature;
}

function nextStageEntryId(prefix) {
  stageEntrySequence += 1;
  return `${prefix}-${stageEntrySequence}`;
}

function defaultQuestItem() {
  return {
    uiId: nextStageEntryId("quest-item"),
    pval: "0",
    char: "!",
    attr: "w",
    weight: "10",
    level: "0",
    name: "& Quest item~",
    delivery: "handout",
    questor: "0",
    location: {
      loc: "0", terrains: "0", towns: "0",
      wx: "0", wy: "0", wz: "0", terrainPatch: "0",
      x: "0", y: "0", radius: "0", map: "-", mapX: "0", mapY: "0",
    },
    missingBl: false,
  };
}

function parseQuestItem(raw) {
  const item = defaultQuestItem();
  const b = String(raw?.b || "").split(":");
  if (b.length >= 6) {
    [item.pval, item.char, item.attr, item.weight, item.level] = b.slice(0, 5);
    item.name = b.slice(5).join(":");
  }
  const bl = String(raw?.bl || "").split(":");
  item.missingBl = bl.length < 14;
  if (!item.missingBl) {
    item.questor = bl[0] || "-1";
    item.delivery = item.questor === "-1" ? "spawn" : "handout";
    [
      item.location.loc, item.location.terrains, item.location.towns,
      item.location.wx, item.location.wy, item.location.wz, item.location.terrainPatch,
      item.location.x, item.location.y, item.location.radius, item.location.map,
      item.location.mapX, item.location.mapY,
    ] = bl.slice(1, 14);
  }
  return item;
}

function defaultStageMonsterSpawn() {
  return {
    uiId: nextStageEntryId("monster-spawn"),
    amount: "1",
    groups: "0",
    scatter: "0",
    clones: "0",
    ridx: "0",
    reidx: "-1",
    rchar: "-",
    rattr: "-",
    rlevmin: "1",
    rlevmax: "1",
    name: "-",
    location: {
      loc: "0", terrains: "0", towns: "0",
      wx: "0", wy: "0", terrainPatch: "0",
      x: "0", y: "0", radius: "0", map: "-", mapX: "0", mapY: "0",
    },
    hostilityEnabled: false,
    hostilePlayer: "0",
    hostileQuestor: "0",
    invinciblePlayer: "0",
    invincibleQuestor: "0",
    targetPlayer: "0",
    targetQuestor: "0",
    missingMl: false,
  };
}

function parseStageMonsterSpawn(raw) {
  const spawn = defaultStageMonsterSpawn();
  const m = String(raw?.m || "").split(":");
  if (m.length >= 11) {
    [
      spawn.amount,
      spawn.groups,
      spawn.scatter,
      spawn.clones,
      spawn.ridx,
      spawn.reidx,
      spawn.rchar,
      spawn.rattr,
      spawn.rlevmin,
      spawn.rlevmax,
    ] = m.slice(0, 10);
    spawn.name = m.slice(10).join(":") || "-";
  }
  const ml = String(raw?.ml || "").split(":");
  spawn.missingMl = ml.length < 12;
  if (!spawn.missingMl) {
    [
      spawn.location.loc,
      spawn.location.terrains,
      spawn.location.towns,
      spawn.location.wx,
      spawn.location.wy,
      spawn.location.terrainPatch,
      spawn.location.x,
      spawn.location.y,
      spawn.location.radius,
      spawn.location.map,
      spawn.location.mapX,
      spawn.location.mapY,
    ] = ml.slice(0, 12);
  }
  const mh = String(raw?.mh || "").split(":");
  if (mh.length >= 6) {
    spawn.hostilityEnabled = true;
    [
      spawn.hostilePlayer,
      spawn.hostileQuestor,
      spawn.invinciblePlayer,
      spawn.invincibleQuestor,
      spawn.targetPlayer,
      spawn.targetQuestor,
    ] = mh.slice(0, 6);
  }
  return spawn;
}

function defaultKillGoal() {
  return {
    uiId: nextStageEntryId("kill-goal"),
    goal: "1",
    optional: false,
    changeFlags: "-",
    minlev: "0",
    maxlev: "0",
    number: "1",
    names: [],
    ridx: [],
    reidx: [],
    visuals: [],
    target: defaultGoalTarget(),
  };
}

function parseKillGoal(raw) {
  const goal = defaultKillGoal();
  const rawGoal = String(raw?.goal || "1");
  goal.optional = rawGoal.startsWith("-");
  goal.goal = String(Math.abs(Number(rawGoal)) || 1);
  goal.minlev = String(raw?.minlev !== "" && raw?.minlev !== undefined ? raw.minlev : "0");
  goal.maxlev = String(raw?.maxlev !== "" && raw?.maxlev !== undefined ? raw.maxlev : "0");
  goal.number = String(raw?.number !== "" && raw?.number !== undefined ? raw.number : "1");
  goal.names = String(raw?.names || "").split(":").filter(Boolean).slice(0, 5);
  goal.ridx = String(raw?.ridx || "").split(":").filter((part) => /^-?\d+$/.test(part)).slice(0, 10);
  goal.reidx = String(raw?.reidx || "").split(":").filter((part) => /^-?\d+$/.test(part)).slice(0, 10);
  const visualParts = String(raw?.visuals || "").split(":").filter((part) => part !== "");
  goal.visuals = [];
  for (let index = 0; index + 1 < visualParts.length && goal.visuals.length < 5; index += 2) {
    goal.visuals.push({
      uiId: nextStageEntryId("kill-visual"),
      char: visualParts[index] || "-",
      attr: visualParts[index + 1] || "-",
    });
  }
  return goal;
}

function defaultGoalTarget() {
  return {
    enabled: false,
    wx: "0",
    wy: "0",
    wz: "0",
    terrainPatch: "0",
    x: "-1",
    y: "0",
    radius: "0",
    map: "-",
    mapX: "0",
    mapY: "0",
  };
}

function parseGoalTarget(raw) {
  return {
    ...defaultGoalTarget(),
    enabled: true,
    wx: String(raw?.wx ?? "0"),
    wy: String(raw?.wy ?? "0"),
    wz: String(raw?.wz ?? "0"),
    terrainPatch: String(raw?.terrainPatch ?? "0"),
    x: String(raw?.x ?? "-1"),
    y: String(raw?.y ?? "0"),
    radius: String(raw?.radius ?? "0"),
    map: String(raw?.map || "-"),
    mapX: String(raw?.mapX ?? "0"),
    mapY: String(raw?.mapY ?? "0"),
  };
}

function defaultRetrieveGoal() {
  return {
    uiId: nextStageEntryId("retrieve-goal"),
    goal: "1",
    optional: false,
    changeFlags: "-",
    minValue: "0",
    number: "1",
    allowOwned: false,
    names: [],
    items: [],
    values: [],
    target: defaultGoalTarget(),
  };
}

function parseRetrieveGoal(raw) {
  const goal = defaultRetrieveGoal();
  const rawGoal = String(raw?.goal || "1");
  goal.optional = rawGoal.startsWith("-");
  goal.goal = String(Math.abs(Number(rawGoal)) || 1);
  goal.minValue = String(raw?.minValue !== "" && raw?.minValue !== undefined ? raw.minValue : "0");
  goal.number = String(raw?.number !== "" && raw?.number !== undefined ? raw.number : "1");
  goal.allowOwned = String(raw?.allowOwned || "0") === "1";
  goal.names = String(raw?.names || "").split(":").filter(Boolean).slice(0, 5);
  const itemParts = String(raw?.items || "").split(":").filter((part) => part !== "");
  goal.items = [];
  for (let index = 0; index + 1 < itemParts.length && goal.items.length < 10; index += 2) {
    goal.items.push(`${itemParts[index]}:${itemParts[index + 1]}`);
  }
  const valueParts = String(raw?.values || "").split(":").filter((part) => part !== "");
  goal.values = [];
  for (let index = 0; index + 5 < valueParts.length && goal.values.length < 5; index += 6) {
    goal.values.push({
      uiId: nextStageEntryId("retrieve-value"),
      pval: valueParts[index] || "-9999",
      bpval: valueParts[index + 1] || "-9999",
      attr: valueParts[index + 2] || "-",
      name1: valueParts[index + 3] || "-1",
      name2: valueParts[index + 4] || "-1",
      name2b: valueParts[index + 5] || "-1",
    });
  }
  return goal;
}

function attachGoalTargets(stage, rawTargets = []) {
  stage.goalTargets = Array.isArray(rawTargets)
    ? rawTargets.map((target) => ({ goal: String(target?.goal || ""), ...parseGoalTarget(target) }))
    : [];
  for (const target of stage.goalTargets) {
    const killGoal = stage.goals.find((goal) => killGoalQInfoNumber(goal) === String(target.goal));
    const retrieveGoal = stage.retrieveGoals.find((goal) => retrieveGoalQInfoNumber(goal) === String(target.goal));
    if (killGoal) {
      killGoal.target = { ...target, enabled: true };
    } else if (retrieveGoal) {
      retrieveGoal.target = { ...target, enabled: true };
    }
  }
}

function attachGoalChangeFlags(stage, rawChangeFlags = []) {
  const leftovers = [];
  const records = Array.isArray(rawChangeFlags) ? rawChangeFlags : [];
  for (const record of records) {
    const goalNumber = String(record?.goal || "");
    const changeFlags = String(record?.changeFlags || "-");
    const killGoal = stage.goals.find((goal) => killGoalQInfoNumber(goal) === goalNumber);
    const retrieveGoal = stage.retrieveGoals.find((goal) => retrieveGoalQInfoNumber(goal) === goalNumber);
    const deliveryGoal = stage.deliveryGoals.find((goal) => deliveryGoalQInfoNumber(goal) === goalNumber);
    if (killGoal) {
      killGoal.changeFlags = changeFlags;
    } else if (retrieveGoal) {
      retrieveGoal.changeFlags = changeFlags;
    } else if (deliveryGoal) {
      deliveryGoal.changeFlags = changeFlags;
    } else {
      leftovers.push(`Z:${stage.id}:${goalNumber}:${changeFlags}`);
    }
  }
  return leftovers;
}

function deliveryGoalQInfoNumber(goal) {
  const number = String(goal.goal || "1");
  return goal.optional ? `-${number}` : number;
}

function defaultDeliveryGoal() {
  return {
    uiId: nextStageEntryId("delivery-goal"),
    goal: "1",
    optional: false,
    changeFlags: "-",
    returnQuestor: "-1",
    wx: "0",
    wy: "0",
    wz: "0",
    terrainPatch: "0",
    x: "-1",
    y: "0",
    radius: "0",
    map: "-",
    mapX: "0",
    mapY: "0",
  };
}

function parseDeliveryGoal(raw) {
  const goal = defaultDeliveryGoal();
  const rawGoal = String(raw?.goal || "1");
  goal.optional = rawGoal.startsWith("-");
  goal.goal = String(Math.abs(Number(rawGoal)) || 1);
  goal.returnQuestor = String(raw?.returnQuestor ?? "-1");
  goal.wx = String(raw?.wx ?? "0");
  goal.wy = String(raw?.wy ?? "0");
  goal.wz = String(raw?.wz ?? "0");
  goal.terrainPatch = String(raw?.terrainPatch ?? "0");
  goal.x = String(raw?.x ?? "-1");
  goal.y = String(raw?.y ?? "0");
  goal.radius = String(raw?.radius ?? "0");
  goal.map = String(raw?.map || "-");
  goal.mapX = String(raw?.mapX ?? "0");
  goal.mapY = String(raw?.mapY ?? "0");
  return goal;
}

function defaultCompletionTransition() {
  return {
    uiId: nextStageEntryId("completion-transition"),
    nextStage: "0",
    goals: [],
  };
}

function parseCompletionTransition(raw) {
  const transition = defaultCompletionTransition();
  if (!raw || typeof raw !== "object") {
    return transition;
  }
  transition.nextStage = String(raw.nextStage ?? raw.nextstage ?? "0");
  transition.goals = Array.isArray(raw.goals)
    ? raw.goals.map((goal) => String(goal)).filter((goal) => /^-?\d+$/.test(goal))
    : String(raw.goals || "").split(":").filter((goal) => /^-?\d+$/.test(goal));
  return transition;
}

function defaultRewardCondition() {
  return {
    uiId: nextStageEntryId("reward-condition"),
    rewardIndex: "0",
    free: true,
    goals: ["0"],
  };
}

function parseRewardCondition(raw) {
  const condition = defaultRewardCondition();
  if (!raw || typeof raw !== "object") {
    return condition;
  }
  condition.rewardIndex = String(raw.rewardIndex ?? raw.rewardindex ?? "0");
  condition.goals = Array.isArray(raw.goals)
    ? raw.goals.map((goal) => String(goal)).filter((goal) => /^-?\d+$/.test(goal))
    : String(raw.goals || "0").split(":").filter((goal) => /^-?\d+$/.test(goal));
  condition.free = condition.goals.length === 0 || condition.goals.includes("0");
  if (condition.free) {
    condition.goals = ["0"];
  }
  return condition;
}

function defaultStageReward() {
  return {
    uiId: nextStageEntryId("stage-reward"),
    tval: "0",
    sval: "0",
    pval: "0",
    bpval: "0",
    name1: "0",
    name2: "0",
    name2b: "0",
    good: "0",
    great: "0",
    vgreat: "0",
    reward: "0",
    gold: "0",
    exp: "0",
    statusEffect: "0",
  };
}

function parseStageReward(raw) {
  const reward = defaultStageReward();
  if (!raw || typeof raw !== "object") {
    return reward;
  }
  for (const key of ["tval", "sval", "pval", "bpval", "name1", "name2", "name2b", "good", "great", "vgreat", "reward", "gold", "exp", "statusEffect"]) {
    reward[key] = String(raw[key] ?? reward[key]);
  }
  return reward;
}

function completionTransitionFromElement(element) {
  const item = element.closest("[data-completion-transition-id]");
  const uiId = item?.dataset.completionTransitionId || "";
  const stage = selectedEditorStage();
  return stage?.completion.transitions.find((transition) => transition.uiId === uiId) || null;
}

function rewardConditionFromElement(element) {
  const item = element.closest("[data-reward-condition-id]");
  const uiId = item?.dataset.rewardConditionId || "";
  const stage = selectedEditorStage();
  return stage?.completion.rewardConditions.find((condition) => condition.uiId === uiId) || null;
}

function stageRewardFromElement(element) {
  const item = element.closest("[data-stage-reward-id]");
  const uiId = item?.dataset.stageRewardId || "";
  const stage = selectedEditorStage();
  return stage?.completion.rewards.find((reward) => reward.uiId === uiId) || null;
}

function stageCompletionNextStage(stage) {
  const index = stageOrder.indexOf(stage.id);
  if (index >= 0 && stageOrder[index + 1]) {
    return stageOrder[index + 1];
  }
  return stageOrder.find((stageId) => stageId !== stage.id) || stage.id;
}

function stageCompletionGoalCatalog(stage, owner = null, allowOptional = false) {
  const catalog = [];
  const selected = new Set(Array.isArray(owner?.goals) ? owner.goals.map(String) : []);
  const seen = new Set();
  const pushGoal = (value, label, optional = false) => {
    const goalValue = String(value);
    if (seen.has(goalValue)) {
      return;
    }
    seen.add(goalValue);
    catalog.push({
      value: goalValue,
      label,
      optional,
      disabled: optional && !allowOptional,
    });
  };

  for (const goal of stage.goals) {
    const value = killGoalQInfoNumber(goal);
    pushGoal(value, `Kill ${value}${goal.optional ? " (optional)" : ""}`, goal.optional);
  }
  for (const goal of stage.retrieveGoals) {
    const value = retrieveGoalQInfoNumber(goal);
    pushGoal(value, `Retrieve ${value}${goal.optional ? " (optional)" : ""}`, goal.optional);
  }
  for (const goal of stage.deliveryGoals) {
    const value = deliveryGoalQInfoNumber(goal);
    pushGoal(value, `Delivery ${value}${goal.optional ? " (optional)" : ""}`, goal.optional);
  }

  for (const selectedGoal of selected) {
    if (catalog.some((option) => option.value === selectedGoal)) {
      continue;
    }
    catalog.push({
      value: selectedGoal,
      label: `Goal ${selectedGoal} (missing)`,
      optional: false,
      disabled: true,
    });
  }

  return catalog;
}

function syncCompletionTransitionGoals(transition, wrapper) {
  transition.goals = [...(wrapper?.querySelectorAll("[data-completion-goal]:checked") || [])]
    .map((checkbox) => checkbox.dataset.completionGoal || "")
    .filter((goal) => /^-?\d+$/.test(goal));
}

function renderCompletionTransitionGoalList(stage, transition) {
  const catalog = stageCompletionGoalCatalog(stage, transition);
  const selected = new Set((transition.goals || []).map(String));
  return `
    <div>
      <div class="stage-auto-subtitle">Required goals</div>
      <div class="stage-flag-grid completion-goal-grid">
        ${catalog.map((goal) => `
          <label class="stage-flag-row">
            <span>${escapeHtml(goal.label)}</span>
            <input data-completion-goal="${escapeHtml(goal.value)}" type="checkbox" value="${escapeHtml(goal.value)}" ${selected.has(goal.value) ? "checked" : ""} ${goal.disabled ? "disabled" : ""}>
          </label>
        `).join("")}
      </div>
      <span class="field-note">Only non-optional main goals can be selected for generated G lines.</span>
    </div>
  `;
}

function syncRewardConditionGoals(condition, wrapper) {
  condition.free = Boolean(wrapper?.querySelector("[data-reward-condition-free]")?.checked);
  if (condition.free) {
    condition.goals = ["0"];
    return;
  }
  condition.goals = [...(wrapper?.querySelectorAll("[data-reward-condition-goal]:checked") || [])]
    .map((checkbox) => checkbox.dataset.rewardConditionGoal || "")
    .filter((goal) => /^\d+$/.test(goal) && goal !== "0");
}

function rewardSlotOptions(stage, current = "") {
  const options = [["-1", "-1 - disabled"]];
  for (let index = 0; index < 10; index += 1) {
    const reward = stage.completion.rewards[index];
    const label = reward ? `Reward ${index}: ${stageRewardSummary(reward)}` : `Reward ${index} (not defined)`;
    options.push([String(index), label]);
  }
  return options;
}

function stageRewardSummary(reward) {
  const parts = [];
  const itemId = `${reward.tval}:${reward.sval}`;
  if (String(reward.tval || "0") !== "0") {
    parts.push(rewardItemLabel(itemId));
  }
  if (String(reward.reward || "0") !== "0") {
    parts.push(`generated ${reward.reward}`);
  }
  if (String(reward.gold || "0") !== "0") {
    parts.push(`${reward.gold} gold`);
  }
  if (String(reward.exp || "0") !== "0") {
    parts.push(`${reward.exp} exp`);
  }
  if (String(reward.statusEffect || "0") !== "0") {
    parts.push(`status ${reward.statusEffect}`);
  }
  return parts.join(", ") || "empty";
}

function renderRewardConditionGoalList(stage, condition) {
  const catalog = stageCompletionGoalCatalog(stage, condition, true);
  const selected = new Set((condition.goals || []).map(String));
  return `
    <div>
      <div class="stage-auto-subtitle">Required goals</div>
      <label class="stage-flag-row reward-free-row">
        <span>Free reward (goal 0)</span>
        <input data-reward-condition-free type="checkbox" ${condition.free ? "checked" : ""}>
      </label>
      <div class="stage-flag-grid completion-goal-grid">
        ${catalog.map((goal) => `
          <label class="stage-flag-row">
            <span>${escapeHtml(goal.label)}</span>
            <input data-reward-condition-goal="${escapeHtml(goal.value)}" type="checkbox" value="${escapeHtml(goal.value)}" ${selected.has(goal.value) && !condition.free ? "checked" : ""} ${condition.free ? "disabled" : ""}>
          </label>
        `).join("")}
      </div>
      <span class="field-note">O lines may use main or optional goals. Free reward generates goal 0.</span>
    </div>
  `;
}

function renderRewardCondition(stage, condition, index) {
  const current = String(condition.rewardIndex || "0");
  const options = rewardSlotOptions(stage, current);
  const hasCurrent = options.some(([value]) => value === current);
  return `
    <div class="stage-feature-entry" data-reward-condition-id="${escapeHtml(condition.uiId)}">
      <div class="stage-feature-head">
        <strong>O condition #${index + 1}</strong>
        <div class="stage-feature-actions">
          <button type="button" data-move-reward-condition="-1" ${index === 0 ? "disabled" : ""} aria-label="Move reward condition up">↑</button>
          <button type="button" data-move-reward-condition="1" ${index === stage.completion.rewardConditions.length - 1 ? "disabled" : ""} aria-label="Move reward condition down">↓</button>
          <button type="button" data-duplicate-reward-condition ${stage.completion.rewardConditions.length >= 10 ? "disabled" : ""}>Duplicate</button>
          <button type="button" data-remove-reward-condition>Remove</button>
        </div>
      </div>
      <div class="questor-wide-group-grid">
        <label>
          <span class="label-row">
            Reward slot
            <button type="button" class="tooltip-button" aria-label="Reward slot help" data-tooltip="Zero-based R reward slot to hand out. -1 disables this O condition.">?</button>
          </span>
          <select data-reward-condition-prop="rewardIndex">
            ${hasCurrent ? "" : `<option value="${escapeHtml(current)}" selected>Current: ${escapeHtml(current)} (unknown)</option>`}
            ${options.map(([value, label]) => `<option value="${escapeHtml(value)}" ${value === current ? "selected" : ""}>${escapeHtml(label)}</option>`).join("")}
          </select>
        </label>
        ${renderRewardConditionGoalList(stage, condition)}
      </div>
    </div>
  `;
}

function rewardValue(reward, path) {
  return reward[path] ?? "";
}

function setRewardValue(reward, path, value) {
  reward[path] = String(value);
}

function rewardInput(reward, label, path, tooltip, type = "number", attrs = "") {
  return `
    <label>
      <span class="label-row">${escapeHtml(label)} <button type="button" class="tooltip-button" aria-label="${escapeHtml(label)} help" data-tooltip="${escapeHtml(tooltip)}">?</button></span>
      <input data-stage-reward-prop="${escapeHtml(path)}" type="${type}" value="${escapeHtml(rewardValue(reward, path))}" ${attrs}>
    </label>
  `;
}

function rewardSelect(reward, label, path, options, tooltip = "") {
  const current = String(rewardValue(reward, path));
  const hasCurrent = options.some(([value]) => String(value) === current);
  return `
    <label>
      <span class="label-row">${escapeHtml(label)} ${tooltip ? `<button type="button" class="tooltip-button" aria-label="${escapeHtml(label)} help" data-tooltip="${escapeHtml(tooltip)}">?</button>` : ""}</span>
      <select data-stage-reward-prop="${escapeHtml(path)}">
        ${hasCurrent ? "" : `<option value="${escapeHtml(current)}" selected>Current: ${escapeHtml(current)} (unknown)</option>`}
        ${options.map(([value, text]) => `<option value="${escapeHtml(value)}" ${String(value) === current ? "selected" : ""}>${escapeHtml(text)}</option>`).join("")}
      </select>
    </label>
  `;
}

function rewardItemId(reward) {
  return `${reward.tval}:${reward.sval}`;
}

function rewardItemLabel(id) {
  if (id === "0:0") {
    return "No specific item (0:0)";
  }
  const record = recordById("items", id);
  return record ? `${record.name} (${record.id})` : `Unknown item (${id})`;
}

function renderRewardItemSearchField(reward) {
  return `
    <div class="questor-record-field">
      <label>
        Reward item
        <input data-stage-reward-item-search type="search" placeholder="Search items">
      </label>
      <div class="autocomplete-list" data-stage-reward-item-suggestions></div>
      <div class="selected-entity">
        <span>Selected:</span>
        <button type="button" class="clear-selected" data-clear-stage-reward-item aria-label="Clear reward item">x</button>
        <span>${escapeHtml(rewardItemLabel(rewardItemId(reward)))}</span>
      </div>
    </div>
  `;
}

function renderStageRewardItemSuggestions(input) {
  const wrapper = input.closest(".questor-record-field");
  const suggestions = wrapper?.querySelector("[data-stage-reward-item-suggestions]");
  if (!wrapper || !suggestions) {
    return;
  }
  const query = input.value.trim().toLowerCase();
  const matches = recordRows("items")
    .filter((record) => query === "" || String(record.name || "").toLowerCase().includes(query))
    .slice(0, 25);
  suggestions.innerHTML = [
    '<button type="button" class="autocomplete-option" data-stage-reward-item-id="0:0">No specific item (0:0)</button>',
    ...matches.map((record) => `<button type="button" class="autocomplete-option" data-stage-reward-item-id="${escapeHtml(record.id)}">${escapeHtml(record.name)} (${escapeHtml(record.id)})</button>`),
  ].join("");
  suggestions.classList.add("is-open");
  suggestions.style.display = "grid";
}

function rewardRecordLabel(source, value, emptyLabel, unknownLabel) {
  if (String(value) === "0") {
    return `${emptyLabel} (0)`;
  }
  const record = recordById(source, value);
  return record ? `${record.name} (${record.id})` : `${unknownLabel} (${value})`;
}

function renderRewardRecordSearchField(reward, label, path, source, placeholder, emptyLabel, unknownLabel, tooltip) {
  return `
    <div class="questor-record-field">
      <label>
        <span class="label-row">${escapeHtml(label)} <button type="button" class="tooltip-button" aria-label="${escapeHtml(label)} help" data-tooltip="${escapeHtml(tooltip)}">?</button></span>
        <input data-stage-reward-record-search data-reward-record-path="${escapeHtml(path)}" data-reward-record-source="${escapeHtml(source)}" data-reward-record-empty="${escapeHtml(emptyLabel)}" data-reward-record-unknown="${escapeHtml(unknownLabel)}" type="search" placeholder="${escapeHtml(placeholder)}">
      </label>
      <div class="autocomplete-list" data-stage-reward-record-suggestions></div>
      <div class="selected-entity">
        <span>Selected:</span>
        <button type="button" class="clear-selected" data-clear-stage-reward-record data-reward-record-path="${escapeHtml(path)}" aria-label="Clear ${escapeHtml(label)}">x</button>
        <span>${escapeHtml(rewardRecordLabel(source, rewardValue(reward, path), emptyLabel, unknownLabel))}</span>
      </div>
    </div>
  `;
}

function renderStageRewardRecordSuggestions(input) {
  const wrapper = input.closest(".questor-record-field");
  const suggestions = wrapper?.querySelector("[data-stage-reward-record-suggestions]");
  if (!wrapper || !suggestions) {
    return;
  }
  const source = input.dataset.rewardRecordSource || "";
  const query = input.value.trim().toLowerCase();
  const matches = recordRows(source)
    .filter((record) => query === "" || String(record.name || "").toLowerCase().includes(query))
    .slice(0, 25);
  const path = input.dataset.rewardRecordPath || "";
  const emptyLabel = input.dataset.rewardRecordEmpty || "None";
  suggestions.innerHTML = [
    `<button type="button" class="autocomplete-option" data-stage-reward-record-id="0" data-reward-record-path="${escapeHtml(path)}">0 - ${escapeHtml(emptyLabel)}</button>`,
    ...matches.map((record) => `<button type="button" class="autocomplete-option" data-stage-reward-record-id="${escapeHtml(record.id)}" data-reward-record-path="${escapeHtml(path)}">${escapeHtml(record.name)} (${escapeHtml(record.id)})</button>`),
  ].join("");
  suggestions.classList.add("is-open");
  suggestions.style.display = "grid";
}

function closeStageRewardSuggestions() {
  stageEditor?.querySelectorAll("[data-stage-reward-item-suggestions], [data-stage-reward-record-suggestions]").forEach((suggestions) => {
    suggestions.innerHTML = "";
    suggestions.classList.remove("is-open");
    suggestions.style.display = "";
  });
}

function renderStageReward(stage, reward, index) {
  return `
    <div class="stage-feature-entry" data-stage-reward-id="${escapeHtml(reward.uiId)}">
      <div class="stage-feature-head">
        <strong>R reward #${index}</strong>
        <div class="stage-feature-actions">
          <button type="button" data-move-stage-reward="-1" ${index === 0 ? "disabled" : ""} aria-label="Move reward up">↑</button>
          <button type="button" data-move-stage-reward="1" ${index === stage.completion.rewards.length - 1 ? "disabled" : ""} aria-label="Move reward down">↓</button>
          <button type="button" data-duplicate-stage-reward ${stage.completion.rewards.length >= 10 ? "disabled" : ""}>Duplicate</button>
          <button type="button" data-remove-stage-reward>Remove</button>
        </div>
      </div>
      <div class="questor-wide-group">
        <div class="questor-wide-group-title">Specific item</div>
        <div class="questor-wide-group-grid">
          ${renderRewardItemSearchField(reward)}
          ${rewardInput(reward, "pval", "pval", "Applied directly to the exact reward item after apply_magic(). Meaning depends on item and egos.", "number")}
          ${rewardInput(reward, "bpval", "bpval", "Base item extra parameter applied to the exact reward item. Usually 0 unless known for the selected item.", "number")}
          ${renderRewardRecordSearchField(reward, "Artifact name1", "name1", "artifacts", "Search artifacts", "No artifact", "Unknown artifact", "Non-zero name1 makes TomeNET create a random artifact and clears ego fields at runtime.")}
          ${renderRewardRecordSearchField(reward, "Ego name2", "name2", "egoItems", "Search ego items", "No ego", "Unknown ego item", "First ego item index for the exact reward item.")}
          ${renderRewardRecordSearchField(reward, "Ego name2b", "name2b", "egoItems", "Search ego items", "No second ego", "Unknown ego item", "Second ego item index for the exact reward item.")}
          ${rewardSelect(reward, "Good", "good", [["0", "0 - no"], ["1", "1 - yes"]], "Generate the selected item with apply_magic(). Quality generation ignores manual pval, bpval, artifact, and ego values.")}
          ${rewardSelect(reward, "Great", "great", [["0", "0 - no"], ["1", "1 - yes"]], "Generate the selected item with stronger apply_magic() quality.")}
          ${rewardSelect(reward, "Very great", "vgreat", [["0", "0 - no"], ["1", "1 - yes"]], "Generate the selected item with very strong apply_magic() quality.")}
        </div>
      </div>
      <div class="questor-wide-group">
        <div class="questor-wide-group-title">Generated reward, gold, experience, status</div>
        <div class="questor-wide-group-grid">
          ${rewardSelect(reward, "Generated reward", "reward", generatedRewardOptions, "Used only when no specific item tval is configured. Values select create_reward() restriction masks; 5 allows randarts.")}
          ${rewardInput(reward, "Gold", "gold", "Gold amount handed out with this reward. 0 disables gold.", "number")}
          ${rewardInput(reward, "Experience", "exp", "Experience points handed out with this reward. 0 disables experience.", "number")}
          ${rewardInput(reward, "Status effect", "statusEffect", "Positive values indicate a potion, scroll, staff, or non-directional rod from k_info.txt. 0 disables status effect.", "number")}
        </div>
      </div>
    </div>
  `;
}

function renderCompletionTransition(stage, transition, index) {
  const nextStageOptions = stageOrder.map((stageId) => [stageId, `Stage ${stageId}${stages[stageId]?.label ? ` - ${stages[stageId].label}` : ""}`]);
  const currentNextStage = String(transition.nextStage || stageCompletionNextStage(stage));
  const hasCurrent = nextStageOptions.some(([value]) => String(value) === currentNextStage);
  return `
    <div class="stage-feature-entry" data-completion-transition-id="${escapeHtml(transition.uiId)}">
      <div class="stage-feature-head">
        <strong>G transition #${index + 1}</strong>
        <div class="stage-feature-actions">
          <button type="button" data-move-completion-transition="-1" ${index === 0 ? "disabled" : ""} aria-label="Move completion transition up">↑</button>
          <button type="button" data-move-completion-transition="1" ${index === stage.completion.transitions.length - 1 ? "disabled" : ""} aria-label="Move completion transition down">↓</button>
          <button type="button" data-duplicate-completion-transition ${stage.completion.transitions.length >= 5 ? "disabled" : ""}>Duplicate</button>
          <button type="button" data-remove-completion-transition>Remove</button>
        </div>
      </div>
      <div class="questor-wide-group-grid">
        <label>
          <span class="label-row">
            Next stage
            <button type="button" class="tooltip-button" aria-label="Next stage help" data-tooltip="Stage to enter once all selected goals are complete.">?</button>
          </span>
          <select data-completion-prop="nextStage">
            ${hasCurrent ? "" : `<option value="${escapeHtml(currentNextStage)}" selected>Current: ${escapeHtml(currentNextStage)} (unknown)</option>`}
            ${nextStageOptions.map(([value, label]) => `<option value="${escapeHtml(value)}" ${String(value) === currentNextStage ? "selected" : ""}>${escapeHtml(label)}</option>`).join("")}
          </select>
        </label>
        ${renderCompletionTransitionGoalList(stage, transition)}
      </div>
    </div>
  `;
}

function stageCompletionLines(stage) {
  const lines = [];
  for (const transition of stage.completion.transitions) {
    const goals = Array.isArray(transition.goals)
      ? [...new Set(transition.goals.map(String).filter((goal) => /^-?\d+$/.test(goal)))].sort((a, b) => Number(a) - Number(b))
      : [];
    if (!goals.length) {
      continue;
    }
    lines.push(`G:${stage.id}:${transition.nextStage}:${goals.join(":")}`);
  }
  for (const condition of stage.completion.rewardConditions) {
    const rewardIndex = String(condition.rewardIndex ?? "0");
    if (rewardIndex === "-1") {
      continue;
    }
    const goals = condition.free
      ? ["0"]
      : [...new Set((condition.goals || []).map(String).filter((goal) => /^\d+$/.test(goal) && goal !== "0"))]
        .sort((a, b) => Number(a) - Number(b));
    if (!goals.length) {
      continue;
    }
    lines.push(`O:${stage.id}:${rewardIndex}:${goals.join(":")}`);
  }
  for (const reward of stage.completion.rewards) {
    lines.push(`R:${stage.id}:${reward.tval}:${reward.sval}:${reward.pval}:${reward.bpval}:${reward.name1}:${reward.name2}:${reward.name2b}:${reward.good}:${reward.great}:${reward.vgreat}:${reward.reward}:${reward.gold}:${reward.exp}:${reward.statusEffect}`);
  }
  return lines;
}

function defaultStageDungeon() {
  return {
    enabled: false,
    base: "1",
    max: "1",
    tower: "0",
    hard: "0",
    stores: "0",
    theme: "0",
    name: "-",
    staticFloors: "0",
    keep: "0",
    flags1: "0",
    flags2: "0",
    flags3: "0",
    finalMap: "-",
    finalMapX: "0",
    finalMapY: "0",
    location: {
      loc: "0", terrains: "0", towns: "0",
      wx: "0", wy: "0", terrainPatch: "0",
      x: "0", y: "0", radius: "0", map: "-", mapX: "0", mapY: "0",
    },
    missingDl: false,
  };
}

function parseStageDungeon(raw) {
  const dungeon = defaultStageDungeon();
  if (!raw || typeof raw !== "object") {
    return dungeon;
  }
  const d = String(raw.d || "").split(":");
  if (d.length >= 12) {
    dungeon.enabled = true;
    [
      dungeon.base,
      dungeon.max,
      dungeon.tower,
      dungeon.hard,
      dungeon.stores,
      dungeon.theme,
      dungeon.name,
      dungeon.staticFloors,
      dungeon.keep,
      dungeon.flags1,
      dungeon.flags2,
      dungeon.flags3,
    ] = d.slice(0, 12);
    if (d.length >= 13) {
      dungeon.finalMap = d[12] || "-";
      dungeon.finalMapX = d[13] || "0";
      dungeon.finalMapY = d[14] || "0";
    }
  }
  const dl = String(raw.dl || "").split(":");
  dungeon.missingDl = dungeon.enabled && dl.length < 12;
  if (!dungeon.missingDl) {
    [
      dungeon.location.loc,
      dungeon.location.terrains,
      dungeon.location.towns,
      dungeon.location.wx,
      dungeon.location.wy,
      dungeon.location.terrainPatch,
      dungeon.location.x,
      dungeon.location.y,
      dungeon.location.radius,
      dungeon.location.map,
      dungeon.location.mapX,
      dungeon.location.mapY,
    ] = dl.slice(0, 12);
  }
  return dungeon;
}

function defaultStageMorph() {
  return {
    uiId: nextStageEntryId("morph"),
    questor: "0",
    talkable: "1",
    despawned: "0",
    invincible: "1",
    deathFail: "-1",
    name: "-",
    nameflags: "255",
    ridx: "0",
    reidx: "-1",
    rmapcnt: "0",
    rcharidx: "-1",
    rattr: "-",
    level: "0",
  };
}

function parseStageMorph(raw) {
  const morph = defaultStageMorph();
  const parts = String(raw || "").split(":");
  if (parts.length >= 13) {
    [
      morph.questor,
      morph.talkable,
      morph.despawned,
      morph.invincible,
      morph.deathFail,
      morph.name,
      morph.nameflags,
      morph.ridx,
      morph.reidx,
      morph.rmapcnt,
      morph.rcharidx,
      morph.rattr,
      morph.level,
    ] = parts.slice(0, 13);
  }
  return morph;
}

function defaultStageHostility() {
  return {
    uiId: nextStageEntryId("hostility"),
    questor: "0",
    unquestor: "0",
    hostilePlayer: "1",
    hostileMonster: "0",
    revertHp: "0",
    ingameHour: "-1",
    realTime: "0",
    changeMode: "disabled",
    changeStage: "255",
    randomSteps: "1",
    quiet: "0",
  };
}

function parseStageHostility(raw) {
  const hostility = defaultStageHostility();
  const parts = String(raw || "").split(":");
  if (parts.length >= 9) {
    [
      hostility.questor,
      hostility.unquestor,
      hostility.hostilePlayer,
      hostility.hostileMonster,
      hostility.revertHp,
      hostility.ingameHour,
      hostility.realTime,
      hostility.changeStage,
      hostility.quiet,
    ] = parts.slice(0, 9);
    const changeStage = Number(hostility.changeStage);
    hostility.changeMode = hostility.changeStage === "255" ? "disabled" : changeStage < 0 ? "random" : "exact";
    hostility.randomSteps = changeStage < 0 ? String(Math.abs(changeStage)) : "1";
  }
  return hostility;
}

function defaultStageAction() {
  return {
    uiId: nextStageEntryId("action"),
    questor: "0",
    teleportQuestor: { wx: "-1", wy: "-1", wz: "-1", x: "-1", y: "-1" },
    teleportPlayers: { wx: "-1", wy: "-1", wz: "-1", x: "-1", y: "-1" },
    walkSpeed: "0",
    destX: "0",
    destY: "0",
    changeMode: "disabled",
    changeStage: "255",
    randomSteps: "1",
    quiet: "0",
  };
}

function parseStageAction(raw) {
  const action = defaultStageAction();
  const parts = String(raw || "").split(":");
  if (parts.length >= 16) {
    [
      action.questor,
      action.teleportQuestor.wx,
      action.teleportQuestor.wy,
      action.teleportQuestor.wz,
      action.teleportQuestor.x,
      action.teleportQuestor.y,
      action.teleportPlayers.wx,
      action.teleportPlayers.wy,
      action.teleportPlayers.wz,
      action.teleportPlayers.x,
      action.teleportPlayers.y,
      action.walkSpeed,
      action.destX,
      action.destY,
      action.changeStage,
      action.quiet,
    ] = parts.slice(0, 16);
    const changeStage = Number(action.changeStage);
    action.changeMode = action.changeStage === "255" ? "disabled" : changeStage < 0 ? "random" : "exact";
    action.randomSteps = changeStage < 0 ? String(Math.abs(changeStage)) : "1";
  }
  return action;
}

function defaultStageTextEntry(kind = "narration") {
  const entry = {
    uiId: nextStageEntryId("stage-text"),
    flags: "-",
    text: "",
  };
  if (kind === "keyword") {
    entry.questor = "-1";
    entry.extraQuestors = [];
    entry.keyword = "";
    entry.changeFlags = "-";
    entry.nextMode = "disabled";
    entry.nextStage = "255";
    entry.randomSteps = "1";
    entry.extraStages = [];
  }
  if (kind === "reply") {
    entry.questor = "-1";
    entry.keyword = "";
    entry.extraKeywords = [];
    entry.extraQuestors = [];
    entry.extraStages = [];
    entry.replies = [defaultStageReplyLine()];
  }
  if (kind === "dialogue" || kind === "defaultReply") {
    entry.questor = "0";
  }
  if (kind === "dialogue") {
    entry.examine = "0";
  }
  return entry;
}

function defaultStageReplyLine() {
  return {
    uiId: nextStageEntryId("stage-reply-line"),
    flags: "-",
    text: "",
  };
}

function parseStageTextEntry(raw, kind = "narration") {
  const entry = defaultStageTextEntry(kind);
  const splitNumericList = (value) => String(value || "")
    .split(":")
    .filter((part) => /^\d+$/.test(part));
  const splitTextList = (value) => String(value || "")
    .split(":")
    .filter((part) => part !== "");
  if (raw && typeof raw === "object") {
    entry.flags = String(raw.flags || "-");
    entry.text = String(raw.text || "");
    if (kind === "keyword") {
      const nextStage = String(raw.nextstage ?? raw.nextStage ?? "255");
      const nextStageNumber = Number(nextStage);
      entry.questor = String(raw.questor ?? "-1");
      entry.extraQuestors = Array.isArray(raw.yq) ? raw.yq.map(String) : splitNumericList(raw.yq);
      entry.keyword = String(raw.keyword ?? "");
      entry.changeFlags = String(raw.changeFlags ?? "-");
      entry.nextStage = nextStage;
      entry.nextMode = nextStage === "255" ? "disabled" : nextStageNumber < 0 ? "random" : "exact";
      entry.randomSteps = nextStageNumber < 0 ? String(Math.abs(nextStageNumber)) : "1";
      entry.extraStages = Array.isArray(raw.ys) ? raw.ys.map(String) : splitNumericList(raw.ys);
      return entry;
    }
    if (kind === "reply") {
      entry.questor = String(raw.questor ?? "-1");
      entry.keyword = String(raw.keyword ?? "");
      entry.extraKeywords = Array.isArray(raw.yy) ? raw.yy.map(String) : splitTextList(raw.yy);
      entry.extraQuestors = Array.isArray(raw.yq) ? raw.yq.map(String) : splitNumericList(raw.yq);
      entry.extraStages = Array.isArray(raw.ys) ? raw.ys.map(String) : splitNumericList(raw.ys);
      entry.replies = Array.isArray(raw.replies)
        ? raw.replies.map((reply) => ({
            uiId: nextStageEntryId("stage-reply-line"),
            flags: String(reply?.flags || "-"),
            text: String(reply?.text || ""),
          }))
        : [];
      return entry;
    }
    if (kind === "dialogue" || kind === "defaultReply") {
      entry.questor = String(raw.questor || "0");
    }
    if (kind === "dialogue") {
      entry.examine = String(raw.examine || "0");
    }
    return entry;
  }
  const parts = String(raw || "").split(":");
  if (parts.length >= 2) {
    entry.flags = parts[0] || "-";
    entry.text = parts.slice(1).join(":");
  }
  return entry;
}

function createStage(id, label = "") {
  return {
    id: String(id),
    label,
    setup: { automatic: defaultStageAutomatic(), features: [] },
    questorActions: { morphs: [], hostilities: [], movements: [] },
    spawns: { questItems: [], dungeon: defaultStageDungeon(), monsters: [] },
    text: { narrations: [], statusLines: [], dialogues: [], defaultReplies: [], keywords: [], replies: [] },
    goals: [],
    retrieveGoals: [],
    goalTargets: [],
    deliveryGoals: [],
    completion: { transitions: [], rewardConditions: [], rewards: [] },
    rawLines: [],
  };
}

function initializeStagesFromLegacy(rawStages = {}) {
  sharedStage = createStage(sharedStageId, "Shared / any stage");
  sharedStage.text.keywords = Array.isArray(rawStages["-1"]?.y)
    ? rawStages["-1"].y.map((raw) => parseStageTextEntry(raw, "keyword"))
    : [];
  sharedStage.text.replies = Array.isArray(rawStages["-1"]?.yr)
    ? rawStages["-1"].yr.map((raw) => parseStageTextEntry(raw, "reply"))
    : [];
  if (Array.isArray(rawStages["-1"]?.rawLines)) {
    sharedStage.rawLines.push(...rawStages["-1"].rawLines);
  }
  stageOrder = [...new Set([...legacyStageReferences(), ...Object.keys(rawStages)])]
    .filter((id) => /^\d+$/.test(id) && Number(id) <= 49)
    .sort((a, b) => Number(a) - Number(b));
  stages = Object.fromEntries(stageOrder.map((id) => {
    const stage = createStage(id);
    stage.setup.automatic = parseStageAutomatic(rawStages[id]?.a || "");
    stage.setup.features = Array.isArray(rawStages[id]?.af)
      ? rawStages[id].af.map(parseStageFeature)
      : [];
    stage.spawns.questItems = Array.isArray(rawStages[id]?.b)
      ? rawStages[id].b.map(parseQuestItem)
      : [];
    stage.spawns.monsters = Array.isArray(rawStages[id]?.m)
      ? rawStages[id].m.map(parseStageMonsterSpawn)
      : [];
    stage.goals = Array.isArray(rawStages[id]?.k)
      ? rawStages[id].k.map(parseKillGoal)
      : [];
    stage.retrieveGoals = Array.isArray(rawStages[id]?.r)
      ? rawStages[id].r.map(parseRetrieveGoal)
      : [];
    attachGoalTargets(stage, rawStages[id]?.p || []);
    stage.deliveryGoals = Array.isArray(rawStages[id]?.mg)
      ? rawStages[id].mg.map(parseDeliveryGoal)
      : [];
    stage.completion.transitions = Array.isArray(rawStages[id]?.g)
      ? rawStages[id].g.map(parseCompletionTransition)
      : [];
    stage.completion.rewardConditions = Array.isArray(rawStages[id]?.o)
      ? rawStages[id].o.map(parseRewardCondition)
      : [];
    stage.completion.rewards = Array.isArray(rawStages[id]?.reward)
      ? rawStages[id].reward.map(parseStageReward)
      : [];
    const orphanGoalChangeFlags = attachGoalChangeFlags(stage, rawStages[id]?.z || []);
    stage.spawns.dungeon = parseStageDungeon(rawStages[id]?.d || null);
    stage.rawLines = Array.isArray(rawStages[id]?.blOrphans)
      ? rawStages[id].blOrphans.map((raw) => `Bl:${id}:${raw}`)
      : [];
    stage.rawLines.push(...orphanGoalChangeFlags);
    if (Array.isArray(rawStages[id]?.rawLines)) {
      stage.rawLines.push(...rawStages[id].rawLines);
    }
    stage.questorActions.morphs = Array.isArray(rawStages[id]?.s)
      ? rawStages[id].s.map(parseStageMorph)
      : [];
    stage.questorActions.hostilities = Array.isArray(rawStages[id]?.h)
      ? rawStages[id].h.map(parseStageHostility)
      : [];
    stage.questorActions.movements = Array.isArray(rawStages[id]?.j)
      ? rawStages[id].j.map(parseStageAction)
      : [];
    stage.text.narrations = Array.isArray(rawStages[id]?.xNarration)
      ? rawStages[id].xNarration.map((raw) => parseStageTextEntry(raw, "narration"))
      : [];
    stage.text.statusLines = Array.isArray(rawStages[id]?.xLog)
      ? rawStages[id].xLog.map((raw) => parseStageTextEntry(raw, "log"))
      : [];
    stage.text.dialogues = Array.isArray(rawStages[id]?.w)
      ? rawStages[id].w.map((raw) => parseStageTextEntry(raw, "dialogue"))
      : [];
    stage.text.defaultReplies = Array.isArray(rawStages[id]?.wr)
      ? rawStages[id].wr.map((raw) => parseStageTextEntry(raw, "defaultReply"))
      : [];
    stage.text.keywords = Array.isArray(rawStages[id]?.y)
      ? rawStages[id].y.map((raw) => parseStageTextEntry(raw, "keyword"))
      : [];
    stage.text.replies = Array.isArray(rawStages[id]?.yr)
      ? rawStages[id].yr.map((raw) => parseStageTextEntry(raw, "reply"))
      : [];
    for (const feature of stage.setup.features) {
      if (feature.source === "questItem" && /^\d+$/.test(feature.questItem)) {
        feature.questItemRef = stage.spawns.questItems[Number(feature.questItem)]?.uiId || "";
      }
    }
    return [id, stage];
  }));
  selectedStageId = "0";
  renderStages();
}

function collectStages() {
  return [...stageOrder];
}

function nextAvailableStageId() {
  for (let id = 0; id <= 49; id += 1) {
    if (!stages[String(id)]) {
      return String(id);
    }
  }
  return null;
}

function stageBlock(title, note) {
  return `
    <div class="stage-block">
      <div class="stage-block-title">${escapeHtml(title)}</div>
      <div class="stage-block-note">${escapeHtml(note)}</div>
    </div>
  `;
}

function stageSelect(label, path, current, options, tooltip = "") {
  const hasCurrent = options.some(([valueOption]) => String(valueOption) === String(current));
  return `
    <label>
      <span class="label-row">
        ${escapeHtml(label)}
        ${tooltip ? `<button type="button" class="tooltip-button" aria-label="${escapeHtml(label)} help" data-tooltip="${escapeHtml(tooltip)}">?</button>` : ""}
      </span>
      <select data-stage-auto="${escapeHtml(path)}">
        ${hasCurrent ? "" : `<option value="${escapeHtml(current)}" selected>Current: ${escapeHtml(current)} (unknown)</option>`}
        ${options.map(([valueOption, label]) => `<option value="${escapeHtml(valueOption)}" ${String(valueOption) === String(current) ? "selected" : ""}>${escapeHtml(label)}</option>`).join("")}
      </select>
    </label>
  `;
}

function questActivationOptions(current) {
  const rows = questRows().map((quest) => [quest.index, `#${quest.index}: ${quest.name} (${quest.codename})`]);
  return stageSelect("Activate quest", "activateQuest", current, [["-1", "Disabled (-1)"], ...rows], "Activates another quest when this stage starts. The generated value is that quest's numeric index.");
}

function stageTargetOptions(current) {
  return stageSelect("Exact target stage", "changeStage", current, stageOrder.map((id) => [id, `Stage ${id}${stages[id]?.label ? ` - ${stages[id].label}` : ""}`]), "Stage entered automatically. Imported targets not currently in the stage list are preserved.");
}

function stageFlagPicker(automatic) {
  const flags = automatic.flags === "-" ? "" : automatic.flags;
  return `
    <div class="stage-auto-flags">
      <div class="stage-auto-subtitle label-row">
        Stage flags
        <button type="button" class="tooltip-button" aria-label="Stage flags help" data-tooltip="Quest-local boolean flags A through P. They have no built-in meanings; define their purpose for this quest. Set enables a flag when the stage starts. Clear disables it. Flags persist across stage changes and can control dialogue, narration, keywords, replies, goals, and Lua quest logic. Do not select both Set and Clear for the same flag.">?</button>
      </div>
      <div class="stage-flag-grid">
        ${Array.from({ length: 16 }, (_, index) => {
          const upper = String.fromCharCode(65 + index);
          const lower = upper.toLowerCase();
          return `<div class="stage-flag-row">
            <span>${upper}</span>
            <label><input data-stage-flag="${upper}" type="checkbox" ${flags.includes(upper) ? "checked" : ""}> Set</label>
            <label><input data-stage-flag="${lower}" type="checkbox" ${flags.includes(lower) ? "checked" : ""}> Clear</label>
          </div>`;
        }).join("")}
      </div>
    </div>
  `;
}

function stageQuestorOptions(current) {
  const options = questors.map((questor, index) => [String(index), `#${index}: ${questor.name || "Unnamed questor"}`]);
  const hasCurrent = options.some(([valueOption]) => valueOption === String(current));
  return `
    <label>
      Questor position
      <select data-stage-feature-prop="questor">
        ${hasCurrent ? "" : `<option value="${escapeHtml(current)}" selected>Current: #${escapeHtml(current)} (missing)</option>`}
        ${options.map(([valueOption, label]) => `<option value="${escapeHtml(valueOption)}" ${valueOption === String(current) ? "selected" : ""}>${escapeHtml(label)}</option>`).join("")}
      </select>
    </label>
  `;
}

function stageQuestItemOptions(stage, feature) {
  const options = stage.spawns.questItems.map((item, index) => [item.uiId, `#${index}: ${item.name || "Unnamed quest item"}`]);
  const hasCurrent = options.some(([valueOption]) => valueOption === String(feature.questItemRef || ""));
  return `
    <label>
      Quest-item position
      <select data-stage-feature-prop="questItemRef">
        ${hasCurrent ? "" : `<option value="" selected>Imported #${escapeHtml(feature.questItem)} (missing)</option>`}
        ${options.map(([valueOption, label]) => `<option value="${escapeHtml(valueOption)}" ${valueOption === String(feature.questItemRef || "") ? "selected" : ""}>${escapeHtml(label)}</option>`).join("")}
      </select>
    </label>
  `;
}

function stageFeatureLabel(featureId) {
  const record = recordById("features", featureId);
  return record ? `${record.name} (${record.id})` : `Unknown feature (${featureId})`;
}

function renderStageFeatureEntry(feature, index) {
  return `
    <div class="stage-feature-entry" data-stage-feature-index="${index}">
      <div class="stage-feature-head">
        <strong>Feature ${index + 1}</strong>
        <div class="stage-feature-actions">
          <button type="button" data-duplicate-stage-feature="${index}" ${stages[selectedStageId]?.setup.features.length >= 15 ? "disabled" : ""}>Duplicate</button>
          <button type="button" data-remove-stage-feature="${index}">Remove</button>
        </div>
      </div>
      ${feature.source === "questItem" && !feature.questItemRef ? '<div class="warning-note">This imported quest-item reference does not match a B entry and is preserved unchanged.</div>' : ""}
      <div class="questor-wide-group-grid">
        <label>
          Position source
          <select data-stage-feature-prop="source">
            <option value="questor" ${feature.source === "questor" ? "selected" : ""}>Questor position</option>
            <option value="questItem" ${feature.source === "questItem" ? "selected" : ""} ${stages[selectedStageId]?.spawns.questItems.length ? "" : "disabled"}>Quest-item position</option>
            <option value="specific" ${feature.source === "specific" ? "selected" : ""}>Specific world position</option>
          </select>
        </label>
        ${feature.source === "questor" ? stageQuestorOptions(feature.questor) : ""}
        ${feature.source === "questItem" ? stageQuestItemOptions(stages[selectedStageId], feature) : ""}
      </div>
      ${feature.source === "specific" ? `
        <div class="coordinate-group">
          <div class="coordinate-group-title">World position</div>
          <div class="coordinate-group-grid">
            <label>World X <input data-stage-feature-prop="wx" type="number" value="${escapeHtml(feature.wx)}"></label>
            <label>World Y <input data-stage-feature-prop="wy" type="number" value="${escapeHtml(feature.wy)}"></label>
            <label>World Z <input data-stage-feature-prop="wz" type="number" value="${escapeHtml(feature.wz)}"></label>
          </div>
        </div>
      ` : ""}
      <div class="coordinate-group">
        <div class="coordinate-group-title">Grid position</div>
        <div class="coordinate-group-grid">
          <label>Grid X <input data-stage-feature-prop="x" type="number" value="${escapeHtml(feature.x)}"></label>
          <label>Grid Y <input data-stage-feature-prop="y" type="number" value="${escapeHtml(feature.y)}"></label>
        </div>
      </div>
      <label class="questor-record-field">
        Feature
        <input data-stage-feature-search type="search" placeholder="Search features">
        <div class="autocomplete-list" data-stage-feature-suggestions></div>
        <div class="selected-entity">
          <span>Selected:</span>
          <span>${escapeHtml(stageFeatureLabel(feature.feature))}</span>
        </div>
      </label>
    </div>
  `;
}

function renderStageFeatures(stage) {
  return `
    <div class="stage-features">
      <div class="stage-feature-section-head">
        <div>
          <div class="stage-auto-subtitle label-row">
            Build features on stage start (Af)
            <button type="button" class="tooltip-button" aria-label="Af feature help" data-tooltip="Each Af line builds one f_info feature at Grid X/Y when this stage starts. Its world position comes from a questor first, then a quest item, otherwise the specific world position. TomeNET allows up to 15 Af lines per stage.">?</button>
          </div>
          <div class="stage-block-note">${stage.setup.features.length} feature entr${stage.setup.features.length === 1 ? "y" : "ies"}.</div>
        </div>
        <button type="button" data-add-stage-feature ${stage.setup.features.length >= 15 ? "disabled" : ""}>Add feature</button>
      </div>
      ${stage.setup.features.length === 0
        ? '<div class="stage-block-note">No Af lines emitted for this stage.</div>'
        : `<div class="stage-feature-list">${stage.setup.features.map(renderStageFeatureEntry).join("")}</div>`}
    </div>
  `;
}

function renderStageFeatureSuggestions(input) {
  const wrapper = input.closest(".stage-feature-entry");
  const suggestions = wrapper?.querySelector("[data-stage-feature-suggestions]");
  if (!wrapper || !suggestions) {
    return;
  }
  const query = input.value.trim().toLowerCase();
  const matches = recordRows("features")
    .filter((record) => query === "" || String(record.name || "").toLowerCase().includes(query))
    .slice(0, 25);
  suggestions.innerHTML = matches.length === 0
    ? '<div class="autocomplete-empty">No features found.</div>'
    : matches.map((record) => (
      `<button type="button" class="autocomplete-option" data-stage-feature-id="${escapeHtml(record.id)}">${escapeHtml(record.name)} (${escapeHtml(record.id)})</button>`
    )).join("");
  suggestions.classList.add("is-open");
  suggestions.style.display = "grid";
}

function stageFeatureFromElement(element) {
  const stage = stages[selectedStageId];
  const index = Number(element.closest("[data-stage-feature-index]")?.dataset.stageFeatureIndex);
  return stage && Number.isInteger(index) ? stage.setup.features[index] : null;
}

function questItemValue(item, path) {
  return path.split(".").reduce((value, key) => value?.[key], item) ?? "";
}

function setQuestItemValue(item, path, nextValue) {
  const parts = path.split(".");
  const last = parts.pop();
  const target = parts.reduce((value, key) => value[key], item);
  target[last] = String(nextValue);
}

function stageQuestItemFromElement(element) {
  const stage = stages[selectedStageId];
  const uiId = element.closest("[data-stage-item-id]")?.dataset.stageItemId;
  return stage?.spawns.questItems.find((item) => item.uiId === uiId) || null;
}

function stageItemInput(item, label, path, tooltip, type = "number", attrs = "") {
  return `
    <label>
      <span class="label-row">${escapeHtml(label)} <button type="button" class="tooltip-button" aria-label="${escapeHtml(label)} help" data-tooltip="${escapeHtml(tooltip)}">?</button></span>
      <input data-stage-item-prop="${escapeHtml(path)}" type="${type}" value="${escapeHtml(questItemValue(item, path))}" ${attrs}>
    </label>
  `;
}

function stageItemSelect(item, label, path, options, tooltip = "") {
  const current = String(questItemValue(item, path));
  const hasCurrent = options.some(([optionValue]) => String(optionValue) === current);
  return `
    <label>
      <span class="label-row">${escapeHtml(label)} ${tooltip ? `<button type="button" class="tooltip-button" aria-label="${escapeHtml(label)} help" data-tooltip="${escapeHtml(tooltip)}">?</button>` : ""}</span>
      <select data-stage-item-prop="${escapeHtml(path)}">
        ${hasCurrent ? "" : `<option value="${escapeHtml(current)}" selected>Current: ${escapeHtml(current)} (unknown)</option>`}
        ${options.map(([optionValue, text]) => `<option value="${escapeHtml(optionValue)}" ${String(optionValue) === current ? "selected" : ""}>${escapeHtml(text)}</option>`).join("")}
      </select>
    </label>
  `;
}

function stageItemMask(item, label, path, options, tooltip) {
  const current = numericMask(questItemValue(item, path));
  const unknown = unknownMaskForOptions(current, options);
  return `
    <div class="field-label nameflags-field questor-mask-field stage-item-mask" data-stage-item-mask="${escapeHtml(path)}" data-stage-item-mask-unknown="${unknown}">
      <span class="label-row">${escapeHtml(label)} <button type="button" class="tooltip-button" aria-label="${escapeHtml(label)} help" data-tooltip="${escapeHtml(tooltip)}">?</button></span>
      <div class="option-picker nameflags-picker">
        <button type="button" class="option-picker-toggle" data-stage-item-mask-toggle aria-expanded="false">
          <span>${escapeHtml(maskSummary(current, options, `No ${label.toLowerCase()}`))}</span>
          <span aria-hidden="true">v</span>
        </button>
        <div class="option-picker-panel stage-item-mask-options">
          ${options.map((option) => `
            <label class="picker-option">
              <input data-stage-item-mask-option="${option.value}" type="checkbox" ${maskHasValue(current, option.value) ? "checked" : ""}>
              <span>${escapeHtml(option.value)} - ${escapeHtml(option.label)} <small>${escapeHtml(option.description)}</small></span>
            </label>
          `).join("")}
        </div>
      </div>
      <span class="field-note">Mask: ${current}${unknown ? `; preserved unknown bits: ${unknown}` : ""}</span>
    </div>
  `;
}

function renderStageItemMapField(item) {
  return `
    <label class="questor-record-field">
      Map file
      <input data-stage-item-map-search type="search" placeholder="Search map templates">
      <div class="autocomplete-list" data-stage-item-map-suggestions></div>
      <div class="selected-entity">
        <span>Selected:</span>
        <button type="button" class="clear-selected" data-clear-stage-item-map aria-label="Clear map file">x</button>
        <span>${escapeHtml(questorRecordLabel("templates", item.location.map, "-", "None", "Unknown map file"))}</span>
      </div>
    </label>
  `;
}

function renderStageItemMapSuggestions(input) {
  const wrapper = input.closest(".questor-record-field");
  const suggestions = wrapper?.querySelector("[data-stage-item-map-suggestions]");
  if (!wrapper || !suggestions) {
    return;
  }
  const query = input.value.trim().toLowerCase();
  const matches = recordRows("templates")
    .filter((record) => query === "" || String(record.name || "").toLowerCase().includes(query))
    .slice(0, 25);
  suggestions.innerHTML = [
    '<button type="button" class="autocomplete-option" data-stage-item-map-id="-">None (-)</button>',
    ...matches.map((record) => `<button type="button" class="autocomplete-option" data-stage-item-map-id="${escapeHtml(record.id)}">${escapeHtml(record.name)} (${escapeHtml(record.id)})</button>`),
  ].join("");
  suggestions.classList.add("is-open");
  suggestions.style.display = "grid";
}

function closeStageItemMapSuggestions() {
  stageEditor?.querySelectorAll("[data-stage-item-map-suggestions]").forEach((suggestions) => {
    suggestions.innerHTML = "";
    suggestions.classList.remove("is-open");
    suggestions.style.display = "";
  });
}

function monsterSpawnValue(spawn, path) {
  return path.split(".").reduce((value, key) => value?.[key], spawn) ?? "";
}

function setMonsterSpawnValue(spawn, path, nextValue) {
  const parts = path.split(".");
  const last = parts.pop();
  const target = parts.reduce((value, key) => value[key], spawn);
  target[last] = String(nextValue);
}

function stageMonsterSpawnFromElement(element) {
  const stage = stages[selectedStageId];
  const uiId = element.closest("[data-stage-monster-id]")?.dataset.stageMonsterId;
  return stage?.spawns.monsters.find((spawn) => spawn.uiId === uiId) || null;
}

function stageMonsterInput(spawn, label, path, tooltip, type = "number", attrs = "") {
  return `
    <label>
      <span class="label-row">${escapeHtml(label)} <button type="button" class="tooltip-button" aria-label="${escapeHtml(label)} help" data-tooltip="${escapeHtml(tooltip)}">?</button></span>
      <input data-stage-monster-prop="${escapeHtml(path)}" type="${type}" value="${escapeHtml(monsterSpawnValue(spawn, path))}" ${attrs}>
    </label>
  `;
}

function stageMonsterSelect(spawn, label, path, options, tooltip = "") {
  const current = String(monsterSpawnValue(spawn, path));
  const hasCurrent = options.some(([optionValue]) => String(optionValue) === current);
  return `
    <label>
      <span class="label-row">${escapeHtml(label)} ${tooltip ? `<button type="button" class="tooltip-button" aria-label="${escapeHtml(label)} help" data-tooltip="${escapeHtml(tooltip)}">?</button>` : ""}</span>
      <select data-stage-monster-prop="${escapeHtml(path)}">
        ${hasCurrent ? "" : `<option value="${escapeHtml(current)}" selected>Current: ${escapeHtml(current)} (unknown)</option>`}
        ${options.map(([optionValue, text]) => `<option value="${escapeHtml(optionValue)}" ${String(optionValue) === current ? "selected" : ""}>${escapeHtml(text)}</option>`).join("")}
      </select>
    </label>
  `;
}

function stageMonsterMask(spawn, label, path, options, tooltip) {
  const current = numericMask(monsterSpawnValue(spawn, path));
  const unknown = unknownMaskForOptions(current, options);
  return `
    <div class="field-label nameflags-field questor-mask-field stage-monster-mask" data-stage-monster-mask="${escapeHtml(path)}" data-stage-monster-mask-unknown="${unknown}">
      <span class="label-row">${escapeHtml(label)} <button type="button" class="tooltip-button" aria-label="${escapeHtml(label)} help" data-tooltip="${escapeHtml(tooltip)}">?</button></span>
      <div class="option-picker nameflags-picker">
        <button type="button" class="option-picker-toggle" data-stage-monster-mask-toggle aria-expanded="false">
          <span>${escapeHtml(maskSummary(current, options, `No ${label.toLowerCase()}`))}</span>
          <span aria-hidden="true">v</span>
        </button>
        <div class="option-picker-panel stage-monster-mask-options">
          ${options.map((option) => `
            <label class="picker-option">
              <input data-stage-monster-mask-option="${option.value}" type="checkbox" ${maskHasValue(current, option.value) ? "checked" : ""}>
              <span>${escapeHtml(option.value)} - ${escapeHtml(option.label)} <small>${escapeHtml(option.description)}</small></span>
            </label>
          `).join("")}
        </div>
      </div>
      <span class="field-note">Mask: ${current}${unknown ? `; preserved unknown bits: ${unknown}` : ""}</span>
    </div>
  `;
}

function syncStageMonsterMask(checkbox) {
  const spawn = stageMonsterSpawnFromElement(checkbox);
  const field = checkbox.closest("[data-stage-monster-mask]");
  if (!spawn || !field) {
    return;
  }
  const selected = [...field.querySelectorAll("[data-stage-monster-mask-option]:checked")]
    .reduce((mask, option) => mask + numericValue(option.dataset.stageMonsterMaskOption), 0);
  const unknown = numericMask(field.dataset.stageMonsterMaskUnknown);
  setMonsterSpawnValue(spawn, field.dataset.stageMonsterMask, selected + unknown);
}

function stageMonsterRecordLabel(source, valueId, emptyValue, emptyLabel, unknownLabel) {
  if (String(valueId) === String(emptyValue)) {
    return `${emptyLabel} (${emptyValue})`;
  }
  const record = recordById(source, valueId);
  return record ? `${record.name} (${record.id})` : `${unknownLabel} (${valueId})`;
}

function renderStageMonsterRecordSearchField(spawn, { label, path, source, emptyValue, emptyLabel, unknownLabel, placeholder, tooltip = "" }) {
  return `
    <label class="questor-record-field">
      <span class="label-row">${escapeHtml(label)} ${tooltip ? `<button type="button" class="tooltip-button" aria-label="${escapeHtml(label)} help" data-tooltip="${escapeHtml(tooltip)}">?</button>` : ""}</span>
      <input data-stage-monster-record-search data-mspath="${escapeHtml(path)}" data-source="${escapeHtml(source)}" data-empty-value="${escapeHtml(emptyValue)}" data-empty-label="${escapeHtml(emptyLabel)}" type="search" placeholder="${escapeHtml(placeholder)}">
      <div class="autocomplete-list" data-stage-monster-record-suggestions></div>
      <div class="selected-entity">
        <span>Selected:</span>
        <button type="button" class="clear-selected" data-clear-stage-monster-record data-mspath="${escapeHtml(path)}" data-empty-value="${escapeHtml(emptyValue)}" aria-label="Reset ${escapeHtml(label)}">x</button>
        <span>${escapeHtml(stageMonsterRecordLabel(source, monsterSpawnValue(spawn, path), emptyValue, emptyLabel, unknownLabel))}</span>
      </div>
    </label>
  `;
}

function renderStageMonsterRecordSuggestions(input) {
  const wrapper = input.closest(".questor-record-field");
  const suggestions = wrapper?.querySelector("[data-stage-monster-record-suggestions]");
  if (!wrapper || !suggestions) {
    return;
  }
  const source = input.dataset.source || "";
  const path = input.dataset.mspath || "";
  const query = input.value.trim().toLowerCase();
  const matches = recordRows(source)
    .filter((record) => query === "" || String(record.name || "").toLowerCase().includes(query))
    .slice(0, 25);
  const emptyValue = input.dataset.emptyValue || "0";
  const emptyLabel = input.dataset.emptyLabel || "None";
  suggestions.innerHTML = [
    `<button type="button" class="autocomplete-option" data-stage-monster-record-id="${escapeHtml(emptyValue)}" data-mspath="${escapeHtml(path)}">${escapeHtml(emptyLabel)} (${escapeHtml(emptyValue)})</button>`,
    ...matches.map((record) => `<button type="button" class="autocomplete-option" data-stage-monster-record-id="${escapeHtml(record.id)}" data-mspath="${escapeHtml(path)}">${escapeHtml(record.name)} (${escapeHtml(record.id)})</button>`),
  ].join("");
  suggestions.classList.add("is-open");
  suggestions.style.display = "grid";
}

function renderStageMonsterMapField(spawn) {
  return `
    <label class="questor-record-field">
      Map file
      <input data-stage-monster-map-search type="search" placeholder="Search map templates">
      <div class="autocomplete-list" data-stage-monster-map-suggestions></div>
      <div class="selected-entity">
        <span>Selected:</span>
        <button type="button" class="clear-selected" data-clear-stage-monster-map aria-label="Clear monster spawn map file">x</button>
        <span>${escapeHtml(questorRecordLabel("templates", spawn.location.map, "-", "None", "Unknown map file"))}</span>
      </div>
    </label>
  `;
}

function renderStageMonsterMapSuggestions(input) {
  const wrapper = input.closest(".questor-record-field");
  const suggestions = wrapper?.querySelector("[data-stage-monster-map-suggestions]");
  if (!wrapper || !suggestions) {
    return;
  }
  const query = input.value.trim().toLowerCase();
  const matches = recordRows("templates")
    .filter((record) => query === "" || String(record.name || "").toLowerCase().includes(query))
    .slice(0, 25);
  suggestions.innerHTML = [
    '<button type="button" class="autocomplete-option" data-stage-monster-map-id="-">None (-)</button>',
    ...matches.map((record) => `<button type="button" class="autocomplete-option" data-stage-monster-map-id="${escapeHtml(record.id)}">${escapeHtml(record.name)} (${escapeHtml(record.id)})</button>`),
  ].join("");
  suggestions.classList.add("is-open");
  suggestions.style.display = "grid";
}

function closeStageMonsterSuggestions() {
  stageEditor?.querySelectorAll("[data-stage-monster-record-suggestions], [data-stage-monster-map-suggestions]").forEach((suggestions) => {
    suggestions.innerHTML = "";
    suggestions.classList.remove("is-open");
    suggestions.style.display = "";
  });
}

function killGoalQInfoNumber(goal) {
  const number = String(goal.goal || "1");
  return goal.optional ? `-${number}` : number;
}

function killGoalFromElement(element) {
  const item = element.closest("[data-kill-goal-id]");
  const uiId = item?.dataset.killGoalId || "";
  const stage = selectedEditorStage();
  return stage?.goals.find((goal) => goal.uiId === uiId) || null;
}

function killGoalRecordLabel(source, valueId, anyLabel, unknownLabel) {
  if (String(valueId) === "-1") {
    return `${anyLabel} (-1)`;
  }
  const record = recordById(source, valueId);
  return record ? `${record.name} (${record.id})` : `${unknownLabel} (${valueId})`;
}

function renderKillGoalRecordSearchField(goal, type, valueId, index) {
  const source = type === "ridx" ? "monsters" : "monsterEgos";
  const label = type === "ridx" ? "Monster ID" : "Monster ego ID";
  const anyLabel = type === "ridx" ? "Any monster" : "Any ego";
  const unknownLabel = type === "ridx" ? "Unknown monster" : "Unknown ego";
  const placeholder = type === "ridx" ? "Search monsters" : "Search monster egos";
  return `
    <div class="questor-record-field" data-kill-record-index="${index}" data-kill-record-type="${escapeHtml(type)}">
      <label>
        ${escapeHtml(label)}
        <input data-kill-record-search data-source="${escapeHtml(source)}" type="search" placeholder="${escapeHtml(placeholder)}">
      </label>
      <div class="autocomplete-list" data-kill-record-suggestions></div>
      <div class="selected-entity">
        <span>Selected:</span>
        <button type="button" class="clear-selected" data-remove-kill-record="${escapeHtml(type)}" data-index="${index}" aria-label="Remove ${escapeHtml(label)}">x</button>
        <span>${escapeHtml(killGoalRecordLabel(source, valueId, anyLabel, unknownLabel))}</span>
      </div>
    </div>
  `;
}

function renderKillRecordSuggestions(input) {
  const wrapper = input.closest("[data-kill-record-index]");
  const suggestions = wrapper?.querySelector("[data-kill-record-suggestions]");
  if (!wrapper || !suggestions) {
    return;
  }
  const source = input.dataset.source || "";
  const type = wrapper.dataset.killRecordType || "ridx";
  const query = input.value.trim().toLowerCase();
  const matches = recordRows(source)
    .filter((record) => query === "" || String(record.name || "").toLowerCase().includes(query))
    .slice(0, 25);
  const anyLabel = type === "ridx" ? "Any monster" : "Any ego";
  suggestions.innerHTML = [
    `<button type="button" class="autocomplete-option" data-kill-record-id="-1">${escapeHtml(anyLabel)} (-1)</button>`,
    ...matches.map((record) => `<button type="button" class="autocomplete-option" data-kill-record-id="${escapeHtml(record.id)}">${escapeHtml(record.name)} (${escapeHtml(record.id)})</button>`),
  ].join("");
  suggestions.classList.add("is-open");
  suggestions.style.display = "grid";
}

function closeKillRecordSuggestions() {
  stageEditor?.querySelectorAll("[data-kill-record-suggestions]").forEach((suggestions) => {
    suggestions.innerHTML = "";
    suggestions.classList.remove("is-open");
    suggestions.style.display = "";
  });
}

function retrieveGoalQInfoNumber(goal) {
  const number = String(goal.goal || "1");
  return goal.optional ? `-${number}` : number;
}

function retrieveGoalFromElement(element) {
  const item = element.closest("[data-retrieve-goal-id]");
  const uiId = item?.dataset.retrieveGoalId || "";
  const stage = selectedEditorStage();
  return stage?.retrieveGoals.find((goal) => goal.uiId === uiId) || null;
}

function retrieveValueFromElement(element) {
  const goal = retrieveGoalFromElement(element);
  const wrapper = element.closest("[data-retrieve-value-index]");
  const index = Number(wrapper?.dataset.retrieveValueIndex || "-1");
  return goal?.values[index] || null;
}

function retrieveItemLabel(valueId) {
  const id = String(valueId || "-1:-1");
  if (id === "-1:-1") {
    return "Any item (-1:-1)";
  }
  const record = recordById("items", id);
  return record ? `${record.name} (${record.id})` : `Unknown item (${id})`;
}

function retrieveValueRecordLabel(source, id, unknownLabel) {
  const valueId = String(id || "-1");
  if (valueId === "-1") {
    return "Any (-1)";
  }
  if (valueId === "-2") {
    return "Any non-zero (-2)";
  }
  if (valueId === "-3") {
    return "Not checked (-3)";
  }
  const record = recordById(source, valueId);
  return record ? `${record.name} (${record.id})` : `${unknownLabel} (${valueId})`;
}

function renderRetrieveItemSearchField(goal, valueId, index) {
  return `
    <div class="questor-record-field" data-retrieve-item-index="${index}">
      <label>
        Item tval/sval
        <input data-retrieve-item-search type="search" placeholder="Search items">
      </label>
      <div class="autocomplete-list" data-retrieve-item-suggestions></div>
      <div class="selected-entity">
        <span>Selected:</span>
        <button type="button" class="clear-selected" data-remove-retrieve-item="${index}" aria-label="Remove retrieve item">x</button>
        <span>${escapeHtml(retrieveItemLabel(valueId))}</span>
      </div>
    </div>
  `;
}

function renderRetrieveItemSuggestions(input) {
  const wrapper = input.closest("[data-retrieve-item-index]");
  const suggestions = wrapper?.querySelector("[data-retrieve-item-suggestions]");
  if (!wrapper || !suggestions) {
    return;
  }
  const query = input.value.trim().toLowerCase();
  const matches = recordRows("items")
    .filter((record) => query === "" || String(record.name || "").toLowerCase().includes(query))
    .slice(0, 25);
  suggestions.innerHTML = [
    '<button type="button" class="autocomplete-option" data-retrieve-item-id="-1:-1">Any item (-1:-1)</button>',
    ...matches.map((record) => `<button type="button" class="autocomplete-option" data-retrieve-item-id="${escapeHtml(record.id)}">${escapeHtml(record.name)} (${escapeHtml(record.id)})</button>`),
  ].join("");
  suggestions.classList.add("is-open");
  suggestions.style.display = "grid";
}

function renderRetrieveValueRecordField(value, path, label, source, placeholder, unknownLabel) {
  const currentId = value[path] || "-1";
  return `
    <div class="questor-record-field" data-retrieve-value-record="${escapeHtml(path)}">
      <label>
        ${escapeHtml(label)}
        <input data-retrieve-value-record-search data-source="${escapeHtml(source)}" type="search" placeholder="${escapeHtml(placeholder)}">
      </label>
      <div class="autocomplete-list" data-retrieve-value-record-suggestions></div>
      <div class="selected-entity">
        <span>Selected:</span>
        <button type="button" class="clear-selected" data-clear-retrieve-value-record="${escapeHtml(path)}" aria-label="Reset ${escapeHtml(label)}">x</button>
        <span>${escapeHtml(retrieveValueRecordLabel(source, currentId, unknownLabel))}</span>
      </div>
    </div>
  `;
}

function renderRetrieveValueRecordSuggestions(input) {
  const wrapper = input.closest("[data-retrieve-value-record]");
  const suggestions = wrapper?.querySelector("[data-retrieve-value-record-suggestions]");
  if (!wrapper || !suggestions) {
    return;
  }
  const source = input.dataset.source || "";
  const query = input.value.trim().toLowerCase();
  const matches = recordRows(source)
    .filter((record) => query === "" || String(record.name || "").toLowerCase().includes(query))
    .slice(0, 25);
  suggestions.innerHTML = [
    '<button type="button" class="autocomplete-option" data-retrieve-value-record-id="-1">Any (-1)</button>',
    '<button type="button" class="autocomplete-option" data-retrieve-value-record-id="-2">Any non-zero (-2)</button>',
    '<button type="button" class="autocomplete-option" data-retrieve-value-record-id="-3">Not checked (-3)</button>',
    ...matches.map((record) => `<button type="button" class="autocomplete-option" data-retrieve-value-record-id="${escapeHtml(record.id)}">${escapeHtml(record.name)} (${escapeHtml(record.id)})</button>`),
  ].join("");
  suggestions.classList.add("is-open");
  suggestions.style.display = "grid";
}

function closeRetrieveSuggestions() {
  stageEditor?.querySelectorAll("[data-retrieve-item-suggestions], [data-retrieve-value-record-suggestions]").forEach((suggestions) => {
    suggestions.innerHTML = "";
    suggestions.classList.remove("is-open");
    suggestions.style.display = "";
  });
}

function goalFromElement(element) {
  return killGoalFromElement(element) || retrieveGoalFromElement(element);
}

function goalTargetLine(stageId, goalNumber, target) {
  return `P:${stageId}:${goalNumber}:${target.wx}:${target.wy}:${target.wz}:${target.terrainPatch}:${target.x}:${target.y}:${target.radius}:${target.map || "-"}:${target.mapX}:${target.mapY}`;
}

function renderGoalTargetMapField(target) {
  return `
    <label class="questor-record-field">
      Map file
      <input data-goal-target-map-search type="search" placeholder="Search map templates">
      <div class="autocomplete-list" data-goal-target-map-suggestions></div>
      <div class="selected-entity">
        <span>Selected:</span>
        <button type="button" class="clear-selected" data-clear-goal-target-map aria-label="Clear target map file">x</button>
        <span>${escapeHtml(questorRecordLabel("templates", target.map, "-", "None", "Unknown map file"))}</span>
      </div>
    </label>
  `;
}

function renderGoalTargetMapSuggestions(input) {
  const wrapper = input.closest(".questor-record-field");
  const suggestions = wrapper?.querySelector("[data-goal-target-map-suggestions]");
  if (!wrapper || !suggestions) {
    return;
  }
  const query = input.value.trim().toLowerCase();
  const matches = recordRows("templates")
    .filter((record) => query === "" || String(record.name || "").toLowerCase().includes(query))
    .slice(0, 25);
  suggestions.innerHTML = [
    '<button type="button" class="autocomplete-option" data-goal-target-map-id="-">None (-)</button>',
    ...matches.map((record) => `<button type="button" class="autocomplete-option" data-goal-target-map-id="${escapeHtml(record.id)}">${escapeHtml(record.name)} (${escapeHtml(record.id)})</button>`),
  ].join("");
  suggestions.classList.add("is-open");
  suggestions.style.display = "grid";
}

function closeGoalTargetMapSuggestions() {
  stageEditor?.querySelectorAll("[data-goal-target-map-suggestions]").forEach((suggestions) => {
    suggestions.innerHTML = "";
    suggestions.classList.remove("is-open");
    suggestions.style.display = "";
  });
}

function renderGoalTarget(goal) {
  const target = goal.target || defaultGoalTarget();
  return `
    <div class="stage-features">
      <label class="checkbox-field">
        <input data-goal-target-enabled type="checkbox" ${target.enabled ? "checked" : ""}>
        Require target location (P)
      </label>
      ${target.enabled ? `
        <div class="positioning-group">
          <div class="positioning-group-title">P: target location</div>
          <div class="positioning-subgroup">
            <div class="positioning-subgroup-title">World position + terrain</div>
            <div class="positioning-subgroup-grid">
              <div class="coordinate-group">
                <div class="coordinate-group-title">World coordinates</div>
                <div class="coordinate-group-grid">
                  <label>World X <input data-goal-target-prop="wx" type="number" value="${escapeHtml(target.wx)}"></label>
                  <label>World Y <input data-goal-target-prop="wy" type="number" value="${escapeHtml(target.wy)}"></label>
                  <label>World Z <input data-goal-target-prop="wz" type="number" value="${escapeHtml(target.wz)}"></label>
                </div>
              </div>
              <label>
                <span class="label-row">Terrain patch <button type="button" class="tooltip-button" aria-label="P terrain patch help" data-tooltip="0 = exact selected world sector. 1 = accept connected nearby wilderness sectors of the same terrain type.">?</button></span>
                <select data-goal-target-prop="terrainPatch">
                  ${[["0", "0 - no"], ["1", "1 - yes"]].map(([optionValue, text]) => `<option value="${optionValue}" ${String(target.terrainPatch) === optionValue ? "selected" : ""}>${text}</option>`).join("")}
                </select>
              </label>
            </div>
          </div>
          <div class="positioning-subgroup">
            <div class="positioning-subgroup-title">Grid position</div>
            <div class="positioning-subgroup-grid">
              <label>Grid X <input data-goal-target-prop="x" type="number" value="${escapeHtml(target.x)}"></label>
              <label>Grid Y <input data-goal-target-prop="y" type="number" value="${escapeHtml(target.y)}"></label>
              <label>Radius <input data-goal-target-prop="radius" type="number" min="0" value="${escapeHtml(target.radius)}"></label>
            </div>
          </div>
          <div class="positioning-subgroup">
            <div class="positioning-subgroup-title">Map position</div>
            <div class="positioning-subgroup-grid">
              ${renderGoalTargetMapField(target)}
              <label>Map offset X <input data-goal-target-prop="mapX" type="number" value="${escapeHtml(target.mapX)}"></label>
              <label>Map offset Y <input data-goal-target-prop="mapY" type="number" value="${escapeHtml(target.mapY)}"></label>
            </div>
          </div>
        </div>
      ` : '<div class="stage-block-note">No P line emitted for this goal.</div>'}
    </div>
  `;
}

function deliveryGoalFromElement(element) {
  const item = element.closest("[data-delivery-goal-id]");
  const uiId = item?.dataset.deliveryGoalId || "";
  const stage = selectedEditorStage();
  return stage?.deliveryGoals.find((goal) => goal.uiId === uiId) || null;
}

function deliveryInput(goal, label, path, tooltip, attrs = "") {
  return `
    <label>
      <span class="label-row">${escapeHtml(label)} <button type="button" class="tooltip-button" aria-label="${escapeHtml(label)} help" data-tooltip="${escapeHtml(tooltip)}">?</button></span>
      <input data-delivery-prop="${escapeHtml(path)}" type="number" value="${escapeHtml(goal[path])}" ${attrs}>
    </label>
  `;
}

function deliveryQuestorOptions(current) {
  const options = [["-1", "None (-1)"], ...questors.map((questor, questorIndex) => [String(questorIndex), `#${questorIndex}: ${questor.name || "Unnamed questor"}`])];
  const hasCurrent = options.some(([value]) => value === String(current));
  return `
    <label>
      <span class="label-row">Return to questor <button type="button" class="tooltip-button" aria-label="Return questor help" data-tooltip="When not -1, delivery is completed by bumping/talking to this questor. This takes precedence over the location fields, but q_info still stores all location values.">?</button></span>
      <select data-delivery-prop="returnQuestor">
        ${hasCurrent ? "" : `<option value="${escapeHtml(current)}" selected>Current: ${escapeHtml(current)} (unknown)</option>`}
        ${options.map(([value, text]) => `<option value="${escapeHtml(value)}" ${String(current) === value ? "selected" : ""}>${escapeHtml(text)}</option>`).join("")}
      </select>
    </label>
  `;
}

function deliveryLine(stageId, goal) {
  return `M:${stageId}:${deliveryGoalQInfoNumber(goal)}:${goal.returnQuestor}:${goal.wx}:${goal.wy}:${goal.wz}:${goal.terrainPatch}:${goal.x}:${goal.y}:${goal.radius}:${goal.map || "-"}:${goal.mapX}:${goal.mapY}`;
}

function renderDeliveryMapField(goal) {
  return `
    <label class="questor-record-field">
      Map file
      <input data-delivery-map-search type="search" placeholder="Search map templates">
      <div class="autocomplete-list" data-delivery-map-suggestions></div>
      <div class="selected-entity">
        <span>Selected:</span>
        <button type="button" class="clear-selected" data-clear-delivery-map aria-label="Clear delivery map file">x</button>
        <span>${escapeHtml(questorRecordLabel("templates", goal.map, "-", "None", "Unknown map file"))}</span>
      </div>
    </label>
  `;
}

function renderDeliveryMapSuggestions(input) {
  const wrapper = input.closest(".questor-record-field");
  const suggestions = wrapper?.querySelector("[data-delivery-map-suggestions]");
  if (!wrapper || !suggestions) {
    return;
  }
  const query = input.value.trim().toLowerCase();
  const matches = recordRows("templates")
    .filter((record) => query === "" || String(record.name || "").toLowerCase().includes(query))
    .slice(0, 25);
  suggestions.innerHTML = [
    '<button type="button" class="autocomplete-option" data-delivery-map-id="-">None (-)</button>',
    ...matches.map((record) => `<button type="button" class="autocomplete-option" data-delivery-map-id="${escapeHtml(record.id)}">${escapeHtml(record.name)} (${escapeHtml(record.id)})</button>`),
  ].join("");
  suggestions.classList.add("is-open");
  suggestions.style.display = "grid";
}

function closeDeliveryMapSuggestions() {
  stageEditor?.querySelectorAll("[data-delivery-map-suggestions]").forEach((suggestions) => {
    suggestions.innerHTML = "";
    suggestions.classList.remove("is-open");
    suggestions.style.display = "";
  });
}

function renderDeliveryGoal(goal, index) {
  return `
    <div class="stage-feature-entry" data-delivery-goal-id="${escapeHtml(goal.uiId)}">
      <div class="stage-feature-head">
        <strong>Delivery goal #${index + 1}: ${escapeHtml(deliveryGoalQInfoNumber(goal))}</strong>
        <div class="stage-feature-actions">
          <button type="button" data-move-delivery-goal="-1" ${index === 0 ? "disabled" : ""} aria-label="Move delivery goal up">↑</button>
          <button type="button" data-move-delivery-goal="1" ${index === selectedEditorStage().deliveryGoals.length - 1 ? "disabled" : ""} aria-label="Move delivery goal down">↓</button>
          <button type="button" data-duplicate-delivery-goal ${selectedEditorStage().deliveryGoals.length >= 5 ? "disabled" : ""}>Duplicate</button>
          <button type="button" data-remove-delivery-goal>Remove</button>
        </div>
      </div>
      <div class="questor-wide-group-grid">
        <label>
          <span class="label-row">Goal number <button type="button" class="tooltip-button" aria-label="Delivery goal number help" data-tooltip="q_info goal numbers are 1..5. Negative numbers mark optional goals. The UI stores the absolute number here and uses the Optional checkbox for the sign.">?</button></span>
          <input data-delivery-prop="goal" type="number" min="1" max="5" value="${escapeHtml(goal.goal)}">
        </label>
        <label class="checkbox-field">
          <input data-delivery-optional type="checkbox" ${goal.optional ? "checked" : ""}>
          Optional goal
        </label>
        ${deliveryQuestorOptions(goal.returnQuestor)}
      </div>
      ${renderGoalChangeFlags(goal)}
      <div class="positioning-group">
        <div class="positioning-group-title">M: delivery / travel location</div>
        <div class="positioning-subgroup">
          <div class="positioning-subgroup-title">World position + terrain</div>
          <div class="positioning-subgroup-grid">
            <div class="coordinate-group">
              <div class="coordinate-group-title">World coordinates</div>
              <div class="coordinate-group-grid">
                ${deliveryInput(goal, "World X", "wx", "Exact world X for delivery/travel location.")}
                ${deliveryInput(goal, "World Y", "wy", "Exact world Y for delivery/travel location.")}
                ${deliveryInput(goal, "World Z", "wz", "0 is surface; negative is dungeon depth; positive is tower level.")}
              </div>
            </div>
            <label>
              <span class="label-row">Terrain patch <button type="button" class="tooltip-button" aria-label="Delivery terrain patch help" data-tooltip="0 = exact selected world sector. 1 = accept connected nearby wilderness sectors of the same terrain type.">?</button></span>
              <select data-delivery-prop="terrainPatch">
                ${[["0", "0 - no"], ["1", "1 - yes"]].map(([value, text]) => `<option value="${value}" ${String(goal.terrainPatch) === value ? "selected" : ""}>${text}</option>`).join("")}
              </select>
            </label>
          </div>
        </div>
        <div class="positioning-subgroup">
          <div class="positioning-subgroup-title">Grid position</div>
          <div class="positioning-subgroup-grid">
            ${deliveryInput(goal, "Grid X", "x", "-1 disables exact grid delivery; otherwise this is the target grid X.")}
            ${deliveryInput(goal, "Grid Y", "y", "Target grid Y. Used with Grid X and Radius.")}
            ${deliveryInput(goal, "Radius", "radius", "Allowed distance around Grid X/Y. 0 means exact grid position.", 'min="0"')}
          </div>
        </div>
        <div class="positioning-subgroup">
          <div class="positioning-subgroup-title">Map position</div>
          <div class="positioning-subgroup-grid">
            ${renderDeliveryMapField(goal)}
            ${deliveryInput(goal, "Map offset X", "mapX", "Template X offset when a map file is used.")}
            ${deliveryInput(goal, "Map offset Y", "mapY", "Template Y offset when a map file is used.")}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderKillGoal(goal, index) {
  return `
    <div class="stage-feature-entry" data-kill-goal-id="${escapeHtml(goal.uiId)}">
      <div class="stage-feature-head">
        <strong>Kill goal #${index + 1}: ${escapeHtml(killGoalQInfoNumber(goal))}</strong>
        <div class="stage-feature-actions">
          <button type="button" data-move-kill-goal="-1" ${index === 0 ? "disabled" : ""} aria-label="Move kill goal up">↑</button>
          <button type="button" data-move-kill-goal="1" ${index === selectedEditorStage().goals.length - 1 ? "disabled" : ""} aria-label="Move kill goal down">↓</button>
          <button type="button" data-duplicate-kill-goal ${selectedEditorStage().goals.length >= 5 ? "disabled" : ""}>Duplicate</button>
          <button type="button" data-remove-kill-goal>Remove</button>
        </div>
      </div>
      <div class="questor-wide-group-grid">
        <label>
          <span class="label-row">Goal number <button type="button" class="tooltip-button" aria-label="Kill goal number help" data-tooltip="q_info goal numbers are 1..5. Negative numbers mark optional goals. The UI stores the absolute number here and uses the Optional checkbox for the sign.">?</button></span>
          <input data-kill-prop="goal" type="number" min="1" max="5" value="${escapeHtml(goal.goal)}">
        </label>
        <label class="checkbox-field">
          <input data-kill-optional type="checkbox" ${goal.optional ? "checked" : ""}>
          Optional goal
        </label>
        <label>
          <span class="label-row">Min level <button type="button" class="tooltip-button" aria-label="Kill min level help" data-tooltip="Minimum monster level. 0 means any minimum level. Applies together with other kill criteria.">?</button></span>
          <input data-kill-prop="minlev" type="number" min="0" max="255" value="${escapeHtml(goal.minlev)}">
        </label>
        <label>
          <span class="label-row">Max level <button type="button" class="tooltip-button" aria-label="Kill max level help" data-tooltip="Maximum monster level. 0 means any maximum level. Applies together with other kill criteria.">?</button></span>
          <input data-kill-prop="maxlev" type="number" min="0" max="255" value="${escapeHtml(goal.maxlev)}">
        </label>
        <label>
          <span class="label-row">Kill count <button type="button" class="tooltip-button" aria-label="Kill count help" data-tooltip="How many matching monsters must be killed for this goal.">?</button></span>
          <input data-kill-prop="number" type="number" min="1" value="${escapeHtml(goal.number)}">
        </label>
      </div>
      ${renderGoalChangeFlags(goal)}
      ${renderGoalTarget(goal)}
      <div class="stage-features">
        <div class="stage-feature-section-head">
          <div>
            <div class="stage-auto-subtitle">kI: monster IDs</div>
            <div class="stage-block-note">Specific monster records. Stored as IDs only. ${goal.ridx.length} of 10.</div>
          </div>
          <button type="button" data-add-kill-criterion="ridx" ${goal.ridx.length >= 10 ? "disabled" : ""}>Add monster</button>
        </div>
        ${goal.ridx.length ? `<div class="questor-wide-group-grid">${goal.ridx.map((valueId, valueIndex) => renderKillGoalRecordSearchField(goal, "ridx", valueId, valueIndex)).join("")}</div>` : '<div class="stage-block-note">No kI line emitted.</div>'}
      </div>
      <div class="stage-features">
        <div class="stage-feature-section-head">
          <div>
            <div class="stage-auto-subtitle">kE: monster ego IDs</div>
            <div class="stage-block-note">Specific monster ego records. Stored as IDs only. ${goal.reidx.length} of 10.</div>
          </div>
          <button type="button" data-add-kill-criterion="reidx" ${goal.reidx.length >= 10 ? "disabled" : ""}>Add ego</button>
        </div>
        ${goal.reidx.length ? `<div class="questor-wide-group-grid">${goal.reidx.map((valueId, valueIndex) => renderKillGoalRecordSearchField(goal, "reidx", valueId, valueIndex)).join("")}</div>` : '<div class="stage-block-note">No kE line emitted.</div>'}
      </div>
      <div class="stage-features">
        <div class="stage-feature-section-head">
          <div>
            <div class="stage-auto-subtitle">kV: visual filters</div>
            <div class="stage-block-note">Monster display character and attr pairs. '-' means any. ${goal.visuals.length} of 5.</div>
          </div>
          <button type="button" data-add-kill-criterion="visuals" ${goal.visuals.length >= 5 ? "disabled" : ""}>Add visual</button>
        </div>
        ${goal.visuals.length ? `<div class="stage-feature-list">${goal.visuals.map((visual, valueIndex) => `
          <div class="stage-feature-entry" data-kill-visual-index="${valueIndex}">
            <div class="stage-feature-head">
              <strong>Visual #${valueIndex + 1}</strong>
              <button type="button" data-remove-kill-visual="${valueIndex}">Remove</button>
            </div>
            <div class="questor-wide-group-grid">
              <label>
                Char
                <input data-kill-visual-prop="char" maxlength="1" value="${escapeHtml(visual.char)}">
              </label>
              <label>
                Attr
                <select data-kill-visual-prop="attr">
                  ${[["-", "- - any attr"], ...visualAttrOptions].map(([optionValue, text]) => `<option value="${escapeHtml(optionValue)}" ${String(visual.attr) === optionValue ? "selected" : ""}>${escapeHtml(text)}</option>`).join("")}
                </select>
              </label>
            </div>
          </div>
        `).join("")}</div>` : '<div class="stage-block-note">No kV line emitted.</div>'}
      </div>
      <div class="stage-features">
        <div class="stage-feature-section-head">
          <div>
            <div class="stage-auto-subtitle">kN: partial names</div>
            <div class="stage-block-note">Case-sensitive partial monster names. ${goal.names.length} of 5.</div>
          </div>
          <button type="button" data-add-kill-criterion="names" ${goal.names.length >= 5 ? "disabled" : ""}>Add name</button>
        </div>
        ${goal.names.length ? `<div class="questor-wide-group-grid">${goal.names.map((name, valueIndex) => `
          <label data-kill-name-index="${valueIndex}">
            Partial name
            <span class="inline-field-row">
              <input data-kill-name type="text" maxlength="40" value="${escapeHtml(name)}">
              <button type="button" data-remove-kill-name="${valueIndex}" aria-label="Remove partial name">x</button>
            </span>
          </label>
        `).join("")}</div>` : '<div class="stage-block-note">No kN line emitted.</div>'}
      </div>
    </div>
  `;
}

function renderRetrieveValue(value, index) {
  return `
    <div class="stage-feature-entry" data-retrieve-value-index="${index}">
      <div class="stage-feature-head">
        <strong>Value filter #${index + 1}</strong>
        <button type="button" data-remove-retrieve-value="${index}">Remove</button>
      </div>
      <div class="questor-wide-group-grid">
        <label>
          <span class="label-row">pval <button type="button" class="tooltip-button" aria-label="Retrieve pval help" data-tooltip="-9999 means any pval. Other integers are matched as the source-code pval criterion for retrieved objects.">?</button></span>
          <input data-retrieve-value-prop="pval" type="number" value="${escapeHtml(value.pval)}">
        </label>
        <label>
          <span class="label-row">bpval <button type="button" class="tooltip-button" aria-label="Retrieve bpval help" data-tooltip="-9999 means any bpval. Other integers are matched as the source-code bpval criterion for retrieved objects.">?</button></span>
          <input data-retrieve-value-prop="bpval" type="number" value="${escapeHtml(value.bpval)}">
        </label>
        <label>
          <span class="label-row">Attr <button type="button" class="tooltip-button" aria-label="Retrieve attr help" data-tooltip="'-' means any color. Otherwise this is a TomeNET color character for the retrieved object's display color.">?</button></span>
          <select data-retrieve-value-prop="attr">
            ${[["-", "- - any attr"], ...visualAttrOptions].map(([optionValue, text]) => `<option value="${escapeHtml(optionValue)}" ${String(value.attr) === optionValue ? "selected" : ""}>${escapeHtml(text)}</option>`).join("")}
          </select>
        </label>
        ${renderRetrieveValueRecordField(value, "name1", "Artifact name1", "artifacts", "Search artifacts", "Unknown artifact")}
        ${renderRetrieveValueRecordField(value, "name2", "Ego name2", "egoItems", "Search ego items", "Unknown ego item")}
        ${renderRetrieveValueRecordField(value, "name2b", "Ego name2b", "egoItems", "Search ego items", "Unknown ego item")}
      </div>
    </div>
  `;
}

function renderRetrieveGoal(goal, index) {
  return `
    <div class="stage-feature-entry" data-retrieve-goal-id="${escapeHtml(goal.uiId)}">
      <div class="stage-feature-head">
        <strong>Retrieve goal #${index + 1}: ${escapeHtml(retrieveGoalQInfoNumber(goal))}</strong>
        <div class="stage-feature-actions">
          <button type="button" data-move-retrieve-goal="-1" ${index === 0 ? "disabled" : ""} aria-label="Move retrieve goal up">↑</button>
          <button type="button" data-move-retrieve-goal="1" ${index === selectedEditorStage().retrieveGoals.length - 1 ? "disabled" : ""} aria-label="Move retrieve goal down">↓</button>
          <button type="button" data-duplicate-retrieve-goal ${selectedEditorStage().retrieveGoals.length >= 5 ? "disabled" : ""}>Duplicate</button>
          <button type="button" data-remove-retrieve-goal>Remove</button>
        </div>
      </div>
      <div class="questor-wide-group-grid">
        <label>
          <span class="label-row">Goal number <button type="button" class="tooltip-button" aria-label="Retrieve goal number help" data-tooltip="q_info goal numbers are 1..5. Negative numbers mark optional goals. The UI stores the absolute number here and uses the Optional checkbox for the sign.">?</button></span>
          <input data-retrieve-prop="goal" type="number" min="1" max="5" value="${escapeHtml(goal.goal)}">
        </label>
        <label class="checkbox-field">
          <input data-retrieve-optional type="checkbox" ${goal.optional ? "checked" : ""}>
          Optional goal
        </label>
        <label>
          <span class="label-row">Minimum value <button type="button" class="tooltip-button" aria-label="Retrieve minimum value help" data-tooltip="Minimum object value required for this retrieve goal. 0 disables the practical value threshold.">?</button></span>
          <input data-retrieve-prop="minValue" type="number" min="0" value="${escapeHtml(goal.minValue)}">
        </label>
        <label>
          <span class="label-row">Item count <button type="button" class="tooltip-button" aria-label="Retrieve count help" data-tooltip="How many matching item stack units must be collected for this goal.">?</button></span>
          <input data-retrieve-prop="number" type="number" min="1" value="${escapeHtml(goal.number)}">
        </label>
        <label class="checkbox-field">
          <input data-retrieve-allow-owned type="checkbox" ${goal.allowOwned ? "checked" : ""}>
          Allow owned items
        </label>
      </div>
      ${renderGoalChangeFlags(goal)}
      ${renderGoalTarget(goal)}
      <div class="stage-features">
        <div class="stage-feature-section-head">
          <div>
            <div class="stage-auto-subtitle">rI: item tval/sval pairs</div>
            <div class="stage-block-note">Specific item records. Stored as tval:sval pairs only. ${goal.items.length} of 10.</div>
          </div>
          <button type="button" data-add-retrieve-criterion="items" ${goal.items.length >= 10 ? "disabled" : ""}>Add item</button>
        </div>
        ${goal.items.length ? `<div class="questor-wide-group-grid">${goal.items.map((valueId, valueIndex) => renderRetrieveItemSearchField(goal, valueId, valueIndex)).join("")}</div>` : '<div class="stage-block-note">No rI line emitted.</div>'}
      </div>
      <div class="stage-features">
        <div class="stage-feature-section-head">
          <div>
            <div class="stage-auto-subtitle">rV: value and magic filters</div>
            <div class="stage-block-note">pval, bpval, attr, artifact, and ego filters. ${goal.values.length} of 5.</div>
          </div>
          <button type="button" data-add-retrieve-criterion="values" ${goal.values.length >= 5 ? "disabled" : ""}>Add value filter</button>
        </div>
        ${goal.values.length ? `<div class="stage-feature-list">${goal.values.map(renderRetrieveValue).join("")}</div>` : '<div class="stage-block-note">No rV line emitted.</div>'}
      </div>
      <div class="stage-features">
        <div class="stage-feature-section-head">
          <div>
            <div class="stage-auto-subtitle">rN: partial names</div>
            <div class="stage-block-note">Case-sensitive partial item names. ${goal.names.length} of 5.</div>
          </div>
          <button type="button" data-add-retrieve-criterion="names" ${goal.names.length >= 5 ? "disabled" : ""}>Add name</button>
        </div>
        ${goal.names.length ? `<div class="questor-wide-group-grid">${goal.names.map((name, valueIndex) => `
          <label data-retrieve-name-index="${valueIndex}">
            Partial name
            <span class="inline-field-row">
              <input data-retrieve-name type="text" maxlength="40" value="${escapeHtml(name)}">
              <button type="button" data-remove-retrieve-name="${valueIndex}" aria-label="Remove partial name">x</button>
            </span>
          </label>
        `).join("")}</div>` : '<div class="stage-block-note">No rN line emitted.</div>'}
      </div>
    </div>
  `;
}

function renderStageGoals(stage) {
  return `
    <div class="stage-block">
      <div class="stage-block-title">Goals</div>
      <div class="stage-block-note">Kill goals use k lines. Retrieve goals use r lines. Delivery/travel goals use M lines. Completion transitions are edited in the next block.</div>
      <div class="stage-features">
        <div class="stage-feature-section-head">
          <div>
            <div class="stage-auto-subtitle">Kill goals</div>
            <div class="stage-block-note">${stage.goals.length} kill goal${stage.goals.length === 1 ? "" : "s"}.</div>
          </div>
          <button type="button" data-add-kill-goal ${stage.goals.length >= 5 ? "disabled" : ""}>Add kill goal</button>
        </div>
        ${stage.goals.length
          ? `<div class="stage-feature-list">${stage.goals.map((goal, index) => renderKillGoal(goal, index)).join("")}</div>`
          : '<div class="stage-block-note">No k lines emitted for this stage.</div>'}
      </div>
      <div class="stage-features">
        <div class="stage-feature-section-head">
          <div>
            <div class="stage-auto-subtitle">Retrieve goals</div>
            <div class="stage-block-note">${stage.retrieveGoals.length} retrieve goal${stage.retrieveGoals.length === 1 ? "" : "s"}.</div>
          </div>
          <button type="button" data-add-retrieve-goal ${stage.retrieveGoals.length >= 5 ? "disabled" : ""}>Add retrieve goal</button>
        </div>
        ${stage.retrieveGoals.length
          ? `<div class="stage-feature-list">${stage.retrieveGoals.map((goal, index) => renderRetrieveGoal(goal, index)).join("")}</div>`
          : '<div class="stage-block-note">No r lines emitted for this stage.</div>'}
      </div>
      <div class="stage-features">
        <div class="stage-feature-section-head">
          <div>
            <div class="stage-auto-subtitle">Delivery / travel goals</div>
            <div class="stage-block-note">${stage.deliveryGoals.length} delivery goal${stage.deliveryGoals.length === 1 ? "" : "s"}.</div>
          </div>
          <button type="button" data-add-delivery-goal ${stage.deliveryGoals.length >= 5 ? "disabled" : ""}>Add delivery goal</button>
        </div>
        ${stage.deliveryGoals.length
          ? `<div class="stage-feature-list">${stage.deliveryGoals.map((goal, index) => renderDeliveryGoal(goal, index)).join("")}</div>`
          : '<div class="stage-block-note">No M lines emitted for this stage.</div>'}
      </div>
    </div>
  `;
}

function renderStageCompletion(stage) {
  return `
    <div class="stage-block">
      <div class="stage-block-title">Completion And Rewards</div>
      <div class="stage-block-note">G advances stages. O gates rewards. R defines the reward slots.</div>
      <div class="stage-features">
        <div class="stage-feature-section-head">
          <div>
            <div class="stage-auto-subtitle">G: stage transitions</div>
            <div class="stage-block-note">${stage.completion.transitions.length} transition${stage.completion.transitions.length === 1 ? "" : "s"}.</div>
          </div>
          <button type="button" data-add-completion-transition ${stage.completion.transitions.length >= 5 ? "disabled" : ""}>Add transition</button>
        </div>
        ${stage.completion.transitions.length
          ? `<div class="stage-feature-list">${stage.completion.transitions.map((transition, index) => renderCompletionTransition(stage, transition, index)).join("")}</div>`
          : '<div class="stage-block-note">No G lines emitted for this stage.</div>'}
      </div>
      <div class="stage-features">
        <div class="stage-feature-section-head">
          <div>
            <div class="stage-auto-subtitle">O: reward conditions</div>
            <div class="stage-block-note">${stage.completion.rewardConditions.length} condition${stage.completion.rewardConditions.length === 1 ? "" : "s"}.</div>
          </div>
          <button type="button" data-add-reward-condition ${stage.completion.rewardConditions.length >= 10 ? "disabled" : ""}>Add condition</button>
        </div>
        ${stage.completion.rewardConditions.length
          ? `<div class="stage-feature-list">${stage.completion.rewardConditions.map((condition, index) => renderRewardCondition(stage, condition, index)).join("")}</div>`
          : '<div class="stage-block-note">No O lines emitted for this stage. If R rewards exist with no O lines, TomeNET treats them as free rewards.</div>'}
      </div>
      <div class="stage-features">
        <div class="stage-feature-section-head">
          <div>
            <div class="stage-auto-subtitle">R: reward definitions</div>
            <div class="stage-block-note">${stage.completion.rewards.length} reward${stage.completion.rewards.length === 1 ? "" : "s"}.</div>
          </div>
          <button type="button" data-add-stage-reward ${stage.completion.rewards.length >= 10 ? "disabled" : ""}>Add reward</button>
        </div>
        ${stage.completion.rewards.length
          ? `<div class="stage-feature-list">${stage.completion.rewards.map((reward, index) => renderStageReward(stage, reward, index)).join("")}</div>`
          : '<div class="stage-block-note">No R lines emitted for this stage.</div>'}
      </div>
    </div>
  `;
}

function dungeonValue(dungeon, path) {
  return path.split(".").reduce((value, key) => value?.[key], dungeon) ?? "";
}

function setDungeonValue(dungeon, path, nextValue) {
  const parts = path.split(".");
  const last = parts.pop();
  const target = parts.reduce((value, key) => value[key], dungeon);
  target[last] = String(nextValue);
}

function stageDungeonInput(dungeon, label, path, tooltip, type = "number", attrs = "") {
  return `
    <label>
      <span class="label-row">${escapeHtml(label)} <button type="button" class="tooltip-button" aria-label="${escapeHtml(label)} help" data-tooltip="${escapeHtml(tooltip)}">?</button></span>
      <input data-stage-dungeon-prop="${escapeHtml(path)}" type="${type}" value="${escapeHtml(dungeonValue(dungeon, path))}" ${attrs}>
    </label>
  `;
}

function stageDungeonSelect(dungeon, label, path, options, tooltip = "") {
  const current = String(dungeonValue(dungeon, path));
  const hasCurrent = options.some(([optionValue]) => String(optionValue) === current);
  return `
    <label>
      <span class="label-row">${escapeHtml(label)} ${tooltip ? `<button type="button" class="tooltip-button" aria-label="${escapeHtml(label)} help" data-tooltip="${escapeHtml(tooltip)}">?</button>` : ""}</span>
      <select data-stage-dungeon-prop="${escapeHtml(path)}">
        ${hasCurrent ? "" : `<option value="${escapeHtml(current)}" selected>Current: ${escapeHtml(current)} (unknown)</option>`}
        ${options.map(([optionValue, text]) => `<option value="${escapeHtml(optionValue)}" ${String(optionValue) === current ? "selected" : ""}>${escapeHtml(text)}</option>`).join("")}
      </select>
    </label>
  `;
}

function stageDungeonMask(dungeon, label, path, options, tooltip) {
  const current = numericMask(dungeonValue(dungeon, path));
  const unknown = unknownMaskForOptions(current, options);
  return `
    <div class="field-label nameflags-field questor-mask-field stage-dungeon-mask" data-stage-dungeon-mask="${escapeHtml(path)}" data-stage-dungeon-mask-unknown="${unknown}">
      <span class="label-row">${escapeHtml(label)} <button type="button" class="tooltip-button" aria-label="${escapeHtml(label)} help" data-tooltip="${escapeHtml(tooltip)}">?</button></span>
      <div class="option-picker nameflags-picker">
        <button type="button" class="option-picker-toggle" data-stage-dungeon-mask-toggle aria-expanded="false">
          <span>${escapeHtml(maskSummary(current, options, `No ${label.toLowerCase()}`))}</span>
          <span aria-hidden="true">v</span>
        </button>
        <div class="option-picker-panel stage-dungeon-mask-options">
          ${options.map((option) => `
            <label class="picker-option">
              <input data-stage-dungeon-mask-option="${option.value}" type="checkbox" ${maskHasValue(current, option.value) ? "checked" : ""}>
              <span>${escapeHtml(option.value)} - ${escapeHtml(option.label)} <small>${escapeHtml(option.description)}</small></span>
            </label>
          `).join("")}
        </div>
      </div>
      <span class="field-note">Mask: ${current}${unknown ? `; preserved unknown bits: ${unknown}` : ""}</span>
    </div>
  `;
}

function renderStageDungeonMapField(dungeon, label, path) {
  return `
    <label class="questor-record-field">
      ${escapeHtml(label)}
      <input data-stage-dungeon-map-search data-dpath="${escapeHtml(path)}" type="search" placeholder="Search map templates">
      <div class="autocomplete-list" data-stage-dungeon-map-suggestions></div>
      <div class="selected-entity">
        <span>Selected:</span>
        <button type="button" class="clear-selected" data-clear-stage-dungeon-map data-dpath="${escapeHtml(path)}" aria-label="Clear ${escapeHtml(label)}">x</button>
        <span>${escapeHtml(questorRecordLabel("templates", dungeonValue(dungeon, path), "-", "None", "Unknown map file"))}</span>
      </div>
    </label>
  `;
}

function renderStageDungeonMapSuggestions(input) {
  const wrapper = input.closest(".questor-record-field");
  const suggestions = wrapper?.querySelector("[data-stage-dungeon-map-suggestions]");
  if (!wrapper || !suggestions) {
    return;
  }
  const query = input.value.trim().toLowerCase();
  const matches = recordRows("templates")
    .filter((record) => query === "" || String(record.name || "").toLowerCase().includes(query))
    .slice(0, 25);
  suggestions.innerHTML = [
    `<button type="button" class="autocomplete-option" data-stage-dungeon-map-id="-" data-dpath="${escapeHtml(input.dataset.dpath || "")}">None (-)</button>`,
    ...matches.map((record) => `<button type="button" class="autocomplete-option" data-stage-dungeon-map-id="${escapeHtml(record.id)}" data-dpath="${escapeHtml(input.dataset.dpath || "")}">${escapeHtml(record.name)} (${escapeHtml(record.id)})</button>`),
  ].join("");
  suggestions.classList.add("is-open");
  suggestions.style.display = "grid";
}

function closeStageDungeonMapSuggestions() {
  stageEditor?.querySelectorAll("[data-stage-dungeon-map-suggestions]").forEach((suggestions) => {
    suggestions.innerHTML = "";
    suggestions.classList.remove("is-open");
    suggestions.style.display = "";
  });
}

function renderStageQuestItem(item, index, stage) {
  const questorOptions = questors.map((questor, questorIndex) => [String(questorIndex), `#${questorIndex}: ${questor.name || "Unnamed questor"}`]);
  return `
    <div class="stage-quest-item" data-stage-item-id="${escapeHtml(item.uiId)}">
      <div class="stage-feature-head">
        <strong>Quest item #${index}: ${escapeHtml(item.name || "Unnamed")}</strong>
        <div class="stage-feature-actions">
          <button type="button" data-move-stage-item="-1" ${index === 0 ? "disabled" : ""} aria-label="Move quest item up">↑</button>
          <button type="button" data-move-stage-item="1" ${index === stage.spawns.questItems.length - 1 ? "disabled" : ""} aria-label="Move quest item down">↓</button>
          <button type="button" data-duplicate-stage-item ${stage.spawns.questItems.length >= 5 ? "disabled" : ""}>Duplicate</button>
          <button type="button" data-remove-stage-item>Remove</button>
        </div>
      </div>
      ${item.missingBl ? '<div class="warning-note">Imported B has no Bl line. The editor will generate a Bl line to avoid accidental questor-0 handout behavior.</div>' : ""}
      <div class="questor-wide-group">
        <div class="questor-wide-group-title">B: custom quest item</div>
        <div class="questor-wide-group-grid">
          ${stageItemInput(item, "Pval / retrieval ID", "pval", "Signed 16-bit value used only to distinguish custom quest items for retrieval-goal matching. It has no other quest-item effect.", "number", 'min="-32768" max="32767"')}
          ${stageItemInput(item, "Display character", "char", "Single map glyph used to display the custom quest item.", "text", 'maxlength="1"')}
          ${stageItemSelect(item, "Visual attr", "attr", visualAttrOptions, "One-character TomeNET color parsed with color_char_to_attr().")}
          ${stageItemInput(item, "Weight", "weight", "Signed 16-bit object weight in tenths of a pound. For example, 10 is 1.0 lb.", "number", 'min="0" max="32767"')}
          ${stageItemInput(item, "Level", "level", "Byte-sized object level assigned to the generated quest item.", "number", 'min="0" max="255"')}
          ${stageItemInput(item, "Name", "name", "TomeNET object-name syntax. Prefix '& ' for an article and use '~' where plural suffixes belong. Raw ':' is not allowed.", "text")}
        </div>
      </div>
      <div class="questor-wide-group">
        <div class="questor-wide-group-title">Bl: delivery and location</div>
        <div class="questor-wide-group-grid">
          ${stageItemSelect(item, "Delivery mode", "delivery", [["handout", "Questor handout"], ["spawn", "World spawn"]], "Questor handout gives the item when that questor has talk focus. World spawn uses the location controls.")}
          ${item.delivery === "handout" ? stageItemSelect(item, "Handout questor", "questor", questorOptions, "Zero-based questor index. Generated as -1 only for world spawn.") : ""}
        </div>
        ${item.delivery === "spawn" ? `
          <div class="positioning-group">
            <div class="positioning-group-title">Positioning</div>
            <div class="positioning-subgroup">
              <div class="positioning-subgroup-title">World position + terrain</div>
              <div class="positioning-subgroup-grid">
                ${stageItemMask(item, "Location types", "location.loc", locationTypeOptions.filter((option) => option.value !== 4), "Location type mask. Random Bl spawning supports world surface and the five basic towns. Use an exact world position for dungeon or tower floors.")}
                ${stageItemMask(item, "Terrains", "location.terrains", terrainOptions, "Surface terrain mask for random wilderness spawns. WILD_TOO means any wilderness terrain. Values are stored as a decimal mask in the Bl line.")}
                ${stageItemMask(item, "Towns", "location.towns", townOptions, "Town mask for random town spawns. The engine uses only the five basic towns.")}
                <div class="coordinate-group">
                  <div class="coordinate-group-title">World coordinates</div>
                  <div class="coordinate-group-grid">
                    ${stageItemInput(item, "World X", "location.wx", "Exact world X. Use -1 to select randomly from location masks.")}
                    ${stageItemInput(item, "World Y", "location.wy", "Exact world Y; paired with World X.")}
                    ${stageItemInput(item, "World Z", "location.wz", "0 is surface; negative is dungeon depth; positive is tower level.")}
                  </div>
                </div>
                ${stageItemSelect(item, "Terrain patch", "location.terrainPatch", [["0", "0 - no"], ["1", "1 - yes"]], "0 = exact selected world sector. 1 = may vary the world position inside nearby connected sectors of the same wilderness terrain.")}
              </div>
            </div>
            <div class="positioning-subgroup">
              <div class="positioning-subgroup-title">Grid position</div>
              <div class="positioning-subgroup-grid">
                ${stageItemInput(item, "Grid X", "location.x", "Exact grid X. Use -1 for a random free grid.")}
                ${stageItemInput(item, "Grid Y", "location.y", "Exact grid Y.")}
                ${stageItemInput(item, "Radius", "location.radius", "Random offset radius around Grid X/Y.", "number", 'min="0"')}
              </div>
            </div>
            <div class="positioning-subgroup">
              <div class="positioning-subgroup-title">Map position</div>
              <div class="positioning-subgroup-grid">
                ${renderStageItemMapField(item)}
                ${stageItemInput(item, "Map offset X", "location.mapX", "Template X offset when a map file is used.")}
                ${stageItemInput(item, "Map offset Y", "location.mapY", "Template Y offset when a map file is used.")}
              </div>
            </div>
          </div>
        ` : ""}
      </div>
    </div>
  `;
}

function renderStageMonsterSpawn(spawn, index, stage) {
  return `
    <div class="stage-quest-item" data-stage-monster-id="${escapeHtml(spawn.uiId)}">
      <div class="stage-feature-head">
        <strong>Monster spawn #${index + 1}: ${escapeHtml(stageMonsterRecordLabel("monsters", spawn.ridx, "0", "Random by criteria", "Unknown monster"))}</strong>
        <div class="stage-feature-actions">
          <button type="button" data-move-stage-monster="-1" ${index === 0 ? "disabled" : ""} aria-label="Move monster spawn up">↑</button>
          <button type="button" data-move-stage-monster="1" ${index === stage.spawns.monsters.length - 1 ? "disabled" : ""} aria-label="Move monster spawn down">↓</button>
          <button type="button" data-duplicate-stage-monster ${stage.spawns.monsters.length >= 10 ? "disabled" : ""}>Duplicate</button>
          <button type="button" data-remove-stage-monster>Remove</button>
        </div>
      </div>
      ${spawn.missingMl ? '<div class="warning-note">Imported m has no ml line. The editor will generate a default ml line so TomeNET can place the spawn.</div>' : ""}
      <div class="questor-wide-group">
        <div class="questor-wide-group-title">m: monster spawn</div>
        <div class="questor-wide-group-grid">
          ${stageMonsterInput(spawn, "Amount", "amount", "Number of spawn attempts. Stored in a byte-sized field; TomeNET allows up to 255.", "number", 'min="1" max="255"')}
          ${stageMonsterSelect(spawn, "Groups", "groups", [["0", "0 - one monster each"], ["1", "1 - pack each"]], "When enabled, summon_specific_race() receives a random pack size from 5 to 9.")}
          ${stageMonsterSelect(spawn, "Scattered", "scatter", [["0", "0 - near chosen location"], ["1", "1 - random free grids on map"]], "When enabled, every amount/group spawn picks a random naked grid on the selected map.")}
          ${stageMonsterInput(spawn, "Clones", "clones", "Clone factor passed to summon_specific_race(); 0 means normal non-clone spawning.", "number", 'min="0" max="255"')}
          ${renderStageMonsterRecordSearchField(spawn, {
            label: "Specific monster ridx",
            path: "ridx",
            source: "monsters",
            emptyValue: "0",
            emptyLabel: "Random by criteria",
            unknownLabel: "Unknown monster",
            placeholder: "Search monsters",
            tooltip: "If ridx is non-zero, quest_mspawn_pick() returns that monster and ignores char, attr, level, and partial-name criteria.",
          })}
          ${renderStageMonsterRecordSearchField(spawn, {
            label: "Monster ego re_idx",
            path: "reidx",
            source: "monsterEgos",
            emptyValue: "-1",
            emptyLabel: "Any/random ego",
            unknownLabel: "Unknown monster ego",
            placeholder: "Search monster egos",
            tooltip: "The parser stores re_idx, but quest_spawn_monsters() currently has a TODO and does not apply monster ego selection.",
          })}
          ${stageMonsterInput(spawn, "Visual char filter", "rchar", "Single monster display character to match, or '-' for no character filter. Used only when ridx is 0.", "text", 'maxlength="1"')}
          ${stageMonsterSelect(spawn, "Visual attr filter", "rattr", [["-", "- - no color filter"], ...visualAttrOptions], "Monster color attr to match, or '-' for no color filter. Used only when ridx is 0.")}
          ${stageMonsterInput(spawn, "Min level", "rlevmin", "Minimum random monster level. Used only when ridx is 0.", "number", 'min="0" max="255"')}
          ${stageMonsterInput(spawn, "Max level", "rlevmax", "Maximum random monster level. Must be greater than min level for the server's randint(max - min) call.", "number", 'min="0" max="255"')}
          ${stageMonsterInput(spawn, "Partial name", "name", "Case-sensitive substring checked against monster names when ridx is 0, or '-' for no name filter. Raw ':' is not allowed.", "text")}
        </div>
      </div>
      <div class="questor-wide-group">
        <div class="questor-wide-group-title">ml: spawn location</div>
        <div class="positioning-group">
          <div class="positioning-subgroup">
            <div class="positioning-subgroup-title">World position + terrain</div>
            <div class="positioning-subgroup-grid">
              ${stageMonsterMask(spawn, "Location types", "location.loc", locationTypeOptions.filter((option) => option.value !== 4), "Monster spawn placement supports world surface and basic towns; parser forces world Z to 0.")}
              ${stageMonsterMask(spawn, "Terrains", "location.terrains", terrainOptions, "Surface terrain mask for random monster spawn placement. WILD_TOO means any wilderness terrain.")}
              ${stageMonsterMask(spawn, "Towns", "location.towns", townOptions, "Town mask for random town placement. The engine uses only the five basic towns.")}
              <div class="coordinate-group">
                <div class="coordinate-group-title">World coordinates</div>
                <div class="coordinate-group-grid">
                  ${stageMonsterInput(spawn, "World X", "location.wx", "Exact world X. Use -1 to select randomly from location masks.")}
                  ${stageMonsterInput(spawn, "World Y", "location.wy", "Exact world Y; paired with World X.")}
                </div>
              </div>
              ${stageMonsterSelect(spawn, "Terrain patch", "location.terrainPatch", [["0", "0 - no"], ["1", "1 - yes"]], "0 = exact selected world sector. 1 = may vary the world position inside nearby connected sectors of the same wilderness terrain.")}
            </div>
          </div>
          <div class="positioning-subgroup">
            <div class="positioning-subgroup-title">Grid position</div>
            <div class="positioning-subgroup-grid">
              ${stageMonsterInput(spawn, "Grid X", "location.x", "Exact grid X. Use -1 for a random free grid.")}
              ${stageMonsterInput(spawn, "Grid Y", "location.y", "Exact grid Y.")}
              ${stageMonsterInput(spawn, "Radius", "location.radius", "Random offset radius around Grid X/Y.", "number", 'min="0"')}
            </div>
          </div>
          <div class="positioning-subgroup">
            <div class="positioning-subgroup-title">Map position</div>
            <div class="positioning-subgroup-grid">
              ${renderStageMonsterMapField(spawn)}
              ${stageMonsterInput(spawn, "Map offset X", "location.mapX", "Template X offset when a map file is used.")}
              ${stageMonsterInput(spawn, "Map offset Y", "location.mapY", "Template Y offset when a map file is used.")}
            </div>
          </div>
        </div>
      </div>
      <div class="questor-wide-group">
        <div class="questor-wide-group-title">mh: hostility details</div>
        <label class="checkbox-field">
          <input data-stage-monster-hostility-enabled type="checkbox" ${spawn.hostilityEnabled ? "checked" : ""}>
          Emit mh line
          <button type="button" class="tooltip-button" aria-label="mh help" data-tooltip="TomeNET parses these six fields into qi_monsterspawn, but q_info comments and current quest_spawn_monsters() mark this behavior as not implemented; spawned monsters behave normally.">?</button>
        </label>
        ${spawn.hostilityEnabled ? `
          <div class="questor-wide-group-grid">
            ${stageMonsterSelect(spawn, "Hurt players", "hostilePlayer", [["0", "0 - no"], ["1", "1 - yes"]])}
            ${stageMonsterSelect(spawn, "Hurt questors", "hostileQuestor", [["0", "0 - no"], ["1", "1 - yes"]])}
            ${stageMonsterSelect(spawn, "Invincible to players", "invinciblePlayer", [["0", "0 - no"], ["1", "1 - yes"]])}
            ${stageMonsterSelect(spawn, "Invincible to questors", "invincibleQuestor", [["0", "0 - no"], ["1", "1 - yes"]])}
            ${stageMonsterSelect(spawn, "Target players", "targetPlayer", [["0", "0 - no"], ["1", "1 - yes"]])}
            ${stageMonsterSelect(spawn, "Target questors", "targetQuestor", [["0", "0 - no"], ["1", "1 - yes"]])}
          </div>
        ` : '<div class="stage-block-note">No mh line emitted for this monster spawn.</div>'}
      </div>
    </div>
  `;
}

function renderStageSpawns(stage) {
  return `
    <div class="stage-block">
      <div class="stage-feature-section-head">
        <div>
          <div class="stage-block-title">Spawns</div>
          <div class="stage-block-note">B quest items and m monster spawns. B uses Bl; m uses ml and optional mh.</div>
        </div>
        <div class="stage-feature-actions">
          <button type="button" data-add-stage-item ${stage.spawns.questItems.length >= 5 ? "disabled" : ""}>Add quest item</button>
          <button type="button" data-add-stage-monster ${stage.spawns.monsters.length >= 10 ? "disabled" : ""}>Add monster spawn</button>
        </div>
      </div>
      ${stage.spawns.questItems.length
        ? `<div class="stage-quest-item-list">${stage.spawns.questItems.map((item, index) => renderStageQuestItem(item, index, stage)).join("")}</div>`
        : '<div class="stage-block-note">No B lines emitted for this stage.</div>'}
      ${stage.spawns.monsters.length
        ? `<div class="stage-quest-item-list">${stage.spawns.monsters.map((spawn, index) => renderStageMonsterSpawn(spawn, index, stage)).join("")}</div>`
        : '<div class="stage-block-note">No m/ml/mh lines emitted for this stage.</div>'}
    </div>
  `;
}

function renderStageDungeon(stage) {
  const dungeon = stage.spawns.dungeon;
  return `
    <div class="stage-block">
      <div class="stage-block-title">Temporary Dungeon</div>
      <label class="checkbox-field"><input data-stage-dungeon-enabled type="checkbox" ${dungeon.enabled ? "checked" : ""}> Emit D and Dl</label>
      ${dungeon.enabled ? `
        ${dungeon.missingDl ? '<div class="warning-note">Imported D has no Dl line. The editor will generate a default Dl line for the dungeon entrance.</div>' : ""}
        <div class="questor-wide-group">
          <div class="questor-wide-group-title">D: dungeon definition</div>
          <div class="questor-wide-group-grid">
            ${stageDungeonInput(dungeon, "Base depth", "base", "Lowest generated floor depth. Parsed into byte-sized dun_base.", "number", 'min="0" max="255"')}
            ${stageDungeonInput(dungeon, "Max depth", "max", "Highest generated floor depth. Parsed into byte-sized dun_max.", "number", 'min="0" max="255"')}
            ${stageDungeonSelect(dungeon, "Shape", "tower", [["0", "0 - dungeon/downstairs"], ["1", "1 - tower/upstairs"]], "0 creates a dungeon entrance with down stairs. 1 creates a tower entrance with up stairs.")}
            ${stageDungeonSelect(dungeon, "Hard mode", "hard", [["0", "0 - normal"], ["1", "1 - force down"], ["2", "2 - iron"]], "Runtime translates 1 to DF1_FORCE_DOWN and 2 to DF2_IRON.")}
            ${stageDungeonSelect(dungeon, "Stores", "stores", [["0", "0 - none"], ["1", "1 - iron stores"], ["2", "2 - all stores"]], "Stored as dun_stores. q_info documents 1 as iron stores and 2 as all stores.")}
            ${stageDungeonInput(dungeon, "Theme", "theme", "Numeric dungeon theme similar to IDDC theming. The parser stores it directly as dun_theme.", "number", 'min="0" max="255"')}
            ${stageDungeonInput(dungeon, "Name", "name", "Custom dungeon name, or '-' for none. Raw ':' is not allowed.", "text")}
            ${stageDungeonSelect(dungeon, "Static floors", "staticFloors", [["0", "0 - generated normally"], ["1", "1 - floors are static"]])}
            ${stageDungeonSelect(dungeon, "Keep until quest ends", "keep", [["0", "0 - remove when stage completes"], ["1", "1 - keep until quest ends"]])}
          </div>
        </div>
        <div class="questor-wide-group">
          <div class="questor-wide-group-title">Dungeon flags</div>
          <div class="questor-wide-group-grid">
            ${stageDungeonMask(dungeon, "Flags1", "flags1", dungeonFlag1Options, "DF1_* dungeon flags. Runtime always adds DF1_UNLISTED, and Hard mode 1 may add DF1_FORCE_DOWN. Generated q_info stores the decimal mask only.")}
            ${stageDungeonMask(dungeon, "Flags2", "flags2", dungeonFlag2Options, "DF2_* dungeon flags. Runtime always adds DF2_RANDOM, and Hard mode 2 may add DF2_IRON. Generated q_info stores the decimal mask only.")}
            ${stageDungeonMask(dungeon, "Flags3", "flags3", dungeonFlag3Options, "DF3_* dungeon flags for bonuses, stores, monster density, darkness, teleport/ESP/summon limits, and special dungeon behavior. Generated q_info stores the decimal mask only.")}
          </div>
        </div>
        <div class="questor-wide-group">
          <div class="questor-wide-group-title">Final floor map</div>
          <div class="questor-wide-group-grid">
            ${renderStageDungeonMapField(dungeon, "Final floor map", "finalMap")}
            ${stageDungeonInput(dungeon, "Final map offset X", "finalMapX", "Template X offset for the final floor map.")}
            ${stageDungeonInput(dungeon, "Final map offset Y", "finalMapY", "Template Y offset for the final floor map.")}
          </div>
        </div>
        <div class="questor-wide-group">
          <div class="questor-wide-group-title">Dl: entrance location</div>
          <div class="positioning-group">
            <div class="positioning-subgroup">
              <div class="positioning-subgroup-title">World position + terrain</div>
              <div class="positioning-subgroup-grid">
                ${stageDungeonMask(dungeon, "Location types", "location.loc", locationTypeOptions.filter((option) => option.value !== 4), "Dungeon entrance placement supports world surface and basic towns; parser forces world Z to 0.")}
                ${stageDungeonMask(dungeon, "Terrains", "location.terrains", terrainOptions, "Surface terrain mask for random dungeon entrance placement. WILD_TOO means any wilderness terrain.")}
                ${stageDungeonMask(dungeon, "Towns", "location.towns", townOptions, "Town mask for random town placement. The engine uses only the five basic towns.")}
                <div class="coordinate-group">
                  <div class="coordinate-group-title">World coordinates</div>
                  <div class="coordinate-group-grid">
                    ${stageDungeonInput(dungeon, "World X", "location.wx", "Exact world X. Use -1 to select randomly from location masks.")}
                    ${stageDungeonInput(dungeon, "World Y", "location.wy", "Exact world Y; paired with World X.")}
                  </div>
                </div>
                ${stageDungeonSelect(dungeon, "Terrain patch", "location.terrainPatch", [["0", "0 - no"], ["1", "1 - yes"]], "0 = exact selected world sector. 1 = may vary the world position inside nearby connected sectors of the same wilderness terrain.")}
              </div>
            </div>
            <div class="positioning-subgroup">
              <div class="positioning-subgroup-title">Grid position</div>
              <div class="positioning-subgroup-grid">
                ${stageDungeonInput(dungeon, "Grid X", "location.x", "Exact grid X. Use -1 for a random free grid.")}
                ${stageDungeonInput(dungeon, "Grid Y", "location.y", "Exact grid Y.")}
                ${stageDungeonInput(dungeon, "Radius", "location.radius", "Random offset radius around Grid X/Y.", "number", 'min="0"')}
              </div>
            </div>
            <div class="positioning-subgroup">
              <div class="positioning-subgroup-title">Map position</div>
              <div class="positioning-subgroup-grid">
                ${renderStageDungeonMapField(dungeon, "Map file", "location.map")}
                ${stageDungeonInput(dungeon, "Map offset X", "location.mapX", "Template X offset when a map file is used.")}
                ${stageDungeonInput(dungeon, "Map offset Y", "location.mapY", "Template Y offset when a map file is used.")}
              </div>
            </div>
          </div>
        </div>
      ` : '<div class="stage-block-note">No D/Dl lines emitted for this stage.</div>'}
    </div>
  `;
}

function syncStageItemMask(checkbox) {
  const item = stageQuestItemFromElement(checkbox);
  const field = checkbox.closest("[data-stage-item-mask]");
  if (!item || !field) {
    return;
  }
  const selected = [...field.querySelectorAll("[data-stage-item-mask-option]:checked")]
    .reduce((mask, option) => mask + numericValue(option.dataset.stageItemMaskOption), 0);
  const unknown = numericMask(field.dataset.stageItemMaskUnknown);
  setQuestItemValue(item, field.dataset.stageItemMask, selected + unknown);
}

function syncStageDungeonMask(checkbox) {
  const dungeon = stages[selectedStageId]?.spawns.dungeon;
  const field = checkbox.closest("[data-stage-dungeon-mask]");
  if (!dungeon || !field) {
    return;
  }
  const selected = [...field.querySelectorAll("[data-stage-dungeon-mask-option]:checked")]
    .reduce((mask, option) => mask + numericValue(option.dataset.stageDungeonMaskOption), 0);
  const unknown = numericMask(field.dataset.stageDungeonMaskUnknown);
  setDungeonValue(dungeon, field.dataset.stageDungeonMask, selected + unknown);
}

function morphValue(morph, path) {
  return path.split(".").reduce((value, key) => value?.[key], morph) ?? "";
}

function setMorphValue(morph, path, nextValue) {
  const parts = path.split(".");
  const last = parts.pop();
  const target = parts.reduce((value, key) => value[key], morph);
  target[last] = String(nextValue);
}

function stageMorphFromElement(element) {
  const stage = stages[selectedStageId];
  const uiId = element.closest("[data-stage-morph-id]")?.dataset.stageMorphId;
  return stage?.questorActions.morphs.find((morph) => morph.uiId === uiId) || null;
}

function stageMorphInput(morph, label, path, tooltip, type = "number", attrs = "") {
  return `
    <label>
      <span class="label-row">${escapeHtml(label)} <button type="button" class="tooltip-button" aria-label="${escapeHtml(label)} help" data-tooltip="${escapeHtml(tooltip)}">?</button></span>
      <input data-stage-morph-prop="${escapeHtml(path)}" type="${type}" value="${escapeHtml(morphValue(morph, path))}" ${attrs}>
    </label>
  `;
}

function stageMorphSelect(morph, label, path, options, tooltip = "") {
  const current = String(morphValue(morph, path));
  const hasCurrent = options.some(([valueOption]) => String(valueOption) === current);
  return `
    <label>
      <span class="label-row">${escapeHtml(label)} ${tooltip ? `<button type="button" class="tooltip-button" aria-label="${escapeHtml(label)} help" data-tooltip="${escapeHtml(tooltip)}">?</button>` : ""}</span>
      <select data-stage-morph-prop="${escapeHtml(path)}">
        ${hasCurrent ? "" : `<option value="${escapeHtml(current)}" selected>Current: ${escapeHtml(current)} (unknown)</option>`}
        ${options.map(([valueOption, text]) => `<option value="${escapeHtml(valueOption)}" ${String(valueOption) === current ? "selected" : ""}>${escapeHtml(text)}</option>`).join("")}
      </select>
    </label>
  `;
}

function morphQuestorOptions(current, usedQuestors, selfQuestor) {
  const rows = questors.map((questor, index) => [String(index), `#${index}: ${questor.name || "Unnamed questor"}`, usedQuestors.has(String(index)) && String(index) !== String(selfQuestor)]);
  const hasCurrent = rows.some(([valueOption]) => valueOption === String(current));
  return `
    <label>
      Target questor
      <select data-stage-morph-prop="questor">
        ${hasCurrent ? "" : `<option value="${escapeHtml(current)}" selected>Current: #${escapeHtml(current)} (missing)</option>`}
        ${rows.map(([valueOption, text, disabled]) => `<option value="${escapeHtml(valueOption)}" ${valueOption === String(current) ? "selected" : ""} ${disabled ? "disabled" : ""}>${escapeHtml(text)}${disabled ? " (already has S)" : ""}</option>`).join("")}
      </select>
    </label>
  `;
}

function hostilityValue(hostility, path) {
  return path.split(".").reduce((value, key) => value?.[key], hostility) ?? "";
}

function setHostilityValue(hostility, path, nextValue) {
  const parts = path.split(".");
  const last = parts.pop();
  const target = parts.reduce((value, key) => value[key], hostility);
  target[last] = String(nextValue);
}

function stageHostilityFromElement(element) {
  const stage = stages[selectedStageId];
  const uiId = element.closest("[data-stage-hostility-id]")?.dataset.stageHostilityId;
  return stage?.questorActions.hostilities.find((hostility) => hostility.uiId === uiId) || null;
}

function stageHostilityInput(hostility, label, path, tooltip, type = "number", attrs = "") {
  return `
    <label>
      <span class="label-row">${escapeHtml(label)} <button type="button" class="tooltip-button" aria-label="${escapeHtml(label)} help" data-tooltip="${escapeHtml(tooltip)}">?</button></span>
      <input data-stage-hostility-prop="${escapeHtml(path)}" type="${type}" value="${escapeHtml(hostilityValue(hostility, path))}" ${attrs}>
    </label>
  `;
}

function stageHostilitySelect(hostility, label, path, options, tooltip = "") {
  const current = String(hostilityValue(hostility, path));
  const hasCurrent = options.some(([valueOption]) => String(valueOption) === current);
  return `
    <label>
      <span class="label-row">${escapeHtml(label)} ${tooltip ? `<button type="button" class="tooltip-button" aria-label="${escapeHtml(label)} help" data-tooltip="${escapeHtml(tooltip)}">?</button>` : ""}</span>
      <select data-stage-hostility-prop="${escapeHtml(path)}">
        ${hasCurrent ? "" : `<option value="${escapeHtml(current)}" selected>Current: ${escapeHtml(current)} (unknown)</option>`}
        ${options.map(([valueOption, text]) => `<option value="${escapeHtml(valueOption)}" ${String(valueOption) === current ? "selected" : ""}>${escapeHtml(text)}</option>`).join("")}
      </select>
    </label>
  `;
}

function hostilityQuestorOptions(current, usedQuestors, selfQuestor) {
  const rows = questors.map((questor, index) => [String(index), `#${index}: ${questor.name || "Unnamed questor"}`, usedQuestors.has(String(index)) && String(index) !== String(selfQuestor)]);
  const hasCurrent = rows.some(([valueOption]) => valueOption === String(current));
  return `
    <label>
      Target questor
      <select data-stage-hostility-prop="questor">
        ${hasCurrent ? "" : `<option value="${escapeHtml(current)}" selected>Current: #${escapeHtml(current)} (missing)</option>`}
        ${rows.map(([valueOption, text, disabled]) => `<option value="${escapeHtml(valueOption)}" ${valueOption === String(current) ? "selected" : ""} ${disabled ? "disabled" : ""}>${escapeHtml(text)}${disabled ? " (already has H)" : ""}</option>`).join("")}
      </select>
    </label>
  `;
}

function hostilityChangeStageValue(hostility) {
  if (hostility.changeMode === "exact") {
    return hostility.changeStage;
  }
  if (hostility.changeMode === "random") {
    return `-${hostility.randomSteps || "1"}`;
  }
  return "255";
}

function renderStageHostility(hostility, index, stage) {
  const usedQuestors = new Set(stage.questorActions.hostilities.map((entry) => String(entry.questor)));
  return `
    <div class="stage-hostility-entry" data-stage-hostility-id="${escapeHtml(hostility.uiId)}">
      <div class="stage-feature-head">
        <strong>H hostility ${index + 1}</strong>
        <button type="button" data-remove-stage-hostility>Remove</button>
      </div>
      <div class="questor-wide-group-grid">
        ${hostilityQuestorOptions(hostility.questor, usedQuestors, hostility.questor)}
        ${stageHostilitySelect(hostility, "Unquestor", "unquestor", [["0", "0 - keep as questor"], ["1", "1 - remove questor status"]], "Whether the questor stops being treated as a questor when hostility starts.")}
        ${stageHostilitySelect(hostility, "Hostile to players", "hostilePlayer", [["0", "0 - no"], ["1", "1 - yes"]])}
        ${stageHostilitySelect(hostility, "Hostile to monsters", "hostileMonster", [["0", "0 - no"], ["1", "1 - yes"]])}
        ${stageHostilityInput(hostility, "Revert HP", "revertHp", "HP value used when reverting hostility. 0 keeps the engine default behavior.")}
        ${stageHostilitySelect(hostility, "In-game revert hour", "ingameHour", [["-1", "Disabled (-1)"], ...Array.from({ length: 24 }, (_, hour) => [String(hour), `${hour}:00`])], "-1 disables in-game timed revert; 0..23 reverts at that in-game hour.")}
        ${stageHostilityInput(hostility, "Real-time revert minutes", "realTime", "0 disables real-time revert. Positive values are minutes.", "number", 'min="0"')}
        ${stageHostilitySelect(hostility, "Stage change", "changeMode", [["disabled", "Disabled (255)"], ["exact", "Exact stage"], ["random", "Random forward"]])}
        ${hostility.changeMode === "exact" ? stageHostilitySelect(hostility, "Target stage", "changeStage", stageOrder.map((id) => [id, `Stage ${id}`]), "Stage to switch to when hostility reverts.") : ""}
        ${hostility.changeMode === "random" ? stageHostilityInput(hostility, "Maximum random forward steps", "randomSteps", "Generated as a negative value. Runtime randomly advances by up to this many stages.", "number", 'min="1"') : ""}
        ${stageHostilitySelect(hostility, "Quiet change", "quiet", [["0", "0 - replay dialogue"], ["1", "1 - skip dialogue"]])}
      </div>
    </div>
  `;
}

function actionValue(action, path) {
  return path.split(".").reduce((value, key) => value?.[key], action) ?? "";
}

function setActionValue(action, path, nextValue) {
  const parts = path.split(".");
  const last = parts.pop();
  const target = parts.reduce((value, key) => value[key], action);
  target[last] = String(nextValue);
}

function stageActionFromElement(element) {
  const stage = stages[selectedStageId];
  const uiId = element.closest("[data-stage-action-id]")?.dataset.stageActionId;
  return stage?.questorActions.movements.find((action) => action.uiId === uiId) || null;
}

function stageActionInput(action, label, path, tooltip, type = "number", attrs = "") {
  return `
    <label>
      <span class="label-row">${escapeHtml(label)} <button type="button" class="tooltip-button" aria-label="${escapeHtml(label)} help" data-tooltip="${escapeHtml(tooltip)}">?</button></span>
      <input data-stage-action-prop="${escapeHtml(path)}" type="${type}" value="${escapeHtml(actionValue(action, path))}" ${attrs}>
    </label>
  `;
}

function stageActionSelect(action, label, path, options, tooltip = "") {
  const current = String(actionValue(action, path));
  const hasCurrent = options.some(([valueOption]) => String(valueOption) === current);
  return `
    <label>
      <span class="label-row">${escapeHtml(label)} ${tooltip ? `<button type="button" class="tooltip-button" aria-label="${escapeHtml(label)} help" data-tooltip="${escapeHtml(tooltip)}">?</button>` : ""}</span>
      <select data-stage-action-prop="${escapeHtml(path)}">
        ${hasCurrent ? "" : `<option value="${escapeHtml(current)}" selected>Current: ${escapeHtml(current)} (unknown)</option>`}
        ${options.map(([valueOption, text]) => `<option value="${escapeHtml(valueOption)}" ${String(valueOption) === current ? "selected" : ""}>${escapeHtml(text)}</option>`).join("")}
      </select>
    </label>
  `;
}

function actionQuestorOptions(current, usedQuestors, selfQuestor) {
  const rows = questors.map((questor, index) => [String(index), `#${index}: ${questor.name || "Unnamed questor"}`, usedQuestors.has(String(index)) && String(index) !== String(selfQuestor)]);
  const hasCurrent = rows.some(([valueOption]) => valueOption === String(current));
  return `
    <label>
      Target questor
      <select data-stage-action-prop="questor">
        ${hasCurrent ? "" : `<option value="${escapeHtml(current)}" selected>Current: #${escapeHtml(current)} (missing)</option>`}
        ${rows.map(([valueOption, text, disabled]) => `<option value="${escapeHtml(valueOption)}" ${valueOption === String(current) ? "selected" : ""} ${disabled ? "disabled" : ""}>${escapeHtml(text)}${disabled ? " (already has J)" : ""}</option>`).join("")}
      </select>
    </label>
  `;
}

function actionChangeStageValue(action) {
  if (action.changeMode === "exact") {
    return action.changeStage;
  }
  if (action.changeMode === "random") {
    return `-${action.randomSteps || "1"}`;
  }
  return "255";
}

function renderActionPositionGroup(action, title, path, note) {
  return `
    <div class="questor-wide-group">
      <div class="questor-wide-group-title">${escapeHtml(title)}</div>
      <div class="stage-block-note">${escapeHtml(note)}</div>
      <div class="questor-wide-group-grid">
        ${stageActionInput(action, "World X", `${path}.wx`, "-1 disables world teleport. Otherwise this is the destination world X.")}
        ${stageActionInput(action, "World Y", `${path}.wy`, "Destination world Y. Use -1 with World X disabled.")}
        ${stageActionInput(action, "World Z", `${path}.wz`, "Destination world Z. 0 is surface; negative is dungeon depth; positive is tower level.")}
        ${stageActionInput(action, "Grid X", `${path}.x`, "-1 disables exact grid movement. Otherwise this is the destination grid X.")}
        ${stageActionInput(action, "Grid Y", `${path}.y`, "Destination grid Y. Use -1 with Grid X disabled.")}
      </div>
    </div>
  `;
}

function renderStageAction(action, index, stage) {
  const usedQuestors = new Set(stage.questorActions.movements.map((entry) => String(entry.questor)));
  return `
    <div class="stage-action-entry" data-stage-action-id="${escapeHtml(action.uiId)}">
      <div class="stage-feature-head">
        <strong>J action ${index + 1}</strong>
        <button type="button" data-remove-stage-action>Remove</button>
      </div>
      <div class="questor-wide-group-grid">
        ${actionQuestorOptions(action.questor, usedQuestors, action.questor)}
      </div>
      ${renderActionPositionGroup(action, "Teleport questor", "teleportQuestor", "Moves the questor to another world position and/or exact grid when the stage starts.")}
      ${renderActionPositionGroup(action, "Teleport players", "teleportPlayers", "Moves participating players to another world position and/or exact grid when the stage starts.")}
      <div class="questor-wide-group">
        <div class="questor-wide-group-title">Walk and arrival</div>
        <div class="questor-wide-group-grid">
          ${stageActionInput(action, "Walk speed", "walkSpeed", "0 disables walking. Positive values set the questor speed while walking to the destination.", "number", 'min="0"')}
          ${stageActionInput(action, "Destination X", "destX", "Waypoint grid X for walking. Used when walk speed is not 0.")}
          ${stageActionInput(action, "Destination Y", "destY", "Waypoint grid Y for walking. Used when walk speed is not 0.")}
          ${stageActionSelect(action, "Stage change", "changeMode", [["disabled", "Disabled (255)"], ["exact", "Exact stage"], ["random", "Random forward"]], "J stage changes happen when the walking questor arrives. Use A for immediate stage changes after teleporting.")}
          ${action.changeMode === "exact" ? stageActionSelect(action, "Target stage", "changeStage", stageOrder.map((id) => [id, `Stage ${id}`]), "Stage to switch to when the questor arrives.") : ""}
          ${action.changeMode === "random" ? stageActionInput(action, "Maximum random forward steps", "randomSteps", "Generated as a negative value. Runtime randomly advances by up to this many stages.", "number", 'min="1"') : ""}
          ${stageActionSelect(action, "Quiet change", "quiet", [["0", "0 - replay dialogue"], ["1", "1 - skip dialogue"]])}
        </div>
      </div>
    </div>
  `;
}

function stageMorphRecordLabel(source, id, emptyValue, emptyLabel, unknownLabel) {
  const valueId = String(id || emptyValue);
  if (valueId === String(emptyValue)) {
    return `${emptyLabel} (${emptyValue})`;
  }
  const record = recordById(source, valueId);
  return record ? `${record.name} (${record.id})` : `${unknownLabel} (${valueId})`;
}

function renderStageMorphRecordSearchField(morph, { label, path, source, emptyValue, emptyLabel, unknownLabel, placeholder }) {
  return `
    <label class="questor-record-field">
      ${escapeHtml(label)}
      <input data-stage-morph-record-search data-mpath="${escapeHtml(path)}" data-source="${escapeHtml(source)}" type="search" placeholder="${escapeHtml(placeholder)}">
      <div class="autocomplete-list" data-stage-morph-record-suggestions></div>
      <div class="selected-entity">
        <span>Selected:</span>
        <button type="button" class="clear-selected" data-clear-stage-morph-record data-mpath="${escapeHtml(path)}" data-empty-value="${escapeHtml(emptyValue)}" aria-label="Reset ${escapeHtml(label)}">x</button>
        <span>${escapeHtml(stageMorphRecordLabel(source, morphValue(morph, path), emptyValue, emptyLabel, unknownLabel))}</span>
      </div>
    </label>
  `;
}

function renderStageMorphRecordSuggestions(input) {
  const wrapper = input.closest(".questor-record-field");
  const suggestions = wrapper?.querySelector("[data-stage-morph-record-suggestions]");
  if (!wrapper || !suggestions) {
    return;
  }
  const source = input.dataset.source || "";
  const path = input.dataset.mpath || "";
  const query = input.value.trim().toLowerCase();
  const matches = recordRows(source)
    .filter((record) => query === "" || String(record.name || "").toLowerCase().includes(query))
    .slice(0, 25);
  const emptyValue = path === "ridx" ? "0" : "-1";
  const emptyLabel = path === "ridx" ? "Keep current monster" : "Keep current";
  suggestions.innerHTML = [
    `<button type="button" class="autocomplete-option" data-stage-morph-record-id="${escapeHtml(emptyValue)}" data-mpath="${escapeHtml(path)}">${escapeHtml(emptyLabel)} (${escapeHtml(emptyValue)})</button>`,
    ...matches.map((record) => `<button type="button" class="autocomplete-option" data-stage-morph-record-id="${escapeHtml(record.id)}" data-mpath="${escapeHtml(path)}">${escapeHtml(record.name)} (${escapeHtml(record.id)})</button>`),
  ].join("");
  suggestions.classList.add("is-open");
  suggestions.style.display = "grid";
}

function closeStageMorphRecordSuggestions() {
  stageEditor?.querySelectorAll("[data-stage-morph-record-suggestions]").forEach((suggestions) => {
    suggestions.innerHTML = "";
    suggestions.classList.remove("is-open");
    suggestions.style.display = "";
  });
}

function renderStageMorphNameflags(morph) {
  const keep = String(morph.nameflags) === "255";
  const currentMask = keep ? 0 : numericMask(morph.nameflags);
  const unknownMask = keep ? 0 : currentMask & ~knownNameflagsMask;
  return `
    <div class="field-label nameflags-field stage-morph-nameflags">
      <span class="label-row">Name flags <button type="button" class="tooltip-button" aria-label="S nameflags help" data-tooltip="255 keeps the questor's current nameflags. Otherwise values are a decimal bitmask: 1 male, 2 female, 4 pseudo-unique, 8 plural, 16 related-to-all.">?</button></span>
      <label class="checkbox-field"><input data-stage-morph-nameflags-keep type="checkbox" ${keep ? "checked" : ""}> Keep current (255)</label>
      ${keep ? "" : `
        <div class="option-picker nameflags-picker">
          <button type="button" class="option-picker-toggle" data-stage-morph-nameflags-toggle aria-expanded="false">
            <span>${escapeHtml(nameflagsSummary(currentMask))}</span>
            <span aria-hidden="true">v</span>
          </button>
          <div class="option-picker-panel">
            ${nameflagOptions.map((option) => `
              <label class="picker-option">
                <input data-stage-morph-nameflag="${option.value}" type="checkbox" ${(currentMask & option.value) ? "checked" : ""}>
                <span>${escapeHtml(option.value)} - ${escapeHtml(option.label)} <small>${escapeHtml(option.description)}</small></span>
              </label>
            `).join("")}
          </div>
        </div>
        <span class="field-note">Mask: ${currentMask}</span>
        ${unknownMask ? `<span class="field-note warning-note">Unknown bits: ${unknownMask}</span>` : ""}
      `}
    </div>
  `;
}

function syncStageMorphNameflags(morph, wrapper) {
  const selectedMask = [...(wrapper?.querySelectorAll("[data-stage-morph-nameflag]:checked") || [])]
    .reduce((mask, checkbox) => mask | Number(checkbox.dataset.stageMorphNameflag || 0), 0);
  morph.nameflags = String(selectedMask);
}

function renderStageMorph(morph, index, stage) {
  const usedQuestors = new Set(stage.questorActions.morphs.map((entry) => String(entry.questor)));
  return `
    <div class="stage-morph-entry" data-stage-morph-id="${escapeHtml(morph.uiId)}">
      <div class="stage-feature-head">
        <strong>S morph ${index + 1}</strong>
        <button type="button" data-remove-stage-morph>Remove</button>
      </div>
      <div class="questor-wide-group-grid">
        ${morphQuestorOptions(morph.questor, usedQuestors, morph.questor)}
        ${stageMorphSelect(morph, "Talkable", "talkable", [["0", "0 - no dialogue"], ["1", "1 - accepts dialogue"]])}
        ${stageMorphSelect(morph, "Despawned", "despawned", [["0", "0 - present"], ["1", "1 - despawn"]])}
        ${stageMorphSelect(morph, "Invincible", "invincible", [["0", "0 - vulnerable"], ["1", "1 - invincible"]])}
        ${stageMorphSelect(morph, "Death fail", "deathFail", [["-1", "-1 - quest fails"], ["255", "255 - no effect"], ...stageOrder.map((id) => [id, `Stage ${id}`])], "If the questor dies, -1 terminates the quest, 255 does nothing, otherwise jumps to the selected stage.")}
        ${stageMorphInput(morph, "Name", "name", "Use '-' to keep the current questor name. Raw ':' is not allowed.", "text")}
      </div>
      ${renderStageMorphNameflags(morph)}
      <div class="questor-wide-group-grid">
        ${renderStageMorphRecordSearchField(morph, { label: "Monster ridx", path: "ridx", source: "monsters", emptyValue: "0", emptyLabel: "Keep current monster", unknownLabel: "Unknown monster", placeholder: "Search monsters" })}
        ${renderStageMorphRecordSearchField(morph, { label: "Monster ego reidx", path: "reidx", source: "monsterEgos", emptyValue: "-1", emptyLabel: "Keep current ego", unknownLabel: "Unknown monster ego", placeholder: "Search monster egos" })}
        ${stageMorphInput(morph, "Map counter", "rmapcnt", "Custom mapping counter used by .prf mappings as R:Q<questindex>N<counter>:[<attr>]/[<char>].", "number", 'min="0"')}
        ${renderStageMorphRecordSearchField(morph, { label: "Visual monster", path: "rcharidx", source: "monsters", emptyValue: "-1", emptyLabel: "Keep current visual", unknownLabel: "Unknown monster", placeholder: "Search visual monster" })}
        ${stageMorphSelect(morph, "Visual attr", "rattr", [["-", "- - keep current"], ...visualAttrOptions], "One-character TomeNET color attr. '-' keeps the current attr.")}
        ${stageMorphInput(morph, "Level", "level", "0 keeps current monster level. Positive values set m_list level during this stage.", "number", 'min="0"')}
      </div>
    </div>
  `;
}

function renderQuestorActions(stage) {
  const unusedQuestor = questors.findIndex((_, index) => !stage.questorActions.morphs.some((morph) => String(morph.questor) === String(index)));
  const unusedHostilityQuestor = questors.findIndex((_, index) => !stage.questorActions.hostilities.some((hostility) => String(hostility.questor) === String(index)));
  const unusedActionQuestor = questors.findIndex((_, index) => !stage.questorActions.movements.some((action) => String(action.questor) === String(index)));
  return `
    <div class="stage-block">
      <div class="stage-feature-section-head">
        <div>
          <div class="stage-block-title">Questor Actions</div>
          <div class="stage-block-note">S morph/change, H hostility/revert, and J movement/teleport entries.</div>
        </div>
        <div class="stage-feature-actions">
          <button type="button" data-add-stage-morph ${unusedQuestor === -1 ? "disabled" : ""}>Add S morph</button>
          <button type="button" data-add-stage-hostility ${unusedHostilityQuestor === -1 ? "disabled" : ""}>Add H hostility</button>
          <button type="button" data-add-stage-action ${unusedActionQuestor === -1 ? "disabled" : ""}>Add J action</button>
        </div>
      </div>
      ${stage.questorActions.morphs.length
        ? `<div class="stage-morph-list">${stage.questorActions.morphs.map((morph, index) => renderStageMorph(morph, index, stage)).join("")}</div>`
        : '<div class="stage-block-note">No S lines emitted for this stage.</div>'}
      ${stage.questorActions.hostilities.length
        ? `<div class="stage-hostility-list">${stage.questorActions.hostilities.map((hostility, index) => renderStageHostility(hostility, index, stage)).join("")}</div>`
        : '<div class="stage-block-note">No H lines emitted for this stage.</div>'}
      ${stage.questorActions.movements.length
        ? `<div class="stage-action-list">${stage.questorActions.movements.map((action, index) => renderStageAction(action, index, stage)).join("")}</div>`
        : '<div class="stage-block-note">No J lines emitted for this stage.</div>'}
    </div>
  `;
}

function renderStageAutomatic(stage) {
  const automatic = stage.setup.automatic;
  return `
    <div class="stage-block">
      <div class="stage-block-title">Stage Setup</div>
      <label class="checkbox-field"><input data-stage-auto-enabled type="checkbox" ${automatic.enabled ? "checked" : ""}> Emit A</label>
      ${automatic.enabled ? `
        <div class="stage-auto-groups">
          <div class="questor-wide-group">
            <div class="questor-wide-group-title">Activate quest</div>
            <div class="questor-wide-group-grid">
              ${questActivationOptions(automatic.activateQuest)}
              ${stageSelect("Auto-accept", "autoAccept", automatic.autoAccept, [["0", "0 - do not accept"], ["1", "1 - accept"], ["2", "2 - accept quietly"]], "Controls whether the activated quest is automatically acquired.")}
            </div>
          </div>
          <div class="questor-wide-group">
            <div class="questor-wide-group-title">Stage change</div>
            <div class="questor-wide-group-grid">
              ${stageSelect("Change mode", "changeMode", automatic.changeMode, [["disabled", "Disabled"], ["exact", "Exact stage"], ["random", "Random forward"]])}
              ${automatic.changeMode === "exact" ? stageTargetOptions(automatic.changeStage) : ""}
              ${automatic.changeMode === "random" ? `<label>Maximum random forward steps <input data-stage-auto="randomSteps" type="number" min="1" value="${escapeHtml(automatic.randomSteps)}"></label>` : ""}
              ${stageSelect("Change quietly", "quiet", automatic.quiet, [["0", "0 - replay dialogue"], ["1", "1 - skip dialogue"]])}
              ${stageSelect("In-game hour", "ingameHour", automatic.ingameHour, [["-1", "Disabled (-1)"], ...Array.from({ length: 24 }, (_, hour) => [String(hour), `${hour}:00`])], "Change at this in-game hour. Takes precedence over real-time minutes when both are enabled.")}
              <label>Real-time minutes <input data-stage-auto="realMinutes" type="number" min="0" value="${escapeHtml(automatic.realMinutes)}"></label>
            </div>
          </div>
          ${stageFlagPicker(automatic)}
          <div class="questor-wide-group">
            <div class="questor-wide-group-title">Genocide world position</div>
            <label class="checkbox-field"><input data-stage-genocide-enabled type="checkbox" ${automatic.genocideEnabled ? "checked" : ""}> Remove all monsters at world position on stage start</label>
            ${automatic.genocideEnabled ? `
              <div class="coordinate-group-grid">
                <label>World X <input data-stage-auto="wx" type="number" min="0" max="63" value="${escapeHtml(automatic.wx)}"></label>
                <label>World Y <input data-stage-auto="wy" type="number" min="0" max="63" value="${escapeHtml(automatic.wy)}"></label>
                <label>World Z <input data-stage-auto="wz" type="number" value="${escapeHtml(automatic.wz)}"></label>
              </div>
            ` : ""}
          </div>
        </div>
      ` : '<div class="stage-block-note">No A line emitted for this stage.</div>'}
      ${renderStageFeatures(stage)}
    </div>
  `;
}

function stageTextEntries(stage, kind) {
  if (!stage) {
    return [];
  }
  if (kind === "narration") return stage.text.narrations;
  if (kind === "log") return stage.text.statusLines;
  if (kind === "dialogue") return stage.text.dialogues;
  if (kind === "defaultReply") return stage.text.defaultReplies;
  if (kind === "keyword") return stage.text.keywords;
  if (kind === "reply") return stage.text.replies;
  return [];
}

function selectedEditorStage() {
  return selectedStageId === sharedStageId ? sharedStage : stages[selectedStageId];
}

function stageTextFromElement(element) {
  const stage = selectedEditorStage();
  const item = element.closest("[data-stage-text-id]");
  const kind = item?.dataset.stageTextKind || "";
  const uiId = item?.dataset.stageTextId || "";
  return stageTextEntries(stage, kind).find((entry) => entry.uiId === uiId) || null;
}

function setStageTextValue(entry, path, nextValue) {
  entry[path] = String(nextValue);
}

function stageTextFlagsSummary(flags) {
  const normalized = String(flags || "-");
  return normalized === "-" ? "No required flags" : `Requires ${normalized.split("").join(", ")}`;
}

function stageTextFlagsFromEditor(wrapper) {
  const flags = [...(wrapper?.querySelectorAll("[data-stage-text-flag]:checked") || [])]
    .map((checkbox) => checkbox.dataset.stageTextFlag || "")
    .join("");
  return flags || "-";
}

function stageTextChangeFlagsFromEditor(wrapper) {
  const setFlags = [...(wrapper?.querySelectorAll("[data-stage-text-change-flag-set]:checked") || [])]
    .map((checkbox) => checkbox.dataset.stageTextChangeFlagSet || "")
    .join("");
  const clearFlags = [...(wrapper?.querySelectorAll("[data-stage-text-change-flag-clear]:checked") || [])]
    .map((checkbox) => (checkbox.dataset.stageTextChangeFlagClear || "").toLowerCase())
    .join("");
  return `${setFlags}${clearFlags}` || "-";
}

function goalChangeFlagsFromEditor(wrapper) {
  const setFlags = [...(wrapper?.querySelectorAll("[data-goal-change-flag-set]:checked") || [])]
    .map((checkbox) => checkbox.dataset.goalChangeFlagSet || "")
    .join("");
  const clearFlags = [...(wrapper?.querySelectorAll("[data-goal-change-flag-clear]:checked") || [])]
    .map((checkbox) => (checkbox.dataset.goalChangeFlagClear || "").toLowerCase())
    .join("");
  return `${setFlags}${clearFlags}` || "-";
}

function goalChangeFlagsFromElement(element) {
  const killGoal = killGoalFromElement(element);
  if (killGoal) {
    return killGoal;
  }
  const retrieveGoal = retrieveGoalFromElement(element);
  if (retrieveGoal) {
    return retrieveGoal;
  }
  return deliveryGoalFromElement(element);
}

function renderGoalChangeFlags(goal) {
  const flags = String(goal.changeFlags || "-");
  const setFlags = flags === "-" ? "" : flags.replace(/[^A-P]/g, "");
  const clearFlags = flags === "-" ? "" : flags.replace(/[^a-p]/g, "");
  return `
    <div class="stage-auto-flags goal-change-flags">
      <div class="stage-auto-subtitle label-row">
        Z: goal flag changes
        <button type="button" class="tooltip-button" aria-label="Goal flag changes help" data-tooltip="When this goal is finally credited, uppercase A through P flags are set and lowercase a through p flags are cleared. For kill/retrieve goals with a delivery goal in the same stage, TomeNET delays these flag changes until delivery is resolved. No selection emits no Z line.">?</button>
      </div>
      <div class="questor-wide-group-grid">
        <div>
          <div class="stage-auto-subtitle">Set</div>
          <div class="stage-flag-grid">
            ${Array.from({ length: 16 }, (_, index) => {
              const upper = String.fromCharCode(65 + index);
              return `<label class="stage-flag-row">
                <span>${upper}</span>
                <input data-goal-change-flag-set="${upper}" type="checkbox" ${setFlags.includes(upper) ? "checked" : ""}>
              </label>`;
            }).join("")}
          </div>
        </div>
        <div>
          <div class="stage-auto-subtitle">Clear</div>
          <div class="stage-flag-grid">
            ${Array.from({ length: 16 }, (_, index) => {
              const upper = String.fromCharCode(65 + index);
              const lower = upper.toLowerCase();
              return `<label class="stage-flag-row">
                <span>${lower}</span>
                <input data-goal-change-flag-clear="${upper}" type="checkbox" ${clearFlags.includes(lower) ? "checked" : ""}>
              </label>`;
            }).join("")}
          </div>
        </div>
      </div>
      <span class="field-note">Generated Z changeflags: ${escapeHtml(flags)}</span>
    </div>
  `;
}

function syncStageKeywordExtraQuestors(entry, wrapper) {
  entry.extraQuestors = [...(wrapper?.querySelectorAll("[data-stage-keyword-extra-questor]:checked") || [])]
    .map((checkbox) => checkbox.dataset.stageKeywordExtraQuestor || "")
    .filter((valueOption) => /^\d+$/.test(valueOption));
}

function syncStageKeywordExtraStages(entry, wrapper) {
  entry.extraStages = [...(wrapper?.querySelectorAll("[data-stage-keyword-extra-stage]:checked") || [])]
    .map((checkbox) => checkbox.dataset.stageKeywordExtraStage || "")
    .filter((valueOption) => /^\d+$/.test(valueOption));
}

function syncStageReplyExtraKeywords(entry, wrapper) {
  entry.extraKeywords = [...(wrapper?.querySelectorAll("[data-stage-reply-extra-keyword]:checked") || [])]
    .map((checkbox) => checkbox.dataset.stageReplyExtraKeyword || "")
    .filter((valueOption) => valueOption !== "");
}

function syncStageReplyExtraQuestors(entry, wrapper) {
  entry.extraQuestors = [...(wrapper?.querySelectorAll("[data-stage-reply-extra-questor]:checked") || [])]
    .map((checkbox) => checkbox.dataset.stageReplyExtraQuestor || "")
    .filter((valueOption) => /^\d+$/.test(valueOption));
}

function syncStageReplyExtraStages(entry, wrapper) {
  entry.extraStages = [...(wrapper?.querySelectorAll("[data-stage-reply-extra-stage]:checked") || [])]
    .map((checkbox) => checkbox.dataset.stageReplyExtraStage || "")
    .filter((valueOption) => /^\d+$/.test(valueOption));
}

function keywordNextStageValue(entry) {
  if (entry.nextMode === "exact") {
    return String(entry.nextStage || "0");
  }
  if (entry.nextMode === "random") {
    return `-${String(entry.randomSteps || "1")}`;
  }
  return "255";
}

function keywordEntryCount() {
  return Object.values(stages).reduce((total, stage) => total + stage.text.keywords.length, sharedStage?.text.keywords.length || 0);
}

function replyEntryCount() {
  return Object.values(stages).reduce((total, stage) => total + stage.text.replies.length, sharedStage?.text.replies.length || 0);
}

function keywordReplyValue(keyword) {
  const raw = String(keyword ?? "");
  if (raw === "~") {
    return "";
  }
  return raw.startsWith("~") ? raw.slice(1) : raw;
}

function keywordReplyOptions() {
  const seen = new Set();
  const options = [];
  for (const stage of [sharedStage, ...Object.values(stages)]) {
    for (const entry of stageTextEntries(stage, "keyword")) {
      const valueOption = keywordReplyValue(entry.keyword);
      if (seen.has(valueOption)) {
        continue;
      }
      seen.add(valueOption);
      const label = entry.keyword === valueOption
        ? valueOption || "(empty keyword)"
        : `${valueOption || "(empty keyword)"} from ${entry.keyword}`;
      options.push([valueOption, label]);
    }
  }
  return options;
}

function renderStageTextFlags(entry) {
  const flags = entry.flags === "-" ? "" : String(entry.flags || "");
  return `
    <div class="stage-auto-flags stage-text-flags">
      <div class="stage-auto-subtitle label-row">
        Required flags
        <button type="button" class="tooltip-button" aria-label="Required flags help" data-tooltip="Only uppercase A through P are valid here. A selected flag must be set for TomeNET to display this text line. Use no selected flags to generate '-'.">?</button>
      </div>
      <div class="stage-flag-grid">
        ${Array.from({ length: 16 }, (_, index) => {
          const upper = String.fromCharCode(65 + index);
          return `<label class="stage-flag-row">
            <span>${upper}</span>
            <input data-stage-text-flag="${upper}" type="checkbox" ${flags.includes(upper) ? "checked" : ""}>
          </label>`;
        }).join("")}
      </div>
      <span class="field-note">${escapeHtml(stageTextFlagsSummary(entry.flags))}</span>
    </div>
  `;
}

function renderStageTextChangeFlags(entry) {
  const flags = String(entry.changeFlags || "-");
  const setFlags = flags === "-" ? "" : flags.replace(/[^A-P]/g, "");
  const clearFlags = flags === "-" ? "" : flags.replace(/[^a-p]/g, "");
  return `
    <div class="stage-auto-flags stage-text-change-flags">
      <div class="stage-auto-subtitle label-row">
        Change flags
        <button type="button" class="tooltip-button" aria-label="Change flags help" data-tooltip="Uppercase A through P sets a quest flag when the keyword matches. Lowercase a through p clears a flag. No selection generates '-'.">?</button>
      </div>
      <div class="questor-wide-group-grid">
        <div>
          <div class="stage-auto-subtitle">Set</div>
          <div class="stage-flag-grid">
            ${Array.from({ length: 16 }, (_, index) => {
              const upper = String.fromCharCode(65 + index);
              return `<label class="stage-flag-row">
                <span>${upper}</span>
                <input data-stage-text-change-flag-set="${upper}" type="checkbox" ${setFlags.includes(upper) ? "checked" : ""}>
              </label>`;
            }).join("")}
          </div>
        </div>
        <div>
          <div class="stage-auto-subtitle">Clear</div>
          <div class="stage-flag-grid">
            ${Array.from({ length: 16 }, (_, index) => {
              const upper = String.fromCharCode(65 + index);
              const lower = upper.toLowerCase();
              return `<label class="stage-flag-row">
                <span>${lower}</span>
                <input data-stage-text-change-flag-clear="${upper}" type="checkbox" ${clearFlags.includes(lower) ? "checked" : ""}>
              </label>`;
            }).join("")}
          </div>
        </div>
      </div>
      <span class="field-note">Generated changeflags: ${escapeHtml(flags)}</span>
    </div>
  `;
}

function renderStageKeywordExtras(entry, type) {
  const selected = new Set(type === "questor" ? entry.extraQuestors || [] : entry.extraStages || []);
  const records = type === "questor"
    ? questors.map((questor, index) => [String(index), `#${index}: ${questor.name || "Unnamed questor"}`])
    : stageOrder.map((stageId) => [stageId, `Stage ${stageId}`]);
  const attr = type === "questor" ? "data-stage-keyword-extra-questor" : "data-stage-keyword-extra-stage";
  const title = type === "questor" ? "Additional questors (YQ)" : "Additional stages (YS)";
  const note = type === "questor"
    ? "Optional extra questors that also accept this keyword. Primary questor -1 already means all questors."
    : "Optional extra stages that also accept this keyword. Shared stage -1 already means all stages.";
  return `
    <div class="stage-auto-flags">
      <div class="stage-auto-subtitle">${escapeHtml(title)}</div>
      <div class="stage-block-note">${escapeHtml(note)}</div>
      ${records.length ? `
        <div class="stage-flag-grid">
          ${records.map(([valueOption, label]) => `<label class="stage-flag-row">
            <span>${escapeHtml(label)}</span>
            <input ${attr}="${escapeHtml(valueOption)}" type="checkbox" ${selected.has(valueOption) ? "checked" : ""}>
          </label>`).join("")}
        </div>
      ` : `<div class="stage-block-note">No ${type === "questor" ? "questors" : "stages"} are available.</div>`}
    </div>
  `;
}

function renderStageReplyExtras(entry, type) {
  const selected = new Set(
    type === "keyword" ? entry.extraKeywords || [] :
    type === "questor" ? entry.extraQuestors || [] :
    entry.extraStages || [],
  );
  const records = type === "keyword"
    ? keywordReplyOptions().filter(([valueOption]) => valueOption !== String(entry.keyword))
    : type === "questor"
      ? questors.map((questor, index) => [String(index), `#${index}: ${questor.name || "Unnamed questor"}`])
      : stageOrder.map((stageId) => [stageId, `Stage ${stageId}`]);
  const attr = type === "keyword"
    ? "data-stage-reply-extra-keyword"
    : type === "questor"
      ? "data-stage-reply-extra-questor"
      : "data-stage-reply-extra-stage";
  const title = type === "keyword"
    ? "Additional keywords (yY)"
    : type === "questor"
      ? "Additional questors (yQ)"
      : "Additional stages (yS)";
  const note = type === "keyword"
    ? "Optional extra existing Y keywords that trigger the same reply. TomeNET allows 5 keywords total per reply group."
    : type === "questor"
      ? "Optional extra questors that can give this reply. Primary questor -1 already means all questors."
      : "Optional extra stages where this reply applies. Shared stage -1 already means all stages.";
  return `
    <div class="stage-auto-flags">
      <div class="stage-auto-subtitle">${escapeHtml(title)}</div>
      <div class="stage-block-note">${escapeHtml(note)}</div>
      ${records.length ? `
        <div class="stage-flag-grid">
          ${records.map(([valueOption, label]) => `<label class="stage-flag-row">
            <span>${escapeHtml(label)}</span>
            <input ${attr}="${escapeHtml(valueOption)}" type="checkbox" ${selected.has(valueOption) ? "checked" : ""}>
          </label>`).join("")}
        </div>
      ` : `<div class="stage-block-note">No ${type === "keyword" ? "extra keywords" : type === "questor" ? "questors" : "stages"} are available.</div>`}
    </div>
  `;
}

function stageReplyLineFromElement(element) {
  const entry = stageTextFromElement(element);
  const item = element.closest("[data-stage-reply-line-id]");
  const uiId = item?.dataset.stageReplyLineId || "";
  return entry?.replies.find((reply) => reply.uiId === uiId) || null;
}

function stageReplyLineFlagsFromEditor(wrapper) {
  const flags = [...(wrapper?.querySelectorAll("[data-stage-reply-line-flag]:checked") || [])]
    .map((checkbox) => checkbox.dataset.stageReplyLineFlag || "")
    .join("");
  return flags || "-";
}

function renderStageReplyLineFlags(reply) {
  const flags = reply.flags === "-" ? "" : String(reply.flags || "");
  return `
    <div class="stage-auto-flags stage-reply-line-flags">
      <div class="stage-auto-subtitle label-row">
        Reply line flags
        <button type="button" class="tooltip-button" aria-label="Reply line flags help" data-tooltip="Only uppercase A through P are valid here. A selected flag must be set for TomeNET to display this yR line. Use no selected flags to generate '-'.">?</button>
      </div>
      <div class="stage-flag-grid">
        ${Array.from({ length: 16 }, (_, index) => {
          const upper = String.fromCharCode(65 + index);
          return `<label class="stage-flag-row">
            <span>${upper}</span>
            <input data-stage-reply-line-flag="${upper}" type="checkbox" ${flags.includes(upper) ? "checked" : ""}>
          </label>`;
        }).join("")}
      </div>
    </div>
  `;
}

function renderStageReplyLines(entry) {
  return `
    <div class="stage-features">
      <div class="stage-feature-section-head">
        <div>
          <div class="stage-auto-subtitle">yR: reply lines</div>
          <div class="stage-block-note">Automatic reply text shown when one of this group's keywords matches. ${entry.replies.length} line${entry.replies.length === 1 ? "" : "s"}.</div>
        </div>
        <button type="button" data-add-stage-reply-line ${entry.replies.length >= 15 ? "disabled" : ""}>Add reply line</button>
      </div>
      ${entry.replies.length ? `
        <div class="stage-feature-list">
          ${entry.replies.map((reply, index) => `
            <div class="stage-feature-entry" data-stage-reply-line-id="${escapeHtml(reply.uiId)}">
              <div class="stage-feature-head">
                <strong>Reply line #${index + 1}</strong>
                <div class="stage-feature-actions">
                  <button type="button" data-move-stage-reply-line="-1" ${index === 0 ? "disabled" : ""} aria-label="Move reply line up">↑</button>
                  <button type="button" data-move-stage-reply-line="1" ${index === entry.replies.length - 1 ? "disabled" : ""} aria-label="Move reply line down">↓</button>
                  <button type="button" data-duplicate-stage-reply-line ${entry.replies.length >= 15 ? "disabled" : ""}>Duplicate</button>
                  <button type="button" data-remove-stage-reply-line>Remove</button>
                </div>
              </div>
              <label class="wide">
                <span class="label-row">
                  yR text
                  <button type="button" class="tooltip-button" aria-label="Reply text help" data-tooltip="Text is parsed up to 79 characters and cannot contain ':'. It supports [[...]] highlighting, placeholders, and Lua calls beginning with //.">?</button>
                </span>
                <textarea data-stage-reply-line-prop="text" rows="2" maxlength="160">${escapeHtml(reply.text)}</textarea>
              </label>
              ${renderStageReplyLineFlags(reply)}
            </div>
          `).join("")}
        </div>
      ` : '<div class="stage-block-note">No yR reply lines emitted for this reply group.</div>'}
    </div>
  `;
}

function renderStageTextEntry(entry, index, kind, stage) {
  const entries = stageTextEntries(stage, kind);
  const lineNames = { narration: "X", log: "x", dialogue: "W", defaultReply: "Wr", keyword: "Y", reply: "y" };
  const labels = { narration: "Narration", log: "Log status", dialogue: "Questor dialogue", defaultReply: "Default reply", keyword: "Keyword", reply: "Keyword reply" };
  const lineName = lineNames[kind] || "text";
  const label = labels[kind] || "Text";
  const questorOptions = questors.map((questor, questorIndex) => [String(questorIndex), `#${questorIndex}: ${questor.name || "Unnamed questor"}`]);
  const hasQuestor = kind === "dialogue" || kind === "defaultReply" || kind === "keyword"
    ? questorOptions.some(([valueOption]) => valueOption === String(entry.questor))
    : true;
  if (kind === "keyword") {
    const hasAnyQuestor = String(entry.questor) === "-1";
    const keywordTooltip = "Keyword is parsed up to 29 characters and cannot contain ':'. Use '~' for an empty/enter keyword, '~adminword' for admin-only, '*' as a wildcard, and $$p1..$$p5 for player-name placeholders. 'y' and 'n' participate in TomeNET's yes/no reply shortcut.";
    return `
      <div class="stage-feature-entry" data-stage-text-kind="${escapeHtml(kind)}" data-stage-text-id="${escapeHtml(entry.uiId)}">
        <div class="stage-feature-head">
          <strong>${escapeHtml(label)} #${index + 1}${entry.keyword ? `: ${escapeHtml(entry.keyword)}` : ""}</strong>
          <div class="stage-feature-actions">
            <button type="button" data-move-stage-text="-1" ${index === 0 ? "disabled" : ""} aria-label="Move ${escapeHtml(label)} up">↑</button>
            <button type="button" data-move-stage-text="1" ${index === entries.length - 1 ? "disabled" : ""} aria-label="Move ${escapeHtml(label)} down">↓</button>
            <button type="button" data-duplicate-stage-text ${keywordEntryCount() >= 100 ? "disabled" : ""}>Duplicate</button>
            <button type="button" data-remove-stage-text>Remove</button>
          </div>
        </div>
        <div class="questor-wide-group-grid">
          <label>
            <span class="label-row">
              Questor
              <button type="button" class="tooltip-button" aria-label="Keyword questor help" data-tooltip="-1 means any questor. Otherwise choose the primary questor index for this keyword. Use YQ checkboxes for additional questors.">?</button>
            </span>
            <select data-stage-text-prop="questor">
              <option value="-1" ${hasAnyQuestor ? "selected" : ""}>-1 - any questor</option>
              ${hasQuestor || hasAnyQuestor ? "" : `<option value="${escapeHtml(entry.questor)}" selected>Current: #${escapeHtml(entry.questor)} (missing)</option>`}
              ${questorOptions.map(([valueOption, text]) => `<option value="${escapeHtml(valueOption)}" ${String(entry.questor) === valueOption ? "selected" : ""}>${escapeHtml(text)}</option>`).join("")}
            </select>
          </label>
          <label>
            <span class="label-row">
              Keyword
              <button type="button" class="tooltip-button" aria-label="Keyword help" data-tooltip="${escapeHtml(keywordTooltip)}">?</button>
            </span>
            <input data-stage-text-prop="keyword" maxlength="40" value="${escapeHtml(entry.keyword)}" placeholder="ale">
          </label>
          <label>
            <span class="label-row">
              Next stage
              <button type="button" class="tooltip-button" aria-label="Next stage help" data-tooltip="255 means no stage change. Exact selects a target stage 0..49. Random forward generates a negative range from the current stage; do not use random forward on shared stage -1.">?</button>
            </span>
            <select data-stage-text-prop="nextMode">
              <option value="disabled" ${entry.nextMode === "disabled" ? "selected" : ""}>255 - do not change</option>
              <option value="exact" ${entry.nextMode === "exact" ? "selected" : ""}>Exact stage</option>
              <option value="random" ${entry.nextMode === "random" ? "selected" : ""}>Random forward range</option>
            </select>
          </label>
          ${entry.nextMode === "exact" ? `
            <label>
              Exact target
              <select data-stage-text-prop="nextStage">
                ${stageOrder.map((stageId) => `<option value="${escapeHtml(stageId)}" ${String(entry.nextStage) === stageId ? "selected" : ""}>Stage ${escapeHtml(stageId)}</option>`).join("")}
                ${stageOrder.includes(String(entry.nextStage)) ? "" : `<option value="${escapeHtml(entry.nextStage)}" selected>Current: ${escapeHtml(entry.nextStage)}</option>`}
              </select>
            </label>
          ` : ""}
          ${entry.nextMode === "random" ? `
            <label>
              Random forward range
              <input data-stage-text-prop="randomSteps" type="number" min="1" max="49" value="${escapeHtml(entry.randomSteps)}">
            </label>
          ` : ""}
        </div>
        ${renderStageTextFlags(entry)}
        ${renderStageTextChangeFlags(entry)}
        ${renderStageKeywordExtras(entry, "questor")}
        ${renderStageKeywordExtras(entry, "stage")}
      </div>
    `;
  }
  if (kind === "reply") {
    const hasAnyQuestor = String(entry.questor) === "-1";
    const keywordOptions = keywordReplyOptions();
    const hasKeyword = keywordOptions.some(([valueOption]) => valueOption === String(entry.keyword));
    return `
      <div class="stage-feature-entry" data-stage-text-kind="${escapeHtml(kind)}" data-stage-text-id="${escapeHtml(entry.uiId)}">
        <div class="stage-feature-head">
          <strong>${escapeHtml(label)} #${index + 1}${entry.keyword ? `: ${escapeHtml(entry.keyword)}` : ""}</strong>
          <div class="stage-feature-actions">
            <button type="button" data-move-stage-text="-1" ${index === 0 ? "disabled" : ""} aria-label="Move ${escapeHtml(label)} up">↑</button>
            <button type="button" data-move-stage-text="1" ${index === entries.length - 1 ? "disabled" : ""} aria-label="Move ${escapeHtml(label)} down">↓</button>
            <button type="button" data-duplicate-stage-text ${replyEntryCount() >= 50 ? "disabled" : ""}>Duplicate</button>
            <button type="button" data-remove-stage-text>Remove</button>
          </div>
        </div>
        <div class="questor-wide-group-grid">
          <label>
            <span class="label-row">
              Questor
              <button type="button" class="tooltip-button" aria-label="Reply questor help" data-tooltip="-1 means any questor. Otherwise choose the primary questor index for this reply. Use yQ checkboxes for additional questors.">?</button>
            </span>
            <select data-stage-text-prop="questor">
              <option value="-1" ${hasAnyQuestor ? "selected" : ""}>-1 - any questor</option>
              ${hasQuestor || hasAnyQuestor ? "" : `<option value="${escapeHtml(entry.questor)}" selected>Current: #${escapeHtml(entry.questor)} (missing)</option>`}
              ${questorOptions.map(([valueOption, text]) => `<option value="${escapeHtml(valueOption)}" ${String(entry.questor) === valueOption ? "selected" : ""}>${escapeHtml(text)}</option>`).join("")}
            </select>
          </label>
          <label>
            <span class="label-row">
              Keyword
              <button type="button" class="tooltip-button" aria-label="Reply keyword help" data-tooltip="This must match an existing Y keyword after TomeNET parsing. For admin keywords defined as '~adminword', the reply keyword is 'adminword'.">?</button>
            </span>
            <select data-stage-text-prop="keyword">
              ${hasKeyword ? "" : `<option value="${escapeHtml(entry.keyword)}" selected>Current: ${escapeHtml(entry.keyword || "(empty)")}${entry.keyword ? "" : " (unsupported empty y keyword)"}</option>`}
              ${keywordOptions.map(([valueOption, text]) => `<option value="${escapeHtml(valueOption)}" ${String(entry.keyword) === valueOption ? "selected" : ""}>${escapeHtml(text)}</option>`).join("")}
            </select>
          </label>
        </div>
        ${renderStageTextFlags(entry)}
        ${renderStageReplyExtras(entry, "keyword")}
        ${renderStageReplyExtras(entry, "questor")}
        ${renderStageReplyExtras(entry, "stage")}
        ${renderStageReplyLines(entry)}
      </div>
    `;
  }
  const textTooltip = kind === "defaultReply"
    ? "Text is parsed up to 79 characters and cannot contain ':'. Wr may use $$Q or $$q once to insert the questor name. It also supports [[...]] highlighting, normal placeholders, and Lua calls beginning with //."
    : "Text is parsed up to 79 characters and cannot contain ':'. Use [[...]] to highlight text. Placeholders include $$N, $$T, $$R, $AA, $$C, $$E and lowercase variants. Lua calls must begin with // and contain nothing else before the call.";
  return `
    <div class="stage-feature-entry" data-stage-text-kind="${escapeHtml(kind)}" data-stage-text-id="${escapeHtml(entry.uiId)}">
      <div class="stage-feature-head">
        <strong>${escapeHtml(label)} #${index + 1}</strong>
        <div class="stage-feature-actions">
          <button type="button" data-move-stage-text="-1" ${index === 0 ? "disabled" : ""} aria-label="Move ${escapeHtml(label)} up">↑</button>
          <button type="button" data-move-stage-text="1" ${index === entries.length - 1 ? "disabled" : ""} aria-label="Move ${escapeHtml(label)} down">↓</button>
          <button type="button" data-duplicate-stage-text ${entries.length >= 15 ? "disabled" : ""}>Duplicate</button>
          <button type="button" data-remove-stage-text>Remove</button>
        </div>
      </div>
      <div class="questor-wide-group-grid">
        ${kind === "dialogue" || kind === "defaultReply" ? `
          <label>
            Questor
            <select data-stage-text-prop="questor">
              ${hasQuestor ? "" : `<option value="${escapeHtml(entry.questor)}" selected>Current: #${escapeHtml(entry.questor)} (missing)</option>`}
              ${questorOptions.map(([valueOption, text]) => `<option value="${escapeHtml(valueOption)}" ${String(entry.questor) === valueOption ? "selected" : ""}>${escapeHtml(text)}</option>`).join("")}
            </select>
          </label>
        ` : ""}
        ${kind === "dialogue" ? `
          <label>
            <span class="label-row">
              Examine mode
              <button type="button" class="tooltip-button" aria-label="Examine mode help" data-tooltip="0 shows the questor as speaking. 1 shows the interaction as examining the questor or object. Negative clone mode is not generated by this editor.">?</button>
            </span>
            <select data-stage-text-prop="examine">
              <option value="0" ${String(entry.examine) === "0" ? "selected" : ""}>0 - speaks</option>
              <option value="1" ${String(entry.examine) === "1" ? "selected" : ""}>1 - examine</option>
              ${["0", "1"].includes(String(entry.examine)) ? "" : `<option value="${escapeHtml(entry.examine)}" selected>Current: ${escapeHtml(entry.examine)} (unsupported)</option>`}
            </select>
          </label>
        ` : ""}
        <label class="wide">
          <span class="label-row">
            ${lineName} text
            <button type="button" class="tooltip-button" aria-label="${lineName} text help" data-tooltip="${escapeHtml(textTooltip)}">?</button>
          </span>
          <textarea data-stage-text-prop="text" rows="2" maxlength="160">${escapeHtml(entry.text)}</textarea>
        </label>
      </div>
      ${kind === "defaultReply" ? "" : renderStageTextFlags(entry)}
    </div>
  `;
}

function renderStageTextList(stage, kind) {
  const entries = stageTextEntries(stage, kind);
  const titles = {
    narration: "X: automatic narration",
    log: "x: quest log status",
    dialogue: "W: questor dialogue",
    defaultReply: "Wr: default replies",
    keyword: "Y: keyword triggers",
    reply: "y: keyword replies",
  };
  const notes = {
    narration: "Shown automatically when the stage starts, unless the stage change is quiet.",
    log: "Shown in the player's quest log for this stage.",
    dialogue: "Shown by a selected questor when the player interacts or when the stage dialogue plays.",
    defaultReply: "Fallback text when an entered keyword is not recognized for the selected questor.",
    keyword: "Player-entered keywords that can change flags and move the player to another stage.",
    reply: "Automatic replies shown when a matching keyword is entered.",
  };
  const addLabels = {
    narration: "narration",
    log: "log line",
    dialogue: "dialogue",
    defaultReply: "default reply",
    keyword: "keyword",
    reply: "keyword reply",
  };
  const lineNames = { narration: "X", log: "x", dialogue: "W", defaultReply: "Wr", keyword: "Y", reply: "y" };
  const atLimit = kind === "keyword"
    ? keywordEntryCount() >= 100
    : kind === "reply"
      ? replyEntryCount() >= 50
      : entries.length >= 15;
  return `
    <div class="stage-features">
      <div class="stage-feature-section-head">
        <div>
          <div class="stage-auto-subtitle">${escapeHtml(titles[kind] || "Text")}</div>
          <div class="stage-block-note">${escapeHtml(notes[kind] || "")} ${entries.length} line${entries.length === 1 ? "" : "s"}.</div>
        </div>
        <button type="button" data-add-stage-text="${escapeHtml(kind)}" ${atLimit ? "disabled" : ""}>Add ${escapeHtml(addLabels[kind] || "text")}</button>
      </div>
      ${entries.length
        ? `<div class="stage-feature-list">${entries.map((entry, index) => renderStageTextEntry(entry, index, kind, stage)).join("")}</div>`
        : `<div class="stage-block-note">No ${lineNames[kind] || "text"} lines emitted for this stage.</div>`}
    </div>
  `;
}

function renderStageText(stage) {
  return `
    <div class="stage-block">
      <div class="stage-block-title">Text And Dialogue</div>
      <div class="stage-block-note">Stage narration, quest log text, questor dialogue, keyword triggers, and keyword replies.</div>
      ${renderStageTextList(stage, "narration")}
      ${renderStageTextList(stage, "log")}
      ${renderStageTextList(stage, "dialogue")}
      ${renderStageTextList(stage, "defaultReply")}
      ${renderStageTextList(stage, "keyword")}
      ${renderStageTextList(stage, "reply")}
    </div>
  `;
}

function renderSharedStageText(stage) {
  return `
    <div class="stage-block">
      <div class="stage-block-title">Text And Dialogue</div>
      <div class="stage-block-note">Shared keyword triggers and replies generate stage -1 lines. They can apply to any stage unless narrowed by YS or yS.</div>
      ${renderStageTextList(stage, "keyword")}
      ${renderStageTextList(stage, "reply")}
    </div>
  `;
}

function renderStageList() {
  if (!stageList) {
    return;
  }
  const sharedActive = selectedStageId === sharedStageId;
  stageList.innerHTML = [
    `<button type="button" class="stage-list-item ${sharedActive ? "is-active" : ""}" data-stage-id="${sharedStageId}">
      <strong>Shared / any stage</strong>
      <small>Dialogue entries using stage -1${sharedStage?.text.keywords.length ? ` · ${sharedStage.text.keywords.length} Y` : ""}${sharedStage?.text.replies.length ? ` · ${sharedStage.text.replies.length} y` : ""}</small>
    </button>`,
    ...stageOrder.map((id) => {
      const stage = stages[id];
      return `<button type="button" class="stage-list-item ${selectedStageId === id ? "is-active" : ""}" data-stage-id="${escapeHtml(id)}">
        <strong>Stage ${escapeHtml(id)}</strong>
        <small>${escapeHtml(stage?.label || (id === "0" ? "Initial stage" : "No label"))}${stage?.setup.automatic.enabled ? " · A enabled" : ""}${stage?.setup.features.length ? ` · ${stage.setup.features.length} Af` : ""}${stage?.spawns.questItems.length ? ` · ${stage.spawns.questItems.length} B` : ""}${stage?.spawns.monsters.length ? ` · ${stage.spawns.monsters.length} m` : ""}${stage?.spawns.dungeon.enabled ? " · D" : ""}${stage?.text.narrations.length ? ` · ${stage.text.narrations.length} X` : ""}${stage?.text.statusLines.length ? ` · ${stage.text.statusLines.length} x` : ""}${stage?.text.dialogues.length ? ` · ${stage.text.dialogues.length} W` : ""}${stage?.text.defaultReplies.length ? ` · ${stage.text.defaultReplies.length} Wr` : ""}${stage?.text.keywords.length ? ` · ${stage.text.keywords.length} Y` : ""}${stage?.text.replies.length ? ` · ${stage.text.replies.length} y` : ""}${stage?.goals.length ? ` · ${stage.goals.length} k` : ""}${stage?.retrieveGoals.length ? ` · ${stage.retrieveGoals.length} r` : ""}${stage?.deliveryGoals.length ? ` · ${stage.deliveryGoals.length} M` : ""}</small>
        <small>${escapeHtml(stage?.label || (id === "0" ? "Initial stage" : "No label"))}${stage?.setup.automatic.enabled ? " · A enabled" : ""}${stage?.setup.features.length ? ` · ${stage.setup.features.length} Af` : ""}${stage?.spawns.questItems.length ? ` · ${stage.spawns.questItems.length} B` : ""}${stage?.spawns.monsters.length ? ` · ${stage.spawns.monsters.length} m` : ""}${stage?.spawns.dungeon.enabled ? " · D" : ""}${stage?.text.narrations.length ? ` · ${stage.text.narrations.length} X` : ""}${stage?.text.statusLines.length ? ` · ${stage.text.statusLines.length} x` : ""}${stage?.text.dialogues.length ? ` · ${stage.text.dialogues.length} W` : ""}${stage?.text.defaultReplies.length ? ` · ${stage.text.defaultReplies.length} Wr` : ""}${stage?.text.keywords.length ? ` · ${stage.text.keywords.length} Y` : ""}${stage?.text.replies.length ? ` · ${stage.text.replies.length} y` : ""}${stage?.goals.length ? ` · ${stage.goals.length} k` : ""}${stage?.retrieveGoals.length ? ` · ${stage.retrieveGoals.length} r` : ""}${stage?.deliveryGoals.length ? ` · ${stage.deliveryGoals.length} M` : ""}${stage?.completion.transitions.length ? ` · ${stage.completion.transitions.length} G` : ""}${stage?.completion.rewardConditions.length ? ` · ${stage.completion.rewardConditions.length} O` : ""}${stage?.completion.rewards.length ? ` · ${stage.completion.rewards.length} R` : ""}</small>
      </button>`;
    }),
  ].join("");
}

function renderStageEditor() {
  if (!stageEditor) {
    return;
  }
  if (selectedStageId === sharedStageId) {
    const stage = sharedStage || createStage(sharedStageId, "Shared / any stage");
    stageEditor.innerHTML = `
      <div class="stage-editor-head">
        <div><strong>Shared / any stage</strong><p>For supported entries that use stage -1.</p></div>
      </div>
      <div class="stage-blocks">
        ${renderSharedStageText(stage)}
        ${stageBlock("Preserved Raw Lines", `${stage.rawLines.length} preserved raw lines.`)}
      </div>
    `;
    return;
  }

  const stage = stages[selectedStageId];
  if (!stage) {
    stageEditor.innerHTML = '<p class="empty-note">Select or add a stage.</p>';
    return;
  }

  stageEditor.innerHTML = `
    <div class="stage-editor-head">
      <label>Stage ID <input data-stage-id-input type="number" min="0" max="49" value="${escapeHtml(stage.id)}" ${stage.id === "0" ? "disabled" : ""}></label>
      <label>Editor label <input data-stage-label-input value="${escapeHtml(stage.label)}" placeholder="${stage.id === "0" ? "Initial stage" : "Optional label"}"></label>
    </div>
    <div class="stage-blocks">
      ${renderStageAutomatic(stage)}
      ${renderQuestorActions(stage)}
      ${renderStageSpawns(stage)}
      ${renderStageDungeon(stage)}
      ${renderStageText(stage)}
      ${renderStageGoals(stage)}
      ${renderStageCompletion(stage)}
      ${stageBlock("Preserved Raw Lines", `${stage.rawLines.length} preserved raw lines.`)}
    </div>
  `;
}

function renderStages() {
  renderStageList();
  renderStageEditor();
  const selectedIndex = stageOrder.indexOf(selectedStageId);
  const normalStageSelected = selectedIndex >= 0;
  if (duplicateStageButton) duplicateStageButton.disabled = !normalStageSelected || stageOrder.length >= 50;
  if (moveStageUpButton) moveStageUpButton.disabled = !normalStageSelected || selectedIndex === 0;
  if (moveStageDownButton) moveStageDownButton.disabled = !normalStageSelected || selectedIndex === stageOrder.length - 1;
  if (removeStageButton) removeStageButton.disabled = !normalStageSelected || selectedStageId === "0";
  if (addStageButton) addStageButton.disabled = stageOrder.length >= 50;
  renderAcceptStageOptions();
}

function syncAcceptStagesFromSelect() {
  const select = field("accept_stages_select");
  if (!select) {
    return;
  }

  const selectedStages = [...select.selectedOptions].map((option) => option.value);
  setValue("accept_stages", selectedStages.join(":"));
}

function renderAcceptStageOptions() {
  const select = field("accept_stages_select");
  if (!select) {
    return;
  }

  const existingSelection = new Set([
    ...value("accept_stages").split(":").filter(Boolean),
    ...[...select.selectedOptions].map((option) => option.value),
  ]);
  const stages = [...new Set([...collectStages(), ...existingSelection])]
    .sort((a, b) => Number(a) - Number(b));

  select.innerHTML = stages
    .map((stage) => `<option value="${escapeHtml(stage)}">${escapeHtml(stage)}</option>`)
    .join("");

  for (const option of select.options) {
    option.selected = existingSelection.has(option.value);
  }

  syncAcceptStagesFromSelect();
}

function questRows() {
  return questHeaders.map((quest) => ({
    codename: quest.codename || "",
    index: quest.index || "",
    name: quest.name || "",
  })).filter((quest) => quest.codename !== "");
}

function prerequisiteCodes() {
  return value("prerequisites").split(":").map((code) => code.trim()).filter(Boolean);
}

function questLabel(code) {
  const quest = questRows().find((row) => row.codename === code);
  return quest ? `${quest.name} (${quest.codename})` : `Unknown quest (${code})`;
}

function syncPrerequisitesFromSelect() {
  if (!prerequisitesSelect) {
    return;
  }

  const selectedOptions = [...prerequisitesSelect.selectedOptions];
  if (selectedOptions.length > 5) {
    for (const option of selectedOptions.slice(5)) {
      option.selected = false;
    }
  }

  const selectedCodes = [...prerequisitesSelect.selectedOptions].map((option) => option.value);
  setValue("prerequisites", selectedCodes.join(":"));
  renderPrerequisitesPreview(selectedCodes);
}

function renderPrerequisitesPreview(codes = prerequisiteCodes()) {
  if (!prerequisitesPreview) {
    return;
  }

  if (codes.length === 0) {
    prerequisitesPreview.textContent = "Selected: None";
    return;
  }

  prerequisitesPreview.innerHTML = [
    "<span>Selected:</span>",
    ...codes.map((code) => `
      <span class="selected-token">
        <button type="button" class="clear-selected" data-clear-prerequisite="${escapeHtml(code)}" aria-label="Remove prerequisite ${escapeHtml(code)}">x</button>
        <span>${escapeHtml(questLabel(code))}</span>
      </span>
    `),
  ].join("");
}

function renderPrerequisiteOptions() {
  if (!prerequisitesSelect) {
    return;
  }

  const query = prerequisiteSearch?.value.trim().toLowerCase() || "";
  const currentCodename = value("codename");
  const selectedCodes = prerequisiteCodes();
  const selectedSet = new Set(selectedCodes);
  const rows = questRows();
  const knownCodes = new Set(rows.map((quest) => quest.codename));
  const visibleRows = rows.filter((quest) => {
    if (selectedSet.has(quest.codename)) {
      return true;
    }

    if (quest.codename === currentCodename) {
      return false;
    }

    const label = `${quest.index} ${quest.codename} ${quest.name}`.toLowerCase();
    return query === "" || label.includes(query);
  });
  const unknownRows = selectedCodes
    .filter((code) => !knownCodes.has(code))
    .map((code) => ({ codename: code, index: "", name: "Unknown quest" }));
  const optionRows = [...unknownRows, ...visibleRows];

  prerequisitesSelect.innerHTML = optionRows
    .map((quest) => {
      const label = quest.index === ""
        ? `${quest.codename} - ${quest.name}`
        : `${quest.codename} - ${quest.name} (#${quest.index})`;
      return `<option value="${escapeHtml(quest.codename)}">${escapeHtml(label)}</option>`;
    })
    .join("");

  for (const option of prerequisitesSelect.options) {
    option.selected = selectedSet.has(option.value);
  }

  renderPrerequisitesPreview(selectedCodes);
}

function removePrerequisite(code) {
  const nextCodes = prerequisiteCodes().filter((nextCode) => nextCode !== code);
  setValue("prerequisites", nextCodes.join(":"));
  renderPrerequisiteOptions();
  renderPrerequisitesPreview(nextCodes);
}

function raceMaskFromIds(ids) {
  let mask = 0;
  for (const id of ids) {
    const raceId = Number(id);
    if (Number.isInteger(raceId) && raceId >= 0) {
      mask |= 1 << raceId;
    }
  }

  return mask.toString(16).toUpperCase();
}

function syncMaskPicker(config, changedInput = null) {
  if (!config.picker || !config.all) {
    return;
  }

  if (changedInput === config.all) {
    for (const checkbox of config.checkboxes) {
      checkbox.checked = config.all.checked;
    }
  } else if (config.checkboxes.includes(changedInput)) {
    config.all.checked = config.checkboxes.length > 0 && config.checkboxes.every((checkbox) => checkbox.checked);
  }

  const selectedIds = config.checkboxes
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);
  const selectedNames = config.checkboxes
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.closest(".picker-option")?.textContent.trim() || checkbox.value);
  const allMask = config.picker.dataset.allMask || raceMaskFromIds(config.checkboxes.map((checkbox) => checkbox.value));
  const mask = config.all.checked ? allMask : raceMaskFromIds(selectedIds);

  if (config.summary) {
    if (config.all.checked) {
      config.summary.textContent = `All ${config.plural}`;
    } else if (selectedNames.length === 0) {
      config.summary.textContent = `No ${config.plural}`;
    } else if (selectedNames.length <= 3) {
      config.summary.textContent = selectedNames.join(", ");
    } else {
      config.summary.textContent = `${selectedNames.length} ${config.plural}`;
    }
  }

  setValue(config.hiddenName, mask);
  if (config.preview) {
    config.preview.textContent = `Mask: ${mask}`;
  }
}

function syncMaskPickers() {
  for (const config of maskPickers) {
    syncMaskPicker(config);
  }
}

function monsterformRows() {
  return Array.isArray(gameData.monsters) ? gameData.monsters : [];
}

function setMonsterform(record) {
  selectedMonsterform = record;
  setValue("monsterform", record ? record.id : "0");

  if (monsterformSearch) {
    monsterformSearch.value = "";
  }

  renderMonsterformSelected();
  renderMonsterformSuggestions();
}

function renderMonsterformSelected() {
  if (!monsterformSelected) {
    return;
  }

  if (!selectedMonsterform) {
    monsterformSelected.textContent = "Selected: None (0)";
    return;
  }

  monsterformSelected.innerHTML = `
    <span>Selected:</span>
    <button type="button" class="clear-selected" id="clearMonsterform" aria-label="Clear monster form">x</button>
    <span>${escapeHtml(selectedMonsterform.name)} (${escapeHtml(selectedMonsterform.id)})</span>
  `;
}

function renderMonsterformSuggestions() {
  if (!monsterformSuggestions || !monsterformSearch) {
    return;
  }

  const query = monsterformSearch.value.trim().toLowerCase();
  const matches = monsterformRows()
    .filter((monster) => {
      const name = String(monster.name || "").toLowerCase();
      return query === "" || name.includes(query);
    })
    .slice(0, 25);

  const rows = matches.length === 0
    ? [`<div class="autocomplete-empty">No monsters found.</div>`]
    : [
      `<button type="button" class="autocomplete-option" data-monster-id="0">None (0)</button>`,
      ...matches.map((monster) => (
        `<button type="button" class="autocomplete-option" data-monster-id="${escapeHtml(monster.id)}">${escapeHtml(monster.name)} (${escapeHtml(monster.id)})</button>`
      )),
    ];

  monsterformSuggestions.innerHTML = rows.join("");
  monsterformSuggestions.classList.add("is-open");
  monsterformSuggestions.style.display = "grid";
}

function recordRows(source) {
  return Array.isArray(gameData[source]) ? gameData[source] : [];
}

function recordById(source, id) {
  return lookups[source]?.byId.get(String(id)) || null;
}

function questorRecordLabel(source, id, emptyValue, emptyLabel, unknownLabel) {
  const valueId = String(id || emptyValue);
  if (valueId === String(emptyValue) && emptyLabel) {
    return `${emptyLabel} (${emptyValue})`;
  }

  const record = recordById(source, valueId);
  return record ? `${record.name} (${record.id})` : `${unknownLabel} (${valueId})`;
}

function questorItemId(questor, tvalPath = "object.tval", svalPath = "object.sval") {
  return `${questorValue(questor, tvalPath)}:${questorValue(questor, svalPath)}`;
}

function questorItemLabel(questor, tvalPath = "object.tval", svalPath = "object.sval") {
  const itemId = questorItemId(questor, tvalPath, svalPath);
  const record = recordById("items", itemId);
  return record ? `${record.name} (${record.id})` : `Unknown item (${itemId})`;
}

function renderQuestorItemSearchField(questor, {
  label = "Item tval/sval",
  tvalPath = "object.tval",
  svalPath = "object.sval",
} = {}) {
  return `
    <label class="questor-record-field">
      ${escapeHtml(label)}
      <input data-questor-item-search data-tval-path="${escapeHtml(tvalPath)}" data-sval-path="${escapeHtml(svalPath)}" type="search" placeholder="Search items">
      <div class="autocomplete-list" data-questor-item-suggestions></div>
      <div class="selected-entity">
        <span>Selected:</span>
        <button type="button" class="clear-selected" data-clear-questor-item data-tval-path="${escapeHtml(tvalPath)}" data-sval-path="${escapeHtml(svalPath)}" aria-label="Reset item">x</button>
        <span>${escapeHtml(questorItemLabel(questor, tvalPath, svalPath))}</span>
      </div>
    </label>
  `;
}

function renderQuestorItemSuggestions(input) {
  const wrapper = input.closest(".questor-record-field");
  const suggestions = wrapper?.querySelector("[data-questor-item-suggestions]");
  if (!wrapper || !suggestions) {
    return;
  }

  const query = input.value.trim().toLowerCase();
  const matches = recordRows("items")
    .filter((record) => {
      const name = String(record.name || "").toLowerCase();
      return query === "" || name.includes(query);
    })
    .slice(0, 25);

  suggestions.innerHTML = matches.length === 0
    ? '<div class="autocomplete-empty">No items found.</div>'
    : matches.map((record) => (
      `<button type="button" class="autocomplete-option" data-questor-item-id="${escapeHtml(record.id)}" data-tval-path="${escapeHtml(input.dataset.tvalPath || "object.tval")}" data-sval-path="${escapeHtml(input.dataset.svalPath || "object.sval")}">${escapeHtml(record.name)} (${escapeHtml(record.id)})</button>`
    )).join("");
  suggestions.classList.add("is-open");
  suggestions.style.display = "grid";
}

function renderQuestorRecordSearchField({ questor, label, path, source, placeholder, emptyValue, emptyLabel = "", unknownLabel, includeEmpty = false }) {
  const currentId = questorValue(questor, path) || emptyValue;

  return `
    <label class="questor-record-field">
      ${escapeHtml(label)}
      <input data-questor-record-search data-qpath="${escapeHtml(path)}" data-source="${escapeHtml(source)}" data-empty-value="${escapeHtml(emptyValue)}" data-include-empty="${includeEmpty ? "true" : "false"}" type="search" placeholder="${escapeHtml(placeholder)}">
      <div class="autocomplete-list" data-questor-record-suggestions></div>
      <div class="selected-entity">
        <span>Selected:</span>
        <button type="button" class="clear-selected" data-clear-questor-record data-qpath="${escapeHtml(path)}" data-empty-value="${escapeHtml(emptyValue)}" aria-label="Reset ${escapeHtml(label)}">x</button>
        <span>${escapeHtml(questorRecordLabel(source, currentId, emptyValue, emptyLabel, unknownLabel))}</span>
      </div>
    </label>
  `;
}

function renderQuestorRecordSuggestions(input) {
  const wrapper = input.closest(".questor-record-field");
  const suggestions = wrapper?.querySelector("[data-questor-record-suggestions]");
  if (!wrapper || !suggestions) {
    return;
  }

  const source = input.dataset.source || "";
  const query = input.value.trim().toLowerCase();
  const matches = recordRows(source)
    .filter((record) => {
      const name = String(record.name || "").toLowerCase();
      return query === "" || name.includes(query);
    })
    .slice(0, 25);
  const emptyRow = input.dataset.includeEmpty === "true"
    ? [`<button type="button" class="autocomplete-option" data-questor-record-id="${escapeHtml(input.dataset.emptyValue || "0")}" data-qpath="${escapeHtml(input.dataset.qpath || "")}">None (${escapeHtml(input.dataset.emptyValue || "0")})</button>`]
    : [];

  suggestions.innerHTML = matches.length === 0 && emptyRow.length === 0
    ? '<div class="autocomplete-empty">No records found.</div>'
    : [
      ...emptyRow,
      ...matches.map((record) => (
        `<button type="button" class="autocomplete-option" data-questor-record-id="${escapeHtml(record.id)}" data-qpath="${escapeHtml(input.dataset.qpath || "")}">${escapeHtml(record.name)} (${escapeHtml(record.id)})</button>`
      )),
    ].join("");
  suggestions.classList.add("is-open");
  suggestions.style.display = "grid";
}

function closeQuestorRecordSuggestions() {
  questorEditor?.querySelectorAll("[data-questor-record-suggestions]").forEach((suggestions) => {
    suggestions.innerHTML = "";
    suggestions.classList.remove("is-open");
    suggestions.style.display = "";
  });
  questorEditor?.querySelectorAll("[data-questor-item-suggestions]").forEach((suggestions) => {
    suggestions.innerHTML = "";
    suggestions.classList.remove("is-open");
    suggestions.style.display = "";
  });
}

function questorValue(questor, path) {
  return path.split(".").reduce((value, key) => value?.[key], questor) ?? "";
}

function setQuestorValue(questor, path, nextValue) {
  const parts = path.split(".");
  const last = parts.pop();
  const target = parts.reduce((value, key) => value[key], questor);
  target[last] = typeof nextValue === "boolean" ? nextValue : String(nextValue);
}

function questorInput(label, path, type = "text", attrs = "") {
  const questor = questors[selectedQuestorIndex];
  return `<label>${label} <input data-qprop="${path}" type="${type}" value="${escapeHtml(questorValue(questor, path))}" ${attrs}></label>`;
}

function questorInputWithTooltip(label, tooltip, path, type = "text", attrs = "") {
  const questor = questors[selectedQuestorIndex];
  return `
    <label>
      <span class="label-row">
        ${escapeHtml(label)}
        <button type="button" class="tooltip-button" aria-label="${escapeHtml(label)} help" data-tooltip="${escapeHtml(tooltip)}">?</button>
      </span>
      <input data-qprop="${path}" type="${type}" value="${escapeHtml(questorValue(questor, path))}" ${attrs}>
    </label>
  `;
}

function questorSelect(label, path, options) {
  const questor = questors[selectedQuestorIndex];
  const current = String(questorValue(questor, path));
  return `
    <label>
      ${label}
      <select data-qprop="${path}">
        ${options.map(([valueOption, text, disabled = false]) => (
          `<option value="${escapeHtml(valueOption)}" ${current === String(valueOption) ? "selected" : ""} ${disabled ? "disabled" : ""}>${escapeHtml(text)}</option>`
        )).join("")}
      </select>
    </label>
  `;
}

function questorSelectWithTooltip(label, tooltip, path, options) {
  const questor = questors[selectedQuestorIndex];
  const current = String(questorValue(questor, path));
  const hasCurrent = options.some(([valueOption]) => current === String(valueOption));

  return `
    <label>
      <span class="label-row">
        ${escapeHtml(label)}
        <button type="button" class="tooltip-button" aria-label="${escapeHtml(label)} help" data-tooltip="${escapeHtml(tooltip)}">?</button>
      </span>
      <select data-qprop="${path}">
        ${hasCurrent ? "" : `<option value="${escapeHtml(current)}" selected>Current: ${escapeHtml(current)} (unknown)</option>`}
        ${options.map(([valueOption, text, disabled = false]) => (
          `<option value="${escapeHtml(valueOption)}" ${current === String(valueOption) ? "selected" : ""} ${disabled ? "disabled" : ""}>${escapeHtml(text)}</option>`
        )).join("")}
      </select>
    </label>
  `;
}

function numericValue(valueText) {
  const valueNumber = Number.parseInt(String(valueText || "0"), 10);
  return Number.isFinite(valueNumber) ? valueNumber : 0;
}

function numericMask(valueText) {
  const valueNumber = numericValue(valueText);
  return Number.isFinite(valueNumber) && valueNumber > 0 ? valueNumber : 0;
}

function maskHasValue(mask, value) {
  return Math.floor(mask / value) % 2 === 1;
}

function knownMask(options) {
  return options.reduce((mask, option) => mask + option.value, 0);
}

function unknownMaskForOptions(mask, options) {
  return mask - options
    .filter((option) => maskHasValue(mask, option.value))
    .reduce((known, option) => known + option.value, 0);
}

function maskSummary(mask, options, emptyLabel) {
  const selected = options.filter((option) => maskHasValue(mask, option.value));
  if (selected.length === 0) {
    return emptyLabel;
  }
  if (selected.length <= 2) {
    return selected.map((option) => option.label).join(", ");
  }
  return `${selected.length} selected`;
}

function renderQuestorMaskField({
  questor,
  label,
  path,
  options,
  tooltip,
  emptyLabel = "None selected",
  preserveUnknown = false,
  unknownLabel = "Unknown bits",
}) {
  const currentMask = numericMask(questorValue(questor, path));
  const unknownMask = unknownMaskForOptions(currentMask, options);

  return `
    <div class="field-label nameflags-field questor-mask-field" data-qmask-field="${escapeHtml(path)}" data-qmask-unknown="${unknownMask}" ${preserveUnknown ? 'data-qmask-preserve-unknown="true"' : ""}>
      <span class="label-row">
        ${escapeHtml(label)}
        <button type="button" class="tooltip-button" aria-label="${escapeHtml(label)} help" data-tooltip="${escapeHtml(tooltip)}">?</button>
      </span>
      <div class="option-picker nameflags-picker">
        <button type="button" class="option-picker-toggle" data-qmask-toggle aria-expanded="false">
          <span>${escapeHtml(maskSummary(currentMask, options, emptyLabel))}</span>
          <span aria-hidden="true">v</span>
        </button>
        <div class="option-picker-panel">
          ${options.map((option) => `
          <label class="picker-option">
            <input data-qmask-option="${option.value}" data-qpath="${escapeHtml(path)}" type="checkbox" ${maskHasValue(currentMask, option.value) ? "checked" : ""}>
            <span>${escapeHtml(option.value)} - ${escapeHtml(option.label)} <small>${escapeHtml(option.description)}</small></span>
          </label>
          `).join("")}
        </div>
      </div>
      <span class="field-note">Mask: ${escapeHtml(String(currentMask))}</span>
      ${unknownMask > 0 ? `<span class="field-note warning-note">${escapeHtml(unknownLabel)}: ${escapeHtml(String(unknownMask))}</span>` : ""}
    </div>
  `;
}

function syncQuestorMaskFromEditor(questor, path) {
  const field = [...questorEditor.querySelectorAll("[data-qmask-field]")]
    .find((candidate) => candidate.dataset.qmaskField === path);
  const selectedMask = [...(field?.querySelectorAll("[data-qmask-option]:checked") || [])]
    .filter((checkbox) => checkbox.dataset.qpath === path)
    .reduce((mask, checkbox) => mask + numericValue(checkbox.dataset.qmaskOption), 0);
  const preservedMask = field?.dataset.qmaskPreserveUnknown === "true"
    ? numericMask(field.dataset.qmaskUnknown)
    : 0;
  setQuestorValue(questor, path, selectedMask + preservedMask);
}

function dungeonIdRows() {
  return [
    ...dungeonSpecialOptions,
    ...recordRows("dungeons")
      .filter((dungeon) => String(dungeon.id) !== "0")
      .map((dungeon) => ({ id: String(dungeon.id), name: dungeon.name })),
  ];
}

function selectedDungeonIds(questor) {
  return String(questor.dungeon.ids || "").split(":").filter(Boolean);
}

function renderQuestorDungeonPicker(questor) {
  const selectedIds = selectedDungeonIds(questor);
  const knownRows = dungeonIdRows();
  const knownIds = new Set(knownRows.map((row) => row.id));
  const unknownIds = selectedIds.filter((id) => !knownIds.has(id));
  const summary = selectedIds.length === 0
    ? "No dungeons"
    : selectedIds.length <= 2
      ? selectedIds.join(", ")
      : `${selectedIds.length} selected`;

  return `
    <div class="field-label nameflags-field questor-dungeon-field">
      <span class="label-row">
        Dungeon ids
        <button type="button" class="tooltip-button" aria-label="Dungeon ids help" data-tooltip="Colon-separated dungeon filter for Ld. 0 = all wilderness/non-d_info dungeons. 255 = IDDC. Other values are d_info dungeon IDs.">?</button>
      </span>
      <div class="option-picker nameflags-picker">
        <button type="button" class="option-picker-toggle" data-dungeon-toggle aria-expanded="false">
          <span>${escapeHtml(summary)}</span>
          <span aria-hidden="true">v</span>
        </button>
        <div class="option-picker-panel">
          ${knownRows.map((row) => `
          <label class="picker-option">
            <input data-dungeon-id="${escapeHtml(row.id)}" type="checkbox" ${selectedIds.includes(row.id) ? "checked" : ""}>
            <span>${escapeHtml(row.id)} - ${escapeHtml(row.name)}</span>
          </label>
          `).join("")}
          ${unknownIds.map((id) => `
          <label class="picker-option">
            <input data-dungeon-id="${escapeHtml(id)}" type="checkbox" checked>
            <span>${escapeHtml(id)} - Unknown dungeon</span>
          </label>
          `).join("")}
        </div>
      </div>
      <span class="field-note">Ids: ${escapeHtml(questor.dungeon.ids || "-")}</span>
    </div>
  `;
}

function syncDungeonIdsFromEditor(questor) {
  questor.dungeon.ids = [...questorEditor.querySelectorAll("[data-dungeon-id]:checked")]
    .map((checkbox) => checkbox.dataset.dungeonId || "")
    .filter(Boolean)
    .join(":");
}

function nameflagsSummary(mask) {
  const selectedNames = nameflagOptions
    .filter((option) => mask & option.value)
    .map((option) => option.label);

  if (selectedNames.length === 0) {
    return "No name flags";
  }
  if (selectedNames.length <= 3) {
    return selectedNames.join(", ");
  }
  return `${selectedNames.length} name flags`;
}

function renderNameflagsField(questor) {
  const currentMask = numericMask(questor.nameflags);
  const unknownMask = currentMask & ~knownNameflagsMask;

  return `
    <div class="field-label nameflags-field">
      <span>Name flags</span>
      <div class="option-picker nameflags-picker">
        <button type="button" class="option-picker-toggle" data-nameflags-toggle aria-expanded="false">
          <span>${escapeHtml(nameflagsSummary(currentMask))}</span>
          <span aria-hidden="true">v</span>
        </button>
        <div class="option-picker-panel">
          ${nameflagOptions.map((option) => `
          <label class="picker-option">
            <input data-nameflag="${option.value}" type="checkbox" ${(currentMask & option.value) ? "checked" : ""}>
            <span>${escapeHtml(option.value)} - ${escapeHtml(option.label)} <small>${escapeHtml(option.description)}</small></span>
          </label>
        `).join("")}
        </div>
      </div>
      <span class="field-note">Mask: ${escapeHtml(String(currentMask))}. Values are added together, for example male + pseudo-unique = 5.</span>
      ${unknownMask ? `<span class="field-note warning-note">Unknown bits in current value: ${escapeHtml(String(unknownMask))}</span>` : ""}
    </div>
  `;
}

function syncNameflagsFromEditor(questor) {
  const selectedMask = [...questorEditor.querySelectorAll("[data-nameflag]:checked")]
    .reduce((mask, checkbox) => mask | Number(checkbox.dataset.nameflag || 0), 0);
  questor.nameflags = String(selectedMask);
}

function renderQuestorList() {
  if (!questorList) {
    return;
  }

  questorList.innerHTML = questors.map((questor, index) => `
    <button type="button" class="questor-list-item ${index === selectedQuestorIndex ? "is-active" : ""}" data-questor-index="${index}">
      ${escapeHtml(questorTitle(questor, index))}
    </button>
  `).join("");
}

function renderQuestorEditor() {
  if (!questorEditor) {
    return;
  }

  if (questors.length === 0) {
    questorEditor.innerHTML = '<p class="empty-note">No questors. Add one questor to make the quest acquirable.</p>';
    return;
  }

  const questor = questors[selectedQuestorIndex] || questors[0];
  selectedQuestorIndex = Math.max(0, Math.min(selectedQuestorIndex, questors.length - 1));
  const isNpc = questor.type === "1";
  const isParchment = questor.type === "2";
  const isObject = questor.type === "3";

  questorEditor.innerHTML = `
    <div class="line-group-title">Q: identity/type</div>
    <div class="field-grid">
      ${questorSelect("Questor type", "type", [
        ["1", "1 - NPC / neutral monster"],
        ["2", "2 - parchment"],
        ["3", "3 - item pickup"],
        ["0", "0 - rumour (unsupported)", true],
        ["4", "4 - item touch (unsupported)", true],
      ])}
      <div class="questor-subblock lite-subblock">
        <div class="questor-subblock-title">Lite</div>
        <div class="questor-subblock-grid">
          ${questorSelectWithTooltip("Lite type", "0 = no light. 1..99 = fire/torch-style light, radius = value. 100+n = white/Feanorian light, radius = n. 200+n = vampire light, radius = n.", "liteType", liteTypeOptions)}
          ${questorInputWithTooltip("Lite radius", "Radius part of lite. No light ignores radius. Fire and white support 0..99. Vampire supports 0..55 because lite is stored as 0..255.", "liteRadius", "number", 'min="0"')}
        </div>
      </div>
      ${questorInput("Name", "name")}
      ${renderNameflagsField(questor)}
      ${isNpc ? `
        ${renderQuestorRecordSearchField({
          questor,
          label: "Monster ridx",
          path: "npc.ridx",
          source: "monsters",
          placeholder: "Search monsters",
          emptyValue: defaultQuestor().npc.ridx,
          unknownLabel: "Unknown monster",
        })}
        ${renderQuestorRecordSearchField({
          questor,
          label: "Monster ego reidx",
          path: "npc.reidx",
          source: "monsterEgos",
          placeholder: "Search monster egos",
          emptyValue: "0",
          emptyLabel: "None",
          unknownLabel: "Unknown monster ego",
          includeEmpty: true,
        })}
        ${questorInputWithTooltip("Map counter", "0 is the normal/default mapping counter. Non-negative values 0..n identify custom font/tileset mappings. .prf files can refer to them as R:Q<questindex>N<counter>:[<attr>]/[<char>].", "npc.rmapcnt", "number", 'min="0"')}
        ${renderQuestorRecordSearchField({
          questor,
          label: "Visual monster",
          path: "npc.rcharidx",
          source: "monsters",
          placeholder: "Search visual monster",
          emptyValue: defaultQuestor().npc.rcharidx,
          unknownLabel: "Unknown monster",
        })}
        ${questorSelectWithTooltip("Visual attr", "One-character TomeNET color attr. This overrides the visual monster color while keeping the selected visual monster character.", "npc.rattr", visualAttrOptions)}
        ${questorInputWithTooltip("Min level", "Minimum questor monster level. Existing q_info examples use -1 for no explicit minimum. Non-negative values are level bounds for the questor monster. This field is stored with max level in the Q line as minlv:maxlv.", "npc.minlv", "number")}
        ${questorInput("Max level", "npc.maxlv", "number")}
      ` : ""}
      ${isParchment ? `
        ${renderQuestorRecordSearchField({
          questor,
          label: "Parchment sval",
          path: "parchment.sval",
          source: "parchments",
          placeholder: "Search parchments",
          emptyValue: "0",
          unknownLabel: "Unknown parchment",
        })}
        ${questorSelectWithTooltip("Attr", "One-character TomeNET color attr for parchment questor display. Parsed with color_char_to_attr().", "parchment.attr", visualAttrOptions)}
        ${questorInput("Level", "parchment.level", "number")}
      ` : ""}
      ${isObject ? `
        ${renderQuestorItemSearchField(questor)}
        ${questorInputWithTooltip("pval", "Raw object pval. Stored as q_questor->opval, then assigned to o_ptr->pval after apply_magic(). It is the extra enchantment/artifact/ego parameter. Its meaning depends on the selected item and egos: bonus magnitude, charges/cooldown, spell or other item-specific index. Usually 0 unless the selected object needs a known pval.", "object.pval", "number")}
        ${questorInputWithTooltip("bpval", "Raw object bpval. Stored as q_questor->obpval, then assigned to o_ptr->bpval after apply_magic(). It is the base item extra parameter. Its meaning depends on the selected item type: base bonus, stack/recharge state, or other item-specific data. Usually 0 unless the selected object needs a known bpval.", "object.bpval", "number")}
        ${renderQuestorRecordSearchField({
          questor,
          label: "Artifact name1",
          path: "object.name1",
          source: "artifacts",
          placeholder: "Search artifacts",
          emptyValue: "0",
          emptyLabel: "None",
          unknownLabel: "Unknown artifact",
          includeEmpty: true,
        })}
        ${renderQuestorRecordSearchField({
          questor,
          label: "Ego name2",
          path: "object.name2",
          source: "egoItems",
          placeholder: "Search ego items",
          emptyValue: "0",
          emptyLabel: "None",
          unknownLabel: "Unknown ego item",
          includeEmpty: true,
        })}
        ${renderQuestorRecordSearchField({
          questor,
          label: "Ego name2b",
          path: "object.name2b",
          source: "egoItems",
          placeholder: "Search ego items",
          emptyValue: "0",
          emptyLabel: "None",
          unknownLabel: "Unknown ego item",
          includeEmpty: true,
        })}
        ${questorSelect("Good", "object.good", [["0", "0 - no"], ["1", "1 - yes"]])}
        ${questorSelect("Great", "object.great", [["0", "0 - no"], ["1", "1 - yes"]])}
        ${questorSelect("Very great", "object.vgreat", [["0", "0 - no"], ["1", "1 - yes"]])}
        ${questorSelectWithTooltip("Attr", "One-character TomeNET color attr for object questor display. Parsed with color_char_to_attr().", "object.attr", visualAttrOptions)}
        ${questorInputWithTooltip("Level", "Object level. The quest engine assigns this to o_ptr->level after apply_magic().", "object.level", "number")}
      ` : ""}
    </div>

    <div class="line-group-title">L: location</div>
    <div class="positioning-group">
      <div class="positioning-group-title">Positioning</div>
      <div class="positioning-subgroup">
        <div class="positioning-subgroup-title">World position + terrain</div>
        <div class="positioning-subgroup-grid">
          ${renderQuestorMaskField({
            questor,
            label: "Location types",
            path: "location.loc",
            options: locationTypeOptions,
            tooltip: "Location type mask. Surface=1, town=2, dungeon=4. Use 3 for surface or town. Must not be 0 unless exact world position is set.",
            emptyLabel: "No location type",
          })}
          ${renderQuestorMaskField({
            questor,
            label: "Terrains",
            path: "location.terrains",
            options: terrainOptions,
            tooltip: "Surface terrain mask for random wilderness spawns. WILD_TOO means any wilderness terrain. Values are stored as a decimal mask in the L line.",
            emptyLabel: "No terrain",
          })}
          ${renderQuestorMaskField({
            questor,
            label: "Towns",
            path: "location.towns",
            options: townOptions,
            tooltip: "Town mask for random town spawns. The engine uses only the five basic towns. Other defined town bits can be parsed but are not supported by questor spawning.",
            emptyLabel: "No town",
            preserveUnknown: true,
            unknownLabel: "Unsupported imported bits",
          })}
          <div class="coordinate-group">
            <div class="coordinate-group-title">World coordinates</div>
            <div class="coordinate-group-grid">
              ${questorInputWithTooltip("World X", "Exact world X. Use -1 for random eligible location from the location type, terrain, town, and dungeon filters.", "location.wx", "number")}
              ${questorInputWithTooltip("World Y", "Exact world Y. Use -1 with World X for random eligible location.", "location.wy", "number")}
              ${questorInputWithTooltip("World Z", "Exact depth/tower level. 0 is wilderness/town surface. Negative values are dungeon depths; positive values are tower levels.", "location.wz", "number")}
            </div>
          </div>
          ${questorSelectWithTooltip("Terrain patch", "0 = exact selected world sector. 1 = may vary the world position inside nearby connected sectors of the same wilderness terrain.", "location.terrainPatch", [["0", "0 - no"], ["1", "1 - yes"]])}
        </div>
      </div>
      <div class="positioning-subgroup">
        <div class="positioning-subgroup-title">Grid position</div>
        <div class="positioning-subgroup-grid">
          ${questorInputWithTooltip("Grid X", "Exact grid X on the selected floor/map. Used with Grid Y and Radius.", "location.x", "number")}
          ${questorInputWithTooltip("Grid Y", "Exact grid Y on the selected floor/map. Used with Grid X and Radius.", "location.y", "number")}
          ${questorInputWithTooltip("Radius", "Random offset radius around Grid X/Y. 0 means exact grid position.", "location.radius", "number", 'min="0"')}
        </div>
      </div>
      <div class="positioning-subgroup">
        <div class="positioning-subgroup-title">Map position</div>
        <div class="positioning-subgroup-grid">
          ${renderQuestorRecordSearchField({
            questor,
            label: "Map file",
            path: "location.map",
            source: "templates",
            placeholder: "Search map templates",
            emptyValue: "-",
            emptyLabel: "None",
            unknownLabel: "Unknown map file",
            includeEmpty: true,
          })}
          ${questorInputWithTooltip("Map offset X", "Template X offset used when Map file is set. Keep 0 when no map template is used.", "location.mapX", "number")}
          ${questorInputWithTooltip("Map offset Y", "Template Y offset used when Map file is set. Keep 0 when no map template is used.", "location.mapY", "number")}
        </div>
      </div>
    </div>

    <div class="line-group-title">Ld: dungeon filter</div>
    <div class="field-grid">
      <label class="checkbox-field"><input data-qbool="dungeon.enabled" type="checkbox" ${questor.dungeon.enabled ? "checked" : ""}> Emit Ld</label>
      ${questorInput("Min floor level", "dungeon.min", "number")}
      ${questorInput("Max floor level", "dungeon.max", "number")}
      ${renderQuestorDungeonPicker(questor)}
    </div>

    <div class="line-group-title">F: initial behavior</div>
    <div class="field-grid">
      <label class="checkbox-field"><input data-qbool="flags.emit" type="checkbox" ${questor.flags.emit ? "checked" : ""}> Emit F</label>
      ${questorSelect("Accept on LoS", "flags.acceptLos", [["0", "0 - no"], ["1", "1 - yes"]])}
      ${questorSelect("Accept on interaction", "flags.acceptInteract", [["0", "0 - no"], ["1", "1 - yes"]])}
      ${questorSelect("Talkable", "flags.talkable", [["0", "0 - no"], ["1", "1 - yes"]])}
      ${questorSelect("Despawned", "flags.despawned", [["0", "0 - no"], ["1", "1 - yes"]])}
      ${questorSelect("Invincible", "flags.invincible", [["0", "0 - no"], ["1", "1 - yes"]])}
      ${questorSelect("Static floor", "flags.staticFloor", [["0", "0 - no"], ["1", "1 - yes"]])}
      ${questorSelect("Quit floor", "flags.quitFloor", [["0", "0 - no"], ["1", "1 - yes"]])}
      <span class="field-note wide">TomeNET currently parses the first five F fields; static floor and quit floor are kept in generated output for documented format compatibility.</span>
    </div>

    ${isNpc ? `
      <div class="line-group-title">K: killable drops/exp</div>
      <div class="field-grid">
        <label class="checkbox-field"><input data-qbool="drops.enabled" type="checkbox" ${questor.drops.enabled ? "checked" : ""}> Emit K</label>
        ${renderQuestorMaskField({
          questor,
          label: "Drop behavior",
          path: "drops.type",
          options: dropTypeOptions,
          tooltip: "Bit mask used when the NPC dies. Regular loot enables the monster type's normal drops. Specific enables the configured item, generated reward, and gold.",
          emptyLabel: "No drops",
          preserveUnknown: true,
          unknownLabel: "Unknown imported bits",
        })}
        <div class="questor-wide-group">
          <div class="questor-wide-group-title">Specific item</div>
          <div class="questor-wide-group-grid">
            ${renderQuestorItemSearchField(questor, {
              label: "Drop item",
              tvalPath: "drops.tval",
              svalPath: "drops.sval",
            })}
            ${questorInputWithTooltip("pval", "Applied directly to the exact dropped item after apply_magic(). Its meaning depends on the item and egos. It is ignored when Good, Great, or Very great enables quality generation.", "drops.pval", "number")}
            ${questorInputWithTooltip("bpval", "Applied directly to the exact dropped item after apply_magic(). Its meaning depends on the item and egos. It is ignored when Good, Great, or Very great enables quality generation.", "drops.bpval", "number")}
            ${questorSelectWithTooltip("Create random artifact", "Any non-zero name1 value causes TomeNET to create a random artifact and clear both ego fields. True artifact IDs are not used here.", "drops.name1", [["0", "0 - no"], ["1", "1 - yes"]])}
            ${renderQuestorRecordSearchField({
              questor,
              label: "Ego name2",
              path: "drops.name2",
              source: "egoItems",
              placeholder: "Search ego items",
              emptyValue: "0",
              emptyLabel: "None",
              unknownLabel: "Unknown ego item",
              includeEmpty: true,
            })}
            ${renderQuestorRecordSearchField({
              questor,
              label: "Ego name2b",
              path: "drops.name2b",
              source: "egoItems",
              placeholder: "Search ego items",
              emptyValue: "0",
              emptyLabel: "None",
              unknownLabel: "Unknown ego item",
              includeEmpty: true,
            })}
            ${questorSelectWithTooltip("Good", "Generate the selected item with apply_magic(). When any quality option is enabled, manual pval, bpval, random artifact, and ego settings are ignored.", "drops.good", [["0", "0 - no"], ["1", "1 - yes"]])}
            ${questorSelectWithTooltip("Great", "Generate the selected item with apply_magic(). When any quality option is enabled, manual pval, bpval, random artifact, and ego settings are ignored.", "drops.great", [["0", "0 - no"], ["1", "1 - yes"]])}
            ${questorSelectWithTooltip("Very great", "Generate the selected item with apply_magic(). When any quality option is enabled, manual pval, bpval, random artifact, and ego settings are ignored.", "drops.vgreat", [["0", "0 - no"], ["1", "1 - yes"]])}
          </div>
        </div>
        <div class="questor-wide-group">
          <div class="questor-wide-group-title">Generated reward, gold, and experience</div>
          <div class="questor-wide-group-grid">
            ${questorSelectWithTooltip("Generated reward", "Used only when no specific item tval is configured. Values select create_reward() restriction masks; 5 allows randarts.", "drops.reward", generatedRewardOptions)}
            ${questorInputWithTooltip("Drop gold", "Gold amount dropped in addition to an item or generated reward. 0 disables the gold drop.", "drops.gold", "number", 'min="0"')}
            ${questorInputWithTooltip("Give experience", "-1 uses normal monster experience. 0 gives no experience. A positive value is multiplied by the killed NPC's monster level.", "drops.exp", "number", 'min="-1"')}
          </div>
        </div>
      </div>
    ` : ""}
  `;
}

function renderQuestors() {
  renderQuestorList();
  renderQuestorEditor();
  renderStages();
}

function questorLocationLine(questor) {
  const loc = questor.location;
  return `L:${loc.loc}:${loc.terrains}:${loc.towns}:${loc.wx}:${loc.wy}:${loc.wz}:${loc.terrainPatch}:${loc.x}:${loc.y}:${loc.radius}:${loc.map || "-"}:${loc.mapX}:${loc.mapY}`;
}

function questorLines(questor) {
  const lines = [];

  if (questor.type === "1") {
    const npc = questor.npc;
    lines.push(`Q:${questor.type}:${liteValue(questor)}:${npc.ridx}:${npc.reidx}:${npc.rmapcnt}:${npc.rcharidx}:${npc.rattr || "-"}:${npc.minlv}:${npc.maxlv}:${questor.name}:${questor.nameflags}`);
  } else if (questor.type === "2") {
    const parchment = questor.parchment;
    lines.push(`Q:${questor.type}:${liteValue(questor)}:${parchment.sval}:${parchment.attr || "-"}:${parchment.level}:${questor.name}:${questor.nameflags}`);
  } else if (questor.type === "3") {
    const object = questor.object;
    lines.push(`Q:${questor.type}:${liteValue(questor)}:${object.tval}:${object.sval}:${object.pval}:${object.bpval}:${object.name1}:${object.name2}:${object.name2b}:${object.good}:${object.great}:${object.vgreat}:${object.attr || "-"}:${object.level}:${questor.name}:${questor.nameflags}`);
  } else if (questor.raw?.q) {
    lines.push(`Q:${questor.raw.q}`);
  }

  lines.push(questorLocationLine(questor));

  if (questor.dungeon.enabled) {
    lines.push(`Ld:${questor.dungeon.min}:${questor.dungeon.max}:${questor.dungeon.ids}`);
  }

  if (questor.flags.emit) {
    const flags = questor.flags;
    lines.push(`F:${flags.acceptLos}:${flags.acceptInteract}:${flags.talkable}:${flags.despawned}:${flags.invincible}:${flags.staticFloor}:${flags.quitFloor}`);
  }

  if (questor.drops.enabled) {
    const drops = questor.drops;
    lines.push(`K:${drops.type}:${drops.tval}:${drops.sval}:${drops.pval}:${drops.bpval}:${drops.name1}:${drops.name2}:${drops.name2b}:${drops.good}:${drops.great}:${drops.vgreat}:${drops.reward}:${drops.gold}:${drops.exp}`);
  }

  return lines;
}

function setQuestorsFromRaw(rawQuestors = []) {
  questors = Array.isArray(rawQuestors) && rawQuestors.length > 0
    ? rawQuestors.map(parseQuestorGroup)
    : [defaultQuestor()];
  selectedQuestorIndex = 0;
  renderQuestors();
}

function parseQuestorsDataset(button) {
  try {
    return JSON.parse(button.dataset.questors || "[]");
  } catch {
    return [];
  }
}

function parseStagesDataset(button) {
  try {
    return JSON.parse(button.dataset.stages || "{}");
  } catch {
    return {};
  }
}

function automaticFlagsFromEditor() {
  const flags = [...(stageEditor?.querySelectorAll("[data-stage-flag]:checked") || [])]
    .map((checkbox) => checkbox.dataset.stageFlag || "")
    .join("");
  return flags || "-";
}

function stageKeywordLines(stage, stageId) {
  const lines = [];
  for (const entry of stageTextEntries(stage, "keyword")) {
    lines.push(`Y:${entry.questor || "-1"}:${stageId}:${entry.flags || "-"}:${entry.keyword || ""}:${entry.changeFlags || "-"}:${keywordNextStageValue(entry)}`);
    if (Array.isArray(entry.extraQuestors) && entry.extraQuestors.length) {
      lines.push(`YQ:${entry.extraQuestors.join(":")}`);
    }
    if (Array.isArray(entry.extraStages) && entry.extraStages.length) {
      lines.push(`YS:${entry.extraStages.join(":")}`);
    }
  }
  return lines;
}

function stageReplyLines(stage, stageId) {
  const lines = [];
  for (const entry of stageTextEntries(stage, "reply")) {
    lines.push(`y:${entry.questor || "-1"}:${stageId}:${entry.flags || "-"}:${entry.keyword || ""}`);
    const extraKeywords = Array.isArray(entry.extraKeywords)
      ? entry.extraKeywords.filter((keyword) => keyword !== "" && keyword !== entry.keyword)
      : [];
    if (extraKeywords.length) {
      lines.push(`yY:${extraKeywords.join(":")}`);
    }
    if (Array.isArray(entry.extraQuestors) && entry.extraQuestors.length) {
      lines.push(`yQ:${entry.extraQuestors.join(":")}`);
    }
    if (Array.isArray(entry.extraStages) && entry.extraStages.length) {
      lines.push(`yS:${entry.extraStages.join(":")}`);
    }
    for (const reply of entry.replies || []) {
      lines.push(`yR:${reply.flags || "-"}:${reply.text || ""}`);
    }
  }
  return lines;
}

function stageKillGoalLines(stage) {
  const lines = [];
  for (const goal of stage.goals) {
    const goalNumber = killGoalQInfoNumber(goal);
    lines.push(`k:${stage.id}:${goalNumber}:${goal.minlev || "0"}:${goal.maxlev || "0"}:${goal.number || "1"}`);
    if (goal.ridx.length) {
      lines.push(`kI:${stage.id}:${goalNumber}:${goal.ridx.join(":")}`);
    }
    if (goal.reidx.length) {
      lines.push(`kE:${stage.id}:${goalNumber}:${goal.reidx.join(":")}`);
    }
    if (goal.visuals.length) {
      lines.push(`kV:${stage.id}:${goalNumber}:${goal.visuals.flatMap((visual) => [visual.char || "-", visual.attr || "-"]).join(":")}`);
    }
    const names = goal.names.filter((name) => String(name).trim() !== "");
    if (names.length) {
      lines.push(`kN:${stage.id}:${goalNumber}:${names.join(":")}`);
    }
    if (goal.target?.enabled) {
      lines.push(goalTargetLine(stage.id, goalNumber, goal.target));
    }
    if (String(goal.changeFlags || "-") !== "-") {
      lines.push(`Z:${stage.id}:${goalNumber}:${goal.changeFlags}`);
    }
  }
  return lines;
}

function stageRetrieveGoalLines(stage) {
  const lines = [];
  for (const goal of stage.retrieveGoals) {
    const goalNumber = retrieveGoalQInfoNumber(goal);
    lines.push(`r:${stage.id}:${goalNumber}:${goal.minValue || "0"}:${goal.number || "1"}:${goal.allowOwned ? "1" : "0"}`);
    if (goal.items.length) {
      lines.push(`rI:${stage.id}:${goalNumber}:${goal.items.flatMap((itemId) => {
        const [tval = "-1", sval = "-1"] = String(itemId || "-1:-1").split(":");
        return [tval, sval];
      }).join(":")}`);
    }
    if (goal.values.length) {
      lines.push(`rV:${stage.id}:${goalNumber}:${goal.values.flatMap((value) => [
        value.pval || "-9999",
        value.bpval || "-9999",
        value.attr || "-",
        value.name1 || "-1",
        value.name2 || "-1",
        value.name2b || "-1",
      ]).join(":")}`);
    }
    const names = goal.names.filter((name) => String(name).trim() !== "");
    if (names.length) {
      lines.push(`rN:${stage.id}:${goalNumber}:${names.join(":")}`);
    }
    if (goal.target?.enabled) {
      lines.push(goalTargetLine(stage.id, goalNumber, goal.target));
    }
    if (String(goal.changeFlags || "-") !== "-") {
      lines.push(`Z:${stage.id}:${goalNumber}:${goal.changeFlags}`);
    }
  }
  return lines;
}

function stageDeliveryGoalLines(stage) {
  const lines = [];
  for (const goal of stage.deliveryGoals) {
    const goalNumber = deliveryGoalQInfoNumber(goal);
    lines.push(deliveryLine(stage.id, goal));
    if (String(goal.changeFlags || "-") !== "-") {
      lines.push(`Z:${stage.id}:${goalNumber}:${goal.changeFlags}`);
    }
  }
  return lines;
}

function stageSetupLines(stage) {
  const automatic = stage.setup.automatic;
  const lines = [];
  if (automatic.enabled) {
    const changeStage = automatic.changeMode === "exact"
      ? automatic.changeStage
      : automatic.changeMode === "random"
        ? `-${automatic.randomSteps}`
        : "255";
    const wx = automatic.genocideEnabled ? automatic.wx : "-1";
    const wy = automatic.genocideEnabled ? automatic.wy : "0";
    const wz = automatic.genocideEnabled ? automatic.wz : "0";
    lines.push(`A:${stage.id}:${automatic.activateQuest}:${automatic.autoAccept}:${changeStage}:0:${automatic.ingameHour}:${automatic.realMinutes}:${automatic.quiet}:${automatic.flags || "-"}:${wx}:${wy}:${wz}`);
  }
  for (const feature of stage.setup.features) {
    const questor = feature.source === "questor" ? feature.questor : "255";
    const questItemIndex = stage.spawns.questItems.findIndex((item) => item.uiId === feature.questItemRef);
    const questItem = feature.source === "questItem"
      ? questItemIndex >= 0 ? String(questItemIndex) : feature.questItem
      : "255";
    lines.push(`Af:${stage.id}:${questor}:${questItem}:${feature.wx}:${feature.wy}:${feature.wz}:${feature.x}:${feature.y}:${feature.feature}`);
  }
  for (const item of stage.spawns.questItems) {
    const loc = item.location;
    lines.push(`B:${stage.id}:${item.pval}:${item.char}:${item.attr}:${item.weight}:${item.level}:${item.name}`);
    lines.push(`Bl:${stage.id}:${item.delivery === "handout" ? item.questor : "-1"}:${loc.loc}:${loc.terrains}:${loc.towns}:${loc.wx}:${loc.wy}:${loc.wz}:${loc.terrainPatch}:${loc.x}:${loc.y}:${loc.radius}:${loc.map || "-"}:${loc.mapX}:${loc.mapY}`);
  }
  for (const spawn of stage.spawns.monsters) {
    const loc = spawn.location;
    lines.push(`m:${stage.id}:${spawn.amount}:${spawn.groups}:${spawn.scatter}:${spawn.clones}:${spawn.ridx}:${spawn.reidx}:${spawn.rchar || "-"}:${spawn.rattr || "-"}:${spawn.rlevmin}:${spawn.rlevmax}:${spawn.name || "-"}`);
    lines.push(`ml:${stage.id}:${loc.loc}:${loc.terrains}:${loc.towns}:${loc.wx}:${loc.wy}:${loc.terrainPatch}:${loc.x}:${loc.y}:${loc.radius}:${loc.map || "-"}:${loc.mapX}:${loc.mapY}`);
    if (spawn.hostilityEnabled) {
      lines.push(`mh:${stage.id}:${spawn.hostilePlayer}:${spawn.hostileQuestor}:${spawn.invinciblePlayer}:${spawn.invincibleQuestor}:${spawn.targetPlayer}:${spawn.targetQuestor}`);
    }
  }
  for (const morph of stage.questorActions.morphs) {
    lines.push(`S:${stage.id}:${morph.questor}:${morph.talkable}:${morph.despawned}:${morph.invincible}:${morph.deathFail}:${morph.name || "-"}:${morph.nameflags}:${morph.ridx}:${morph.reidx}:${morph.rmapcnt}:${morph.rcharidx}:${morph.rattr || "-"}:${morph.level}`);
  }
  for (const hostility of stage.questorActions.hostilities) {
    lines.push(`H:${stage.id}:${hostility.questor}:${hostility.unquestor}:${hostility.hostilePlayer}:${hostility.hostileMonster}:${hostility.revertHp}:${hostility.ingameHour}:${hostility.realTime}:${hostilityChangeStageValue(hostility)}:${hostility.quiet}`);
  }
  for (const action of stage.questorActions.movements) {
    lines.push(`J:${stage.id}:${action.questor}:${action.teleportQuestor.wx}:${action.teleportQuestor.wy}:${action.teleportQuestor.wz}:${action.teleportQuestor.x}:${action.teleportQuestor.y}:${action.teleportPlayers.wx}:${action.teleportPlayers.wy}:${action.teleportPlayers.wz}:${action.teleportPlayers.x}:${action.teleportPlayers.y}:${action.walkSpeed}:${action.destX}:${action.destY}:${actionChangeStageValue(action)}:${action.quiet}`);
  }
  if (stage.spawns.dungeon.enabled) {
    const dungeon = stage.spawns.dungeon;
    const loc = dungeon.location;
    lines.push(`D:${stage.id}:${dungeon.base}:${dungeon.max}:${dungeon.tower}:${dungeon.hard}:${dungeon.stores}:${dungeon.theme}:${dungeon.name || "-"}:${dungeon.staticFloors}:${dungeon.keep}:${dungeon.flags1}:${dungeon.flags2}:${dungeon.flags3}:${dungeon.finalMap || "-"}:${dungeon.finalMapX}:${dungeon.finalMapY}`);
    lines.push(`Dl:${stage.id}:${loc.loc}:${loc.terrains}:${loc.towns}:${loc.wx}:${loc.wy}:${loc.terrainPatch}:${loc.x}:${loc.y}:${loc.radius}:${loc.map || "-"}:${loc.mapX}:${loc.mapY}`);
  }
  lines.push(...stageKillGoalLines(stage));
  lines.push(...stageRetrieveGoalLines(stage));
  lines.push(...stageDeliveryGoalLines(stage));
  lines.push(...stageCompletionLines(stage));
  for (const entry of stage.text.narrations) {
    lines.push(`X:${stage.id}:${entry.flags || "-"}:${entry.text}`);
  }
  for (const entry of stage.text.statusLines) {
    lines.push(`x:${stage.id}:${entry.flags || "-"}:${entry.text}`);
  }
  for (const entry of stage.text.dialogues) {
    lines.push(`W:${entry.questor}:${stage.id}:${entry.examine}:${entry.flags || "-"}:${entry.text}`);
  }
  for (const entry of stage.text.defaultReplies) {
    lines.push(`Wr:${entry.questor}:${stage.id}:${entry.text}`);
  }
  lines.push(...stageKeywordLines(stage, stage.id));
  lines.push(...stageReplyLines(stage, stage.id));
  return lines;
}

function generatedQuest() {
  const monsterform = /^\d+$/.test(value("monsterform")) ? value("monsterform") : "0";

  const lines = [
    "V:1.0.0",
    "",
    `N:${value("quest_index")}:${value("codename")}:${value("creator")}:${value("quest_name")}:${value("repeatable")}:${value("auto_accept")}:${value("local")}`,
  ];

  if (value("accept_stages") !== "") {
    lines.push(`C:${value("accept_stages")}`);
  }

  lines.push(
    `I:${value("privileged")}:${value("individual")}:${value("min_level")}:${value("max_level")}:${value("races")}:${value("classes")}:${value("modenorm")}:${value("modeel")}:${value("modepvp")}:${value("fruitbat")}:${monsterform}:${value("questdonecreditstage")}`,
  );

  if (value("prerequisites") !== "") {
    lines.push(`E:${value("prerequisites")}`);
  }

  lines.push(
    `T:${spawnTimeValues().join(":")}`,
    ...questors.flatMap(questorLines),
    `U:${value("ending_stage")}:${value("duration")}:${value("cooldown")}`,
    ...stageKeywordLines(sharedStage, "-1"),
    ...stageReplyLines(sharedStage, "-1"),
    ...stageOrder.flatMap((stageId) => stageSetupLines(stages[stageId])),
  );

  return lines.join("\n");
}

function validateStageKeywords(stage, stageId, messages) {
  stageTextEntries(stage, "keyword").forEach((entry, index) => {
    const prefix = stageId === "-1" ? `Shared Y #${index + 1}` : `Stage ${stageId} Y #${index + 1}`;
    const questor = String(entry.questor ?? "-1");
    const flags = String(entry.flags || "-");
    const changeFlags = String(entry.changeFlags || "-");
    const keyword = String(entry.keyword ?? "");
    const nextStage = keywordNextStageValue(entry);
    if (!/^-?\d+$/.test(questor) || Number(questor) < -1 || Number(questor) > 29) {
      messages.push(["warn", `${prefix} questor must be -1 or a questor index from 0 to 29.`]);
    } else if (Number(questor) >= 0 && Number(questor) >= questors.length) {
      messages.push(["warn", `${prefix} references missing questor #${questor}.`]);
    }
    if (flags !== "-" && !/^[A-P]+$/.test(flags)) {
      messages.push(["warn", `${prefix} required flags must be '-' or uppercase A through P only.`]);
    }
    if (changeFlags !== "-" && !/^[A-Pa-p]+$/.test(changeFlags)) {
      messages.push(["warn", `${prefix} changeflags must be '-' or A-P/a-p only.`]);
    }
    if (keyword.trim() === "") {
      messages.push(["error", `${prefix} keyword must not be empty. Use '~' for TomeNET's empty/enter keyword.`]);
    }
    if (keyword.includes(":")) {
      messages.push(["error", `${prefix} keyword must not contain ':'.`]);
    }
    if (keyword.length > 29) {
      messages.push(["warn", `${prefix} keyword is longer than 29 characters and TomeNET parser truncates at that limit.`]);
    }
    if (!/^-?\d+$/.test(nextStage)) {
      messages.push(["warn", `${prefix} nextstage must be 255, an exact stage 0..49, or a negative random-forward range.`]);
    } else if (nextStage !== "255") {
      const next = Number(nextStage);
      if (next >= 0 && next > 49) {
        messages.push(["warn", `${prefix} exact nextstage must be 0..49 or 255 for no change.`]);
      }
      if (next < 0) {
        if (stageId === "-1") {
          messages.push(["warn", `${prefix} random-forward nextstage is not safe on shared stage -1; use an exact stage or 255.`]);
        } else if (Number(stageId) + Math.abs(next) > 49) {
          messages.push(["warn", `${prefix} random-forward range must not exceed stage 49.`]);
        }
      }
    }
    const extraQuestors = Array.isArray(entry.extraQuestors) ? entry.extraQuestors : [];
    if (questor === "-1" && extraQuestors.length) {
      messages.push(["warn", `${prefix} has YQ entries, but primary questor -1 already matches all questors.`]);
    }
    for (const extraQuestor of extraQuestors) {
      if (!/^\d+$/.test(String(extraQuestor)) || Number(extraQuestor) > 29) {
        messages.push(["warn", `${prefix} YQ questor "${extraQuestor}" must be 0..29.`]);
      } else if (Number(extraQuestor) >= questors.length) {
        messages.push(["warn", `${prefix} YQ references missing questor #${extraQuestor}.`]);
      }
    }
    const extraStages = Array.isArray(entry.extraStages) ? entry.extraStages : [];
    if (stageId === "-1" && extraStages.length) {
      messages.push(["warn", `${prefix} has YS entries, but stage -1 already matches all stages.`]);
    }
    for (const extraStage of extraStages) {
      if (!/^\d+$/.test(String(extraStage)) || Number(extraStage) > 49) {
        messages.push(["warn", `${prefix} YS stage "${extraStage}" must be 0..49.`]);
      }
    }
  });
}

function validateStageReplies(stage, stageId, messages) {
  const knownKeywords = new Set(keywordReplyOptions().map(([valueOption]) => valueOption));
  stageTextEntries(stage, "reply").forEach((entry, index) => {
    const prefix = stageId === "-1" ? `Shared y #${index + 1}` : `Stage ${stageId} y #${index + 1}`;
    const questor = String(entry.questor ?? "-1");
    const flags = String(entry.flags || "-");
    const keyword = String(entry.keyword ?? "");
    if (!/^-?\d+$/.test(questor) || Number(questor) < -1 || Number(questor) > 29) {
      messages.push(["warn", `${prefix} questor must be -1 or a questor index from 0 to 29.`]);
    } else if (Number(questor) >= 0 && Number(questor) >= questors.length) {
      messages.push(["warn", `${prefix} references missing questor #${questor}.`]);
    }
    if (flags !== "-" && !/^[A-P]+$/.test(flags)) {
      messages.push(["warn", `${prefix} flags must be '-' or uppercase A through P only.`]);
    }
    if (keyword.trim() === "") {
      messages.push(["error", `${prefix} keyword must not be empty. TomeNET lowercase y lines must reference a named Y keyword.`]);
    } else if (!knownKeywords.has(keyword)) {
      messages.push(["warn", `${prefix} keyword "${keyword}" is not defined by a Y line.`]);
    }
    if (keyword.includes(":")) {
      messages.push(["error", `${prefix} keyword must not contain ':'.`]);
    }
    if (keyword.length > 29) {
      messages.push(["warn", `${prefix} keyword is longer than 29 characters and TomeNET parser truncates at that limit.`]);
    }
    const extraKeywords = Array.isArray(entry.extraKeywords) ? entry.extraKeywords : [];
    if (extraKeywords.length > 4) {
      messages.push(["warn", `${prefix} has ${extraKeywords.length + 1} total keywords; TomeNET allows 5 per reply group.`]);
    }
    for (const extraKeyword of extraKeywords) {
      if (String(extraKeyword).trim() === "") {
        messages.push(["error", `${prefix} yY keyword must not be empty.`]);
      } else if (!knownKeywords.has(String(extraKeyword))) {
        messages.push(["warn", `${prefix} yY keyword "${extraKeyword}" is not defined by a Y line.`]);
      }
      if (String(extraKeyword).includes(":")) {
        messages.push(["error", `${prefix} yY keyword must not contain ':'.`]);
      }
      if (String(extraKeyword).length > 29) {
        messages.push(["warn", `${prefix} yY keyword "${extraKeyword}" is longer than 29 characters.`]);
      }
    }
    const extraQuestors = Array.isArray(entry.extraQuestors) ? entry.extraQuestors : [];
    if (questor === "-1" && extraQuestors.length) {
      messages.push(["warn", `${prefix} has yQ entries, but primary questor -1 already matches all questors.`]);
    }
    for (const extraQuestor of extraQuestors) {
      if (!/^\d+$/.test(String(extraQuestor)) || Number(extraQuestor) > 29) {
        messages.push(["warn", `${prefix} yQ questor "${extraQuestor}" must be 0..29.`]);
      } else if (Number(extraQuestor) >= questors.length) {
        messages.push(["warn", `${prefix} yQ references missing questor #${extraQuestor}.`]);
      }
    }
    const extraStages = Array.isArray(entry.extraStages) ? entry.extraStages : [];
    if (stageId === "-1" && extraStages.length) {
      messages.push(["warn", `${prefix} has yS entries, but stage -1 already matches all stages.`]);
    }
    for (const extraStage of extraStages) {
      if (!/^\d+$/.test(String(extraStage)) || Number(extraStage) > 49) {
        messages.push(["warn", `${prefix} yS stage "${extraStage}" must be 0..49.`]);
      }
    }
    if (!Array.isArray(entry.replies) || entry.replies.length === 0) {
      messages.push(["warn", `${prefix} has no yR reply lines.`]);
    } else if (entry.replies.length > 15) {
      messages.push(["warn", `${prefix} has ${entry.replies.length} yR lines; TomeNET allows up to 15.`]);
    }
    (entry.replies || []).forEach((reply, replyIndex) => {
      const replyPrefix = `${prefix} yR #${replyIndex + 1}`;
      const replyFlags = String(reply.flags || "-");
      const text = String(reply.text || "");
      if (replyFlags !== "-" && !/^[A-P]+$/.test(replyFlags)) {
        messages.push(["warn", `${replyPrefix} flags must be '-' or uppercase A through P only.`]);
      }
      if (text.trim() === "") {
        messages.push(["error", `${replyPrefix} text must not be empty.`]);
      }
      if (text.includes(":")) {
        messages.push(["error", `${replyPrefix} text must not contain ':'.`]);
      }
      if (text.length > 79) {
        messages.push(["warn", `${replyPrefix} text is longer than 79 characters and TomeNET parser truncates at that limit.`]);
      }
    });
  });
}

function validateGoalChangeFlags(prefix, changeFlags, messages) {
  const flags = String(changeFlags || "-");
  if (flags === "-") {
    return;
  }
  if (!/^[A-Pa-p]+$/.test(flags)) {
    messages.push(["warn", `${prefix} Z changeflags must be '-' or A-P/a-p only.`]);
    return;
  }
  const setFlags = new Set(flags.replace(/[^A-P]/g, "").split(""));
  for (const lower of flags.replace(/[^a-p]/g, "")) {
    const upper = lower.toUpperCase();
    if (setFlags.has(upper)) {
      messages.push(["warn", `${prefix} Z changeflags both sets and clears flag ${upper}.`]);
    }
  }
}

function validateKillGoals(stage, messages) {
  if (stage.goals.length > 5) {
    messages.push(["warn", `Stage ${stage.id} has ${stage.goals.length} kill goals; TomeNET allows up to 5 goals per stage.`]);
  }
  const seenGoals = new Set();
  stage.goals.forEach((goal, index) => {
    const prefix = `Stage ${stage.id} k #${index + 1}`;
    const goalNumber = String(goal.goal || "");
    if (!/^\d+$/.test(goalNumber) || Number(goalNumber) < 1 || Number(goalNumber) > 5) {
      messages.push(["error", `${prefix} goal number must be 1..5. Use Optional to generate a negative q_info goal number.`]);
    }
    const signedGoal = killGoalQInfoNumber(goal);
    if (seenGoals.has(signedGoal)) {
      messages.push(["warn", `${prefix} duplicates goal ${signedGoal}; later k sublines may overwrite the same engine goal.`]);
    }
    seenGoals.add(signedGoal);
    validateGoalChangeFlags(prefix, goal.changeFlags, messages);
    for (const [label, raw, minimum, maximum] of [
      ["min level", goal.minlev, 0, 255],
      ["max level", goal.maxlev, 0, 255],
      ["kill count", goal.number, 1, null],
    ]) {
      if (!/^-?\d+$/.test(String(raw)) ||
          Number(raw) < minimum ||
          (maximum !== null && Number(raw) > maximum)) {
        messages.push(["warn", `${prefix} ${label} must be an integer of ${minimum} or greater${maximum !== null ? ` and no more than ${maximum}` : ""}.`]);
      }
    }
    if (/^\d+$/.test(String(goal.minlev)) &&
        /^\d+$/.test(String(goal.maxlev)) &&
        Number(goal.minlev) > 0 &&
        Number(goal.maxlev) > 0 &&
        Number(goal.maxlev) < Number(goal.minlev)) {
      messages.push(["warn", `${prefix} max level is below min level.`]);
    }
    if (goal.ridx.length > 10) {
      messages.push(["warn", `${prefix} has ${goal.ridx.length} kI monster IDs; TomeNET accepts up to 10.`]);
    }
    goal.ridx.forEach((ridx, ridxIndex) => {
      if (!/^-?\d+$/.test(String(ridx))) {
        messages.push(["warn", `${prefix} kI #${ridxIndex + 1} must be an integer monster ID, or -1 for any.`]);
      } else if (String(ridx) !== "-1" && !lookups.monsters?.byId.has(String(ridx))) {
        messages.push(["warn", `${prefix} kI #${ridxIndex + 1} monster ID ${ridx} is not matched to monsters.`]);
      }
    });
    if (goal.reidx.length > 10) {
      messages.push(["warn", `${prefix} has ${goal.reidx.length} kE monster ego IDs; TomeNET accepts up to 10.`]);
    }
    goal.reidx.forEach((reidx, reidxIndex) => {
      if (!/^-?\d+$/.test(String(reidx))) {
        messages.push(["warn", `${prefix} kE #${reidxIndex + 1} must be an integer monster ego ID, or -1 for any.`]);
      } else if (String(reidx) !== "-1" && !lookups.monsterEgos?.byId.has(String(reidx))) {
        messages.push(["warn", `${prefix} kE #${reidxIndex + 1} monster ego ID ${reidx} is not matched to monster egos.`]);
      }
    });
    if (goal.visuals.length > 5) {
      messages.push(["warn", `${prefix} has ${goal.visuals.length} kV visual filters; TomeNET accepts up to 5.`]);
    }
    goal.visuals.forEach((visual, visualIndex) => {
      if (String(visual.char).length !== 1 || String(visual.char).includes(":")) {
        messages.push(["warn", `${prefix} kV #${visualIndex + 1} char must be exactly one non-colon character, or '-' for any.`]);
      }
      if (String(visual.attr) !== "-" && !visualAttrOptions.some(([attr]) => attr === String(visual.attr))) {
        messages.push(["warn", `${prefix} kV #${visualIndex + 1} attr "${visual.attr}" is not a known TomeNET color character.`]);
      }
    });
    if (goal.names.length > 5) {
      messages.push(["warn", `${prefix} has ${goal.names.length} kN partial names; TomeNET accepts up to 5.`]);
    }
    goal.names.forEach((name, nameIndex) => {
      const text = String(name || "");
      if (text.trim() === "") {
        messages.push(["warn", `${prefix} kN #${nameIndex + 1} is empty and will not be generated.`]);
      }
      if (text.includes(":")) {
        messages.push(["error", `${prefix} kN #${nameIndex + 1} must not contain ':'.`]);
      }
      if (text.length > 29) {
        messages.push(["warn", `${prefix} kN #${nameIndex + 1} is longer than 29 characters and TomeNET parser truncates at that limit.`]);
      }
    });
    if (goal.ridx.length === 0 && goal.reidx.length === 0 && goal.visuals.length === 0 && goal.names.filter((name) => String(name).trim() !== "").length === 0) {
      messages.push(["warn", `${prefix} has no monster ID, ego, visual, or name criteria; it may match very broadly by level only.`]);
    }
  });
}

function validateRetrieveGoals(stage, messages) {
  if (stage.retrieveGoals.length > 5) {
    messages.push(["warn", `Stage ${stage.id} has ${stage.retrieveGoals.length} retrieve goals; TomeNET allows up to 5 goals per stage.`]);
  }
  if (stage.goals.length + stage.retrieveGoals.length > 5) {
    messages.push(["warn", `Stage ${stage.id} has ${stage.goals.length + stage.retrieveGoals.length} kill/retrieve goals. TomeNET goal slots are shared as 1..5.`]);
  }

  const killGoals = new Set(stage.goals.map(killGoalQInfoNumber));
  const seenGoals = new Set();
  stage.retrieveGoals.forEach((goal, index) => {
    const prefix = `Stage ${stage.id} r #${index + 1}`;
    const goalNumber = String(goal.goal || "");
    if (!/^\d+$/.test(goalNumber) || Number(goalNumber) < 1 || Number(goalNumber) > 5) {
      messages.push(["error", `${prefix} goal number must be 1..5. Use Optional to generate a negative q_info goal number.`]);
    }
    const signedGoal = retrieveGoalQInfoNumber(goal);
    if (seenGoals.has(signedGoal)) {
      messages.push(["warn", `${prefix} duplicates retrieve goal ${signedGoal}; later r sublines may overwrite the same engine goal.`]);
    }
    if (killGoals.has(signedGoal)) {
      messages.push(["warn", `${prefix} uses goal ${signedGoal}, which is also used by a kill goal. TomeNET stores kill/retrieve/deliver in the same goal slot.`]);
    }
    seenGoals.add(signedGoal);
    validateGoalChangeFlags(prefix, goal.changeFlags, messages);

    for (const [label, raw, minimum] of [
      ["minimum value", goal.minValue, 0],
      ["item count", goal.number, 1],
    ]) {
      if (!/^-?\d+$/.test(String(raw)) || Number(raw) < minimum) {
        messages.push(["warn", `${prefix} ${label} must be an integer of ${minimum} or greater.`]);
      }
    }

    if (goal.items.length > 10) {
      messages.push(["warn", `${prefix} has ${goal.items.length} rI item pairs; TomeNET accepts up to 10.`]);
    }
    goal.items.forEach((itemId, itemIndex) => {
      const parts = String(itemId || "").split(":");
      if (parts.length !== 2 || !/^-?\d+$/.test(parts[0]) || !/^-?\d+$/.test(parts[1])) {
        messages.push(["warn", `${prefix} rI #${itemIndex + 1} must be a tval:sval integer pair, or -1:-1 for any item.`]);
      } else if (itemId !== "-1:-1" && !lookups.items?.byId.has(String(itemId))) {
        messages.push(["warn", `${prefix} rI #${itemIndex + 1} item ${itemId} is not matched to items.`]);
      }
    });

    if (goal.values.length > 5) {
      messages.push(["warn", `${prefix} has ${goal.values.length} rV value filters; TomeNET accepts up to 5.`]);
    }
    goal.values.forEach((value, valueIndex) => {
      for (const [label, raw] of [["pval", value.pval], ["bpval", value.bpval], ["name1", value.name1], ["name2", value.name2], ["name2b", value.name2b]]) {
        if (!/^-?\d+$/.test(String(raw))) {
          messages.push(["warn", `${prefix} rV #${valueIndex + 1} ${label} must be an integer.`]);
        }
      }
      if (String(value.attr) !== "-" && !visualAttrOptions.some(([attr]) => attr === String(value.attr))) {
        messages.push(["warn", `${prefix} rV #${valueIndex + 1} attr "${value.attr}" is not a known TomeNET color character.`]);
      }
      if (!["-1", "-2", "-3"].includes(String(value.name1)) && /^-?\d+$/.test(String(value.name1)) && !lookups.artifacts?.byId.has(String(value.name1))) {
        messages.push(["warn", `${prefix} rV #${valueIndex + 1} artifact name1 ${value.name1} is not matched to artifacts.`]);
      }
      for (const [label, raw] of [["name2", value.name2], ["name2b", value.name2b]]) {
        if (!["-1", "-2", "-3"].includes(String(raw)) && /^-?\d+$/.test(String(raw)) && !lookups.egoItems?.byId.has(String(raw))) {
          messages.push(["warn", `${prefix} rV #${valueIndex + 1} ego ${label} ${raw} is not matched to ego items.`]);
        }
      }
    });

    if (goal.names.length > 5) {
      messages.push(["warn", `${prefix} has ${goal.names.length} rN partial names; TomeNET accepts up to 5.`]);
    }
    goal.names.forEach((name, nameIndex) => {
      const text = String(name || "");
      if (text.trim() === "") {
        messages.push(["warn", `${prefix} rN #${nameIndex + 1} is empty and will not be generated.`]);
      }
      if (text.includes(":")) {
        messages.push(["error", `${prefix} rN #${nameIndex + 1} must not contain ':'.`]);
      }
      if (text.length > 29) {
        messages.push(["warn", `${prefix} rN #${nameIndex + 1} is longer than 29 characters and TomeNET parser truncates at that limit.`]);
      }
    });

    if (goal.items.length === 0 && goal.values.length === 0 && goal.names.filter((name) => String(name).trim() !== "").length === 0) {
      messages.push(["warn", `${prefix} has no item, value, or name criteria; it may match very broadly by value only.`]);
    }
  });
}

function validateGoalTarget(stage, prefix, target, messages) {
  if (!target?.enabled) {
    return;
  }
  for (const [label, raw, minimum] of [
    ["World X", target.wx, null],
    ["World Y", target.wy, null],
    ["World Z", target.wz, null],
    ["Grid X", target.x, null],
    ["Grid Y", target.y, null],
    ["radius", target.radius, 0],
    ["map offset X", target.mapX, null],
    ["map offset Y", target.mapY, null],
  ]) {
    if (!/^-?\d+$/.test(String(raw)) || (minimum !== null && Number(raw) < minimum)) {
      messages.push(["warn", `${prefix} P ${label} must be an integer${minimum !== null ? ` of ${minimum} or greater` : ""}.`]);
    }
  }
  if (!["0", "1"].includes(String(target.terrainPatch))) {
    messages.push(["warn", `${prefix} P terrain patch must be 0 or 1.`]);
  }
  if (String(target.map || "-").includes(":")) {
    messages.push(["error", `${prefix} P map template name must not contain ':'.`]);
  }
  if (String(target.map || "-") !== "-" && !lookups.templates?.byId.has(String(target.map))) {
    messages.push(["warn", `${prefix} P map file "${target.map}" is not matched to templates.`]);
  }
  if (String(target.x) === "-1" && /^-?\d+$/.test(String(target.radius)) && Number(target.radius) !== 0) {
    messages.push(["warn", `${prefix} P radius is only meaningful with an exact Grid X; use radius 0 when Grid X is -1.`]);
  }
}

function validateGoalTargets(stage, messages) {
  const generatedTargets = new Set();
  for (const goal of stage.goals) {
    const signedGoal = killGoalQInfoNumber(goal);
    validateGoalTarget(stage, `Stage ${stage.id} k goal ${signedGoal}`, goal.target, messages);
    if (goal.target?.enabled) {
      if (generatedTargets.has(signedGoal)) {
        messages.push(["warn", `Stage ${stage.id} generates multiple P lines for goal ${signedGoal}; TomeNET stores one target position per goal slot.`]);
      }
      generatedTargets.add(signedGoal);
    }
  }
  for (const goal of stage.retrieveGoals) {
    const signedGoal = retrieveGoalQInfoNumber(goal);
    validateGoalTarget(stage, `Stage ${stage.id} r goal ${signedGoal}`, goal.target, messages);
    if (goal.target?.enabled) {
      if (generatedTargets.has(signedGoal)) {
        messages.push(["warn", `Stage ${stage.id} generates multiple P lines for goal ${signedGoal}; TomeNET stores one target position per goal slot.`]);
      }
      generatedTargets.add(signedGoal);
    }
  }

  const modeledGoals = new Set([
    ...stage.goals.map(killGoalQInfoNumber),
    ...stage.retrieveGoals.map(retrieveGoalQInfoNumber),
  ]);
  for (const target of stage.goalTargets || []) {
    if (!modeledGoals.has(String(target.goal))) {
      messages.push(["warn", `Stage ${stage.id} imported P line references goal ${target.goal}, but no matching k/r goal is modeled.`]);
    }
  }
}

function validateDeliveryGoals(stage, messages) {
  if (stage.deliveryGoals.length > 5) {
    messages.push(["warn", `Stage ${stage.id} has ${stage.deliveryGoals.length} M delivery goals; TomeNET goal slots are 1..5.`]);
  }
  const seenGoals = new Set();
  const krGoals = new Set([
    ...stage.goals.map(killGoalQInfoNumber),
    ...stage.retrieveGoals.map(retrieveGoalQInfoNumber),
  ]);
  stage.deliveryGoals.forEach((goal, index) => {
    const prefix = `Stage ${stage.id} M #${index + 1}`;
    const goalNumber = String(goal.goal || "");
    if (!/^\d+$/.test(goalNumber) || Number(goalNumber) < 1 || Number(goalNumber) > 5) {
      messages.push(["error", `${prefix} goal number must be 1..5. Use Optional to generate a negative q_info goal number.`]);
    }
    const signedGoal = deliveryGoalQInfoNumber(goal);
    if (seenGoals.has(signedGoal)) {
      messages.push(["warn", `${prefix} duplicates delivery goal ${signedGoal}; TomeNET stores one deliver goal per goal slot.`]);
    }
    seenGoals.add(signedGoal);
    if (krGoals.has(signedGoal)) {
      messages.push(["warn", `${prefix} shares goal ${signedGoal} with a kill/retrieve goal. TomeNET combines these in the same goal slot.`]);
    }
    validateGoalChangeFlags(prefix, goal.changeFlags, messages);
    if (String(goal.returnQuestor) !== "-1" &&
        (!/^\d+$/.test(String(goal.returnQuestor)) || Number(goal.returnQuestor) >= questors.length || Number(goal.returnQuestor) > 29)) {
      messages.push(["warn", `${prefix} return questor must be -1 or an existing questor index 0..29.`]);
    }
    for (const [label, raw, minimum] of [
      ["World X", goal.wx, null],
      ["World Y", goal.wy, null],
      ["World Z", goal.wz, null],
      ["Grid X", goal.x, null],
      ["Grid Y", goal.y, null],
      ["radius", goal.radius, 0],
      ["map offset X", goal.mapX, null],
      ["map offset Y", goal.mapY, null],
    ]) {
      if (!/^-?\d+$/.test(String(raw)) || (minimum !== null && Number(raw) < minimum)) {
        messages.push(["warn", `${prefix} ${label} must be an integer${minimum !== null ? ` of ${minimum} or greater` : ""}.`]);
      }
    }
    if (!["0", "1"].includes(String(goal.terrainPatch))) {
      messages.push(["warn", `${prefix} terrain patch must be 0 or 1.`]);
    }
    if (String(goal.map || "-").includes(":")) {
      messages.push(["error", `${prefix} map template name must not contain ':'.`]);
    }
    if (String(goal.map || "-") !== "-" && !lookups.templates?.byId.has(String(goal.map))) {
      messages.push(["warn", `${prefix} map file "${goal.map}" is not matched to templates.`]);
    }
    if (String(goal.x) === "-1" && /^-?\d+$/.test(String(goal.radius)) && Number(goal.radius) !== 0) {
      messages.push(["warn", `${prefix} radius is only meaningful with an exact Grid X; use radius 0 when Grid X is -1.`]);
    }
  });
}

function stageModeledGoalMap(stage) {
  const modeledGoals = new Map();
  for (const goal of stage.goals) {
    modeledGoals.set(killGoalQInfoNumber(goal), { optional: goal.optional, label: `k #${goal.goal}` });
  }
  for (const goal of stage.retrieveGoals) {
    const value = retrieveGoalQInfoNumber(goal);
    if (!modeledGoals.has(value)) {
      modeledGoals.set(value, { optional: goal.optional, label: `r #${goal.goal}` });
    }
  }
  for (const goal of stage.deliveryGoals) {
    const value = deliveryGoalQInfoNumber(goal);
    if (!modeledGoals.has(value)) {
      modeledGoals.set(value, { optional: goal.optional, label: `M #${goal.goal}` });
    }
  }
  return modeledGoals;
}

function validateCompletionTransitions(stage, messages) {
  if (stage.completion.transitions.length > 5) {
    messages.push(["warn", `Stage ${stage.id} has ${stage.completion.transitions.length} G transitions; TomeNET allows up to 5 follow-up routes.`]);
  }

  const modeledGoals = stageModeledGoalMap(stage);

  const seenTransitions = new Set();
  stage.completion.transitions.forEach((transition, index) => {
    const prefix = `Stage ${stage.id} G #${index + 1}`;
    const nextStage = String(transition.nextStage || "");
    if (!/^\d+$/.test(nextStage) || Number(nextStage) < 0 || Number(nextStage) > 49) {
      messages.push(["error", `${prefix} next stage must be an integer from 0 to 49.`]);
    } else if (!stageOrder.includes(nextStage)) {
      messages.push(["warn", `${prefix} references missing stage ${nextStage}.`]);
    }

    const goals = Array.isArray(transition.goals) ? transition.goals.map(String) : [];
    if (goals.length === 0) {
      messages.push(["error", `${prefix} must select at least one required goal.`]);
    }
    if (goals.length > 5) {
      messages.push(["warn", `${prefix} has ${goals.length} goals; TomeNET allows up to 5 per G line.`]);
    }

    const goalSet = new Set();
    for (const goalValue of goals) {
      if (!/^\d+$/.test(goalValue) || Number(goalValue) < 1 || Number(goalValue) > 5) {
        messages.push(["error", `${prefix} goal "${goalValue}" must be an integer from 1 to 5.`]);
        continue;
      }
      if (goalSet.has(goalValue)) {
        messages.push(["warn", `${prefix} duplicates goal ${goalValue}.`]);
      }
      goalSet.add(goalValue);
      const modeled = modeledGoals.get(goalValue);
      if (!modeled) {
        messages.push(["warn", `${prefix} references missing goal slot ${goalValue}.`]);
      } else if (modeled.optional) {
        messages.push(["warn", `${prefix} references optional goal ${goalValue}; optional goals are not allowed in G lines.`]);
      }
    }

    const transitionKey = `${nextStage}:${[...goalSet].sort((a, b) => Number(a) - Number(b)).join(":")}`;
    if (seenTransitions.has(transitionKey)) {
      messages.push(["warn", `${prefix} duplicates an existing G transition to stage ${nextStage} with the same goal set.`]);
    }
    seenTransitions.add(transitionKey);
  });
}

function validateStageRewards(stage, messages) {
  const modeledGoals = stageModeledGoalMap(stage);
  if (stage.completion.rewardConditions.length > 10) {
    messages.push(["warn", `Stage ${stage.id} has ${stage.completion.rewardConditions.length} O reward conditions; TomeNET has up to 10 reward slots.`]);
  }
  if (stage.completion.rewards.length > 10) {
    messages.push(["warn", `Stage ${stage.id} has ${stage.completion.rewards.length} R rewards; TomeNET allows up to 10 rewards per stage.`]);
  }

  const definedRewardIndexes = new Set(stage.completion.rewards.map((_, index) => String(index)));
  const conditionIndexes = new Set();
  stage.completion.rewardConditions.forEach((condition, index) => {
    const prefix = `Stage ${stage.id} O #${index + 1}`;
    const rewardIndex = String(condition.rewardIndex ?? "");
    if (!/^-?\d+$/.test(rewardIndex) || Number(rewardIndex) < -1 || Number(rewardIndex) > 9) {
      messages.push(["error", `${prefix} reward slot must be -1 or an integer from 0 to 9.`]);
    } else if (rewardIndex !== "-1" && !definedRewardIndexes.has(rewardIndex)) {
      messages.push(["warn", `${prefix} references reward slot ${rewardIndex}, but no matching R reward is defined.`]);
    }
    if (rewardIndex !== "-1" && conditionIndexes.has(rewardIndex)) {
      messages.push(["warn", `${prefix} duplicates another O condition for reward slot ${rewardIndex}. TomeNET stores one goal list per reward slot.`]);
    }
    conditionIndexes.add(rewardIndex);

    const goals = condition.free
      ? ["0"]
      : Array.isArray(condition.goals) ? condition.goals.map(String) : [];
    if (!goals.length) {
      messages.push(["error", `${prefix} must select free reward or at least one required goal.`]);
    }
    if (goals.length > 5) {
      messages.push(["warn", `${prefix} has ${goals.length} goals; TomeNET allows up to 5 reward goals.`]);
    }
    if (goals.includes("0") && goals.length > 1) {
      messages.push(["warn", `${prefix} mixes free reward goal 0 with specific goals; generated q_info will use only 0 when free reward is checked.`]);
    }
    const seenGoals = new Set();
    for (const goalValue of goals) {
      if (goalValue === "0") {
        continue;
      }
      if (!/^\d+$/.test(goalValue) || Number(goalValue) < 1 || Number(goalValue) > 5) {
        messages.push(["error", `${prefix} goal "${goalValue}" must be 0 for free or an integer from 1 to 5.`]);
        continue;
      }
      if (seenGoals.has(goalValue)) {
        messages.push(["warn", `${prefix} duplicates goal ${goalValue}.`]);
      }
      seenGoals.add(goalValue);
      if (!modeledGoals.has(goalValue)) {
        messages.push(["warn", `${prefix} references missing goal slot ${goalValue}.`]);
      }
    }
  });

  stage.completion.rewards.forEach((reward, index) => {
    const prefix = `Stage ${stage.id} R #${index}`;
    for (const [label, raw] of [
      ["tval", reward.tval],
      ["sval", reward.sval],
      ["pval", reward.pval],
      ["bpval", reward.bpval],
      ["name1", reward.name1],
      ["name2", reward.name2],
      ["name2b", reward.name2b],
      ["gold", reward.gold],
      ["exp", reward.exp],
      ["status effect", reward.statusEffect],
    ]) {
      if (!/^-?\d+$/.test(String(raw))) {
        messages.push(["error", `${prefix} ${label} must be an integer.`]);
      }
    }
    for (const [label, raw] of [["good", reward.good], ["great", reward.great], ["very great", reward.vgreat]]) {
      if (!["0", "1"].includes(String(raw))) {
        messages.push(["error", `${prefix} ${label} must be 0 or 1.`]);
      }
    }
    if (!/^\d+$/.test(String(reward.reward)) || Number(reward.reward) < 0 || Number(reward.reward) > 5) {
      messages.push(["error", `${prefix} generated reward must be an integer from 0 to 5.`]);
    }
    const itemId = `${reward.tval}:${reward.sval}`;
    if (String(reward.tval || "0") !== "0" && !lookups.items?.byId.has(itemId)) {
      messages.push(["warn", `${prefix} item ${itemId} is not matched to items.`]);
    }
    if (String(reward.name1 || "0") !== "0" && !lookups.artifacts?.byId.has(String(reward.name1))) {
      messages.push(["warn", `${prefix} artifact name1 ${reward.name1} is not matched to artifacts.`]);
    }
    if (String(reward.name2 || "0") !== "0" && !lookups.egoItems?.byId.has(String(reward.name2))) {
      messages.push(["warn", `${prefix} ego name2 ${reward.name2} is not matched to ego items.`]);
    }
    if (String(reward.name2b || "0") !== "0" && !lookups.egoItems?.byId.has(String(reward.name2b))) {
      messages.push(["warn", `${prefix} ego name2b ${reward.name2b} is not matched to ego items.`]);
    }
    if (String(reward.tval || "0") !== "0" && String(reward.reward || "0") !== "0") {
      messages.push(["warn", `${prefix} has both a specific item and generated reward; TomeNET uses the specific item first.`]);
    }
    if ((String(reward.good) !== "0" || String(reward.great) !== "0" || String(reward.vgreat) !== "0") &&
        (String(reward.pval) !== "0" || String(reward.bpval) !== "0" || String(reward.name1) !== "0" || String(reward.name2) !== "0" || String(reward.name2b) !== "0")) {
      messages.push(["warn", `${prefix} quality generation ignores manual pval, bpval, artifact, and ego values.`]);
    }
  });

  if (stage.completion.rewards.length && !stage.completion.rewardConditions.length) {
    messages.push(["warn", `Stage ${stage.id} has R rewards without O conditions; TomeNET treats stage rewards as free in that stage.`]);
  }
}

function validate() {
  const messages = [];

  const stageIds = Object.values(stages).map((stage) => stage.id);
  const uniqueStageIds = new Set(stageIds);
  if (!stages["0"]) {
    messages.push(["warn", "Stage 0 is missing. TomeNET reserves it as the initial stage."]);
  }
  if (uniqueStageIds.size !== stageIds.length) {
    messages.push(["error", "Stage identifiers must be unique."]);
  }
  for (const stageId of stageIds) {
    if (!/^\d+$/.test(stageId) || Number(stageId) < 0 || Number(stageId) > 49) {
      messages.push(["error", `Stage identifier "${stageId}" must be an integer from 0 to 49.`]);
    }
  }
  for (const stageId of legacyStageReferences()) {
    if (!stages[stageId]) {
      messages.push(["warn", `Legacy stage fields reference missing stage ${stageId}.`]);
    }
  }
  if (keywordEntryCount() > 100) {
    messages.push(["warn", `This quest has ${keywordEntryCount()} Y keyword entries; TomeNET allows up to 100.`]);
  }
  if (replyEntryCount() > 50) {
    messages.push(["warn", `This quest has ${replyEntryCount()} y keyword reply groups; TomeNET allows up to 50.`]);
  }
  validateStageKeywords(sharedStage, "-1", messages);
  validateStageReplies(sharedStage, "-1", messages);
  for (const stage of Object.values(stages)) {
    const automatic = stage.setup.automatic;
    if (stage.setup.features.length > 15) {
      messages.push(["warn", `Stage ${stage.id} has ${stage.setup.features.length} Af lines; TomeNET allows up to 15.`]);
    }
    stage.setup.features.forEach((feature, index) => {
      const prefix = `Stage ${stage.id} Af #${index + 1}`;
      if (feature.source === "questor" &&
          (!/^\d+$/.test(feature.questor) || Number(feature.questor) >= questors.length)) {
        messages.push(["warn", `${prefix} references missing questor #${feature.questor}.`]);
      }
      if (feature.source === "questItem" &&
          !stage.spawns.questItems.some((item) => item.uiId === feature.questItemRef)) {
        messages.push(["warn", `${prefix} references missing quest item #${feature.questItem}.`]);
      }
      if (!lookups.features?.byId.has(String(feature.feature))) {
        messages.push(["warn", `${prefix} feature ID ${feature.feature} is not matched to f_info.txt.`]);
      }
      for (const [label, coordinate] of [
        ["World X", feature.wx],
        ["World Y", feature.wy],
        ["World Z", feature.wz],
        ["Grid X", feature.x],
        ["Grid Y", feature.y],
      ]) {
        if (!/^-?\d+$/.test(String(coordinate))) {
          messages.push(["warn", `${prefix} ${label} must be an integer.`]);
        }
      }
    });
    if (stage.spawns.questItems.length > 5) {
      messages.push(["warn", `Stage ${stage.id} has ${stage.spawns.questItems.length} B lines; q_info documents a limit of 5.`]);
    }
    stage.spawns.questItems.forEach((item, index) => {
      const prefix = `Stage ${stage.id} B #${index}`;
      if (item.missingBl) {
        messages.push(["warn", `${prefix} was imported without Bl; generated output adds a Bl line.`]);
      }
      if (String(item.char).length !== 1 || String(item.char).includes(":")) {
        messages.push(["warn", `${prefix} display character must be exactly one non-colon character.`]);
      }
      if (!visualAttrOptions.some(([attr]) => attr === item.attr)) {
        messages.push(["warn", `${prefix} visual attr "${item.attr}" is not a known TomeNET color character.`]);
      }
      if (String(item.name).includes(":")) {
        messages.push(["error", `${prefix} name must not contain ':'.`]);
      }
      if (String(item.name).trim() === "") {
        messages.push(["error", `${prefix} name must not be empty.`]);
      }
      for (const [label, raw, minimum] of [
        ["pval", item.pval, -32768],
        ["weight", item.weight, 0],
        ["level", item.level, 0],
        ["World X", item.location.wx, null],
        ["World Y", item.location.wy, null],
        ["World Z", item.location.wz, null],
        ["Grid X", item.location.x, null],
        ["Grid Y", item.location.y, null],
        ["radius", item.location.radius, 0],
        ["map offset X", item.location.mapX, null],
        ["map offset Y", item.location.mapY, null],
      ]) {
        if (!/^-?\d+$/.test(String(raw)) || (minimum !== null && Number(raw) < minimum)) {
          messages.push(["warn", `${prefix} ${label} must be an integer${minimum !== null ? ` of ${minimum} or greater` : ""}.`]);
        }
      }
      if (/^-?\d+$/.test(item.pval) && Number(item.pval) > 32767) {
        messages.push(["warn", `${prefix} pval must not exceed signed 16-bit maximum 32767.`]);
      }
      if (/^\d+$/.test(item.weight) && Number(item.weight) > 32767) {
        messages.push(["warn", `${prefix} weight must not exceed signed 16-bit maximum 32767.`]);
      }
      if (/^\d+$/.test(item.level) && Number(item.level) > 255) {
        messages.push(["warn", `${prefix} level must not exceed byte maximum 255.`]);
      }
      if (item.delivery === "handout" &&
          (!/^\d+$/.test(item.questor) || Number(item.questor) >= questors.length)) {
        messages.push(["warn", `${prefix} handout references missing questor #${item.questor}.`]);
      }
      if (item.delivery === "spawn") {
        if (String(item.location.wx) === "-1" && numericMask(item.location.loc) === 0) {
          messages.push(["warn", `${prefix} world spawn needs an exact world position or a surface/town location type.`]);
        }
        const unsupportedLocation = unknownMaskForOptions(numericMask(item.location.loc), locationTypeOptions.filter((option) => option.value !== 4));
        if (unsupportedLocation > 0 && String(item.location.wx) === "-1") {
          messages.push(["warn", `${prefix} Bl location types contain unsupported random-spawn bits: ${unsupportedLocation}.`]);
        }
        const unsupportedTowns = unknownMaskForOptions(numericMask(item.location.towns), townOptions);
        if (unsupportedTowns > 0) {
          messages.push(["warn", `${prefix} town mask contains unsupported bits: ${unsupportedTowns}.`]);
        }
        if (item.location.map !== "-" && !lookups.templates?.byId.has(item.location.map)) {
          messages.push(["warn", `${prefix} map file "${item.location.map}" is not matched to templates.`]);
        }
      }
    });
    if (stage.spawns.monsters.length > 10) {
      messages.push(["warn", `Stage ${stage.id} has ${stage.spawns.monsters.length} m lines; TomeNET allows up to 10 stage-start monster spawns.`]);
    }
    stage.spawns.monsters.forEach((spawn, index) => {
      const prefix = `Stage ${stage.id} m #${index + 1}`;
      if (spawn.missingMl) {
        messages.push(["warn", `${prefix} was imported without ml; generated output adds an ml line.`]);
      }
      if (!/^\d+$/.test(String(spawn.ridx))) {
        messages.push(["warn", `${prefix} ridx must be a non-negative integer; 0 means random by criteria.`]);
      } else if (String(spawn.ridx) !== "0" && !lookups.monsters?.byId.has(String(spawn.ridx))) {
        messages.push(["warn", `${prefix} ridx ${spawn.ridx} is not matched to monsters.`]);
      }
      if (!/^-?\d+$/.test(String(spawn.reidx))) {
        messages.push(["warn", `${prefix} re_idx must be an integer; -1 means any/random ego.`]);
      } else if (String(spawn.reidx) !== "-1" && !lookups.monsterEgos?.byId.has(String(spawn.reidx))) {
        messages.push(["warn", `${prefix} re_idx ${spawn.reidx} is not matched to monster egos.`]);
      }
      if (String(spawn.reidx) !== "-1") {
        messages.push(["warn", `${prefix} re_idx is parsed but current TomeNET spawn code does not apply monster ego selection.`]);
      }
      if (String(spawn.rchar).length !== 1 || String(spawn.rchar).includes(":")) {
        messages.push(["warn", `${prefix} visual char filter must be exactly one non-colon character, or '-' for none.`]);
      }
      if (![["-", "-"], ...visualAttrOptions].some(([attr]) => attr === spawn.rattr)) {
        messages.push(["warn", `${prefix} visual attr filter "${spawn.rattr}" is not a known TomeNET color character or '-'.`]);
      }
      if (String(spawn.name).includes(":")) {
        messages.push(["error", `${prefix} partial name must not contain ':'.`]);
      }
      if (String(spawn.name).trim() === "") {
        messages.push(["error", `${prefix} partial name must not be empty; use '-' for no name filter.`]);
      }
      for (const [label, raw, minimum, maximum] of [
        ["amount", spawn.amount, 1, 255],
        ["clones", spawn.clones, 0, 255],
        ["min level", spawn.rlevmin, 0, 255],
        ["max level", spawn.rlevmax, 0, 255],
        ["World X", spawn.location.wx, null, null],
        ["World Y", spawn.location.wy, null, null],
        ["Grid X", spawn.location.x, null, null],
        ["Grid Y", spawn.location.y, null, null],
        ["radius", spawn.location.radius, 0, null],
        ["map offset X", spawn.location.mapX, null, null],
        ["map offset Y", spawn.location.mapY, null, null],
      ]) {
        if (!/^-?\d+$/.test(String(raw)) ||
            (minimum !== null && Number(raw) < minimum) ||
            (maximum !== null && Number(raw) > maximum)) {
          messages.push(["warn", `${prefix} ${label} must be an integer${minimum !== null ? ` of ${minimum} or greater` : ""}${maximum !== null ? ` and no more than ${maximum}` : ""}.`]);
        }
      }
      if (/^\d+$/.test(String(spawn.rlevmin)) &&
          /^\d+$/.test(String(spawn.rlevmax)) &&
          Number(spawn.ridx) === 0 &&
          Number(spawn.rlevmax) <= Number(spawn.rlevmin)) {
        messages.push(["warn", `${prefix} max level should be greater than min level for random monster selection.`]);
      }
      if (String(spawn.location.wx) === "-1" && numericMask(spawn.location.loc) === 0) {
        messages.push(["warn", `${prefix} ml needs an exact world position or a surface/town location type.`]);
      }
      const unsupportedLocation = unknownMaskForOptions(numericMask(spawn.location.loc), locationTypeOptions.filter((option) => option.value !== 4));
      if (unsupportedLocation > 0 && String(spawn.location.wx) === "-1") {
        messages.push(["warn", `${prefix} ml location types contain unsupported random-spawn bits: ${unsupportedLocation}.`]);
      }
      const unsupportedTowns = unknownMaskForOptions(numericMask(spawn.location.towns), townOptions);
      if (unsupportedTowns > 0) {
        messages.push(["warn", `${prefix} town mask contains unsupported bits: ${unsupportedTowns}.`]);
      }
      if (spawn.location.map !== "-" && !lookups.templates?.byId.has(spawn.location.map)) {
        messages.push(["warn", `${prefix} map file "${spawn.location.map}" is not matched to templates.`]);
      }
      if (spawn.hostilityEnabled) {
        messages.push(["warn", `${prefix} mh is parsed by TomeNET but current spawn behavior is marked not implemented.`]);
      }
    });
    if (stage.spawns.dungeon.enabled) {
      const dungeon = stage.spawns.dungeon;
      const prefix = `Stage ${stage.id} D`;
      if (dungeon.missingDl) {
        messages.push(["warn", `${prefix} was imported without Dl; generated output adds a Dl line.`]);
      }
      for (const [label, raw, minimum, maximum] of [
        ["base depth", dungeon.base, 0, 255],
        ["max depth", dungeon.max, 0, 255],
        ["theme", dungeon.theme, 0, 255],
        ["flags1", dungeon.flags1, 0, null],
        ["flags2", dungeon.flags2, 0, null],
        ["flags3", dungeon.flags3, 0, null],
        ["final map offset X", dungeon.finalMapX, null, null],
        ["final map offset Y", dungeon.finalMapY, null, null],
        ["World X", dungeon.location.wx, null, null],
        ["World Y", dungeon.location.wy, null, null],
        ["Grid X", dungeon.location.x, null, null],
        ["Grid Y", dungeon.location.y, null, null],
        ["radius", dungeon.location.radius, 0, null],
        ["map offset X", dungeon.location.mapX, null, null],
        ["map offset Y", dungeon.location.mapY, null, null],
      ]) {
        const numeric = Number(raw);
        if (!/^-?\d+$/.test(String(raw)) ||
            (minimum !== null && numeric < minimum) ||
            (maximum !== null && numeric > maximum)) {
          messages.push(["warn", `${prefix} ${label} must be an integer${minimum !== null ? ` of ${minimum} or greater` : ""}${maximum !== null ? ` and no greater than ${maximum}` : ""}.`]);
        }
      }
      if (/^\d+$/.test(dungeon.base) && /^\d+$/.test(dungeon.max) && Number(dungeon.max) < Number(dungeon.base)) {
        messages.push(["warn", `${prefix} max depth should be greater than or equal to base depth.`]);
      }
      for (const [label, raw] of [
        ["tower", dungeon.tower],
        ["static floors", dungeon.staticFloors],
        ["keep", dungeon.keep],
      ]) {
        if (!["0", "1"].includes(String(raw))) {
          messages.push(["warn", `${prefix} ${label} must be 0 or 1.`]);
        }
      }
      if (!["0", "1", "2"].includes(String(dungeon.hard))) {
        messages.push(["warn", `${prefix} hard mode must be 0, 1, or 2.`]);
      }
      if (!["0", "1", "2"].includes(String(dungeon.stores))) {
        messages.push(["warn", `${prefix} stores must be 0, 1, or 2.`]);
      }
      for (const [label, raw, options] of [
        ["flags1", dungeon.flags1, dungeonFlag1Options],
        ["flags2", dungeon.flags2, dungeonFlag2Options],
        ["flags3", dungeon.flags3, dungeonFlag3Options],
      ]) {
        const mask = numericMask(raw);
        const unknown = unknownMaskForOptions(mask, options);
        if (unknown > 0) {
          messages.push(["warn", `${prefix} ${label} contains unknown bits: ${unknown}. They are preserved in generated output.`]);
        }
      }
      if (String(dungeon.name).includes(":")) {
        messages.push(["error", `${prefix} name must not contain ':'.`]);
      }
      if (String(dungeon.finalMap).includes(":") || String(dungeon.location.map).includes(":")) {
        messages.push(["error", `${prefix} map template names must not contain ':'.`]);
      }
      if (String(dungeon.finalMap || "-") !== "-" && !lookups.templates?.byId.has(String(dungeon.finalMap))) {
        messages.push(["warn", `${prefix} final floor map "${dungeon.finalMap}" is not matched to templates.`]);
      }
      if (String(dungeon.location.wx) === "-1" && numericMask(dungeon.location.loc) === 0) {
        messages.push(["warn", `${prefix} entrance needs an exact world position or a surface/town location type.`]);
      }
      const unsupportedLocation = unknownMaskForOptions(numericMask(dungeon.location.loc), locationTypeOptions.filter((option) => option.value !== 4));
      if (unsupportedLocation > 0 && String(dungeon.location.wx) === "-1") {
        messages.push(["warn", `${prefix} Dl location types contain unsupported random-spawn bits: ${unsupportedLocation}.`]);
      }
      const unsupportedTowns = unknownMaskForOptions(numericMask(dungeon.location.towns), townOptions);
      if (unsupportedTowns > 0) {
        messages.push(["warn", `${prefix} town mask contains unsupported bits: ${unsupportedTowns}.`]);
      }
      if (String(dungeon.location.map || "-") !== "-" && !lookups.templates?.byId.has(String(dungeon.location.map))) {
        messages.push(["warn", `${prefix} entrance map file "${dungeon.location.map}" is not matched to templates.`]);
      }
    }
    for (const [kind, entries, lineName] of [
      ["narration", stage.text.narrations, "X"],
      ["quest log", stage.text.statusLines, "x"],
    ]) {
      if (entries.length > 15) {
        messages.push(["warn", `Stage ${stage.id} has ${entries.length} ${lineName} lines; TomeNET allows up to 15.`]);
      }
      entries.forEach((entry, index) => {
        const prefix = `Stage ${stage.id} ${lineName} #${index + 1}`;
        const flags = String(entry.flags || "-");
        const text = String(entry.text || "");
        if (flags !== "-" && !/^[A-P]+$/.test(flags)) {
          messages.push(["warn", `${prefix} flags must be '-' or uppercase A through P only.`]);
        }
        if (text.trim() === "") {
          messages.push(["error", `${prefix} ${kind} text must not be empty.`]);
        }
        if (text.includes(":")) {
          messages.push(["error", `${prefix} ${kind} text must not contain ':'.`]);
        }
        if (text.length > 79) {
          messages.push(["warn", `${prefix} ${kind} text is longer than 79 characters and TomeNET parser truncates at that limit.`]);
        }
      });
    }
    const dialogueCounts = new Map();
    stage.text.dialogues.forEach((entry, index) => {
      const prefix = `Stage ${stage.id} W #${index + 1}`;
      const key = String(entry.questor);
      dialogueCounts.set(key, (dialogueCounts.get(key) || 0) + 1);
      const flags = String(entry.flags || "-");
      const text = String(entry.text || "");
      if (!/^\d+$/.test(String(entry.questor)) || Number(entry.questor) >= questors.length || Number(entry.questor) > 29) {
        messages.push(["warn", `${prefix} references missing questor #${entry.questor}.`]);
      }
      if (!["0", "1"].includes(String(entry.examine))) {
        messages.push(["warn", `${prefix} examine mode should be 0 or 1. Negative dialogue-clone mode is not generated by this editor.`]);
      }
      if (flags !== "-" && !/^[A-P]+$/.test(flags)) {
        messages.push(["warn", `${prefix} flags must be '-' or uppercase A through P only.`]);
      }
      if (text.trim() === "") {
        messages.push(["error", `${prefix} dialogue text must not be empty.`]);
      }
      if (text.includes(":")) {
        messages.push(["error", `${prefix} dialogue text must not contain ':'.`]);
      }
      if (text.length > 79) {
        messages.push(["warn", `${prefix} dialogue text is longer than 79 characters and TomeNET parser truncates at that limit.`]);
      }
    });
    for (const [questor, count] of dialogueCounts) {
      if (count > 15) {
        messages.push(["warn", `Stage ${stage.id} questor #${questor} has ${count} W lines; TomeNET allows up to 15 talk lines per questor/stage.`]);
      }
    }
    const defaultReplyQuestors = new Set();
    stage.text.defaultReplies.forEach((entry, index) => {
      const prefix = `Stage ${stage.id} Wr #${index + 1}`;
      const questor = String(entry.questor);
      const text = String(entry.text || "");
      if (defaultReplyQuestors.has(questor)) {
        messages.push(["warn", `${prefix} duplicates questor #${questor}; TomeNET stores one default reply per questor/stage and later lines overwrite earlier ones.`]);
      }
      defaultReplyQuestors.add(questor);
      if (!/^\d+$/.test(questor) || Number(questor) >= questors.length || Number(questor) > 29) {
        messages.push(["warn", `${prefix} references missing questor #${entry.questor}.`]);
      }
      if (text.trim() === "") {
        messages.push(["error", `${prefix} default reply text must not be empty.`]);
      }
      if (text.includes(":")) {
        messages.push(["error", `${prefix} default reply text must not contain ':'.`]);
      }
      if (text.length > 79) {
        messages.push(["warn", `${prefix} default reply text is longer than 79 characters and TomeNET parser truncates at that limit.`]);
      }
    });
    validateStageKeywords(stage, stage.id, messages);
    validateStageReplies(stage, stage.id, messages);
    validateKillGoals(stage, messages);
    validateRetrieveGoals(stage, messages);
    validateGoalTargets(stage, messages);
    validateDeliveryGoals(stage, messages);
    validateCompletionTransitions(stage, messages);
    validateStageRewards(stage, messages);
    const morphQuestors = new Set();
    stage.questorActions.morphs.forEach((morph, index) => {
      const prefix = `Stage ${stage.id} S #${index + 1}`;
      if (morphQuestors.has(String(morph.questor))) {
        messages.push(["warn", `${prefix} duplicates questor #${morph.questor}; only one S line per stage+questor is modeled safely.`]);
      }
      morphQuestors.add(String(morph.questor));
      if (!/^\d+$/.test(String(morph.questor)) || Number(morph.questor) >= questors.length) {
        messages.push(["warn", `${prefix} target questor #${morph.questor} is missing.`]);
      }
      for (const [label, raw] of [["talkable", morph.talkable], ["despawned", morph.despawned], ["invincible", morph.invincible]]) {
        if (!["0", "1"].includes(String(raw))) {
          messages.push(["warn", `${prefix} ${label} must be 0 or 1.`]);
        }
      }
      if (!/^-?\d+$/.test(String(morph.deathFail)) ||
          !["-1", "255"].includes(String(morph.deathFail)) &&
          (Number(morph.deathFail) < 0 || Number(morph.deathFail) > 49)) {
        messages.push(["warn", `${prefix} death_fail must be -1, 255, or a stage from 0 to 49.`]);
      }
      if (String(morph.name).includes(":")) {
        messages.push(["error", `${prefix} name must not contain ':'.`]);
      }
      if (String(morph.name).trim() === "") {
        messages.push(["error", `${prefix} name must be '-' or a nonempty name.`]);
      }
      if (String(morph.nameflags) !== "255") {
        if (!/^\d+$/.test(String(morph.nameflags))) {
          messages.push(["warn", `${prefix} nameflags must be 255 or a non-negative decimal bitmask.`]);
        } else {
          const mask = numericMask(morph.nameflags);
          if ((mask & 1) && (mask & 2)) {
            messages.push(["warn", `${prefix} nameflags has both male and female bits.`]);
          }
          if (mask & ~knownNameflagsMask) {
            messages.push(["warn", `${prefix} nameflags contains unknown bits: ${mask & ~knownNameflagsMask}.`]);
          }
        }
      }
      if (String(morph.ridx) !== "0" && !lookups.monsters?.byId.has(String(morph.ridx))) {
        messages.push(["warn", `${prefix} monster ridx ${morph.ridx} is not matched to monsters.`]);
      }
      if (String(morph.reidx) !== "-1" && !lookups.monsterEgos?.byId.has(String(morph.reidx))) {
        messages.push(["warn", `${prefix} monster ego reidx ${morph.reidx} is not matched to monster egos.`]);
      }
      if (String(morph.rcharidx) !== "-1" && !lookups.monsters?.byId.has(String(morph.rcharidx))) {
        messages.push(["warn", `${prefix} visual monster ${morph.rcharidx} is not matched to monsters.`]);
      }
      if (!/^-?\d+$/.test(String(morph.rmapcnt)) || Number(morph.rmapcnt) < 0) {
        messages.push(["warn", `${prefix} map counter must be an integer of 0 or greater.`]);
      }
      if (String(morph.rattr) !== "-" && !visualAttrOptions.some(([attr]) => attr === String(morph.rattr))) {
        messages.push(["warn", `${prefix} visual attr "${morph.rattr}" is not a known TomeNET color character.`]);
      }
      if (!/^-?\d+$/.test(String(morph.level)) || Number(morph.level) < 0 || Number(morph.level) > 255) {
        messages.push(["warn", `${prefix} level must be 0..255. 0 keeps current level.`]);
      }
    });
    const hostilityQuestors = new Set();
    stage.questorActions.hostilities.forEach((hostility, index) => {
      const prefix = `Stage ${stage.id} H #${index + 1}`;
      if (hostilityQuestors.has(String(hostility.questor))) {
        messages.push(["warn", `${prefix} duplicates questor #${hostility.questor}; TomeNET stores one hostility entry per questor.`]);
      }
      hostilityQuestors.add(String(hostility.questor));
      if (!/^\d+$/.test(String(hostility.questor)) || Number(hostility.questor) >= questors.length) {
        messages.push(["warn", `${prefix} target questor #${hostility.questor} is missing.`]);
      }
      for (const [label, raw] of [
        ["unquestor", hostility.unquestor],
        ["hostile_player", hostility.hostilePlayer],
        ["hostile_monster", hostility.hostileMonster],
        ["quiet", hostility.quiet],
      ]) {
        if (!["0", "1"].includes(String(raw))) {
          messages.push(["warn", `${prefix} ${label} must be 0 or 1.`]);
        }
      }
      if (!/^-?\d+$/.test(String(hostility.revertHp))) {
        messages.push(["warn", `${prefix} revert HP must be an integer.`]);
      }
      if (!/^-?\d+$/.test(String(hostility.ingameHour)) ||
          (Number(hostility.ingameHour) !== -1 && (Number(hostility.ingameHour) < 0 || Number(hostility.ingameHour) > 23))) {
        messages.push(["warn", `${prefix} in-game revert hour must be -1 or 0..23.`]);
      }
      if (!/^\d+$/.test(String(hostility.realTime))) {
        messages.push(["warn", `${prefix} real-time revert minutes must be an integer of 0 or greater.`]);
      }
      if (String(hostility.ingameHour) !== "-1" && String(hostility.realTime) !== "0") {
        messages.push(["warn", `${prefix} has both revert timers enabled; TomeNET real-time setup overwrites the countdown after in-game setup.`]);
      }
      if (hostility.changeMode === "exact" &&
          (!/^-?\d+$/.test(hostility.changeStage) || Number(hostility.changeStage) < 0 || Number(hostility.changeStage) > 49)) {
        messages.push(["warn", `${prefix} exact target stage must be an integer from 0 to 49.`]);
      }
      if (hostility.changeMode === "random" &&
          (!/^\d+$/.test(hostility.randomSteps) || Number(hostility.randomSteps) < 1 || Number(stage.id) + Number(hostility.randomSteps) > 49)) {
        messages.push(["warn", `${prefix} random-forward range must be at least 1 and must not exceed stage 49.`]);
      }
    });
    const actionQuestors = new Set();
    stage.questorActions.movements.forEach((action, index) => {
      const prefix = `Stage ${stage.id} J #${index + 1}`;
      if (actionQuestors.has(String(action.questor))) {
        messages.push(["warn", `${prefix} duplicates questor #${action.questor}; TomeNET stores one movement/action entry per questor.`]);
      }
      actionQuestors.add(String(action.questor));
      if (!/^\d+$/.test(String(action.questor)) || Number(action.questor) >= questors.length) {
        messages.push(["warn", `${prefix} target questor #${action.questor} is missing.`]);
      }
      for (const [label, raw] of [
        ["questor world X", action.teleportQuestor.wx],
        ["questor world Y", action.teleportQuestor.wy],
        ["questor world Z", action.teleportQuestor.wz],
        ["questor grid X", action.teleportQuestor.x],
        ["questor grid Y", action.teleportQuestor.y],
        ["player world X", action.teleportPlayers.wx],
        ["player world Y", action.teleportPlayers.wy],
        ["player world Z", action.teleportPlayers.wz],
        ["player grid X", action.teleportPlayers.x],
        ["player grid Y", action.teleportPlayers.y],
        ["destination X", action.destX],
        ["destination Y", action.destY],
      ]) {
        if (!/^-?\d+$/.test(String(raw))) {
          messages.push(["warn", `${prefix} ${label} must be an integer.`]);
        }
      }
      if (!/^\d+$/.test(String(action.walkSpeed))) {
        messages.push(["warn", `${prefix} walk speed must be an integer of 0 or greater.`]);
      }
      if (!["0", "1"].includes(String(action.quiet))) {
        messages.push(["warn", `${prefix} quiet change must be 0 or 1.`]);
      }
      if (action.changeMode === "exact" &&
          (!/^-?\d+$/.test(action.changeStage) || Number(action.changeStage) < 0 || Number(action.changeStage) > 49)) {
        messages.push(["warn", `${prefix} exact target stage must be an integer from 0 to 49.`]);
      }
      if (action.changeMode === "random" &&
          (!/^\d+$/.test(action.randomSteps) || Number(action.randomSteps) < 1 || Number(stage.id) + Number(action.randomSteps) > 49)) {
        messages.push(["warn", `${prefix} random-forward range must be at least 1 and must not exceed stage 49.`]);
      }
      if (action.changeMode !== "disabled" && String(action.walkSpeed) === "0") {
        messages.push(["warn", `${prefix} stage change is enabled, but J stage changes happen when a walking questor arrives; set walk speed or use an A line for immediate changes.`]);
      }
      for (const [label, position] of [
        ["questor teleport", action.teleportQuestor],
        ["player teleport", action.teleportPlayers],
      ]) {
        const worldEnabled = String(position.wx) !== "-1";
        const gridEnabled = String(position.x) !== "-1";
        if (worldEnabled && (String(position.wy) === "-1" || String(position.wz) === "-1")) {
          messages.push(["warn", `${prefix} ${label} has world X enabled but world Y/Z still disabled.`]);
        }
        if (gridEnabled && String(position.y) === "-1") {
          messages.push(["warn", `${prefix} ${label} has grid X enabled but grid Y still disabled.`]);
        }
      }
    });
    for (const rawLine of stage.rawLines) {
      if (rawLine.startsWith("Bl:")) {
        messages.push(["warn", `Stage ${stage.id} contains an orphan Bl line that cannot be generated safely because TomeNET would attach it to the newest B entry.`]);
      }
      if (rawLine.startsWith("S:")) {
        messages.push(["warn", `Stage ${stage.id} contains a duplicate imported S line preserved as raw text because TomeNET stores one morph per questor.`]);
      }
      if (rawLine.startsWith("H:")) {
        messages.push(["warn", `Stage ${stage.id} contains a duplicate imported H line preserved as raw text because TomeNET stores one hostility entry per questor.`]);
      }
      if (rawLine.startsWith("J:")) {
        messages.push(["warn", `Stage ${stage.id} contains a duplicate imported J line preserved as raw text because TomeNET stores one movement/action entry per questor.`]);
      }
      if (rawLine.startsWith("D:")) {
        messages.push(["warn", `Stage ${stage.id} contains a duplicate imported D line preserved as raw text because TomeNET stores one temporary dungeon per stage.`]);
      }
      if (rawLine.startsWith("Dl:")) {
        messages.push(["warn", `Stage ${stage.id} contains an orphan or duplicate imported Dl line preserved as raw text because TomeNET stores one temporary dungeon location per stage.`]);
      }
      if (rawLine.startsWith("W:")) {
        messages.push(["warn", `Stage ${stage.id} contains a malformed imported W line preserved as raw text because it cannot be modeled safely.`]);
      }
      if (rawLine.startsWith("Wr:")) {
        messages.push(["warn", `Stage ${stage.id} contains a malformed imported Wr line preserved as raw text because it cannot be modeled safely.`]);
      }
      if (rawLine.startsWith("y:") || rawLine.startsWith("yY:") || rawLine.startsWith("yQ:") || rawLine.startsWith("yS:") || rawLine.startsWith("yR:")) {
        messages.push(["warn", `Stage ${stage.id} contains a malformed or orphan imported lowercase y reply line preserved as raw text because it cannot be modeled safely.`]);
      }
      if (rawLine.startsWith("k:") || rawLine.startsWith("kN:") || rawLine.startsWith("kI:") || rawLine.startsWith("kE:") || rawLine.startsWith("kV:")) {
        messages.push(["warn", `Stage ${stage.id} contains a malformed imported k kill-goal line preserved as raw text because it cannot be modeled safely.`]);
      }
      if (rawLine.startsWith("r:") || rawLine.startsWith("rN:") || rawLine.startsWith("rI:") || rawLine.startsWith("rV:")) {
        messages.push(["warn", `Stage ${stage.id} contains a malformed imported r retrieve-goal line preserved as raw text because it cannot be modeled safely.`]);
      }
      if (rawLine.startsWith("P:")) {
        messages.push(["warn", `Stage ${stage.id} contains a malformed imported P target-location line preserved as raw text because it cannot be modeled safely.`]);
      }
      if (rawLine.startsWith("M:")) {
        messages.push(["warn", `Stage ${stage.id} contains a malformed imported M delivery-goal line preserved as raw text because it cannot be modeled safely.`]);
      }
      if (rawLine.startsWith("G:")) {
        messages.push(["warn", `Stage ${stage.id} contains a malformed imported G stage-transition line preserved as raw text because it cannot be modeled safely.`]);
      }
      if (rawLine.startsWith("O:")) {
        messages.push(["warn", `Stage ${stage.id} contains a malformed imported O reward-condition line preserved as raw text because it cannot be modeled safely.`]);
      }
      if (rawLine.startsWith("R:")) {
        messages.push(["warn", `Stage ${stage.id} contains a malformed imported R reward-definition line preserved as raw text because it cannot be modeled safely.`]);
      }
      if (rawLine.startsWith("Z:")) {
        messages.push(["warn", `Stage ${stage.id} contains a malformed or orphan imported Z goal-flag line preserved as raw text because it cannot be attached to a modeled goal.`]);
      }
    }
    if (!automatic.enabled) {
      continue;
    }
    const prefix = `Stage ${stage.id} A`;
    const knownQuestIndexes = new Set(questRows().map((quest) => quest.index));
    if (automatic.activateQuest !== "-1" && !knownQuestIndexes.has(automatic.activateQuest)) {
      messages.push(["warn", `${prefix} activated quest index ${automatic.activateQuest} is not found in the quest list.`]);
    }
    if (!["0", "1", "2"].includes(automatic.autoAccept)) {
      messages.push(["warn", `${prefix} auto-accept must be 0, 1, or 2.`]);
    }
    if (automatic.activateQuest === "-1" && automatic.autoAccept !== "0") {
      messages.push(["warn", `${prefix} auto-accept is enabled without an activated quest.`]);
    }
    if (automatic.changeMode === "exact" &&
        (!/^-?\d+$/.test(automatic.changeStage) || Number(automatic.changeStage) < 0 || Number(automatic.changeStage) > 49)) {
      messages.push(["warn", `${prefix} exact target stage must be an integer from 0 to 49.`]);
    }
    if (automatic.changeMode === "random" &&
        (!/^\d+$/.test(automatic.randomSteps) || Number(automatic.randomSteps) < 1 || Number(stage.id) + Number(automatic.randomSteps) > 49)) {
      messages.push(["warn", `${prefix} random-forward range must be at least 1 and must not exceed stage 49.`]);
    }
    if (!/^-?\d+$/.test(automatic.ingameHour) ||
        (Number(automatic.ingameHour) !== -1 && (Number(automatic.ingameHour) < 0 || Number(automatic.ingameHour) > 23))) {
      messages.push(["warn", `${prefix} in-game hour must be -1 or 0..23.`]);
    }
    if (!/^\d+$/.test(automatic.realMinutes)) {
      messages.push(["warn", `${prefix} real-time minutes must be an integer of 0 or greater.`]);
    }
    if (automatic.ingameHour !== "-1" && automatic.realMinutes !== "0") {
      messages.push(["warn", `${prefix} has both timers enabled; the in-game hour takes precedence.`]);
    }
    if (!["0", "1"].includes(automatic.quiet)) {
      messages.push(["warn", `${prefix} quiet change must be 0 or 1.`]);
    }
    const flags = automatic.flags === "-" ? "" : automatic.flags;
    if ([...flags].some((flag) => !/[A-Pa-p]/.test(flag))) {
      messages.push(["warn", `${prefix} flags may contain only A..P and a..p.`]);
    }
    for (const upper of "ABCDEFGHIJKLMNOP") {
      if (flags.includes(upper) && flags.includes(upper.toLowerCase())) {
        messages.push(["warn", `${prefix} both sets and clears flag ${upper}.`]);
      }
    }
    if (automatic.genocideEnabled) {
      for (const [axis, coordinate] of [["X", automatic.wx], ["Y", automatic.wy]]) {
        if (!/^\d+$/.test(coordinate) || Number(coordinate) < 0 || Number(coordinate) > 63) {
          messages.push(["warn", `${prefix} genocide World ${axis} must be an integer from 0 to 63.`]);
        }
      }
      if (!/^-?\d+$/.test(automatic.wz)) {
        messages.push(["warn", `${prefix} genocide World Z must be an integer.`]);
      }
    }
  }

  if (value("codename").length !== 10) {
    messages.push(["error", "Codename must be exactly 10 characters."]);
  }

  if (!/^[0-9A-F]+$/i.test(value("races"))) {
    messages.push(["error", "Races mask must be generated as hexadecimal."]);
  }

  if (!/^[0-9A-F]+$/i.test(value("classes"))) {
    messages.push(["error", "Classes mask must be generated as hexadecimal."]);
  }

  for (const name of ["creator", "quest_name"]) {
    if (value(name).includes(":")) {
      messages.push(["error", `${name} must not contain ':'.`]);
    }
  }

  if (questors.length === 0) {
    messages.push(["warn", "Quest should define at least one questor."]);
  }
  if (questors.length > 30) {
    messages.push(["warn", "Questors are limited to 30 Q lines."]);
  }

  questors.forEach((questor, index) => {
    if (questor.name.includes(":")) {
      messages.push(["error", `Questor #${index} name must not contain ':'.`]);
    }
    if (questor.type === "0" || questor.type === "4") {
      messages.push(["warn", `Questor #${index} type ${questor.type} is defined but not supported by the current TomeNET parser branch.`]);
    }
    if (questor.liteInvalid) {
      messages.push(["warn", `Questor #${index} imported lite value ${questor.liteInvalid} is outside 0..255 and was shown as no light.`]);
    }
    const liteRadiusText = String(questor.liteRadius || "0");
    const liteRadius = /^\d+$/.test(liteRadiusText) ? Number.parseInt(liteRadiusText, 10) : NaN;
    if (questor.liteType !== "0" && !Number.isInteger(liteRadius)) {
      messages.push(["warn", `Questor #${index} lite radius must be an integer.`]);
    } else if ((questor.liteType === "fire" || questor.liteType === "white") && (liteRadius < 0 || liteRadius > 99)) {
      messages.push(["warn", `Questor #${index} lite radius for fire/white light should be 0..99.`]);
    } else if (questor.liteType === "vampire" && (liteRadius < 0 || liteRadius > 55)) {
      messages.push(["warn", `Questor #${index} lite radius for vampire light should be 0..55.`]);
    }
    const nameflags = numericMask(questor.nameflags);
    if ((nameflags & 1) && (nameflags & 2)) {
      messages.push(["warn", `Questor #${index} has both male and female name flags.`]);
    }
    if (nameflags & ~knownNameflagsMask) {
      messages.push(["warn", `Questor #${index} nameflags contains unknown bits: ${nameflags & ~knownNameflagsMask}.`]);
    }
    if (questor.type === "1") {
      if (!lookups.monsters?.byId.has(String(questor.npc.ridx))) {
        messages.push(["warn", `Questor #${index} monster ridx is not matched to monsters.`]);
      }
      if (!lookups.monsters?.byId.has(String(questor.npc.rcharidx))) {
        messages.push(["warn", `Questor #${index} visual monster is not matched to monsters.`]);
      }
      if (questor.npc.reidx !== "0" && !lookups.monsterEgos?.byId.has(String(questor.npc.reidx))) {
        messages.push(["warn", `Questor #${index} monster ego is not matched to monster egos.`]);
      }
    }
    if (questor.type === "2" && !lookups.parchments?.byId.has(String(questor.parchment.sval))) {
      messages.push(["warn", `Questor #${index} parchment sval is not matched to parchments.`]);
    }
    if (questor.type === "3") {
      const itemId = `${questor.object.tval}:${questor.object.sval}`;
      if (!lookups.items?.byId.has(itemId)) {
        messages.push(["warn", `Questor #${index} object tval/sval is not matched to items.`]);
      }
      if (String(questor.object.name1 || "0") !== "0" && !lookups.artifacts?.byId.has(String(questor.object.name1))) {
        messages.push(["warn", `Questor #${index} artifact name1 is not matched to artifacts.`]);
      }
      if (String(questor.object.name2 || "0") !== "0" && !lookups.egoItems?.byId.has(String(questor.object.name2))) {
        messages.push(["warn", `Questor #${index} ego name2 is not matched to ego items.`]);
      }
      if (String(questor.object.name2b || "0") !== "0" && !lookups.egoItems?.byId.has(String(questor.object.name2b))) {
        messages.push(["warn", `Questor #${index} ego name2b is not matched to ego items.`]);
      }
    }
    if (String(questor.location.loc || "0") === "0" && String(questor.location.wx || "-1") === "-1") {
      messages.push(["warn", `Questor #${index} location type is 0 while world X is -1; random location selection needs a location type.`]);
    }
    const unsupportedTownMask = unknownMaskForOptions(numericMask(questor.location.towns), townOptions);
    if (unsupportedTownMask > 0) {
      messages.push(["warn", `Questor #${index} town mask contains unsupported bits: ${unsupportedTownMask}. Only the five basic towns are used by questor spawning.`]);
    }
    if (questor.location.map !== "-" && !lookups.templates?.byId.has(questor.location.map)) {
      messages.push(["warn", `Questor #${index} map file is not matched to templates.`]);
    }
    if (questor.dungeon.enabled) {
      for (const dungeonId of questor.dungeon.ids.split(":").filter(Boolean)) {
        if (dungeonId !== "0" && dungeonId !== "255" && !lookups.dungeons?.byId.has(dungeonId)) {
          messages.push(["warn", `Questor #${index} dungeon id ${dungeonId} is not matched to dungeons.`]);
        }
      }
    }
    if (questor.drops.enabled && questor.type === "1" && questor.flags.invincible !== "0") {
      messages.push(["warn", `Questor #${index} has K drops but is initially invincible.`]);
    }
    if (questor.drops.enabled && questor.type !== "1") {
      messages.push(["warn", `Questor #${index} has a preserved K line, but TomeNET processes K drops and experience only for NPC questors.`]);
    }
    if (questor.drops.enabled) {
      const dropType = numericMask(questor.drops.type);
      const unknownDropBits = unknownMaskForOptions(dropType, dropTypeOptions);
      const specificEnabled = maskHasValue(dropType, 2);
      const dropItemId = `${questor.drops.tval}:${questor.drops.sval}`;
      const hasDropItem = String(questor.drops.tval || "0") !== "0";
      const hasGeneratedReward = String(questor.drops.reward || "0") !== "0";
      const hasGold = numericValue(questor.drops.gold) !== 0;
      const hasQuality = [questor.drops.good, questor.drops.great, questor.drops.vgreat]
        .some((quality) => String(quality) !== "0");
      const hasManualModifiers = [questor.drops.pval, questor.drops.bpval, questor.drops.name1, questor.drops.name2, questor.drops.name2b]
        .some((modifier) => String(modifier) !== "0");

      if (!/^\d+$/.test(String(questor.drops.type))) {
        messages.push(["warn", `Questor #${index} K drop behavior must be a non-negative integer mask.`]);
      }
      if (unknownDropBits > 0) {
        messages.push(["warn", `Questor #${index} K drop behavior contains unknown bits: ${unknownDropBits}.`]);
      }
      if ((hasDropItem || hasGeneratedReward || hasGold) && !specificEnabled) {
        messages.push(["warn", `Questor #${index} has a specific item, generated reward, or gold configured without the K specific-drop bit.`]);
      }
      if (hasDropItem && !lookups.items?.byId.has(dropItemId)) {
        messages.push(["warn", `Questor #${index} K drop item is not matched to items.`]);
      }
      if (String(questor.drops.name2 || "0") !== "0" && !lookups.egoItems?.byId.has(String(questor.drops.name2))) {
        messages.push(["warn", `Questor #${index} K ego name2 is not matched to ego items.`]);
      }
      if (String(questor.drops.name2b || "0") !== "0" && !lookups.egoItems?.byId.has(String(questor.drops.name2b))) {
        messages.push(["warn", `Questor #${index} K ego name2b is not matched to ego items.`]);
      }
      if (hasDropItem && hasGeneratedReward) {
        messages.push(["warn", `Questor #${index} has both a K specific item and generated reward; the specific item takes priority.`]);
      }
      if (hasQuality && hasManualModifiers) {
        messages.push(["warn", `Questor #${index} K quality generation ignores manual pval, bpval, random artifact, and ego settings.`]);
      }
      if (String(questor.drops.name1 || "0") !== "0" &&
          (String(questor.drops.name2 || "0") !== "0" || String(questor.drops.name2b || "0") !== "0")) {
        messages.push(["warn", `Questor #${index} K random artifact setting clears both ego settings at runtime.`]);
      }
      const reward = Number(questor.drops.reward);
      if (!/^\d+$/.test(String(questor.drops.reward)) || reward < 0 || reward > 5) {
        messages.push(["warn", `Questor #${index} K generated reward must be an integer from 0 to 5.`]);
      }
      const gold = Number(questor.drops.gold);
      if (!/^-?\d+$/.test(String(questor.drops.gold)) || gold < 0) {
        messages.push(["warn", `Questor #${index} K gold must be an integer of 0 or greater.`]);
      }
      const exp = Number(questor.drops.exp);
      if (!/^-?\d+$/.test(String(questor.drops.exp)) || exp < -1) {
        messages.push(["warn", `Questor #${index} K experience must be -1 or greater.`]);
      }
    }
  });

  if (value("monsterform") !== "0" && !lookups.monsters?.byId.has(value("monsterform"))) {
    messages.push(["warn", "Monster form is not matched to monsters."]);
  }

  const prerequisites = prerequisiteCodes();
  const knownQuestCodes = new Set(questRows().map((quest) => quest.codename));
  if (prerequisites.length > 5) {
    messages.push(["warn", "E prerequisites support up to 5 quest codenames."]);
  }
  for (const code of prerequisites) {
    if (code.length !== 10) {
      messages.push(["warn", `Prerequisite "${code}" should be exactly 10 characters.`]);
    }
    if (code === value("codename")) {
      messages.push(["warn", "A quest should not require itself as a prerequisite."]);
    }
    if (!knownQuestCodes.has(code)) {
      messages.push(["warn", `Prerequisite "${code}" is not found in the quest list.`]);
    }
  }

  const timeValues = spawnTimeValues();
  for (const [index, timeValue] of timeValues.slice(0, 9).entries()) {
    if (timeValue !== "0" && timeValue !== "1") {
      messages.push(["warn", `T boolean field ${index + 1} must be 0 or 1.`]);
    }
  }

  const [startMinute, stopMinute] = [value("time_start"), value("time_stop")].map(Number);
  for (const [label, rawValue] of [["Start minute", value("time_start")], ["Stop minute", value("time_stop")]]) {
    const numericValue = Number(rawValue);
    if (!/^-?\d+$/.test(rawValue) || (numericValue !== -1 && (numericValue < 0 || numericValue > 59))) {
      messages.push(["warn", `${label} must be -1 or a minute value from 0 to 59.`]);
    }
  }
  if (startMinute !== -1 && stopMinute !== -1 && stopMinute <= startMinute) {
    messages.push(["warn", "T stop minute should be greater than start minute; wrap-around is not supported by the runtime check."]);
  }
  if (timeValues.slice(0, 9).every((timeValue) => timeValue === "0") && value("time_start") === "-1") {
    messages.push(["warn", "T block has no normal activation window."]);
  }

  const endingStage = Number(value("ending_stage"));
  if (!/^\d+$/.test(value("ending_stage")) || endingStage < 0 || endingStage > 49) {
    messages.push(["warn", "U ending stage must be an integer from 0 to 49."]);
  }

  const duration = Number(value("duration"));
  if (!/^-?\d+$/.test(value("duration")) || duration < 0) {
    messages.push(["warn", "U duration must be 0 or greater."]);
  } else if (duration > 0) {
    messages.push(["warn", "U duration is documented but currently not implemented by TomeNET."]);
  }

  const cooldown = Number(value("cooldown"));
  if (!/^-?\d+$/.test(value("cooldown")) || cooldown < -1) {
    messages.push(["warn", "U cooldown must be -1 or greater."]);
  }

  if (messages.length === 0) {
    messages.push(["ok", "No basic validation issues."]);
  }

  return messages;
}

function renderIssues(messages) {
  issues.innerHTML = messages
    .map(([type, message]) => `<div class="issue-${type}">${escapeHtml(message)}</div>`)
    .join("");
}

function render() {
  syncSearchFields();
  output.textContent = generatedQuest();
  renderIssues(validate());
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

form.addEventListener("input", (event) => {
  if (event.target === monsterformSearch) {
    renderMonsterformSuggestions();
  }

  if (event.target === prerequisiteSearch || event.target.name === "codename") {
    renderPrerequisiteOptions();
  }

  const searchField = event.target.closest(".search-field");
  if (event.target.classList.contains("search-select") && searchField) {
    syncSearchField(searchField);
  }
  if (event.target.name !== "accept_stages_select") {
    renderAcceptStageOptions();
  }
  render();
});

form.addEventListener("change", (event) => {
  const searchField = event.target.closest(".search-field");
  if (event.target.classList.contains("search-select") && searchField) {
    syncSearchField(searchField);
  }
  if (event.target.name === "accept_stages_select") {
    syncAcceptStagesFromSelect();
  } else if (event.target.name === "prerequisites_select") {
    syncPrerequisitesFromSelect();
  } else {
    renderAcceptStageOptions();
  }
  if (event.target.name !== "prerequisites_select") {
    renderPrerequisiteOptions();
  }
  render();
});

document.querySelector("#resetForm").addEventListener("click", () => {
  form.reset();
  setMonsterform(null);
  setSpawnTimes();
  setEndingRespawn();
  setQuestorsFromRaw([]);
  hydrateSearchFields();
  initializeStagesFromLegacy();
  renderPrerequisiteOptions();
  syncMaskPickers();
  render();
});

document.querySelector("#copyOutput").addEventListener("click", async () => {
  await navigator.clipboard.writeText(output.textContent);
});

monsterformSearch?.addEventListener("input", () => {
  renderMonsterformSuggestions();
  render();
});

monsterformSearch?.addEventListener("focus", () => {
  renderMonsterformSuggestions();
});

monsterformSearch?.addEventListener("keyup", () => {
  renderMonsterformSuggestions();
});

monsterformSuggestions?.addEventListener("click", (event) => {
  const option = event.target.closest("[data-monster-id]");
  if (!option) {
    return;
  }

  const id = option.dataset.monsterId || "0";
  const record = id === "0" ? null : lookups.monsters?.byId.get(id) || null;
  setMonsterform(record);
  render();
});

monsterformSelected?.addEventListener("click", (event) => {
  if (!event.target.closest("#clearMonsterform")) {
    return;
  }

  setMonsterform(null);
  render();
});

prerequisitesPreview?.addEventListener("click", (event) => {
  const clearButton = event.target.closest("[data-clear-prerequisite]");
  if (!clearButton) {
    return;
  }

  removePrerequisite(clearButton.dataset.clearPrerequisite || "");
  render();
});

questorList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-questor-index]");
  if (!button) {
    return;
  }

  selectedQuestorIndex = Number(button.dataset.questorIndex || "0");
  renderQuestors();
  render();
});

stageList?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-stage-id]");
  if (!button) {
    return;
  }
  selectedStageId = button.dataset.stageId || "0";
  renderStages();
});

stageEditor?.addEventListener("click", (event) => {
  const stage = selectedEditorStage();
  if (!stage) {
    return;
  }
  const morphNameflagsToggle = event.target.closest("[data-stage-morph-nameflags-toggle]");
  if (morphNameflagsToggle) {
    const picker = morphNameflagsToggle.closest(".option-picker");
    const open = !picker?.classList.contains("is-open");
    stageEditor.querySelectorAll("[data-stage-morph-nameflags-toggle]").forEach((toggle) => {
      toggle.closest(".option-picker")?.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
    picker?.classList.toggle("is-open", open);
    morphNameflagsToggle.setAttribute("aria-expanded", String(open));
    return;
  }
  const morphRecord = event.target.closest("[data-stage-morph-record-id]");
  if (morphRecord) {
    const morph = stageMorphFromElement(morphRecord);
    if (morph) {
      setMorphValue(morph, morphRecord.dataset.mpath || "", morphRecord.dataset.stageMorphRecordId || "0");
      renderStages();
      render();
    }
    return;
  }
  const clearMorphRecord = event.target.closest("[data-clear-stage-morph-record]");
  if (clearMorphRecord) {
    const morph = stageMorphFromElement(clearMorphRecord);
    if (morph) {
      setMorphValue(morph, clearMorphRecord.dataset.mpath || "", clearMorphRecord.dataset.emptyValue || "0");
      renderStages();
      render();
    }
    return;
  }
  if (event.target.closest("[data-add-stage-morph]")) {
    const used = new Set(stage.questorActions.morphs.map((morph) => String(morph.questor)));
    const questor = questors.findIndex((_, index) => !used.has(String(index)));
    if (questor >= 0) {
      const morph = defaultStageMorph();
      morph.questor = String(questor);
      stage.questorActions.morphs.push(morph);
      renderStages();
      render();
    }
    return;
  }
  const removeMorph = event.target.closest("[data-remove-stage-morph]");
  if (removeMorph) {
    const morph = stageMorphFromElement(removeMorph);
    const index = stage.questorActions.morphs.indexOf(morph);
    if (index >= 0) {
      stage.questorActions.morphs.splice(index, 1);
      renderStages();
      render();
    }
    return;
  }
  if (event.target.closest("[data-add-stage-hostility]")) {
    const used = new Set(stage.questorActions.hostilities.map((hostility) => String(hostility.questor)));
    const questor = questors.findIndex((_, index) => !used.has(String(index)));
    if (questor >= 0) {
      const hostility = defaultStageHostility();
      hostility.questor = String(questor);
      stage.questorActions.hostilities.push(hostility);
      renderStages();
      render();
    }
    return;
  }
  const removeHostility = event.target.closest("[data-remove-stage-hostility]");
  if (removeHostility) {
    const hostility = stageHostilityFromElement(removeHostility);
    const index = stage.questorActions.hostilities.indexOf(hostility);
    if (index >= 0) {
      stage.questorActions.hostilities.splice(index, 1);
      renderStages();
      render();
    }
    return;
  }
  if (event.target.closest("[data-add-stage-action]")) {
    const used = new Set(stage.questorActions.movements.map((action) => String(action.questor)));
    const questor = questors.findIndex((_, index) => !used.has(String(index)));
    if (questor >= 0) {
      const action = defaultStageAction();
      action.questor = String(questor);
      stage.questorActions.movements.push(action);
      renderStages();
      render();
    }
    return;
  }
  const removeAction = event.target.closest("[data-remove-stage-action]");
  if (removeAction) {
    const action = stageActionFromElement(removeAction);
    const index = stage.questorActions.movements.indexOf(action);
    if (index >= 0) {
      stage.questorActions.movements.splice(index, 1);
      renderStages();
      render();
    }
    return;
  }
  const maskToggle = event.target.closest("[data-stage-item-mask-toggle]");
  if (maskToggle) {
    const picker = maskToggle.closest(".option-picker");
    const open = !picker?.classList.contains("is-open");
    stageEditor.querySelectorAll("[data-stage-item-mask-toggle]").forEach((toggle) => {
      toggle.closest(".option-picker")?.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
    picker?.classList.toggle("is-open", open);
    maskToggle.setAttribute("aria-expanded", String(open));
    return;
  }
  const dungeonMaskToggle = event.target.closest("[data-stage-dungeon-mask-toggle]");
  if (dungeonMaskToggle) {
    const picker = dungeonMaskToggle.closest(".option-picker");
    const open = !picker?.classList.contains("is-open");
    stageEditor.querySelectorAll("[data-stage-dungeon-mask-toggle]").forEach((toggle) => {
      toggle.closest(".option-picker")?.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
    picker?.classList.toggle("is-open", open);
    dungeonMaskToggle.setAttribute("aria-expanded", String(open));
    return;
  }
  const monsterMaskToggle = event.target.closest("[data-stage-monster-mask-toggle]");
  if (monsterMaskToggle) {
    const picker = monsterMaskToggle.closest(".option-picker");
    const open = !picker?.classList.contains("is-open");
    stageEditor.querySelectorAll("[data-stage-monster-mask-toggle]").forEach((toggle) => {
      toggle.closest(".option-picker")?.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
    picker?.classList.toggle("is-open", open);
    monsterMaskToggle.setAttribute("aria-expanded", String(open));
    return;
  }
  const monsterRecord = event.target.closest("[data-stage-monster-record-id]");
  if (monsterRecord) {
    const spawn = stageMonsterSpawnFromElement(monsterRecord);
    if (spawn) {
      setMonsterSpawnValue(spawn, monsterRecord.dataset.mspath || "", monsterRecord.dataset.stageMonsterRecordId || "0");
      renderStages();
      render();
    }
    return;
  }
  const clearMonsterRecord = event.target.closest("[data-clear-stage-monster-record]");
  if (clearMonsterRecord) {
    const spawn = stageMonsterSpawnFromElement(clearMonsterRecord);
    if (spawn) {
      setMonsterSpawnValue(spawn, clearMonsterRecord.dataset.mspath || "", clearMonsterRecord.dataset.emptyValue || "0");
      renderStages();
      render();
    }
    return;
  }
  const killRecordOption = event.target.closest("[data-kill-record-id]");
  if (killRecordOption) {
    const goal = killGoalFromElement(killRecordOption);
    const wrapper = killRecordOption.closest("[data-kill-record-index]");
    const type = wrapper?.dataset.killRecordType || "";
    const index = Number(wrapper?.dataset.killRecordIndex || "-1");
    if (goal && ["ridx", "reidx"].includes(type) && index >= 0 && goal[type][index] !== undefined) {
      goal[type][index] = killRecordOption.dataset.killRecordId || "-1";
      renderStages();
      render();
    }
    return;
  }
  const removeKillRecord = event.target.closest("[data-remove-kill-record]");
  if (removeKillRecord) {
    const goal = killGoalFromElement(removeKillRecord);
    const type = removeKillRecord.dataset.removeKillRecord || "";
    const index = Number(removeKillRecord.dataset.index || "-1");
    if (goal && ["ridx", "reidx"].includes(type) && index >= 0) {
      goal[type].splice(index, 1);
      renderStages();
      render();
    }
    return;
  }
  const retrieveItemOption = event.target.closest("[data-retrieve-item-id]");
  if (retrieveItemOption) {
    const goal = retrieveGoalFromElement(retrieveItemOption);
    const wrapper = retrieveItemOption.closest("[data-retrieve-item-index]");
    const index = Number(wrapper?.dataset.retrieveItemIndex || "-1");
    if (goal && index >= 0 && goal.items[index] !== undefined) {
      goal.items[index] = retrieveItemOption.dataset.retrieveItemId || "-1:-1";
      renderStages();
      render();
    }
    return;
  }
  const retrieveValueRecordOption = event.target.closest("[data-retrieve-value-record-id]");
  if (retrieveValueRecordOption) {
    const value = retrieveValueFromElement(retrieveValueRecordOption);
    const wrapper = retrieveValueRecordOption.closest("[data-retrieve-value-record]");
    const path = wrapper?.dataset.retrieveValueRecord || "";
    if (value && ["name1", "name2", "name2b"].includes(path)) {
      value[path] = retrieveValueRecordOption.dataset.retrieveValueRecordId || "-1";
      renderStages();
      render();
    }
    return;
  }
  const clearRetrieveValueRecord = event.target.closest("[data-clear-retrieve-value-record]");
  if (clearRetrieveValueRecord) {
    const value = retrieveValueFromElement(clearRetrieveValueRecord);
    const path = clearRetrieveValueRecord.dataset.clearRetrieveValueRecord || "";
    if (value && ["name1", "name2", "name2b"].includes(path)) {
      value[path] = "-1";
      renderStages();
      render();
    }
    return;
  }
  const goalTargetMapOption = event.target.closest("[data-goal-target-map-id]");
  if (goalTargetMapOption) {
    const goal = goalFromElement(goalTargetMapOption);
    if (goal) {
      goal.target ??= defaultGoalTarget();
      goal.target.map = goalTargetMapOption.dataset.goalTargetMapId || "-";
      renderStages();
      render();
    }
    return;
  }
  const clearGoalTargetMap = event.target.closest("[data-clear-goal-target-map]");
  if (clearGoalTargetMap) {
    const goal = goalFromElement(clearGoalTargetMap);
    if (goal) {
      goal.target ??= defaultGoalTarget();
      goal.target.map = "-";
      renderStages();
      render();
    }
    return;
  }
  const deliveryMapOption = event.target.closest("[data-delivery-map-id]");
  if (deliveryMapOption) {
    const goal = deliveryGoalFromElement(deliveryMapOption);
    if (goal) {
      goal.map = deliveryMapOption.dataset.deliveryMapId || "-";
      renderStages();
      render();
    }
    return;
  }
  const clearDeliveryMap = event.target.closest("[data-clear-delivery-map]");
  if (clearDeliveryMap) {
    const goal = deliveryGoalFromElement(clearDeliveryMap);
    if (goal) {
      goal.map = "-";
      renderStages();
      render();
    }
    return;
  }
  const monsterMapOption = event.target.closest("[data-stage-monster-map-id]");
  if (monsterMapOption) {
    const spawn = stageMonsterSpawnFromElement(monsterMapOption);
    if (spawn) {
      spawn.location.map = monsterMapOption.dataset.stageMonsterMapId || "-";
      spawn.missingMl = false;
      renderStages();
      render();
    }
    return;
  }
  const clearMonsterMap = event.target.closest("[data-clear-stage-monster-map]");
  if (clearMonsterMap) {
    const spawn = stageMonsterSpawnFromElement(clearMonsterMap);
    if (spawn) {
      spawn.location.map = "-";
      spawn.missingMl = false;
      renderStages();
      render();
    }
    return;
  }
  const dungeonMapOption = event.target.closest("[data-stage-dungeon-map-id]");
  if (dungeonMapOption) {
    const dungeon = stage.spawns.dungeon;
    setDungeonValue(dungeon, dungeonMapOption.dataset.dpath || "", dungeonMapOption.dataset.stageDungeonMapId || "-");
    renderStages();
    render();
    return;
  }
  const clearDungeonMap = event.target.closest("[data-clear-stage-dungeon-map]");
  if (clearDungeonMap) {
    setDungeonValue(stage.spawns.dungeon, clearDungeonMap.dataset.dpath || "", "-");
    renderStages();
    render();
    return;
  }
  const mapOption = event.target.closest("[data-stage-item-map-id]");
  if (mapOption) {
    const item = stageQuestItemFromElement(mapOption);
    if (item) {
      item.location.map = mapOption.dataset.stageItemMapId || "-";
      renderStages();
      render();
    }
    return;
  }
  const clearMap = event.target.closest("[data-clear-stage-item-map]");
  if (clearMap) {
    const item = stageQuestItemFromElement(clearMap);
    if (item) {
      item.location.map = "-";
      renderStages();
      render();
    }
    return;
  }
  if (event.target.closest("[data-add-stage-monster]")) {
    if (stage.spawns.monsters.length < 10) {
      stage.spawns.monsters.push(defaultStageMonsterSpawn());
      renderStages();
      render();
    }
    return;
  }
  const monsterElement = event.target.closest("[data-stage-monster-id]");
  const monsterIndex = monsterElement
    ? stage.spawns.monsters.findIndex((spawn) => spawn.uiId === monsterElement.dataset.stageMonsterId)
    : -1;
  if (event.target.closest("[data-duplicate-stage-monster]") && monsterIndex >= 0 && stage.spawns.monsters.length < 10) {
    const duplicateSpawn = JSON.parse(JSON.stringify(stage.spawns.monsters[monsterIndex]));
    duplicateSpawn.uiId = nextStageEntryId("monster-spawn");
    stage.spawns.monsters.splice(monsterIndex + 1, 0, duplicateSpawn);
    renderStages();
    render();
    return;
  }
  if (event.target.closest("[data-remove-stage-monster]") && monsterIndex >= 0) {
    stage.spawns.monsters.splice(monsterIndex, 1);
    renderStages();
    render();
    return;
  }
  const moveMonster = event.target.closest("[data-move-stage-monster]");
  if (moveMonster && monsterIndex >= 0) {
    const targetIndex = monsterIndex + Number(moveMonster.dataset.moveStageMonster);
    if (targetIndex >= 0 && targetIndex < stage.spawns.monsters.length) {
      [stage.spawns.monsters[monsterIndex], stage.spawns.monsters[targetIndex]] =
        [stage.spawns.monsters[targetIndex], stage.spawns.monsters[monsterIndex]];
      renderStages();
      render();
    }
    return;
  }
  if (event.target.closest("[data-add-kill-goal]")) {
    if (stage.goals.length < 5) {
      const goal = defaultKillGoal();
      const used = new Set(stage.goals.map((entry) => String(entry.goal)));
      for (let candidate = 1; candidate <= 5; candidate += 1) {
        if (!used.has(String(candidate))) {
          goal.goal = String(candidate);
          break;
        }
      }
      stage.goals.push(goal);
      renderStages();
      render();
    }
    return;
  }
  const killElement = event.target.closest("[data-kill-goal-id]");
  const killIndex = killElement
    ? stage.goals.findIndex((goal) => goal.uiId === killElement.dataset.killGoalId)
    : -1;
  if (event.target.closest("[data-duplicate-kill-goal]") && killIndex >= 0 && stage.goals.length < 5) {
    const duplicateGoal = JSON.parse(JSON.stringify(stage.goals[killIndex]));
    duplicateGoal.uiId = nextStageEntryId("kill-goal");
    duplicateGoal.visuals = duplicateGoal.visuals.map((visual) => ({ ...visual, uiId: nextStageEntryId("kill-visual") }));
    stage.goals.splice(killIndex + 1, 0, duplicateGoal);
    renderStages();
    render();
    return;
  }
  if (event.target.closest("[data-remove-kill-goal]") && killIndex >= 0) {
    stage.goals.splice(killIndex, 1);
    renderStages();
    render();
    return;
  }
  const moveKillGoal = event.target.closest("[data-move-kill-goal]");
  if (moveKillGoal && killIndex >= 0) {
    const targetIndex = killIndex + Number(moveKillGoal.dataset.moveKillGoal);
    if (targetIndex >= 0 && targetIndex < stage.goals.length) {
      [stage.goals[killIndex], stage.goals[targetIndex]] =
        [stage.goals[targetIndex], stage.goals[killIndex]];
      renderStages();
      render();
    }
    return;
  }
  const addKillCriterion = event.target.closest("[data-add-kill-criterion]");
  if (addKillCriterion) {
    const goal = killGoalFromElement(addKillCriterion);
    const type = addKillCriterion.dataset.addKillCriterion || "";
    if (goal && type === "ridx" && goal.ridx.length < 10) {
      goal.ridx.push("-1");
    } else if (goal && type === "reidx" && goal.reidx.length < 10) {
      goal.reidx.push("-1");
    } else if (goal && type === "visuals" && goal.visuals.length < 5) {
      goal.visuals.push({ uiId: nextStageEntryId("kill-visual"), char: "-", attr: "-" });
    } else if (goal && type === "names" && goal.names.length < 5) {
      goal.names.push("");
    }
    renderStages();
    render();
    return;
  }
  const removeKillVisual = event.target.closest("[data-remove-kill-visual]");
  if (removeKillVisual) {
    const goal = killGoalFromElement(removeKillVisual);
    const index = Number(removeKillVisual.dataset.removeKillVisual || "-1");
    if (goal && index >= 0) {
      goal.visuals.splice(index, 1);
      renderStages();
      render();
    }
    return;
  }
  const removeKillName = event.target.closest("[data-remove-kill-name]");
  if (removeKillName) {
    const goal = killGoalFromElement(removeKillName);
    const index = Number(removeKillName.dataset.removeKillName || "-1");
    if (goal && index >= 0) {
      goal.names.splice(index, 1);
      renderStages();
      render();
    }
    return;
  }
  if (event.target.closest("[data-add-retrieve-goal]")) {
    if (stage.retrieveGoals.length < 5) {
      const goal = defaultRetrieveGoal();
      const used = new Set([...stage.goals, ...stage.retrieveGoals].map((entry) => String(entry.goal)));
      for (let candidate = 1; candidate <= 5; candidate += 1) {
        if (!used.has(String(candidate))) {
          goal.goal = String(candidate);
          break;
        }
      }
      stage.retrieveGoals.push(goal);
      renderStages();
      render();
    }
    return;
  }
  const retrieveElement = event.target.closest("[data-retrieve-goal-id]");
  const retrieveIndex = retrieveElement
    ? stage.retrieveGoals.findIndex((goal) => goal.uiId === retrieveElement.dataset.retrieveGoalId)
    : -1;
  if (event.target.closest("[data-duplicate-retrieve-goal]") && retrieveIndex >= 0 && stage.retrieveGoals.length < 5) {
    const duplicateGoal = JSON.parse(JSON.stringify(stage.retrieveGoals[retrieveIndex]));
    duplicateGoal.uiId = nextStageEntryId("retrieve-goal");
    duplicateGoal.values = duplicateGoal.values.map((value) => ({ ...value, uiId: nextStageEntryId("retrieve-value") }));
    stage.retrieveGoals.splice(retrieveIndex + 1, 0, duplicateGoal);
    renderStages();
    render();
    return;
  }
  if (event.target.closest("[data-remove-retrieve-goal]") && retrieveIndex >= 0) {
    stage.retrieveGoals.splice(retrieveIndex, 1);
    renderStages();
    render();
    return;
  }
  const moveRetrieveGoal = event.target.closest("[data-move-retrieve-goal]");
  if (moveRetrieveGoal && retrieveIndex >= 0) {
    const targetIndex = retrieveIndex + Number(moveRetrieveGoal.dataset.moveRetrieveGoal);
    if (targetIndex >= 0 && targetIndex < stage.retrieveGoals.length) {
      [stage.retrieveGoals[retrieveIndex], stage.retrieveGoals[targetIndex]] =
        [stage.retrieveGoals[targetIndex], stage.retrieveGoals[retrieveIndex]];
      renderStages();
      render();
    }
    return;
  }
  const addRetrieveCriterion = event.target.closest("[data-add-retrieve-criterion]");
  if (addRetrieveCriterion) {
    const goal = retrieveGoalFromElement(addRetrieveCriterion);
    const type = addRetrieveCriterion.dataset.addRetrieveCriterion || "";
    if (goal && type === "items" && goal.items.length < 10) {
      goal.items.push("-1:-1");
    } else if (goal && type === "values" && goal.values.length < 5) {
      goal.values.push({ uiId: nextStageEntryId("retrieve-value"), pval: "-9999", bpval: "-9999", attr: "-", name1: "-1", name2: "-1", name2b: "-1" });
    } else if (goal && type === "names" && goal.names.length < 5) {
      goal.names.push("");
    }
    renderStages();
    render();
    return;
  }
  const removeRetrieveItem = event.target.closest("[data-remove-retrieve-item]");
  if (removeRetrieveItem) {
    const goal = retrieveGoalFromElement(removeRetrieveItem);
    const index = Number(removeRetrieveItem.dataset.removeRetrieveItem || "-1");
    if (goal && index >= 0) {
      goal.items.splice(index, 1);
      renderStages();
      render();
    }
    return;
  }
  const removeRetrieveValue = event.target.closest("[data-remove-retrieve-value]");
  if (removeRetrieveValue) {
    const goal = retrieveGoalFromElement(removeRetrieveValue);
    const index = Number(removeRetrieveValue.dataset.removeRetrieveValue || "-1");
    if (goal && index >= 0) {
      goal.values.splice(index, 1);
      renderStages();
      render();
    }
    return;
  }
  const removeRetrieveName = event.target.closest("[data-remove-retrieve-name]");
  if (removeRetrieveName) {
    const goal = retrieveGoalFromElement(removeRetrieveName);
    const index = Number(removeRetrieveName.dataset.removeRetrieveName || "-1");
    if (goal && index >= 0) {
      goal.names.splice(index, 1);
      renderStages();
      render();
    }
    return;
  }
  if (event.target.closest("[data-add-delivery-goal]")) {
    if (stage.deliveryGoals.length < 5) {
      const goal = defaultDeliveryGoal();
      const used = new Set([...stage.goals, ...stage.retrieveGoals, ...stage.deliveryGoals].map((entry) => String(entry.goal)));
      for (let candidate = 1; candidate <= 5; candidate += 1) {
        if (!used.has(String(candidate))) {
          goal.goal = String(candidate);
          break;
        }
      }
      stage.deliveryGoals.push(goal);
      renderStages();
      render();
    }
    return;
  }
  const deliveryElement = event.target.closest("[data-delivery-goal-id]");
  const deliveryIndex = deliveryElement
    ? stage.deliveryGoals.findIndex((goal) => goal.uiId === deliveryElement.dataset.deliveryGoalId)
    : -1;
  if (event.target.closest("[data-duplicate-delivery-goal]") && deliveryIndex >= 0 && stage.deliveryGoals.length < 5) {
    const duplicateGoal = JSON.parse(JSON.stringify(stage.deliveryGoals[deliveryIndex]));
    duplicateGoal.uiId = nextStageEntryId("delivery-goal");
    stage.deliveryGoals.splice(deliveryIndex + 1, 0, duplicateGoal);
    renderStages();
    render();
    return;
  }
  if (event.target.closest("[data-remove-delivery-goal]") && deliveryIndex >= 0) {
    stage.deliveryGoals.splice(deliveryIndex, 1);
    renderStages();
    render();
    return;
  }
  const moveDeliveryGoal = event.target.closest("[data-move-delivery-goal]");
  if (moveDeliveryGoal && deliveryIndex >= 0) {
    const targetIndex = deliveryIndex + Number(moveDeliveryGoal.dataset.moveDeliveryGoal);
    if (targetIndex >= 0 && targetIndex < stage.deliveryGoals.length) {
      [stage.deliveryGoals[deliveryIndex], stage.deliveryGoals[targetIndex]] =
        [stage.deliveryGoals[targetIndex], stage.deliveryGoals[deliveryIndex]];
      renderStages();
      render();
    }
    return;
  }
  if (event.target.closest("[data-add-completion-transition]")) {
    if (stage.completion.transitions.length < 5) {
      const transition = defaultCompletionTransition();
      transition.nextStage = stageCompletionNextStage(stage);
      transition.goals = stageCompletionGoalCatalog(stage)
        .filter((goal) => !goal.disabled)
        .slice(0, 1)
        .map((goal) => goal.value);
      stage.completion.transitions.push(transition);
      renderStages();
      render();
    }
    return;
  }
  const completionElement = event.target.closest("[data-completion-transition-id]");
  const completionIndex = completionElement
    ? stage.completion.transitions.findIndex((transition) => transition.uiId === completionElement.dataset.completionTransitionId)
    : -1;
  if (event.target.closest("[data-duplicate-completion-transition]") && completionIndex >= 0 && stage.completion.transitions.length < 5) {
    const duplicateTransition = JSON.parse(JSON.stringify(stage.completion.transitions[completionIndex]));
    duplicateTransition.uiId = nextStageEntryId("completion-transition");
    stage.completion.transitions.splice(completionIndex + 1, 0, duplicateTransition);
    renderStages();
    render();
    return;
  }
  if (event.target.closest("[data-remove-completion-transition]") && completionIndex >= 0) {
    stage.completion.transitions.splice(completionIndex, 1);
    renderStages();
    render();
    return;
  }
  const moveCompletionTransition = event.target.closest("[data-move-completion-transition]");
  if (moveCompletionTransition && completionIndex >= 0) {
    const targetIndex = completionIndex + Number(moveCompletionTransition.dataset.moveCompletionTransition);
    if (targetIndex >= 0 && targetIndex < stage.completion.transitions.length) {
      [stage.completion.transitions[completionIndex], stage.completion.transitions[targetIndex]] =
        [stage.completion.transitions[targetIndex], stage.completion.transitions[completionIndex]];
      renderStages();
      render();
    }
    return;
  }
  if (event.target.closest("[data-add-reward-condition]")) {
    if (stage.completion.rewardConditions.length < 10) {
      const condition = defaultRewardCondition();
      condition.rewardIndex = String(Math.max(0, Math.min(stage.completion.rewards.length - 1, stage.completion.rewardConditions.length)));
      stage.completion.rewardConditions.push(condition);
      renderStages();
      render();
    }
    return;
  }
  const rewardConditionElement = event.target.closest("[data-reward-condition-id]");
  const rewardConditionIndex = rewardConditionElement
    ? stage.completion.rewardConditions.findIndex((condition) => condition.uiId === rewardConditionElement.dataset.rewardConditionId)
    : -1;
  if (event.target.closest("[data-duplicate-reward-condition]") && rewardConditionIndex >= 0 && stage.completion.rewardConditions.length < 10) {
    const duplicateCondition = JSON.parse(JSON.stringify(stage.completion.rewardConditions[rewardConditionIndex]));
    duplicateCondition.uiId = nextStageEntryId("reward-condition");
    stage.completion.rewardConditions.splice(rewardConditionIndex + 1, 0, duplicateCondition);
    renderStages();
    render();
    return;
  }
  if (event.target.closest("[data-remove-reward-condition]") && rewardConditionIndex >= 0) {
    stage.completion.rewardConditions.splice(rewardConditionIndex, 1);
    renderStages();
    render();
    return;
  }
  const moveRewardCondition = event.target.closest("[data-move-reward-condition]");
  if (moveRewardCondition && rewardConditionIndex >= 0) {
    const targetIndex = rewardConditionIndex + Number(moveRewardCondition.dataset.moveRewardCondition);
    if (targetIndex >= 0 && targetIndex < stage.completion.rewardConditions.length) {
      [stage.completion.rewardConditions[rewardConditionIndex], stage.completion.rewardConditions[targetIndex]] =
        [stage.completion.rewardConditions[targetIndex], stage.completion.rewardConditions[rewardConditionIndex]];
      renderStages();
      render();
    }
    return;
  }
  if (event.target.closest("[data-add-stage-reward]")) {
    if (stage.completion.rewards.length < 10) {
      stage.completion.rewards.push(defaultStageReward());
      renderStages();
      render();
    }
    return;
  }
  const stageRewardElement = event.target.closest("[data-stage-reward-id]");
  const stageRewardIndex = stageRewardElement
    ? stage.completion.rewards.findIndex((reward) => reward.uiId === stageRewardElement.dataset.stageRewardId)
    : -1;
  if (event.target.closest("[data-duplicate-stage-reward]") && stageRewardIndex >= 0 && stage.completion.rewards.length < 10) {
    const duplicateReward = JSON.parse(JSON.stringify(stage.completion.rewards[stageRewardIndex]));
    duplicateReward.uiId = nextStageEntryId("stage-reward");
    stage.completion.rewards.splice(stageRewardIndex + 1, 0, duplicateReward);
    renderStages();
    render();
    return;
  }
  if (event.target.closest("[data-remove-stage-reward]") && stageRewardIndex >= 0) {
    stage.completion.rewards.splice(stageRewardIndex, 1);
    renderStages();
    render();
    return;
  }
  const moveStageReward = event.target.closest("[data-move-stage-reward]");
  if (moveStageReward && stageRewardIndex >= 0) {
    const targetIndex = stageRewardIndex + Number(moveStageReward.dataset.moveStageReward);
    if (targetIndex >= 0 && targetIndex < stage.completion.rewards.length) {
      [stage.completion.rewards[stageRewardIndex], stage.completion.rewards[targetIndex]] =
        [stage.completion.rewards[targetIndex], stage.completion.rewards[stageRewardIndex]];
      renderStages();
      render();
    }
    return;
  }
  const rewardItemOption = event.target.closest("[data-stage-reward-item-id]");
  if (rewardItemOption) {
    const reward = stageRewardFromElement(rewardItemOption);
    if (reward) {
      const [tval = "0", sval = "0"] = String(rewardItemOption.dataset.stageRewardItemId || "0:0").split(":");
      reward.tval = tval;
      reward.sval = sval;
      closeStageRewardSuggestions();
      renderStages();
      render();
    }
    return;
  }
  const clearRewardItem = event.target.closest("[data-clear-stage-reward-item]");
  if (clearRewardItem) {
    const reward = stageRewardFromElement(clearRewardItem);
    if (reward) {
      reward.tval = "0";
      reward.sval = "0";
      renderStages();
      render();
    }
    return;
  }
  const rewardRecordOption = event.target.closest("[data-stage-reward-record-id]");
  if (rewardRecordOption) {
    const reward = stageRewardFromElement(rewardRecordOption);
    if (reward) {
      setRewardValue(reward, rewardRecordOption.dataset.rewardRecordPath || "", rewardRecordOption.dataset.stageRewardRecordId || "0");
      closeStageRewardSuggestions();
      renderStages();
      render();
    }
    return;
  }
  const clearRewardRecord = event.target.closest("[data-clear-stage-reward-record]");
  if (clearRewardRecord) {
    const reward = stageRewardFromElement(clearRewardRecord);
    if (reward) {
      setRewardValue(reward, clearRewardRecord.dataset.rewardRecordPath || "", "0");
      renderStages();
      render();
    }
    return;
  }
  const addStageText = event.target.closest("[data-add-stage-text]");
  if (addStageText) {
    const kind = addStageText.dataset.addStageText || "";
    const entries = stageTextEntries(stage, kind);
    if ((kind === "keyword" && keywordEntryCount() < 100) ||
        (kind === "reply" && replyEntryCount() < 50) ||
        (!["keyword", "reply"].includes(kind) && entries.length < 15)) {
      const entry = defaultStageTextEntry(kind);
      if (kind === "reply") {
        entry.keyword = keywordReplyOptions()[0]?.[0] || "";
      }
      entries.push(entry);
      renderStages();
      render();
    }
    return;
  }
  const textElement = event.target.closest("[data-stage-text-id]");
  const textKind = textElement?.dataset.stageTextKind || "";
  const textEntries = stageTextEntries(stage, textKind);
  const textIndex = textElement
    ? textEntries.findIndex((entry) => entry.uiId === textElement.dataset.stageTextId)
    : -1;
  if (event.target.closest("[data-duplicate-stage-text]") && textIndex >= 0 &&
      ((textKind === "keyword" && keywordEntryCount() < 100) ||
       (textKind === "reply" && replyEntryCount() < 50) ||
       (!["keyword", "reply"].includes(textKind) && textEntries.length < 15))) {
    const duplicateText = JSON.parse(JSON.stringify(textEntries[textIndex]));
    duplicateText.uiId = nextStageEntryId("stage-text");
    textEntries.splice(textIndex + 1, 0, duplicateText);
    renderStages();
    render();
    return;
  }
  if (event.target.closest("[data-remove-stage-text]") && textIndex >= 0) {
    textEntries.splice(textIndex, 1);
    renderStages();
    render();
    return;
  }
  const moveText = event.target.closest("[data-move-stage-text]");
  if (moveText && textIndex >= 0) {
    const targetIndex = textIndex + Number(moveText.dataset.moveStageText);
    if (targetIndex >= 0 && targetIndex < textEntries.length) {
      [textEntries[textIndex], textEntries[targetIndex]] =
        [textEntries[targetIndex], textEntries[textIndex]];
      renderStages();
      render();
    }
    return;
  }
  const replyLineElement = event.target.closest("[data-stage-reply-line-id]");
  const replyGroup = replyLineElement ? stageTextFromElement(replyLineElement) : null;
  const replyLines = replyGroup?.replies || [];
  const replyLineIndex = replyLineElement
    ? replyLines.findIndex((reply) => reply.uiId === replyLineElement.dataset.stageReplyLineId)
    : -1;
  if (event.target.closest("[data-add-stage-reply-line]")) {
    const entry = stageTextFromElement(event.target);
    if (entry && entry.replies.length < 15) {
      entry.replies.push(defaultStageReplyLine());
      renderStages();
      render();
    }
    return;
  }
  if (event.target.closest("[data-duplicate-stage-reply-line]") && replyLineIndex >= 0 && replyLines.length < 15) {
    const duplicateReply = JSON.parse(JSON.stringify(replyLines[replyLineIndex]));
    duplicateReply.uiId = nextStageEntryId("stage-reply-line");
    replyLines.splice(replyLineIndex + 1, 0, duplicateReply);
    renderStages();
    render();
    return;
  }
  if (event.target.closest("[data-remove-stage-reply-line]") && replyLineIndex >= 0) {
    replyLines.splice(replyLineIndex, 1);
    renderStages();
    render();
    return;
  }
  const moveReplyLine = event.target.closest("[data-move-stage-reply-line]");
  if (moveReplyLine && replyLineIndex >= 0) {
    const targetIndex = replyLineIndex + Number(moveReplyLine.dataset.moveStageReplyLine);
    if (targetIndex >= 0 && targetIndex < replyLines.length) {
      [replyLines[replyLineIndex], replyLines[targetIndex]] =
        [replyLines[targetIndex], replyLines[replyLineIndex]];
      renderStages();
      render();
    }
    return;
  }
  if (event.target.closest("[data-add-stage-item]")) {
    if (stage.spawns.questItems.length < 5) {
      stage.spawns.questItems.push(defaultQuestItem());
      renderStages();
      render();
    }
    return;
  }
  const itemElement = event.target.closest("[data-stage-item-id]");
  const itemIndex = itemElement
    ? stage.spawns.questItems.findIndex((item) => item.uiId === itemElement.dataset.stageItemId)
    : -1;
  if (event.target.closest("[data-duplicate-stage-item]") && itemIndex >= 0 && stage.spawns.questItems.length < 5) {
    const duplicateItem = JSON.parse(JSON.stringify(stage.spawns.questItems[itemIndex]));
    duplicateItem.uiId = nextStageEntryId("quest-item");
    stage.spawns.questItems.splice(itemIndex + 1, 0, duplicateItem);
    renderStages();
    render();
    return;
  }
  if (event.target.closest("[data-remove-stage-item]") && itemIndex >= 0) {
    stage.spawns.questItems.splice(itemIndex, 1);
    renderStages();
    render();
    return;
  }
  const moveItem = event.target.closest("[data-move-stage-item]");
  if (moveItem && itemIndex >= 0) {
    const targetIndex = itemIndex + Number(moveItem.dataset.moveStageItem);
    if (targetIndex >= 0 && targetIndex < stage.spawns.questItems.length) {
      [stage.spawns.questItems[itemIndex], stage.spawns.questItems[targetIndex]] =
        [stage.spawns.questItems[targetIndex], stage.spawns.questItems[itemIndex]];
      renderStages();
      render();
    }
    return;
  }
  if (event.target.closest("[data-add-stage-feature]")) {
    if (stage.setup.features.length < 15) {
      stage.setup.features.push(defaultStageFeature());
      renderStages();
      render();
    }
    return;
  }
  const duplicate = event.target.closest("[data-duplicate-stage-feature]");
  if (duplicate) {
    const index = Number(duplicate.dataset.duplicateStageFeature);
    if (stage.setup.features[index] && stage.setup.features.length < 15) {
      stage.setup.features.splice(index + 1, 0, JSON.parse(JSON.stringify(stage.setup.features[index])));
      renderStages();
      render();
    }
    return;
  }
  const remove = event.target.closest("[data-remove-stage-feature]");
  if (remove) {
    stage.setup.features.splice(Number(remove.dataset.removeStageFeature), 1);
    renderStages();
    render();
    return;
  }
  const featureOption = event.target.closest("[data-stage-feature-id]");
  if (featureOption) {
    const feature = stageFeatureFromElement(featureOption);
    if (feature) {
      feature.feature = featureOption.dataset.stageFeatureId || "0";
      renderStages();
      render();
    }
  }
});

stageEditor?.addEventListener("input", (event) => {
  const stage = selectedEditorStage();
  if (!stage) {
    return;
  }
  if (event.target.matches("[data-stage-feature-search]")) {
    renderStageFeatureSuggestions(event.target);
    return;
  }
  if (event.target.matches("[data-stage-item-map-search]")) {
    renderStageItemMapSuggestions(event.target);
    return;
  }
  if (event.target.matches("[data-stage-dungeon-map-search]")) {
    renderStageDungeonMapSuggestions(event.target);
    return;
  }
  if (event.target.matches("[data-stage-monster-record-search]")) {
    renderStageMonsterRecordSuggestions(event.target);
    return;
  }
  if (event.target.matches("[data-kill-record-search]")) {
    renderKillRecordSuggestions(event.target);
    return;
  }
  if (event.target.matches("[data-retrieve-item-search]")) {
    renderRetrieveItemSuggestions(event.target);
    return;
  }
  if (event.target.matches("[data-retrieve-value-record-search]")) {
    renderRetrieveValueRecordSuggestions(event.target);
    return;
  }
  if (event.target.matches("[data-stage-reward-item-search]")) {
    renderStageRewardItemSuggestions(event.target);
    return;
  }
  if (event.target.matches("[data-stage-reward-record-search]")) {
    renderStageRewardRecordSuggestions(event.target);
    return;
  }
  if (event.target.matches("[data-goal-target-map-search]")) {
    renderGoalTargetMapSuggestions(event.target);
    return;
  }
  if (event.target.matches("[data-delivery-map-search]")) {
    renderDeliveryMapSuggestions(event.target);
    return;
  }
  if (event.target.matches("[data-stage-monster-map-search]")) {
    renderStageMonsterMapSuggestions(event.target);
    return;
  }
  if (event.target.matches("[data-stage-morph-record-search]")) {
    renderStageMorphRecordSuggestions(event.target);
    return;
  }
  if (event.target.matches("[data-stage-monster-prop]")) {
    const spawn = stageMonsterSpawnFromElement(event.target);
    if (spawn) {
      setMonsterSpawnValue(spawn, event.target.dataset.stageMonsterProp, event.target.value);
      render();
    }
    return;
  }
  if (event.target.matches("[data-kill-prop]")) {
    const goal = killGoalFromElement(event.target);
    if (goal) {
      goal[event.target.dataset.killProp] = event.target.value;
      render();
    }
    return;
  }
  if (event.target.matches("[data-kill-name]")) {
    const goal = killGoalFromElement(event.target);
    const wrapper = event.target.closest("[data-kill-name-index]");
    const index = Number(wrapper?.dataset.killNameIndex || "-1");
    if (goal && index >= 0) {
      goal.names[index] = event.target.value;
      render();
    }
    return;
  }
  if (event.target.matches("[data-kill-visual-prop]")) {
    const goal = killGoalFromElement(event.target);
    const wrapper = event.target.closest("[data-kill-visual-index]");
    const index = Number(wrapper?.dataset.killVisualIndex || "-1");
    if (goal?.visuals[index]) {
      goal.visuals[index][event.target.dataset.killVisualProp] = event.target.value;
      render();
    }
    return;
  }
  if (event.target.matches("[data-retrieve-prop]")) {
    const goal = retrieveGoalFromElement(event.target);
    if (goal) {
      goal[event.target.dataset.retrieveProp] = event.target.value;
      render();
    }
    return;
  }
  if (event.target.matches("[data-retrieve-name]")) {
    const goal = retrieveGoalFromElement(event.target);
    const wrapper = event.target.closest("[data-retrieve-name-index]");
    const index = Number(wrapper?.dataset.retrieveNameIndex || "-1");
    if (goal && index >= 0) {
      goal.names[index] = event.target.value;
      render();
    }
    return;
  }
  if (event.target.matches("[data-retrieve-value-prop]")) {
    const value = retrieveValueFromElement(event.target);
    if (value) {
      value[event.target.dataset.retrieveValueProp] = event.target.value;
      render();
    }
    return;
  }
  if (event.target.matches("[data-goal-target-prop]")) {
    const goal = goalFromElement(event.target);
    if (goal) {
      goal.target ??= defaultGoalTarget();
      goal.target[event.target.dataset.goalTargetProp] = event.target.value;
      render();
    }
    return;
  }
  if (event.target.matches("[data-delivery-prop]")) {
    const goal = deliveryGoalFromElement(event.target);
    if (goal) {
      goal[event.target.dataset.deliveryProp] = event.target.value;
      render();
    }
    return;
  }
  if (event.target.matches("[data-completion-prop]")) {
    const transition = completionTransitionFromElement(event.target);
    if (transition) {
      transition[event.target.dataset.completionProp] = event.target.value;
      render();
    }
    return;
  }
  if (event.target.matches("[data-reward-condition-prop]")) {
    const condition = rewardConditionFromElement(event.target);
    if (condition) {
      condition[event.target.dataset.rewardConditionProp] = event.target.value;
      render();
    }
    return;
  }
  if (event.target.matches("[data-stage-reward-prop]")) {
    const reward = stageRewardFromElement(event.target);
    if (reward) {
      setRewardValue(reward, event.target.dataset.stageRewardProp, event.target.value);
      render();
    }
    return;
  }
  if (event.target.matches("[data-stage-text-prop]")) {
    const entry = stageTextFromElement(event.target);
    if (entry) {
      setStageTextValue(entry, event.target.dataset.stageTextProp, event.target.value);
      render();
    }
    return;
  }
  if (event.target.matches("[data-stage-reply-line-prop]")) {
    const reply = stageReplyLineFromElement(event.target);
    if (reply) {
      reply[event.target.dataset.stageReplyLineProp] = event.target.value;
      render();
    }
    return;
  }
  if (event.target.matches("[data-stage-morph-prop]")) {
    const morph = stageMorphFromElement(event.target);
    if (morph) {
      setMorphValue(morph, event.target.dataset.stageMorphProp, event.target.value);
      render();
    }
    return;
  }
  if (event.target.matches("[data-stage-hostility-prop]")) {
    const hostility = stageHostilityFromElement(event.target);
    if (hostility) {
      setHostilityValue(hostility, event.target.dataset.stageHostilityProp, event.target.value);
      render();
    }
    return;
  }
  if (event.target.matches("[data-stage-action-prop]")) {
    const action = stageActionFromElement(event.target);
    if (action) {
      setActionValue(action, event.target.dataset.stageActionProp, event.target.value);
      render();
    }
    return;
  }
  if (event.target.matches("[data-stage-dungeon-prop]")) {
    setDungeonValue(stage.spawns.dungeon, event.target.dataset.stageDungeonProp, event.target.value);
    render();
    return;
  }
  if (event.target.matches("[data-stage-feature-prop]")) {
    const feature = stageFeatureFromElement(event.target);
    if (feature) {
      feature[event.target.dataset.stageFeatureProp] = event.target.value;
      render();
    }
    return;
  }
  if (event.target.matches("[data-stage-item-prop]")) {
    const item = stageQuestItemFromElement(event.target);
    if (item) {
      setQuestItemValue(item, event.target.dataset.stageItemProp, event.target.value);
      render();
    }
    return;
  }
  if (event.target.matches("[data-stage-label-input]")) {
    stage.label = event.target.value;
    renderStageList();
    return;
  }
  if (event.target.matches("[data-stage-auto]")) {
    stage.setup.automatic[event.target.dataset.stageAuto] = event.target.value;
    render();
  }
});

stageEditor?.addEventListener("change", (event) => {
  const stage = selectedEditorStage();
  if (!stage) {
    return;
  }
  if (event.target.matches("[data-kill-optional]")) {
    const goal = killGoalFromElement(event.target);
    if (goal) {
      goal.optional = event.target.checked;
      renderStages();
      render();
    }
    return;
  }
  if (event.target.matches("[data-kill-prop]")) {
    const goal = killGoalFromElement(event.target);
    if (goal) {
      goal[event.target.dataset.killProp] = event.target.value;
      renderStages();
      render();
    }
    return;
  }
  if (event.target.matches("[data-kill-visual-prop]")) {
    const goal = killGoalFromElement(event.target);
    const wrapper = event.target.closest("[data-kill-visual-index]");
    const index = Number(wrapper?.dataset.killVisualIndex || "-1");
    if (goal?.visuals[index]) {
      goal.visuals[index][event.target.dataset.killVisualProp] = event.target.value;
      renderStages();
      render();
    }
    return;
  }
  if (event.target.matches("[data-retrieve-optional]")) {
    const goal = retrieveGoalFromElement(event.target);
    if (goal) {
      goal.optional = event.target.checked;
      renderStages();
      render();
    }
    return;
  }
  if (event.target.matches("[data-retrieve-allow-owned]")) {
    const goal = retrieveGoalFromElement(event.target);
    if (goal) {
      goal.allowOwned = event.target.checked;
      renderStages();
      render();
    }
    return;
  }
  if (event.target.matches("[data-retrieve-prop]")) {
    const goal = retrieveGoalFromElement(event.target);
    if (goal) {
      goal[event.target.dataset.retrieveProp] = event.target.value;
      renderStages();
      render();
    }
    return;
  }
  if (event.target.matches("[data-retrieve-value-prop]")) {
    const value = retrieveValueFromElement(event.target);
    if (value) {
      value[event.target.dataset.retrieveValueProp] = event.target.value;
      renderStages();
      render();
    }
    return;
  }
  if (event.target.matches("[data-goal-target-enabled]")) {
    const goal = goalFromElement(event.target);
    if (goal) {
      goal.target ??= defaultGoalTarget();
      goal.target.enabled = event.target.checked;
      renderStages();
      render();
    }
    return;
  }
  if (event.target.matches("[data-goal-target-prop]")) {
    const goal = goalFromElement(event.target);
    if (goal) {
      goal.target ??= defaultGoalTarget();
      goal.target[event.target.dataset.goalTargetProp] = event.target.value;
      renderStages();
      render();
    }
    return;
  }
  if (event.target.matches("[data-delivery-optional]")) {
    const goal = deliveryGoalFromElement(event.target);
    if (goal) {
      goal.optional = event.target.checked;
      renderStages();
      render();
    }
    return;
  }
  if (event.target.matches("[data-delivery-prop]")) {
    const goal = deliveryGoalFromElement(event.target);
    if (goal) {
      goal[event.target.dataset.deliveryProp] = event.target.value;
      renderStages();
      render();
    }
    return;
  }
  if (event.target.matches("[data-completion-goal]")) {
    const transition = completionTransitionFromElement(event.target);
    if (transition) {
      syncCompletionTransitionGoals(transition, event.target.closest("[data-completion-transition-id]"));
      renderStages();
      render();
    }
    return;
  }
  if (event.target.matches("[data-reward-condition-prop]")) {
    const condition = rewardConditionFromElement(event.target);
    if (condition) {
      condition[event.target.dataset.rewardConditionProp] = event.target.value;
      renderStages();
      render();
    }
    return;
  }
  if (event.target.matches("[data-reward-condition-free], [data-reward-condition-goal]")) {
    const condition = rewardConditionFromElement(event.target);
    if (condition) {
      syncRewardConditionGoals(condition, event.target.closest("[data-reward-condition-id]"));
      renderStages();
      render();
    }
    return;
  }
  if (event.target.matches("[data-stage-reward-prop]")) {
    const reward = stageRewardFromElement(event.target);
    if (reward) {
      setRewardValue(reward, event.target.dataset.stageRewardProp, event.target.value);
      renderStages();
      render();
    }
    return;
  }
  if (event.target.matches("[data-stage-morph-nameflags-keep]")) {
    const morph = stageMorphFromElement(event.target);
    if (morph) {
      morph.nameflags = event.target.checked ? "255" : "0";
      renderStages();
      render();
    }
    return;
  }
  if (event.target.matches("[data-stage-morph-nameflag]")) {
    const morph = stageMorphFromElement(event.target);
    if (morph) {
      syncStageMorphNameflags(morph, event.target.closest(".stage-morph-nameflags"));
      renderStages();
      render();
    }
    return;
  }
  if (event.target.matches("[data-stage-morph-prop]")) {
    const morph = stageMorphFromElement(event.target);
    if (morph) {
      setMorphValue(morph, event.target.dataset.stageMorphProp, event.target.value);
      renderStages();
      render();
    }
    return;
  }
  if (event.target.matches("[data-stage-hostility-prop]")) {
    const hostility = stageHostilityFromElement(event.target);
    if (hostility) {
      setHostilityValue(hostility, event.target.dataset.stageHostilityProp, event.target.value);
      if (event.target.dataset.stageHostilityProp === "changeMode" && hostility.changeMode === "exact" && !stageOrder.includes(String(hostility.changeStage))) {
        hostility.changeStage = stage.id;
      }
      if (event.target.dataset.stageHostilityProp === "changeMode" && hostility.changeMode === "random" && (!/^\d+$/.test(hostility.randomSteps) || Number(hostility.randomSteps) < 1)) {
        hostility.randomSteps = "1";
      }
      renderStages();
      render();
    }
    return;
  }
  if (event.target.matches("[data-stage-action-prop]")) {
    const action = stageActionFromElement(event.target);
    if (action) {
      setActionValue(action, event.target.dataset.stageActionProp, event.target.value);
      if (event.target.dataset.stageActionProp === "changeMode" && action.changeMode === "exact" && !stageOrder.includes(String(action.changeStage))) {
        action.changeStage = stage.id;
      }
      if (event.target.dataset.stageActionProp === "changeMode" && action.changeMode === "random" && (!/^\d+$/.test(action.randomSteps) || Number(action.randomSteps) < 1)) {
        action.randomSteps = "1";
      }
      renderStages();
      render();
    }
    return;
  }
  if (event.target.matches("[data-stage-item-mask-option]")) {
    syncStageItemMask(event.target);
    renderStages();
    render();
    return;
  }
  if (event.target.matches("[data-stage-dungeon-mask-option]")) {
    syncStageDungeonMask(event.target);
    renderStages();
    render();
    return;
  }
  if (event.target.matches("[data-stage-monster-mask-option]")) {
    syncStageMonsterMask(event.target);
    const spawn = stageMonsterSpawnFromElement(event.target);
    if (spawn) {
      spawn.missingMl = false;
    }
    renderStages();
    render();
    return;
  }
  if (event.target.matches("[data-stage-monster-hostility-enabled]")) {
    const spawn = stageMonsterSpawnFromElement(event.target);
    if (spawn) {
      spawn.hostilityEnabled = event.target.checked;
      renderStages();
      render();
    }
    return;
  }
  if (event.target.matches("[data-stage-monster-prop]")) {
    const spawn = stageMonsterSpawnFromElement(event.target);
    if (spawn) {
      setMonsterSpawnValue(spawn, event.target.dataset.stageMonsterProp, event.target.value);
      spawn.missingMl = false;
      renderStages();
      render();
    }
    return;
  }
  if (event.target.matches("[data-stage-text-prop]")) {
    const entry = stageTextFromElement(event.target);
    if (entry) {
      setStageTextValue(entry, event.target.dataset.stageTextProp, event.target.value);
      if (event.target.dataset.stageTextProp === "keyword" && Array.isArray(entry.extraKeywords)) {
        entry.extraKeywords = entry.extraKeywords.filter((keyword) => keyword !== entry.keyword);
      }
      if (event.target.dataset.stageTextProp === "nextMode" && entry.nextMode === "exact" && !stageOrder.includes(String(entry.nextStage))) {
        entry.nextStage = stageOrder.includes(stage.id) ? stage.id : "0";
      }
      if (event.target.dataset.stageTextProp === "nextMode" && entry.nextMode === "random" && (!/^\d+$/.test(entry.randomSteps) || Number(entry.randomSteps) < 1)) {
        entry.randomSteps = "1";
      }
      renderStages();
      render();
    }
    return;
  }
  if (event.target.matches("[data-stage-reply-line-prop]")) {
    const reply = stageReplyLineFromElement(event.target);
    if (reply) {
      reply[event.target.dataset.stageReplyLineProp] = event.target.value;
      renderStages();
      render();
    }
    return;
  }
  if (event.target.matches("[data-stage-text-flag]")) {
    const entry = stageTextFromElement(event.target);
    if (entry) {
      entry.flags = stageTextFlagsFromEditor(event.target.closest(".stage-text-flags"));
      renderStages();
      render();
    }
    return;
  }
  if (event.target.matches("[data-stage-reply-line-flag]")) {
    const reply = stageReplyLineFromElement(event.target);
    if (reply) {
      reply.flags = stageReplyLineFlagsFromEditor(event.target.closest(".stage-reply-line-flags"));
      renderStages();
      render();
    }
    return;
  }
  if (event.target.matches("[data-stage-text-change-flag-set], [data-stage-text-change-flag-clear]")) {
    const entry = stageTextFromElement(event.target);
    if (entry) {
      entry.changeFlags = stageTextChangeFlagsFromEditor(event.target.closest(".stage-text-change-flags"));
      renderStages();
      render();
    }
    return;
  }
  if (event.target.matches("[data-goal-change-flag-set], [data-goal-change-flag-clear]")) {
    const goal = goalChangeFlagsFromElement(event.target);
    if (goal) {
      goal.changeFlags = goalChangeFlagsFromEditor(event.target.closest(".goal-change-flags"));
      renderStages();
      render();
    }
    return;
  }
  if (event.target.matches("[data-stage-reply-extra-keyword]")) {
    const entry = stageTextFromElement(event.target);
    if (entry) {
      syncStageReplyExtraKeywords(entry, event.target.closest(".stage-auto-flags"));
      renderStages();
      render();
    }
    return;
  }
  if (event.target.matches("[data-stage-reply-extra-questor]")) {
    const entry = stageTextFromElement(event.target);
    if (entry) {
      syncStageReplyExtraQuestors(entry, event.target.closest(".stage-auto-flags"));
      renderStages();
      render();
    }
    return;
  }
  if (event.target.matches("[data-stage-reply-extra-stage]")) {
    const entry = stageTextFromElement(event.target);
    if (entry) {
      syncStageReplyExtraStages(entry, event.target.closest(".stage-auto-flags"));
      renderStages();
      render();
    }
    return;
  }
  if (event.target.matches("[data-stage-keyword-extra-questor]")) {
    const entry = stageTextFromElement(event.target);
    if (entry) {
      syncStageKeywordExtraQuestors(entry, event.target.closest(".stage-auto-flags"));
      renderStages();
      render();
    }
    return;
  }
  if (event.target.matches("[data-stage-keyword-extra-stage]")) {
    const entry = stageTextFromElement(event.target);
    if (entry) {
      syncStageKeywordExtraStages(entry, event.target.closest(".stage-auto-flags"));
      renderStages();
      render();
    }
    return;
  }
  if (event.target.matches("[data-stage-dungeon-enabled]")) {
    stage.spawns.dungeon.enabled = event.target.checked;
    stage.spawns.dungeon.missingDl = false;
    renderStages();
    render();
    return;
  }
  if (event.target.matches("[data-stage-dungeon-prop]")) {
    setDungeonValue(stage.spawns.dungeon, event.target.dataset.stageDungeonProp, event.target.value);
    stage.spawns.dungeon.missingDl = false;
    renderStages();
    render();
    return;
  }
  if (event.target.matches("[data-stage-item-prop]")) {
    const item = stageQuestItemFromElement(event.target);
    if (item) {
      setQuestItemValue(item, event.target.dataset.stageItemProp, event.target.value);
      item.missingBl = false;
      if (event.target.dataset.stageItemProp === "delivery") {
        renderStages();
      }
      render();
    }
    return;
  }
  if (event.target.matches("[data-stage-feature-prop]")) {
    const feature = stageFeatureFromElement(event.target);
    if (!feature) {
      return;
    }
    const property = event.target.dataset.stageFeatureProp;
    feature[property] = event.target.value;
    if (property === "source") {
      if (event.target.value === "questor") {
        feature.questor = /^\d+$/.test(feature.questor) && feature.questor !== "255" ? feature.questor : "0";
        feature.questItem = "255";
        feature.questItemRef = "";
      } else if (event.target.value === "questItem") {
        feature.questor = "255";
        feature.questItemRef = stage.spawns.questItems[0]?.uiId || "";
      } else if (event.target.value === "specific") {
        feature.questor = "255";
        feature.questItem = "255";
        feature.questItemRef = "";
      }
      renderStages();
    }
    render();
    return;
  }
  if (event.target.matches("[data-stage-auto-enabled]")) {
    stage.setup.automatic.enabled = event.target.checked;
    renderStages();
    render();
    return;
  }
  if (event.target.matches("[data-stage-genocide-enabled]")) {
    stage.setup.automatic.genocideEnabled = event.target.checked;
    if (!event.target.checked) {
      stage.setup.automatic.wx = "-1";
      stage.setup.automatic.wy = "0";
      stage.setup.automatic.wz = "0";
    } else if (stage.setup.automatic.wx === "-1") {
      stage.setup.automatic.wx = "0";
    }
    renderStages();
    render();
    return;
  }
  if (event.target.matches("[data-stage-flag]")) {
    stage.setup.automatic.flags = automaticFlagsFromEditor();
    render();
    return;
  }
  if (event.target.matches("[data-stage-auto]")) {
    stage.setup.automatic[event.target.dataset.stageAuto] = event.target.value;
    if (event.target.dataset.stageAuto === "changeMode") {
      if (event.target.value === "exact" &&
          (!/^\d+$/.test(stage.setup.automatic.changeStage) || Number(stage.setup.automatic.changeStage) > 49)) {
        stage.setup.automatic.changeStage = stage.id;
      }
      renderStages();
    }
    render();
    return;
  }
  if (!event.target.matches("[data-stage-id-input]")) {
    return;
  }
  const nextId = String(Number(event.target.value));
  if (!/^\d+$/.test(event.target.value) || Number(nextId) < 0 || Number(nextId) > 49 || stages[nextId]) {
    renderStageEditor();
    render();
    return;
  }
  const previousId = selectedStageId;
  delete stages[previousId];
  stage.id = nextId;
  stages[nextId] = stage;
  stageOrder[stageOrder.indexOf(previousId)] = nextId;
  selectedStageId = nextId;
  renderStages();
  render();
});

stageEditor?.addEventListener("focusin", (event) => {
  if (event.target.matches("[data-stage-feature-search]")) {
    renderStageFeatureSuggestions(event.target);
  }
  if (event.target.matches("[data-stage-item-map-search]")) {
    renderStageItemMapSuggestions(event.target);
  }
  if (event.target.matches("[data-stage-dungeon-map-search]")) {
    renderStageDungeonMapSuggestions(event.target);
  }
  if (event.target.matches("[data-stage-morph-record-search]")) {
    renderStageMorphRecordSuggestions(event.target);
  }
  if (event.target.matches("[data-kill-record-search]")) {
    renderKillRecordSuggestions(event.target);
  }
  if (event.target.matches("[data-retrieve-item-search]")) {
    renderRetrieveItemSuggestions(event.target);
  }
  if (event.target.matches("[data-retrieve-value-record-search]")) {
    renderRetrieveValueRecordSuggestions(event.target);
  }
  if (event.target.matches("[data-stage-reward-item-search]")) {
    renderStageRewardItemSuggestions(event.target);
  }
  if (event.target.matches("[data-stage-reward-record-search]")) {
    renderStageRewardRecordSuggestions(event.target);
  }
  if (event.target.matches("[data-goal-target-map-search]")) {
    renderGoalTargetMapSuggestions(event.target);
  }
  if (event.target.matches("[data-delivery-map-search]")) {
    renderDeliveryMapSuggestions(event.target);
  }
});

addStageButton?.addEventListener("click", () => {
  const id = nextAvailableStageId();
  if (id === null) {
    return;
  }
  stages[id] = createStage(id);
  stageOrder.push(id);
  selectedStageId = id;
  renderStages();
  render();
});

duplicateStageButton?.addEventListener("click", () => {
  const source = stages[selectedStageId];
  const id = nextAvailableStageId();
  if (!source || id === null) {
    return;
  }
  stages[id] = JSON.parse(JSON.stringify(source));
  stages[id].id = id;
  stages[id].label = source.label ? `${source.label} copy` : "";
  stageOrder.splice(stageOrder.indexOf(selectedStageId) + 1, 0, id);
  selectedStageId = id;
  renderStages();
  render();
});

moveStageUpButton?.addEventListener("click", () => {
  const index = stageOrder.indexOf(selectedStageId);
  if (index <= 0) {
    return;
  }
  [stageOrder[index - 1], stageOrder[index]] = [stageOrder[index], stageOrder[index - 1]];
  renderStages();
});

moveStageDownButton?.addEventListener("click", () => {
  const index = stageOrder.indexOf(selectedStageId);
  if (index < 0 || index >= stageOrder.length - 1) {
    return;
  }
  [stageOrder[index], stageOrder[index + 1]] = [stageOrder[index + 1], stageOrder[index]];
  renderStages();
});

removeStageButton?.addEventListener("click", () => {
  if (selectedStageId === "0" || !stages[selectedStageId]) {
    return;
  }
  const index = stageOrder.indexOf(selectedStageId);
  delete stages[selectedStageId];
  stageOrder.splice(index, 1);
  selectedStageId = stageOrder[Math.max(0, index - 1)] || "0";
  renderStages();
  render();
});

questorEditor?.addEventListener("input", (event) => {
  const questor = questors[selectedQuestorIndex];
  if (!questor) {
    return;
  }

  if (event.target.matches("[data-questor-item-search]")) {
    renderQuestorItemSuggestions(event.target);
    return;
  }

  if (event.target.matches("[data-questor-record-search]")) {
    renderQuestorRecordSuggestions(event.target);
    return;
  }

  if (event.target.matches("[data-qprop]")) {
    setQuestorValue(questor, event.target.dataset.qprop, event.target.value);
    if (event.target.dataset.qprop === "type") {
      renderQuestors();
      render();
      return;
    }
    if (event.target.dataset.qprop === "name") {
      renderQuestorList();
    }
    render();
  }
});

questorEditor?.addEventListener("change", (event) => {
  const questor = questors[selectedQuestorIndex];
  if (!questor) {
    return;
  }

  if (event.target.matches("[data-qmask-option]")) {
    syncQuestorMaskFromEditor(questor, event.target.dataset.qpath || "");
    renderQuestors();
    render();
    return;
  }

  if (event.target.matches("[data-dungeon-id]")) {
    syncDungeonIdsFromEditor(questor);
    renderQuestors();
    render();
    return;
  }

  if (event.target.matches("[data-nameflag]")) {
    syncNameflagsFromEditor(questor);
    const fieldWrapper = event.target.closest(".nameflags-field");
    const currentMask = numericMask(questor.nameflags);
    const summary = fieldWrapper?.querySelector("[data-nameflags-toggle] span:first-child");
    const note = fieldWrapper?.querySelector(".field-note:not(.warning-note)");
    if (summary) {
      summary.textContent = nameflagsSummary(currentMask);
    }
    if (note) {
      note.textContent = `Mask: ${currentMask}. Values are added together, for example male + pseudo-unique = 5.`;
    }
    fieldWrapper?.querySelector(".warning-note")?.remove();
    render();
    return;
  }

  if (event.target.matches("[data-qprop]")) {
    setQuestorValue(questor, event.target.dataset.qprop, event.target.value);
    renderQuestors();
    render();
  }

  if (event.target.matches("[data-qbool]")) {
    setQuestorValue(questor, event.target.dataset.qbool, event.target.checked);
    renderQuestors();
    render();
  }
});

questorEditor?.addEventListener("click", (event) => {
  const questor = questors[selectedQuestorIndex];
  if (!questor) {
    return;
  }

  const itemOption = event.target.closest("[data-questor-item-id]");
  if (itemOption) {
    const [tval = "0", sval = "0"] = String(itemOption.dataset.questorItemId || "0:0").split(":");
    setQuestorValue(questor, itemOption.dataset.tvalPath || "object.tval", tval);
    setQuestorValue(questor, itemOption.dataset.svalPath || "object.sval", sval);
    renderQuestors();
    render();
    return;
  }

  const clearItem = event.target.closest("[data-clear-questor-item]");
  if (clearItem) {
    setQuestorValue(questor, clearItem.dataset.tvalPath || "object.tval", "0");
    setQuestorValue(questor, clearItem.dataset.svalPath || "object.sval", "0");
    renderQuestors();
    render();
    return;
  }

  const recordOption = event.target.closest("[data-questor-record-id]");
  if (recordOption) {
    setQuestorValue(questor, recordOption.dataset.qpath || "", recordOption.dataset.questorRecordId || "0");
    renderQuestors();
    render();
    return;
  }

  const clearRecord = event.target.closest("[data-clear-questor-record]");
  if (clearRecord) {
    setQuestorValue(questor, clearRecord.dataset.qpath || "", clearRecord.dataset.emptyValue || "0");
    renderQuestors();
    render();
    return;
  }

  const maskToggle = event.target.closest("[data-qmask-toggle]");
  if (maskToggle) {
    const picker = maskToggle.closest(".nameflags-picker");
    const open = !picker?.classList.contains("is-open");
    questorEditor.querySelectorAll(".nameflags-picker").forEach((otherPicker) => {
      otherPicker.classList.remove("is-open");
      otherPicker.querySelector("[data-nameflags-toggle]")?.setAttribute("aria-expanded", "false");
      otherPicker.querySelector("[data-qmask-toggle]")?.setAttribute("aria-expanded", "false");
      otherPicker.querySelector("[data-dungeon-toggle]")?.setAttribute("aria-expanded", "false");
    });
    picker?.classList.toggle("is-open", open);
    maskToggle.setAttribute("aria-expanded", String(open));
    return;
  }

  const dungeonToggle = event.target.closest("[data-dungeon-toggle]");
  if (dungeonToggle) {
    const picker = dungeonToggle.closest(".nameflags-picker");
    const open = !picker?.classList.contains("is-open");
    questorEditor.querySelectorAll(".nameflags-picker").forEach((otherPicker) => {
      otherPicker.classList.remove("is-open");
      otherPicker.querySelector("[data-nameflags-toggle]")?.setAttribute("aria-expanded", "false");
      otherPicker.querySelector("[data-qmask-toggle]")?.setAttribute("aria-expanded", "false");
      otherPicker.querySelector("[data-dungeon-toggle]")?.setAttribute("aria-expanded", "false");
    });
    picker?.classList.toggle("is-open", open);
    dungeonToggle.setAttribute("aria-expanded", String(open));
    return;
  }

  const toggle = event.target.closest("[data-nameflags-toggle]");
  if (!toggle) {
    return;
  }

  const picker = toggle.closest(".nameflags-picker");
  const open = !picker?.classList.contains("is-open");
  questorEditor.querySelectorAll(".nameflags-picker").forEach((otherPicker) => {
    otherPicker.classList.remove("is-open");
    otherPicker.querySelector("[data-nameflags-toggle]")?.setAttribute("aria-expanded", "false");
    otherPicker.querySelector("[data-qmask-toggle]")?.setAttribute("aria-expanded", "false");
    otherPicker.querySelector("[data-dungeon-toggle]")?.setAttribute("aria-expanded", "false");
  });
  picker?.classList.toggle("is-open", open);
  toggle.setAttribute("aria-expanded", String(open));
});

questorEditor?.addEventListener("focusin", (event) => {
  if (event.target.matches("[data-questor-item-search]")) {
    renderQuestorItemSuggestions(event.target);
  }

  if (event.target.matches("[data-questor-record-search]")) {
    renderQuestorRecordSuggestions(event.target);
  }
});

questorEditor?.addEventListener("keyup", (event) => {
  if (event.target.matches("[data-questor-item-search]")) {
    renderQuestorItemSuggestions(event.target);
  }

  if (event.target.matches("[data-questor-record-search]")) {
    renderQuestorRecordSuggestions(event.target);
  }
});

addQuestorButton?.addEventListener("click", () => {
  questors.push(defaultQuestor());
  selectedQuestorIndex = questors.length - 1;
  renderQuestors();
  render();
});

duplicateQuestorButton?.addEventListener("click", () => {
  const questor = questors[selectedQuestorIndex];
  if (!questor || questors.length >= 30) {
    return;
  }

  questors.splice(selectedQuestorIndex + 1, 0, cloneQuestor(questor));
  selectedQuestorIndex += 1;
  renderQuestors();
  render();
});

removeQuestorButton?.addEventListener("click", () => {
  if (questors.length <= 1) {
    questors = [];
    selectedQuestorIndex = 0;
  } else {
    questors.splice(selectedQuestorIndex, 1);
    selectedQuestorIndex = Math.max(0, selectedQuestorIndex - 1);
  }
  renderQuestors();
  render();
});

document.addEventListener("click", (event) => {
  if (
    !monsterformSuggestions ||
    !monsterformSearch ||
    monsterformSuggestions.contains(event.target) ||
    monsterformSearch.contains(event.target)
  ) {
    return;
  }

  monsterformSuggestions.innerHTML = "";
  monsterformSuggestions.classList.remove("is-open");
  monsterformSuggestions.style.display = "";
});

document.addEventListener("click", (event) => {
  if (
    questorEditor?.contains(event.target) &&
    event.target.closest(".questor-record-field")
  ) {
    return;
  }

  closeQuestorRecordSuggestions();
});

document.addEventListener("click", (event) => {
  const toggle = event.target.closest("#racesToggle, #classesToggle");
  if (!toggle) {
    return;
  }

  const config = maskPickers.find((item) => item.toggle === toggle);
  if (!config?.picker) {
    return;
  }

  const open = !config.picker.classList.contains("is-open");
  for (const otherConfig of maskPickers) {
    otherConfig.picker?.classList.remove("is-open");
    otherConfig.toggle?.setAttribute("aria-expanded", "false");
  }

  config.picker.classList.toggle("is-open", open);
  toggle.setAttribute("aria-expanded", String(open));
});

document.addEventListener("change", (event) => {
  if (!event.target.matches("#racesPanel input[type='checkbox'], #classesPanel input[type='checkbox']")) {
    return;
  }

  const config = maskPickers.find((item) => item.panel?.contains(event.target));
  if (!config) {
    return;
  }

  syncMaskPicker(config, event.target);
  render();
});

document.addEventListener("click", (event) => {
  for (const config of maskPickers) {
    if (!config.picker || config.picker.contains(event.target)) {
      continue;
    }

    config.picker.classList.remove("is-open");
    config.toggle?.setAttribute("aria-expanded", "false");
  }

  questorEditor?.querySelectorAll(".nameflags-picker").forEach((picker) => {
    if (picker.contains(event.target)) {
      return;
    }

    picker.classList.remove("is-open");
    picker.querySelector("[data-nameflags-toggle]")?.setAttribute("aria-expanded", "false");
    picker.querySelector("[data-qmask-toggle]")?.setAttribute("aria-expanded", "false");
    picker.querySelector("[data-dungeon-toggle]")?.setAttribute("aria-expanded", "false");
  });

  stageEditor?.querySelectorAll("[data-stage-item-mask-toggle]").forEach((toggle) => {
    const picker = toggle.closest(".option-picker");
    if (picker?.contains(event.target)) {
      return;
    }
    picker?.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  });

  stageEditor?.querySelectorAll("[data-stage-dungeon-mask-toggle]").forEach((toggle) => {
    const picker = toggle.closest(".option-picker");
    if (picker?.contains(event.target)) {
      return;
    }
    picker?.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  });

  stageEditor?.querySelectorAll("[data-stage-monster-mask-toggle]").forEach((toggle) => {
    const picker = toggle.closest(".option-picker");
    if (picker?.contains(event.target)) {
      return;
    }
    picker?.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  });

  if (!event.target.closest("[data-stage-item-map-search]") &&
      !event.target.closest("[data-stage-item-map-suggestions]")) {
    closeStageItemMapSuggestions();
  }

  if (!event.target.closest("[data-stage-dungeon-map-search]") &&
      !event.target.closest("[data-stage-dungeon-map-suggestions]")) {
    closeStageDungeonMapSuggestions();
  }

  if (!event.target.closest("[data-stage-monster-record-search]") &&
      !event.target.closest("[data-stage-monster-record-suggestions]") &&
      !event.target.closest("[data-stage-monster-map-search]") &&
      !event.target.closest("[data-stage-monster-map-suggestions]")) {
    closeStageMonsterSuggestions();
  }

  if (!event.target.closest("[data-kill-record-search]") &&
      !event.target.closest("[data-kill-record-suggestions]")) {
    closeKillRecordSuggestions();
  }

  if (!event.target.closest("[data-retrieve-item-search]") &&
      !event.target.closest("[data-retrieve-item-suggestions]") &&
      !event.target.closest("[data-retrieve-value-record-search]") &&
      !event.target.closest("[data-retrieve-value-record-suggestions]")) {
    closeRetrieveSuggestions();
  }

  if (!event.target.closest("[data-stage-reward-item-search]") &&
      !event.target.closest("[data-stage-reward-item-suggestions]") &&
      !event.target.closest("[data-stage-reward-record-search]") &&
      !event.target.closest("[data-stage-reward-record-suggestions]")) {
    closeStageRewardSuggestions();
  }

  if (!event.target.closest("[data-goal-target-map-search]") &&
      !event.target.closest("[data-goal-target-map-suggestions]")) {
    closeGoalTargetMapSuggestions();
  }

  if (!event.target.closest("[data-delivery-map-search]") &&
      !event.target.closest("[data-delivery-map-suggestions]")) {
    closeDeliveryMapSuggestions();
  }

  stageEditor?.querySelectorAll("[data-stage-morph-nameflags-toggle]").forEach((toggle) => {
    const picker = toggle.closest(".option-picker");
    if (picker?.contains(event.target)) {
      return;
    }
    picker?.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  });

  if (!event.target.closest("[data-stage-morph-record-search]") &&
      !event.target.closest("[data-stage-morph-record-suggestions]")) {
    closeStageMorphRecordSuggestions();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  for (const config of maskPickers) {
    config.picker?.classList.remove("is-open");
    config.toggle?.setAttribute("aria-expanded", "false");
  }

  questorEditor?.querySelectorAll(".nameflags-picker").forEach((picker) => {
    picker.classList.remove("is-open");
    picker.querySelector("[data-nameflags-toggle]")?.setAttribute("aria-expanded", "false");
    picker.querySelector("[data-qmask-toggle]")?.setAttribute("aria-expanded", "false");
    picker.querySelector("[data-dungeon-toggle]")?.setAttribute("aria-expanded", "false");
  });

  closeQuestorRecordSuggestions();
  stageEditor?.querySelectorAll("[data-stage-item-mask-toggle]").forEach((toggle) => {
    toggle.closest(".option-picker")?.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  });
  stageEditor?.querySelectorAll("[data-stage-dungeon-mask-toggle]").forEach((toggle) => {
    toggle.closest(".option-picker")?.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  });
  stageEditor?.querySelectorAll("[data-stage-monster-mask-toggle]").forEach((toggle) => {
    toggle.closest(".option-picker")?.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  });
  closeStageItemMapSuggestions();
  closeStageDungeonMapSuggestions();
  closeStageMonsterSuggestions();
  stageEditor?.querySelectorAll("[data-stage-morph-nameflags-toggle]").forEach((toggle) => {
    toggle.closest(".option-picker")?.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  });
  closeStageMorphRecordSuggestions();
});

toggleQuestList?.addEventListener("click", () => {
  const folded = !questListPanel.classList.contains("is-folded");
  questListPanel.classList.toggle("is-folded", folded);
  appLayout.classList.toggle("quest-list-folded", folded);
  toggleQuestList.textContent = folded ? ">" : "<";
  toggleQuestList.title = folded ? "Show quest list" : "Fold quest list";
  toggleQuestList.setAttribute("aria-expanded", String(!folded));
});

togglePreview?.addEventListener("click", () => {
  const folded = !previewPanel.classList.contains("is-folded");
  previewPanel.classList.toggle("is-folded", folded);
  appLayout.classList.toggle("preview-folded", folded);
  togglePreview.classList.toggle("is-active", !folded);
  togglePreview.title = folded ? "Show generated q_info" : "Hide generated q_info";
  togglePreview.setAttribute("aria-expanded", String(!folded));
});

function setEditorTab(tabName) {
  const nextTab = editorTabs.some((tab) => tab.dataset.editorTab === tabName)
    ? tabName
    : "quest";

  editorTabs.forEach((tab) => {
    const active = tab.dataset.editorTab === nextTab;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
  });

  editorTabPanels.forEach((panel) => {
    panel.hidden = panel.dataset.editorTabPanel !== nextTab;
  });
}

editorTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    setEditorTab(tab.dataset.editorTab || "quest");
  });
});

setEditorTab("quest");

questListBody?.addEventListener("click", (event) => {
  const button = event.target.closest(".quest-list-item");
  if (!button) {
    return;
  }

  const quest = questHeaders[Number(button.dataset.questRow)];
  if (quest) {
    loadQuest(quest, button);
  }
});

loadQuestFileButton?.addEventListener("click", () => {
  questFileInput?.click();
});

questFileInput?.addEventListener("change", async () => {
  const file = questFileInput.files?.[0];
  if (!file) {
    return;
  }

  try {
    const text = await file.text();
    const importedQuests = parseQuestInfoText(text);
    if (importedQuests.length === 0) {
      throw new Error("No N: quest header lines were found.");
    }

    questHeaders = importedQuests;
    renderQuestList(questHeaders);
    resetEditorState();
    setQuestImportStatus(`Loaded ${importedQuests.length} quests from ${file.name}.`, "success");
  } catch (error) {
    console.error(error);
    setQuestImportStatus(`Could not load ${file.name}: ${error.message || "invalid q_info.txt"}`, "error");
  } finally {
    questFileInput.value = "";
  }
});

async function initApp() {
  let dataLoadFailed = false;
  try {
    [gameData, questHeaders] = await Promise.all([
      loadJson("public/data/game-data.json"),
      loadJson("public/data/quests.json"),
    ]);
  } catch (error) {
    console.error(error);
    dataLoadFailed = true;
    gameData = {};
    questHeaders = [];
    if (questListBody) {
      questListBody.innerHTML = '<p class="empty-note">Unable to load generated JSON data. Run tools/build-data.php first.</p>';
    }
  }

  lookups = buildLookups(gameData);
  renderDatalists();
  renderMaskPickerOptions();
  setQuestImportStatus("");
  if (!dataLoadFailed) {
    renderQuestList(questHeaders);
  } else if (questListCount) {
    questListCount.textContent = "0";
  }
  hydrateSearchFields();
  resetEditorState();
}

initApp();
