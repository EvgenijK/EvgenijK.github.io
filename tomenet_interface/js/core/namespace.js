(() => {
  const root = window.TomeNetPrototype ||= {};
  const services = new Map();
  const features = [];

  root.provide = (name, value) => {
    if (services.has(name)) throw new Error(`Prototype service already registered: ${name}`);
    services.set(name, value);
    return value;
  };
  root.service = name => {
    if (!services.has(name)) throw new Error(`Prototype service is unavailable: ${name}`);
    return services.get(name);
  };
  root.registerFeature = feature => {
    if (!feature?.id || typeof feature.init !== "function") throw new Error("Invalid prototype feature");
    if (features.some(candidate => candidate.id === feature.id)) throw new Error(`Prototype feature already registered: ${feature.id}`);
    features.push(feature);
  };
  root.startFeatures = context => features.forEach(feature => feature.init(context));
})();
