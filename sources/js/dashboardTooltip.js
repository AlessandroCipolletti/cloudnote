(function (app) {

  var _config = {
    tooltipSide: "right"
  };

  var _container = {}, _overlay = {}, _tooltip = {}, _previewImage = new Image();
  var _selectedId = 0;

  function _onRotate (e) {
    // do some stuff
  }

  function _initDom () {

    _container = app.Utils.createDom("cloudnote-dashboard-tooltip__container");
    _overlay = app.Utils.createDom("cloudnote-dashboard-tooltip__overlay", "displayNone", "fadeOut");
    _tooltip = app.Utils.createDom("cloudnote-dashboard-tooltip__panel");

    _previewImage.classList.add("cloudnote-dashboard-tooltip__preview");
    _tooltip.appendChild(_previewImage);

    _container.appendChild(_overlay);
    _container.appendChild(_tooltip);
    app.Param.container.appendChild(_container);
    app.Main.addRotationHandler(_onRotate);

  }

  function show (draw) {

    if (draw) {

      _selectedId = draw.id;

      _previewImage.src = draw.data.getAttributeNS("http://www.w3.org/1999/xlink", "href");

      app.Utils.fadeInElements(_overlay);
      _tooltip.classList.add("cloudnote-dashboard-tooltip__panel-visible");

    }

  }

  function _hide () {

    _selectedId = 0;
    _previewImage.src = "";
    app.Utils.fadeOutElements(_overlay);
    _tooltip.classList.remove("cloudnote-dashboard-tooltip__panel-visible");

  }

  function init (params) {

    _config = app.Utils.setConfig(params, _config);
    _initDom();

  }
  
  app.Dashboard.Tooltip = {
    init: init,
    show: show
  };

})(cloudnote);
