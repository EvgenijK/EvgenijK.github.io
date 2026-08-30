(() => {
  const root = window.TomeNetPrototype;
  const LAYERS = ["primary","context","dialog","target","system","technical"];
  const DATA_STATES = ["loading","ready","empty","unavailable","error"];

  class WindowManager {
    constructor() {
      this.definitions = new Map();
      this.entries = [];
      this.listeners = new Set();
      this.nextId = 1;
    }

    register(definition) {
      if (!definition?.kind || !LAYERS.includes(definition.layer)) throw new Error("Invalid window definition");
      if (this.definitions.has(definition.kind)) throw new Error(`Window already registered: ${definition.kind}`);
      this.definitions.set(definition.kind, {
        dismissible:true, blocksGameplay:definition.layer !== "technical", allowsChat:true,
        ...definition
      });
      return this;
    }

    definition(kind) {
      const definition = this.definitions.get(kind);
      if (!definition) throw new Error(`Unknown window kind: ${kind}`);
      return definition;
    }

    snapshot() { return this.entries.map(entry => ({...entry})); }
    top(layer) { return [...this.entries].reverse().find(entry => !layer || entry.layer === layer) || null; }
    has(kind) { return this.entries.some(entry => entry.kind === kind); }
    gameplayBlocked() { return this.entries.some(entry => entry.blocksGameplay); }
    chatAllowed() { return !this.entries.some(entry => !entry.allowsChat); }

    open(kind, payload = {}, options = {}) {
      const definition = this.definition(kind);
      if (["context","dialog","target"].includes(definition.layer) && this.entries.filter(entry => ["context","dialog","target"].includes(entry.layer)).length >= 8)
        throw new Error("Window overlay stack limit exceeded");
      if (definition.layer === "primary") {
        const current = this.top("primary");
        if (current?.kind === kind) return this.close(current.instanceId);
        if (current) this.close(current.instanceId, {restoreFocus:false});
      }
      if (definition.layer === "system") {
        const current = this.top("system");
        if (current) this.close(current.instanceId, {restoreFocus:false,force:true});
      }
      const entry = {
        instanceId:`window-${this.nextId++}`, kind, layer:definition.layer,
        phase:"opening", dataState:DATA_STATES.includes(options.dataState) ? options.dataState : "ready",
        payload, parentId:options.parentId || this.top()?.instanceId || null,
        opener:options.opener || document.activeElement,
        dismissible:options.dismissible ?? definition.dismissible,
        blocksGameplay:options.blocksGameplay ?? definition.blocksGameplay,
        allowsChat:options.allowsChat ?? definition.allowsChat,
        revision:1
      };
      this.entries.push(entry);
      definition.onOpen?.(entry);
      entry.phase = "open";
      this.emit("open", entry);
      return entry;
    }

    replace(kind, payload = {}, options = {}) {
      const top = this.top();
      if (top) this.close(top.instanceId, {restoreFocus:false,force:true});
      return this.open(kind,payload,options);
    }

    push(kind, payload = {}, options = {}) { return this.open(kind,payload,options); }

    close(instanceId, options = {}) {
      const index = this.entries.findIndex(entry => entry.instanceId === instanceId);
      if (index < 0) return false;
      const entry = this.entries[index];
      if (!entry.dismissible && !options.force) return false;
      entry.phase = "closing";
      this.definition(entry.kind).onClose?.(entry, options);
      this.entries.splice(index,1);
      entry.phase = "closed";
      this.emit("close",entry);
      const parent = this.entries.find(candidate => candidate.instanceId === entry.parentId);
      if (parent) this.definition(parent.kind).onResume?.(parent,entry);
      if (options.restoreFocus !== false) requestAnimationFrame(() => {
        const target = parent ? this.definition(parent.kind).focusTarget?.(parent) : entry.opener;
        if (target?.isConnected && typeof target.focus === "function") target.focus();
      });
      return true;
    }

    closeKind(kind, options) {
      const entry = [...this.entries].reverse().find(candidate => candidate.kind === kind);
      return entry ? this.close(entry.instanceId,options) : false;
    }

    back() { const top = this.top(); return top ? this.close(top.instanceId) : false; }
    dismissTop() { return this.back(); }

    setSystemOverlay(kind, payload = {}) {
      return this.open(kind,payload,{dismissible:false,allowsChat:false,blocksGameplay:true});
    }

    setDataState(instanceId, dataState, payload) {
      if (!DATA_STATES.includes(dataState)) throw new Error(`Invalid data state: ${dataState}`);
      const entry = this.entries.find(candidate => candidate.instanceId === instanceId);
      if (!entry) return false;
      entry.dataState = dataState;
      if (payload !== undefined) entry.payload = payload;
      entry.revision++;
      this.emit("update",entry);
      return true;
    }

    subscribe(listener) { this.listeners.add(listener); return () => this.listeners.delete(listener); }
    emit(type, entry) { this.listeners.forEach(listener => listener(type,{...entry},this.snapshot())); }
  }

  root.provide("windowManager",new WindowManager());
})();
