(() => {
  window.TomeNetPrototype.createSpellbookWindowFeature = ({
    state,$,clamp,persist,windowManager,appendGameMessage,escapeHtml,INVENTORY_ITEMS,INVENTORY_ICONS,
    spellDefinitions,spellbookSources,skillsFeature
  }) => {
    const overlay=$("#spellbookOverlay");
    const windowElement=$("#spellbookWindow");
    const booksElement=$("#spellbookBooks");
    const spellsElement=$("#spellbookSpells");
    const detail=$("#spellbookDetail");
    const booksPane=booksElement.closest(".spellbook-books-pane");
    const spellsPane=spellsElement.closest(".spellbook-spells-pane");
    const bySpellId=new Map(spellDefinitions.map(entry=>[entry.id,entry]));
    const bySourceId=new Map(spellbookSources.map(entry=>[entry.id,entry]));
    const runtime={mode:"browse",selectedBookId:null,selectedSpellId:null,activePane:"books",parentKind:null};

    function carriedBooks(){
      return INVENTORY_ITEMS.map((item,index)=>({item,index,source:bySourceId.get(item.spellSourceId)})).filter(entry=>entry.source);
    }
    function selectedBook(){return carriedBooks().find(entry=>entry.source.id===runtime.selectedBookId)||null;}
    function bookSpells(book=selectedBook()){return (book?.source.spellIds||[]).map(id=>bySpellId.get(id)).filter(Boolean);}
    function spellState(spell){
      const value=skillsFeature.getSkillSnapshot().get(spell.skillId)||0;
      const skillLevel=Math.floor(value/1000);
      const effectiveLevel=Math.max(0,skillLevel-spell.requiredLevel+1);
      let reason="";
      if(effectiveLevel<1)reason=`Requires ${spell.school} ${spell.requiredLevel}.000 (current ${String(skillLevel).padStart(2,"0")}.000).`;
      else if(spell.minimumCharacterLevel&&state.xpLevel<spell.minimumCharacterLevel)reason=`Requires character level ${spell.minimumCharacterLevel} (current ${state.xpLevel}).`;
      return {skillLevel,effectiveLevel,castable:!reason,reason};
    }
    function ensureSelection(){
      const books=carriedBooks();
      if(!books.some(entry=>entry.source.id===runtime.selectedBookId))runtime.selectedBookId=books[0]?.source.id||null;
      const spells=bookSpells();
      if(!spells.some(entry=>entry.id===runtime.selectedSpellId))runtime.selectedSpellId=spells[0]?.id||null;
    }
    function selectedSpell(){return bookSpells().find(entry=>entry.id===runtime.selectedSpellId)||null;}
    function bookMarkup(entry,index){
      const selected=entry.source.id===runtime.selectedBookId;
      return `<button class="spellbook-book${selected?" is-selected":""}" type="button" role="option" aria-selected="${selected}" data-spellbook-id="${entry.source.id}" data-book-key="${String.fromCharCode(97+index)}" style="--book-color:${entry.source.color}"><span>${INVENTORY_ICONS[entry.item.icon]}</span><span><kbd>${String.fromCharCode(97+index)})</kbd> ${escapeHtml(entry.source.name)}</span></button>`;
    }
    function spellMarkup(spell,index){
      const status=spellState(spell);const selected=spell.id===runtime.selectedSpellId;
      return `<button class="spellbook-spell${status.castable?" is-castable":""}${selected?" is-selected":""}" type="button" role="option" aria-selected="${selected}" data-spell-id="${spell.id}" data-spell-key="${String.fromCharCode(97+index)}"><span class="spellbook-spell-name"><kbd>${String.fromCharCode(97+index)})</kbd> ${escapeHtml(spell.name)}</span><span>${escapeHtml(spell.school)}</span><span>${status.effectiveLevel||"—"}</span><span>${spell.mana}</span><span>${spell.fail}%</span></button>`;
    }
    function renderDetail(){
      const spell=selectedSpell();if(!spell){detail.innerHTML="";return;}
      const status=spellState(spell);const book=selectedBook();
      detail.innerHTML=`<h2>${escapeHtml(spell.name)}</h2><div class="spellbook-detail-status${status.castable?" is-castable":""}">${status.castable?"AVAILABLE · LEARNED":"UNAVAILABLE"}</div>
        ${spell.description.map(line=>`<p>${escapeHtml(line)}</p>`).join("")}
        <dl><dt>School</dt><dd>${escapeHtml(spell.school)}</dd><dt>Spell level</dt><dd>${status.effectiveLevel||"—"}</dd><dt>Mana cost</dt><dd>${spell.mana}</dd><dt>Failure</dt><dd>${spell.fail}% · demo</dd><dt>Info</dt><dd>${escapeHtml(spell.info||"—")}</dd><dt>Source</dt><dd>${escapeHtml(book?.source.name||"—")}</dd></dl>
        ${spell.direction?'<p class="spellbook-direction-note">Requires a direction in TomeNET; targeting is outside this prototype iteration.</p>':""}
        ${runtime.mode==="cast"?`<button class="spellbook-cast" id="spellbookCast" type="button"${status.castable?"":" disabled"}>CAST · (Enter)</button>`:""}
        ${status.reason?`<p class="spellbook-block-reason">${escapeHtml(status.reason)}</p>`:""}`;
    }
    function render({focus=false}={}){
      ensureSelection();
      const books=carriedBooks();const spells=bookSpells();
      booksElement.innerHTML=books.map(bookMarkup).join("");
      spellsElement.innerHTML=spells.map(spellMarkup).join("");
      $("#spellbookWindowTitle").textContent=runtime.mode==="cast"?"CAST A SPELL":"SPELLBOOK";
      $("#spellbookModeLabel").textContent=runtime.mode.toUpperCase();
      $("#spellbookHelp").textContent=runtime.mode==="cast"?"Tab/←/→ pane · 2/8 move · a–z choose/cast · Enter next/cast · Esc close":"Tab/←/→ pane · 2/8 move · a–z inspect · A–Z paste · Esc close";
      booksPane.classList.toggle("is-active-pane",runtime.mode==="cast"&&runtime.activePane==="books");
      spellsPane.classList.toggle("is-active-pane",runtime.mode==="cast"&&runtime.activePane==="spells");
      renderDetail();
      if(focus)requestAnimationFrame(()=>focusActive());
    }
    function selectedElement(){
      const selector=runtime.activePane==="books"?`[data-spellbook-id="${runtime.selectedBookId}"]`:`[data-spell-id="${runtime.selectedSpellId}"]`;
      return (runtime.activePane==="books"?booksElement:spellsElement).querySelector(selector)||spellsElement;
    }
    function focusActive(){const target=selectedElement();target?.focus();return target;}
    function selectBook(id,{focus=true}={}){if(!bySourceId.has(id))return false;runtime.selectedBookId=id;runtime.selectedSpellId=null;render({focus});return true;}
    function selectSpell(id,{focus=true}={}){if(!bookSpells().some(spell=>spell.id===id))return false;runtime.selectedSpellId=id;render({focus});return true;}
    function move(delta){
      const entries=runtime.activePane==="books"?carriedBooks().map(entry=>entry.source.id):bookSpells().map(entry=>entry.id);if(!entries.length)return true;
      const current=runtime.activePane==="books"?runtime.selectedBookId:runtime.selectedSpellId;const index=Math.max(0,entries.indexOf(current));
      return runtime.activePane==="books"?selectBook(entries[(index+delta+entries.length)%entries.length]):selectSpell(entries[(index+delta+entries.length)%entries.length]);
    }
    function setPane(pane){runtime.activePane=pane;render({focus:true});return true;}
    function pasteSelected(){
      const spell=selectedSpell();const book=selectedBook();if(!spell)return false;
      const status=spellState(spell);appendGameMessage({markup:escapeHtml(`${spell.name} — ${spell.school}; level ${status.effectiveLevel||"—"}; cost ${spell.mana}; fail ${spell.fail}% · ${spell.description.join(" ")}`)});return true;
    }
    function castSelected(){
      const spell=selectedSpell();if(!spell)return false;const status=spellState(spell);if(!status.castable){renderDetail();return true;}
      appendGameMessage({markup:escapeHtml(`You cast ${spell.name}. (prototype only)`)});
      const closeParent=runtime.parentKind==="abilities";
      windowManager.closeKind("spellbook",{restoreFocus:!closeParent});
      if(closeParent)windowManager.closeKind("abilities");
      return true;
    }
    function isOpen(){return windowManager.has("spellbook");}
    function show(entry){
      runtime.mode=entry.payload.mode||"browse";runtime.parentKind=windowManager.snapshot().find(candidate=>candidate.instanceId===entry.parentId)?.kind||null;
      runtime.selectedBookId=entry.payload.bookId||null;runtime.selectedSpellId=null;runtime.activePane=entry.payload.pane||"books";
      overlay.hidden=false;overlay.setAttribute("aria-hidden","false");render({focus:true});
    }
    function hide(){overlay.hidden=true;overlay.setAttribute("aria-hidden","true");runtime.parentKind=null;}
    windowManager.register({kind:"spellbook",layer:"dialog",blocksGameplay:true,allowsChat:true,focusTarget:selectedElement,onOpen:show,onClose:hide});
    function openBrowseBook(inventoryIndex,opener=document.activeElement){
      const item=INVENTORY_ITEMS[inventoryIndex];if(!item?.spellSourceId||!bySourceId.has(item.spellSourceId))return false;
      return windowManager.push("spellbook",{mode:"browse",bookId:item.spellSourceId,pane:"spells"},{opener});
    }
    function openBrowse(opener=document.activeElement){return windowManager.push("spellbook",{mode:"browse",pane:"books"},{opener});}
    function openCast(opener=document.activeElement){return windowManager.push("spellbook",{mode:"cast",pane:"books"},{opener});}
    function closeWindow(){return windowManager.closeKind("spellbook");}
    function restoreFocus(){if(isOpen())requestAnimationFrame(focusActive);}
    function handleKeydown(event){
      if(!isOpen()||windowManager.top()?.kind!=="spellbook")return false;
      const editing=event.target.matches?.("input,textarea,select,[contenteditable='true']");if(editing)return false;
      if(event.key===":" )return false;
      if(event.key==="Escape"||(event.ctrlKey&&event.code==="KeyQ")){closeWindow();return true;}
      if(event.key==="Tab"){event.preventDefault();return setPane(runtime.activePane==="books"?"spells":"books");}
      if(event.key==="ArrowLeft")return setPane("books");if(event.key==="ArrowRight")return setPane("spells");
      if(event.key==="ArrowDown"||event.key==="2"||event.key==="j")return move(1);
      if(event.key==="ArrowUp"||event.key==="8"||event.key==="k")return move(-1);
      if(event.key==="Enter"||event.key===" "){if(runtime.activePane==="books")return setPane("spells");return runtime.mode==="cast"?castSelected():true;}
      if(/^[a-z]$/i.test(event.key)){
        const index=event.key.toLowerCase().charCodeAt(0)-97;
        if(runtime.activePane==="books"){const book=carriedBooks()[index];if(book)selectBook(book.source.id);return true;}
        const spell=bookSpells()[index];if(!spell)return true;selectSpell(spell.id,{focus:false});
        if(event.shiftKey&&runtime.mode==="browse")return pasteSelected();
        if(!event.shiftKey&&runtime.mode==="cast")return castSelected();
        render({focus:true});return true;
      }
      return true;
    }
    function applyControls(){state.spellbookWindowFontSize=clamp(Math.round(state.spellbookWindowFontSize),8,20);windowElement.style.setProperty("--spellbook-font-size",`${state.spellbookWindowFontSize}px`);$("#spellbookWindowFontSizeControl").value=state.spellbookWindowFontSize;$("#spellbookWindowFontSizeValue").value=`${state.spellbookWindowFontSize}px`;if(isOpen())render();}
    function resetSimulation(){runtime.mode="browse";runtime.selectedBookId=null;runtime.selectedSpellId=null;runtime.activePane="books";if(isOpen())render({focus:true});}
    booksElement.addEventListener("click",event=>{const row=event.target.closest("[data-spellbook-id]");if(row){runtime.activePane="books";selectBook(row.dataset.spellbookId);}});
    spellsElement.addEventListener("click",event=>{const row=event.target.closest("[data-spell-id]");if(row){runtime.activePane="spells";selectSpell(row.dataset.spellId);}});
    spellsElement.addEventListener("dblclick",event=>{const row=event.target.closest("[data-spell-id]");if(row&&runtime.mode==="cast"){runtime.selectedSpellId=row.dataset.spellId;castSelected();}});
    detail.addEventListener("click",event=>{if(event.target.closest("#spellbookCast"))castSelected();});
    $("#spellbookClose").addEventListener("click",closeWindow);overlay.addEventListener("click",event=>{if(event.target===overlay)closeWindow();});
    skillsFeature.subscribeSkillChanges(()=>{if(isOpen())render();});
    return{openBrowseBook,openBrowse,openCast,closeWindow,isOpen,handleKeydown,applyControls,resetSimulation,restoreFocus};
  };
})();
