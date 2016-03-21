(function (app) {

  // Dependencies
  var Param = {};
  var Utils = {};
  var Main = {};

  var _config = {

  };

  var _container = {};

  function _onRotate (e) {
    // do some stuff
  }

  function _initDom () {

    _container = Utils.createDom("cloudnote-module__container");

    Param.container.appendChild(_container);
    Main.addRotationHandler(_onRotate);

  }

  function init (params) {

    Param = app.Param;
    Utils = app.Utils;
    Main = app.Main;
    _config = Utils.setConfig(params, _config);
    _initDom();

  }

  app.module("Module", {
    init: init
  });

})(cloudnote);
