(function (app) {
  const container = document.querySelector("#list");
  const kind = document.body.dataset.list;

  try {
    const values = app.loadData()[kind];
    document.querySelector("#count").textContent = values.length;
    container.textContent = "";
    container.append(app.makeValueGrid(values));
  } catch (error) {
    app.renderError(container, error);
  }
}(window.TomeNET));
