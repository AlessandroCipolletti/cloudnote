(function (app) {

  var _config = {

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
    param.eventResize = "onorientationchange" in window ? "orientationchange" : "resize";
    param.pixelRatio = window.devicePixelRatio;
    param.scale = 1 / param.pixelRatio;
    param.supportTouch = ("ontouchstart" in window);
    param.supportGesture = ("ongesturechange" in window);

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

  app.Param = param;

})(cloudnote);
