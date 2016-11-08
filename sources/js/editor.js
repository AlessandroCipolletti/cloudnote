/*
  Documentations:
    Bazier curve:
      http://en.wikipedia.org/wiki/B%C3%A9zier_curve
    Display Flex:
      https://css-tricks.com/snippets/css/a-guide-to-flexbox/

*/

(function (app) {

  // Dependencies
  var MATH = Math;
  var Param = {};
  var Utils = {};
  var Messages = {};
  var Main = {};
  var Tools = {};
  var ColorPicker = {};
  var Rule = {};
  var Dashboard = {};
  var User = {};
  var Socket = {};

  // TODO max force tool
  // TODO particlesRect centrato
  // TODO bug prima pressione rilevata è più alta del normale
  // TODO bug min width e max width immagine dopo bucket

  var _config = {
    colors: [
      "#000001", "#2f2f2f", "#4d4d4d", "#808080", "#a2a2a2", "#c6c6c6", "#ffffff", "#b8f9ff", "#00f6ff", "#007eff",
      "#0022ef", "#000688", "#6d0088", "#ddb8ff", "#b8ccff", "#ffb8e5", "#88004a", "#663300", "#883600", "#a00000",
      "#ec0000", "#ff6600", "#005f00", "#00d500", "#ffe400", "#00ff5a", "#b8ffbf", "#f6ffb8", "#ffe7b8", "#ffd4b8",
      "#ffb8b8", "#FF6666", "#3d5232", "#5e4b38", "#5e3838", "#5e385e", "#40385e", "#38475e", "#385e5e", "#294638"
    ],
    tools: ["marker", "pencil", "eraser", "bucket", "rule", "undo", "redo", "paper", "save", "clear"],  // "exit", "pen", "crayon", "coworkingStart", "coworkingStop"
    toolsWidth: 45,
    colorsPickerHeight: 55,
    ruleMinOffset: 50,
    ruleWidth: 4,
    ruleHeight: 120,
    ruleRotationStep: 3,
    ruleMarginToDraw: 25,
    toolsSide: "left",
    minPxToDraw: 3,
    hightPerformance: true
  };

  var PI = MATH.PI;
  var PI2 = PI * 2;
  var _container, _canvas, _context, _toolCursor, _canvasCoworking, _contextCoworking;
  var _coworking = false, _coworkingSteps = [], _personalRoomId = false, _popupCoworking = {}, _coworkingIdText = {}, _coworkingIdLabel = {};
  var _touchDown = false, _isNearRule = false;
  var _minX, _minY, _maxX, _maxY, _oldX, _oldY, _oldMidX, _oldMidY, _cursorX, _cursorY;
  var _savedDraw = {}, _currentUser = {}, _currentFakeId = 0;
  var _touchForce = 0, _oldTouchForce = 0, _currentTouchSupportForce = false;
  var _step = [], _stepCacheLength = 21, _currentStep = 0;
  var _pixelRatio = 1, _offsetLeft = 0, _offsetTop = 0, _canvasWidth = 0, _canvasHeight = 0;
  var _lastRandomColor = "";
  var _tool = {
    name: "",
    size: 25,
    maxForce: 1,
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
      return MATH.random() * n;
    } else {
      return MATH.random() * n | 0;
    }
  }

  function round (n, d) {
    var m = d ? MATH.pow(10, d) : 1;
    return MATH.round(n * m) / m;
  }

  function _setCoworkingId (id) {

    if (id) {
      _personalRoomId = id;
      _coworkingIdLabel.innerHTML = id;
    }

  }

  function _requestCoworking (e) {

    if (e.keyCode === 13) {
      if (_coworkingIdText.value.length === 0) {
        return;
      }
      var roomId = _coworkingIdText.value.toUpperCase();
      if (roomId.length > 3) {
        Socket.emit("editor coworking request", {
          roomId: roomId
        });
        _coworkingIdText.blur();
        Utils.setSpinner(true);
      } else {
        Messages.error("Codice non valido");
      }
    }

  }

  function _onCoworkingClose () {

    _coworking = false;
    Messages.error("L'altro utente si è disconnesso");
    Utils.removeGlobalStatus("drawith__EDITOR-COWORKING");
    Tools.toggleButton("clear", true);
    if (_currentStep > 0) {
      Tools.toggleButton("redo", true);
    }
    if (_step.length > 1) {
      Tools.toggleButton("undo", true);
    }

  }

  function _onCoworkingError (data) {

    if (data.error === "wrong code") {
      Messages.error("Codice errato");
    } else if (data.error === "already connected") {
      Messages.error("Utente già connesso");
    }
    Utils.setSpinner(false);

  }

  function _onCoworkingStarted () {

    Utils.closePopup();
    Utils.setSpinner(false);
    _coworkingIdText.value = "";
    _coworkingIdText.blur();
    Messages.success("Connessione stabilita");
    Utils.addGlobalStatus("drawith__EDITOR-COWORKING");
    Tools.toggleButton("undo", false);
    Tools.toggleButton("redo", false);
    Tools.toggleButton("clear", false);
    _coworking = true;

  }

  function startCoworking () {

    if (_personalRoomId && Socket.isConnected()) {
      Utils.openPopup(_popupCoworking);
      _coworkingIdText.focus();
    } else {
      Messages.error("Network error");
    }

  }

  function stopCoworking () {

    _coworking = false;
    Utils.removeGlobalStatus("drawith__EDITOR-COWORKING");
    Socket.emit("editor coworking stop", false);
    Messages.success("Connessione chiusa");
    Tools.toggleButton("clear", true);
    if (_currentStep > 0) {
      Tools.toggleButton("redo", true);
    }
    if (_step.length > 1) {
      Tools.toggleButton("undo", true);
    }

  }

  function onSocketMessage (data) {

    //console.log("editor riceve: " + data);
    data = JSON.parse(data);
    if (data.type === "steps") {
      if (_coworking) {
        _coworkingDrawSteps(data);
      }
    } else if (data.type === "save") {
      if (data.ok) {
        _savedDraw.id = data.id;
        __save();
      } else if (data.ok === false) {
        Messages.error("Salvataggio non riuscito");
      }
    } else if (data.type === "roomId") {
      _setCoworkingId(data.id);
    } else if (data.type === "coworking started") {
      _onCoworkingStarted();
    } else if (data.type === "coworking close") {
      _onCoworkingClose();
    } else if (data.type === "coworking error") {
      _onCoworkingError(data);
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
    Messages.success("Salvataggio riuscito");

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
      console.log("save to server");
      Socket.emit("editor save", _savedDraw);
    }

  }

  function save () {

    _saveToLocal();

    // Utils.setSpinner(true);
    // _savedDraw = _saveLayer();
    // var _coords = Dashboard.getCoords();
    // var _tempCanvas = document.createElement("canvas");
    // _tempCanvas.width = _savedDraw.data.width;
    // _tempCanvas.height = _savedDraw.data.height;
    // _tempCanvas.getContext("2d").putImageData(_savedDraw.data, 0, 0);
    // _savedDraw.base64 = _tempCanvas.toDataURL("image/png");
    // _savedDraw.w = _savedDraw.maxX - _savedDraw.minX;
    // _savedDraw.h = _savedDraw.maxY - _savedDraw.minY;
    // _savedDraw.x = _savedDraw.minX - app.WIDTH / 2 + _coords.x + (_config.toolsSide === "left" ? _config.toolsWidth : 0);
    // _savedDraw.y = _coords.y + (app.HEIGHT / 2 - _savedDraw.minY);
    // _savedDraw.r = _savedDraw.x + _savedDraw.w;
    // _savedDraw.b = _savedDraw.y - _savedDraw.h;
    // _savedDraw.data = undefined;
    // delete _savedDraw.data;
    // delete _savedDraw.oldX;
    // delete _savedDraw.oldY;
    // delete _savedDraw.maxX;
    // delete _savedDraw.maxY;
    // delete _savedDraw.minX;
    // delete _savedDraw.minY;
    // _tempCanvas = undefined;
    // if (Socket.isConnected()) {
    //   _saveToServer();
    // } else {
    //   _saveToDashboard();
    // }

  }

  function _saveToLocal () {

    Messages.error("TODO");
    Utils.setSpinner(false);

  }

  function show () {

    Utils.addGlobalStatus("drawith__EDITOR-OPEN");
    Utils.fadeInElements(_container);

  }

  function hide () {

    Utils.removeGlobalStatus("drawith__EDITOR-OPEN");
    Utils.fadeOutElements(_container);

  }

  function setTool (tool) {

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

    if (_coworking === false) {
      if (_step.length > 1) {
        Tools.toggleButton("undo", true);
        Tools.toggleButton("save", true);
      } else {
        Tools.toggleButton("undo", false);
        Tools.toggleButton("save", false);
      }
      Tools.toggleButton("redo", false);
    }


  }

  function undo () {

    var step = _step[_currentStep + 1];
    if (step) {

      var tot = _step.length - _currentStep - 2;
      _currentStep = _currentStep + 1;
      _clear();
      _restoreStep(step);
      if (tot === 0) {
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

  function changePaper (paper) {

    _canvas.classList.remove("paper-squares", "paper-lines", "paper-white");
    _canvas.classList.add("paper-" + paper);

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
    if (_maxX > _canvasWidth) _maxX = _canvasWidth;
    if (_maxY > _canvasHeight) _maxY = _canvasHeight;
    _oldX = x;
    _oldY = y;

  }

  var _bucket = (function () {

    var tolerance = 8;
    var pixelCompare = function (i,targetcolor,fillcolor,data,length,tolerance) {
    	if (i<0||i>=length) return false; //out of bounds
      if (i === 0) {
        _minX = _minY = 0;
      }
      if (i === length - 4) {
        _maxX = _canvasWidth;
        _maxY = _canvasHeight;
      }
    	if (data[i+3]===0 && fillcolor.a>0) return (targetcolor[3] === 0);  //surface is invisible and fill is visible

    	if (
    		MATH.abs(targetcolor[3] - fillcolor.a)<=tolerance &&
    		MATH.abs(targetcolor[0] - fillcolor.r)<=tolerance &&
    		MATH.abs(targetcolor[1] - fillcolor.g)<=tolerance &&
    		MATH.abs(targetcolor[2] - fillcolor.b)<=tolerance
    	) return false; //target is same as fill

    	if (
    		(targetcolor[3] === data[i+3]) &&
    		(targetcolor[0] === data[i]  ) &&
    		(targetcolor[1] === data[i+1]) &&
    		(targetcolor[2] === data[i+2])
    	) return true; //target matches surface

    	if (
    		MATH.abs(targetcolor[3] - data[i+3])<=(255-tolerance) &&
    		MATH.abs(targetcolor[0] - data[i]  )<=tolerance &&
    		MATH.abs(targetcolor[1] - data[i+1])<=tolerance &&
    		MATH.abs(targetcolor[2] - data[i+2])<=tolerance
    	) return true; //target to surface within tolerance

    	return false; //no match
    };

    var pixelCompareAndSet = function (i,targetcolor,fillcolor,data,length,tolerance) {
    	if(pixelCompare(i,targetcolor,fillcolor,data,length,tolerance)) {
    		//fill the color
    		data[i]   = fillcolor.r;
    		data[i+1] = fillcolor.g;
    		data[i+2] = fillcolor.b;
    		data[i+3] = fillcolor.a;
    		return true;
    	}
    	return false;
    };

    return function (context, x, y, fillcolor) {

      if (fillcolor[0] === "#") {
        fillcolor = Utils.hexToRgb(fillcolor.substring(1));
      } else {
        fillcolor = Utils.rgbStringToRgb(fillcolor);
      }
      fillcolor.a = 255;

      var image = context.getImageData(0, 0, _canvasWidth, _canvasHeight);
      var data = image.data;
      var length = data.length;
    	var Q = [];
    	var i = (MATH.floor(x) + MATH.floor(y) * _canvasWidth) * 4;
    	var e = i, w = i, me, mw, w2 = _canvasWidth * 4;
    	var targetcolor = [data[i],data[i+1],data[i+2],data[i+3]];

    	if(!pixelCompare(i,targetcolor,fillcolor,data,length,tolerance)) { return false; }
    	Q.push(i);
    	while(Q.length) {
    		i = Q.pop();
    		if(pixelCompareAndSet(i,targetcolor,fillcolor,data,length,tolerance)) {
    			e = i;
    			w = i;
    			mw = parseInt(i/w2)*w2; //left bound
    			me = mw+w2;             //right bound
    			while(mw<w && mw<(w-=4) && pixelCompareAndSet(w,targetcolor,fillcolor,data,length,tolerance)); //go left until edge hit
    			while(me>e && me>(e+=4) && pixelCompareAndSet(e,targetcolor,fillcolor,data,length,tolerance)); //go right until edge hit
    			for(var j=w;j<e;j+=4) {
    				if(j-w2>=0     && pixelCompare(j-w2,targetcolor,fillcolor,data,length,tolerance)) Q.push(j-w2); //queue y-1
    				if(j+w2<length && pixelCompare(j+w2,targetcolor,fillcolor,data,length,tolerance)) Q.push(j+w2); //queue y+1
    			}
    		}
    	}

      context.putImageData(image, 0, 0);

    };

  })();

  function _circle (context, x, y, color, size) {

    context.beginPath();
    context.fillStyle = color;
    context.globalAlpha = 1;
    context.lineJoin = "round";
    context.lineCap = "round";
    //context.shadowBlur = 0;
    context.arc(x, y, size / 2, 0, PI2, true);
    context.fill();

  }

  function _particlesCircle (context, x, y, alpha, color, size) {

    context.globalAlpha = alpha;
    context.fillStyle = color;
    var angle = 0, radius = 0, w = 0;
    for (var i = size * size; i--; ) {
      angle = random(PI2, true);
      radius = random(size) + 1;
      w = random(2) + 1;
      context.fillRect(
        x + radius * MATH.cos(angle),
        y + radius * MATH.sin(angle),
        w,
        (w === 2 ? 1 : random(2) + 1)
      );
    }

  }

  function _particlesRect (context, x, y, alpha, color, size) {

    context.globalAlpha = alpha * 0.75;
    context.fillStyle = color;
    for (var i = size * (size + 1); i--; ) {
      context.fillRect(
        x + random(size + 1) - 1,
        y + random(size + 1) - 1,
        1,
        1
      );
    }

  }

  function _image (context, x, y) {

  }

  function _curvedCircleLine (context, size, color, fromX, fromY, midX, midY, toX, toY) {

    context.beginPath();
    context.lineWidth = size;
    context.strokeStyle = color;
    //context.shadowBlur = 10;
    context.moveTo(fromX, fromY);
    context.quadraticCurveTo(midX, midY, toX, toY);
    context.stroke();

  }

  var quadraticBezierLength = (function () {

    var a, b, A, B, C, Sabc, A_2, A_32, C_2, BA, M;

    return function (p0, p1, p2) {

      M = MATH;
      a = {
        x: p0.x - 2 * p1.x + p2.x,
        y: p0.y - 2 * p1.y + p2.y
      };
      b = {
        x: 2 * p1.x - 2 * p0.x,
        y: 2 * p1.y - 2 * p0.y
      };
      A = 4 * (a.x * a.x + a.y * a.y);
      B = 4 * (a.x * b.x + a.y * b.y);
      C = b.x * b.x + b.y * b.y;
      Sabc = 2 * M.sqrt(A+B+C);
      A_2 = M.sqrt(A);
      A_32 = 2 * A * A_2;
      C_2 = 2 * M.sqrt(C);
      BA = B / A_2;
      // if (BA === -C_2 && a.x !=0 && a.y != 0 && b.x != 0 && b.y != 0) {
      //   BA += 1;
      // }
      return (A_32 * Sabc + A_2 * B * (Sabc - C_2) + (4 * C * A - B * B) * M.log((2 * A_2 + BA + Sabc) / (BA + C_2))) / (4 * A_32);

    };

  })();

  function _getQuadraticBezierValue (t, p1, p2, p3) {
    return (1 - t) * (1 - t) * p1 + 2 * (1 - t) * t * p2 + t * t * p3;
  }

  function _curvedParticlesLine (context, delta, touchForce, oldTouchForce, color, size, fromX, fromY, midX, midY, toX, toY, circleShape) {

    var baseForce = MATH.min(oldTouchForce,  0.3);
    var deltaForce = MATH.min(touchForce, 0.3) - baseForce;
    var particles = (circleShape ? _particlesCircle : _particlesRect);
    delta = 1 / delta;
    for (var i = 0; i <= 1; i = i + delta) {
      particles(
        context,
        _getQuadraticBezierValue(i, fromX, midX, toX),
        _getQuadraticBezierValue(i, fromY, midY, toY),
        baseForce + deltaForce * i,
        color,
        size
      );
    }

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

  var _initTouchForce = function (touches) {

    var force = touches[0].force || 0;
    _currentTouchSupportForce = !!force;
    _touchForce = _oldTouchForce = MATH.max(round(force, 3), 0.01);

  };

  var _updateTouchForce = function (touches) {

    var force = touches[0].force || 0;
    _oldTouchForce = _touchForce;
    if (force > 0) {
      _touchForce = MATH.max(round(force, 3), 0.01);
    } else {
      _touchForce = (_currentTouchSupportForce ? 0 : 0.25);
    }

  };

  function _coworkingDrawImage (data) {
    // TODO in certi casi posso trasmettere il disegno intero (data base64) ed aggiungerlo intero all'editor
  }

  function _coworkingDrawSteps (data) {

    var steps = data.steps;
    _contextCoworking.clearRect(0, 0, _canvasCoworking.width, _canvasCoworking.height);
    if (data.tool.globalCompositeOperation === "destination-out") {
      _contextCoworking.globalCompositeOperation = "source-over";
      _contextCoworking.globalAlpha = 1;
      _contextCoworking.drawImage(_canvas, 0, 0, _canvas.width, _canvas.height);
    }
    for (var i = 0, l = steps.length; i < l; i++) {
      if (steps[i].type === "move") {
        _stepMove(_contextCoworking, steps[i], data.tool);
      } else if (steps[i].type === "start") {
        _stepStart(_contextCoworking, steps[i], data.tool);
      } else {
        _stepEnd(_contextCoworking, steps[i], data.tool);
      }
    }
    _saveStep();
    _context.globalCompositeOperation = "source-over";
    _context.globalAlpha = 1;
    if (data.tool.globalCompositeOperation === "destination-out") {
      _context.clearRect(0, 0, _canvas.width, _canvas.height);
    }
    _context.drawImage(_canvasCoworking, 0, 0, _canvasCoworking.width, _canvasCoworking.height);
    data = steps = undefined;

  }

  function _coworkingSendSteps () {

    Socket.emit("editor steps", JSON.stringify({
      steps: _coworkingSteps,
      tool: _tool,
      type: "steps"
    }));
    _coworkingSteps = [];

  }

  function _stepStart (context, params, tool) {

    var x = params.x, y = params.y;
    context.globalCompositeOperation = tool.globalCompositeOperation;
    context.lineWidth = tool.size;
    if (tool.name === "bucket") {
      _bucket(context, x, y, tool.color);
    } else if (tool.shape === "circle") {
      //context.shadowColor = _tool.color;
      _circle(context, x, y, tool.color, params.size);
    } else if (tool.shape === "particlesRect") {
      //context.shadowColor = "#000000";
      _particlesRect(context, x, y, params.force, tool.color, tool.size);
    } else if (tool.shape === "particlesCircle") {
      _particlesRect(context, x, y, params.force, tool.color, tool.size);
    }
    if (tool.name === "eraser") {
      _oldX = x;
      _oldY = y;
    } else if (tool.name !== "bucket") {
      _checkCoord(x, y);
    }
    x = y = undefined;

  }

  function _stepMove (context, params, tool) {

    if (tool.shape === "circle") {
      _curvedCircleLine(context, params.size, tool.color, params.oldMidX, params.oldMidY, params.oldX, params.oldY, params.midX, params.midY);
    } else if (tool.shape === "particlesCircle" || tool.shape === "particlesRect") {
      _curvedParticlesLine(context, params.delta, params.touchForce, params.oldTouchForce, tool.color, tool.size, params.oldMidX, params.oldMidY, params.oldX, params.oldY, params.midX, params.midY, (tool.shape === "particlesCircle"));
    }
    if (tool.name === "eraser") {
      _oldX = params.x;
      _oldY = params.y;
    } else if (tool.name !== "bucket") {
      _checkCoord(params.x, params.y);
    }

  }

  function _stepEnd (context, params, tool) {
    //_curvedCircleLine(context, params.size, tool.color, params.oldMidX, params.oldMidY, params.oldX, params.oldY, params.x, params.x);
    //_checkCoord(params.x, params.y);
  }

  function makeTouchStartNearRule (touches, x, y) {

    if (_touchDown === false) {
      _cursorX = x - _offsetLeft;
      _cursorY = y - _offsetTop;
      _isNearRule = true;
      _initTouchForce(touches);
      __touchStart();
    }

  }

  function __touchStart () {

    _touchDown = true;
    if (_tool.randomColor === true || (_tool.randomColor === "last" && !_lastRandomColor)) {
      _tool.color = _lastRandomColor = _getRandomColor();
    }
    if (_tool.color === "") {
      _tool.color = _lastRandomColor;
    }
    if (_tool.cursor) {
      var style = "width: " + _tool.size + "px; height: " + _tool.size + "px; ";
      style += "left: " + (_cursorX - 1 - (_tool.size / 2) + _offsetLeft) + "px; top: " + (_cursorY - 1 - (_tool.size / 2)) + "px; ";
      _toolCursor.style.cssText = style;
      _toolCursor.classList.remove("displayNone");
    }
    var params = {
      type: "start",
      x: _cursorX,
      y: _cursorY,
      force: _touchForce,
      size: _tool.size + round(_tool.size * _tool.forceFactor * _touchForce, 1)
    };
    _stepStart(_context, params, _tool);
    if (_coworking) {
      _coworkingSteps.push(params);
    }
    _oldMidX = _cursorX;
    _oldMidY = _cursorY;

  }

  function _onTouchStart (e) {

    e.preventDefault();
    e.stopPropagation();
    var touches = Utils.filterTouchesByTarget(e, [_canvas, _toolCursor]);
    _cursorX = Utils.getEventCoordX(touches, _offsetLeft, true);
    _cursorY = Utils.getEventCoordY(touches, _offsetTop, true);
    if ((touches.length > 1) || _touchDown) {
      _oldX = _oldMidX = _cursorX;
      _oldY = _oldMidY = _cursorY;
      _toolCursor.classList.add("displayNone");
      return;
    }
    _isNearRule = Rule.checkCoordNearRule(_cursorX + _offsetLeft, _cursorY + _offsetTop);
    if (_isNearRule) {
      Rule.lock();
      [_cursorX, _cursorY] = Rule.getCoordsNearRule(_cursorX, _cursorY, _offsetLeft, _offsetTop);
    }
    _initTouchForce(touches);
    __touchStart();

  }

  function makeTouchMoveNearRule (touches, x, y) {

    if (_touchDown) {
      _cursorX = x - _offsetLeft;
      _cursorY = y - _offsetTop;
      _updateTouchForce(touches);
      __touchMove();
    }

  }

  var __touchMove = (function () {

    var distance = 0, curveLength = 0, size = 0, style = "", midX = 0, midY = 0, delta = 0, params = {};

    return function () {

      distance = Utils.distance(_cursorX, _cursorY, _oldX, _oldY);
      size = _tool.size + round(_tool.size * _tool.forceFactor * _touchForce, 1) + (_tool.speedFactor > 0 ? MATH.min(distance, _tool.size * _tool.speedFactor) : 0);
      if (size < 25 && distance < _config.minPxToDraw) {
        return;
      }
      if (_tool.cursor) {
        style = "width: " + size + "px; height: " + size + "px; ";
        style += "left: " + (_cursorX - 1 - (size / 2) + _offsetLeft) + "px; top: " + (_cursorY - 1 - (size / 2)) + "px; ";
        _toolCursor.style.cssText = style;
      }
      midX = _oldX + _cursorX >> 1;
      midY = _oldY + _cursorY >> 1;
      distance = Utils.distance(_oldMidX, _oldMidY, midX, midY);
      curveLength = quadraticBezierLength({x: _oldMidX, y: _oldMidY}, {x: _oldX, y: _oldY}, {x: midX, y: midY});
      params = {
        type: "move",
        x: _cursorX,
        y: _cursorY,
        size: size,
        delta: round((curveLength || distance) / (size - 1), 2),
        oldMidX: _oldMidX,
        oldMidY: _oldMidY,
        oldX: _oldX,
        oldY: _oldY,
        midX: midX,
        midY: midY,
        touchForce: _touchForce,
        oldTouchForce: _oldTouchForce
      };
      _stepMove(_context, params, _tool);
      if (_coworking) {
        _coworkingSteps.push(params);
      }
      _oldMidX = midX;
      _oldMidY = midY;
      _oldTouchForce = _touchForce;
      delta = midX = midY = undefined;

    };

  })();

  function _onTouchMove (e) {

    e.preventDefault();
    e.stopPropagation();
    var touches = Utils.filterTouchesByTarget(e, [_canvas, _toolCursor]);
    if (_touchDown === false || touches.length > 1) {
      _touchDown = false;
      return;
    }
    _cursorX = Utils.getEventCoordX(touches, _offsetLeft, true);
    _cursorY = Utils.getEventCoordY(touches, _offsetTop, true);
    if (_isNearRule) {
      [_cursorX, _cursorY] = Rule.getCoordsNearRule(_cursorX, _cursorY, _offsetLeft, _offsetTop);
    }
    _updateTouchForce(touches);
    __touchMove();

  }

  function makeTouchEndNearRule (x, y) {
    __touchEnd();
  }

  function __touchEnd (touches) {

    _touchDown = _isNearRule = false;
    _toolCursor.classList.add("displayNone");
    if (Param.supportTouch === false) {
      _cursorX = Utils.getEventCoordX(touches, _offsetLeft, true);
      _cursorY = Utils.getEventCoordY(touches, _offsetTop, true);
      if (_cursorX !== _oldX && _cursorY !== _oldY) {
        var params = {
          type: "end",
          x: _cursorX,
          y: _cursorY,
          size: _tool.size,
          oldMidX: _oldMidX,
          oldMidY: _oldMidY,
          oldX: _oldX,
          oldY: _oldY
        };
        _stepEnd(_context, params, _tool);
        if (_coworking) {
          _coworkingSteps.push(params);
        }
      }
    }
    if (_coworking) {
      _coworkingSendSteps();
    }
    _saveStep();

  }

  function _onTouchEnd (e) {

    e.stopPropagation();
    var touches = Utils.filterTouchesByTarget(e, [_canvas, _toolCursor]);
    if (_touchDown === false || (e.touches && touches.length > 0)) return;
    if (_isNearRule) {
      Rule.unlock();
    }
    __touchEnd(touches);

  }

  function _onGestureStart (e) {

    e.preventDefault();
    e.stopPropagation();
    _onTouchEnd(e);
    // console.log(e);

  }

  function _onGestureChange (e) {

    e.preventDefault();
    e.stopPropagation();
    // if (_touchDown) {
    //   _onTouchEnd(e);
    // }
    // console.log(e);

  }

  function _onGestureEnd (e) {

    e.preventDefault();
    e.stopPropagation();
    // console.log(e);

  }

  function _onRotate (e) {

  }

  function _initDom () {

    Main.loadTemplate("editor", {
      marginTop: Param.headerSize,
      personalCodeLabel: "Codice personale:",
      personalRoomId: _personalRoomId,
      coworkingCodeLabel: "Comunica questo codice a qualcuno,",
      coworkingStartLabel: "o inserisci il codice di un tuo amico:"
    }, Param.container, function (templateDom) {

      _container = templateDom;
      _canvas = templateDom.querySelector(".drawith-editor__canvas");
      _context = _canvas.getContext("2d");
      _canvasCoworking = document.createElement("canvas");
      _contextCoworking = _canvasCoworking.getContext("2d");
      _toolCursor = templateDom.querySelector(".drawith-editor__tool-cursor");
      _popupCoworking = templateDom.querySelector(".drawith-editor__coworking-popup");
      _coworkingIdText = templateDom.querySelector(".drawith-editor__coworking-popup input");
      _coworkingIdLabel = templateDom.querySelector(".drawith-editor__coworking-popup h1");
      _coworkingIdText.addEventListener("input", function (e) {
        this.value = this.value.replace(/[^a-z0-9]/gi, "");
      });
      _coworkingIdText.addEventListener("keydown", _requestCoworking);
      _popupCoworking.parentNode.removeChild(_popupCoworking);
      _canvas.addEventListener(Param.eventStart, _onTouchStart, false);
      _canvas.addEventListener(Param.eventMove, _onTouchMove, false);
      _canvas.addEventListener(Param.eventEnd, _onTouchEnd, false);
      _toolCursor.addEventListener(Param.eventStart, _onTouchStart);
      _toolCursor.addEventListener(Param.eventMove, _onTouchMove);
      _toolCursor.addEventListener(Param.eventEnd, _onTouchEnd);
      if (false && Param.supportGesture) {
        _canvas.addEventListener("gesturestart", _onGestureStart, true);
        _canvas.addEventListener("gesturechange", _onGestureChange, true);
        _canvas.addEventListener("gestureend", _onGestureEnd, true);
      }

      _initSubModules();

      _canvasWidth = app.WIDTH - _config.toolsWidth;
      _canvasHeight = app.HEIGHT - _config.colorsPickerHeight - Param.headerSize;

      if (Param.ios && Param.isAppOnline) {
        _canvasWidth = _canvasHeight = MATH.max(_canvasWidth, _canvasHeight) + Param.headerSize + 20 * Param.pixelRatio;
      }

      _canvas.width = _canvasCoworking.width = _canvasWidth;
      _canvas.height = _canvasCoworking.height = _canvasHeight;
      _canvas.style.width = _canvasWidth + "px";
      _canvas.style.height = _canvasHeight + "px";
      if (_config.toolsSide === "left") {
        _canvas.style.left = _config.toolsWidth + "px";
      } else {
        _canvas.style.right = _config.toolsWidth + "px";
      }
      _saveStep();
      Main.addRotationHandler(_onRotate);

      show();

    });

  }

  function _initSubModules () {

    ColorPicker.init(_config, _container);
    Tools.init(_config, _container);
    Rule.init(_config, _container);

  }

  function init (params) {

    Param = app.Param;
    Utils = app.Utils;
    Messages = app.Messages;
    Main = app.Main;
    Tools = app.Editor.Tools;
    ColorPicker = app.Editor.ColorPicker;
    Rule = app.Editor.Rule;
    Rule = app.Editor.Rule;
    Dashboard = app.Dashboard;
    User = app.User;
    Socket = app.Socket;
    _config = Utils.setConfig(params, _config);
    _pixelRatio = Param.pixelRatio;
    _config.toolsWidth *= _pixelRatio;
    _config.colorsPickerHeight *= _pixelRatio;
    _offsetLeft = (_config.toolsSide === "left" ? _config.toolsWidth : 0);
    _offsetTop = Param.headerSize;
    _minX = _minY = _maxX = _maxY = _oldX = _oldY = _oldMidX = _oldMidY = -1;
    _initDom();

    if (Param.supportTouch === false) {
      _touchForce = _oldTouchForce = 0.25;
      _initTouchForce = _updateTouchForce = Utils.emptyFN;
    }

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
    makeTouchStartNearRule: makeTouchStartNearRule,
    makeTouchMoveNearRule: makeTouchMoveNearRule,
    makeTouchEndNearRule: makeTouchEndNearRule,
    onSocketMessage: onSocketMessage,
    startCoworking: startCoworking,
    stopCoworking: stopCoworking
  });

})(drawith);
