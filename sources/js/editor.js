(function (app) {

  // Dependencies
  var Param = {};
  var Utils = {};
  var Messages = {};
  var Main = {};
  var Tools = {};
  var ColorPicker = {};
  var Dashboard = {};
  var User = {};
  var Socket = {};

  var _config = {
    primaryColors: ["#000000", "#C0C0C0", "#FFFFFF", "#FFAEB9", "#6DF4FF", "#00AAFF", "#0000FF", "#551A8B", "#8B008B", "#800000", "#CD0000", "#FF0000", "#FF7F00", "#FFFF00", "#00FF00", "#00CD00", "#008000" ],
    tools: ["marker", "pencil", "eraser", "undo", "redo", "save", "clear", "paper", "exit"],
    toolsSide: "left",
    minPxToDraw: 3
  };

  var PI = Math.PI;
  var PI2 = PI * 2;
  var round = function (n, d) {
    var m = d ? Math.pow(10, d) : 1;
    return Math.round(n * m) / m;
  };
  var _container, _canvas, _context, _toolCursor, _canvasWidth, _canvasHeight;
  var _touchDown = false;
  var _currentPaper = "white";
  var _minX, _minY, _maxX, _maxY, _oldX, _oldY, _oldMidX, _oldMidY, _cursorX, _cursorY;
  var _savedDraw = {}, _currentUser = {}, _currentFakeId = 0;
  var _frameUpdateForce = false, _touchForce = 0, _touchEventObject = {};
  var _step = [], _stepCacheLength = 21, _currentStep = 0, _toolsWidth = 75.5, _colorsPickerHeight = 75.5;
  var _pixelRatio = 1, _offsetLeft = 0, _offsetTop = 0;
  var _lastRandomColor = "";
  var _tool = {
    name: "",
    size: 25,
    forceFactor: 2,
    speedFactor: 0,
    color: "",
    randomColor: true,
    shape: "circle",
    globalCompositeOperation: "",
    cursor: false
  };

  function random (n, float) {
    if (float) {
      return Math.random() * n;
    } else {
      return Math.random() * n | 0;
    }
  }

  function __save () {

    _savedDraw.user = _currentUser;
    Dashboard.addDraw(_savedDraw, true);
    _savedDraw = undefined;
    _clear();
    _step = [];
    _currentStep = 0;
    _saveStep();
    hide();
    Utils.setSpinner(false);
    Dashboard.show();

  }

  function onSocketMessage (data) {

    data = JSON.parse(data);
    if (data.ok) {
      _savedDraw.id = data.id;
      __save();
    } else {
      Messages.error("Salvataggio non riuscito");
    }

  }

  function _saveToDashboard () {

    _currentFakeId += 10;
    _savedDraw.id = _currentFakeId.toString();
    __save();

  }

  function _saveToServer () {

    _currentUser = User.getUserInfo();
    if (_currentUser.id) {
      _savedDraw.userId = _currentUser.id;
      Socket.emit("editor save", _savedDraw);
    }

  }

  function save () {

    Utils.setSpinner(true);
    _savedDraw = _saveLayer();
    var _coords = Dashboard.getCoords();
    var _tempCanvas = document.createElement("canvas");
    _tempCanvas.width = _savedDraw.data.width;
    _tempCanvas.height = _savedDraw.data.height;
    _tempCanvas.getContext("2d").putImageData(_savedDraw.data, 0, 0);
    _savedDraw.base64 = _tempCanvas.toDataURL("image/png");
    _savedDraw.w = _savedDraw.maxX - _savedDraw.minX;
    _savedDraw.h = _savedDraw.maxY - _savedDraw.minY;
    _savedDraw.x = _savedDraw.minX - app.WIDTH / 2 + _coords.x + (_config.toolsSide === "left" ? _toolsWidth : 0);
    _savedDraw.y = _coords.y + (app.HEIGHT / 2 - _savedDraw.minY);
    _savedDraw.r = _savedDraw.x + _savedDraw.w;
    _savedDraw.b = _savedDraw.y - _savedDraw.h;
    _savedDraw.data = undefined;
    delete _savedDraw.data;
    delete _savedDraw.oldX;
    delete _savedDraw.oldY;
    delete _savedDraw.maxX;
    delete _savedDraw.maxY;
    delete _savedDraw.minX;
    delete _savedDraw.minY;
    _tempCanvas = undefined;
    if (Socket.isConnected()) {
      _saveToServer();
    } else {
      _saveToDashboard();
    }

  }

  function show () {

    Utils.addGlobalStatus("cloudnote__EDITOR-OPEN");
    Utils.fadeInElements(_container);

  }

  function hide () {

    Utils.removeGlobalStatus("cloudnote__EDITOR-OPEN");
    Utils.fadeOutElements(_container);

  }

  function setTool (tool) {
    // questa viene chiamata dal modulo che creerà la barra laterale dei tools su tool change
    // TODO: devo tener conto anche che potrebbe essere il righello
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
    };

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
      Tools.toggleButton("undo", true);
      Tools.toggleButton("save", true);
    } else {
      Tools.toggleButton("undo", false);
      Tools.toggleButton("save", false);
    }
    Tools.toggleButton("redo", false);

  }

  function undo () {

    var step = _step[_currentStep + 1];
    if (step) {

      var tot = _step.length - _currentStep - 2;
      _currentStep = _currentStep + 1;
      _clear();
      _restoreStep(step);
      if (!tot) {
        Tools.toggleButton("undo", false);
        Tools.toggleButton("save", false);
      } else {
        Tools.toggleButton("save", true);
      }
      Tools.toggleButton("redo", true);

    }

  }

  function redo () {

    if (_currentStep > 0) {
      _currentStep -= 1;
      var step = _step[_currentStep];
      _clear();
      _restoreStep(step);
      Tools.toggleButton("undo", true);
      Tools.toggleButton("save", true);
      if (_currentStep <= 0) {
        Tools.toggleButton("redo", false);
      }
    }

  }

  function changePaper () {

    _canvas.classList.remove("paper-squares", "paper-lines", "paper-white");
    if (_currentPaper === "white") {
      _currentPaper = "squares";
    } else if (_currentPaper === "squares") {
      _currentPaper = "lines";
    } else {
      _currentPaper = "white";
    }
    _canvas.classList.add("paper-" + _currentPaper);

  }

  function clear () {

    if (_minX === -1) {
      return;
    }
    _clear();
    //_draft = {};
    _saveStep();
    Tools.toggleButton("redo", false);
    Tools.toggleButton("save", false);

  }

  function _clear () {

    _context.clearRect(0, 0, app.WIDTH, app.HEIGHT);
    _minX = _minY = _maxX = _maxY = _oldX = _oldY = -1;

  }

  function _restoreStep (step) {

    _context.putImageData(step.data, step.minX, step.minY);
    _minX = step.minX;
    _minY = step.minY;
    _maxX = step.maxX;
    _maxY = step.maxY;
    _oldX = step.oldX;
    _oldY = step.oldY;

  }

  function _checkCoord (x, y) {

    //var offset = _tool.size / 2;
    var offset = _tool.size;
    if (_minX === -1 || _minX > (x - offset)) _minX = x - offset;
    if (_minY === -1 || _minY > (y - offset)) _minY = y - offset;
    if (_maxX === -1 || _maxX < (x + offset)) _maxX = x + offset;
    if (_maxY === -1 || _maxY < (y + offset)) _maxY = y + offset;
    if (_minX < 0) _minX = 0;
    if (_minY < 0) _minY = 0;
    if (_maxX > app.WIDTH) _maxX = app.WIDTH;
    if (_maxY > app.HEIGHT) _maxY = app.HEIGHT;
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
    if (alpha === false || typeof(alpha) === "undefined") {
      return "rgb(" + random(256) + ", " + random(256) + ", " + random(256) + ")";
    } else if (alpha === true) {
      return "rgba(" + random(256) + ", " + random(256) + ", " + random(256) + ", 0.7)";
    } else if (typeof(alpha) === "number") {
      return "rgba(" + random(256) + ", " + random(256) + ", " + random(256) + ", " + alpha + ")";
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
    e.stopPropagation();
    _cursorX = Utils.getEventCoordX(e, _offsetLeft, true);
    _cursorY = Utils.getEventCoordY(e, _offsetTop, true);
    if ((e.touches && e.touches.length > 1) || _touchDown) {
      _oldX = _oldMidX = _cursorX;
      _oldY = _oldMidY = _cursorY;
      return;
    }
    if (Param.supportTouch) {
      _touchEventObject = e.touches[0];
      _updateTouchForce();
    }
    _touchDown = true;
    _checkCoord(_cursorX, _cursorY);
    if (_tool.randomColor === true || (_tool.randomColor === "last" && !_lastRandomColor)) {
      _lastRandomColor = _getRandomColor();
      _tool.color = _lastRandomColor;
    }
    _context.globalAlpha = 1;
    //_context.globalCompositeOperation = "lighter";
    //_context.shadowBlur = 10;
    //_context.shadowColor = _tool.color;
    _context.globalCompositeOperation = _tool.globalCompositeOperation;
    _context.strokeStyle = _tool.color;
    _context.lineWidth = _tool.size;
    _context.lineJoin = "round";
    _context.lineCap = "round";
    if (_tool.cursor) {
      var style = "width: " + _tool.size + "px; height: " + _tool.size + "px; ";
      style += "left: " + (_cursorX - 1 - (_tool.size / 2) + _offsetLeft) + "px; top: " + (_cursorY - 1 - (_tool.size / 2)) + "px; ";
      _toolCursor.style.cssText = style;
      _toolCursor.classList.remove("displayNone");
    }
    if (_tool.shape === "circle") {
      _circle(_cursorX, _cursorY);
    }
    _oldMidX = _cursorX;
    _oldMidY = _cursorY;

  }

  function _onTouchMove (e) {

    e.preventDefault();
    e.stopPropagation();
    if (_touchDown === false || (e.touches && e.touches.length > 1)) {
      _touchDown = false;
      return;
    }
    if (Param.supportTouch) {
      _touchEventObject = e.touches[0];
      if (_frameUpdateForce === false && _touchForce === 0 && _touchEventObject.force > 0) {
        _updateTouchForce();
      }
    } else {
      _touchForce = 0;
    }

    _cursorX = Utils.getEventCoordX(e, _offsetLeft, true);
    _cursorY = Utils.getEventCoordY(e, _offsetTop, true);
    var distance = Utils.distance(_cursorX, _cursorY, _oldX, _oldY);
    var size = _tool.size + round(_tool.size * _tool.forceFactor * _touchForce, 1) + (_tool.speedFactor > 0 ? Math.min(distance, _tool.size * _tool.speedFactor) : 0);

    if (_tool.cursor) {
      var style = "width: " + size + "px; height: " + size + "px; ";
      style += "left: " + (_cursorX - 1 - (size / 2) + _offsetLeft) + "px; top: " + (_cursorY - 1 - (size / 2)) + "px; ";
      _toolCursor.style.cssText = style;
    } else if (_tool.size < 25 && distance < _config.minPxToDraw) {
      return;
    }

    var midX = _oldX + _cursorX >> 1;
    var midY = _oldY + _cursorY >> 1;
    _context.beginPath();
    _context.lineWidth = size;
    _context.moveTo(midX, midY);
    _context.quadraticCurveTo(_oldX, _oldY, _oldMidX, _oldMidY);
    _context.stroke();
    _oldMidX = midX;
    _oldMidY = midY;
    _checkCoord(_cursorX, _cursorY);

  }

  function _onTouchEnd (e) {

    e.stopPropagation();
    if (_touchDown === false || (e.touches && e.touches.length)) return;
    _touchDown = false;
    if (_tool.cursor) {
      _toolCursor.classList.add("displayNone");
    }
    if (Param.supportTouch === false) {
      _cursorX = Utils.getEventCoordX(e, _offsetLeft, true);
      _cursorY = Utils.getEventCoordY(e, _offsetTop, true);
      if (_cursorX !== _oldX) {
        _context.beginPath();
        _context.moveTo(_oldMidX, _oldMidY);
        _context.quadraticCurveTo(_oldX, _oldY, _cursorX, _cursorY);
        _context.stroke();
      }
    }
    _saveStep();

  }

  function _onGestureStart (e) {
    _touchDown = false;
    console.log(e);
  }

  function _onGestureChange (e) {
    _touchDown = false;
    console.log(e);
  }

  function _onGestureEnd (e) {
    console.log(e);
  }

  function _onRotate (e) {

  }

  function _initDom () {

    Main.loadTemplate("editor", {
      marginTop: Param.headerSize
    }, Param.container, function (templateDom) {

      _container = templateDom;
      _canvas = templateDom.querySelector(".cloudnote-editor__canvas");
      _context = _canvas.getContext("2d");
      _toolCursor = templateDom.querySelector(".cloudnote-editor__tool-cursor");
      _canvas.addEventListener(Param.eventStart, _onTouchStart);
      _canvas.addEventListener(Param.eventMove, _onTouchMove);
      _canvas.addEventListener(Param.eventEnd, _onTouchEnd);
      _toolCursor.addEventListener(Param.eventStart, _onTouchStart);
      _toolCursor.addEventListener(Param.eventMove, _onTouchMove);
      _toolCursor.addEventListener(Param.eventEnd, _onTouchEnd);
      if (Param.supportGesture) {
        _canvas.addEventListener("gesturestart", _onGestureStart, true);
        _canvas.addEventListener("gesturechange", _onGestureChange, true);
        _canvas.addEventListener("gestureend", _onGestureEnd, true);
      }

      _initSubModules();
      _canvasWidth = app.WIDTH - _toolsWidth;
      _canvasHeight = app.HEIGHT - _colorsPickerHeight - Param.headerSize;
      _canvas.width = _canvasWidth;
      _canvas.height = _canvasHeight;
      _canvas.style.width = _canvasWidth + "px";
      _canvas.style.height = _canvasHeight + "px";
      _saveStep();
      Main.addRotationHandler(_onRotate);

    });

  }

  function _initSubModules () {

    ColorPicker.init(_config, _container);
    Tools.init(_config, _container);

  }

  function init (params) {

    Param = app.Param;
    Utils = app.Utils;
    Messages = app.Messages;
    Main = app.Main;
    Tools = app.Editor.Tools;
    ColorPicker = app.Editor.ColorPicker;
    Dashboard = app.Dashboard;
    User = app.User;
    Socket = app.Socket;
    _config = Utils.setConfig(params, _config);
    _pixelRatio = Param.pixelRatio;
    _toolsWidth *= _pixelRatio;
    _colorsPickerHeight *= _pixelRatio;
    _offsetLeft = (_config.toolsSide === "left" ? _toolsWidth : 0);
    _offsetTop = Param.headerSize;
    _minX = _minY = _maxX = _maxY = _oldX = _oldY = _oldMidX = _oldMidY = -1;
    _initDom();

  }

  app.module("Editor", {
    init: init,
    show: show,
    hide: hide,
    save: save,
    setTool: setTool,
    undo: undo,
    redo: redo,
    clear: clear,
    changePaper: changePaper,
    onSocketMessage: onSocketMessage
  });

})(cloudnote);
