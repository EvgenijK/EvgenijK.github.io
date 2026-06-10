(function (global) {
  const COLORS_HEX = {
    d: "#000000", D: "#747474", s: "#9D9D9D", W: "#D7D7D7", w: "#FFF",
    b: "#0000FF", g: "#009D44", r: "#D70000", u: "#8D6600", y: "#FFFF00",
    B: "#00FFFF", G: "#00FF00", R: "#FF0000", U: "#C79D55", o: "#FF8D00",
    v: "#AF00FF", a: "#AF00FF", I: "#AF00FF", f: "#D70000", p: "#00FF00",
    M: "#FFF", L: "#FFFF00", c: "#FFF", e: "#00FFFF", Z: "#D70000",
    K: "#009D44", C: "#C79D55", q: "#9D9D9D", A: "#747474", S: "#FFFF00",
    k: "#D70000",
  };

  const COLORS_NAME = {
    d: "black", D: "dark", s: "slate", W: "white", w: "bright white",
    b: "blue", g: "green", r: "red", u: "umber", y: "yellow",
    B: "light blue", G: "light green", R: "light red", U: "light umber",
    o: "orange", v: "violet", a: "acidic", I: "invulnerability", f: "fiery",
    p: "poisony", M: "manashieldy", L: "lite", c: "cold", e: "electric",
    Z: "ember", K: "unbreath", C: "confusion", q: "inertia", A: "darkness",
    S: "sound", k: "nuke",
  };

  const MONSTER_TYPES = ["None", "Base", "Zangband", "Cthulhu", "Joke", "Pern", "Blue"];
  const MONSTER_TYPE_COLORS = ["#FFF", "#B7FFB4", "#FFFFB4", "#B4FFF6", "#FFE6B4", "#FFB4E0", "#B4B9FF"];
  const TYPE_BITS = { base: 0x01, zang: 0x02, cthulhu: 0x04, joke: 0x08, pern: 0x10, blue: 0x20, none: 0x40 };

  const RESISTANCES = {
    fire: { resistance: "RES_FIRE", immunity: "IM_FIRE", breath: "BR_FIRE", susceptibility: "SUSCEP_FIRE", immunitySpells: ["BR_PLAS"], extraSpells: ["BR_LITE"], attackEffects: ["FIRE", "LITE"], aliases: ["fire"], color: "#D70000" },
    electricity: { resistance: "RES_ELEC", immunity: "IM_ELEC", breath: "BR_ELEC", susceptibility: "SUSCEP_ELEC", extraSpells: ["BR_PLAS"], attackEffects: ["ELEC"], aliases: ["electricity", "electric", "elec"], color: "#0077CC" },
    cold: { resistance: "RES_COLD", immunity: "IM_COLD", breath: "BR_COLD", susceptibility: "SUSCEP_COLD", extraSpells: ["BR_ICE"], attackEffects: ["COLD"], aliases: ["cold"], color: "#00A7C7" },
    acid: { resistance: "RES_ACID", immunity: "IM_ACID", breath: "BR_ACID", susceptibility: "SUSCEP_ACID", extraFlags: ["HURT_ROCK"], extraSpells: ["BR_SHAR", "BR_NUKE"], attackEffects: ["ACID"], aliases: ["acid"], color: "#009D44" },
    poison: { resistance: "RES_POIS", immunity: "IM_POIS", breath: "BR_POIS", immunityFlags: ["UNDEAD", "NONLIVING"], immunitySymbolRules: [{ symbol: "E" }, { symbol: "A" }], extraSpells: ["BR_NUKE"], attackEffects: ["POISON", "DISEASE", "PARASITE"], symbolRules: [{ flag: "DEMON", symbol: "U" }], aliases: ["poison", "pois"], color: "#00A000" },
    light: { resistance: "RES_LITE", immunity: null, breath: "BR_LITE", susceptibility: "HURT_LITE", extraFlags: ["REFLECTING"], extraSpells: ["BR_ELEC", "BR_FIRE"], attackEffects: ["LITE"], symbolRules: [{ symbol: "A", notNameContains: "Fallen" }], conditionalAttackImmunity: [{ effect: "ELEC", immunity: "IM_ELEC" }, { effect: "FIRE", immunity: "IM_FIRE" }], aliases: ["light", "lite"], color: "#A08000" },
    darkness: { resistance: "RES_DARK", immunity: null, breath: "BR_DARK", extraFlags: ["UNDEAD", "ORC"], aliases: ["darkness", "dark"], color: "#555555" },
    nexus: { resistance: "RES_NEXU", immunity: null, breath: "BR_NEXU", aliases: ["nexus", "nexu"], color: "#AF00FF" },
    nether: { resistance: "RES_NETH", immunity: null, breath: "BR_NETH", immunityFlags: ["UNDEAD"], aliases: ["nether", "neth"], color: "#6D3377" },
    chaos: { resistance: "RES_CHAOS", immunity: null, breath: "BR_CHAO", symbolRules: [{ flag: "DEMON", symbol: "U" }], aliases: ["chaos", "chao"], color: "#D00080" },
    mana: { resistance: "RES_MANA", immunity: null, breath: "BR_MANA", aliases: ["mana"], color: "#005AD7" },
    water: { resistance: "RES_WATE", immunity: "IM_WATER", breath: "BR_WATE", aliases: ["water", "wate"], color: "#0088AA" },
    time: { resistance: "RES_TIME", immunity: null, breath: "BR_TIME", extraFlags: ["UNDEAD"], attackEffects: ["TIME"], symbolRules: [{ flag: "DEMON", symbol: "U" }, { symbol: "A" }], aliases: ["time"], color: "#8D6600" },
    sound: { resistance: "RES_SOUND", immunity: null, breath: "BR_SOUN", extraSpells: ["BR_PLAS", "BR_WALL", "BR_ELEC"], conditionalAttackImmunity: [{ effect: "ELEC", immunity: "IM_ELEC" }], aliases: ["sound", "soun"], color: "#B08000" },
    shards: { resistance: "RES_SHARDS", immunity: null, breath: "BR_SHAR", extraFlags: ["HURT_ROCK"], extraSpells: ["BR_ICE"], aliases: ["shards", "shard", "shar"], color: "#747474" },
    disenchantment: { resistance: "RES_DISE", immunity: null, breath: "BR_DISE", attackEffects: ["UN_BONUS"], aliases: ["disenchantment", "disenchant", "dise"], color: "#8A2BE2" },
  };

  function loadData() {
    if (!global.TOMENET_MONSTER_DATA) {
      throw new Error("Monster data was not loaded. Check that data/monsters.js exists and is included before page scripts.");
    }
    return global.TOMENET_MONSTER_DATA;
  }

  function countHp(monster) {
    const parts = monster.hp.split("d").map(Number);
    return monster.flags.includes("FORCE_MAXHP") ? parts[0] * parts[1] : parts[0] * (parts[1] + 1) / 2;
  }

  function displayHp(monster) {
    return `${monster.flags.includes("FORCE_MAXHP") ? "" : "~"}${countHp(monster)}`;
  }

  function normalizeResistance(name) {
    const value = name.trim().toLowerCase();
    return Object.keys(RESISTANCES).find((key) => RESISTANCES[key].aliases.includes(value)) || null;
  }

  function intersects(values, expected = []) {
    return expected.some((value) => values.includes(value));
  }

  function hasAttackEffect(monster, effects = []) {
    return monster.attacks.some((attack) => effects.includes(attack.effect.toUpperCase().replace(/^RBE_/, "")));
  }

  function matchesSymbolRule(monster, rule) {
    return monster.symbol === rule.symbol
      && (!rule.flag || monster.flags.includes(rule.flag))
      && (!rule.notNameContains || !monster.name.toLowerCase().includes(rule.notNameContains.toLowerCase()));
  }

  function resistanceStatus(monster, resistance) {
    const def = RESISTANCES[resistance];
    if (!def) return "No";
    if ((def.immunity && monster.flags.includes(def.immunity))
      || intersects(monster.flags, def.immunityFlags)
      || intersects(monster.spells, def.immunitySpells)
      || (def.immunitySymbolRules || []).some((rule) => matchesSymbolRule(monster, rule))) return "Immunity";
    if (def.susceptibility && monster.flags.includes(def.susceptibility)) return "Susceptible";
    if (monster.flags.includes(def.resistance) || monster.spells.includes(def.breath)
      || intersects(monster.flags, def.extraFlags)
      || intersects(monster.spells, def.extraSpells)
      || hasAttackEffect(monster, def.attackEffects)
      || (def.symbolRules || []).some((rule) => matchesSymbolRule(monster, rule))
      || (def.conditionalAttackImmunity || []).some((rule) => monster.flags.includes(rule.immunity) && hasAttackEffect(monster, [rule.effect]))) return "Yes";
    return "No";
  }

  function hasResistance(monster, resistance) {
    return ["Yes", "Immunity"].includes(resistanceStatus(monster, resistance));
  }

  function renderError(container, error) {
    container.innerHTML = "";
    const paragraph = document.createElement("p");
    paragraph.className = "error";
    paragraph.textContent = error instanceof Error ? error.message : error;
    container.append(paragraph);
  }

  function makeSymbol(monster) {
    const symbol = document.createElement("span");
    symbol.className = "symbol";
    symbol.style.color = COLORS_HEX[monster.color] || "#FFF";
    symbol.textContent = monster.symbol;
    return symbol;
  }

  function makeValueGrid(values) {
    const grid = document.createElement("div");
    grid.className = "value-grid";
    values.forEach((value) => {
      const item = document.createElement("div");
      item.textContent = value;
      grid.append(item);
    });
    return grid;
  }

  global.TomeNET = {
    COLORS_HEX,
    COLORS_NAME,
    MONSTER_TYPES,
    MONSTER_TYPE_COLORS,
    TYPE_BITS,
    RESISTANCES,
    loadData,
    countHp,
    displayHp,
    normalizeResistance,
    resistanceStatus,
    hasResistance,
    renderError,
    makeSymbol,
    makeValueGrid,
  };
}(window));
