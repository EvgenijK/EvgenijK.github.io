(() => {
  window.TomeNetPrototype.createSkillsWindowFeature = ({state,$,clamp,persist,windowManager,guideFeature,appendGameMessage,escapeHtml,skillsData}) => {
    const overlay = $("#skillsWindowOverlay");
    const skillsWindow = $("#skillsWindow");
    const tree = $("#skillsTree");
    const treeRows = $("#skillsTreeRows");
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
    let lastRowClick = {id:null,time:0};
    let renderedDetailSkillId = null;
    const changeListeners = new Set();
    skillsData.forEach(item => runtime.values.set(item.id,item.value));

    function syncAutomaticSkills() {
      let changed=false;
      skillsData.filter(item=>item.flags.automatic).forEach(item=>{const value=Math.min(item.maxValue,Math.max(0,Math.round(state.xpLevel))*1000);if(runtime.values.get(item.id)!==value){runtime.values.set(item.id,value);changed=true;}});
      return changed;
    }
    syncAutomaticSkills();

    function skillSnapshot() { return new Map(runtime.values); }
    function notifySkillChange() { const snapshot=skillSnapshot();changeListeners.forEach(listener=>listener(snapshot)); }

    const formatSkill = value => `${String(Math.floor(value / 1000)).padStart(2,"0")}.${String(Math.abs(value % 1000)).padStart(3,"0")}`;
    const formatIncrease = value => formatSkill(value).replace(/^0/,"");
    function currentLimit() { return Math.min(50,Math.max(1,Math.round(state.xpLevel) + 2)); }
    function nodeActive(id) {
      const item = byId.get(id);
      return item.available || runtime.values.get(id) > 0 || (children.get(id) || []).some(nodeActive);
    }
    function nodeVisible(item) { return !item.flags.hidden && (state.skillsShowUnavailable || nodeActive(item.id)); }
    function visibleChildIds(parentId) { return (children.get(parentId) || []).filter(id => nodeVisible(byId.get(id))); }
    function visibleRows() {
      const rows = [];
      function visit(parentId,depth,ancestors=[]) {
        const visibleChildren = visibleChildIds(parentId);
        visibleChildren.forEach((id,index) => {
          const item = byId.get(id);
          const isLast = index === visibleChildren.length - 1;
          rows.push({item,depth,ancestors,isLast});
          if (runtime.expanded.has(id)) visit(id,depth + 1,[...ancestors,{id,isLast}]);
        });
      }
      visit(null,0);return rows;
    }
    function routeTo(id) {
      const route = [];
      let current = byId.get(id);
      while (current) { route.unshift(current.id);current=byId.get(current.parentId); }
      return route;
    }
    function trainedBranches() {
      const trained = new Set();
      function visit(id) {
        let hasTraining = runtime.values.get(id) > 0;
        (children.get(id) || []).forEach(childId => { if (visit(childId)) hasTraining = true; });
        if (hasTraining) trained.add(id);
        return hasTraining;
      }
      (children.get(null) || []).forEach(visit);
      return trained;
    }
    function capFor(item) { return Math.min(item.maxValue,currentLimit() * 1000); }
    function blockReason(item) {
      if (item.flags.dummy) return "Structural group — it cannot be trained.";
      if (item.flags.automatic) return "This skill rises automatically with character level and cannot receive skill points.";
      if (!item.available || item.modifier <= 0) return "This skill is unavailable to Maia Runemaster.";
      if (runtime.points <= 0) return "No unallocated skill points remain.";
      if (runtime.values.get(item.id) >= capFor(item)) return item.maxValue < currentLimit() * 1000 ? "This skill has reached its special maximum value." : "The current skill limit has been reached.";
      return "";
    }
    function skillClasses(item,isRoute,isTrainedBranch) {
      const value = runtime.values.get(item.id);
      return ["skill-row",isRoute ? "is-route":"",isTrainedBranch ? "is-trained-branch":"",value > 0 ? "is-trained-skill":"",runtime.selected === item.id ? "is-selected":"",!item.available && !item.flags.dummy ? "is-unavailable":"",item.flags.dummy ? "is-dummy":"",item.available && !item.flags.dummy && !value ? "is-zero":"",value >= capFor(item) ? "is-max":"",runtime.changed.has(item.id) ? "is-changed":""].filter(Boolean).join(" ");
    }
    function skillGuideParagraphs(item) {
      return [
        item.description,
        item.flags.dummy
          ? "This entry organises a branch of related skills and cannot itself receive skill points."
          : item.flags.automatic
            ? "This skill follows character level automatically and cannot receive allocated skill points."
            : `One allocated skill point changes this skill by ${formatSkill(item.modifier)}. Training is constrained by the shared current limit (character level + 2, capped at 50).`,
        item.relations.length
          ? item.relations.map(relation => relation.exclusive
            ? `It is exclusive with ${byId.get(relation.id)?.name}.`
            : `Training it also affects ${byId.get(relation.id)?.name} at ${relation.percent}% of that skill's modifier.`).join(" ")
          : ""
      ].filter(Boolean);
    }
    function renderDetail() {
      const item = byId.get(runtime.selected);
      if (!item) { detail.innerHTML = "";renderedDetailSkillId = null;return; }
      const previousGuide = detail.querySelector(".skills-guide-copy");
      const preservedGuideScroll = renderedDetailSkillId === item.id ? previousGuide?.scrollTop || 0 : 0;
      const value = runtime.values.get(item.id);
      const cap = capFor(item);
      const reason = blockReason(item);
      const relations = item.relations.map(relation => {
        const target = byId.get(relation.id);
        return relation.exclusive ? `Exclusive with ${target?.name || relation.id}` : `Raises ${target?.name || relation.id} by ${relation.percent}% of its modifier`;
      });
      const status = item.flags.dummy ? "STRUCTURAL GROUP" : item.flags.automatic ? "AUTOMATIC" : !item.available ? "UNAVAILABLE" : value >= cap ? "LIMIT REACHED" : value ? "TRAINED" : "AVAILABLE · UNTRAINED";
      detail.innerHTML = `<div class="skills-detail-head"><h2>${escapeHtml(item.name)}</h2><div class="skills-detail-status">${status}</div></div>
        <section class="skills-guide-section" aria-label="Guide description">
          <strong class="skills-guide-label">GUIDE</strong>
          <div class="skills-guide-copy" tabindex="0" aria-label="${escapeHtml(item.name)} Guide text">${skillGuideParagraphs(item).map(text => `<p>${escapeHtml(text)}</p>`).join("")}</div>
        </section>
        <div class="skills-detail-mechanics">
          <div class="skills-progress${value >= cap ? " is-max" : ""}" role="progressbar" aria-label="${escapeHtml(item.name)} progress" aria-valuemin="0" aria-valuemax="${cap}" aria-valuenow="${value}"><span style="width:${Math.min(100,value/cap*100)}%"></span></div>
          <dl class="skills-detail-grid"><dt>Current value</dt><dd>${formatSkill(value)}</dd>${item.modifier ? `<dt>Increase by skill point</dt><dd>[${formatSkill(item.modifier)}]</dd>` : ""}${item.maxValue !== 50000 ? `<dt>Maximum value</dt><dd>${formatSkill(item.maxValue)}</dd>` : ""}</dl>
          ${relations.length ? `<div class="skills-relations"><strong>RELATED SKILLS</strong>${relations.map(text => `<div>${escapeHtml(text)}</div>`).join("")}</div>` : ""}
          ${item.flags.automatic?"":`<button class="skills-train" id="skillsTrain" type="button"${reason ? " disabled":""}>TRAIN · 6</button>`}
          ${reason ? `<p class="skills-block-reason">${escapeHtml(reason)}</p>` : ""}
        </div>`;
      renderedDetailSkillId = item.id;
      const renderedGuide = detail.querySelector(".skills-guide-copy");
      requestAnimationFrame(() => { if (renderedDetailSkillId === item.id && renderedGuide?.isConnected) renderedGuide.scrollTop = preservedGuideScroll; });
    }
    function ensureSelectedVisible(rows) {
      if (!rows.some(row => row.item.id === runtime.selected)) runtime.selected = rows[0]?.item.id || null;
    }
    function render({scroll=true} = {}) {
      const rows = visibleRows();ensureSelectedVisible(rows);
      const route = routeTo(runtime.selected);
      const routeIds = new Set(route);
      const trainedIds = trainedBranches();
      const trainedRanges = new Map();
      [null,...skillsData.map(item => item.id)].forEach(parentId => {
        const childIds = visibleChildIds(parentId);
        let lastTrained = -1;
        childIds.forEach((id,index) => { if (trainedIds.has(id)) lastTrained = index; });
        trainedRanges.set(parentId,{lastTrained,indexById:new Map(childIds.map((id,index) => [id,index]))});
      });
      const selectedIndex = rows.findIndex(row => row.item.id === runtime.selected);
      tree.classList.toggle("has-route",route.length > 0);
      treeRows.innerHTML = rows.map(({item,depth,ancestors,isLast},index) => {
        const visibleChildren = visibleChildIds(item.id);
        const childCount = visibleChildren.length;
        const expanded = runtime.expanded.has(item.id);
        const isRoute = routeIds.has(item.id);
        const guideLines = ancestors.map((ancestor,level) => {
          const immediate = level === ancestors.length - 1;
          const continues = immediate ? !isLast : !ancestors[level + 1].isLast;
          const guideRoute = routeIds.has(ancestor.id) && index <= selectedIndex;
          const branchChildId = immediate ? item.id : ancestors[level + 1].id;
          const range = trainedRanges.get(ancestor.id);
          const branchIndex = range?.indexById.get(branchChildId) ?? -1;
          const guideTraining = range && range.lastTrained >= 0 && branchIndex < range.lastTrained
            ? " is-trained"
            : immediate && range && range.lastTrained >= 0 && branchIndex === range.lastTrained
              ? " is-trained-terminal"
              : "";
          return `<span class="skill-tree-segment is-guide${continues ? " is-continuing":" is-ending"}${guideTraining}${guideRoute ? " is-route":""}"></span>`;
        }).join("");
        const nodeLabel = childCount ? (expanded ? "−" : "+") : "";
        const isTrainedBranch = trainedIds.has(item.id);
        const hasTrainedOpenChild = expanded && visibleChildren.some(id => trainedIds.has(id));
        const connector = `<span class="skill-tree-lines" aria-hidden="true">${guideLines}<span class="skill-tree-segment is-current${depth ? "":" is-root"}${isTrainedBranch ? " is-trained":""}${isRoute ? " is-route":""}${runtime.selected === item.id ? " is-route-end":""}${childCount && expanded ? " has-open-children":""}${hasTrainedOpenChild ? " has-trained-open-child":""}"><span class="skill-node-mark${childCount ? "":" is-leaf"}${!childCount && runtime.values.get(item.id) === 0 ? " is-untrained":""}"${childCount ? ` data-skill-fold="${item.id}"`:""}>${nodeLabel}</span></span></span>`;
        return `<div class="${skillClasses(item,isRoute,isTrainedBranch)}" role="treeitem" aria-level="${depth+1}" aria-selected="${runtime.selected === item.id}"${childCount ? ` aria-expanded="${expanded}"` : ""} data-skill-id="${item.id}" data-skill-index="${index}" style="--skill-depth:${depth}"><span class="skill-name">${connector}<span class="skill-name-text">${escapeHtml(item.name)}</span></span>${item.flags.dummy ? '<span class="skill-value"></span><span class="skill-modifier"></span>' : `<span class="skill-value">${formatSkill(runtime.values.get(item.id))}</span><span class="skill-modifier">${item.modifier ? `[+${formatIncrease(item.modifier)}]` : ""}</span>`}</div>`;
      }).join("");
      $("#skillsPointsValue").textContent = runtime.points;
      $("#skillsCurrentLimit").textContent = formatSkill(currentLimit() * 1000);
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
      notifySkillChange();
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
    function registerGuideArticles(){guideFeature.registerArticles(skillsData.map(item=>({id:`skill:${item.id}`,title:item.name,reference:item.id==="runecraft"?"TomeNET Guide · Runecraft":"TomeNET Guide · Skills",paragraphs:skillGuideParagraphs(item)})))}
    function isOpen(){return windowManager.has("skills");}
    function show(){overlay.hidden=false;overlay.setAttribute("aria-hidden","false");shortcut.setAttribute("aria-expanded","true");render();requestAnimationFrame(()=>tree.focus());}
    function hide(){overlay.hidden=true;overlay.setAttribute("aria-hidden","true");shortcut.setAttribute("aria-expanded","false");closePrompt();}
    windowManager.register({kind:"skills",layer:"primary",blocksGameplay:true,allowsChat:true,focusTarget:()=>tree,onOpen:show,onClose:hide});
    function openWindow(opener=shortcut){if(isOpen())return false;return windowManager.open("skills",{},{opener});}
    function closeWindow(){return windowManager.closeKind("skills");}
    function restoreFocus(){if(isOpen())requestAnimationFrame(()=>tree.focus());}
    function toggleUnavailable(){state.skillsShowUnavailable=!state.skillsShowUnavailable;persist();render();}
    function applyControls(){state.skillsWindowFontSize=clamp(Math.round(state.skillsWindowFontSize),8,20);skillsWindow.style.setProperty("--skills-font-size",`${state.skillsWindowFontSize}px`);$("#skillsWindowFontSizeControl").value=state.skillsWindowFontSize;$("#skillsWindowFontSizeValue").value=`${state.skillsWindowFontSize}px`;$("#skillsShowUnavailableControl").checked=state.skillsShowUnavailable;if(isOpen())render({scroll:false});}
    function resetSimulation(){runtime.points=5;runtime.values=new Map(skillsData.map(item=>[item.id,item.value]));syncAutomaticSkills();runtime.expanded=new Set(initialExpanded);runtime.selected="r-light";runtime.changed.clear();notifySkillChange();if(isOpen())render();}
    function subscribeSkillChanges(listener){changeListeners.add(listener);return()=>changeListeners.delete(listener);}
    function handleKeydown(event){
      const editing=event.target.matches?.("input,textarea,select,[contenteditable='true']");const openShortcut=event.code==="KeyG"&&event.shiftKey&&!event.ctrlKey&&!event.altKey&&!event.metaKey;
      if(openShortcut&&!isOpen()&&!editing){const blocked=windowManager.snapshot().some(entry=>["context","dialog","target","system","technical"].includes(entry.layer));if(blocked)return false;openWindow(shortcut);return true;}
      if(!isOpen())return false;
      if(!prompt.hidden){if(event.key==="Escape"){closePrompt();return true;}if(event.key==="Enter"){applyPrompt();return true;}return true;}
      if(event.key===":"&&!editing)return false;
      if(event.key==="Escape"||(event.ctrlKey&&event.code==="KeyQ")){closeWindow();return true;}
      if(event.ctrlKey&&event.code==="KeyT"){appendGameMessage({markup:escapeHtml("Screenshot saved as 'screenshot????'. (prototype only)")});return true;}
      if(editing)return false;
      const guideCopy=event.target.closest?.(".skills-guide-copy");
      if(guideCopy){
        if(event.key==="ArrowDown"){guideCopy.scrollBy({top:36});return true;}
        if(event.key==="ArrowUp"){guideCopy.scrollBy({top:-36});return true;}
        if(event.key==="PageDown"||event.key===" "){guideCopy.scrollBy({top:guideCopy.clientHeight*.82});return true;}
        if(event.key==="PageUp"){guideCopy.scrollBy({top:-guideCopy.clientHeight*.82});return true;}
        if(event.key==="Home"){guideCopy.scrollTop=0;return true;}
        if(event.key==="End"){guideCopy.scrollTop=guideCopy.scrollHeight;return true;}
      }
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
      if(event.key==="Tab"){const guide=detail.querySelector(".skills-guide-copy");const targets=[tree,guide,...skillsWindow.querySelectorAll("button:not([disabled]),input:not([disabled])")].filter(el=>el&&el.offsetParent!==null);const i=targets.indexOf(document.activeElement);targets[(i+(event.shiftKey?-1:1)+targets.length)%targets.length].focus();return true;}
      return false;
    }
    shortcut.addEventListener("click",event=>isOpen()?closeWindow():openWindow(event.currentTarget));$("#skillsWindowClose").addEventListener("click",closeWindow);$("#skillsUnavailableToggle").addEventListener("click",toggleUnavailable);overlay.addEventListener("click",event=>{if(event.target===overlay)closeWindow();});
    tree.addEventListener("click",event=>{const row=event.target.closest("[data-skill-id]");if(!row)return;const id=row.dataset.skillId;const branch=(children.get(id)||[]).length;const fold=event.target.closest("[data-skill-fold]");const now=performance.now();const doubleClick=!fold&&branch&&lastRowClick.id===id&&now-lastRowClick.time<400;runtime.selected=id;lastRowClick=doubleClick||fold?{id:null,time:0}:{id,time:now};if((fold&&branch)||doubleClick)toggleBranch();else render();tree.focus();});
    detail.addEventListener("click",event=>{if(event.target.closest("#skillsTrain"))train();});$("#skillsPromptApply").addEventListener("click",applyPrompt);$("#skillsPromptCancel").addEventListener("click",closePrompt);
    registerGuideArticles();
    return{openWindow,closeWindow,isOpen,handleKeydown,applyControls,resetSimulation,restoreFocus,toggleUnavailable,refreshLimit:()=>{const changed=syncAutomaticSkills();if(changed)notifySkillChange();if(isOpen())render({scroll:false});},getSkillSnapshot:skillSnapshot,subscribeSkillChanges};
  };
})();
