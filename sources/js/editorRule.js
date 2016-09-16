(function (app) {

  // Dependencies
  var Param = {};
  var Utils = {};
  var Main = {};

  var _config = {

  };

  var _rule = {};
  var _cursorX = 0, _cursorY = 0;

  function show () {
    Utils.fadeInElements(_rule);
  }

  function hide () {
    Utils.fadeOutElements(_rule);
  }

  function _onTouchStart (e) {
    console.log("touch start");
  }

  function _onTouchMove (e) {
    console.log("touch move");
  }

  function _onTouchEnd (e) {
    console.log("touch end");
  }

  function _onGestureStart (e) {
    console.log("gesture start");
  }

  function _onGestureChange (e) {
    console.log("gesture change");
  }

  function _onGestureEnd (e) {
    console.log("gesture end");
  }

  function _onRotate (e) {
    // do some stuff
  }

  function _initDom (moduleContainer) {

    Main.loadTemplate("editorRule", {
      param: ""
    }, moduleContainer, function (templateDom) {

      _rule = templateDom;

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
