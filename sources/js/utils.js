(function (app) {

  // Dependencies
  var Param = {};

  var _overlaySpinner = {};

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
    Param.container.classList.add(status);
  }

  function removeGlobalStatus (status) {
    Param.container.classList.remove(status);
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

  function _enableEl (el) {
    el.classList.add("enabled");
    el.classList.remove("disabled");
  }

  function _disableEl (el) {
    el.classList.add("disabled");
    el.classList.remove("enabled");
  }

  function enableElements (els) {
    _iterable(els, _enableEl);
  }

  function disableElements (els) {
    _iterable(els, _disableEl);
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

  function createDom () {

    var dom = document.createElement("div");
    for (var i in arguments) {
      dom.classList.add(arguments[i]);
    }

    return dom;

  }

  function setSpinner (loading) {

    if (loading) {
      fadeInElements(_overlaySpinner);
    } else {
      fadeOutElements(_overlaySpinner);
    }

  }

  function getEventCoordX (e, offset, absolute) {

    if (absolute || typeof(e.layerX) === "undefined") {
      if (e.type.indexOf("mouse") >= 0) {
        return e.clientX - (offset || 0);
      } else {
        return e.touches[0].clientX - (offset || 0);
      }
    } else {
      return e.layerX;
    }

  }

  function getEventCoordY (e, offset, absolute) {

    if (absolute || typeof(e.layerY) === "undefined") {
      if (e.type.indexOf("mouse") >= 0) {
        return e.clientY - (offset || 0);
      } else {
        return e.touches[0].clientY - (offset || 0);
      }
    } else {
      return e.layerY;
    }

  }

  function intToHex (n) {

    n = n.toString(16);
    return (n.length === 1 ? "0" + n : n);

  }

  function promiseXHR (protocol, url, headers) {

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
            reject(xhr);
          } else {
            resolve(xhr);
          }
        }

      };

      try {
        xhr.send();
      } catch (e) {
        reject(xhr);
      }

    });

  }

  function _initDom () {

    _overlaySpinner = createDom("cloudnote__overlay-spinner", "displayNone", "fadeOut");
    var spinner = document.createElement("img");
    spinner.classList.add("cloudnote__overlay-spinner-image");
    spinner.src = "img/spinner.gif";
    _overlaySpinner.appendChild(spinner);
    _overlaySpinner.addEventListener(Param.eventStart, function (e) {
      e.preventDefault();
    });
    Param.container.appendChild(_overlaySpinner);

  }

  function init () {

    Param = app.Param;
    var MATH = Math;
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

  }

  app.module("Utils", {
    init: init,
    distance: distance,
    addGlobalStatus: addGlobalStatus,
    removeGlobalStatus: removeGlobalStatus,
    fadeInElements: fadeInElements,
    fadeOutElements: fadeOutElements,
    enableElements: enableElements,
    disableElements: disableElements,
    arrayOrderStringDown: arrayOrderStringDown,
    arrayOrderStringUp: arrayOrderStringUp,
    arrayOrderNumberUp: arrayOrderNumberUp,
    arrayOrderNumberDown: arrayOrderNumberDown,
    setConfig: setConfig,
    createDom: createDom,
    setSpinner: setSpinner,
    getEventCoordX: getEventCoordX,
    getEventCoordY: getEventCoordY,
    intToHex: intToHex,
    promiseXHR: promiseXHR
  });

})(cloudnote);
