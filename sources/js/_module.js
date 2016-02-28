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
  
  function init (params) {

    _config = app.Utils.setConfig(params, _config);
    _initDom();

  }

  app.Module = {
    init: init
  };

})(cloudnote);
