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
    param.appName = app.NAME;
    param.appVersion = app.VERSION;
    param.templatePath = "tpl/";
    param.cssPath = "css/";

    param.isDebug = _config.testDebug;
    param.socketUrl = (param.isDebug ? "http://46.252.150.61:5000" : "http://46.252.150.61:4000");

    param.fb = {
      appId: "1448620825449065",
      apiVersion: "v2.2"
    };

    // TODO .android, .isPhone, .isTablet
    param.android = false;
    param.ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    param.ipad = /iPad/.test(navigator.userAgent);
    param.isTablet = param.ipad;
    param.iphone = param.ios && !param.ipad;
    param.isPhone = param.iphone;
    param.isMobile = (navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i)) instanceof Array;
    param.isDesktop = !param.isMobile;
    param.isAppOnline = (document.location.host.toLowerCase() === param.appName);
    param.eventResize = "onorientationchange" in window ? "orientationchange" : "resize";
    // TODO pixelRatio iphone plus ; if isDesktop, controllare funzionamento viewport, altrimenti 1
    param.pixelRatio = param.ios ? 2 : window.devicePixelRatio;
    param.scale = 1 / param.pixelRatio;
    param.supportTouch = ("ontouchstart" in window);
    param.supportGesture = ("ongesturechange" in window);
    param.supportOrientation = ("orientation" in window);

    if (param.supportTouch) {

      param.eventStart = "touchstart";
      param.eventMove = "touchmove";
      param.eventEnd = "touchend";
      param.eventOut = "";

    } else {

      param.eventStart = "mousedown";
      param.eventMove = "mousemove";
      param.eventEnd = "mouseup";
      param.eventOut = "mouseout";

    }

  };

  app.module("Param", param);

})(drawith);
