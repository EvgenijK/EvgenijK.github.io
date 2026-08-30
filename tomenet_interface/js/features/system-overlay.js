(() => {
  window.TomeNetPrototype.createSystemOverlayFeature = ({$,windowManager}) => {
    const layer = $("#systemOverlay");
    const control = $("#systemOverlayControl");
    const content = {
      "connection-lost": {
        title:"CONNECTION LOST",
        text:"The link to the server has been interrupted. The online game cannot accept commands.",
        action:"Retry connection"
      },
      "critical-event": {
        title:"CRITICAL EVENT",
        text:"A server event requires acknowledgement before normal input can continue.",
        action:"Acknowledge"
      }
    };

    function render(entry) {
      const copy = content[entry.kind];
      $("#systemOverlayTitle").textContent = copy.title;
      $("#systemOverlayText").textContent = copy.text;
      $("#systemOverlayAction").textContent = copy.action;
      layer.hidden = false;
      layer.setAttribute("aria-hidden","false");
      requestAnimationFrame(() => $("#systemOverlayAction").focus());
    }

    function hide() {
      layer.hidden = true;
      layer.setAttribute("aria-hidden","true");
      control.value = "none";
    }

    Object.keys(content).forEach(kind => windowManager.register({
      kind,layer:"system",dismissible:false,blocksGameplay:true,allowsChat:false,
      focusTarget:() => $("#systemOverlayAction"),onOpen:render,onClose:hide
    }));

    function show(kind) {
      const current = windowManager.top("system");
      if (current) windowManager.close(current.instanceId,{force:true,restoreFocus:false});
      if (!content[kind]) { hide();return; }
      control.value = kind;
      windowManager.setSystemOverlay(kind);
    }

    control.addEventListener("change", event => show(event.target.value));
    $("#systemOverlayAction").addEventListener("click", () => {
      const current = windowManager.top("system");
      if (current) windowManager.close(current.instanceId,{force:true});
    });

    return {show,hide};
  };
})();
