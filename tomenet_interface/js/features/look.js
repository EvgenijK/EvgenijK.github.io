(() => {
  window.TomeNetPrototype.createLookFeature = ({
    state,$,windowManager,mapState,mapViewport,mapCellAt,mapPointerCell,recenterMapCamera,renderMap,applyMapControls,appendGameMessage,activityActions,points
  }) => {
    const canvas = $("#mapCanvas");
    const mode = $("#lookMode");
    const modeLabel = $("#lookModeLabel");
    const cursor = $("#lookCursor");
    const description = $("#lookDescription");
    const help = $("#lookHelp");
    const contextMenu = $("#mapContextMenu");
    const card = $("#lookCard");
    const cardState = $("#lookCardState");
    const cardTitle = $("#lookCardTitle");
    const cardText = $("#lookCardText");
    const mapStage = $("#mapStage");
    const runtime = {
      manual:false,selected:null,manualPoint:null,automaticPoint:null,contextPoint:null,
      hoverPoint:null,previewTimer:null,cardTimer:null,cardPinned:false,requestSerial:0,
      lookCache:new Map(),lookInflight:new Map()
    };

    const isOpen = () => windowManager.has("look");
    const contextOpen = () => windowManager.has("map-context");
    const playerPoint = () => ({id:"player",kind:"player",x:mapState.playerX,y:mapState.playerY,name:"MaiaMage",description:"MaiaMage the Enlightened Maia Istari",interesting:true,visible:true});
    function visibleInterestingPoints() {
      const viewport = mapViewport();
      return [playerPoint(),...points].filter(point => point.visible && point.interesting && point.x >= mapState.cameraX && point.y >= mapState.cameraY && point.x < mapState.cameraX+viewport.width && point.y < mapState.cameraY+viewport.height)
        .sort((a,b) => distanceFromPlayer(a)-distanceFromPlayer(b));
    }
    function distanceFromPlayer(point) {
      const dx = Math.abs(point.x-mapState.playerX);
      const dy = Math.abs(point.y-mapState.playerY);
      return Math.max(dx,dy)+Math.floor(Math.min(dx,dy)/2);
    }
    function pointDataAt(x,y) {
      const special = [playerPoint(),...points].find(point => point.visible && point.x === x && point.y === y);
      if (special) return special;
      const cell = mapCellAt(x,y);
      return cell ? {kind:"terrain",x,y,name:cell.name,description:`${cell.name} · ${cell.passable ? "walkable" : "blocked"}`} : {kind:"unknown",x,y,name:"Unknown grid",description:"Unknown grid"};
    }
    function previewAt(x,y) {
      const unavailable = availabilityMessage();
      if (unavailable) return {available:false,x,y,name:"Look unavailable",description:unavailable};
      return {available:true,...pointDataAt(x,y)};
    }
    function lookCacheKey(point) {
      const cell = mapCellAt(point.x,point.y);
      return `${point.x}:${point.y}:${point.id || point.kind || "grid"}:${point.description}:${cell?.symbol || ""}`;
    }
    function requestLookAt(x,y) {
      const preview = previewAt(x,y);
      if (!preview.available) return Promise.resolve(preview);
      const key = lookCacheKey(preview);
      if (runtime.lookCache.has(key)) return Promise.resolve({...runtime.lookCache.get(key),cached:true});
      if (runtime.lookInflight.has(key)) return runtime.lookInflight.get(key);
      const request = new Promise(resolve => setTimeout(() => {
        const result = {...preview,available:true,cached:false};
        runtime.lookCache.set(key,result);
        runtime.lookInflight.delete(key);
        resolve(result);
      },120));
      runtime.lookInflight.set(key,request);
      return request;
    }
    function clearCardTimer() {
      if (runtime.cardTimer) clearTimeout(runtime.cardTimer);
      runtime.cardTimer = null;
    }
    function hideCard() {
      clearCardTimer();
      card.hidden = true;
      runtime.cardPinned = false;
    }
    function positionCard(point) {
      const viewport = mapViewport();
      const canvasRect = canvas.getBoundingClientRect();
      const stageRect = mapStage.getBoundingClientRect();
      const cellWidth = canvasRect.width/viewport.width;
      const cellHeight = canvasRect.height/viewport.height;
      const cellLeft = canvasRect.left+(point.x-mapState.cameraX)*cellWidth;
      const cellTop = canvasRect.top+(point.y-mapState.cameraY)*cellHeight;
      const cardRect = card.getBoundingClientRect();
      let left = cellLeft+cellWidth-stageRect.left+8;
      let top = cellTop-stageRect.top;
      if (left+cardRect.width > canvasRect.right-stageRect.left-4) left = cellLeft-stageRect.left-cardRect.width-8;
      if (top+cardRect.height > canvasRect.bottom-stageRect.top-4) top = canvasRect.bottom-stageRect.top-cardRect.height-4;
      card.style.left = `${Math.max(4,Math.min(stageRect.width-cardRect.width-4,left))}px`;
      card.style.top = `${Math.max(4,Math.min(stageRect.height-cardRect.height-4,top))}px`;
    }
    function showCard(point,data,state="preview",{pinned=false,autoHide=0}={}) {
      clearCardTimer();
      runtime.cardPinned = pinned;
      card.dataset.state = state;
      cardState.textContent = state === "loading" ? "LOADING"
        : state === "result" ? `LOOK RESULT${data.cached ? " · CACHED" : ""}`
        : state === "unavailable" ? "UNAVAILABLE" : "LOCAL PREVIEW";
      cardTitle.textContent = data.name || "Unknown grid";
      cardText.textContent = `${data.description} · [${point.x},${point.y}]`;
      card.hidden = false;
      positionCard(point);
      if (autoHide) runtime.cardTimer = setTimeout(hideCard,autoHide);
    }
    function showUnavailableCard(point,message,{autoHide=4000}={}) {
      showCard(point,{name:"Look unavailable",description:message},"unavailable",{pinned:true,autoHide});
    }
    function queueLocalPreview(point) {
      runtime.hoverPoint = {x:point.x,y:point.y};
      if (runtime.previewTimer) clearTimeout(runtime.previewTimer);
      runtime.previewTimer = setTimeout(() => {
        if (!isOpen() || !runtime.hoverPoint || runtime.hoverPoint.x !== point.x || runtime.hoverPoint.y !== point.y) return;
        runtime.cardPinned = false;
        const preview = previewAt(point.x,point.y);
        if (preview.available) showCard(point,preview,"preview");
        else showUnavailableCard(point,preview.description,{autoHide:0});
      },150);
    }
    function resolveLook(point,{oneShot=false}={}) {
      if (runtime.previewTimer) clearTimeout(runtime.previewTimer);
      runtime.previewTimer = null;
      runtime.hoverPoint = {x:point.x,y:point.y};
      const preview = previewAt(point.x,point.y);
      if (!preview.available) {
        showUnavailableCard(point,preview.description);
        appendGameMessage({markup:preview.description});
        return;
      }
      const serial = ++runtime.requestSerial;
      showCard(point,preview,"loading",{pinned:true});
      requestLookAt(point.x,point.y).then(result => {
        if (serial !== runtime.requestSerial) return;
        if (!oneShot && !isOpen()) return;
        showCard(point,result,"result",{pinned:true,autoHide:oneShot ? 4000 : 0});
        appendGameMessage({author:"Look",tone:"cyan",text:`${result.description} · [${point.x},${point.y}]`});
      });
    }
    function updateCursor(point) {
      const viewport = mapViewport();
      const col = point.x-mapState.cameraX;
      const row = point.y-mapState.cameraY;
      cursor.style.setProperty("--look-x",`${col/viewport.width*100}%`);
      cursor.style.setProperty("--look-y",`${row/viewport.height*100}%`);
      cursor.style.setProperty("--look-width",`${100/viewport.width}%`);
      cursor.style.setProperty("--look-height",`${100/viewport.height}%`);
    }
    function describe(point,{inspected=true}={}) {
      runtime.selected = point;
      updateCursor(point);
      description.className = "look-description";
      description.textContent = inspected
        ? `${point.description} · [${point.x},${point.y}]`
        : `Manual cursor [${point.x},${point.y}] · press l or click to inspect`;
    }
    function setManual(manual,point) {
      runtime.manual = manual;
      mode.classList.toggle("is-manual",manual);
      modeLabel.textContent = manual ? "MANUAL GROUND CURSOR" : "INTERESTING POSITIONS";
      help.textContent = manual
        ? "Directions move cursor · l inspect · p automatic · q / Esc close · : chat"
        : "Directions browse · p manual cursor · q / Esc close · : chat";
      if (manual) {
        runtime.manualPoint = point || runtime.manualPoint || playerPoint();
        describe(runtime.manualPoint,{inspected:false});
      } else {
        runtime.automaticPoint = runtime.automaticPoint || visibleInterestingPoints()[0] || playerPoint();
        describe(runtime.automaticPoint);
      }
    }
    function availabilityMessage() {
      return state.lookAvailability === "blind" ? "You can't see a damn thing!"
        : state.lookAvailability === "hallucinating" ? "You can't believe what you are seeing!" : "";
    }
    function show(entry) {
      const target = entry.payload?.target;
      if (!target) recenterMapCamera(true);
      mode.hidden = false;
      mode.setAttribute("aria-hidden","false");
      canvas.classList.add("is-looking");
      canvas.setAttribute("aria-label","Look mode: browse interesting positions or inspect a map cell");
      runtime.automaticPoint = visibleInterestingPoints()[0] || playerPoint();
      runtime.manualPoint = null;
      if (target) {
        setManual(true,{x:target.x,y:target.y});
        describe(pointDataAt(target.x,target.y));
        const preview = previewAt(target.x,target.y);
        if (preview.available) showCard(target,preview,"preview");
      } else setManual(false);
      requestAnimationFrame(() => canvas.focus());
    }
    function hide() {
      runtime.requestSerial++;
      if (runtime.previewTimer) clearTimeout(runtime.previewTimer);
      runtime.previewTimer = null;
      runtime.hoverPoint = null;
      hideCard();
      mode.hidden = true;
      mode.setAttribute("aria-hidden","true");
      canvas.classList.remove("is-looking");
      const viewport = mapViewport();
      canvas.setAttribute("aria-label",`Bree map, ${viewport.width} by ${viewport.height} cell viewport`);
      runtime.selected = null;
      runtime.manualPoint = null;
      renderMap();
      applyMapControls();
    }
    windowManager.register({kind:"look",layer:"primary",blocksGameplay:true,allowsChat:true,focusTarget:() => canvas,onOpen:show,onClose:hide});
    windowManager.register({kind:"map-context",layer:"context",blocksGameplay:true,allowsChat:true,focusTarget:() => contextMenu.querySelector('[data-map-action="look"]'),onClose:hideContextMenu});

    function open(opener=canvas,target=null) {
      if (isOpen()) return false;
      const unavailable = availabilityMessage();
      if (unavailable) {
        appendGameMessage({markup:unavailable});
        if (target) showUnavailableCard(target,unavailable);
        return false;
      }
      if (windowManager.gameplayBlocked()) return false;
      return windowManager.open("look",target ? {target} : {},{opener});
    }
    function close() { return windowManager.closeKind("look"); }
    function restoreFocus() { if (isOpen()) requestAnimationFrame(() => canvas.focus()); }
    function directionFor(event) {
      const arrows = {ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
      const digits = {"1":[-1,1],"2":[0,1],"3":[1,1],"4":[-1,0],"6":[1,0],"7":[-1,-1],"8":[0,-1],"9":[1,-1]};
      return arrows[event.key] || digits[event.key] || null;
    }
    function pickDirectional(origin,dx,dy) {
      let best = null;
      let bestValue = Infinity;
      visibleInterestingPoints().forEach(point => {
        const rx = point.x-origin.x;
        const ry = point.y-origin.y;
        if (dx && rx*dx <= 0) return;
        if (dy && ry*dy <= 0) return;
        const ax = Math.abs(rx);
        const ay = Math.abs(ry);
        if (dy && !dx && ax > ay) return;
        if (dx && !dy && ay > ax) return;
        const value = ax > ay ? ax*2+ay : ay*2+ax;
        if (value < bestValue) { best=point;bestValue=value; }
      });
      return best;
    }
    function move(dx,dy) {
      runtime.hoverPoint = null;
      hideCard();
      if (runtime.manual) {
        const viewport = mapViewport();
        runtime.manualPoint = {
          x:Math.max(mapState.cameraX,Math.min(mapState.cameraX+viewport.width-1,runtime.manualPoint.x+dx)),
          y:Math.max(mapState.cameraY,Math.min(mapState.cameraY+viewport.height-1,runtime.manualPoint.y+dy))
        };
        describe(runtime.manualPoint,{inspected:false});
        return;
      }
      const next = pickDirectional(runtime.automaticPoint,dx,dy);
      if (next) {
        runtime.automaticPoint = next;
        describe(next);
      } else {
        description.className = "look-description is-error";
        description.textContent = "No interesting visible position in that direction.";
      }
    }
    function inspectManual(point=runtime.manualPoint) {
      runtime.manualPoint = {x:point.x,y:point.y};
      setManual(true,runtime.manualPoint);
      describe(pointDataAt(point.x,point.y));
    }
    function hideContextMenu() {
      contextMenu.hidden = true;
      runtime.contextPoint = null;
    }
    function closeContextMenu(options) { return windowManager.closeKind("map-context",options); }
    function openContextMenu(event) {
      event.preventDefault();
      if (windowManager.gameplayBlocked()) return false;
      const point = mapPointerCell(event.clientX,event.clientY);
      if (!point) return false;
      runtime.contextPoint = {x:point.x,y:point.y};
      activityActions.syncContextMenu(contextMenu);
      contextMenu.hidden = false;
      contextMenu.style.left = "0px";
      contextMenu.style.top = "0px";
      const bounds = contextMenu.getBoundingClientRect();
      const margin = 6;
      contextMenu.style.left = `${Math.max(margin,Math.min(event.clientX,window.innerWidth-bounds.width-margin))}px`;
      contextMenu.style.top = `${Math.max(margin,Math.min(event.clientY,window.innerHeight-bounds.height-margin))}px`;
      windowManager.open("map-context",{point:runtime.contextPoint},{opener:canvas});
      requestAnimationFrame(() => contextMenu.querySelector('[data-map-action="look"]')?.focus());
      return true;
    }
    function activateContextInspect() {
      const point = runtime.contextPoint && {...runtime.contextPoint};
      closeContextMenu({force:true});
      if (!point) return;
      resolveLook(point,{oneShot:true});
    }
    function activateContextLookMode() {
      const point = runtime.contextPoint && {...runtime.contextPoint};
      closeContextMenu({restoreFocus:false,force:true});
      if (point) open(canvas,point);
    }
    function activateContextAction(action) {
      if (action === "look") activateContextInspect();
      else if (action === "look-mode") activateContextLookMode();
      else if (["search-once","search-mode","rest"].includes(action)) {
        closeContextMenu({force:true});
        activityActions.activate(action);
      }
    }
    function handleKeydown(event) {
      const editing = event.target.matches?.("input,textarea,select,[contenteditable='true']");
      if (contextOpen()) {
        if (event.key === "Escape") { closeContextMenu();return true; }
        if (event.key.toLowerCase() === "l") { activateContextInspect();return true; }
        if (event.key === "s") { activateContextAction("search-once");return true; }
        if (event.key === "S") { activateContextAction("search-mode");return true; }
        if (event.key === "R") { activateContextAction("rest");return true; }
        if (event.key === "Enter" || event.key === " ") {
          activateContextAction(document.activeElement?.dataset.mapAction);
          return true;
        }
        if (event.key === "Tab") {
          const buttons = [...contextMenu.querySelectorAll("button:not(:disabled)")];
          const current = Math.max(0,buttons.indexOf(document.activeElement));
          buttons[(current+(event.shiftKey ? -1 : 1)+buttons.length)%buttons.length]?.focus();
          return true;
        }
        return true;
      }
      const openKey = event.key === "l" && !event.ctrlKey && !event.altKey && !event.metaKey && !event.shiftKey;
      if (!isOpen()) {
        if (!openKey || editing || windowManager.gameplayBlocked()) return false;
        open(document.activeElement || canvas);
        return true;
      }
      if (editing) return false;
      if (event.key === ":" && !event.ctrlKey && !event.altKey && !event.metaKey) return false;
      if (event.key === "Escape" || event.key.toLowerCase() === "q") { close();return true; }
      if (event.ctrlKey && !event.altKey && !event.metaKey && event.code === "KeyT") {
        appendGameMessage({markup:"Screenshot saved as 'screenshot????'. <small>(Look prototype only; no file was created.)</small>"});
        return true;
      }
      if (event.ctrlKey || event.altKey || event.metaKey) return true;
      if (event.key.toLowerCase() === "p") { hideCard();setManual(!runtime.manual);return true; }
      if (openKey) {
        if (runtime.manual) { hideCard();inspectManual(); }
        else { description.className="look-description is-error";description.textContent="Press p to enter manual ground mode."; }
        return true;
      }
      const direction = directionFor(event);
      if (direction) { move(...direction);return true; }
      description.className = "look-description is-error";
      description.textContent = "Use a direction, p, l, q, Esc, : or Ctrl+T.";
      return true;
    }
    function applyControls() {
      if (!["ready","blind","hallucinating"].includes(state.lookAvailability)) state.lookAvailability="ready";
      $("#lookAvailabilityControl").value=state.lookAvailability;
    }
    function reset() {
      if (contextOpen()) closeContextMenu({restoreFocus:false,force:true});
      if (isOpen()) close();
      runtime.automaticPoint=null;runtime.manualPoint=null;runtime.selected=null;runtime.lookCache.clear();runtime.lookInflight.clear();
      hideCard();
      applyControls();
    }

    canvas.addEventListener("click",event => {
      if (!isOpen()) return;
      const point = mapPointerCell(event.clientX,event.clientY);
      if (point) {
        inspectManual(point);
        resolveLook(point);
      }
      canvas.focus();
    });
    canvas.addEventListener("pointermove",event => {
      if (!isOpen()) return;
      const point = mapPointerCell(event.clientX,event.clientY);
      if (point && (!runtime.hoverPoint || point.x !== runtime.hoverPoint.x || point.y !== runtime.hoverPoint.y)) queueLocalPreview(point);
    });
    canvas.addEventListener("pointerleave",() => {
      runtime.hoverPoint = null;
      if (runtime.previewTimer) clearTimeout(runtime.previewTimer);
      runtime.previewTimer = null;
      if (isOpen() && !runtime.cardPinned) hideCard();
    });
    canvas.addEventListener("contextmenu",openContextMenu);
    contextMenu.addEventListener("click",event => activateContextAction(event.target.closest("[data-map-action]")?.dataset.mapAction));
    $("#lookClose").addEventListener("click",close);
    document.addEventListener("pointerdown",event => {
      if (contextOpen() && !event.target.closest("#mapContextMenu")) closeContextMenu();
      if (!isOpen() && !contextOpen() && !card.hidden && !event.target.closest("#lookCard")) hideCard();
    });

    return {open,close,isOpen,handleKeydown,restoreFocus,applyControls,reset,previewAt,requestLookAt};
  };
})();
