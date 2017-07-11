/*
  Documentations:

*/
(function (app) {
  "use strict";
  // Dependencies
  var Param = {};
  var Utils = {};
  var Editor = {};
  var Main = {};
  var MATH = Math;

  var _config = {
    colors: []
  };

  var _container = {}, _randomButtom = {}, _colorsContainer = {};
  var _dragged = false, _touchDown = false, _currentScroll = 0;
  var _selectedValue = "random";

  function selectInitialColor () {

    _selectRandom(false);
    _colorsContainer.scrollLeft = 0;

  }

  function _selectColor (target) {

    _randomButtom.classList.remove("drawith-editor-colorpicker__random-selected");
    _randomButtom.classList.remove("drawith-editor-colorpicker__random-locked");
    var selected = _container.querySelector(".drawith-editor-colorpicker__color-selected");
    if (selected) {
      selected.classList.remove("drawith-editor-colorpicker__color-selected");
    }
    target.classList.add("drawith-editor-colorpicker__color-selected");
    _selectedValue = target.getAttribute("data-color");
    Editor.setTool({
      color: _selectedValue,
      randomColor: false
    });
  }

  function _selectRandom (last) {

    var selected = _container.querySelector(".drawith-editor-colorpicker__color-selected");
    if (selected) {
      selected.classList.remove("drawith-editor-colorpicker__color-selected");
    }
    if (last) {
      _randomButtom.classList.add("drawith-editor-colorpicker__random-locked");
      _selectedValue = "last-random";
    } else {
      _randomButtom.classList.remove("drawith-editor-colorpicker__random-locked");
      _selectedValue = "random";
    }
    _randomButtom.classList.add("drawith-editor-colorpicker__random-selected");
    Editor.setTool({
      color: "",
      randomColor: (last ? "last" : true)
    });

  }

  function _onTouchStart (e) {

    if (e.type.indexOf("mouse") >= 0 && e.button > 0 || (e.touches && e.touches.length > 1)) {
      e.preventDefault();
      return;
    }
    _currentScroll = _colorsContainer.scrollLeft;

  }

  function _onTouchEnd (e) {

    e.preventDefault();
    e.stopPropagation();
    if (MATH.abs(_currentScroll - _colorsContainer.scrollLeft) > 10) {
      return;
    }
    _currentScroll = 0;
    var target = e.target;
    if (target.classList.contains("drawith-editor-colorpicker__color")) {
      if (target.classList.contains("drawith-editor-colorpicker__color-selected") === false) {
        _selectColor(target);
      }
    } else if (target.classList.contains("drawith-editor-colorpicker__random")) {
      _selectRandom(_selectedValue === "random");
    }

  }

  function _onTouchMove (e) {

    if (e.target.classList.contains("drawith-editor-colorpicker__random")) {
      //e.preventDefault();
    }

  }

  function _initDom (moduleContainer) {

    Main.loadTemplate("editorColorPicker", {
      colors: _config.colors,
    }, moduleContainer, function (templateDom) {

      _container = templateDom;
      _randomButtom = _container.querySelector(".drawith-editor-colorpicker__random");
      _colorsContainer = _container.querySelector(".drawith-editor-colorpicker__colors-container");
      _container.addEventListener(Param.eventStart, _onTouchStart, true);
      _container.addEventListener(Param.eventMove, _onTouchMove, true);
      _container.addEventListener(Param.eventEnd, _onTouchEnd, true);
      _container.querySelector(".drawith-editor-colorpicker__colors-container > div").style.width = (_config.colors.length * 49 * Param.pixelRatio) + "px";
      selectInitialColor();

    });

  }

  function init (params, moduleContainer) {

    Param = app.Param;
    Utils = app.Utils;
    Main = app.Main;
    Editor = app.Editor;
    _config = Utils.setConfig(params, _config);
    _initDom(moduleContainer);

  }

  app.module("Editor.ColorPicker", {
    init: init,
    selectInitialColor: selectInitialColor
  });

})(APP);
