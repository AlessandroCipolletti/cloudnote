(function (app) {

  function arrayOrderStringDown (a, b) {

    if (a < b) return +1;
    if (a > b) return -1;
    return 0;

  }

  function arrayOrderStringUp (a, b) {

    if (a > b) return +1;
    if (a < b) return -1;
    return 0;

  }

  function arrayOrderNumberUp (a, b) {
    return a - b;
  }

  function arrayOrderNumberDown (a, b) {
    return b - a;
  }

  function distance (x1, y1, x2, y2) {
    return Math.round(Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)));
  }

  function addGlobalStatus (status) {
    app.Param.container.classList.add(status);
  }

  function removeGlobalStatus (status) {
    app.Param.container.classList.remove(status);
  }


  function _iterable (els, fn) {
    if (els.length) {
      for (var i = els.length; i--; )
        fn(els[i]);
    } else {
      fn(els);
    }
  }

  function _doFadeIn () {
    this.classList.add("fadeIn");
    this.classList.remove("fadeOut");
  }

  function _fadeInEl (el) {
    if (el) {
      el.classList.remove("displayNone");
      requestAnimationFrame(_doFadeIn.bind(el));
    }
  }

  function _doFadeOut () {
    this.classList.add("displayNone");
  }

  function _fadeOutEl (el) {
    if (el) {
      el.classList.add("fadeOut");
      el.classList.remove("fadeIn");
      setTimeout(_doFadeOut.bind(el), 400);
    }
  }

  function fadeInElements (els) {
    _iterable(els, _fadeInEl);
  }

  function fadeOutElements (els) {
    _iterable(els, _fadeOutEl);
  }

  function setConfig (params, config) {

    var key;
    for (key in params) {
      if (typeof (config[key]) !== "undefined") {
        config[key] = params[key];
      }
    }
    return config;

  }

  function init () {

    var MATH = Math;
    MATH.radians = function (degrees) {
      return degrees * MATH.PI / 180;
    };
    MATH.degrees = function (radians) {
      return radians / (MATH.PI / 180);
    };

  }

  app.Utils = {
    init: init,
    distance: distance,
    addGlobalStatus: addGlobalStatus,
    removeGlobalStatus: removeGlobalStatus,
    fadeInElements: fadeInElements,
    fadeOutElements: fadeOutElements,
    arrayOrderStringDown: arrayOrderStringDown,
    arrayOrderStringUp: arrayOrderStringUp,
    arrayOrderNumberUp: arrayOrderNumberUp,
    arrayOrderNumberDown: arrayOrderNumberDown,
    setConfig: setConfig
  };

})(cloudnote);
