/*
  in questa nuova versione, nella modalità con tutti i disegni, permetto 10 livelli di zoom, in cui l'area visualizzata cresce linearmente e non esponenzialmente come su google maps.
  quindi width = width * N ; scale = 1 / N

*/

(function (app) {

  // Dependencies
  var Param = {};
  var Utils = {};
  var Messages = {};
  var Main = {};
  var Editor = {};
  var Socket = {};
  var Gps = {};
  var Tooltip = {};

  var _config = {
    px4mm: 1,
    gpsRefreshTime: 5000,
    gpsTimeoutTime: 25000,
    scalePrecision: true,
    maxDeltaDragYgps: 10,  // km
    clickMargin: 6,
    tooltipSide: "right",
    maxScale: 1,
    minScale: 0.1
  };

  var _cache = (function () {
    var _list = {}, _ids = [], _maxCacheSize = 100,	// forse sarebbe cool parametrizzare questo in base alle prestazioni locali
      _updateIds = function () {
        _ids = Object.keys(_list);
      },
      add = function (id, data) {
        // se la cache html5 può fare al caso nostro, salviamo data in cache, e id nella lista cosi sappiamo cosa abbiamo e cosa no
        // altrimenti mettiamo entrambi nel dizionario _list
        if (_list[id]) return;
        _list[id] = data;
        _updateIds();
      },
      get = function (id) {
        return _list[id] || false;
      },
      set = function (id, data) {
        del(id);
        add(id, data);
      },
      del = function (id) {
        _list[id] = undefined;
        delete _list[id];
        _updateIds();
      },
      log = function () {
        console.log(_list);
      },
      ids = function () {
        return _ids;
      },
      length = function () {
        return _ids.length;
      },
      exist = function (id) {
        return _ids.indexOf(id) >= 0;
      },
      clean = function (force) { // magari anche un metodo che controlli quanto abbiamo in cache e se necessario la liberi
        if (force || _ids.length > _maxCacheSize) {

        }
      },
      reset = function () {
        for (var i = _ids.length; i--;) {
          var draw  = _list[_ids[i]];
          draw.onScreen = draw.onDashboard = false;
        }
      };
    return {
      get: get,
      set: set,
      add: add,
      del: del,
      log: log,
      ids: ids,
      length: length,
      exist: exist,
      clean: clean,
      reset: reset
    };
  })();

  function round (n, d) {
    var m = d ? Math.pow(10, d) : 1;
    return Math.round(n * m) / m;
  }
  var PI = Math.PI;
  var _container = {}, _svg = {}, _imageGroup = {}, _zoomLabel = {}, _zoomRect = {}, _showEditor = {}, _spinner = {};
  var _currentX = 0, _currentY = 0, _currentZ = 1, _currentGpsMapScale = 0, _deltaDragYgps = 0, _socketCallsInProgress = 0;
  var _decimals = 0, _cacheNeedsUpdate = false, _idsImagesOnDashboard = [], _isLoading = false;
  var _cursorX = 0, _cursorY = 0, _clickX = 0, _clickY = 0, _currentScale = 1, _draggable = true, _touchDown = false;
  var _deltaDragX = 0, _deltaDragY = 0, _deltaZoom = 0, _deltaDragMax = 200;
  var _canvasForClick = document.createElement("canvas"), _contextForClick = _canvasForClick.getContext("2d"), _imageForClick = new Image();
  var _svgOffset = {};

  function _appendDraw (draw) {

    if (!draw || !draw.id || _idsImagesOnDashboard.indexOf(draw.id) >= 0) return false;
    console.log(["aggiungo", draw]);
    _idsImagesOnDashboard.push(draw.id);
    _idsImagesOnDashboard = _idsImagesOnDashboard.sort(Utils.arrayOrderStringDown);
    var index = _idsImagesOnDashboard.indexOf(draw.id) + 1;
    if (index < _idsImagesOnDashboard.length) {
      _imageGroup.tag.insertBefore(draw.data, document.getElementById(_idsImagesOnDashboard[index]));
    } else {
      _imageGroup.tag.appendChild(draw.data);
    }
    draw.onDashboard = true;
    _cache.add(draw.id, draw);

  }

  function addDraw (draw, replace) {

    if (!draw || !draw.id) return false;
    var _drawExist = _cache.exist(draw.id),
      z = _imageGroup.matrix.a;
    if (!_drawExist || replace) {

      if (_drawExist) {
        _removeDraw(draw.id, true);
      }
      var _newDraw = document.createElementNS("http://www.w3.org/2000/svg", "image");
      _newDraw.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", draw.base64);
      _newDraw.setAttribute("x", round(((draw.x - _currentX) * z + app.WIDTH / 2 - _imageGroup.pxx) / z, _decimals));
      _newDraw.setAttribute("y", round(((_currentY - draw.y) * z + app.HEIGHT / 2 - _imageGroup.pxy) / z, _decimals));
      _newDraw.setAttribute("width", draw.w);
      _newDraw.setAttribute("height", draw.h);
      _newDraw.id = draw.id;
      draw.base64 = undefined;
      delete draw.minX;
      delete draw.minY;
      delete draw.maxX;
      delete draw.maxY;
      delete draw.coordX;
      delete draw.coordY;
      delete draw.base64;
      draw.data = _newDraw;
      _appendDraw(draw);
      Messages.success("Salvataggio riuscito");
      _newDraw = draw = undefined;

    }
    _cacheNeedsUpdate = true;
    return true;

  }

  function show () {
    _setSpinner(_socketCallsInProgress > 0);
    Utils.fadeInElements([_zoomLabel, _zoomRect, _showEditor]);
  }

  function _hide () {
    _setSpinner(false);
    Utils.fadeOutElements([_zoomLabel, _zoomRect, _showEditor]);
  }

  function getCoords () {
    return {
      x: round(_currentX),
      y: round(_currentY),
      z: round(_currentZ)
    };
  }

  function go2Gps () {
    Gps.currentGps2px(false, _go2XYZ);
  }

  function _isOnScreen (img) {
    return (img.pxr > 0 && img.pxx < app.WIDTH && img.pxb > 0 && img.pxy < app.HEIGHT);
  }

  function _isOnDashboard (img) {
    return (img.r > _minVisibleCoordX && img.b < _maxVisibleCoordY && img.x < _maxVisibleCoordX && img.y > _minVisibleCoordY);
  }

  function _getVisibleArea () {

    return {
      minX: _minVisibleCoordX,
      maxX: _maxVisibleCoordX,
      minY: _minVisibleCoordY,
      maxY: _maxVisibleCoordY,
      x: _currentX,
      y: _currentY
    };

  }

  function _removeDraw (id, del) {

    console.log("rimuovo:" + id);
    if (del) {
      _cache.del(id);
    }
    _idsImagesOnDashboard.splice(_idsImagesOnDashboard.indexOf(id), 1);
    var _oldDraw = document.getElementById(id);
    if (_oldDraw) {
      _imageGroup.tag.removeChild(_oldDraw);
    }

  }

  function _updateCache () {

    var ids = _cache.ids(), img, rect;
    var isOnDashboard = _isOnDashboard,
      isOnScreen = _isOnScreen,
      R = round,
      decimals = _decimals,
      svgOffset = _svgOffset;
    _idsImagesOnScreen = [];

    for (var i = ids.length; i--;) {

      img = _cache.get(ids[i]);
      rect = img.data.getBoundingClientRect();
      img.pxx = R(rect.left - svgOffset.left, decimals);
      img.pxy = R(rect.top - svgOffset.top, decimals);
      img.pxw = R(rect.width, decimals);
      img.pxh = R(rect.height, decimals);
      img.pxr = img.pxx + img.pxw;
      img.pxb = img.pxy + img.pxh;
      img.onDashboard = isOnDashboard(img);
      img.onScreen = isOnScreen(img);
      if (_idsImagesOnDashboard.indexOf(img.id) >= 0 && !img.onDashboard) {
        _removeDraw(img.id, false);
      }
      if (img.onScreen) {
        _idsImagesOnScreen.push(img.id);
      }
      _cache.set(img.id, img);

    }
    isOnDashboard = isOnScreen = decimals = R = svgOffset = undefined;
    _cacheNeedsUpdate = false;

  }

  function _findInCache () {

    var _ids = _cache.ids().filter(function (i) {
        return _idsImagesOnDashboard.indexOf(i) < 0;
      }), draw;

    for (var i = _ids.length; i--;) {
      draw = _cache.get(_ids[i]);
      if (_isOnDashboard(draw)) {
        _appendDraw(draw);
      }
    }

  }

  function _callSocketFor (area, notIds) {

    _socketCallsInProgress++;
    _isLoading = true;
    _setSpinner(true);

    console.log("chiama per", area, notIds);
    Socket.emit("dashboard drag", {
      "area": area,
      "ids": notIds
    });

  }

  function _fillScreen () {	// OK

    _deltaDragX = _deltaDragY = _deltaZoom = 0;
    _updateCache();
    _findInCache();
    _callSocketFor(_getVisibleArea(), _cache.ids());

  }

  function onSocketMessage (data) {

    console.log("ricevuto", data);
    if (["end", "none", "error"].indexOf(data) >= 0) {
      _socketCallsInProgress--;
      if (_socketCallsInProgress === 0) {
        _isLoading = false;
        _setSpinner(false);
      }
    } else {
      for (var draws = JSON.parse(data), i = draws.length; i--; ) {
        if (_cache.exist(draws[i].id)) {
          continue;
        }
        addDraw(draws[i]);
      }
    }
    data = undefined;

  }

  function _go2XYZ (x, y, z) {

    z = z || 1; // TODO valore zoom default
    if (_currentGpsMapScale === 0 || _currentY === false || Math.abs(y - _currentY) > _config.maxDeltaDragYgps) {
      _updateGpsMapScaleForY(y);
    }
    _initDomGroup();
    _updateCurrentCoords(x, y, z);
    _cache.reset();
    _idsImagesOnDashboard = [];
    _fillScreen();

  }

  function _setSpinner (loading) {

    if (loading) {
      Utils.fadeInElements(_spinner);
    } else {
      Utils.fadeOutElements(_spinner);
    }

  }

  function _updateGpsMapScaleForY (pxy) {

    _currentGpsMapScale = Gps.pxy2scale(pxy);
    _deltaDragYgps = 0;

  }

  function _updateDeltaVisibleCoords (z) {

    z = z || _imageGroup.matrix.a;
    _deltaVisibleCoordX = app.WIDTH / z * _currentGpsMapScale;
    _deltaVisibleCoordY = app.HEIGHT / z * _currentGpsMapScale;

  }

  function _updateCurrentCoords (x, y, z) {

    _currentX = x;
    _currentY = y;
    if (z) {
      _currentZ = z;
    }
    _minVisibleCoordX = x - _deltaVisibleCoordX;
    _maxVisibleCoordX = x + _deltaVisibleCoordX;
    _minVisibleCoordY = y - _deltaVisibleCoordY;
    _maxVisibleCoordY = y + _deltaVisibleCoordY;

  }

  function _updateGroupOrigin () {

    var _groupRect = _imageGroup.origin.getBoundingClientRect();
    _imageGroup.pxx = round(_groupRect.left, _decimals);
    _imageGroup.pxy = round(_groupRect.top - Param.headerSize, _decimals);

  }

  function _initDomGroup () {

    if (_imageGroup.tag) {
      _svg.removeChild(_imageGroup.tag);
      _imageGroup.origin = _imageGroup.tag = null;
      _imageGroup.pxx = _imageGroup.pxy = 0;
      _imageGroup.matrix = null;
    }
    var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    var origin = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    origin.setAttributeNS(null, "x", 0);
    origin.setAttributeNS(null, "y", 0);
    origin.setAttributeNS(null, "height", "10");
    origin.setAttributeNS(null, "width", "10");
    origin.setAttributeNS(null, "fill", "black");
    g.appendChild(origin);
    _svg.appendChild(g);
    _imageGroup.tag = g;
    _imageGroup.origin = origin;
    _imageGroup.matrix = _imageGroup.tag.getCTM();
    _updateDeltaVisibleCoords();
    _updateGroupOrigin();

  }

  function _onRotate (e) {
    // do some stuff
  }

  function _openEditor () {

    if (this.classList.contains("disabled") === false) {
      _hide();
      Editor.show();
    }

  }

  function _selectDrawAtPx (x, y) {

    if (_cacheNeedsUpdate) {
      _updateCache();
    }
    _idsImagesOnScreen.sort(Utils.orderArrayStringUp);
    var draw, selectedDraw = false;
    for (var i = 0, l = _idsImagesOnScreen.length; i < l; i++) {

      draw = _cache.get(_idsImagesOnScreen[i]);
      if (draw.pxx < x && draw.pxr > x && draw.pxy < y && draw.pxb > y) {

        if (!selectedDraw) {
          selectedDraw = draw;
        }
        _contextForClick.clearRect(0, 0, _canvasForClick.width, _canvasForClick.height);
        _canvasForClick.width = draw.pxw;
        _canvasForClick.height = draw.pxh;
        _imageForClick.src = draw.data.getAttributeNS("http://www.w3.org/1999/xlink", "href");
        _contextForClick.drawImage(_imageForClick, 0, 0, draw.pxw, draw.pxh);
        if (_contextForClick.getImageData(x - draw.pxx, y - draw.pxy, 1, 1).data[3] > 0) {
          selectedDraw = draw;
          break;
        }

      }

    }

    if (selectedDraw) {
      Tooltip.show(selectedDraw);
    }

    _contextForClick.clearRect(0, 0, _canvasForClick.width, _canvasForClick.height);
    _canvasForClick.width = _canvasForClick.height = 0;
    selectedDraw = undefined;
    _imageForClick = new Image();

  }

  function _drag (dx, dy, forceLoad) {

    if (dx === 0 && dy === 0) return;
    console.log("drag", dx, dy);
    var scale = _imageGroup.matrix.a;
    var deltaCoordX = round(dx / scale, _decimals);
    var deltaCoordY = round(dy / scale, _decimals);
    var newCoordX = round(_currentX - deltaCoordX, _decimals);
    var newCoordY = round(_currentY + deltaCoordY, _decimals);
    _deltaDragX += dx;
    _deltaDragY += dy;

    _imageGroup.matrix = _imageGroup.matrix.translate(deltaCoordX, deltaCoordY);
    _imageGroup.updateMatrix();
    _updateCurrentCoords(newCoordX, newCoordY, scale);
    _updateGroupOrigin();

    if (forceLoad || Math.abs(_deltaDragX) > _deltaDragMax || Math.abs(_deltaDragY) > _deltaDragMax) {
      _fillScreen();
    } else {
      _cacheNeedsUpdate = true;
    }

  }

  function _onTouchStart (e) {

    e.preventDefault();
    if ((!e.button) && (!e.touches || e.touches.length === 1) && _touchDown === false) {

      _touchDown = true;
      _svg.classList.add("cloudnote-dashboard__dragging");
      _cursorX = _clickX = Utils.getEventCoordX(e);
      _cursorY = _clickY = Utils.getEventCoordY(e, Param.headerSize);
      _imageGroup.matrix = _imageGroup.tag.getCTM();

    }

  }

  function __touchMove (dx, dy, cursorX, cursorY) {

    _drag(dx, dy, false);
    _cursorX = cursorX;
    _cursorY = cursorY;
    _draggable = true;

  }

  function _onTouchMove (e) {

    e.preventDefault();
    if ((!e.touches || e.touches.length === 1) && _touchDown && _draggable) {

      _draggable = false;
      var cursorX = Utils.getEventCoordX(e);
      var cursorY = Utils.getEventCoordY(e, Param.headerSize);
      var dx = cursorX - _cursorX;
      var dy = cursorY - _cursorY;
      requestAnimationFrame(__touchMove.bind({}, dx, dy, cursorX, cursorY));

    }

  }

  function _onTouchEnd (e) {

    e.preventDefault();
    if ((!e.button) && (!e.touches || e.touches.length === 0) && _touchDown) {

      var cursorX = Utils.getEventCoordX(e);
      var cursorY = Utils.getEventCoordY(e, Param.headerSize);
      if (Math.abs(_clickX - cursorX) < _config.clickMargin && Math.abs(_clickY - cursorY) < _config.clickMargin) {
        _selectDrawAtPx(cursorX, cursorY);
      }
      _cursorX = _cursorY = 0;
      _touchDown = false;
      _svg.classList.remove("cloudnote-dashboard__dragging");

    }

  }

  function _updateMatrixForGesture (x, y, scale, rotation) {

    console.log("gesture", x, y, scale, rotation);
    _touchDown = false;
    _cursorX = _cursorY = 0;
    scale  = Math.between(scale * _currentScale, _config.maxScale, _config.minScale);
    x = x - _imageGroup.pxx;
    y = y - _imageGroup.pxy;
    _imageGroup.matrix.a = _imageGroup.matrix.d = scale;
    _imageGroup.matrix.e = x - scale * x; // qui invece di x e y rispetto allo schermo devo passare x e y rispetto all'origine dell'svg
    _imageGroup.matrix.f = y - scale * y;
    _imageGroup.updateMatrix();
    _updateGroupOrigin();


    _updateDeltaVisibleCoords(scale);
    //_updateCurrentCoords(x, y);


    if (scale < _config.maxScale) {
      Utils.disableElements(_showEditor);
    } else {
      Utils.enableElements(_showEditor);
    }

    /*
    var newp = _svg.createSVGPoint();
    newp.x = _gestureX;
    newp.y = _gestureY;
    newp = newp.matrixTransform(_imageGroup.tag.getScreenCTM().inverse());
    newp.x = round(newp.x);
    newp.y = round(newp.y);
    */


  }

  function _onGestureStart (e) {

    e.preventDefault();
    _updateMatrixForGesture(Utils.getEventCoordX(e), Utils.getEventCoordY(e), e.scale, e.rotation);

  }

  function _onGestureChange (e) {

    e.preventDefault();
    _updateMatrixForGesture(Utils.getEventCoordX(e), Utils.getEventCoordY(e), e.scale, e.rotation);

  }

  function _onGestureEnd (e) {

    e.preventDefault();
    _updateMatrixForGesture(Utils.getEventCoordX(e), Utils.getEventCoordY(e), e.scale, e.rotation);
    _currentScale = _imageGroup.matrix.a;

  }

  function _initDom () {

    _container = Utils.createDom("cloudnote-dashboard__container");
    _container.style.height = "calc(100% - " + Param.headerSize + "px)";
    _container.style.top = Param.headerSize + "px";
    _svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    _svg.setAttribute("version", "1.1");
    _svg.classList.add("cloudnote-dashboard__svg");

    _zoomRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    _zoomRect.classList.add("cloundote-dashboard__zoom-label-rect");
    _zoomRect.setAttribute("x", -8 * Param.pixelRatio);
    _zoomRect.setAttribute("y", -8 * Param.pixelRatio);
    _zoomRect.setAttribute("rx", 8 * Param.pixelRatio);
    _zoomRect.setAttribute("ry", 8 * Param.pixelRatio);
    _zoomRect.setAttribute("width", 60 * Param.pixelRatio);
    _zoomRect.setAttribute("height", 50 * Param.pixelRatio);
    _zoomLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    _zoomLabel.classList.add("cloundote-dashboard__zoom-label");
    _zoomLabel.setAttribute("x", 10 * Param.pixelRatio);
    _zoomLabel.setAttribute("y", 25 * Param.pixelRatio);
    _zoomLabel.innerHTML = "100%";
    _svg.appendChild(_zoomRect);
    _svg.appendChild(_zoomLabel);

    _svg.addEventListener(Param.eventStart, _onTouchStart, true);
    _svg.addEventListener(Param.eventMove, _onTouchMove, true);
    _svg.addEventListener(Param.eventEnd, _onTouchEnd, true);
    if (Param.supportGesture) {

      _svg.addEventListener("gesturestart", _onGestureStart, true);
      _svg.addEventListener("gesturechange", _onGestureChange, true);
      _svg.addEventListener("gestureend", _onGestureEnd, true);

    }
    _container.appendChild(_svg);

    _showEditor = document.createElement("a");
    _showEditor.classList.add("cloudnote-dashboard__showeditor", "button", "fadeIn");
    _showEditor.innerHTML = "Disegna";
    _showEditor.addEventListener(Param.eventStart, _openEditor);
    _container.appendChild(_showEditor);

    _spinner = Utils.createDom("cloudnote-dashboard__spinner", "displayNone", "fadeOut");
    var spinner = document.createElement("img");
    spinner.classList.add("cloudnote-dashboard__spinner-image");
    spinner.src = "img/spinner.gif";
    _spinner.appendChild(spinner);
    _container.appendChild(_spinner);

    Param.container.appendChild(_container);
    _svgOffset = _svg.getBoundingClientRect();
    Main.addRotationHandler(_onRotate);

  }

  function init (params) {

    Param = app.Param;
    Utils = app.Utils;
    Messages = app.Messages;
    Main = app.Main;
    Editor = app.Editor;
    Socket = app.Socket;
    Gps = app.Dashboard.Gps;
    Tooltip = app.Dashboard.Tooltip;
    _config = Utils.setConfig(params, _config);
    _config.maxDeltaDragYgps = _config.maxDeltaDragYgps * 1000 * 1000 * _config.px4mm; // from km to px
    _config.clickMargin = _config.clickMargin * Param.pixelRatio;
    Gps.init(_config);
    _imageGroup.updateMatrix = function () {
      var matrix = _imageGroup.matrix;
      _imageGroup.tag.setAttribute("transform", "matrix(" + matrix.a + "," + matrix.b + "," + matrix.c + "," + matrix.d + "," + round(matrix.e, 4) + "," + round(matrix.f, 4) + ")");
      matrix = undefined;
    };
    _initDom();
    Tooltip.init(_config, _container);
    _go2XYZ(0, 0, 0);

  }

  app.module("Dashboard", {
    init: init,
    show: show,
    addDraw: addDraw,
    getCoords: getCoords,
    go2Gps: go2Gps,
    onSocketMessage: onSocketMessage
  });

})(cloudnote);
