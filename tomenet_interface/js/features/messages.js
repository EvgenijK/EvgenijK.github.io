(() => {
  window.TomeNetPrototype.createMessageFeature = ({$, $$, state, persist, clamp, MESSAGE_STREAM, escapeHtml, scrollMessagesToBottom, restoreFocus, closePrimaryWindow, windowManager}) => {
    const HISTORY_MODES = ["chat","all"];
    const HISTORY_DATA_STATES = ["ready","loading","empty","unavailable","error"];
    const historyOverlay = $("#messageHistoryOverlay");
    const historyWindow = $("#messageHistoryWindow");
    const historyFeed = $("#messageHistoryFeed");
    const historyState = $("#messageHistoryState");
    const historyNew = $("#messageHistoryNew");
    const historyEditor = $("#messageHistoryEditor");
    const historyInput = $("#messageHistoryInput");
    const mapChatBar = $("#mapChatBar");
    const mapChatEditor = $("#mapChatEditor");
    const mapChatMessage = $("#mapChatMessage");
    const mapChatInput = $("#mapChatInput");
    const historyScroll = {all:null,chat:null};
    const historyUnread = {all:0,chat:0};
    let lastRenderedLength = MESSAGE_STREAM.length;
    let demoMessageNumber = 1;

    function messageMarkup(message) {
      if (message.text === undefined) return message.markup;
      return `<b class="${escapeHtml(message.tone || "green")}">${escapeHtml(message.author)}:</b> ${escapeHtml(message.text)}`;
    }

    function messagesFor(mode) {
      return mode === "chat" ? MESSAGE_STREAM.filter(message => message.type === "chat") : MESSAGE_STREAM;
    }

    function messagesMarkup(messages) {
      return messages.map(message => {
        const classes = [`message-${message.type}`, message.danger ? "danger" : ""].filter(Boolean).join(" ");
        return `<p class="${classes}"><span>${messageMarkup(message)}</span></p>`;
      }).join("");
    }

    function nearBottom(element) {
      return element.scrollHeight - element.clientHeight - element.scrollTop <= 3;
    }

    function renderMapChatMessage() {
      const latestMessage = MESSAGE_STREAM.at(-1);
      mapChatMessage.className = `map-chat-message${latestMessage ? ` message-${latestMessage.type}${latestMessage.danger ? " danger" : ""}` : ""}`;
      mapChatMessage.innerHTML = latestMessage ? messageMarkup(latestMessage) : "";
    }

    function renderPinnedFeed(selector,messages) {
      const feed = $(selector);
      const wasBottom = !feed.children.length || nearBottom(feed);
      const scrollTop = feed.scrollTop;
      feed.innerHTML = messagesMarkup(messages);
      feed.scrollTop = wasBottom ? feed.scrollHeight : scrollTop;
    }

    function applyPinnedMessageModeUi() {
      if (!HISTORY_MODES.includes(state.rightPanelMessageMode)) state.rightPanelMessageMode = "all";
      $("#rightPanelMessageModeControl").value = state.rightPanelMessageMode;
      $$("[data-right-message-mode]").forEach(button => {
        const active = button.dataset.rightMessageMode === state.rightPanelMessageMode;
        button.classList.toggle("active",active);
        button.setAttribute("aria-pressed",active ? "true" : "false");
      });
      const feed = $("#msgChatFeed");
      feed.setAttribute("aria-label",state.rightPanelMessageMode === "chat" ? "Player chat messages" : "Chat and all game messages");
    }

    function setPinnedMessageMode(mode) {
      state.rightPanelMessageMode = HISTORY_MODES.includes(mode) ? mode : "all";
      applyPinnedMessageModeUi();
      const feed = $("#msgChatFeed");
      feed.innerHTML = messagesMarkup(messagesFor(state.rightPanelMessageMode));
      feed.scrollTop = feed.scrollHeight;
      persist();
    }

    function historyStateCopy(dataState) {
      return {
        loading:"Loading message history…",
        empty:state.messageHistoryMode === "chat" ? "No player messages." : "No messages recorded.",
        unavailable:"Message history is unavailable.",
        error:"Message history could not be displayed."
      }[dataState] || "";
    }

    function updateNewMessageButton() {
      const count = historyUnread[state.messageHistoryMode] || 0;
      historyNew.hidden = !isHistoryOpen() || state.messageHistoryDataState !== "ready" || count === 0;
      historyNew.textContent = `${count} NEW MESSAGE${count === 1 ? "" : "S"}`;
    }

    function renderHistory({switching=false,forceBottom=false,appended=[]} = {}) {
      if (!isHistoryOpen()) return;
      const mode = state.messageHistoryMode;
      const wasBottom = nearBottom(historyFeed);
      if (!switching) historyScroll[mode] = historyFeed.scrollTop;
      const matchingNew = appended.filter(message => mode === "all" || message.type === "chat").length;
      if (matchingNew && !forceBottom && !wasBottom) historyUnread[mode] += matchingNew;

      const dataState = state.messageHistoryDataState;
      historyState.hidden = dataState === "ready";
      historyState.className = `message-history-state is-${dataState}`;
      historyState.textContent = historyStateCopy(dataState);
      historyFeed.hidden = dataState !== "ready";
      if (dataState === "ready") {
        const messages = messagesFor(mode);
        if (!messages.length) {
          historyFeed.innerHTML = "";
          historyState.hidden = false;
          historyState.className = "message-history-state is-empty";
          historyState.textContent = historyStateCopy("empty");
        } else {
          historyFeed.innerHTML = messagesMarkup(messages);
          requestAnimationFrame(() => {
            const saved = historyScroll[mode];
            if (forceBottom || saved === null || (!switching && wasBottom)) {
              historyFeed.scrollTop = historyFeed.scrollHeight;
              historyUnread[mode] = 0;
            } else historyFeed.scrollTop = saved;
            historyScroll[mode] = historyFeed.scrollTop;
            updateNewMessageButton();
          });
        }
      }
      $$("[data-message-history-tab]").forEach(button => {
        const active = button.dataset.messageHistoryTab === mode;
        button.setAttribute("aria-selected",active ? "true" : "false");
        button.tabIndex = active ? 0 : -1;
      });
      updateNewMessageButton();
    }

    function buildMessageFeeds({forceHistoryBottom=false} = {}) {
      const appended = MESSAGE_STREAM.slice(lastRenderedLength);
      lastRenderedLength = MESSAGE_STREAM.length;
      applyPinnedMessageModeUi();
      renderPinnedFeed("#msgChatFeed",messagesFor(state.rightPanelMessageMode));
      renderMapChatMessage();
      if (isHistoryOpen()) {
        for (const mode of HISTORY_MODES) {
          if (mode === state.messageHistoryMode) continue;
          historyUnread[mode] += appended.filter(message => mode === "all" || message.type === "chat").length;
        }
        renderHistory({forceBottom:forceHistoryBottom,appended});
      }
    }

    function appendChatMessage(text,forceHistoryBottom) {
      MESSAGE_STREAM.push({type:"chat",author:"MaiaMage",tone:"green",text});
      buildMessageFeeds({forceHistoryBottom});
      scrollMessagesToBottom();
    }

    function appendDemoMessage() {
      MESSAGE_STREAM.push({type:"chat",author:"Lightbearer",tone:"cyan",text:`Incoming prototype message ${demoMessageNumber++}.`});
      buildMessageFeeds();
    }

    function appendGameMessage(message) {
      if (!message || (message.text === undefined && message.markup === undefined)) return false;
      MESSAGE_STREAM.push({type:"world",...message});
      buildMessageFeeds();
      scrollMessagesToBottom();
      return true;
    }

    function isHistoryOpen() { return windowManager.has("message-history"); }

    function setHistoryMode(mode,options = {}) {
      if (!HISTORY_MODES.includes(mode)) mode = "all";
      if (isHistoryOpen() && state.messageHistoryMode !== mode) historyScroll[state.messageHistoryMode] = historyFeed.scrollTop;
      state.messageHistoryMode = mode;
      persist();
      renderHistory({switching:true,forceBottom:options.forceBottom});
      if (options.focus !== false) requestAnimationFrame(() => historyFeed.focus());
    }

    function showHistoryWindow() {
      historyOverlay.hidden = false;
      historyOverlay.setAttribute("aria-hidden","false");
      renderHistory({switching:true});
      requestAnimationFrame(() => historyFeed.focus());
    }

    function hideHistoryWindow() {
      historyScroll[state.messageHistoryMode] = historyFeed.scrollTop;
      closeHistoryChatEditor(false);
      historyOverlay.hidden = true;
      historyOverlay.setAttribute("aria-hidden","true");
      historyNew.hidden = true;
    }

    windowManager.register({
      kind:"message-history",layer:"primary",blocksGameplay:true,allowsChat:true,
      focusTarget:() => historyFeed,onOpen:showHistoryWindow,onClose:hideHistoryWindow
    });
    windowManager.register({kind:"history-chat-input",layer:"technical",blocksGameplay:true,allowsChat:true,focusTarget:() => historyInput});
    windowManager.register({kind:"chat-input",layer:"technical",blocksGameplay:true,allowsChat:true,focusTarget:() => mapChatInput});

    function openHistory(mode = state.messageHistoryMode,opener = document.activeElement) {
      if (isHistoryOpen()) {
        setHistoryMode(mode);
        return;
      }
      closePrimaryWindow?.();
      state.messageHistoryMode = HISTORY_MODES.includes(mode) ? mode : "all";
      persist();
      windowManager.open("message-history",{mode:state.messageHistoryMode},{opener,dataState:state.messageHistoryDataState});
    }

    function closeHistory() {
      return windowManager.closeKind("message-history");
    }

    function openMapChatEditor(initialValue = "") {
      if (isHistoryOpen()) {
        openHistoryChatEditor(initialValue);
        return;
      }
      if (!windowManager.has("chat-input")) windowManager.open("chat-input",{initialValue},{opener:document.activeElement});
      mapChatBar.classList.add("is-editing");
      mapChatMessage.hidden = true;
      mapChatEditor.hidden = false;
      mapChatInput.value = initialValue;
      requestAnimationFrame(() => mapChatInput.focus());
    }

    function closeMapChatEditor() {
      windowManager.closeKind("chat-input",{restoreFocus:false,force:true});
      mapChatBar.classList.remove("is-editing");
      mapChatEditor.hidden = true;
      mapChatMessage.hidden = false;
      mapChatInput.value = "";
      mapChatInput.blur();
      restoreFocus();
    }

    function openHistoryChatEditor(initialValue = "") {
      if (!isHistoryOpen()) return;
      if (!windowManager.has("history-chat-input")) windowManager.open("history-chat-input",{initialValue},{opener:document.activeElement});
      historyWindow.classList.add("is-editing");
      historyEditor.hidden = false;
      historyInput.value = initialValue;
      requestAnimationFrame(() => historyInput.focus());
    }

    function closeHistoryChatEditor(returnFocus = true) {
      windowManager.closeKind("history-chat-input",{restoreFocus:false,force:true});
      historyWindow.classList.remove("is-editing");
      historyEditor.hidden = true;
      historyInput.value = "";
      historyInput.blur();
      if (returnFocus && isHistoryOpen()) requestAnimationFrame(() => historyFeed.focus());
    }

    function applyHistoryControls() {
      state.messageHistoryFontSize = clamp(Math.round(state.messageHistoryFontSize),8,20);
      state.messageHistoryOpacity = clamp(Math.round(state.messageHistoryOpacity),20,95);
      if (!HISTORY_MODES.includes(state.messageHistoryMode)) state.messageHistoryMode = "all";
      if (!HISTORY_DATA_STATES.includes(state.messageHistoryDataState)) state.messageHistoryDataState = "ready";
      historyWindow.style.setProperty("--message-history-font-size",`${state.messageHistoryFontSize}px`);
      historyWindow.style.setProperty("--message-history-opacity",state.messageHistoryOpacity / 100);
      $("#messageHistoryFontSizeControl").value = state.messageHistoryFontSize;
      $("#messageHistoryFontSizeValue").value = `${state.messageHistoryFontSize}px`;
      $("#messageHistoryOpacityControl").value = state.messageHistoryOpacity;
      $("#messageHistoryOpacityValue").value = `${state.messageHistoryOpacity}%`;
      $("#messageHistoryDataStateControl").value = state.messageHistoryDataState;
      renderHistory();
    }

    function trapHistoryFocus(event) {
      const focusable = [...historyWindow.querySelectorAll('button:not([disabled]), input:not([disabled]), [tabindex="0"]')].filter(element => !element.hidden && element.offsetParent !== null);
      if (!focusable.length) return;
      const current = focusable.indexOf(document.activeElement);
      const next = event.shiftKey ? (current <= 0 ? focusable.length - 1 : current - 1) : (current === focusable.length - 1 ? 0 : current + 1);
      focusable[next].focus();
    }

    function handleKeydown(event) {
      const ctrlOnly = event.ctrlKey && !event.altKey && !event.metaKey;
      const togglePinnedMode = event.ctrlKey && event.shiftKey && !event.altKey && !event.metaKey && event.code === "KeyY";
      const editing = event.target.matches?.("input, textarea, select, [contenteditable='true']");
      if (!isHistoryOpen()) {
        if (togglePinnedMode && !editing && state.msgChatVisible && !windowManager.gameplayBlocked()) {
          setPinnedMessageMode(state.rightPanelMessageMode === "all" ? "chat" : "all");
          return true;
        }
        if (ctrlOnly && event.key.toLowerCase() === "p") { openHistory("all");return true; }
        if (ctrlOnly && event.key.toLowerCase() === "o") { openHistory("chat");return true; }
        return false;
      }
      if (!historyEditor.hidden) {
        if (event.key === "Escape") { closeHistoryChatEditor();return true; }
        return false;
      }
      if (ctrlOnly && event.key.toLowerCase() === "p") { setHistoryMode("all");return true; }
      if (ctrlOnly && event.key.toLowerCase() === "o") { setHistoryMode("chat");return true; }
      if (event.key === ":") { openHistoryChatEditor();return true; }
      if (event.key === "Escape") { closeHistory();return true; }
      if (event.key === "Tab") { trapHistoryFocus(event);return true; }
      return false;
    }

    mapChatEditor.addEventListener("submit",event => {
      event.preventDefault();
      const text = mapChatInput.value.trim();
      if (text) appendChatMessage(text,false);
      closeMapChatEditor();
    });
    historyEditor.addEventListener("submit",event => {
      event.preventDefault();
      const text = historyInput.value.trim();
      if (text) appendChatMessage(text,true);
      closeHistoryChatEditor();
    });
    $("#messageExpand").addEventListener("click",event => openHistory(state.rightPanelMessageMode,event.currentTarget));
    $(".right-message-view-switch").addEventListener("click",event => {
      const button = event.target.closest("[data-right-message-mode]");
      if (button) setPinnedMessageMode(button.dataset.rightMessageMode);
    });
    $("#messageHistoryClose").addEventListener("click",closeHistory);
    historyOverlay.addEventListener("click",event => { if (event.target === historyOverlay) closeHistory(); });
    historyNew.addEventListener("click",() => {
      historyFeed.scrollTop = historyFeed.scrollHeight;
      historyUnread[state.messageHistoryMode] = 0;
      historyScroll[state.messageHistoryMode] = historyFeed.scrollTop;
      updateNewMessageButton();
      historyFeed.focus();
    });
    historyFeed.addEventListener("scroll",() => {
      historyScroll[state.messageHistoryMode] = historyFeed.scrollTop;
      if (nearBottom(historyFeed)) {
        historyUnread[state.messageHistoryMode] = 0;
        updateNewMessageButton();
      }
    });
    $(".message-history-tabs").addEventListener("click",event => {
      const button = event.target.closest("[data-message-history-tab]");
      if (button) setHistoryMode(button.dataset.messageHistoryTab);
    });
    $(".message-history-tabs").addEventListener("keydown",event => {
      if (!["ArrowLeft","ArrowRight"].includes(event.key)) return;
      const index = HISTORY_MODES.indexOf(state.messageHistoryMode);
      setHistoryMode(HISTORY_MODES[(index + (event.key === "ArrowRight" ? 1 : -1) + HISTORY_MODES.length) % HISTORY_MODES.length]);
      event.preventDefault();
    });

    return {
      buildMessageFeeds,appendDemoMessage,appendGameMessage,setPinnedMessageMode,openHistory,closeHistory,isHistoryOpen,handleKeydown,applyHistoryControls,
      openMapChatEditor,closeMapChatEditor,mapChatEditor,historyEditor
    };
  };
})();
