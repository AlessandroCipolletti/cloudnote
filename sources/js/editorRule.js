(function (app) {

  // Dependencies
  var Param = {};
  var Utils = {};
  var Main = {};
  var Editor = {};
  var MATH = Math;

  var _config = {
    toolsSide: "left",
    toolsWidth: 45,
    colorsPickerHeight: 45,
    ruleMinOffset: 50,
    ruleWidth: 4,     // rule.width = _config.ruleWidth * MATH.max(app.WIDTH, app.HEIGHT)
    ruleHeight: 120,  // rule.height = _config.ruleHeight * Param.pixelRatio
    ruleRotationStep: 3,
    ruleMarginToDraw: 25
  };

  // TODO pulsanti al centro per 1) bloccare il centro, 2) ruotare di 90 gradi esatti, 3) ruotare in modo speculare
  // TODO bul linea che sembra storta quando vai piano

  function round (n, d) {
    var m = d ? MATH.pow(10, d) : 1;
    return MATH.round(n * m) / m;
  }

  var _rule = {}, _ruleOrigin = {}, _ruleCenter = {}, _ruleStart = {}, _ruleBottom = {}, _ruleLevel = {}, _ruleLevelValue = {}, _ruleGestureOne = {}, _ruleGestureTwo = {};
  var _isVisible = false, _dragStartX = -1, _dragStartY = -1, _dragCurrentX = 0, _dragCurrentY = 0, _dragLastX = 0, _dragLastY = 0, _currentRotation = 0;
  var _startOriginX = 0, _startOriginY = 0, _startAngle = 0, _currentCoefficientM = 0, _sideRuleOriginX = 0, _sideRuleOriginY = 0;
  var _gestureOriginX = 0, _gestureOriginY = 0, _offsetLeft = 0, _offsetRight = 0, _ruleTransformOrigin = "", _touchDown = false, _draggable = true, _isNearSide = false;
  var _ruleLevelTouchStartTime = 0, _startCenterX = 0, _startCenterY = 0, _currentCenterX = 0, _currentCenterY = 0, _dragMode = "drag", _dragged = false;

  function _rotationToLabel (deg) {
    return MATH.trunc(Utils.degToFirstQuadrant(deg));
  }

  var _roundAngleForSteps = (function () {

    var delta = 0;

    return function (deg) {

      delta = deg % 45;
      if (MATH.abs(MATH.trunc(delta)) < _config.ruleRotationStep) {
        return deg - delta;
      }
      if(MATH.abs(MATH.trunc(delta)) > 45 - _config.ruleRotationStep) {
        if (delta > 0) {
          return MATH.round(deg + 45 - delta);
        } else {
          return MATH.round(deg - 45 - delta);
        }
      }
      return deg;

    };

  })();

  function show () {
    Utils.fadeInElements(_rule);
    _isVisible = true;
  }

  function hide () {
    Utils.fadeOutElements(_rule);
    _isVisible = false;
  }

  function lock () {
    _draggable = false;
  }

  function unlock () {
    _draggable = true;
  }

  function checkCoordNearRule (x, y, inside) {

    var centerCoord = _ruleCenter.getBoundingClientRect();
    var startCoord = _ruleStart.getBoundingClientRect();
    _currentCoefficientM = round(Utils.coefficientM(startCoord.left, startCoord.top, centerCoord.left, centerCoord.top), 4);
    var ruleOriginCoord = _ruleOrigin.getBoundingClientRect();
    var ruleBottomCoord = _ruleBottom.getBoundingClientRect();
    if (Utils.distance(x, y, ruleOriginCoord.left, ruleOriginCoord.top) < Utils.distance(x, y, ruleBottomCoord.left, ruleBottomCoord.top)) {
      _sideRuleOriginX = round(ruleOriginCoord.left);
      _sideRuleOriginY = -round(ruleOriginCoord.top);
    } else {
      _sideRuleOriginX = round(ruleBottomCoord.left);
      _sideRuleOriginY = -round(ruleBottomCoord.top);
    }
    /*
    var angle = Utils.angleRad(x, y, centerCoord.left, centerCoord.top) - Utils.angleRad(startCoord.left, startCoord.top, centerCoord.left, centerCoord.top);
    var sec = Utils.distance(x, y, centerCoord.left, centerCoord.top);
    var tan = MATH.abs(round(sec * MATH.sin(angle)));
    var distance = tan - _config.ruleHeight / 2;
    var near = MATH.abs(distance) <= _config.ruleMarginToDraw;
    */
    if (inside === true) {
      return MATH.abs(MATH.abs(round(Utils.distance(x, y, centerCoord.left, centerCoord.top) * MATH.sin(Utils.angleRad(x, y, centerCoord.left, centerCoord.top) - Utils.angleRad(startCoord.left, startCoord.top, centerCoord.left, centerCoord.top)))) - _config.ruleHeight / 2) <= _config.ruleMarginToDraw / 2;
    } else {
      return MATH.abs(MATH.abs(round(Utils.distance(x, y, centerCoord.left, centerCoord.top) * MATH.sin(Utils.angleRad(x, y, centerCoord.left, centerCoord.top) - Utils.angleRad(startCoord.left, startCoord.top, centerCoord.left, centerCoord.top)))) - _config.ruleHeight / 2) <= _config.ruleMarginToDraw;
    }


  }

  var getCoordsNearRule = (function () {

    var m, xo, yo, x, y;

    return function (xp, yp, offsetX, offsetY) {

      offsetX = (offsetX || 0);
      offsetY = (offsetY || 0);
      xp += offsetX;
      yp += offsetY;
      yp *= -1;
      m = _currentCoefficientM;
      xo = _sideRuleOriginX;
      yo = _sideRuleOriginY;
      if (m === 0) {
        x = xp;
        y = -yo;
      } else if (isFinite(m)) {
        x = round((m*xo - yo + yp + xp/m) / (1/m + m));
        y = -round(m*x - m*xo + yo);
      } else {
        x = xo;
        y = -yp;
      }
      return [x - offsetX, y - offsetY];

    };

  })();

  function _toggleDragMode () {

    if (_dragMode === "drag") {
      _dragMode = "rotate";
      _ruleLevel.classList.add("drawith-editor__tool-rule-level-selected");
      _ruleLevel.classList.remove("drawith-editor__tool-rule-level");
    } else {
      _dragMode = "drag";
      _ruleLevel.classList.add("drawith-editor__tool-rule-level");
      _ruleLevel.classList.remove("drawith-editor__tool-rule-level-selected");
    }
  }

  function _onTouchStart (e) {

    e.preventDefault();
    e.stopPropagation();
    var touches = Utils.filterTouchesByTarget(e, _rule).concat(Utils.filterTouchesByTarget(e, _ruleLevelValue));
    if (_isNearSide === true || _draggable === false || touches.length > 2) {
      _touchDown = false;
      return;
    }
    var ruleOriginCoord = {}, gestureOneCoord = {}, gestureTwoCoor = {}, cursorX = 0, cursorY = 0;
    _touchDown = true;
    if (_startOriginX === 0) {
      ruleOriginCoord = _ruleOrigin.getBoundingClientRect();
      _startOriginX = round(ruleOriginCoord.left, 1);
      _startOriginY = round(ruleOriginCoord.top, 1);
    }
    if (_startCenterX === 0) {
      ruleOriginCoord = _ruleCenter.getBoundingClientRect();
      _startCenterX = round(ruleOriginCoord.left, 1);
      _startCenterY = round(ruleOriginCoord.top, 1);
    }
    if (touches.length <= 1) {
      cursorX = Utils.getEventCoordX(touches, 0, true);
      cursorY = Utils.getEventCoordY(touches, 0, true);
      if (checkCoordNearRule(cursorX, cursorY, true)) {
        _isNearSide = true;
        lock();
        [cursorX, cursorY] = getCoordsNearRule(cursorX, cursorY);
        Editor.makeTouchStartNearRule(touches, cursorX, cursorY);
      } else if (_dragMode === "drag") {
        _dragStartX = cursorX;
        _dragStartY = cursorY;
      } else {
        ruleOriginCoord = _ruleCenter.getBoundingClientRect();
        _currentCenterX = ruleOriginCoord.left;
        _currentCenterY = ruleOriginCoord.top;
        _dragCurrentX = round(ruleOriginCoord.left - _startCenterX, 1);
        _dragCurrentY = round(ruleOriginCoord.top - _startCenterY, 1);
        _startAngle = round(-Utils.angleDeg(ruleOriginCoord.left, ruleOriginCoord.top, cursorX, cursorY), 2) - _currentRotation;
      }
    } else {
      if (_dragMode === "rotate") {
        _toggleDragMode();
      }
      _dragLastX = _dragCurrentX;
      _dragLastY = _dragCurrentY;
      ruleOriginCoord = _ruleOrigin.getBoundingClientRect();
      _ruleGestureOne.style.left = round(touches[0].clientX, 1) + "px";
      _ruleGestureOne.style.top = round(touches[0].clientY - Param.headerSize, 1) + "px";
      _ruleGestureOne.style.transformOrigin = round(ruleOriginCoord.left - touches[0].clientX, 1) + "px " + round(ruleOriginCoord.top - touches[0].clientY, 1) + "px";
      _ruleGestureTwo.style.left = round(touches[1].clientX, 1) + "px";
      _ruleGestureTwo.style.top = round(touches[1].clientY - Param.headerSize, 1) + "px";
      _ruleGestureTwo.style.transformOrigin = round(ruleOriginCoord.left - touches[1].clientX, 1) + "px " + round(ruleOriginCoord.top - touches[1].clientY, 1) + "px";
      _ruleGestureOne.style.transform = _ruleGestureTwo.style.transform = "translate3d(" + round(_startOriginX - ruleOriginCoord.left, 1) + "px, " + round(_startOriginY - ruleOriginCoord.top, 1) + "px, 0px) rotateZ(" + (-_currentRotation) + "deg)";
      gestureOneCoord = _ruleGestureOne.getBoundingClientRect();
      gestureTwoCoord = _ruleGestureTwo.getBoundingClientRect();
      _gestureOriginX = (gestureOneCoord.left + gestureTwoCoord.left) / 2;
      _gestureOriginY = (gestureOneCoord.top + gestureTwoCoord.top) / 2;
      _startAngle = round(-Utils.angleDeg(gestureOneCoord.left, gestureOneCoord.top, gestureTwoCoord.left, gestureTwoCoord.top), 2);
      _ruleTransformOrigin = round(_gestureOriginX - _startOriginX, 1) + "px " + round(_gestureOriginY - _startOriginY, 1) + "px";
      _ruleGestureOne.style.cssText = _ruleGestureTwo.style.cssText = "";
    }

  }

  function _onTouchMove (e) {

    e.preventDefault();
    e.stopPropagation();
    var touches = Utils.filterTouchesByTarget(e, _rule).concat(Utils.filterTouchesByTarget(e, _ruleLevelValue));
    if (touches.length > 2 || _touchDown === false) {
      _touchDown = false;
      return;
    }
    var cursorX = 0, cursorY = 0;
    if (_isNearSide) {
      [cursorX, cursorY] = getCoordsNearRule(Utils.getEventCoordX(touches, 0, true), Utils.getEventCoordY(touches, 0, true));
      Editor.makeTouchMoveNearRule(touches, cursorX, cursorY);
    } else if (_draggable) {
      _dragged = true;
      if (touches.length <= 1) {
        cursorX = Utils.getEventCoordX(touches, 0, true);
        cursorY = Utils.getEventCoordY(touches, 0, true);
        if (_dragStartX === -1) {
          _dragStartX = cursorX;
          _dragStartY = cursorY;
        }
        if (_dragMode === "drag" || touches[0].target === _ruleLevelValue) {
          _dragCurrentX = round(_dragLastX + cursorX - _dragStartX, 1);
          _dragCurrentY = round(_dragLastY + cursorY - _dragStartY, 1);
        } else {
          _ruleTransformOrigin = "";
          _rule.style.transformOrigin = "50% 50%";
          _currentRotation = _roundAngleForSteps(round((-Utils.angleDeg(_currentCenterX, _currentCenterY, cursorX, cursorY) - _startAngle), 2));
          _ruleLevel.style.transform = "rotateZ(" + (-_currentRotation) + "deg)";
          _ruleLevelValue.innerHTML = _rotationToLabel(_currentRotation);
        }
      } else {
        _dragCurrentX = round((touches[0].clientX +  touches[1].clientX) / 2 - _gestureOriginX, 1);
        _dragCurrentY = round((touches[0].clientY +  touches[1].clientY) / 2 - _gestureOriginY, 1);
        _currentRotation = _roundAngleForSteps(round((-Utils.angleDeg(touches[0].clientX, touches[0].clientY, touches[1].clientX, touches[1].clientY) - _startAngle), 2));
        _ruleLevel.style.transform = "rotateZ(" + (-_currentRotation) + "deg)";
        _ruleLevelValue.innerHTML = _rotationToLabel(_currentRotation);
        _dragStartX = _dragStartY = -1;
        _rule.style.transformOrigin = _ruleTransformOrigin;
      }
      _rule.style.transform = "translate3d(" + (_dragCurrentX) + "px, " + _dragCurrentY + "px, 0px) rotateZ(" + _currentRotation + "deg)";
    }

  }

  function _onTouchEnd (e) {

    e.preventDefault();
    e.stopPropagation();
    var touches = Utils.filterTouchesByTarget(e, _rule).concat(Utils.filterTouchesByTarget(e, _ruleLevelValue));
    if (!e.touches || touches.length === 0) {
      _touchDown = false;
    }
    if (_touchDown === false) {
      _dragged = false;
      if (_isNearSide) {
        unlock();
        _isNearSide = false;
        Editor.makeTouchEndNearRule();
      } else if (_draggable === true) {
        var centerCoord = _ruleCenter.getBoundingClientRect();
        var deltaX = 0, deltaY = 0;
        var currentRotationRad = _currentRotation / 180 * MATH.PI;
        centerCoord.top = round(centerCoord.top);
        centerCoord.left = round(centerCoord.top);
        var outTop = Param.headerSize + _config.ruleMinOffset - centerCoord.top;
        var outBottom = centerCoord.top - (app.HEIGHT - _config.ruleMinOffset - _config.colorsPickerHeight);
        var outLeft = _offsetLeft + _config.ruleMinOffset - centerCoord.left;
        var outRight = centerCoord.left - (app.WIDTH - _offsetRight - _config.ruleMinOffset);
        var maxDeltaX = app.WIDTH - centerCoord.left - _config.ruleMinOffset - _offsetRight;
        var minDeltaX = -centerCoord.left + _offsetLeft + _config.ruleMinOffset;
        var maxDeltaY = app.HEIGHT - centerCoord.top - _config.ruleMinOffset - _config.colorsPickerHeight;
        var minDeltaY = -centerCoord.top + Param.headerSize + _config.ruleMinOffset;
        var sidesOut = [outTop, outBottom, outLeft, outRight].sort(function (a, b) {return a - b;}).filter(function (a) {return a > 0;});
        var i = 0;
        var side = sidesOut[i];
        while (side) {
          if (side === outTop) {
            deltaY = outTop;
            deltaX = deltaY * MATH.cos(currentRotationRad) / MATH.sin(currentRotationRad);
          } else if (side === outBottom) {
            deltaY = -outBottom;
            deltaX = deltaY * MATH.cos(currentRotationRad) / MATH.sin(currentRotationRad);
          } else if (side === outLeft) {
            deltaX = outLeft;
            deltaY = deltaX * MATH.sin(currentRotationRad) / MATH.cos(currentRotationRad);
          } else {
            deltaX = -outRight;
            deltaY = deltaX * MATH.sin(currentRotationRad) / MATH.cos(currentRotationRad);
          }
          i++;
          if (sidesOut.length > i && (deltaX > maxDeltaX || deltaX < minDeltaX || deltaY > maxDeltaY || deltaY < minDeltaY)) {
            side = sidesOut[i];
          } else {
            side = false;
          }
        }
        deltaX = MATH.min(deltaX, maxDeltaX);
        deltaX = MATH.max(deltaX, minDeltaX);
        deltaY = MATH.min(deltaY, maxDeltaY);
        deltaY = MATH.max(deltaY, minDeltaY);
        _dragCurrentX += deltaX;
        _dragCurrentY += deltaY;
        _rule.style.transform = "translate3d(" + (_dragCurrentX) + "px, " + _dragCurrentY + "px, 0px) rotateZ(" + _currentRotation + "deg)";
      }
    }
    _dragLastX = _dragCurrentX;
    _dragLastY = _dragCurrentY;
    _dragStartX = _dragStartY = _gestureOriginX = _gestureOriginY = -1;
    _startAngle = 0;

  }

  function _onLevelTouchStart (e) {
    if (!e.touches || e.touches.length === 1) {
      _ruleLevelTouchStartTime = new Date().getTime();
    }
  }

  function _onLevelTouchEnd (e) {

    if (_ruleLevelTouchStartTime + 200 > new Date().getTime() && _dragged === false &&(!e.touches || e.touches.length === 0)) {
      e.preventDefault();
      e.stopPropagation();
      _toggleDragMode();
      _ruleLevelTouchStartTime = 0;
      _touchDown = false;
    }
  }

  function _onGestureStart (e) {

    e.preventDefault();
    e.stopPropagation();

  }

  function _onGestureChange (e) {

    e.preventDefault();
    e.stopPropagation();

  }

  function _onGestureEnd (e) {

    e.preventDefault();
    e.stopPropagation();

  }

  function _onRotate (e) {

    _rule.style.width = (_config.ruleWidth * MATH.max(app.WIDTH, app.HEIGHT)) + "px";
    _rule.style.marginLeft = -(_config.ruleWidth * MATH.max(app.WIDTH, app.HEIGHT) / 2) + "px";
    _rule.style.height = _config.ruleHeight + "px";
    _rule.style.marginTop = -_config.ruleHeight / 2 + "px";
    _touchDown = false;
    _startOriginX  =_startOriginY = 0;
    _dragCurrentX = _dragCurrentY = _currentRotation = _dragLastX = _dragLastY = _startAngle =0;
    _dragStartX = _dragStartY = _gestureOriginX = _gestureOriginY = -1;
    _rule.style.transform = "translate3d(" + (_dragCurrentX) + "px, " + _dragCurrentY + "px, 0px) rotateZ(" + _currentRotation + "deg)";
    _ruleLevel.style.transform = "rotateZ(" + (-_currentRotation) + "deg)";
    _ruleLevelValue.innerHTML = _rotationToLabel(_currentRotation);
    if (_isVisible) {
      Editor.Tools.clickButton("rule");
    }

  }

  function _initDom (moduleContainer) {

    Main.loadTemplate("editorRule", {}, moduleContainer, function (templateDom) {

      _rule = templateDom[0];
      _ruleOrigin = _rule.querySelector(".drawith-editor__tool-rule-origin");
      _ruleCenter = _rule.querySelector(".drawith-editor__tool-rule-center");
      _ruleStart = _rule.querySelector(".drawith-editor__tool-rule-start");
      _ruleBottom = _rule.querySelector(".drawith-editor__tool-rule-bottom");
      _ruleLevel = _rule.querySelector(".drawith-editor__tool-rule-level");
      _ruleLevelValue = _rule.querySelector(".drawith-editor__tool-rule-level-value");
      _ruleGestureOne = templateDom[1];
      _ruleGestureTwo = templateDom[2];
      _rule.style.width = (_config.ruleWidth * MATH.max(app.WIDTH, app.HEIGHT)) + "px";
      _rule.style.marginLeft = -(_config.ruleWidth * MATH.max(app.WIDTH, app.HEIGHT) / 2) + "px";
      _rule.style.height = _config.ruleHeight + "px";
      _rule.style.marginTop = -_config.ruleHeight / 2 + "px";
      _rule.addEventListener(Param.eventStart, _onTouchStart);
      _rule.addEventListener(Param.eventMove, _onTouchMove);
      _rule.addEventListener(Param.eventEnd, _onTouchEnd);
      _ruleLevelValue.addEventListener(Param.eventStart, _onLevelTouchStart);
      _ruleLevelValue.addEventListener(Param.eventEnd, _onLevelTouchEnd);
      if (Param.supportGesture) {
        _rule.addEventListener("gesturestart", _onGestureStart, true);
        _rule.addEventListener("gesturechange", _onGestureChange, true);
        _rule.addEventListener("gestureend", _onGestureEnd, true);
      }
      Main.addRotationHandler(_onRotate);

    });

  }

  function init (params, moduleContainer) {

    Param = app.Param;
    Utils = app.Utils;
    Main = app.Main;
    Editor = app.Editor;
    _config = Utils.setConfig(params, _config);
    _config.ruleMinOffset *= Param.pixelRatio;
    _config.ruleHeight *= Param.pixelRatio;
    _config.ruleMarginToDraw *= Param.pixelRatio;
    if (_config.toolsSide === "left") {
      _offsetLeft = _config.toolsWidth;
    } else {
      _offsetRight = _config.toolsWidth;
    }
    _initDom(moduleContainer);

  }

  app.module("Editor.Rule", {
    init: init,
    show: show,
    hide: hide,
    lock: lock,
    unlock: unlock,
    checkCoordNearRule: checkCoordNearRule,
    getCoordsNearRule: getCoordsNearRule,
  });

})(drawith);
