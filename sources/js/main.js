(function (app) {

  var _config = {

  };

  var _container = {};
  var _rotationHandler = [];

  function addRotationHandler(handler) {
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

  function _initViewport() {

    var attributes = [];
    attributes.push("initial-scale=" + app.Param.scale);
    attributes.push("minimum-scale=" + app.Param.scale);
    attributes.push("maximum-scale=" + app.Param.scale);
    attributes.push("user-scalable=no");

    viewport = document.createElement("meta");
    viewport.setAttribute("name", "viewport");
    viewport.setAttribute("content", attributes.join(","));
    app.document.head.appendChild(viewport);

  }

  function _initDom() {

    _container = app.document.createElement("div");
    _container.classList.add("cloudnote__container");
    app.document.body.appendChild(_container);
    app.Param.container = _container;
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
    app.math = Math;
    app.Param.init(params);

    _setConfig(params);
    _initDom();
    _initViewport();

    app.Editor.init();

    _onRotate(); // this calls also all modules' rotate hadlers

  }

  app.Main = {
    init: init,
    addRotationHandler: addRotationHandler
  };

})(cloudnote);
