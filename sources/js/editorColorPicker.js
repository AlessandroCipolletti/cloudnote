(function (app) {

  // Dependencies
  var Param = {};
  var Utils = {};
  var Editor = {};
  var Main = {};

  var _config = {
    primaryColors: [],
    colorsNumberWidth: 0,
    colorsNumberHeight: 0
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

  var _getColorButton = (function () {

    var button;

    return function (color) {

      button = document.createElement("div");
      button.classList.add("cloudnote-editor-colorpicker__color");
      button.setAttribute("data-color", color);
      button.style.backgroundColor = color;
      return button;

    };

  })();

  function _initColorPicker () {

    var frame = document.createDocumentFragment();
    var i = 0, hex;

    var primaryContainer = document.createElement("div");
    primaryContainer.classList.add("cloudnote-editor-colorpicker__primary");
    var secondaryContainer = document.createElement("div");
    secondaryContainer.classList.add("cloudnote-editor-colorpicker__secondary");

    // init primary
    var buttonContainer = document.createElement("div");
    buttonContainer.classList.add("cloudnote-editor-colorpicker__random-container");
    var button = document.createElement("div");
    _randomButtom = button;
    button.classList.add("cloudnote-editor-colorpicker__random");
    button.classList.add("cloudnote-editor-colorpicker__random-selected");
    buttonContainer.appendChild(button);
    primaryContainer.appendChild(buttonContainer);
    var primaryColorNumber = Math.min(round((app.WIDTH - 500) / 110), _config.primaryColors.length);
    for (i = 0; i < primaryColorNumber; i++) {
      primaryContainer.appendChild(_getColorButton(_config.primaryColors[i]));
    }
    buttonContainer = document.createElement("div");
    buttonContainer.classList.add("cloudnote-editor-colorpicker__showhide-container");
    button = document.createElement("div");
    button.classList.add("cloudnote-editor-colorpicker__showhide");
    buttonContainer.appendChild(button);
    primaryContainer.appendChild(buttonContainer);

    // TODO init secondary
    debugger;
    var colorsColumns = (app.WIDTH > app.HEIGHT ? _config.colorsNumberWidth : _config.colorsNumberHeight);
    var colorsRows = (app.WIDTH > app.HEIGHT ? _config.colorsNumberHeight : _config.colorsNumberWidth);
    var maxInt = 256 * 256 * 256;
    var columnIntUnit = round(maxInt / colorsColumns);
    var columnBaseInt, columnBaseHex, columnBaseRgb;
    for (i = 1; i <= colorsColumns; i++) {

      columnBaseInt = columnIntUnit * i;
      columnBaseHex = _intToHex(columnBaseInt);
      columnBaseRgb = _hexToRgb(columnBaseHex);
      secondaryContainer.appendChild(_getColorButton("#" + columnBaseHex));
      console.log("primo: #" + columnBaseHex);

      for (var j = colorsRows; j > 0; j--) {

        hex = _rgbToHex(
          round(j * columnBaseRgb.r / colorsRows),
          round(j * columnBaseRgb.g / colorsRows),
          round(j * columnBaseRgb.b / colorsRows)
        );
        //console.log("secondo: " + hex);
        secondaryContainer.appendChild(
          _getColorButton(hex)
        );
      }

    }



    frame.appendChild(primaryContainer);
    frame.appendChild(secondaryContainer);
    _container.appendChild(frame);

  }

  function _onRotate (e) {
    // do some stuff
  }

  function _initDom () {

    _container = Utils.createDom("cloudnote-editor-colorpicker__container");
    _container.addEventListener(Param.eventStart, _onTouchStart, true);
    Editor.addSubmoduleDom(_container);
    Main.addRotationHandler(_onRotate);

  }

  function init (params) {

    Param = app.Param;
    Utils = app.Utils;
    Main = app.Main;
    Editor = app.Editor;
    _config = Utils.setConfig(params, _config);
    _initDom();
    _initColorPicker();

  }

  app.module("Editor.ColorPicker", {
    init: init
  });

})(cloudnote);
