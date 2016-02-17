// Main
(function (app) {

  var _config = {

  };
  var _rotationHandler = [];

  function addRotationHandler(hander) {
    _rotationHandler.push(handler);
  }

  function _onRotate(e) {

    app.width = app.window.innerWidth;
    app.height = app.window.innerHeight;
    console.log("rotate:", app.width, app.height);

    for (var i in _rotationHandler) {
      _rotationHandler[i]();
    }

  }

  function _initDom() {

    app.window.addEventListener(app.Param.eventResize, _onRotate, false);

  }

  function _setConfig(params) {

    var key;
    for (key in params) {
      if (typeof (_config[key]) !== "undefined") {
        _config[key] = params[key];
      }
    }

  }

  function init(params) {

    app.window = window;
    app.document = document;
    app.Param.init(params);

    _setConfig(params);
    _initDom();
    _onRotate();

    app.Editor.init();

  }

  app.Main = {
    init: init,
    addRotationHandler: addRotationHandler
  };

})(cloudnote);

// Param
(function (app) {

  var _config = {

  };

  var param = {};
  param.eventResize = "onorientationchange" in app.window ? "orientationchange" : "resize";

  function _setConfig(params) {

    var key;
    for (key in params) {
      if (typeof (_config[key]) !== "undefined") {
        _config[key] = params[key];
      }
    }

  }

  param.init = function (params) {
    _setConfig(params);
  };

  app.Param = param;

})(cloudnote);

// Editor
(function () {

  var _config = {

  };

  function _initDom() {

  }

  function _setConfig(params) {

    var key;
    for (key in params) {
      if (typeof (_config[key]) !== "undefined") {
        _config[key] = params[key];
      }
    }

  }

  function init(params) {

    _setConfig(params);
    _initDom();

  }

  app.Editor = {
    init: init
  };

})(cloudnote);
