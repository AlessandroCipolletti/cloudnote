(function (app) {

  var _config = {

  };

  var _container, _isOpen = false;
  var _randomButtom = {};
  var _selectedValue = "";
  var _primaryColors = ["#000000", "#808080", "#C0C0C0", "#6DF4FF", "#007AFF", "#0000FF", "#800080", "#000080", "#FFFF00", "#00FF00", "#4CD900", "#A08066","#F06A31", "#008000", "#FF0000", "#A52A2A", "#800000"];
  var round = function (n, d) {
    var m = d ? app.math.pow(10, d) : 1;
    return app.math.round(n * m) / m;
  };

  function _selectColor (target) {

    _randomButtom.classList.remove("cloudnote-colorpicker__random-selected");
    var selected = _container.querySelector(".cloudnote-colorpicker__color-selected");
    if (selected) {
      selected.classList.remove("cloudnote-colorpicker__color-selected");
    }
    target.classList.add("cloudnote-colorpicker__color-selected");
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

    var selected = _container.querySelector(".cloudnote-colorpicker__color-selected");
    if (selected) {
      selected.classList.remove("cloudnote-colorpicker__color-selected");
    }
    _randomButtom.classList.add("cloudnote-colorpicker__random-selected");
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

    _container.classList.add("cloudnote-colorpicker__container-open");
    _isOpen = true;

  }

  function _hide () {

    _container.classList.remove("cloudnote-colorpicker__container-open");
    _isOpen = false;

  }

  function _onTouchStart (e) {

    if (e.target.classList.contains("cloudnote-colorpicker__color")) {
      if (e.target.classList.contains("cloudnote-colorpicker__color-selected") === false) {
        _selectColor(e.target);
      }
    } else if (e.target.classList.contains("cloudnote-colorpicker__random")) {
      if (_selectedValue !== "random") {
        _selectRandom();
      }
    } else if (e.target.classList.contains("cloudnote-colorpicker__showhide")) {
      if (_isOpen) {
        _hide();
      } else {
        _show();
      }
    }

  }

  var _getColorDom = (function () {

    var dom;

    return function (color) {

      dom = app.document.createElement("div");
      dom.classList.add("cloudnote-colorpicker__color");
      dom.setAttribute("data-color", color);
      dom.style.backgroundColor = color;
      return dom;

    };

  })();

  function _initColorPicker () {

    var frame = app.document.createDocumentFragment();

    var primaryContainer = app.document.createElement("div");
    primaryContainer.classList.add("cloudnote-colorpicker__primary");
    var secondaryContainer = app.document.createElement("div");
    secondaryContainer.classList.add("cloudnote-colorpicker__secondary");

    // init primary
    var buttonContainer = app.document.createElement("div");
    buttonContainer.classList.add("cloudnote-colorpicker__random-container");
    var button = app.document.createElement("div");
    _randomButtom = button;
    button.classList.add("cloudnote-colorpicker__random");
    button.classList.add("cloudnote-colorpicker__random-selected");
    buttonContainer.appendChild(button);
    primaryContainer.appendChild(buttonContainer);
    var primaryColorNumber = app.math.min(round((app.width - 500) / 110), _primaryColors.length);
    for (var i = 0; i < primaryColorNumber; i++) {
      primaryContainer.appendChild(_getColorDom(_primaryColors[i]));
    }
    buttonContainer = app.document.createElement("div");
    buttonContainer.classList.add("cloudnote-colorpicker__showhide-container");
    button = app.document.createElement("div");
    button.classList.add("cloudnote-colorpicker__showhide");
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
    _container.classList.add("cloudnote-colorpicker__container");
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
