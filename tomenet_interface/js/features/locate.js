(() => {
  window.TomeNetPrototype.createLocateFeature = ({
    state,$,windowManager,mapState,mapViewport,clampMapCamera,renderMap,applyMapControls,recenterMapCamera,appendGameMessage
  }) => {
    const mapData = window.TOMENET_BREE_MAP;
    const canvas = $("#mapCanvas");
    const mode = $("#locateMode");
    const status = $("#locateStatus");
    const runtime = {homeCol:0,homeRow:0,col:0,row:0};

    const isOpen = () => windowManager.has("locate");
    function panelGeometry() {
      const viewport = mapViewport();
      const stepX = Math.max(1,Math.floor(viewport.width/2));
      const stepY = Math.max(1,Math.floor(viewport.height/2));
      return {
        stepX,stepY,
        maxCol:Math.max(0,Math.floor((mapData.width-viewport.width)/stepX)),
        maxRow:Math.max(0,Math.floor((mapData.height-viewport.height)/stepY))
      };
    }
    function playerPanel() {
      const viewport = mapViewport();
      const geometry = panelGeometry();
      return {
        col:Math.max(0,Math.min(geometry.maxCol,Math.floor((mapState.playerX-Math.floor(viewport.width/4))/geometry.stepX))),
        row:Math.max(0,Math.min(geometry.maxRow,Math.floor((mapState.playerY-Math.floor(viewport.height/4))/geometry.stepY)))
      };
    }
    function relativeDescription() {
      const vertical = runtime.row < runtime.homeRow ? "North " : runtime.row > runtime.homeRow ? "South " : "";
      const horizontal = runtime.col < runtime.homeCol ? "West " : runtime.col > runtime.homeCol ? "East " : "";
      return vertical || horizontal ? `${vertical}${horizontal}of your sector` : "your sector";
    }
    function updateStatus(tone="") {
      status.className = `locate-mode-status${tone ? ` is-${tone}` : ""}`;
      status.textContent = `Map sector [${runtime.col},${runtime.row}] (${relativeDescription()}). Direction (or ESC)?`;
    }
    function applyPanel() {
      const geometry = panelGeometry();
      mapState.cameraX = runtime.col*geometry.stepX;
      mapState.cameraY = runtime.row*geometry.stepY;
      clampMapCamera();
      mapState.hover = null;
      renderMap();
      applyMapControls();
    }
    function show() {
      const home = playerPanel();
      runtime.homeCol = runtime.col = home.col;
      runtime.homeRow = runtime.row = home.row;
      state.mapFollow = false;
      mode.hidden = false;
      mode.setAttribute("aria-hidden","false");
      canvas.classList.add("is-locating");
      canvas.setAttribute("aria-label","Locate mode: use direction keys to examine Bree panels");
      applyPanel();
      updateStatus();
      requestAnimationFrame(() => canvas.focus());
    }
    function hide() {
      mode.hidden = true;
      mode.setAttribute("aria-hidden","true");
      canvas.classList.remove("is-locating");
      const viewport = mapViewport();
      canvas.setAttribute("aria-label",`Bree map, ${viewport.width} by ${viewport.height} cell viewport`);
      recenterMapCamera(true);
    }
    windowManager.register({
      kind:"locate",layer:"primary",blocksGameplay:true,allowsChat:true,
      focusTarget:() => canvas,onOpen:show,onClose:hide
    });
    function open(opener=canvas) {
      if (isOpen()) return windowManager.closeKind("locate");
      if (windowManager.gameplayBlocked()) return false;
      return windowManager.open("locate",{},{opener});
    }
    function close() { return windowManager.closeKind("locate"); }
    function restoreFocus() { if (isOpen()) requestAnimationFrame(() => canvas.focus()); }
    function directionFor(event) {
      const arrows = {ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
      const digits = {"1":[-1,1],"2":[0,1],"3":[1,1],"4":[-1,0],"6":[1,0],"7":[-1,-1],"8":[0,-1],"9":[1,-1]};
      return arrows[event.key] || digits[event.key] || null;
    }
    function move(dx,dy) {
      const geometry = panelGeometry();
      const nextCol = Math.max(0,Math.min(geometry.maxCol,runtime.col+dx));
      const nextRow = Math.max(0,Math.min(geometry.maxRow,runtime.row+dy));
      const boundary = nextCol === runtime.col && nextRow === runtime.row;
      runtime.col = nextCol;
      runtime.row = nextRow;
      applyPanel();
      updateStatus(boundary ? "boundary" : "");
    }
    function handleKeydown(event) {
      const editing = event.target.matches?.("input,textarea,select,[contenteditable='true']");
      const locateKey = event.code === "KeyL" && event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey;
      if (!isOpen()) {
        if (!locateKey || editing || windowManager.gameplayBlocked()) return false;
        open(document.activeElement || canvas);
        return true;
      }
      if (editing) return false;
      if (event.key === ":" && !event.ctrlKey && !event.altKey && !event.metaKey) return false;
      if (event.key === "Escape" || event.code === "Space" || locateKey) { close();return true; }
      if (event.ctrlKey && !event.altKey && !event.metaKey && event.code === "KeyT") {
        appendGameMessage({markup:"Screenshot saved as 'screenshot????'. <small>(Locate prototype only; no file was created.)</small>"});
        updateStatus();
        return true;
      }
      if (event.ctrlKey || event.altKey || event.metaKey) return true;
      const direction = directionFor(event);
      if (direction) { move(...direction);return true; }
      status.className = "locate-mode-status is-error";
      status.textContent = "Use a direction, Shift+L, Space, Esc, : or Ctrl+T.";
      return true;
    }
    function reset() { if (isOpen()) close(); }

    return {open,close,isOpen,handleKeydown,restoreFocus,reset};
  };
})();
