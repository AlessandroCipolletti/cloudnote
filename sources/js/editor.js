(function (app) {

  var _config = {

  };

  var PI = Math.PI;
  var PI2 = PI * 2;
  var _canvas, _context, _canvasWidth, _canvasHeight;
  var _touchDown = false;
  var _minX, _minY, _maxX, _maxY, _oldX, _oldY, _oldMidX, _oldMidY;
  var _step = [];
  var _tool = {
    size: 1,
    color: "red",
    shape: "circle"
  };

  function setTool(tool) {
    // questa viene chiamata dal modulo che creerà la barra laterale dei tools su tool change
    // devo tener conto anche che potrebbe essere il righello o il picker
  }

  function _checkCoord(x, y) {
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

  function _circle(x, y) {
    _context.beginPath();
    _context.fillStyle = _tool.color;
    _context.arc(x, y, _tool.size / 2, 0, PI2, true);
    _context.fill();
  }

  function _onTouchStart(e) {

    e.preventDefault();
    if ((e.touches && e.touches.length > 1) || _touchDown) return;
    _touchDown = true;
    var x = e.type.indexOf("mouse") >= 0 ? e.clientX : e.touches[0].clientX;
    var y = e.type.indexOf("mouse") >= 0 ? e.clientY : e.touches[0].clientY;
    _checkCoord(x, y);
    if (_tool.shape === "circle") {
      _circle(x, y);
    }

    _context.lineWidth = _tool.size;
    _context.strokeStyle = _tool.color;
    _context.lineJoin = "round";
    _context.lineCap = "round";
    _oldMidX = x;
    _oldMidY = y;

  }

  function _onTouchMove(e) {

    console.log(e.type);
    e.preventDefault();
    if (_touchDown === false) return;
    var x = e.type.indexOf("mouse") >= 0 ? e.clientX : e.touches[0].clientX;
    var y = e.type.indexOf("mouse") >= 0 ? e.clientY : e.touches[0].clientY;
    var midX = _oldX + x >> 1;
    var midY = _oldY + y >> 1;
    _context.beginPath();
    _context.moveTo(midX, midY);
    _context.quadraticCurveTo(_oldX, _oldY, _oldMidX, _oldMidY);
    _context.stroke();
    _oldX = x;
    _oldY = y;
    _oldMidX = midX;
    _oldMidY = midY;
    _checkCoord(x, y);

  }

  function _onTouchEnd(e) {

    if (e.touches && e.touches.length) return;
    _touchDown = false;

  }

  function _onGestureStart(e) {
    console.log(e);
  }

  function _onGestureChange(e) {
    console.log(e);
  }

  function _onGestureEnd(e) {
    console.log(e);
  }

  function _onRotate(e) {

    var canvasStyle = app.window.getComputedStyle(_canvas);
    _canvasWidth = parseInt(canvasStyle.width);
    _canvasHeight = parseInt(canvasStyle.height);
    _canvas.width = _canvasWidth;
    _canvas.height = _canvasHeight;
    canvasStyle = undefined;

  }

  function _initDom() {

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

  function _setConfig(params) {

    var key;
    for (key in params) {
      if (typeof (_config[key]) !== "undefined") {
        _config[key] = params[key];
      }
    }

  }

  function init(params) {

    _setConfig(params);
    _initDom();
    _minX = _minY = _maxX = _maxY = _oldX = _oldY = _oldMidX = _oldMidY = -1;

  }

  app.Editor = {
    init: init,
    setTool: setTool
  };

})(cloudnote);
