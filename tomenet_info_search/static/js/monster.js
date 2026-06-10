(function (app) {
  const container = document.querySelector("#monster");

  function header(text) {
    const span = document.createElement("span");
    span.className = "header";
    span.textContent = text;
    return span;
  }

  function line(...parts) {
    const element = document.createElement("div");
    parts.forEach((part) => element.append(typeof part === "string" ? document.createTextNode(part) : part));
    return element;
  }

  function symbolInfo(monster) {
    if (monster.flags.includes("SHAPECHANGER")) return "shapechanger";
    if (monster.flags.includes("CHAR_CLEAR")) return "absorbs symbol";
    return `Symbol ${monster.symbol}`;
  }

  function colorInfo(monster) {
    if (monster.flags.includes("ATTR_MULTI") && monster.flags.includes("ATTR_ANY")) return "truly multi-colored";
    if (monster.flags.includes("ATTR_MULTI")) return `multi-colored ${monster.color}`;
    if (monster.flags.includes("ATTR_CLEAR")) return "absorbs color";
    return `Color ${monster.color} (${app.COLORS_NAME[monster.color] || "unknown"})`;
  }

  function renderMonster(monster) {
    document.title = `${monster.name} | TomeNET monster search`;
    container.innerHTML = "";
    const title = document.createElement("h1");
    title.textContent = monster.name;
    container.append(title);
    const symbol = app.makeSymbol(monster);
    container.append(
      line(header("Id: "), `${monster.number} `, header("Name: "), `${monster.name} `, symbol, ` (${symbolInfo(monster)}, ${colorInfo(monster)})`),
      line(header("Description: "), monster.description),
      line(header("Type: "), `${app.MONSTER_TYPES[monster.type]} `, header("Unique: "), monster.flags.includes("UNIQUE") ? "Yes" : "No"),
      line(header("HP: "), `${app.displayHp(monster)} (${monster.hp}) `, header("AC: "), `${monster.ac} `, header("Experience: "), `${monster.exp} `, header("Speed: "), `${monster.speed}`),
      line(header("Depth: "), `${monster.depth} (${monster.depth * 50}ft) `, header("Rarity: "), `${monster.rarity} `, header("Vision: "), `${monster.vision} `, header("Alertness: "), `${monster.alertness}`),
      line(header("Body:")),
      app.makeValueGrid([`Weight: ${monster.weight}`, `Weapons: ${monster.weapons}`, `Torso: ${monster.torso}`, `Arm: ${monster.arms}`, `Finger: ${monster.finger}`, `Head: ${monster.head}`, `Leg: ${monster.leg}`]),
      line(header("Objects:")),
      app.makeValueGrid([`Treasure: ${monster.treasure}`, `Combat: ${monster.combat}`, `Magic: ${monster.magic}`, `Tool: ${monster.tool}`]),
      line(header("Resistances:")),
    );
    const resistances = document.createElement("div");
    resistances.className = "value-grid resistance-grid";
    Object.entries(app.RESISTANCES).forEach(([name, def]) => {
      const status = app.resistanceStatus(monster, name);
      const item = document.createElement("div");
      const label = header(`${name[0].toUpperCase()}${name.slice(1)}: `);
      label.style.color = status === "No" ? "#B7B7B7" : def.color;
      item.append(label, status);
      resistances.append(item);
    });
    container.append(resistances, line(header("Attack methods:")));
    container.append(app.makeValueGrid(monster.attacks.map((attack) => `${attack.method}: ${attack.effect}${attack.damage ? ` (${attack.damage})` : ""}`)));
    if (monster.spell_chance) container.append(line(header("Spell chance: "), `1 spell every ${monster.spell_chance} turns (1_IN_${monster.spell_chance})`));
    container.append(line(header(`Spells (and breaths, arrows or missiles): (${monster.spells.length})`)), app.makeValueGrid(monster.spells));
    container.append(line(header(`Flags: (${monster.flags.length})`)), app.makeValueGrid(monster.flags));
  }

  try {
    const id = Number(new URLSearchParams(location.search).get("id"));
    const monster = app.loadData().monsters.find((candidate) => candidate.number === id);
    if (!monster) throw new Error("Monster not found.");
    renderMonster(monster);
  } catch (error) {
    app.renderError(container, error);
  }
}(window.TomeNET));
