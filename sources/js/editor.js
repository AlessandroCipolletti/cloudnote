(function (app) {

  var _config = {

  };

  var PI = Math.PI;
  var PI2 = PI * 2;
  var random = function (n) {
    return app.math.random() * n | 0;
  };
  var round = function (n, d) {
    var m = d ? app.math.pow(10, d) : 1;
    return app.math.round(n * m) / m;
  };
  var _canvas, _context, _canvasWidth, _canvasHeight;
  var _touchDown = false;
  var _minX, _minY, _maxX, _maxY, _oldX, _oldY, _oldMidX, _oldMidY, _cursorX, _cursorY;
  var _frameUpdateForce = false, _touchForce = 0, _touchEventObject = {};
  var _step = [], _stepCacheLength = 31, _currentStep = 0;
  var _tool = {
    size: 100,
    forceFactor: 2.5,
    color: "",
    randomColor: true,
    shape: "circle"
  };

  function setTool (tool) {
    // questa viene chiamata dal modulo che creerà la barra laterale dei tools su tool change
    // devo tener conto anche che potrebbe essere il righello o il picker
    var key;
    for (key in tool) {
      if (typeof (_tool[key]) !== "undefined") {
        _tool[key] = tool[key];
      }
    }

  }

   function _saveLayer () {

    return {
      data : _minX === -1 ? _context.getImageData(-1, -1, -1, -1) : _context.getImageData(_minX, _minY, _maxX - _minX, _maxY - _minY),
      minX : _minX,
      minY : _minY,
      maxX : _maxX,
      maxY : _maxY,
      oldX : _oldX,
      oldY : _oldY
    }

  }

  function _saveStep () {

    if (_currentStep !== 0) {
      _step.splice(0, _currentStep);
      _currentStep = 0;
    }
    _step.splice(0, 0, _saveLayer());
    if (_step.length > _stepCacheLength)
      _step.splice(_stepCacheLength, _step.length);
    if (_step.length > 1) {
      //_enableElements(_editorUndo);
      //app.Utils.enableElement();
    } else {
      //_disableElements(_editorUndo);
    }
    //_disableElements(_editorRedo);

  }

  function _checkCoord (x, y) {

    var offset = _tool.size / 2;
    if (_minX === -1 || _minX > (x - offset)) _minX = x - offset;
    if (_minY === -1 || _minY > (y - offset)) _minY = y - offset;
    if (_maxX === -1 || _maxX < (x + offset)) _maxX = x + offset;
    if (_maxY === -1 || _maxY < (y + offset)) _maxY = y + offset;
    if (_minX < 0) _minX = 0;
    if (_minY < 0) _minY = 0;
    if (_maxX > app.width) _maxX = app.width;
    if (_maxY > app.height) _maxY = app.height;
    _oldX = x;
    _oldY = y;

  }

  function _circle (x, y) {

    _context.beginPath();
    _context.fillStyle = _tool.color;
    _context.arc(x, y, _tool.size / 2, 0, PI2, true);
    _context.fill();

  }

  function _getRandomColor (alpha) {
    //function (a,b,c){return"#"+((256+a<<8|b)<<8|c).toString(16).slice(1)};
    if (typeof(alpha) === "undefined") {
      return "rgb(" + random(255) + ", " + random(255) + ", " + random(255) + ")";
    } else if (alpha === true) {
      return "rgba(" + random(255) + ", " + random(255) + ", " + random(255) + ", 0.7)";
    } else if (typeof(alpha) === "number") {
      return "rgba(" + random(255) + ", " + random(255) + ", " + random(255) + ", " + alpha + ")";
    }

  }

  function _updateTouchForce () {
    _touchForce = _touchEventObject.force;
    if (_touchForce > 0) {
      _frameUpdateForce = requestAnimationFrame(_updateTouchForce);
    } else {
      _frameUpdateForce = false;
    }
  }

  function _onTouchStart (e) {

    e.preventDefault();
    if ((e.touches && e.touches.length > 1) || _touchDown) return;
    if (app.Param.supportTouch) {
      _touchEventObject = e.touches[0];
      _updateTouchForce();
    }
    _touchDown = true;
    _cursorX = e.type.indexOf("mouse") >= 0 ? e.clientX : e.touches[0].clientX;
    _cursorY = e.type.indexOf("mouse") >= 0 ? e.clientY : e.touches[0].clientY;
    _checkCoord(_cursorX, _cursorY);
    if (_tool.randomColor) {
      _tool.color = _getRandomColor();
    }
    //_context.globalAlpha = 0.7;
    if (_tool.shape === "circle") {
      _circle(_cursorX, _cursorY);
    }
    _context.strokeStyle = _tool.color;
    _context.lineWidth = _tool.size;
    _context.lineJoin = "round";
    _context.lineCap = "round";
    //_context.shadowBlur = 0;
    //_context.shadowColor = _tool.color;
    _oldMidX = _cursorX;
    _oldMidY = _cursorY;

  }

  function _onTouchMove (e) {

    e.preventDefault();
    if ((e.touches && e.touches.length > 1) || _touchDown === false) return;
    if (app.Param.supportTouch) {
      _touchEventObject = e.touches[0];
      if (_frameUpdateForce === false && _touchForce === 0 && _touchEventObject.force > 0) {
        _updateTouchForce();
      }
    }
    _cursorX = e.type.indexOf("mouse") >= 0 ? e.clientX : e.touches[0].clientX;
    _cursorY = e.type.indexOf("mouse") >= 0 ? e.clientY : e.touches[0].clientY;
    if (_tool.size < 25 && app.math.abs(_oldX - _cursorX) + app.math.abs(_oldY - _cursorY) < 6) return;
    var midX = _oldX + _cursorX >> 1;
    var midY = _oldY + _cursorY >> 1;
    _context.beginPath();
    _context.lineWidth = _tool.size + round(_tool.size * _tool.forceFactor * _touchForce, 1);
    _context.moveTo(midX, midY);
    _context.quadraticCurveTo(_oldX, _oldY, _oldMidX, _oldMidY);
    _context.stroke();
    _oldX = _cursorX;
    _oldY = _cursorY;
    _oldMidX = midX;
    _oldMidY = midY;
    _checkCoord(_cursorX, _cursorY);

  }

  function _onTouchEnd (e) {

    if (_touchDown === false || (e.touches && e.touches.length)) return;
    _touchDown = false;
    if (app.Param.supportTouch === false) {
      _cursorX = e.clientX;
      _cursorY = e.clientY;
      if (_cursorX !== _oldX) {
        var midX = _oldX + _cursorX >> 1;
        var midY = _oldY + _cursorY >> 1;
        _context.beginPath();
        _context.moveTo(_oldMidX, _oldMidY);
        _context.quadraticCurveTo(_oldX, _oldY, _cursorX, _cursorY);
        _context.stroke();
      }
    }
    _saveStep();

  }

  function _onGestureStart (e) {
    console.log(e);
  }

  function _onGestureChange (e) {
    console.log(e);
  }

  function _onGestureEnd (e) {
    console.log(e);
  }

  function _onRotate (e) {

    var canvasStyle = app.window.getComputedStyle(_canvas);
    _canvasWidth = parseInt(canvasStyle.width);
    _canvasHeight = parseInt(canvasStyle.height);
    _canvas.width = _canvasWidth;
    _canvas.height = _canvasHeight;
    canvasStyle = undefined;

  }

  function _initDom () {

    _canvas = app.document.createElement("canvas");
    _context = _canvas.getContext("2d");
    _canvas.classList.add("cloudnote-editor__canvas");
    _canvas.addEventListener(app.Param.eventStart, _onTouchStart, true);
    _canvas.addEventListener(app.Param.eventMove, _onTouchMove, true);
    _canvas.addEventListener(app.Param.eventEnd, _onTouchEnd, true);

    if (app.Param.supportGesture) {

      _canvas.addEventListener("gesturestart", _onGestureStart, true);
      _canvas.addEventListener("gesturechange", _onGestureChange, true);
      _canvas.addEventListener("gestureend", _onGestureEnd, true);

    }

    app.Param.container.appendChild(_canvas);
    app.Main.addRotationHandler(_onRotate);

  }

  function _setConfig (params) {

    var key;
    for (key in params) {
      if (typeof (_config[key]) !== "undefined") {
        _config[key] = params[key];
      }
    }

  }

  function init (params) {

    _setConfig(params);
    _initDom();
    _minX = _minY = _maxX = _maxY = _oldX = _oldY = _oldMidX = _oldMidY = -1;

  }

  app.Editor = {
    init: init,
    setTool: setTool
  };

})(cloudnote);
