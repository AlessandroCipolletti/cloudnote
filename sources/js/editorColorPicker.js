(function (app) {

  // Dependencies
  var Param = {};
  var Utils = {};
  var Editor = {};
  var Main = {};

  var _config = {
    primaryColors: [],
    secondaryColors: false
  };

  var _container, _isOpen = false;
  var _randomButtom = {};
  var _selectedValue = "random";
  var round = function (n, d) {
    var m = d ? Math.pow(10, d) : 1;
    return Math.round(n * m) / m;
  };

  function _selectColor (target) {

    _randomButtom.classList.remove("drawith-editor-colorpicker__random-selected");
    _randomButtom.classList.remove("drawith-editor-colorpicker__random-locked");
    var selected = _container.querySelector(".drawith-editor-colorpicker__color-selected");
    if (selected) {
      selected.classList.remove("drawith-editor-colorpicker__color-selected");
    }
    target.classList.add("drawith-editor-colorpicker__color-selected");
    _selectedValue = target.getAttribute("data-color");
    if (_isOpen) {
      _hide();
    }
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
    if (_isOpen) {
      _hide();
    }
    Editor.setTool({
      color: "",
      randomColor: (last ? "last" : true)
    });

  }

  function _show () {

    Utils.addGlobalStatus("drawith__EDITOR-COLORPICKER-OPEN");
    _isOpen = true;

  }

  function _hide () {

    Utils.removeGlobalStatus("drawith__EDITOR-COLORPICKER-OPEN");
    _isOpen = false;

  }

  function _onTouchStart (e) {

    e.preventDefault();
    if (e.type.indexOf("mouse") >= 0 && e.button > 0) return;
    var target = e.target;
    if (target.classList.contains("drawith-editor-colorpicker__color")) {
      if (target.classList.contains("drawith-editor-colorpicker__color-selected") === false) {
        _selectColor(target);
      }
    } else if (target.classList.contains("drawith-editor-colorpicker__random")) {
      _selectRandom(_selectedValue === "random");
    } else if (target.classList.contains("drawith-editor-colorpicker__showhide")) {
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

    var primaryColorNumber = Math.min(round((app.WIDTH - 55 * Param.pixelRatio) / (30 * Param.pixelRatio)), _config.primaryColors.length);
    var primaryColors = _config.primaryColors.splice(0, primaryColorNumber);

    var secondaryColors = false;
    if (_config.secondaryColors) {
      secondaryColors = [];
      var colorsNumber = Math.trunc(app.WIDTH / (64 * Param.pixelRatio)) *
        Math.trunc((app.HEIGHT - Param.headerSize - (75 * Param.pixelRatio)) / (64 * Param.pixelRatio)) - 1;
      var columnIntUnit = round(256 * 256 * 256 / colorsNumber);
      for (var i = 0; i < colorsNumber; i++) {
        secondaryColors.push("#" + Utils.intToHex(columnIntUnit * i));
      }
      secondaryColors.push("#FFF");
    }

    Main.loadTemplate("editorColorPicker", {
      primaryColors: primaryColors,
      secondaryColors: secondaryColors
    }, moduleContainer, function (templateDom) {

      _container = templateDom;
      _randomButtom = _container.querySelector(".drawith-editor-colorpicker__random");
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

})(drawith);
