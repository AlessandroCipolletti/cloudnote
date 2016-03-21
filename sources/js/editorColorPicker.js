(function (app) {

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
    app.Editor.setTool({
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
    app.Editor.setTool({
      color: "",
      randomColor: true
    });

  }

  function _show () {

    app.Utils.addGlobalStatus("cloudnote__EDITOR-COLORPICKER-OPEN");
    _isOpen = true;

  }

  function _hide () {

    app.Utils.removeGlobalStatus("cloudnote__EDITOR-COLORPICKER-OPEN");
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
    for (var i = 0; i < primaryColorNumber; i++) {
      primaryContainer.appendChild(_getColorButton(_config.primaryColors[i]));
    }
    buttonContainer = document.createElement("div");
    buttonContainer.classList.add("cloudnote-editor-colorpicker__showhide-container");
    button = document.createElement("div");
    button.classList.add("cloudnote-editor-colorpicker__showhide");
    buttonContainer.appendChild(button);
    primaryContainer.appendChild(buttonContainer);
    // TODO init secondary



    frame.appendChild(primaryContainer);
    frame.appendChild(secondaryContainer);
    _container.appendChild(frame);

  }

  function _onRotate (e) {
    // do some stuff
  }

  function _initDom () {

    _container = app.Utils.createDom("cloudnote-editor-colorpicker__container");
    _container.addEventListener(app.Param.eventStart, _onTouchStart, true);
    app.Editor.addSubmoduleDom(_container);
    app.Main.addRotationHandler(_onRotate);

  }

  function init (params) {

    _config = app.Utils.setConfig(params, _config);
    _initDom();
    _initColorPicker();

  }

  app.module("Editor.ColorPicker", {
    init: init
  });

})(cloudnote);
