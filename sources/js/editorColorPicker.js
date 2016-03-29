(function (app) {

  // Dependencies
  var Param = {};
  var Utils = {};
  var Editor = {};
  var Main = {};

  var _config = {
    primaryColors: []
  };

  var _container, _isOpen = false;
  var _randomButtom = {};
  var _selectedValue = "";
  var round = function (n, d) {
    var m = d ? Math.pow(10, d) : 1;
    return Math.round(n * m) / m;
  };

  function _rgbToHex (r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  function _hexToRgb (hex) {

    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16)
    };

  }

  function _intToHex (int) {

    var hex = int.toString(16);
    while (hex.length < 6) {
      hex = "0" + hex;
    }
    return hex;

  }

  function _selectColor (target) {

    _randomButtom.classList.remove("cloudnote-editor-colorpicker__random-selected");
    var selected = _container.querySelector(".cloudnote-editor-colorpicker__color-selected");
    if (selected) {
      selected.classList.remove("cloudnote-editor-colorpicker__color-selected");
    }
    target.classList.add("cloudnote-editor-colorpicker__color-selected");
    _selectedValue = target.getAttribute("data-color");
    if (_isOpen) {
      _hide();
    }
    Editor.setTool({
      color: _selectedValue,
      randomColor: false
    });
  }

  function _selectRandom () {

    var selected = _container.querySelector(".cloudnote-editor-colorpicker__color-selected");
    if (selected) {
      selected.classList.remove("cloudnote-editor-colorpicker__color-selected");
    }
    _randomButtom.classList.add("cloudnote-editor-colorpicker__random-selected");
    _selectedValue = "random";
    if (_isOpen) {
      _hide();
    }
    Editor.setTool({
      color: "",
      randomColor: true
    });

  }

  function _show () {

    Utils.addGlobalStatus("cloudnote__EDITOR-COLORPICKER-OPEN");
    _isOpen = true;

  }

  function _hide () {

    Utils.removeGlobalStatus("cloudnote__EDITOR-COLORPICKER-OPEN");
    _isOpen = false;

  }

  function _onTouchStart (e) {

    if (e.type.indexOf("mouse") >= 0 && e.button > 0) return;
    var target = e.target;
    if (target.classList.contains("cloudnote-editor-colorpicker__color")) {
      if (target.classList.contains("cloudnote-editor-colorpicker__color-selected") === false) {
        _selectColor(target);
      }
    } else if (target.classList.contains("cloudnote-editor-colorpicker__random")) {
      if (_selectedValue !== "random") {
        _selectRandom();
      }
    } else if (target.classList.contains("cloudnote-editor-colorpicker__showhide")) {
      if (_isOpen) {
        _hide();
      } else {
        _show();
      }
    }

  }

  function _onRotate (e) {
    // do some stuff
  }

  function _initDom (moduleContainer) {

    var primaryColorNumber = Math.min(round((app.WIDTH - 250 * Param.pixelRatio) / (55 * Param.pixelRatio)), _config.primaryColors.length);
    var primaryColors = _config.primaryColors.splice(0, primaryColorNumber);

    var secondaryColors = [];
    var colorsNumber = Math.trunc(app.WIDTH / (64 * Param.pixelRatio)) * Math.trunc((app.HEIGHT - Param.headerSize - (75 * Param.pixelRatio)) / (64 * Param.pixelRatio)) - 1;
    var columnIntUnit = round(256 * 256 * 256 / colorsNumber);
    for (var i = 0; i < colorsNumber; i++) {
      secondaryColors.push("#" + _intToHex(columnIntUnit * i));
    }
    secondaryColors.push("#FFF");

    Main.loadTemplate("editorColorPicker", {
      primaryColors: primaryColors,
      secondaryColors: secondaryColors
    }, moduleContainer).then(function (templateDom) {
      debugger;
      _container = templateDom;
      _randomButtom = _container.querySelector(".cloudnote-editor-colorpicker__random");
      _container.addEventListener(Param.eventStart, _onTouchStart, true);

    });


    Main.addRotationHandler(_onRotate);

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
    init: init
  });

})(cloudnote);
