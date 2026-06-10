(function (app) {
  const form = document.querySelector("#search-form");
  const resultsElement = document.querySelector("#results");
  const statusElement = document.querySelector("#status");

  function words(value) {
    return value.trim().split(/\s+/).filter(Boolean);
  }

  function includesAllText(value, query) {
    const haystack = value.toLowerCase();
    return words(query).every((part) => haystack.includes(part.toLowerCase()));
  }

  function includesTerms(values, query) {
    return words(query).every((term) => term.startsWith("!")
      ? !values.includes(term.slice(1).toUpperCase())
      : values.includes(term.toUpperCase()));
  }

  function inNumericRange(value, minimum, maximum) {
    return (!minimum || value >= Number(minimum)) && (!maximum || value <= Number(maximum));
  }

  function matchesResistances(monster, query, logic) {
    const terms = query.trim().split(/[\s,]+/).filter(Boolean).map((term) => {
      const negated = term.startsWith("!");
      return { name: app.normalizeResistance(negated ? term.slice(1) : term), negated };
    });
    if (!terms.length || terms.some((term) => !term.name)) return false;
    const matches = terms.map((term) => term.negated !== app.hasResistance(monster, term.name));
    return logic === "or" ? matches.some(Boolean) : matches.every(Boolean);
  }

  function filterMonsters(monsters, data) {
    const types = data.getAll("type");
    const typeMask = types.reduce((mask, type) => mask | app.TYPE_BITS[type], 0);
    return monsters.filter((monster) => {
      if (data.get("name") && !includesAllText(monster.name, data.get("name"))) return false;
      if (data.get("char") && monster.symbol !== data.get("char").trim().slice(0, 1)) return false;
      if (data.get("color") && monster.color !== data.get("color").trim().slice(0, 1)) return false;
      if (types.length && !(monster.type_bit & typeMask)) return false;
      if (!inNumericRange(monster.depth, data.get("level_min"), data.get("level_max"))) return false;
      if (!inNumericRange(app.countHp(monster), data.get("hp_min"), data.get("hp_max"))) return false;
      if (!inNumericRange(monster.spell_chance, data.get("spell_chance_min"), data.get("spell_chance_max"))) return false;
      if (data.get("spells") && !includesTerms(monster.spells, data.get("spells"))) return false;
      if (data.get("flags") && !includesTerms(monster.flags, data.get("flags"))) return false;
      if (data.get("resistances") && !matchesResistances(monster, data.get("resistances"), data.get("resistance_logic"))) return false;
      return !data.get("description") || includesAllText(monster.description, data.get("description"));
    });
  }

  function renderResults(monsters) {
    resultsElement.innerHTML = "";
    statusElement.textContent = `Number of results: ${monsters.length}`;
    const grid = document.createElement("div");
    grid.className = "results-grid";
    monsters.forEach((monster) => {
      const row = document.createElement("div");
      row.className = "result";
      row.append(app.makeSymbol(monster));
      const link = document.createElement("a");
      link.href = `monster.html?id=${monster.number}`;
      link.textContent = monster.name;
      link.style.backgroundColor = app.MONSTER_TYPE_COLORS[monster.type];
      row.append(link);
      const level = document.createElement("span");
      level.textContent = monster.depth;
      row.append(level);
      grid.append(row);
    });
    resultsElement.append(grid);
  }

  function populateFormFromUrl() {
    const params = new URLSearchParams(location.search);
    for (const [name, value] of params) {
      const controls = form.elements[name];
      if (!controls) continue;
      if (name === "type") {
        [...controls].forEach((control) => { control.checked = false; });
        params.getAll(name).forEach((type) => {
          const control = form.querySelector(`[name="type"][value="${CSS.escape(type)}"]`);
          if (control) control.checked = true;
        });
      } else if (controls instanceof RadioNodeList) {
        controls.value = value;
      } else {
        controls.value = value;
      }
    }
  }

  let monsters = [];

  function search(updateUrl = true) {
    const data = new FormData(form);
    if (updateUrl) history.replaceState(null, "", `${location.pathname}?${new URLSearchParams(data)}`);
    renderResults(filterMonsters(monsters, data));
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    search();
  });
  form.addEventListener("reset", () => {
    setTimeout(() => {
      history.replaceState(null, "", location.pathname);
      search(false);
    });
  });

  try {
    populateFormFromUrl();
    const data = app.loadData();
    monsters = data.monsters;
    document.querySelector("#data-version").textContent = data.version;
    search(false);
  } catch (error) {
    app.renderError(resultsElement, error);
  }
}(window.TomeNET));
