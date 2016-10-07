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
    ruleMinOffset: 75
    // TODO rule width
  };

  // TODO bug se dopo drag a 2 dita continuo drag con 1 dito
  // TODO quando si passa da rotazioni multiple di 45 gradi bloccare la rotazione per i 2 gradi successivi :)

  function round (n, d) {
    var m = d ? MATH.pow(10, d) : 1;
    return MATH.round(n * m) / m;
  }

  var _rule = {}, _ruleOrigin = {}, _ruleGestureOne = {}, _ruleGestureTwo = {}, _ruleTransformOrigin = "", _touchDown = false;
  var _dragStartX = -1, _dragStartY = -1, _dragCurrentX = 0, _dragCurrentY = 0, _dragLastX = 0, _dragLastY = 0, _currentRotation = 0;
  var _ruleWidth = 0, _ruleHeight = 0, _startOriginX = 0, _startOriginY = 0, _startAngle = 0;
  var _gestureOriginX = 0, _gestureOriginY = 0, _offsetLeft = 0, _offsetRight = 0;

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
      var rulePosition = _rule.getBoundingClientRect();
      if (rulePosition.bottom < Param.headerSize + _config.ruleMinOffset) {  // top
        _dragCurrentY += Param.headerSize + _config.ruleMinOffset - rulePosition.bottom;
      } else if (rulePosition.top > app.HEIGHT - _config.ruleMinOffset - _config.colorsPickerHeight) {  // bottom
        _dragCurrentY -= rulePosition.top - (app.HEIGHT - _config.ruleMinOffset - _config.colorsPickerHeight);
      }
      if (rulePosition.right < _offsetLeft + _config.ruleMinOffset) { // left
        _dragCurrentX += _offsetLeft + _config.ruleMinOffset - rulePosition.right;
      } else if (rulePosition.left > app.WIDTH - _offsetRight - _config.ruleMinOffset) {  // right
        _dragCurrentX -= rulePosition.left - (app.WIDTH - _offsetRight - _config.ruleMinOffset);
      }
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
      _ruleGestureOne = templateDom[1];
      _ruleGestureTwo = templateDom[2];
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
