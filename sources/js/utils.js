(function (app) {

  function distance (x1, y1, x2, y2) {
    return Math.round(Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)));
  }

  function addGlobalStatus (status) {
    app.Param.container.classList.add(status);
  }

  function removeGlobalStatus (status) {
    app.Param.container.classList.remove(status);
  }

  function init () {

    var MATH = Math;
    MATH.radians = function (degrees) {
      return degrees * MATH.PI / 180;
    };
    MATH.degrees = function (radians) {
      return radians / (MATH.PI / 180);
    };

  }

  app.Utils = {
    init: init,
    distance: distance,
    addGlobalStatus: addGlobalStatus,
    removeGlobalStatus: removeGlobalStatus
  };

})(cloudnote);
