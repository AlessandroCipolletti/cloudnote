(function (app) {

  var _config = {
    testDebug: true,
    version: 1.0
  };

  var _container = {};
  var _rotationHandler = [];
  var _initialised = false;
  var _lastOrientation = window.orientation || 0;
  var _garbage = document.createElement("div");

  function _onRotate (e) {

    app.WIDTH = window.innerWidth;
    app.HEIGHT = window.innerHeight;
    // console.log("rotate:", app.WIDTH, app.HEIGHT);

    if (app.Param.supportOrientation) {
      var orientation = window.orientation;
      e.deltaOrientation = _lastOrientation - orientation;
      _lastOrientation = orientation;
    } else {
      e.deltaOrientation = 0;
    }

    if (_initialised) {
      for (var i in _rotationHandler) {
        _rotationHandler[i](e);
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
    _container.classList.add("drawith__container");
    document.body.appendChild(_container);
    app.Param.container = _container;
    window.addEventListener(app.Param.eventResize, _onRotate, false);

  }

  function _setConfig (params) {

    var key;
    for (key in params) {
      if (typeof (_config[key]) !== "undefined") {
        _config[key] = params[key];
      }
    }

  }

  function _filterChildNodes (e) {
    return (e.nodeName !== "#text");
  }

  function _addEnviromentGlobalStatus () {

    if (app.Param.isMobile) {
      app.Utils.addGlobalStatus("drawith__MOBILE");
    } else {
      app.Utils.addGlobalStatus("drawith__DESKTOP");
    }
    if (app.Param.ios) {
      app.Utils.addGlobalStatus("drawith__IOS");
      if (app.Param.ipad) {
        app.Utils.addGlobalStatus("drawith__IPAD");
      } else {
        app.Utils.addGlobalStatus("drawith__IPHONE");
      }
    }

  }

  function addRotationHandler (handler) {
    _rotationHandler.push(handler);
  }

  function loadTemplate (templateName, params, container, callback) {

    var style = document.createElement("link");
    style.rel = "stylesheet";
    style.href = app.Param.cssPath + templateName + ".css";
    document.head.appendChild(style);

    return app.Utils.promiseXHR("GET", app.Param.templatePath + templateName + ".tpl").then(function (template) {

      template = Handlebars.compile(template);
      _garbage.insertAdjacentHTML("beforeend", template(params));
      template = Array.prototype.filter.call(_garbage.childNodes, _filterChildNodes);

      if (container) {
        for (var i = 0, l = template.length; i < l; i++) {
          container.appendChild(template[i]);
        }
      }

      if (callback) {
        if (template.length === 1) {
          callback(template[0]);
        } else {
          callback(template);
        }
      }

      _garbage.innerHTML = "";
      template = undefined;

    });

  }

  function init (params) {

    _setConfig(params);

    app.Param.init(_config);

    _initDom();
    _initViewport();
    app.WIDTH = window.innerWidth;
    app.HEIGHT = window.innerHeight;

    app.Utils.init();
    _addEnviromentGlobalStatus();

    app.Messages.init();
    app.Socket.init();
    app.Header.init();
    // app.User.init({
    //   fbAppId: app.Param.fb.appId,
    //   fbApiVersion: app.Param.fb.apiVersion
    // });
    // app.Dashboard.init();
    app.Editor.init();

    _initialised = true;

  }

  app.module("Main", {
    init: init,
    loadTemplate: loadTemplate,
    addRotationHandler: addRotationHandler
  });

})(drawith);
