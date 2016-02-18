(function (app) {

  var _config = {

  };

  var _container, _isOpen = false;
  var _randomButtom = {};
  var _selectedValue = "";

  function _selectColor (target) {

    _randomButtom.classList.remove("cloudnote-colorpicker__random-selected");
    _container.querySelector("cloudnote-colorpicker__color-selected").classList.remove("cloudnote-colorpicker__color-selected");
    target.classList.add("cloudnote-colorpicker__color-selected");
    _selectedValue = target.getAttribute("data-color");
    app.Editor.setTool({
      color: _selectedValue,
      randomColor: false
    });
  }

  function _selectRandom () {

    _container.querySelector("cloudnote-colorpicker__color-selected").classList.remove("cloudnote-colorpicker__color-selected");
    _randomButtom.classList.add("cloudnote-colorpicker__random-selected");
    _selectedValue = "random";
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
    } else if (e.target.classList.contains("cloudnote-colorpicker__open")) {
      if (_isOpen) {
        _hide();
      } else {
        _open();
      }
    }

  }

  function _initColorPicker () {

    var frame = app.document.createDocumentFragment();
    // crea e aggiungi tutti i pallini coi Colori
    // e i pulsanti per random e + colori
    var primaryContainer = app.document.createElement("div");
    primaryContainer.classList.add("cloudnote-colorpicker__primary");
    var secondaryContainer = app.document.createElement("div");
    secondaryContainer.classList.add("cloudnote-colorpicker__secondary");

    // quando è chiuso piccolo in basso --> una sola riga coi colori primari
    // quando si apre a tutto schermo --> tutti i colori in ordine di croma
    _container.appendChild(frame);

  }

  function _onRotate (e) {
    // do some stuff
  }

  function _initDom () {

    _container = app.document.createElement("div");
    _container.classList.add("cloudnote-colorpicker__container");
    _container.addEventListener(app.Param.eventStart, _onTouchStart, true); // TODO da verificare true o false
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

  app.ColorPicker = {
    init: init
  };

})(cloudnote);
