(function (app) {

  // Dependencies
  var Param = {};
  var Utils = {};
  var Main = {};
  var MATH = Math;

  var _config = {

  };

  var _rule = {};
  var _cursorX = -1, _cursorY = -1, _dragStartX = -1, _dragStartY = -1, _dragCurrentX = 0, _dragCurrentY = 0, _dragLastX = 0, _dragLastY = 0, _isGesture = false;
  var _ruleWidth = 0, _ruleHeight = 0, _minX = 0, _minY = 0, _currentRotation = 0, _lastRotation = 0;

  function show () {
    Utils.fadeInElements(_rule);
  }

  function hide () {
    Utils.fadeOutElements(_rule);
  }

  function _onTouchStart (e) {

    e.preventDefault();
    e.stopPropagation();
    if (_isGesture || (e.touches && e.touches.length > 1)) return;
    if (_ruleWidth === 0) {
      _ruleWidth = _rule.clientWidth;
      _ruleHeight = _rule.clientHeight;
      _minX = -_ruleWidth / 2 - app.WIDTH / 2 + 100 * Param.pixelRatio;
      _minY = -_ruleHeight / 2 - app.HEIGHT / 2 + 100 * Param.pixelRatio;
    }
    _dragStartX = Utils.getEventCoordX(e, 0, true);
    _dragStartY = Utils.getEventCoordY(e, 0, true);

  }

  function _onTouchMove (e) {

    e.preventDefault();
    e.stopPropagation();
    if (_isGesture || (e.touches && e.touches.length > 1)) return;
    _cursorX = Utils.getEventCoordX(e, 0, true);
    _cursorY = Utils.getEventCoordY(e, 0, true);
    if (_dragStartX === -1) {
      _dragStartX = _cursorX;
      _dragStartY = _cursorY;
    }
    _dragCurrentX = MATH.min(MATH.max(_dragLastX + _cursorX - _dragStartX, _minX), -_minX);
    _dragCurrentY = MATH.min(MATH.max(_dragLastY + _cursorY - _dragStartY, _minY), -_minY);
    _rule.style.transform = "translate3d(" + (_dragCurrentX) + "px, " + (_dragCurrentY) + "px, 0px) rotateZ(" + _currentRotation + "deg)";

  }

  function _onTouchEnd (e) {

    e.preventDefault();
    e.stopPropagation();
    if (_isGesture || (e.touches && e.touches.length > 1)) return;
    _dragLastX = _dragCurrentX;
    _dragLastY = _dragCurrentY;
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
    console.log("gesture:", e.layerX, e.layerY);
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

  function _onRotate (e) {
    // do some stuff
  }

  function _initDom (moduleContainer) {

    Main.loadTemplate("editorRule", {}, moduleContainer, function (templateDom) {

      _rule = templateDom;
      //_rule.style.transformOrigin = "50% 50%";
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
    _initDom(moduleContainer);

  }

  app.module("Editor.Rule", {
    init: init,
    show: show,
    hide: hide
  });

})(drawith);
