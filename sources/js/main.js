(function (app) {

  var _config = {
    testDebugFalse: false
  };

  var _container = {};
  var _rotationHandler = [];
  var _initialised = false;

  function addRotationHandler(handler) {
    _rotationHandler.push(handler);
  }

  function _onRotate (e) {

    app.WIDTH = window.innerWidth;
    app.HEIGHT = window.innerHeight;
    console.log("rotate:", app.WIDTH, app.HEIGHT);

    if (_initialised) {
      for (var i in _rotationHandler) {
        _rotationHandler[i]();
      }
    }

  }

  function _initViewport () {

    var attributes = [];
    attributes.push("initial-scale=" + app.Param.scale);
    attributes.push("minimum-scale=" + app.Param.scale);
    attributes.push("maximum-scale=" + app.Param.scale);
    attributes.push("user-scalable=no");

    viewport = document.createElement("meta");
    viewport.setAttribute("name", "viewport");
    viewport.setAttribute("content", attributes.join(","));
    document.head.appendChild(viewport);

    document.querySelector("html").style.fontSize = (app.Param.pixelRatio * 10) + "px";

  }

  function _initDom () {

    _container = document.createElement("div");
    _container.classList.add("cloudnote__container");
    document.body.appendChild(_container);
    app.Param.container = _container;
    window.addEventListener(app.Param.eventResize, _onRotate, false);
    document.addEventListener(app.Param.eventMove, function (e) {
      e.preventDefault();
    });

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

    app.Param.init(params);

    _setConfig(params);
    _initDom();
    _initViewport();
    _onRotate();

    app.Utils.init();
    app.Messages.init();
    app.templateManager.init();
    app.Socket.init();
    app.Header.init();
    app.User.init({
      fbAppId: app.Param.fb.appId,
      fbApiVersion: app.Param.fb.apiVersion
    });
    app.Dashboard.init();
    app.Editor.init();

    _initialised = true;
    _onRotate(); // this calls also all modules' rotate hadlers

  }

  app.module("Main", {
    init: init,
    addRotationHandler: addRotationHandler
  });

})(cloudnote);
