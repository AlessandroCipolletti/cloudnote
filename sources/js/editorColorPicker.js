(function (app) {

  var _config = {
    primaryColors: []
  };

  var _container, _isOpen = false;
  var _randomButtom = {};
  var _selectedValue = "";
  var round = function (n, d) {
    var m = d ? app.math.pow(10, d) : 1;
    return app.math.round(n * m) / m;
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

      button = app.document.createElement("div");
      button.classList.add("cloudnote-editor-colorpicker__color");
      button.setAttribute("data-color", color);
      button.style.backgroundColor = color;
      return button;

    };

  })();

  function _initColorPicker () {

    var frame = app.document.createDocumentFragment();

    var primaryContainer = app.document.createElement("div");
    primaryContainer.classList.add("cloudnote-editor-colorpicker__primary");
    var secondaryContainer = app.document.createElement("div");
    secondaryContainer.classList.add("cloudnote-editor-colorpicker__secondary");

    // init primary
    var buttonContainer = app.document.createElement("div");
    buttonContainer.classList.add("cloudnote-editor-colorpicker__random-container");
    var button = app.document.createElement("div");
    _randomButtom = button;
    button.classList.add("cloudnote-editor-colorpicker__random");
    button.classList.add("cloudnote-editor-colorpicker__random-selected");
    buttonContainer.appendChild(button);
    primaryContainer.appendChild(buttonContainer);
    var primaryColorNumber = app.math.min(round((app.width - 500) / 110), _config.primaryColors.length);
    for (var i = 0; i < primaryColorNumber; i++) {
      primaryContainer.appendChild(_getColorButton(_config.primaryColors[i]));
    }
    buttonContainer = app.document.createElement("div");
    buttonContainer.classList.add("cloudnote-editor-colorpicker__showhide-container");
    button = app.document.createElement("div");
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

    _container = app.document.createElement("div");
    _container.classList.add("cloudnote-editor-colorpicker__container");
    _container.addEventListener(app.Param.eventStart, _onTouchStart, true);
    app.Param.container.appendChild(_container);
    app.Main.addRotationHandler(_onRotate);

  }

  function _setConfig (params) {

    var key;
    for (key in params) {
      if (typeof (_config[key]) !== "undefined") {
        _config[key] = params[key];
      }
    }

  }

  function init (params) {

    _setConfig(params);
    _initDom();
    _initColorPicker();

  }

  app.Editor.ColorPicker = {
    init: init
  };

})(cloudnote);
