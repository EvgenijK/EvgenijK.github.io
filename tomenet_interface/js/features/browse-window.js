(() => {
  window.TomeNetPrototype.createBrowseWindowFeature = ({
    state,$,$$,clamp,escapeHtml,INVENTORY_ITEMS,INVENTORY_ICONS,BAGS,windowManager,
    openItemContextMenu,closeItemContextMenu,invokeItemActionForRow
  }) => {
    const overlay = $("#browseOverlay");
    const windowElement = $("#browseWindow");
    const body = $("#browseWindowBody");
    const title = $("#browseWindowTitle");
    const back = $("#browseWindowBack");
    const help = $("#browseWindowHelp");
    let page = "selector";
    let selectedBrowseIndex = 0;
    let selectedBagSlot = null;
    let selectedBagItem = 0;
    let selectorScrollTop = 0;
    const bagScrollTop = new Map();

    const browsableItems = () => INVENTORY_ITEMS.map((item,index) => ({item,index})).filter(({item}) => item.type === "bag" || item.type === "book" || item.browsable);
    const currentBag = () => BAGS.find(bag => bag.slot === selectedBagSlot) || null;
    const isOpen = () => windowManager.has("browse");

    function selectedElement() {
      if (page === "selector") return body.querySelector(`[data-browse-index="${selectedBrowseIndex}"]`);
      if (page === "bag") return body.querySelector(`[data-bag-slot="${selectedBagSlot}"][data-item-index="${selectedBagItem}"]`);
      return back;
    }

    function stateMarkup(kind) {
      const content = {
        loading:["LOADING","Reading available books and containers…"],
        empty:["NOTHING TO BROWSE","You carry no books or subinventory containers."],
        unavailable:["BROWSE UNAVAILABLE","Browsable inventory data is unavailable in this prototype state."],
        error:["BROWSE ERROR","The list could not be prepared. Close Browse and try again."]
      }[kind] || ["NOTHING TO BROWSE","No matching entries are available."];
      return `<div class="browse-state${kind === "error" ? " is-error" : ""}" role="status"><strong>${content[0]}</strong><span>${content[1]}</span></div>`;
    }

    function selectorMarkup() {
      const entries = browsableItems();
      if (state.browseDataState !== "ready") return stateMarkup(state.browseDataState);
      if (!entries.length) return stateMarkup("empty");
      return `<div class="browse-selector" role="listbox" aria-label="Books and containers">${entries.map(({item,index},position) => {
        const bag = item.type === "bag" ? BAGS.find(entry => entry.slot === item.bagId) : null;
        const meta = bag ? `${bag.items.length} / ${bag.capacity}` : "BOOK";
        const label = String.fromCharCode(97 + position);
        return `<div class="browse-row" id="browse-choice-${position}" role="option" tabindex="-1" aria-selected="false" data-browse-index="${position}" data-inventory-index="${index}" style="--browse-color:${item.color}"><span class="browse-row-icon">${INVENTORY_ICONS[item.icon]}</span><span class="browse-row-key">${label})</span><span class="browse-row-name" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</span><span class="browse-row-meta">${meta}</span></div>`;
      }).join("")}</div>`;
    }

    function bagMarkup(bag) {
      const rows = Array.from({length:bag.capacity},(_,index) => {
        const item = bag.items[index];
        const label = String.fromCharCode(97 + index);
        if (!item) return `<div class="browse-row is-empty" role="option" aria-disabled="true"><span></span><span></span><span></span><span></span></div>`;
        return `<div class="browse-row" id="browse-bag-${bag.slot}-${index}" role="option" tabindex="-1" aria-selected="false" data-item-source="bag" data-bag-slot="${bag.slot}" data-item-index="${index}" aria-haspopup="menu" style="--browse-color:${item.color}"><span class="browse-row-icon">${INVENTORY_ICONS[item.icon]}</span><span class="browse-row-key">${label})</span><span class="browse-row-name" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</span><span class="browse-row-meta">${item.weight.toFixed(1)} lb</span></div>`;
      }).join("");
      return `<div class="browse-bag-summary" style="--browse-color:${bag.color}"><span>${INVENTORY_ICONS[bag.icon]}</span><strong>${escapeHtml(bag.name)}</strong><span>${bag.items.length} / ${bag.capacity}</span></div><div class="browse-bag-list" role="listbox" aria-label="Contents of ${escapeHtml(bag.name)}">${rows}</div>`;
    }

    function bookMarkup(item) {
      return `<div class="browse-book-placeholder"><span>${INVENTORY_ICONS.book}</span><strong>${escapeHtml(item.name)}</strong><p>Book browsing is represented by this placeholder. The complete Spellbook and spell-list interface remains a separate menu task.</p></div>`;
    }

    function selectCurrent(index,focus = true) {
      if (page === "selector") {
        const entries = browsableItems();
        if (!entries.length || state.browseDataState !== "ready") return;
        selectedBrowseIndex = clamp(index,0,entries.length - 1);
        $$('[data-browse-index]').forEach(row => {
          const selected = Number(row.dataset.browseIndex) === selectedBrowseIndex;
          row.classList.toggle("is-selected",selected);
          row.setAttribute("aria-selected",selected ? "true" : "false");
          row.tabIndex = selected ? 0 : -1;
        });
      } else if (page === "bag") {
        const bag = currentBag();
        if (!bag?.items.length) return;
        selectedBagItem = clamp(index,0,bag.items.length - 1);
        $$(`#browseWindowBody [data-bag-slot="${bag.slot}"][data-item-index]`).forEach(row => {
          const selected = Number(row.dataset.itemIndex) === selectedBagItem;
          row.classList.toggle("is-selected",selected);
          row.setAttribute("aria-selected",selected ? "true" : "false");
          row.tabIndex = selected ? 0 : -1;
        });
      }
      const selected = selectedElement();
      if (focus && selected) requestAnimationFrame(() => { selected.focus();selected.scrollIntoView({block:"nearest"}); });
    }

    function saveScroll() {
      if (page === "selector") selectorScrollTop = body.scrollTop;
      else if (page === "bag" && selectedBagSlot) bagScrollTop.set(selectedBagSlot,body.scrollTop);
    }

    function render(focus = true) {
      closeItemContextMenu(false);
      if (state.browseDataState !== "ready") {
        page = "selector";
        back.hidden = true;
        title.textContent = "BROWSE";
        help.textContent = "Esc to close";
        body.innerHTML = stateMarkup(state.browseDataState);
        if (focus) requestAnimationFrame(() => $("#browseWindowClose").focus());
        return;
      }
      back.hidden = page === "selector";
      if (page === "selector") {
        title.textContent = "BROWSE";
        help.textContent = "Letter opens item · Arrows + Enter · Esc to close";
        body.innerHTML = selectorMarkup();
        requestAnimationFrame(() => { body.scrollTop = selectorScrollTop;selectCurrent(selectedBrowseIndex,focus); });
      } else if (page === "bag") {
        const bag = currentBag();
        title.textContent = bag ? `BROWSE · ${bag.name.toUpperCase()}` : "BROWSE";
        help.textContent = "Letter opens actions · Arrows + Enter · s to unstow · Backspace to list · Esc to close";
        body.innerHTML = bag ? bagMarkup(bag) : stateMarkup("unavailable");
        requestAnimationFrame(() => { body.scrollTop = bagScrollTop.get(selectedBagSlot) || 0;selectCurrent(selectedBagItem,focus); });
      } else {
        const entry = browsableItems()[selectedBrowseIndex];
        title.textContent = entry ? `BROWSE · ${entry.item.name.toUpperCase()}` : "BROWSE";
        help.textContent = "Backspace to list · Esc to close";
        body.innerHTML = entry ? bookMarkup(entry.item) : stateMarkup("unavailable");
        if (focus) requestAnimationFrame(() => back.focus());
      }
    }

    function showWindow(entry) {
      page = entry.payload?.page || "selector";
      selectedBagSlot = entry.payload?.bagSlot || null;
      if (entry.payload?.browseIndex !== undefined) selectedBrowseIndex = entry.payload.browseIndex;
      selectedBagItem = 0;
      overlay.hidden = false;
      overlay.setAttribute("aria-hidden","false");
      render();
    }
    function hideWindow() {
      closeItemContextMenu(false);
      overlay.hidden = true;
      overlay.setAttribute("aria-hidden","true");
      body.innerHTML = "";
      page = "selector";
      selectedBagSlot = null;
    }

    windowManager.register({kind:"browse",layer:"dialog",blocksGameplay:true,allowsChat:true,focusTarget:selectedElement,onOpen:showWindow,onClose:hideWindow});

    function openBrowse(opener = document.activeElement) {
      closeItemContextMenu(false);
      if (isOpen()) return true;
      return windowManager.push("browse",{page:"selector"},{opener});
    }
    function openBag(slot,opener = document.activeElement) {
      const bag = BAGS.find(entry => entry.slot === slot);
      if (!bag) return false;
      closeItemContextMenu(false);
      saveScroll();
      selectedBagSlot = slot;
      selectedBagItem = 0;
      page = "bag";
      if (isOpen()) render();
      else windowManager.push("browse",{page:"bag",bagSlot:slot},{opener});
      return true;
    }
    function openBook(inventoryIndex,opener = document.activeElement) {
      const position = browsableItems().findIndex(entry => entry.index === inventoryIndex);
      if (position < 0) return false;
      closeItemContextMenu(false);
      selectedBrowseIndex = position;
      page = "book";
      if (isOpen()) render();
      else windowManager.push("browse",{page:"book",browseIndex:position},{opener});
      return true;
    }
    function closeBrowse() { return windowManager.closeKind("browse"); }
    function goBack() {
      if (page === "selector") return false;
      saveScroll();
      page = "selector";
      render();
      return true;
    }
    function activateSelected() {
      if (page === "selector") {
        const entry = browsableItems()[selectedBrowseIndex];
        if (!entry) return;
        if (entry.item.type === "bag") openBag(entry.item.bagId,selectedElement());
        else openBook(entry.index,selectedElement());
      } else if (page === "bag") {
        const row = selectedElement();
        if (row) openItemContextMenu(row);
      }
    }

    function activateLetter(index) {
      const count = page === "selector" ? browsableItems().length : currentBag()?.items.length || 0;
      if (index < 0 || index >= count) return;
      selectCurrent(index,false);
      activateSelected();
    }

    function handleKeydown(event,editing) {
      if (editing || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey) return false;
      if (!isOpen()) {
        const primary = windowManager.top("primary");
        const allowedParent = ["inventory","combined-items"].includes(primary?.kind);
        if (event.key !== "b" || (windowManager.gameplayBlocked() && !allowedParent)) return false;
        openBrowse(document.activeElement);
        return true;
      }
      if (event.key === "Escape") { closeBrowse();return true; }
      if (event.key === "Backspace") { event.preventDefault();goBack();return true; }
      if (page === "book") return true;
      if (event.key === "ArrowUp") selectCurrent((page === "selector" ? selectedBrowseIndex : selectedBagItem) - 1);
      else if (event.key === "ArrowDown") selectCurrent((page === "selector" ? selectedBrowseIndex : selectedBagItem) + 1);
      else if (["Enter"," "].includes(event.key)) activateSelected();
      else if (/^[a-w]$/.test(event.key)) {
        const index = event.key.charCodeAt(0) - 97;
        const count = page === "selector" ? browsableItems().length : currentBag()?.items.length || 0;
        if (index < count) activateLetter(index);
        else if (page === "bag" && event.key === "s") {
          const row = selectedElement();
          if (row) invokeItemActionForRow(row,"unstow");
        }
      }
      return true;
    }

    function applyControls() {
      state.browseWindowFontSize = clamp(Math.round(state.browseWindowFontSize),8,24);
      if (!["ready","loading","empty","unavailable","error"].includes(state.browseDataState)) state.browseDataState = "ready";
      windowElement.style.setProperty("--browse-font-size",`${state.browseWindowFontSize}px`);
      $("#browseWindowFontSizeControl").value = state.browseWindowFontSize;
      $("#browseWindowFontSizeValue").value = `${state.browseWindowFontSize}px`;
      $("#browseDataStateControl").value = state.browseDataState;
      $("#browseInventoryFullControl").checked = state.browseInventoryFull;
      if (isOpen()) render(false);
    }

    $("#browseWindowClose").addEventListener("click",closeBrowse);
    back.addEventListener("click",goBack);
    overlay.addEventListener("click",event => { if (event.target === overlay) closeBrowse(); });
    body.addEventListener("click",event => {
      const browseRow = event.target.closest("[data-browse-index]");
      const bagRow = event.target.closest('[data-item-source="bag"]');
      if (browseRow) { selectedBrowseIndex = Number(browseRow.dataset.browseIndex);selectCurrent(selectedBrowseIndex,false);activateSelected(); }
      else if (bagRow) { selectedBagItem = Number(bagRow.dataset.itemIndex);selectCurrent(selectedBagItem,false);openItemContextMenu(bagRow,{clientX:event.clientX,clientY:event.clientY}); }
    });
    body.addEventListener("scroll",saveScroll,{passive:true});
    $("#bagsList").addEventListener("click",event => {
      const header = event.target.closest("[data-browse-bag]");
      if (header) openBag(header.dataset.browseBag,header);
    });
    $("#bagsList").addEventListener("keydown",event => {
      const header = event.target.closest("[data-browse-bag]");
      if (header && ["Enter"," "].includes(event.key)) { event.preventDefault();openBag(header.dataset.browseBag,header); }
    });

    return {openBrowse,openBag,openBook,closeBrowse,isOpen,handleKeydown,applyControls,restoreFocus:() => selectedElement()?.focus()};
  };
})();
