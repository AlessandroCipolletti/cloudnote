(function (app) {

  // Dependencies
  var Param = {};
  var Utils = {};
  var Main = {};
  var MATH = Math;

  var _config = {

  };

  var _rule = {}, _ruleOrigin = {}, _ruleGestureOne = {}, _ruleGestureTwo = {};

  var _cursorX = -1, _cursorY = -1, _dragStartX = -1, _dragStartY = -1, _dragCurrentX = 0, _dragCurrentY = 0, _dragLastX = 0, _dragLastY = 0, _isGesture = false, _currentRotation = 0, _lastRotation = 0;

  var _ruleWidth = 0, _ruleHeight = 0, _minX = 0, _minY = 0;
  var _startOriginX = 0, _startOriginY = 0, _startAngle = 0;;

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
    if (_ruleWidth === 0) {
      _ruleWidth = _rule.clientWidth;
      _ruleHeight = _rule.clientHeight;
      _minX = -_ruleWidth / 2 - app.WIDTH / 2 + 100 * Param.pixelRatio;
      _minY = -_ruleHeight / 2 - app.HEIGHT / 2 + 100 * Param.pixelRatio;
      ruleOriginCoord = _ruleOrigin.getBoundingClientRect();
      _startOriginX = ruleOriginCoord.left;
      _startOriginY = ruleOriginCoord.top;
      console.log("ORIGIN:", _startOriginX, _startOriginY);
    }
    if (!e.touches || e.touches.length === 1) {
      _dragStartX = Utils.getEventCoordX(e, 0, true);
      _dragStartY = Utils.getEventCoordY(e, 0, true);
    } else {

      _dragLastX = _dragCurrentX;
      _dragLastY = _dragCurrentY;

      cursorX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      cursorY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - Param.headerSize;
      ruleOriginCoord = _ruleOrigin.getBoundingClientRect();

      _ruleGestureOne.style.left = e.touches[0].clientX + "px";
      _ruleGestureOne.style.top = (e.touches[0].clientY - Param.headerSize) + "px";
      _ruleGestureTwo.style.left = e.touches[1].clientX + "px";
      _ruleGestureTwo.style.top = (e.touches[1].clientY - Param.headerSize) + "px";

      _ruleGestureOne.style.transformOrigin = (e.touches[0].clientX - ruleOriginCoord.left) + "px " + (e.touches[0].clientY - ruleOriginCoord.top) + "px";
      _ruleGestureTwo.style.transformOrigin = (e.touches[1].clientX - ruleOriginCoord.left) + "px " + (e.touches[1].clientY - ruleOriginCoord.top) + "px";

      _ruleGestureOne.style.transform = _ruleGestureTwo.style.transform = "translate3d(" + (_startOriginX - ruleOriginCoord.left) + "px, " + (_startOriginY - ruleOriginCoord.top) + "px, 0px) rotateZ(" + (-_currentRotation) + "deg)";

      gestureOneCoord = _ruleGestureOne.getBoundingClientRect();
      gestureTwoCoord = _ruleGestureTwo.getBoundingClientRect();
      _gestureOriginX = (gestureOneCoord.left + gestureTwoCoord.left) / 2;
      _gestureOriginY = (gestureOneCoord.top + gestureTwoCoord.top) / 2;
      _startAngle = Utils.angleDeg(gestureOneCoord.left, gestureOneCoord.top, gestureTwoCoord.left, gestureTwoCoord.top);
      console.log("start: ", _gestureOriginX, _gestureOriginY, _startAngle);
      //debugger;

      _rule.style.transformOrigin = (_gestureOriginX - ruleOriginCoord.left) + "px " + (_gestureOriginY - ruleOriginCoord.top) + "px";
      _ruleGestureOne.syle = _ruleGestureTwo.style = "";

    }

  }

  function _onTouchMove (e) {

    e.preventDefault();
    e.stopPropagation();
    if (e.touches && e.touches.length > 2) return;
    var cursorX = 0, cursorY = 0;
    if (!e.touches || e.touches.length === 1) {
      cursorX = Utils.getEventCoordX(e, 0, true);
      cursorY = Utils.getEventCoordY(e, 0, true);
      if (_dragStartX === -1) {
        _dragStartX = cursorX;
        _dragStartY = cursorY;
      }
      _dragCurrentX = MATH.min(MATH.max(_dragLastX + cursorX - _dragStartX, _minX), -_minX);
      _dragCurrentY = MATH.min(MATH.max(_dragLastY + cursorY - _dragStartY, _minY), -_minY);
    } else {
      _dragCurrentX = (e.touches[0].clientX +  e.touches[1].clientX) / 2 - _gestureOriginX;
      _dragCurrentY = (e.touches[0].clientY +  e.touches[1].clientY) / 2 - _gestureOriginY;
      _currentRotation = (Utils.angleDeg(e.touches[0].clientX, e.touches[0].clientY, e.touches[1].clientX, e.touches[1].clientY) - _startAngle) % 360;
      _dragStartX = _dragStartY = -1;
      console.log("move: ", _dragCurrentX, _dragCurrentY, _currentRotation);

    }
    _rule.style.transform = "translate3d(" + (_dragCurrentX) + "px, " + (_dragCurrentY) + "px, 0px) rotateZ(" + _currentRotation + "deg)";

  }

  function _onTouchEnd (e) {

    e.preventDefault();
    e.stopPropagation();
    _dragLastX = _dragCurrentX;
    _dragLastY = _dragCurrentY;
    _dragStartX = _dragStartY = _gestureOriginX = _gestureOriginY = -1;

  }

  /*
  function _onTouchStart (e) {

    e.preventDefault();
    e.stopPropagation();
    //if (_isGesture || (e.touches && e.touches.length > 1)) return;
    var ruleOriginCoord = {};
    if (e.touches && e.touches.length > 2) return;
    if (_ruleWidth === 0) {
      _ruleWidth = _rule.clientWidth;
      _ruleHeight = _rule.clientHeight;
      _minX = -_ruleWidth / 2 - app.WIDTH / 2 + 100 * Param.pixelRatio;
      _minY = -_ruleHeight / 2 - app.HEIGHT / 2 + 100 * Param.pixelRatio;
      ruleOriginCoord = _ruleOrigin.getBoundingClientRect();
      _startOriginX = ruleOriginCoord.left;
      _startOriginY = ruleOriginCoord.top;
    }
    if (!e.touches || e.touches.length === 1) {
      _dragStartX = Utils.getEventCoordX(e, 0, true);
      _dragStartY = Utils.getEventCoordY(e, 0, true);
    } else {
      _dragLastX = _dragCurrentX;
      _dragLastY = _dragCurrentY;
      _dragStartX = (e.touches[0].clientX +  e.touches[1].clientX) / 2;
      _dragStartY = (e.touches[0].clientY +  e.touches[1].clientY) / 2;
      ruleOriginCoord = _ruleOrigin.getBoundingClientRect();
      _ruleGestureCenter.style = "left: " + _dragStartX + "px; top: " + _dragStartY + "px; " +
        "transform-origin: " + (ruleOriginCoord.left - _dragStartX) + "px " + (ruleOriginCoord.top - _dragStartY) + "px; " +
        "transform: rotateZ(" + -_currentRotation + "deg) translate3d(" + _startOriginX - ruleOriginCoord.left + ", " + _startOriginY - ruleOriginCoord.top + ", 0px); ";
      ruleOriginCoord = _ruleGestureCenter.getBoundingClientRect();
      _rule.style.transformOrigin = (ruleOriginCoord.left -_startOriginX) + "px " + (ruleOriginCoord.top - _startOriginY) + "px";
    }
  }

  function _onTouchMove (e) {

    e.preventDefault();
    e.stopPropagation();
    //if (_isGesture || (e.touches && e.touches.length > 1)) return;
    if (e.touches && e.touches.length > 2) return;
    if (!e.touches || e.touches.length === 1) {
      _cursorX = Utils.getEventCoordX(e, 0, true);
      _cursorY = Utils.getEventCoordY(e, 0, true);
      if (_dragStartX === -1) {
        _dragStartX = _cursorX;
        _dragStartY = _cursorY;
      }
      _dragCurrentX = MATH.min(MATH.max(_dragLastX + _cursorX - _dragStartX, _minX), -_minX);
      _dragCurrentY = MATH.min(MATH.max(_dragLastY + _cursorY - _dragStartY, _minY), -_minY);
    } else {
      _cursorX = (e.touches[0].clientX +  e.touches[1].clientX) / 2;
      _cursorY = (e.touches[0].clientY +  e.touches[1].clientY) / 2;
      _dragCurrentX = MATH.min(MATH.max(_dragLastX + _cursorX - _dragStartX, _minX), -_minX);
      _dragCurrentY = MATH.min(MATH.max(_dragLastY + _cursorY - _dragStartY, _minY), -_minY);

      //_currentRotation = _lastRotation + e.rotation;  // TODO
      //_currentRotation = Utils.angleDeg(e.touches[0].clientX, e.touches[0].clientY, e.touches[1].clientX, e.touches[1].clientY);
      _currentRotation = (e.touches[1].clientY - e.touches[0].clientY) / (e.touches[1].clientX - e.touches[0].clientX) * 180 / MATH.PI;
      //_rule.style.transformOrigin = _cursorX + "px " + _cursorY + "px";
    }
    _rule.style.transform = "translate3d(" + (_dragCurrentX) + "px, " + (_dragCurrentY) + "px, 0px) rotateZ(" + _currentRotation + "deg)";

  }

  function _onTouchEnd (e) {

    e.preventDefault();
    e.stopPropagation();
    //if (_isGesture || (e.touches && e.touches.length > 1)) return;
    _dragLastX = _dragCurrentX;
    _dragLastY = _dragCurrentY;
    _lastRotation = _currentRotation;
    _cursorX = _cursorY = _dragStartX = _dragStartY = -1;

  }

  function _onGestureStart (e) {

    e.preventDefault();
    e.stopPropagation();
    _isGesture = true;
    _dragLastX = _dragCurrentX;
    _dragLastY = _dragCurrentY;
    _dragStartX = Utils.getEventCoordX(e, 0, true);
    _dragStartY = Utils.getEventCoordY(e, 0, true);
    //_rule.style.transformOrigin = e.layerX + "px " + e.layerY + "px";

  }

  function _onGestureChange (e) {

    e.preventDefault();
    e.stopPropagation();
    _isGesture = true;
    _cursorX = Utils.getEventCoordX(e, 0, true);
    _cursorY = Utils.getEventCoordY(e, 0, true);
    _dragCurrentX = MATH.min(MATH.max(_dragLastX + _cursorX - _dragStartX, _minX), -_minX);
    _dragCurrentY = MATH.min(MATH.max(_dragLastY + _cursorY - _dragStartY, _minY), -_minY);
    _currentRotation = _lastRotation + e.rotation;
    _rule.style.transformOrigin = e.layerX + "px " + e.layerY + "px";
    _rule.style.transform = "translate3d(" + (_dragCurrentX) + "px, " + (_dragCurrentY) + "px, 0px) rotateZ(" + _currentRotation + "deg)";

  }

  function _onGestureEnd (e) {

    e.preventDefault();
    e.stopPropagation();
    _dragLastX = _dragCurrentX;
    _dragLastY = _dragCurrentY;
    _lastRotation = _currentRotation;
    _cursorX = _cursorY = _dragStartX = _dragStartY = -1;
    _isGesture = false;

  }
  */

  function _onRotate (e) {
    // do some stuff
  }

  function _initDom (moduleContainer) {

    Main.loadTemplate("editorRule", {}, moduleContainer, function (templateDom) {

      _rule = templateDom[0];
      _ruleOrigin = _rule.querySelector(".drawith-editor__tool-rule-origin");
      _ruleGestureOne = templateDom[1];
      _ruleGestureTwo = templateDom[2];
      _rule.addEventListener(Param.eventStart, _onTouchStart);
      _rule.addEventListener(Param.eventMove, _onTouchMove);
      _rule.addEventListener(Param.eventEnd, _onTouchEnd);
      if (false && Param.supportGesture) {
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
    _initDom(moduleContainer);

  }

  app.module("Editor.Rule", {
    init: init,
    show: show,
    hide: hide
  });

})(drawith);
