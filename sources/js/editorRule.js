(function (app) {

  // Dependencies
  var Param = {};
  var Utils = {};
  var Main = {};
  var MATH = Math;

  var _config = {
    toolsSide: "left",
    toolsWidth: 45,
    colorsPickerHeight: 45,
    ruleMinOffset: 50,
    ruleWidth: 1
  };

  // TODO bug se dopo drag a 2 dita continuo drag con 1 dito
  // TODO quando si passa da rotazioni multiple di 45 gradi bloccare la rotazione per i 2 gradi successivi :)

  function round (n, d) {
    var m = d ? MATH.pow(10, d) : 1;
    return MATH.round(n * m) / m;
  }

  var _rule = {}, _ruleOrigin = {}, _ruleCenter = {}, _ruleLevel = {}, _ruleLevelValue = {}, _ruleGestureOne = {}, _ruleGestureTwo = {};
  var _dragStartX = -1, _dragStartY = -1, _dragCurrentX = 0, _dragCurrentY = 0, _dragLastX = 0, _dragLastY = 0, _currentRotation = 0;
  var _ruleWidth = 0, _ruleHeight = 0, _startOriginX = 0, _startOriginY = 0, _startAngle = 0;
  var _gestureOriginX = 0, _gestureOriginY = 0, _offsetLeft = 0, _offsetRight = 0, _ruleTransformOrigin = "", _touchDown = false;

  var _rotationToLabel = (function () {

    var result = 0;

    return function (deg) {

      deg = MATH.abs(MATH.trunc(deg));
      result = deg;
      while (result > 90) {
        result = result - 90;
      }
      if (deg % 180 === 0) {
        result = 0;
      } else if (deg % 180 > 90) {
        result = 90 - result;
      }
      return result;

    };

  })();

  function show () {
    Utils.fadeInElements(_rule);
  }

  function hide () {
    Utils.fadeOutElements(_rule);
  }

  function _onTouchStart (e) {

    e.preventDefault();
    e.stopPropagation();
    if (e.touches && e.touches.length > 2) return;
    var ruleOriginCoord = {}, gestureOneCoord = {}, gestureTwoCoor = {}, cursorX = 0, cursorY = 0;
    _touchDown = true;
    if (_ruleWidth === 0) {
      _ruleWidth = _rule.clientWidth;
      _ruleHeight = _rule.clientHeight;
      ruleOriginCoord = _ruleOrigin.getBoundingClientRect();
      _startOriginX = round(ruleOriginCoord.left, 1);
      _startOriginY = round(ruleOriginCoord.top, 1);
    }
    if (!e.touches || e.touches.length === 1) {
      _dragStartX = Utils.getEventCoordX(e, 0, true);
      _dragStartY = Utils.getEventCoordY(e, 0, true);
    } else {
      _dragLastX = _dragCurrentX;
      _dragLastY = _dragCurrentY;
      ruleOriginCoord = _ruleOrigin.getBoundingClientRect();
      _ruleGestureOne.style.left = round(e.touches[0].clientX, 1) + "px";
      _ruleGestureOne.style.top = round(e.touches[0].clientY - Param.headerSize, 1) + "px";
      _ruleGestureOne.style.transformOrigin = round(ruleOriginCoord.left - e.touches[0].clientX, 1) + "px " + round(ruleOriginCoord.top - e.touches[0].clientY, 1) + "px";
      _ruleGestureTwo.style.left = round(e.touches[1].clientX, 1) + "px";
      _ruleGestureTwo.style.top = round(e.touches[1].clientY - Param.headerSize, 1) + "px";
      _ruleGestureTwo.style.transformOrigin = round(ruleOriginCoord.left - e.touches[1].clientX, 1) + "px " + round(ruleOriginCoord.top - e.touches[1].clientY, 1) + "px";
      _ruleGestureOne.style.transform = _ruleGestureTwo.style.transform = "translate3d(" + round(_startOriginX - ruleOriginCoord.left, 1) + "px, " + round(_startOriginY - ruleOriginCoord.top, 1) + "px, 0px) rotateZ(" + (-_currentRotation) + "deg)";
      gestureOneCoord = _ruleGestureOne.getBoundingClientRect();
      gestureTwoCoord = _ruleGestureTwo.getBoundingClientRect();
      _gestureOriginX = (gestureOneCoord.left + gestureTwoCoord.left) / 2;
      _gestureOriginY = (gestureOneCoord.top + gestureTwoCoord.top) / 2;
      _startAngle = round(Utils.angleDeg(gestureOneCoord.left, gestureOneCoord.top, gestureTwoCoord.left, gestureTwoCoord.top), 2);
      _ruleTransformOrigin = round(_gestureOriginX - _startOriginX, 1) + "px " + round(_gestureOriginY - _startOriginY, 1) + "px";
      _ruleGestureOne.style.cssText = _ruleGestureTwo.style.cssText = "";
    }

  }

  function _onTouchMove (e) {

    e.preventDefault();
    e.stopPropagation();
    if (e.touches && e.touches.length > 2 || _touchDown === false) return;
    var cursorX = 0, cursorY = 0;
    if (!e.touches || e.touches.length === 1) {
      cursorX = Utils.getEventCoordX(e, 0, true);
      cursorY = Utils.getEventCoordY(e, 0, true);
      if (_dragStartX === -1) {
        _dragStartX = cursorX;
        _dragStartY = cursorY;
      }
      _dragCurrentX = _dragLastX + cursorX - _dragStartX;
      _dragCurrentY = _dragLastY + cursorY - _dragStartY;
    } else {
      _dragCurrentX = round((e.touches[0].clientX +  e.touches[1].clientX) / 2 - _gestureOriginX, 1);
      _dragCurrentY = round((e.touches[0].clientY +  e.touches[1].clientY) / 2 - _gestureOriginY, 1);
      _currentRotation = round((Utils.angleDeg(e.touches[0].clientX, e.touches[0].clientY, e.touches[1].clientX, e.touches[1].clientY) - _startAngle), 2);
      _ruleLevel.style.transform = "rotateZ(" + (-_currentRotation) + "deg)";
      _ruleLevelValue.innerHTML = _rotationToLabel(_currentRotation);
      _dragStartX = _dragStartY = -1;
      _rule.style.transformOrigin = _ruleTransformOrigin;
    }
    _rule.style.transform = "translate3d(" + (_dragCurrentX) + "px, " + _dragCurrentY + "px, 0px) rotateZ(" + _currentRotation + "deg)";

  }

  function _onTouchEnd (e) {

    e.preventDefault();
    e.stopPropagation();
    if (typeof(e.touches) === "undefined" || e.touches.length === 0) {
      _touchDown = false;
    }
    if (_touchDown === false) {
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
    _dragLastX = _dragCurrentX;
    _dragLastY = _dragCurrentY;
    _dragStartX = _dragStartY = _gestureOriginX = _gestureOriginY = -1;
    _startAngle = 0;

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
    // do some stuff
  }

  function _initDom (moduleContainer) {

    Main.loadTemplate("editorRule", {}, moduleContainer, function (templateDom) {

      _rule = templateDom[0];
      _ruleOrigin = _rule.querySelector(".drawith-editor__tool-rule-origin");
      _ruleCenter = _rule.querySelector(".drawith-editor__tool-rule-center");
      _ruleLevel = _rule.querySelector(".drawith-editor__tool-rule-level");
      _ruleLevelValue = _rule.querySelector(".drawith-editor__tool-rule-level-value");
      _ruleGestureOne = templateDom[1];
      _ruleGestureTwo = templateDom[2];
      _rule.style.width = (_config.ruleWidth * app.WIDTH) + "px";
      _rule.style.marginLeft = -(_config.ruleWidth * app.WIDTH / 2) + "px";
      _rule.addEventListener(Param.eventStart, _onTouchStart);
      _rule.addEventListener(Param.eventMove, _onTouchMove);
      _rule.addEventListener(Param.eventEnd, _onTouchEnd);
      if (Param.supportGesture) {
        _rule.addEventListener("gesturestart", _onGestureStart, true);
        _rule.addEventListener("gesturechange", _onGestureChange, true);
        _rule.addEventListener("gestureend", _onGestureEnd, true);
      }
      //Main.addRotationHandler(_onRotate);

    });

  }

  function init (params, moduleContainer) {

    Param = app.Param;
    Utils = app.Utils;
    Main = app.Main;
    _config = Utils.setConfig(params, _config);
    _config.ruleMinOffset *= Param.pixelRatio;
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
    hide: hide
  });

})(drawith);