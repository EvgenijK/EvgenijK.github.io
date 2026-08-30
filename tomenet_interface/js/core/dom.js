(() => {
  const root = window.TomeNetPrototype;
  root.provide("dom",{
    $:selector => document.querySelector(selector),
    $$:selector => [...document.querySelectorAll(selector)],
    clamp:(value,min,max) => Math.max(min,Math.min(max,value)),
    escapeHtml:value => String(value).replace(/[&<>'"]/g,character => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[character])
  });
})();
