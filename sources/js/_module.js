(function (app) {

  var _config = {

  };

  var _container = {};

  function _onRotate (e) {
    // do some stuff
  }

  function _initDom () {

    _container = document.createElement("div");
    _container.classList.add("cloudnote-module__container");

    app.Param.container.appendChild(_container);
    app.Main.addRotationHandler(_onRotate);

  }

  function _setConfig (params) {

    var key;
    for (key in params) {
      if (typeof (_config[key]) !== "undefined") {
        _config[key] = params[key];
      }
    }

  }

  function init (params) {

    _setConfig(params);
    _initDom();

  }

  app.Module = {
    init: init
  };

})(cloudnote);
