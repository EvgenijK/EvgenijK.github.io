(() => {
  const root = window.TomeNetPrototype;

  class InputRouter {
    constructor() {
      this.handlers = [];
      this.actions = new Map();
      this.boundKeydown = event => this.route(event);
    }

    registerHandler(id, priority, handler) {
      if (this.handlers.some(candidate => candidate.id === id)) throw new Error(`Input handler already registered: ${id}`);
      this.handlers.push({id,priority,handler});
      this.handlers.sort((a,b) => b.priority - a.priority);
      return () => { this.handlers = this.handlers.filter(candidate => candidate.id !== id); };
    }

    registerAction(id, handler) {
      if (this.actions.has(id)) throw new Error(`UI action already registered: ${id}`);
      this.actions.set(id,handler);
    }

    dispatch(id, payload) {
      const handler = this.actions.get(id);
      return handler ? handler(payload) : false;
    }

    route(event) {
      for (const candidate of this.handlers) {
        if (!candidate.handler(event,this)) continue;
        if (!event.defaultPrevented) event.preventDefault();
        return true;
      }
      return false;
    }

    start() { document.addEventListener("keydown",this.boundKeydown); }
    stop() { document.removeEventListener("keydown",this.boundKeydown); }
  }

  root.provide("inputRouter",new InputRouter());
})();
