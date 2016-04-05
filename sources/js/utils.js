(function (app) {

  // Dependencies
  var Param = {};
  var Utils = {};
  
  var _overlaySpinner = {};
  var MATH = Math;

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

  Utils.angle = function (x1, y1, x2, y2) {
    return MATH.atan2(x2 - x1, y2 - y1);
  };

  Utils.addGlobalStatus = function (status) {
    Param.container.classList.add(status);
  };

  Utils.removeGlobalStatus = function (status) {
    Param.container.classList.remove(status);
  };

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

  Utils.fadeInElements = function (els) {
    _iterable(els, _fadeInEl);
  };

  Utils.fadeOutElements = function (els) {
    _iterable(els, _fadeOutEl);
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

  Utils.getEventCoordX = function (e, offset, absolute) {

    if (absolute || typeof(e.layerX) === "undefined") {
      if (e.type.indexOf("mouse") >= 0) {
        return e.clientX - (offset || 0);
      } else {
        return e.touches[0].clientX - (offset || 0);
      }
    } else {
      return e.layerX;
    }

  };

  Utils.getEventCoordY = function (e, offset, absolute) {

    if (absolute || typeof(e.layerY) === "undefined") {
      if (e.type.indexOf("mouse") >= 0) {
        return e.clientY - (offset || 0);
      } else {
        return e.touches[0].clientY - (offset || 0);
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

  function _initDom () {

    _overlaySpinner = Utils.createDom("cloudnote__overlay-spinner", "displayNone", "fadeOut");
    var spinner = document.createElement("img");
    spinner.classList.add("cloudnote__overlay-spinner-image");
    spinner.src = "img/spinner.gif";
    _overlaySpinner.appendChild(spinner);
    _overlaySpinner.addEventListener(Param.eventStart, function (e) {
      e.preventDefault();
    });
    Param.container.appendChild(_overlaySpinner);

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
      return [a, b, c].sort(arrayOrderNumberUp)[1];
    };

    _initDom();

  };

  app.module("Utils", Utils);

})(cloudnote);
