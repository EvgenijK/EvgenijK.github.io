(() => {
  const THEMES = [
    {id:"mithril",name:"Mithril Rune",description:"Silver · graphite · cyan rune"},
    {id:"gondor",name:"Gondor Forge",description:"Forged iron · gold · red target"},
    {id:"mallorn",name:"Mallorn Leaf",description:"Bronze leaf · muted green"},
    {id:"dunedain",name:"Dúnedain Cartographer",description:"Quill arrow · compass diamond"},
    {id:"palantir",name:"Palantír",description:"Dark silver · violet seeing-stone"}
  ];
  const STATES = ["default","interactive","target","pan","unavailable"];

  window.TomeNetPrototype.createCursorFeature = ({root,state,$,persist}) => {
    function applyCursorTheme() {
      if (!THEMES.some(theme => theme.id === state.cursorTheme)) state.cursorTheme = "mithril";
      root.dataset.cursorTheme = state.cursorTheme;
      document.querySelectorAll("[data-cursor-theme-option]").forEach(card => {
        const active = card.dataset.cursorThemeOption === state.cursorTheme;
        card.classList.toggle("active",active);
        card.setAttribute("aria-pressed",active ? "true" : "false");
      });
    }

    function buildCursorControls() {
      $("#cursorThemeCards").innerHTML = THEMES.map(theme => `
        <button class="cursor-theme-card" type="button" data-cursor-theme-option="${theme.id}" aria-pressed="false">
          <span class="cursor-theme-copy"><strong>${theme.name}</strong><small>${theme.description}</small></span>
          <span class="cursor-state-previews" aria-label="${theme.name} cursor states">
            ${STATES.map(cursorState => `<span title="${cursorState}"><img src="assets/cursors/${theme.id}/${cursorState}.svg" alt="" width="32" height="32"><small>${cursorState}</small></span>`).join("")}
          </span>
        </button>`).join("");
      $("#cursorThemeCards").addEventListener("click", event => {
        const card = event.target.closest("[data-cursor-theme-option]");
        if (!card) return;
        state.cursorTheme = card.dataset.cursorThemeOption;
        applyCursorTheme();
        persist();
      });
      applyCursorTheme();
    }

    return {buildCursorControls,applyCursorTheme};
  };
})();
