/*
  Documentations:

*/
(function (app) {
  "use strict";
  // Dependencies
  var Param = {};
  var Utils = {};
  var Main = {};

  var _polyfills = [];
  var _config = {

  };

  var _container = {};

  function _onRotate (e) {
    // do some stuff
  }

  function _initDom () {

    Main.loadTemplate("module", {
      param: ""
    }, Param.container, function (templateDom) {

      _container = templateDom;

      Main.addRotationHandler(_onRotate);

    });

  }

  function init (params) {

    Param = app.Param;
    Utils = app.Utils;
    Main = app.Main;
    _config = Utils.setConfig(params, _config);
    Utils.initWithPolyfills(_polyfills, _initDom);

  }

  app.module("Module", {
    init: init
  });

})(APP);
