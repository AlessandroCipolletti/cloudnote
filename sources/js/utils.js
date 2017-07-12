/*
  Documentations:

*/
(function (app) {
  "use strict";
  // Dependencies
  var Param = {};
  var Utils = {};

  var _overlaySpinner = {};
  var _popupContainer = {};
  var _popupOpen = false;
  var MATH = Math;
  var PI = MATH.PI;
  var PI2 = PI / 2;

  Utils.round = function (n, d) {
    var m = d ? MATH.pow(10, d) : 1;
    return MATH.round(n * m) / m;
  };

  Utils.random = function (n, float) {
    if (float) {
      return MATH.random() * n;
    } else {
      return MATH.random() * n | 0;
    }
  };

  Utils.emptyFN = function () {};

  Utils.preventDefault = function (e) {

    e.preventDefault();
    e.stopPropagation();

  };

  Utils.preventAllDefault = function (el) {

    el.addEventListener(Param.eventStart, Utils.preventDefault);
    el.addEventListener(Param.eventMove, Utils.preventDefault);
    el.addEventListener(Param.eventEnd, Utils.preventDefault);

  };

  Utils.arrayOrderStringDown = function (a, b) {

    if (a < b) return +1;
    if (a > b) return -1;
    return 0;

  };

  Utils.arrayOrderStringUp = function (a, b) {

    if (a > b) return +1;
    if (a < b) return -1;
    return 0;

  };

  Utils.arrayOrderNumberUp = function (a, b) {
    return a - b;
  };

  Utils.arrayOrderNumberDown = function (a, b) {
    return b - a;
  };

  Utils.distance = function (x1, y1, x2, y2) {
    return MATH.round(MATH.sqrt(MATH.pow(x2 - x1, 2) + MATH.pow(y2 - y1, 2)));
  };

  Utils.angleRadToDeg = function (rad) {
    return rad * 180 / PI;
  };

  Utils.angleDegToRad = function (deg) {
    return deg * PI / 180;
  };

  Utils.radToFirstQuadrant = function (rad) {

    var result = rad;
    while (result > PI2) {
      result = result - PI2;
    }
    if (rad % PI === 0) {
      result = 0;
    } else if (rad % PI > PI2) {
      result = PI2 - result;
    }
    return result;

  };

  Utils.degToFirstQuadrant = function (deg) {

    deg = MATH.abs(deg);
    var result = deg;
    while (result > 90) {
      result = result - 90;
    }
    if (deg % 180 === 0) {
      result = 0;
    } else if (deg % 180 > 90) {
      result = 90 - result;
    }
    return result;

  };

  Utils.coefficientM = function (x1, y1, x2, y2) {
    return -(y2 - y1) / (x2 - x1);
    // return (y2 + y1) / (x2 - x1);
  };

  Utils.angleRad = function (x1, y1, x2, y2) {

    var m1 = x2 - x1;
    var m2 = -y2 + y1;
    if (m1 > 0 && m2 > 0) {  // primo quadrante
      return (MATH.atan(m2 / m1));
    } else if (m1 < 0 && m2 > 0) {  // secondo quadrante
      return (MATH.atan(m2 / m1) +  PI);
    } else if (m1 < 0 && m2 < 0) {  // terzo quadrante
      return (MATH.atan(m2 / m1) + PI);
    } else if (m1 > 0 && m2 < 0) {  // quarto quadrante
      return (MATH.atan(m2 / m1) + PI * 2);
    } else {
      // multipli di 90
      if (m1 === 0) {
        if (m2 > 0){
          return PI / 2;
        } else {
          return PI * 1.5;
        }
      } else {
        if (m1 > 0) {
          return 0;
        } else {
          return PI;
        }
      }
    }

  };

  Utils.angleDeg = function (x1, y1, x2, y2) {
    return Utils.angleRadToDeg(Utils.angleRad(x1, y1, x2, y2));
  };

  Utils.addGlobalStatus = function (status) {
    Param.container.classList.add(status);
  };

  Utils.removeGlobalStatus = function (status) {
    Param.container.classList.remove(status);
  };

  function _iterable (els, fn, callbacks) {
    if (els instanceof Array) {
      var i = els.length;
      if (callbacks instanceof Array) {
        for ( ; i--; ) {
          fn(els[i], callbacks[i]);
        }
      } else {
        for ( ; i--; ) {
          fn(els[i], callbacks);
        }
      }
    } else {
      fn(els, callbacks);
    }
  }

  function _doFadeIn (el, callback) {

    el.classList.add("fadeIn");
    el.classList.remove("fadeOut");
    if (callback) {
      requestAnimationFrame(callback)
    }

  }

  function _fadeInEl (el, callback) {

    if (el && el.classList.contains("fadeOut")) {
      el.classList.remove("displayNone");
      requestAnimationFrame(_doFadeIn.bind({}, el, callback));
    }

  }

  function _doFadeOut (el, callback) {

    el.classList.add("displayNone");
    if (callback) {
      requestAnimationFrame(callback)
    }

  }

  function _fadeOutEl (el, callback) {

    if (el && el.classList.contains("fadeIn")) {
      el.classList.add("fadeOut");
      el.classList.remove("fadeIn");
      setTimeout(_doFadeOut.bind({}, el, callback), 400);
    }

  }

  function _toggleFadeEl (el) {

    if (el) {
      if (el.classList.contains("displayNone")) {
        _fadeInEl(el);
      } else {
        _fadeOutEl(el);
      }
    }

  }

  Utils.fadeInElements = function (els, callbacks) {
    _iterable(els, _fadeInEl, callbacks);
  };

  Utils.fadeOutElements = function (els, callbacks) {
    _iterable(els, _fadeOutEl, callbacks);
  };

  Utils.toggleFadeElements = function (els) {
    _iterable(els, _toggleFadeEl);
  };

  function _enableEl (el) {
    el.classList.add("enabled");
    el.classList.remove("disabled");
  }

  function _disableEl (el) {
    el.classList.add("disabled");
    el.classList.remove("enabled");
  }

  Utils.enableElements = function (els) {
    _iterable(els, _enableEl);
  };

  Utils.disableElements = function (els) {
    _iterable(els, _disableEl);
  };

  Utils.setConfig = function (params, config) {

    var key;
    for (key in params) {
      if (typeof (config[key]) !== "undefined") {
        config[key] = params[key];
      }
    }
    return config;

  };

  Utils.createDom = function () {

    var dom = document.createElement("div");
    for (var i in arguments) {
      dom.classList.add(arguments[i]);
    }
    return dom;

  };

  Utils.setSpinner = function (loading) {

    if (loading) {
      Utils.fadeInElements(_overlaySpinner);
    } else {
      Utils.fadeOutElements(_overlaySpinner);
    }

  };

  function _closePopup (e) {

    if (e.target === _popupContainer) {
      Utils.closePopup();
    }

  }

  Utils.openPopup = function (popup, force, disableAutoClose) {

    if (_popupOpen) {
      if (force) {
        Utils.closePopup();
      } else {
        return;
      }
    }

    if (!disableAutoClose) {
      _popupContainer.addEventListener(Param.eventStart, _closePopup);
    }
    _popupContainer.appendChild(popup);
    Param.container.appendChild(_popupContainer);
    _popupOpen = true;

  };

  Utils.closePopup = function () {

    if (_popupOpen) {
      Param.container.removeChild(_popupContainer);
      _popupContainer.removeEventListener(Param.eventStart, _closePopup);
      _popupContainer.innerHTML = "";
      _popupOpen = false;
    }

  };

  Utils.getEventCoordX = function (e, offset, absolute) { // e = event || touches

    if (absolute || typeof(e.layerX) === "undefined") {
      if (e instanceof Array) {
        return e[0].clientX - (offset || 0);
      } else if (e.touches) {
        return e.touches[0].clientX - (offset || 0);
      } else {
        return e.clientX - (offset || 0);
      }
    } else {
      return e.layerX;
    }

  };

  Utils.getEventCoordY = function (e, offset, absolute) { // e = event || touches

    if (absolute || typeof(e.layerY) === "undefined") {
      if (e instanceof Array) {
        return e[0].clientY - (offset || 0);
      } else if (e.touches) {
        return e.touches[0].clientY - (offset || 0);
      } else {
        return e.clientY - (offset || 0);
      }
    } else {
      return e.layerY;
    }

  };

  Utils.intToHex = function (n) {

    n = n.toString(16);
    return (n.length === 1 ? "0" + n : n);

  };

  Utils.promiseXHR = function (protocol, url, headers) {

    return new Promise(function (resolve, reject) {

      var xhr = new XMLHttpRequest();
      xhr.open(protocol, url, true);

      if (headers instanceof Array) {
        for (var i = 0; i < headers.length; i++) {
          if (headers[i].key === 'overrideMimeType') {
            xhr.overrideMimeType(headers[i].value);
          } else {
            xhr.setRequestHeader(headers[i].key, headers[i].value);
          }
        }
      }

      xhr.onreadystatechange = function () {

        if (xhr.readyState === 4) {
          if (xhr.status === 404) {
            resolve(false);
          } else {
            resolve(xhr.responseText);
          }
        }

      };

      try {
        xhr.send();
      } catch (e) {
        reject(xhr);
      }

    });

  };

  Utils.rgbStringToRgb = function (color) {
    color = color.substring(4).replace(")", "").replace(" ", "").split(",");
    return {
      r: parseInt(color[0]),
      g: parseInt(color[1]),
      b: parseInt(color[2]),
      a: color[3] ? parseInt(color[3]) : 0
    };
  };

  Utils.hexToRgb = function (hex) {

    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16)
    };

  };

  Utils.intToHex = function (int) {

    var hex = int.toString(16);
    while (hex.length < 6) {
      hex = "0" + hex;
    }
    return hex;

  };

  Utils.rgbToHex = function (r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  Utils.filterTouchesByTarget = function (e, targets) {

    if (targets && !(targets instanceof(Array))) {
      targets = [targets];
    }
    if (e.touches) {
      return Array.prototype.filter.call(e.touches, function (touch) {
        return !targets || targets.indexOf(touch.target) >= 0;
      });
    }
    if (!targets || targets.indexOf(e.target) >= 0) {
      return [{
        clientX: e.clientX,
        clientY: e.clientY,
        target: e.target
      }];
    }
    return [];

  };

  Utils.initWithPolyfills = function (polyfills, callbackInit) {

    if (polyfills.length) {
      var promises = [];
      var js;
      for (var i = polyfills.length; i--; ) {
        promises.push(
          new Promise (function (resolve, reject) {
            if (!polyfills[i].test) {
              js = document.createElement("script");
              js.src = "polyfill/" + polyfills[i].file;
              js.onload = function() {
                resolve(true);
              };
              js.onerror = function() {
                console.log("Failed to load script polyfill " + polyfills[i].name);
                resolve(false);
              };
              document.head.appendChild(js);
            } else {
              resolve(true);
            }
          })
        );
      }
      Promise.all(promises).then(callbackInit);
    } else {
      callbackInit();
    }

  };

  function _initDom () {

    _overlaySpinner = Utils.createDom("drawith__overlay-spinner", "displayNone", "fadeOut");
    var spinner = document.createElement("img");
    spinner.classList.add("drawith__overlay-spinner-image");
    spinner.src = "img/spinner.gif";
    _overlaySpinner.appendChild(spinner);
    _overlaySpinner.addEventListener(Param.eventStart, function (e) {
      e.preventDefault();
    });
    Param.container.appendChild(_overlaySpinner);
    _popupContainer = Utils.createDom("drawith__popup-container", "popup");

  }

  Utils.init = function () {

    Param = app.Param;
    MATH.radians = function (degrees) {
      return degrees * MATH.PI / 180;
    };
    MATH.degrees = function (radians) {
      return radians / (MATH.PI / 180);
    };
    MATH.between = function (a, b, c) {
      return [a, b, c].sort(Utils.arrayOrderNumberUp)[1];
    };

    _initDom();

  };

  app.module("Utils", Utils);

})(APP);
