(() => {
  window.TomeNetPrototype.createSkillsWindowFeature = ({state,$,clamp,persist,windowManager,guideFeature,appendGameMessage,escapeHtml,skillsData}) => {
    const overlay = $("#skillsWindowOverlay");
    const skillsWindow = $("#skillsWindow");
    const tree = $("#skillsTree");
    const detail = $("#skillsDetail");
    const shortcut = $("#skillsShortcut");
    const prompt = $("#skillsPrompt");
    const promptInput = $("#skillsPromptInput");
    const byId = new Map(skillsData.map(item => [item.id,item]));
    const children = new Map();
    skillsData.forEach(item => {
      const list = children.get(item.parentId) || [];
      list.push(item.id);children.set(item.parentId,list);
    });
    children.forEach(list => list.sort((a,b) => byId.get(a).order - byId.get(b).order));
    const initialExpanded = ["combat","mastery","magic","runecraft","blood","sneak","health"];
    const runtime = {points:5,values:new Map(),expanded:new Set(initialExpanded),selected:"r-light",changed:new Set(),promptMode:null};
    skillsData.forEach(item => runtime.values.set(item.id,item.value));

    const formatSkill = value => `${String(Math.floor(value / 1000)).padStart(2,"0")}.${String(Math.abs(value % 1000)).padStart(3,"0")}`;
    function nodeActive(id) {
      const item = byId.get(id);
      return item.available || runtime.values.get(id) > 0 || (children.get(id) || []).some(nodeActive);
    }
    function nodeVisible(item) { return !item.flags.hidden && (state.skillsShowUnavailable || nodeActive(item.id)); }
    function visibleRows() {
      const rows = [];
      function visit(parentId,depth) {
        (children.get(parentId) || []).forEach(id => {
          const item = byId.get(id);
          if (!nodeVisible(item)) return;
          rows.push({item,depth});
          if (runtime.expanded.has(id)) visit(id,depth + 1);
        });
      }
      visit(null,0);return rows;
    }
    function capFor(item) { return Math.min(item.maxValue,59000,50000); }
    function blockReason(item) {
      if (item.flags.dummy) return "Structural group — it cannot be trained.";
      if (!item.available || item.modifier <= 0) return "This skill is unavailable to Maia Runemaster.";
      if (runtime.points <= 0) return "No unallocated skill points remain.";
      if (runtime.values.get(item.id) >= capFor(item)) return "This skill has reached its maximum value.";
      if (Math.floor(runtime.values.get(item.id) / 1000) >= 59) return "The character level + 2 limit has been reached.";
      return "";
    }
    function skillClasses(item) {
      const value = runtime.values.get(item.id);
      return ["skill-row",runtime.selected === item.id ? "is-selected":"",!item.available && !item.flags.dummy ? "is-unavailable":"",item.flags.dummy ? "is-dummy":"",item.available && !item.flags.dummy && !value ? "is-zero":"",value >= capFor(item) ? "is-max":"",runtime.changed.has(item.id) ? "is-changed":""].filter(Boolean).join(" ");
    }
    function renderDetail() {
      const item = byId.get(runtime.selected);
      if (!item) { detail.innerHTML = "";return; }
      const value = runtime.values.get(item.id);
      const cap = capFor(item);
      const reason = blockReason(item);
      const relations = item.relations.map(relation => {
        const target = byId.get(relation.id);
        return relation.exclusive ? `Exclusive with ${target?.name || relation.id}` : `Raises ${target?.name || relation.id} by ${relation.percent}% of its modifier`;
      });
      const status = item.flags.dummy ? "STRUCTURAL GROUP" : !item.available ? "UNAVAILABLE" : value >= cap ? "MAXIMUM REACHED" : value ? "TRAINED" : "AVAILABLE · UNTRAINED";
      detail.innerHTML = `<h2>${escapeHtml(item.name)}</h2><div class="skills-detail-status">${status}</div>
        <p>${escapeHtml(item.description)}</p>
        <div class="skills-progress${value >= cap ? " is-max" : ""}" role="progressbar" aria-label="${escapeHtml(item.name)} progress" aria-valuemin="0" aria-valuemax="${cap}" aria-valuenow="${value}"><span style="width:${Math.min(100,value/cap*100)}%"></span></div>
        <dl class="skills-detail-grid"><dt>Current value</dt><dd>${formatSkill(value)}</dd><dt>Maximum</dt><dd>${formatSkill(cap)}</dd><dt>Point modifier</dt><dd>${item.modifier ? `[${formatSkill(item.modifier)}]` : "[-----]"}</dd><dt>Character limit</dt><dd>59.000</dd></dl>
        ${relations.length ? `<div class="skills-relations"><strong>RELATED SKILLS</strong>${relations.map(text => `<div>${escapeHtml(text)}</div>`).join("")}</div>` : ""}
        <button class="skills-train" id="skillsTrain" type="button"${reason ? " disabled":""}>TRAIN · 6</button>
        ${reason ? `<p class="skills-block-reason">${escapeHtml(reason)}</p>` : ""}`;
    }
    function ensureSelectedVisible(rows) {
      if (!rows.some(row => row.item.id === runtime.selected)) runtime.selected = rows[0]?.item.id || null;
    }
    function render({scroll=true} = {}) {
      const rows = visibleRows();ensureSelectedVisible(rows);
      tree.innerHTML = rows.map(({item,depth},index) => {
        const childCount = (children.get(item.id) || []).filter(id => nodeVisible(byId.get(id))).length;
        const expanded = runtime.expanded.has(item.id);
        return `<div class="${skillClasses(item)}" role="treeitem" aria-level="${depth+1}" aria-selected="${runtime.selected === item.id}"${childCount ? ` aria-expanded="${expanded}"` : ""} data-skill-id="${item.id}" data-skill-index="${index}" style="--skill-depth:${depth}"><span class="skill-name"><span class="skill-fold${childCount ? "":" is-leaf"}" data-skill-fold="${item.id}">${childCount ? (expanded ? "−" : "+") : "·"}</span>${escapeHtml(item.name)}</span>${item.flags.dummy ? '<span class="skill-value"></span><span class="skill-modifier"></span>' : `<span class="skill-value">${formatSkill(runtime.values.get(item.id))}</span><span class="skill-modifier">${item.modifier ? `[${formatSkill(item.modifier)}]` : "[-----]"}</span>`}</div>`;
      }).join("");
      $("#skillsPointsValue").textContent = runtime.points;
      $("#skillsUnavailableToggle").textContent = state.skillsShowUnavailable ? "HIDE UNAVAILABLE" : "SHOW UNAVAILABLE";
      $("#skillsUnavailableToggle").setAttribute("aria-pressed",state.skillsShowUnavailable ? "true":"false");
      $("#skillsShowUnavailableControl").checked = state.skillsShowUnavailable;
      renderDetail();
      if (scroll) requestAnimationFrame(() => tree.querySelector(".is-selected")?.scrollIntoView({block:"nearest"}));
    }
    function select(id) { if (!byId.has(id)) return false;runtime.selected=id;render();return true; }
    function move(delta) {
      const rows=visibleRows();const index=Math.max(0,rows.findIndex(row=>row.item.id===runtime.selected));
      if (!rows.length) return false;runtime.selected=rows[(index+delta+rows.length)%rows.length].item.id;render();return true;
    }
    function movePage(direction) { return move(direction * Math.max(1,Math.floor(tree.clientHeight / Math.max(18,parseFloat(getComputedStyle(tree).fontSize)*1.55) / 2))); }
    function edge(last) { const rows=visibleRows();if(!rows.length)return false;runtime.selected=rows[last?rows.length-1:0].item.id;render();return true; }
    function toggleBranch(id=runtime.selected,force) {
      if (!(children.get(id)||[]).length) return false;
      const expand=force ?? !runtime.expanded.has(id);if(expand)runtime.expanded.add(id);else runtime.expanded.delete(id);render();return true;
    }
    function setAll(expand) { runtime.expanded=new Set(expand?skillsData.filter(item=>(children.get(item.id)||[]).length).map(item=>item.id):[]);render(); }
    function flash(ids) { ids.forEach(id=>runtime.changed.add(id));render();setTimeout(()=>{ids.forEach(id=>runtime.changed.delete(id));render({scroll:false});},650); }
    function train() {
      const item=byId.get(runtime.selected);if(!item)return false;
      const reason=blockReason(item);if(reason){renderDetail();return true;}
      runtime.points--;
      runtime.values.set(item.id,Math.min(capFor(item),runtime.values.get(item.id)+item.modifier));
      const changed=[item.id];
      item.relations.forEach(relation=>{
        if(relation.exclusive)return;
        const target=byId.get(relation.id);if(!target)return;
        const delta=Math.round(target.modifier*relation.percent/100);
        runtime.values.set(target.id,Math.min(capFor(target),runtime.values.get(target.id)+delta));changed.push(target.id);
      });
      flash(changed);return true;
    }
    function expandAncestors(id) { let parent=byId.get(id)?.parentId;while(parent){runtime.expanded.add(parent);parent=byId.get(parent)?.parentId;} }
    function openPrompt(mode) {
      runtime.promptMode=mode;prompt.hidden=false;$("#skillsPromptLabel").textContent=mode==="goto"?`Goto line (max ${visibleRows().length})`:"Search for skill";
      promptInput.type=mode==="goto"?"number":"text";promptInput.value=mode==="goto"?"1":"";requestAnimationFrame(()=>{promptInput.focus();promptInput.select();});
    }
    function closePrompt() { runtime.promptMode=null;prompt.hidden=true;tree.focus(); }
    function applyPrompt() {
      if(runtime.promptMode==="goto"){
        const rows=visibleRows();const index=Math.max(0,Math.min(rows.length-1,(parseInt(promptInput.value,10)||1)-1));if(rows[index])runtime.selected=rows[index].item.id;
      }else{
        const query=promptInput.value.trim().toLowerCase();const item=skillsData.find(candidate=>!candidate.flags.hidden&&candidate.name.toLowerCase().includes(query));
        if(item){if(!nodeActive(item.id)){state.skillsShowUnavailable=true;persist();}expandAncestors(item.id);runtime.selected=item.id;}
      }
      closePrompt();render();
    }
    function registerGuideArticles(){guideFeature.registerArticles(skillsData.map(item=>({id:`skill:${item.id}`,title:item.name,reference:item.id==="runecraft"?"TomeNET Guide · Runecraft":"TomeNET Guide · Skills",paragraphs:[item.description,item.flags.dummy?"This entry organises a branch of related skills and cannot itself receive skill points.":`One allocated skill point changes this skill by ${formatSkill(item.modifier)}. Its prototype maximum is ${formatSkill(capFor(item))}.`,item.relations.length?item.relations.map(relation=>relation.exclusive?`It is exclusive with ${byId.get(relation.id)?.name}.`:`Training it also affects ${byId.get(relation.id)?.name} at ${relation.percent}% of that skill's modifier.`).join(" "):""]})))}
    function isOpen(){return windowManager.has("skills");}
    function show(){overlay.hidden=false;overlay.setAttribute("aria-hidden","false");shortcut.setAttribute("aria-expanded","true");render();requestAnimationFrame(()=>tree.focus());}
    function hide(){overlay.hidden=true;overlay.setAttribute("aria-hidden","true");shortcut.setAttribute("aria-expanded","false");closePrompt();}
    windowManager.register({kind:"skills",layer:"primary",blocksGameplay:true,allowsChat:true,focusTarget:()=>tree,onOpen:show,onClose:hide});
    function openWindow(opener=shortcut){if(isOpen())return false;return windowManager.open("skills",{},{opener});}
    function closeWindow(){return windowManager.closeKind("skills");}
    function restoreFocus(){if(isOpen())requestAnimationFrame(()=>tree.focus());}
    function toggleUnavailable(){state.skillsShowUnavailable=!state.skillsShowUnavailable;persist();render();}
    function applyControls(){state.skillsWindowFontSize=clamp(Math.round(state.skillsWindowFontSize),8,20);skillsWindow.style.setProperty("--skills-font-size",`${state.skillsWindowFontSize}px`);$("#skillsWindowFontSizeControl").value=state.skillsWindowFontSize;$("#skillsWindowFontSizeValue").value=`${state.skillsWindowFontSize}px`;$("#skillsShowUnavailableControl").checked=state.skillsShowUnavailable;if(isOpen())render({scroll:false});}
    function resetSimulation(){runtime.points=5;runtime.values=new Map(skillsData.map(item=>[item.id,item.value]));runtime.expanded=new Set(initialExpanded);runtime.selected="r-light";runtime.changed.clear();if(isOpen())render();}
    function handleKeydown(event){
      const editing=event.target.matches?.("input,textarea,select,[contenteditable='true']");const openShortcut=event.code==="KeyG"&&event.shiftKey&&!event.ctrlKey&&!event.altKey&&!event.metaKey;
      if(openShortcut&&!isOpen()&&!editing){const blocked=windowManager.snapshot().some(entry=>["context","dialog","target","system","technical"].includes(entry.layer));if(blocked)return false;openWindow(shortcut);return true;}
      if(!isOpen())return false;
      if(!prompt.hidden){if(event.key==="Escape"){closePrompt();return true;}if(event.key==="Enter"){applyPrompt();return true;}return true;}
      if(event.key===":"&&!editing)return false;
      if(event.key==="Escape"||(event.ctrlKey&&event.code==="KeyQ")){closeWindow();return true;}
      if(event.ctrlKey&&event.code==="KeyT"){appendGameMessage({markup:escapeHtml("Screenshot saved as 'screenshot????'. (prototype only)")});return true;}
      if(editing)return false;
      if(event.key==="2"||event.key==="ArrowDown"||event.key==="j")return move(1);
      if(event.key==="8"||event.key==="ArrowUp"||event.key==="k")return move(-1);
      if(event.key==="6"||event.key==="ArrowRight"||event.key==="l")return train();
      if(event.key==="PageDown"||event.key==="3"||event.key==="n"||event.key===" ")return movePage(1);
      if(event.key==="PageUp"||event.key==="9"||event.key==="p"||event.key==="b")return movePage(-1);
      if(event.key==="Home"||event.key==="7"||event.key==="g")return edge(false);
      if(event.key==="End"||event.key==="1"||event.key==="G")return edge(true);
      if(event.key==="Enter")return toggleBranch();
      if(event.key==="c"){setAll(false);return true;}if(event.key==="o"){setAll(true);return true;}
      if(event.key==="/"||event.key==="s"){openPrompt("search");return true;}if(event.key==="#"){openPrompt("goto");return true;}
      if(event.key==="?"){guideFeature.openArticle(`skill:${runtime.selected}`,tree);return true;}
      if(event.key==="Tab"){const targets=[tree,...skillsWindow.querySelectorAll("button:not([disabled]),input:not([disabled])")].filter(el=>el.offsetParent!==null);const i=targets.indexOf(document.activeElement);targets[(i+(event.shiftKey?-1:1)+targets.length)%targets.length].focus();return true;}
      return false;
    }
    shortcut.addEventListener("click",event=>isOpen()?closeWindow():openWindow(event.currentTarget));$("#skillsWindowClose").addEventListener("click",closeWindow);$("#skillsUnavailableToggle").addEventListener("click",toggleUnavailable);overlay.addEventListener("click",event=>{if(event.target===overlay)closeWindow();});
    tree.addEventListener("click",event=>{const row=event.target.closest("[data-skill-id]");if(!row)return;runtime.selected=row.dataset.skillId;if(event.target.closest("[data-skill-fold]")&&(children.get(runtime.selected)||[]).length)toggleBranch();else render();tree.focus();});
    detail.addEventListener("click",event=>{if(event.target.closest("#skillsTrain"))train();});$("#skillsPromptApply").addEventListener("click",applyPrompt);$("#skillsPromptCancel").addEventListener("click",closePrompt);
    registerGuideArticles();
    return{openWindow,closeWindow,isOpen,handleKeydown,applyControls,resetSimulation,restoreFocus,toggleUnavailable};
  };
})();
