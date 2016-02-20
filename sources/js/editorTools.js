(function (app) {

  var _config = {

  };

  var _container = {};

  function _initTools () {

  }
  
  function _onRotate (e) {
    // do some stuff
  }

  function _initDom () {

    var _container = app.document.createElement("div");
    _container.classList.add("cloudnote-editor-tools__container");
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
    _initTools();

  }

  app.Editor.Tools = {
    init: init
  };

})(cloudnote);
