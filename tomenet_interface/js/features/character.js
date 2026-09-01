(() => {
  window.TomeNetPrototype.createCharacterFeature = ({state,$,$$,persist,formatNumber,experienceRange,PY_MAX_EXP,CHARACTER_DATA,CHARACTER_SOURCES,CHARACTER_SOURCE_EQUIPMENT,CHARACTER_RESIST_GROUPS,CHARACTER_SOURCE_ICONS,TERM_COLORS}) => {
  const CHARACTER_PAGES = ["profile","skills","resists"];
  const CHARACTER_FIELD_ORDER = {
    profile:["race","class","body","trait","mode","str","int","wis","dex","con","chr"],
    skills:["race","class","body","trait","mode","str","int","wis","dex","con","chr","fighting","bows","saving","stealth","perception","searching","disarming","device","blows","shots","infra"],
    resists:[]
  };
  const selectedFields = {profile:"race",skills:"race"};
  const scrollPositions = new WeakMap();
  function fieldAttributes(fieldId,target,baseClass = "") {
    if (!fieldId || target !== "window") return baseClass ? ` class="${baseClass}"` : "";
    const selected = selectedFields[state.characterPage] === fieldId;
    const classes = [baseClass,"character-field",selected ? "is-selected" : ""].filter(Boolean).join(" ");
    return ` class="${classes}" data-character-field="${fieldId}" aria-selected="${selected ? "true" : "false"}"`;
  }
  function characterRows(values,fieldIds = [],target = "panel") {
    return values.map(([label,value,tone="white"]) => label === null
      ? '<div class="character-row-spacer" aria-hidden="true"><dt>&nbsp;</dt><dd></dd></div>'
      : `<div${fieldAttributes(fieldIds.shift(),target)}><dt>${label}</dt><dd class="term-${tone}">${value}</dd></div>`).join("");
  }

  function characterDetailsMarkup() {
    const details = [
      ["Sex",CHARACTER_DATA.sex,"l-blue"],["Age",CHARACTER_DATA.age,"l-blue"],["Height",CHARACTER_DATA.height,"l-blue"],
      ["Weight",CHARACTER_DATA.weight,"l-blue"],["Social Class",CHARACTER_DATA.socialClass,"l-blue"]
    ];
    return `<section class="character-block"><h3>Details</h3><dl class="character-data-grid">${characterRows(details)}</dl></section>`;
  }

  function characterCommonMarkup(target = "panel") {
    const range = experienceRange(state.xpLevel);
    const currentExperience = Math.round(range.start + (range.next - range.start) * state.xpProgress / 100);
    const sanity = state.sanity >= 90 ? "Sound" : state.sanity >= 75 ? "Sane" : state.sanity >= 50 ? "Weird" : state.sanity >= 25 ? "Crazy" : state.sanity >= 10 ? "Insane" : state.sanity > 0 ? "Mad" : "Vegetable";
    const resourceTone = (current,maximum) => current >= maximum ? "l-green" : current > maximum / 10 ? "yellow" : "red";
    const sanityTone = state.sanity >= 75 ? "l-green" : state.sanity >= 50 ? "yellow" : state.sanity >= 25 ? "orange" : state.sanity >= 10 ? "l-red" : "red";
    const levelTone = state.xpLevel < 99 ? "l-green" : state.xpLevel < 100 ? "l-umber" : "blue";
    const experienceTone = currentExperience >= PY_MAX_EXP ? "l-umber" : state.xpDrained ? "yellow" : "l-green";
    const bprLabels = {wraith:"Wraith",wstep:"WStep",pbtrav:"PbTrav"};
    const bprValue = state.bprMode === "numeric" ? state.bpr : bprLabels[state.bprMode];
    const bprTone = state.bprMode === "wraith" ? "l-white" : state.bprMode === "wstep" ? "l-umber" : state.bprMode === "pbtrav" || state.bprBoosted ? "l-blue" : "l-green";
    const overview = [
      ["Body",CHARACTER_DATA.body,"l-blue"],
      ["Trait",CHARACTER_DATA.trait,"l-blue"],
      ["Experience",formatNumber.format(currentExperience),experienceTone],
      ["Max Exp",formatNumber.format(range.next),range.next >= PY_MAX_EXP ? "l-umber" : "l-green"],
      ["Exp to Adv.",formatNumber.format(Math.max(0,range.next-currentExperience)),state.xpLevel >= 99 ? "l-umber" : "l-green"],
      ["Mode",CHARACTER_DATA.mode,"l-blue"],
      ["Status",CHARACTER_DATA.status,CHARACTER_DATA.status === "Alive" ? "l-green" : CHARACTER_DATA.status.includes("WINNER") ? "violet" : CHARACTER_DATA.status.includes("Ghost") ? "red" : "l-dark"],
      ["Gold","952,358","l-green"]
    ];
    const vitalResources = [
      ["HP",`${state.hp} / 1912`,resourceTone(state.hp,1912)],["MP",`${state.mp} / 275`,resourceTone(state.mp,275)],
      ["Sanity",sanity,sanityTone],["Stamina",`${state.st} / 10`,resourceTone(state.st,10)]
    ];
    const melee = CHARACTER_DATA.combat.melee.map(row => row[0] === "Blows / Round" ? [row[0],bprValue,bprTone] : row);
    return `<section class="character-overview" aria-label="Character identity, progress and attributes">
        <div class="character-overview-primary">
          <strong class="character-overview-name term-l-blue">${CHARACTER_DATA.name}</strong>
          <p class="character-overview-meta"><span class="term-white">Level</span> <b class="term-${levelTone}">${state.xpLevel}</b> <i>·</i> <span${fieldAttributes("race",target,"term-l-blue")}>${CHARACTER_DATA.race}</span> <i>·</i> <span${fieldAttributes("class",target,"term-l-blue")}>${CHARACTER_DATA.className}</span></p>
          <dl>${characterRows(overview,["body","trait",null,null,null,"mode",null,null],target)}</dl>
        </div>
        <div class="character-overview-secondary">
          <dl class="character-overview-vitals">${characterRows(vitalResources,[],target)}</dl>
          <dl class="character-overview-stats">${characterRows(CHARACTER_DATA.stats,["str","int","wis","dex","con","chr"],target)}</dl>
        </div>
      </section>
      <section class="character-block character-combat" aria-label="Combat">
        <div class="character-combat-groups">
          <section><h4>Melee</h4><dl>${characterRows(melee,state.characterPage === "skills" ? ["fighting",null,null,"blows",null,null] : [],target)}</dl></section>
          <section><h4>Ranged</h4><dl>${characterRows(CHARACTER_DATA.combat.ranged,state.characterPage === "skills" ? ["bows",null,null,"shots","infra"] : [],target)}</dl></section>
          <section><h4>Other</h4><dl>${characterRows(CHARACTER_DATA.combat.other,state.characterPage === "skills" ? ["stealth","disarming","perception","device","saving","searching"] : [],target)}</dl></section>
        </div>
      </section>`;
  }

  function characterMatrixMark(group, groupIndex, rowIndex, sourceIndex) {
    if (group.kind === "bonus") {
      if (rowIndex >= 13 && (rowIndex + sourceIndex) % 13 === 0) return {mark:"s",type:"sustain",title:"Sustained attribute"};
      let amount = 0;
      if ((rowIndex * 3 + sourceIndex * 5 + groupIndex) % 17 === 0) amount = [4,14,24][(rowIndex + sourceIndex) % 3];
      else if ((rowIndex + sourceIndex * 4) % 29 === 0) amount = sourceIndex % 2 ? -5 : -15;
      else if (sourceIndex === 14 && [0,1,4,10,13,14,16,17].includes(rowIndex)) amount = [3,13,23][rowIndex % 3];
      if (amount) {
        const mark = amount > 29 ? "*" : String(Math.abs(amount) % 10);
        const type = amount >= 20 ? "bonus-high" : amount >= 10 ? "bonus-mid" : amount > 0 ? "bonus-low" : amount <= -10 ? "penalty-high" : "penalty-low";
        return {mark,type,title:`${amount > 0 ? "+" : ""}${amount} numeric bonus`};
      }
      return {mark:".",type:"empty",title:"No bonus"};
    }
    if (group.kind === "flag") {
      if (rowIndex === 3 && sourceIndex === 4) return {mark:"N",type:"no-tele",title:"No teleport"};
      if (rowIndex === 3 && sourceIndex === 8) return {mark:"t",type:"danger",title:"Random auto-teleport"};
      if (rowIndex === 5 && sourceIndex === 7) return {mark:"~",type:"temporary",title:"Swimming"};
      if (rowIndex === 5 && sourceIndex === 9) return {mark:"#",type:"green",title:"Tree traversal"};
      if (rowIndex === 5 && sourceIndex === 10) return {mark:"+",type:"derived",title:"Swimming and tree traversal"};
      if (rowIndex === 16 && sourceIndex === 2) return {mark:"+",type:"derived",title:"Anti-magic shell"};
      if (rowIndex === 18 && sourceIndex === 6) return {mark:"+",type:"danger",title:"Aggravation"};
      if ([11,12].includes(rowIndex) && sourceIndex === rowIndex - 8) return {mark:"-",type:"danger",title:"Reduced regeneration"};
      if ([2,13].includes(rowIndex) && sourceIndex === rowIndex % 5) return {mark:"*",type:"immunity",title:rowIndex === 2 ? "Life drain immunity" : "No food consumption"};
    }
    if (group.kind === "slay") {
      if (rowIndex <= 12) {
        if (sourceIndex === (rowIndex * 3) % 14) return {mark:"E",type:"esp",title:"ESP detection"};
        if (sourceIndex === (rowIndex * 3 + 4) % 14) return {mark:"s",type:"slay",title:"Slay"};
        if ([5,6,7].includes(rowIndex) && sourceIndex === (rowIndex * 3 + 8) % 14) return {mark:"k",type:"kill",title:"Kill"};
        if (sourceIndex === 14 && rowIndex % 4 === 0) return {mark:"+",type:"positive",title:"Combined ESP and slay"};
      } else if (rowIndex <= 17) {
        if (sourceIndex === (rowIndex * 2) % 14) return {mark:"b",type:"positive",title:"Elemental brand"};
        if (sourceIndex === (rowIndex * 2 + 5) % 14) return {mark:"a",type:"positive",title:"Elemental aura"};
        if (sourceIndex === 14 && rowIndex % 2) return {mark:"+",type:"positive",title:"Brand and aura"};
      } else if (sourceIndex === 0) return {mark:"+",type:"positive",title:"Vorpal"};
      return {mark:".",type:"empty",title:"Not present"};
    }
    if (group.kind === "resist" && (rowIndex + sourceIndex * 2) % 37 === 0) return {mark:"-",type:"danger",title:"Susceptibility"};
    if (group.kind === "resist" && (rowIndex * 2 + sourceIndex) % 31 === 0) return {mark:"*",type:"immunity",title:"Immunity"};
    if ((rowIndex * 5 + sourceIndex * 3 + groupIndex) % 19 === 0) return {mark:"+",type:"positive",title:"Resistance or ability"};
    if (sourceIndex === 14 && (rowIndex + groupIndex) % 4 === 0) return {mark:"+",type:"positive",title:"Innate player or body flag"};
    return {mark:".",type:"empty",title:"Not present"};
  }

  function characterMatrixRowTone(group, rowIndex, values) {
    const types = new Set(values.map(value => value.type));
    if (group.kind === "resist") {
      if (types.has("immunity")) return "gold";
      const temporaryResists = ["resFire","resCold","resElec","resAcid","resPois"];
      if (rowIndex < temporaryResists.length && state.indicators[temporaryResists[rowIndex]] && types.has("positive")) return "blue";
      if (types.has("positive")) return "white";
      if (types.has("derived")) return "yellow";
      if (types.has("danger")) return "red";
      return "dark";
    }
    if (group.kind === "flag") {
      if (types.has("immunity")) return "gold";
      if (types.has("no-tele")) return "bright-red";
      if (types.has("danger")) return "red";
      if (types.has("positive")) return "white";
      if (types.has("derived") || types.has("temporary") || types.has("green")) return "yellow";
      return "dark";
    }
    if (group.kind === "bonus") {
      if (types.has("bonus-high") || types.has("sustain")) return "gold";
      return values.some(value => value.type !== "empty") ? "white" : "dark";
    }
    return values.some(value => value.type !== "empty") ? "white" : "dark";
  }

  function characterResistsMarkup() {
    const sourceHeads = CHARACTER_SOURCES.map(([key,title],sourceIndex) => `<th scope="col" title="${title}" data-matrix-source="${sourceIndex}">${key}</th>`).join("");
    const equipmentFoot = CHARACTER_SOURCES.map(([key,title],sourceIndex) => {
      const item = CHARACTER_SOURCE_EQUIPMENT[sourceIndex];
      const content = item.empty ? "" : CHARACTER_SOURCE_ICONS[item.icon];
      return `<td class="matrix-source-item${item.empty ? " is-empty" : ""}" title="${key}) ${title}: ${item.name}" data-matrix-source="${sourceIndex}" style="--matrix-source-color:${TERM_COLORS[item.tone]}"><span aria-hidden="true">${content}</span></td>`;
    }).join("");
    const groups = CHARACTER_RESIST_GROUPS.map((group, groupIndex) => {
      const rows = group.rows.map((label, rowIndex) => {
        const values = CHARACTER_SOURCES.map((source, sourceIndex) => characterMatrixMark(group,groupIndex,rowIndex,sourceIndex));
        const cells = CHARACTER_SOURCES.map((source, sourceIndex) => {
          const value = values[sourceIndex];
          return `<td class="matrix-${value.type}" title="${source[1]} · ${label}: ${value.title}" data-matrix-source="${sourceIndex}">${value.mark}</td>`;
        }).join("");
        return `<tr><th class="matrix-row-${characterMatrixRowTone(group,rowIndex,values)}" scope="row">${label}</th>${cells}</tr>`;
      }).join("");
      return `<section class="resist-group"><h3>${group.title}</h3><table><colgroup><col class="matrix-label-col"><col class="matrix-source-col" span="15"></colgroup><thead><tr><th scope="col">Flag</th>${sourceHeads}</tr></thead><tbody>${rows}</tbody><tfoot><tr><th scope="row" aria-label="Equipped items"></th>${equipmentFoot}</tr></tfoot></table></section>`;
    }).join("");
    const legend = state.characterResistsLegendHidden ? "" : `<div class="matrix-legend"><span><b class="matrix-positive">+</b> resist / flag</span><span><b class="matrix-immunity">*</b> immunity / max</span><span><b class="matrix-danger">-</b> susceptibility</span><span><b class="matrix-bonus-low">1–9</b> bonus</span><span><b class="matrix-penalty-low">1–9</b> penalty</span><span><b class="matrix-esp">E</b> ESP</span><span><b class="matrix-slay">s</b> slay / sustain</span><span><b class="matrix-kill">k</b> kill</span><span><b>@</b> player / body</span></div>`;
    return `${legend}<div class="resist-groups">${groups}</div>`;
  }

  function characterPageMarkup(target = "panel") {
    if (state.characterPage === "resists") return {
      className:"character-content is-resists",
      markup:characterResistsMarkup()
    };
    const lower = target === "window"
      ? state.characterPage === "profile"
        ? `<section class="character-block character-background"><h3>Character background</h3>${CHARACTER_DATA.history.map(line => `<p>${line}</p>`).join("")}</section>`
        : characterDetailsMarkup()
      : "";
    return {
      className:"character-content",
      markup:`<div class="character-sheet">${characterCommonMarkup(target)}${lower}<p class="character-location">You are at the surface of Bree.</p></div>`
    };
  }

  function renderCharacter() {
    if (!CHARACTER_PAGES.includes(state.characterPage)) state.characterPage = "profile";
    if (!["profile","skills"].includes(state.characterSummaryPage)) state.characterSummaryPage = "profile";
    if (["profile","skills"].includes(state.characterPage)) state.characterSummaryPage = state.characterPage;
    $$('[data-character-tab]').forEach(button => {
      const active = button.dataset.characterTab === "summary"
        ? state.characterPage === "profile" || state.characterPage === "skills"
        : button.dataset.characterTab === state.characterPage;
      button.classList.toggle("active",active);
      button.setAttribute("aria-selected",active ? "true" : "false");
      button.tabIndex = active ? 0 : -1;
    });
    $$('[data-character-content]').forEach(content => {
      const target = content.dataset.characterContent === "window" ? "window" : "panel";
      const page = characterPageMarkup(target);
      const previousPage = content.dataset.renderedCharacterPage;
      const positions = scrollPositions.get(content) || {};
      if (previousPage) positions[previousPage] = content.scrollTop;
      const scrollTop = previousPage === state.characterPage ? content.scrollTop : (positions[state.characterPage] || 0);
      scrollPositions.set(content,positions);
      content.className = `${page.className}${target === "window" ? " character-window-content" : ""}`;
      content.innerHTML = page.markup;
      content.dataset.renderedCharacterPage = state.characterPage;
      content.scrollTop = scrollTop;
      if (target === "window") content.closest(".character-window")?.classList.toggle("is-resists-page",state.characterPage === "resists");
    });
  }

  function setCharacterPage(page) {
    const nextPage = page === "summary" ? state.characterSummaryPage : page;
    state.characterPage = CHARACTER_PAGES.includes(nextPage) ? nextPage : "profile";
    if (["profile","skills"].includes(state.characterPage)) state.characterSummaryPage = state.characterPage;
    renderCharacter();
    const control = $("#characterPageControl");
    if (control) control.value = state.characterPage;
    persist();
  }

  function characterFieldsForPage(page = state.characterPage) { return [...(CHARACTER_FIELD_ORDER[page] || [])]; }
  function getSelectedCharacterField(page = state.characterPage) {
    const fields = CHARACTER_FIELD_ORDER[page] || [];
    return fields.includes(selectedFields[page]) ? selectedFields[page] : fields[0] || null;
  }
  function selectCharacterField(fieldId,page = state.characterPage) {
    if (!(CHARACTER_FIELD_ORDER[page] || []).includes(fieldId)) return false;
    selectedFields[page] = fieldId;
    renderCharacter();
    return true;
  }

  function clearMatrixColumnGuide(table) {
    table.querySelectorAll(".is-column-guide").forEach(cell => cell.classList.remove("is-column-guide"));
    delete table.dataset.matrixGuideSource;
  }
  function showMatrixColumnGuide(cell) {
    const table = cell.closest(".resist-group table");
    if (!table || table.dataset.matrixGuideSource === cell.dataset.matrixSource) return;
    clearMatrixColumnGuide(table);
    table.dataset.matrixGuideSource = cell.dataset.matrixSource;
    table.querySelectorAll(`[data-matrix-source="${cell.dataset.matrixSource}"]`).forEach(entry => entry.classList.add("is-column-guide"));
  }
  $$('[data-character-content]').forEach(content => {
    content.addEventListener("pointerover",event => {
      const cell = event.target.closest("[data-matrix-source]");
      if (cell && content.contains(cell)) showMatrixColumnGuide(cell);
    });
    content.addEventListener("pointerout",event => {
      const table = event.target.closest(".resist-group table");
      if (table && !table.contains(event.relatedTarget)) clearMatrixColumnGuide(table);
    });
  });

  return {CHARACTER_PAGES,renderCharacter,setCharacterPage,characterFieldsForPage,getSelectedCharacterField,selectCharacterField};
  };
})();
