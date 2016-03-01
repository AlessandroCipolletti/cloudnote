/*
  in questa nuova versione, nella modalità con tutti i disegni, permetto 10 livelli di zoom, in cui l'area visualizzata cresce linearmente e non esponenzialmente come su google maps.
  quindi width = width * N ; scale = 1 / N

*/

(function (app) {

  var _config = {
    px4mm: 1,
    gpsRefreshTime: 5000,
    gpsTimeoutTime: 25000,
    scalePrecision: true,
    maxDeltaDragYgps: 10  // km
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
  var _container = {}, _svg = {}, _imageGroup = {}, _zoomLabel = {}, _zoomRect = {}, _showEditor = {};
  var _currentX = 0, _currentY = 0, _currentGpsMapScale = 0, _deltaDragYgps = 0;
  var _decimals = 0, _cacheNeedsUpdate = false, _idsImagesOnDashboard = [];

  function _appendDraw (draw) {	// aggiunge alla dashboard un svg image già elaborato

    if (!draw || !draw.id || _idsImagesOnDashboard.indexOf(draw.id) >= 0) return false;
    console.log(["aggiungo", draw]);
    _idsImagesOnDashboard.push(draw.id);
    _idsImagesOnDashboard = _idsImagesOnDashboard.sort(app.Utils.arrayOrderStringDown);
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
      _newDraw.setAttribute("x", round(((draw.x - _currentX) * z + app.width / 2 - _imageGroup.pxx) / z, _decimals));
      _newDraw.setAttribute("y", round(((_currentY - draw.y) * z + app.height / 2 - _imageGroup.pxy) / z, _decimals));
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
      _newDraw = draw = undefined;

    }
    _cacheNeedsUpdate = true;
    return true;

  }

  function show () {
    app.Utils.fadeInElements([_zoomLabel, _zoomRect, _showEditor]);
  }

  function _hide () {
    app.Utils.fadeOutElements([_zoomLabel, _zoomRect, _showEditor]);
  }

  function getCoords () {
    return {
      x: round(_currentX),
      y: round(_currentY),
      z: round(_currentZ)
    };
  }

  function go2Gps () {
    app.Dashboard.Gps.currentGps2px(false, _go2XYZ);
  }

  function _fillScreen () {	// OK
    // 1 - aggiorna le coordinate in px delle immagini in cache (e rimuove quelle non piu visibili)
    _deltaDragX = _deltaDragY = _deltaZoom = 0;
    _updateCache();
    // 2° calcola la porzione da mostrare in base alle coordinate correnti, zoom e dimensioni schermo
    var _area = _getVisibleArea();
    // 3° visualizza subito quello che c'è già in cache
    _findInCache();
    // 4° avvia trasferimenti di ciò che non è in cache e che deve comparire
    _callSocketFor(_area, _cache.ids());

  }

  function _go2XYZ (x, y, z) {

    z = z || 5; // TODO valore zoom default
    if (_currentGpsMapScale === 0 || _currentY === false || Math.abs(y - _currentY) > _config.maxDeltaDragYgps) {
      _updateGpsMapScaleForY(y);
    }
    _updateDeltaVisibleCoords(z);
    _updateCurrentCoords(x, y, z);
    _cache.reset();
    _idsImagesOnDashboard = [];
    _initDomGroup();
    //_fillScreen();

  }

  function _updateGpsMapScaleForY (pxy) {

    _currentGpsMapScale = app.Dashboard.Gps.pxy2scale(pxy);
    _deltaDragYgps = 0;

  }

  function _updateDeltaVisibleCoords (z) {

    z = z || _imageGroup.matrix.a;
    _deltaVisibleCoordX = app.width / z * _currentGpsMapScale;
    _deltaVisibleCoordY = app.height / z * _currentGpsMapScale;

  }

  function _updateCurrentCoords (x, y, z) {

    _currentX = x;
    _currentY = y;
    _currentZ = z;
    _minVisibleCoordX = x - _deltaVisibleCoordX;
    _maxVisibleCoordX = x + _deltaVisibleCoordX;
    _minVisibleCoordY = y - _deltaVisibleCoordY;
    _maxVisibleCoordY = y + _deltaVisibleCoordY;

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
    origin.setAttributeNS(null, "height", "1");
    origin.setAttributeNS(null, "width", "1");
    origin.setAttributeNS(null, "fill", "#FFF");
    g.appendChild(origin);
    _svg.appendChild(g);
    _imageGroup.tag = g;
    _imageGroup.origin = origin;
    _imageGroup.matrix = _imageGroup.tag.getCTM();
    _updateDeltaVisibleCoords();

  }

  function _onRotate (e) {
    // do some stuff
  }

  function _openEditor () {

    _hide();
    app.Editor.show();

  }

  function _initDom () {

    _container = app.Utils.createDom("cloudnote-dashboard__container");
    _container.style.height = "calc(100% - " + app.Param.headerSize + "px)";
    _container.style.top = app.Param.headerSize + "px";
    _svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    _svg.setAttribute("version", "1.1");
    _svg.classList.add("cloudnote-dashboard__svg");
    _initDomGroup();
    _zoomRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    _zoomRect.classList.add("cloundote-dashboard__zoom-label-rect");
    _zoomRect.setAttribute("x", "-16");
    _zoomRect.setAttribute("y", "-16");
    _zoomRect.setAttribute("rx", "16");
    _zoomRect.setAttribute("ry", "16");
    _zoomRect.setAttribute("width", "120");
    _zoomRect.setAttribute("height", "100");
    _zoomLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    _zoomLabel.classList.add("cloundote-dashboard__zoom-label");
    _zoomLabel.setAttribute("x", "20");
    _zoomLabel.setAttribute("y", "50");
    _zoomLabel.innerHTML = "100%";
    _svg.appendChild(_zoomRect);
    _svg.appendChild(_zoomLabel);
    _container.appendChild(_svg);
    _showEditor = document.createElement("a");
    _showEditor.classList.add("cloudnote-dashboard__showeditor", "button");
    _showEditor.innerHTML = "Disegna";
    _showEditor.addEventListener(app.Param.eventStart, _openEditor);
    _container.appendChild(_showEditor);
    app.Param.container.appendChild(_container);
    app.Main.addRotationHandler(_onRotate);

  }

  function init (params) {

    _config = app.Utils.setConfig(params, _config);
    _config.maxDeltaDragYgps = _config.maxDeltaDragYgps * 1000 * 1000 * _config.px4mm; // from km to px
    app.Dashboard.Gps.init(_config);
    _imageGroup.updateMatrix = function () {
      var matrix = _imageGroup.matrix;
      _imageGroup.tag.setAttribute("transform", "matrix(" + matrix.a + "," + matrix.b + "," + matrix.c + "," + matrix.d + "," + round(matrix.e, 4) + "," + round(matrix.f, 4) + ")");
    };
    _initDom();
    _go2XYZ(0, 0, 0);

  }

  app.Dashboard = {
    init: init,
    show: show,
    addDraw: addDraw,
    getCoords: getCoords,
    go2Gps: go2Gps
  };

})(cloudnote);
