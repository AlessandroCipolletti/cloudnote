/*
  in questa nuova versione, nella modalità con tutti i disegni, permetto 10 livelli di zoom, in cui l'area visualizzata cresce linearmente e non esponenzialmente come su google maps.
  quindi width = width * N ; scale = 1 / N

*/

(function (app) {

  var _config = {

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
  var _gps = (function () {
    var _px4mm = 1, _lastPosition = false, _refreshTime = 5000, _scalePrecision = true,
      _GEO = navigator.geolocation, _scaleFactor,
      _WGS84 = {
        r_major: 6378137000,
        r_minor: 6356752314.245179,
        f: 298.257223563,
      },
      _geoOptions = {
        enableHighAccuracy: true,
        timeout: 25000,
        maximumAge: 0
      },
      _positionIsValid = function () {
        return (_lastPosition && (new Date().getTime() - _lastPosition.timestamp < _refreshTime));
      },
      _scaleFactorExact = function (lat) {
        var r = Math.radians(lat);
        var s = 1 / Math.cos(r);
        var c = Math.sqrt(1 - Math.pow(0.006694379990141317, 2) * Math.pow(Math.sin(r), 2));
        return s * c;
      },
      _scaleFactorRounded = function (lat) {
        return 1 / Math.cos(Math.radians(lat));
      },
      _scaleFactor = _scalePrecision ? _scaleFactorExact : _scaleFactorRounded,
      _lon2mm = function (lon) {
        return Math.round((_WGS84.r_major * Math.radians(lon)) * 10) / 10;
      },
      _lat2mm = function (lat) {
        if (lat > 89.5) lat = 89.5;
        if (lat < -89.5) lat = -89.5;
        var phi = Math.radians(lat);
        var con = _WGS84.eccent * Math.sin(phi);
        con = Math.pow((1.0 - con) / (1.0 + con), 0.5 * _WGS84.eccent);
        return Math.round((-_WGS84.r_major * Math.log(Math.tan(0.5 * (PI * 0.5 - phi)) / con)) * 10) / 10;
      },
      _mm2lon = function (mmx) {
        return Math.degrees((mmx / _WGS84.r_major));
      },
      _mm2lat = function (mmy) {
        var N_ITER = 15;
        var HALFPI = PI / 2;
        var TOL = 0.0000000001;
        var ts = Math.exp(0 - (mmy / _WGS84.r_major));
        var e = _WGS84.eccent;
        var eccnth, Phi, con, dphi;
        var i = N_ITER;
        var eccnth = 0.5 * e;
        Phi = HALFPI - 2 * Math.atan(ts);
        do {
          con = e * Math.sin(Phi);
          dphi = HALFPI - 2 * Math.atan(ts * Math.pow((1 - con) / (1 + con), eccnth)) - Phi;
          Phi = Phi + dphi;
        }
        while (Math.abs(dphi) > TOL && --i);
        return Math.degrees(Phi);
      },
      _gps2px = function (position, lat, lon) {
        if (position) {
          var lon = position.coords.longitude;
          var lat = position.coords.latitude;
        }
        return {
          x: _lon2mm(lon) * _px4mm,
          y: _lat2mm(lat) * _px4mm
        };
      },
      _px2gps = function (pxx, pxy) {
        return {
          lat: _mm2lat(pxy / _px4mm),
          lon: _mm2lon(pxx / _px4mm)
        };
      },
      _geoCallback = function (callback) {
        return function (position) {
          _lastPosition = position;
          LAT.push(position.coords.latitude)
          LON.push(position.coords.longitude);
          console.log("GPS - lat:", position.coords.latitude, "lon:", position.coords.longitude);
          callback && callback(position);
        };
      },
      _geoError = function (err) {
        Messages.error(label['errorGeo']);
      },
      _getPosition = _GEO ? function (force, callback, error) {
        if (force || !_positionIsValid()) {
          _GEO.getCurrentPosition(_geoCallback(callback), error || _geoError, _geoOptions);
        } else {
          callback(_lastPosition);
        }
      } : function (force, callback, error) {
        (error || _geoError)();
      },
      pxy2scale = function (pxy) {
        return _scaleFactor(_mm2lat(pxy / _px4mm));
      },
      coordGps2px = function (lat, lon) {
        return _gps2px(false, lat, lon);
      },
      // so che potrei usare un livello di callback in meno per avere comunque gps2px, ma cosi posso usare_getPosition anche per altre funzionalità API
      currentGps2px = function (forceRefresh, callback, error) {
        if (!callback) return;
        _getPosition(forceRefresh || false, function (position) {
          var px = _gps2px(position);
          callback(px.x, px.y);
        }, error || emptyFN);
      },
      init = function () {
        _WGS84.temp = _WGS84.r_minor / _WGS84.r_major;
        _WGS84.eccent = Math.sqrt(1.0 - (_WGS84.temp * _WGS84.temp));
        _maxDeltaDragYgps = _maxDeltaDragYgps * 1000 * 1000 * _px4mm; // passaggio da metri a mm e poi px
      };
    return {
      init: init,
      pxy2scale: pxy2scale,
      currentGps2px: currentGps2px,
      coordGps2px: coordGps2px
    };
  })();

  function round (n, d) {
    var m = d ? Math.pow(10, d) : 1;
    return Math.round(n * m) / m;
  }
  var PI = Math.PI;
  var _container = {}, _svg = {}, _imageGroup = {}, _zoomLabel = {}, _zoomRect = {}, _showEditor = {};
  var _currentX = 0, _currentY = 0, _currentGpsMapScale = 0, _maxDeltaDragYgps = 10 /* km */, _deltaDragYgps = 0;
  var _decimals = 0, _cacheNeedsUpdate = false, _idsImagesOnDashboard = [];

  _appendDraw = function (draw) {	// aggiunge alla dashboard un svg image già elaborato

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

  addDraw = function (draw, replace) {

    if (!draw || !draw.id) return false;
    var _drawExist = _cache.exist(draw.id),
      z = _imageGroup.matrix.a;
    if (!_drawExist || replace) {
      _drawExist && _removeDraw(draw.id, true);
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
    _gps.currentGps2px(false, _go2XYZ);
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
    if (_currentGpsMapScale === 0 || _currentY === false || Math.abs(y - _currentY) > _maxDeltaDragYgps) {
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

    _currentGpsMapScale = _gps.pxy2scale(pxy);
    _deltaDragYgps = 0;

  }

  function _updateDeltaVisibleCoords (z) {

    z = z || _imageGroup.matrix.a;
    _deltaVisibleCoordX = app.width / z * _currentGpsMapScale;
    _deltaVisibleCoordY = app.height / z * _currentGpsMapScale;

  };

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
    var origin = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
    g.setAttribute('id', 'imageGroup');
    origin.setAttributeNS(null, 'x', 0);
    origin.setAttributeNS(null, 'y', 0);
    origin.setAttributeNS(null, 'height', '1');
    origin.setAttributeNS(null, 'width', '1');
    origin.setAttributeNS(null, 'fill', '#FFF');
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
