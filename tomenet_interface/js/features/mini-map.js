(() => {
  window.TomeNetPrototype.createMiniMapFeature = ({
    state,$,windowManager,mapState,mapViewport,mapCellAt,localPriority,termPalette,worldData
  }) => {
    const localData = window.TOMENET_BREE_MAP;
    const overlay = $("#miniMapOverlay");
    const mapWindow = $("#miniMapWindow");
    const canvas = $("#miniMapCanvas");
    const context = canvas.getContext("2d",{alpha:false});
    const closeButton = $("#miniMapClose");
    const title = $("#miniMapTitle");
    const modeLabel = $("#miniMapModeLabel");
    const statePanel = $("#miniMapState");
    const status = $("#miniMapStatus");
    const help = $("#miniMapHelp");
    const legend = $("#miniMapLegend");
    const atlas = new Image();
    const worldView = {cameraX:0,cameraY:0,selector:null,hover:null};
    const dataStates = new Set(["ready","loading","empty","unavailable","error"]);
    const localScale = 3;
    const localCellWidth = 8;
    const localCellHeight = 12;
    let atlasReady = false;

    const clamp = (value,min,max) => Math.max(min,Math.min(max,value));
    const activeContext = () => state.miniMapContext === "world" ? "world" : "local";
    const isOpen = () => windowManager.has("mini-map");

    function setStatus(text) { status.textContent = text; }
    function localDimensions() {
      return {
        width:Math.ceil((localData?.width || 0) / localScale),
        height:Math.ceil((localData?.height || 0) / localScale)
      };
    }
    function localCellPriority(cell) {
      if (!cell) return -1;
      return localPriority?.symbols?.[cell.symbol]
        ?? localPriority?.names?.[cell.name]
        ?? (cell.passable ? localPriority?.passable : localPriority?.blocked)
        ?? localPriority?.default ?? 0;
    }
    function representativeLocalCell(col,row) {
      let chosen = null;
      let priority = -Infinity;
      for (let dy=0;dy<localScale;dy++) for (let dx=0;dx<localScale;dx++) {
        const cell = mapCellAt(col * localScale + dx,row * localScale + dy);
        const candidatePriority = localCellPriority(cell);
        if (cell && candidatePriority > priority) {
          chosen = cell;
          priority = candidatePriority;
        }
      }
      return chosen;
    }
    function drawGlyph(glyph,color,x,y,width,height,fontSize=10) {
      context.save();
      context.font = `bold ${fontSize}px monospace`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.lineWidth = 2;
      context.strokeStyle = "#000";
      context.strokeText(glyph,x + width / 2,y + height / 2);
      context.fillStyle = color;
      context.fillText(glyph,x + width / 2,y + height / 2);
      context.restore();
    }
    function drawLocalTile(cell,col,row) {
      const x = col * localCellWidth;
      const y = row * localCellHeight;
      context.fillStyle = "#020402";
      context.fillRect(x,y,localCellWidth,localCellHeight);
      if (atlasReady && Number.isInteger(cell?.tile) && cell.tile >= 0 && cell.tile < localData.atlasTiles) {
        context.drawImage(atlas,cell.tile * 16,cell.color * 24,16,24,x,y,localCellWidth,localCellHeight);
      } else if (cell) {
        const glyph = cell.symbol === " " ? (cell.glyph || ".") : cell.symbol;
        drawGlyph(glyph,termPalette[cell.color] || "#fff",x,y,localCellWidth,localCellHeight,8);
      }
    }
    function renderLocal() {
      const dimensions = localDimensions();
      canvas.width = dimensions.width * localCellWidth;
      canvas.height = dimensions.height * localCellHeight;
      mapWindow.style.setProperty("--mini-map-window-width","990px");
      context.imageSmoothingEnabled = false;
      context.fillStyle = "#000";
      context.fillRect(0,0,canvas.width,canvas.height);
      for (let row=0;row<dimensions.height;row++) for (let col=0;col<dimensions.width;col++)
        drawLocalTile(representativeLocalCell(col,row),col,row);

      const viewport = mapViewport();
      context.save();
      context.strokeStyle = "rgba(87,235,224,.92)";
      context.lineWidth = 1;
      context.strokeRect(
        Math.floor(mapState.cameraX / localScale) * localCellWidth + .5,
        Math.floor(mapState.cameraY / localScale) * localCellHeight + .5,
        Math.ceil(viewport.width / localScale) * localCellWidth - 1,
        Math.ceil(viewport.height / localScale) * localCellHeight - 1
      );
      context.restore();
      const playerCol = Math.floor(mapState.playerX / localScale);
      const playerRow = Math.floor(mapState.playerY / localScale);
      drawGlyph("@",termPalette[9] || "#fff",playerCol * localCellWidth,playerRow * localCellHeight,localCellWidth,localCellHeight,10);

      legend.innerHTML = '<span><i style="--legend-color:#cdcdcd"></i>@ player</span><span><i style="--legend-color:#57ebe0"></i>current viewport</span>';
      setStatus(`Player ${mapState.playerX}, ${mapState.playerY} · Camera ${mapState.cameraX}, ${mapState.cameraY} · Full Bree map ${dimensions.width}×${dimensions.height}`);
    }

    function resetWorldCamera() {
      worldView.cameraX = clamp(worldData.player.x - Math.floor(worldData.viewWidth / 2),0,worldData.width-worldData.viewWidth);
      worldView.cameraY = clamp(worldData.player.y - Math.floor(worldData.viewHeight / 2),0,worldData.height-worldData.viewHeight);
    }
    function keepWorldPointVisible(point) {
      worldView.cameraX = clamp(worldView.cameraX,point.x-worldData.viewWidth+1,point.x);
      worldView.cameraY = clamp(worldView.cameraY,point.y-worldData.viewHeight+1,point.y);
      worldView.cameraX = clamp(worldView.cameraX,0,worldData.width-worldData.viewWidth);
      worldView.cameraY = clamp(worldView.cameraY,0,worldData.height-worldData.viewHeight);
    }
    function worldCellAt(x,y) { return worldData.cells[y]?.[x] || null; }
    function worldDistance(a,b) {
      const dx = Math.abs(a.x-b.x);
      const dy = Math.abs(a.y-b.y);
      return Math.max(dx,dy) + Math.floor(Math.min(dx,dy) / 2);
    }
    function describeWorldPoint(point,prefix="Center") {
      const cell = worldCellAt(point.x,point.y);
      const biome = worldData.biomes[cell?.biome] || worldData.biomes.unknown;
      const name = cell?.feature?.name || biome.name;
      if (prefix === "Hover") return `Hover ${point.x}, ${point.y} · ${name}`;
      if (!worldView.selector) return `${prefix} ${point.x}, ${point.y} · ${name}`;
      const dx = point.x-worldData.player.x;
      const dy = point.y-worldData.player.y;
      return `Selector ${point.x}, ${point.y} · ${name} · Offset ${dx >= 0 ? "+" : ""}${dx}, ${dy >= 0 ? "+" : ""}${dy} · Dist ${worldDistance(point,worldData.player)}`;
    }
    function drawWorldMarker(glyph,color,x,y) {
      drawGlyph(glyph,color,x * 10,y * 10,10,10,9);
    }
    function renderWorld() {
      const cellSize = 10;
      canvas.width = worldData.viewWidth * cellSize;
      canvas.height = worldData.viewHeight * cellSize;
      mapWindow.style.setProperty("--mini-map-window-width","960px");
      context.imageSmoothingEnabled = false;
      context.fillStyle = "#000";
      context.fillRect(0,0,canvas.width,canvas.height);
      for (let row=0;row<worldData.viewHeight;row++) for (let col=0;col<worldData.viewWidth;col++) {
        const cell = worldCellAt(worldView.cameraX+col,worldView.cameraY+row);
        const biome = worldData.biomes[cell?.biome] || worldData.biomes.unknown;
        context.fillStyle = biome.fill;
        context.fillRect(col*cellSize,row*cellSize,cellSize,cellSize);
        context.fillStyle = biome.line;
        if ((col+row)%2 === 0) context.fillRect(col*cellSize+2,row*cellSize+2,2,2);
        if (cell?.feature) drawWorldMarker(cell.feature.glyph,cell.feature.color,col,row);
      }
      const playerCol = worldData.player.x-worldView.cameraX;
      const playerRow = worldData.player.y-worldView.cameraY;
      if (playerCol >= 0 && playerCol < worldData.viewWidth && playerRow >= 0 && playerRow < worldData.viewHeight)
        drawWorldMarker("@","#fff3a0",playerCol,playerRow);
      if (worldView.selector) {
        const col = worldView.selector.x-worldView.cameraX;
        const row = worldView.selector.y-worldView.cameraY;
        if (col >= 0 && col < worldData.viewWidth && row >= 0 && row < worldData.viewHeight) {
          context.strokeStyle = "#ffdb59";
          context.lineWidth = 2;
          context.strokeRect(col*cellSize+1,row*cellSize+1,cellSize-2,cellSize-2);
        }
      }
      if (worldView.hover) {
        const col = worldView.hover.x-worldView.cameraX;
        const row = worldView.hover.y-worldView.cameraY;
        context.strokeStyle = "rgba(102,238,232,.9)";
        context.lineWidth = 1;
        context.strokeRect(col*cellSize+.5,row*cellSize+.5,cellSize-1,cellSize-1);
      }
      const keys = ["ocean","grass","forest","swamp","mountain","desert","ice","unknown"];
      legend.innerHTML = keys.map(key => `<span><i style="--legend-color:${worldData.biomes[key].fill}"></i>${worldData.biomes[key].name}</span>`).join("")
        + '<span><i style="--legend-color:#fff3a0"></i>@ player</span><span><i style="--legend-color:#ffdb59"></i>selector</span>';
      const center = worldView.hover || worldView.selector || {
        x:clamp(worldView.cameraX+Math.floor(worldData.viewWidth/2),0,worldData.width-1),
        y:clamp(worldView.cameraY+Math.floor(worldData.viewHeight/2),0,worldData.height-1)
      };
      setStatus(describeWorldPoint(center,worldView.hover ? "Hover" : "Center"));
    }

    function render() {
      const mapContextName = activeContext();
      title.textContent = mapContextName === "world" ? "WILDERNESS MAP · DEMO" : "LOCAL MINI-MAP · BREE";
      modeLabel.textContent = mapContextName === "world" ? "PROTOTYPE-ONLY · 64×64" : "STATIC 3×3 COMPRESSION";
      help.textContent = mapContextName === "world"
        ? "Directions pan · s selector · 5 / Space / r player · M / Esc close · : chat"
        : "Full map · 5 / Space / r player · M / Esc close · : chat";
      const dataState = dataStates.has(state.miniMapDataState) ? state.miniMapDataState : "ready";
      const stateText = {
        loading:"Loading mini-map data…",empty:"No map information is available for this area.",
        unavailable:"Mini-map is unavailable in the current context.",error:"Mini-map data could not be rendered."
      }[dataState];
      statePanel.hidden = dataState === "ready";
      canvas.hidden = dataState !== "ready";
      legend.hidden = dataState !== "ready";
      statePanel.className = `mini-map-state is-${dataState}`;
      if (stateText) {
        statePanel.textContent = stateText;
        setStatus(stateText);
        return;
      }
      if (mapContextName === "world") renderWorld();
      else if (localData) renderLocal();
      else {
        canvas.hidden = true;
        legend.hidden = true;
        statePanel.hidden = false;
        statePanel.className = "mini-map-state is-error";
        statePanel.textContent = "Bree map data is unavailable.";
      }
    }

    function showWindow() {
      overlay.hidden = false;
      overlay.setAttribute("aria-hidden","false");
      render();
      requestAnimationFrame(() => canvas.focus());
    }
    function hideWindow() {
      overlay.hidden = true;
      overlay.setAttribute("aria-hidden","true");
      worldView.hover = null;
    }
    windowManager.register({
      kind:"mini-map",layer:"primary",blocksGameplay:true,allowsChat:true,
      focusTarget:() => canvas,onOpen:showWindow,onClose:hideWindow
    });
    function openWindow(opener=document.activeElement) {
      if (isOpen()) return windowManager.closeKind("mini-map");
      return windowManager.open("mini-map",{context:activeContext()},{opener});
    }
    function closeWindow() { return windowManager.closeKind("mini-map"); }
    function restoreFocus() { if (isOpen()) requestAnimationFrame(() => canvas.focus()); }
    function applyControls() {
      if (!["local","world"].includes(state.miniMapContext)) state.miniMapContext = "local";
      if (!dataStates.has(state.miniMapDataState)) state.miniMapDataState = "ready";
      const contextControl = $("#miniMapContextControl");
      const dataControl = $("#miniMapDataStateControl");
      if (contextControl) contextControl.value = state.miniMapContext;
      if (dataControl) dataControl.value = state.miniMapDataState;
      resetWorldCamera();
      worldView.selector = null;
      worldView.hover = null;
      if (isOpen()) render();
    }
    function resetSimulation() {
      worldView.selector = null;
      worldView.hover = null;
      resetWorldCamera();
      if (isOpen()) render();
    }
    function directionFor(event) {
      const arrows = {ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
      const numpad = {Numpad1:[-1,1],Numpad2:[0,1],Numpad3:[1,1],Numpad4:[-1,0],Numpad6:[1,0],Numpad7:[-1,-1],Numpad8:[0,-1],Numpad9:[1,-1]};
      return arrows[event.key] || numpad[event.code] || null;
    }
    function handleDirection(dx,dy) {
      if (activeContext() === "local") {
        setStatus("LOCAL MAP IS FULLY VISIBLE · directional scrolling applies only to the wilderness map");
        return;
      }
      if (worldView.selector) {
        worldView.selector.x = clamp(worldView.selector.x+dx,0,worldData.width-1);
        worldView.selector.y = clamp(worldView.selector.y+dy,0,worldData.height-1);
        keepWorldPointVisible(worldView.selector);
      } else {
        worldView.cameraX = clamp(worldView.cameraX+dx*worldData.scrollStep,0,worldData.width-worldData.viewWidth);
        worldView.cameraY = clamp(worldView.cameraY+dy*worldData.scrollStep,0,worldData.height-worldData.viewHeight);
      }
      render();
    }
    function recenter() {
      if (activeContext() === "world") {
        resetWorldCamera();
        if (worldView.selector) worldView.selector = {...worldData.player};
        render();
      } else {
        renderLocal();
        setStatus(`Player ${mapState.playerX}, ${mapState.playerY} · Full Bree map is already centered`);
      }
    }
    function toggleSelector() {
      if (activeContext() !== "world") {
        setStatus("The s selector is available only on the wilderness map.");
        return;
      }
      worldView.selector = worldView.selector ? null : {...worldData.player};
      if (worldView.selector) keepWorldPointVisible(worldView.selector);
      render();
    }
    function handleKeydown(event) {
      const editing = event.target.matches?.("input, textarea, select, [contenteditable='true']");
      const mapKey = event.code === "KeyM" && event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey;
      if (!isOpen()) {
        if (!mapKey || editing || windowManager.gameplayBlocked()) return false;
        openWindow();
        return true;
      }
      if (editing) return false;
      if (event.key === ":" && !event.ctrlKey && !event.altKey && !event.metaKey) return false;
      if (event.key === "Escape") {
        if (activeContext() === "world" && worldView.selector) {
          worldView.selector = null;
          render();
        } else closeWindow();
        return true;
      }
      if (event.code === "KeyM" && !event.ctrlKey && !event.altKey && !event.metaKey) { closeWindow();return true; }
      if (event.ctrlKey && event.code === "KeyT") {
        setStatus("Mini-map screenshot capture is not implemented in this prototype.");
        return true;
      }
      if (event.key === "Tab") {
        (document.activeElement === closeButton ? canvas : closeButton).focus();
        return true;
      }
      const direction = directionFor(event);
      if (direction) { handleDirection(...direction);return true; }
      if (event.code === "Numpad5" || event.key === "5" || event.code === "Space" || event.key.toLowerCase() === "r") { recenter();return true; }
      if (event.key.toLowerCase() === "s" && !event.ctrlKey && !event.altKey && !event.metaKey) { toggleSelector();return true; }
      return true;
    }
    function pointerPoint(event) {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;
      const col = clamp(Math.floor((event.clientX-rect.left)/rect.width*canvas.width),0,canvas.width-1);
      const row = clamp(Math.floor((event.clientY-rect.top)/rect.height*canvas.height),0,canvas.height-1);
      if (activeContext() === "world") return {x:worldView.cameraX+Math.floor(col/10),y:worldView.cameraY+Math.floor(row/10)};
      return {col:Math.floor(col/localCellWidth),row:Math.floor(row/localCellHeight)};
    }
    canvas.addEventListener("pointermove",event => {
      if (state.miniMapDataState !== "ready") return;
      const point = pointerPoint(event);
      if (!point) return;
      if (activeContext() === "world") {
        worldView.hover = point;
        renderWorld();
      } else {
        const cell = representativeLocalCell(point.col,point.row);
        if (cell) setStatus(`Mini-cell ${point.col}, ${point.row} · source ${cell.x}, ${cell.y} · ${cell.name} · ${cell.passable ? "walkable" : "blocked"}`);
      }
    });
    canvas.addEventListener("pointerleave",() => {
      if (activeContext() === "world" && worldView.hover) {
        worldView.hover = null;
        renderWorld();
      } else if (activeContext() === "local" && isOpen()) renderLocal();
    });
    canvas.addEventListener("click",event => {
      if (activeContext() !== "world" || state.miniMapDataState !== "ready") return;
      const point = pointerPoint(event);
      if (!point) return;
      worldView.selector = point;
      keepWorldPointVisible(point);
      render();
      canvas.focus();
    });
    closeButton.addEventListener("click",closeWindow);
    overlay.addEventListener("click",event => { if (event.target === overlay) closeWindow(); });
    atlas.addEventListener("load",() => { atlasReady = true;if (isOpen() && activeContext() === "local") render(); });
    atlas.addEventListener("error",() => { atlasReady = false;if (isOpen() && activeContext() === "local") render(); });
    atlas.src = "assets/classic-16x24-bree.bmp";
    resetWorldCamera();

    return {openWindow,closeWindow,isOpen,handleKeydown,restoreFocus,applyControls,resetSimulation,render};
  };
})();
