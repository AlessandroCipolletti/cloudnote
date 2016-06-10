(function (app) {

  var _config = {
    testDebug: true
  };

  var param = {};

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
    param.appName = "drawith.me";
    param.templatePath = "tpl/";
    param.cssPath = "css/";

    param.isDebug = _config.testDebug;
    param.socketUrl = (param.isDebug ? "http://46.252.150.61:5000" : "http://46.252.150.61:4000");

    param.fb = {
      appId: "1448620825449065",
      apiVersion: "v2.2"
    };

    param.isAppOnline = (document.location.host.toLowerCase() === param.appName);
    param.ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    param.eventResize = "onorientationchange" in window ? "orientationchange" : "resize";
    param.pixelRatio = param.ios ? 2 : window.devicePixelRatio;
    param.scale = 1 / param.pixelRatio;
    param.supportTouch = ("ontouchstart" in window);
    param.supportGesture = ("ongesturechange" in window);
    param.supportOrientation = ("orientation" in window);

    if (param.supportTouch) {

      param.eventStart = "touchstart";
      param.eventMove = "touchmove";
      param.eventEnd = "touchend";

    } else {

      param.eventStart = "mousedown";
      param.eventMove = "mousemove";
      param.eventEnd = "mouseup";

    }

  };

  app.module("Param", param);

})(drawith);
