(function (app) {

  function distance (x1, y1, x2, y2) {
    return app.math.round(app.math.sqrt(app.math.pow(x2 - x1, 2) + app.math.pow(y2 - y1, 2)));
  }

  function addGlobalStatus (status) {
    app.Param.container.classList.add(status);
  }

  function removeGlobalStatus (status) {
    app.Param.container.classList.remove(status);
  }

  app.Utils = {
    distance: distance,
    addGlobalStatus: addGlobalStatus,
    removeGlobalStatus: removeGlobalStatus
  };

})(cloudnote);
