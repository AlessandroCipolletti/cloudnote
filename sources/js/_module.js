(function (app) {

  var _config = {

  };

  var _container = {};

  function _onRotate (e) {
    // do some stuff
  }

  function _initDom () {

    _container = app.Utils.createDom("cloudnote-module__container");

    app.Param.container.appendChild(_container);
    app.Main.addRotationHandler(_onRotate);

  }

  function init (params) {

    _config = app.Utils.setConfig(params, _config);
    _initDom();

  }

  app.module("Module", {
    init: init
  });

})(cloudnote);
