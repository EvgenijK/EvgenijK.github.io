(() => {
  window.TomeNetPrototype.createMapFeature = ({state,persist,$,clamp,getThrowTarget,updateThrowTarget}) => {
  const MAP_DATA = window.TOMENET_BREE_MAP;
  const MAP_COLORS = [
    "#000000","#ffffff","#9d9d9d","#ff8d00","#b70000","#009d44","#0000ff","#8d6600",
    "#666666","#cdcdcd","#af00ff","#ffff00","#ff3030","#00ff00","#00ffff","#c79d55"
  ];
  const mapCanvas = $("#mapCanvas");
  const mapContext = mapCanvas.getContext("2d",{alpha:false});
  const mapAtlas = new Image();
  const mapState = {
    playerX:MAP_DATA?.start.x ?? 121,
    playerY:MAP_DATA?.start.y ?? 30,
    cameraX:0,cameraY:0,hover:null,atlasReady:false,drag:null,blocked:null
  };

  function mapViewport() { return MAP_DATA.viewport; }

  function mapCellAt(x,y) {
    if (!MAP_DATA || x < 0 || y < 0 || x >= MAP_DATA.width || y >= MAP_DATA.height) return null;
    const symbol = MAP_DATA.rows[y][x];
    return {x,y,symbol,...MAP_DATA.tiles[symbol]};
  }

  function clampMapCamera() {
    const viewport = mapViewport();
    mapState.cameraX = clamp(Math.round(mapState.cameraX),0,MAP_DATA.width - viewport.width);
    mapState.cameraY = clamp(Math.round(mapState.cameraY),0,MAP_DATA.height - viewport.height);
  }

  function recenterMapCamera(enableFollow = true) {
    const viewport = mapViewport();
    mapState.cameraX = mapState.playerX - Math.floor(viewport.width / 2);
    mapState.cameraY = mapState.playerY - Math.floor(viewport.height / 2);
    clampMapCamera();
    if (enableFollow) state.mapFollow = true;
    applyMapControls();
    renderMap();
  }

  function mapControlPositionText() {
    const output = $("#mapControlPosition");
    if (output) output.value = `Player ${mapState.playerX}, ${mapState.playerY} · Camera ${mapState.cameraX}, ${mapState.cameraY}`;
  }

  function drawMapGlyph(text,color,x,y) {
    mapContext.save();
    mapContext.font = "bold 20px monospace";
    mapContext.textAlign = "center";
    mapContext.textBaseline = "middle";
    mapContext.lineWidth = 3;
    mapContext.strokeStyle = "#000";
    mapContext.strokeText(text,x + 8,y + 12);
    mapContext.fillStyle = color;
    mapContext.fillText(text,x + 8,y + 12);
    mapContext.restore();
  }

  function drawMapTile(cell,viewportX,viewportY) {
    const viewport = mapViewport();
    const x = viewportX * viewport.tileWidth;
    const y = viewportY * viewport.tileHeight;
    mapContext.fillStyle = "#000";
    mapContext.fillRect(x,y,viewport.tileWidth,viewport.tileHeight);
    if (mapState.atlasReady && Number.isInteger(cell.tile) && cell.tile >= 0 && cell.tile < MAP_DATA.atlasTiles) {
      mapContext.drawImage(mapAtlas,cell.tile * viewport.tileWidth,cell.color * viewport.tileHeight,
        viewport.tileWidth,viewport.tileHeight,x,y,viewport.tileWidth,viewport.tileHeight);
    } else {
      const base = MAP_DATA.tiles[" "];
      if (mapState.atlasReady && cell.passable && Number.isInteger(base.tile)) {
        mapContext.drawImage(mapAtlas,base.tile * viewport.tileWidth,base.color * viewport.tileHeight,
          viewport.tileWidth,viewport.tileHeight,x,y,viewport.tileWidth,viewport.tileHeight);
      }
      drawMapGlyph(cell.symbol === " " ? cell.glyph : cell.symbol,MAP_COLORS[cell.color] || "#fff",x,y);
    }
  }

  function renderMap() {
    if (!MAP_DATA) {
      mapContext.fillStyle = "#000";
      mapContext.fillRect(0,0,mapCanvas.width,mapCanvas.height);
      drawMapGlyph("Map data unavailable","#ff3030",mapCanvas.width / 2 - 8,mapCanvas.height / 2 - 12);
      return;
    }
    const viewport = mapViewport();
    mapContext.imageSmoothingEnabled = false;
    mapContext.fillStyle = "#000";
    mapContext.fillRect(0,0,mapCanvas.width,mapCanvas.height);
    for (let viewY = 0; viewY < viewport.height; viewY++) for (let viewX = 0; viewX < viewport.width; viewX++) {
      const cell = mapCellAt(mapState.cameraX + viewX,mapState.cameraY + viewY);
      if (cell) drawMapTile(cell,viewX,viewY);
    }
    if (state.mapGrid || getThrowTarget()) {
      mapContext.save();
      mapContext.strokeStyle = "rgba(120,190,180,.13)";
      mapContext.lineWidth = 1;
      mapContext.beginPath();
      for (let x = 0; x <= viewport.width; x++) {
        mapContext.moveTo(x * viewport.tileWidth + .5,0);
        mapContext.lineTo(x * viewport.tileWidth + .5,mapCanvas.height);
      }
      for (let y = 0; y <= viewport.height; y++) {
        mapContext.moveTo(0,y * viewport.tileHeight + .5);
        mapContext.lineTo(mapCanvas.width,y * viewport.tileHeight + .5);
      }
      mapContext.stroke();
      mapContext.restore();
    }
    if (mapState.hover && !getThrowTarget()) {
      const viewX = mapState.hover.x - mapState.cameraX;
      const viewY = mapState.hover.y - mapState.cameraY;
      mapContext.strokeStyle = "rgba(89,246,239,.9)";
      mapContext.lineWidth = 1;
      mapContext.strokeRect(viewX * viewport.tileWidth + .5,viewY * viewport.tileHeight + .5,
        viewport.tileWidth - 1,viewport.tileHeight - 1);
    }
    if (mapState.blocked && performance.now() < mapState.blocked.until) {
      const viewX = mapState.blocked.x - mapState.cameraX;
      const viewY = mapState.blocked.y - mapState.cameraY;
      if (viewX >= 0 && viewY >= 0 && viewX < viewport.width && viewY < viewport.height) {
        mapContext.fillStyle = "rgba(255,48,48,.35)";
        mapContext.fillRect(viewX * viewport.tileWidth,viewY * viewport.tileHeight,viewport.tileWidth,viewport.tileHeight);
      }
    }
    const playerViewX = mapState.playerX - mapState.cameraX;
    const playerViewY = mapState.playerY - mapState.cameraY;
    if (playerViewX >= 0 && playerViewY >= 0 && playerViewX < viewport.width && playerViewY < viewport.height)
      drawMapGlyph("@",MAP_COLORS[9],playerViewX * viewport.tileWidth,playerViewY * viewport.tileHeight);
    mapControlPositionText();
  }

  function fitMapCanvas() {
    const view = $("#gameView");
    const size = Math.max(1,Math.floor(Math.min(view.clientWidth,view.clientHeight)));
    $("#mapStage").style.setProperty("--map-canvas-size",`${size}px`);
    if (getThrowTarget()) updateThrowTarget(getThrowTarget().col,getThrowTarget().row);
  }

  function mapPointerCell(clientX,clientY) {
    const rect = mapCanvas.getBoundingClientRect();
    if (clientX < rect.left || clientY < rect.top || clientX >= rect.right || clientY >= rect.bottom) return null;
    const viewport = mapViewport();
    const col = clamp(Math.floor((clientX - rect.left) / rect.width * viewport.width),0,viewport.width - 1);
    const row = clamp(Math.floor((clientY - rect.top) / rect.height * viewport.height),0,viewport.height - 1);
    return {col,row,x:mapState.cameraX + col,y:mapState.cameraY + row};
  }

  function showMapCellInfo(cell) {
    const info = $("#mapCellInfo");
    if (!cell || !state.mapCellInfo) {
      info.hidden = true;
      return;
    }
    info.textContent = `${cell.x}, ${cell.y} · ${cell.name} · ${cell.passable ? "walkable" : "blocked"}`;
    info.hidden = false;
  }

  function moveMapPlayer(dx,dy) {
    const target = mapCellAt(mapState.playerX + dx,mapState.playerY + dy);
    if (!target?.passable) {
      if (target) {
        mapState.blocked = {x:target.x,y:target.y,until:performance.now() + 160};
        renderMap();
        setTimeout(() => { mapState.blocked = null;renderMap(); },170);
      }
      return;
    }
    mapState.playerX = target.x;
    mapState.playerY = target.y;
    mapState.blocked = null;
    if (state.mapFollow) recenterMapCamera(false);
    else renderMap();
  }

  function mapMovementDelta(event) {
    const arrows = {ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
    const numpad = {Numpad1:[-1,1],Numpad2:[0,1],Numpad3:[1,1],Numpad4:[-1,0],Numpad6:[1,0],Numpad7:[-1,-1],Numpad8:[0,-1],Numpad9:[1,-1]};
    return arrows[event.key] || numpad[event.code] || null;
  }

  function applyMapControls() {
    $("#mapGridControl").checked = state.mapGrid;
    $("#mapCellInfoControl").checked = state.mapCellInfo;
    $("#mapFollowControl").checked = state.mapFollow;
    if (!state.mapCellInfo) $("#mapCellInfo").hidden = true;
    mapControlPositionText();
  }

  function resetMapPlayer() {
    mapState.playerX = MAP_DATA.start.x;
    mapState.playerY = MAP_DATA.start.y;
    mapState.hover = null;
    recenterMapCamera(true);
  }

  function initMap() {
    recenterMapCamera(false);
    applyMapControls();
    fitMapCanvas();
    mapAtlas.addEventListener("load", () => { mapState.atlasReady = true;renderMap(); });
    mapAtlas.addEventListener("error", renderMap);
    mapAtlas.src = "assets/classic-16x24-bree.bmp";
    new ResizeObserver(() => fitMapCanvas()).observe($("#gameView"));
  }

  return {
    mapCanvas,mapState,mapViewport,mapCellAt,recenterMapCamera,renderMap,fitMapCanvas,
    mapPointerCell,showMapCellInfo,moveMapPlayer,mapMovementDelta,applyMapControls,
    resetMapPlayer,initMap,clampMapCamera
  };
  };
})();
