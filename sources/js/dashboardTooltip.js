(function (app) {

  var _config = {
    tooltipSide: "right"
  };

  var _container = {}, _overlay = {}, _tooltip = {}, _previewImage = new Image();
  var _selectedId = 0;

  function show (draw) {

    if (draw) {

      _selectedId = draw.id;

      _previewImage.src = draw.data.getAttributeNS("http://www.w3.org/1999/xlink", "href");

      /*
      _title.innerHTML = "Titolo Disegno";
      _userName.innerHTML = draw.user.name;
      _userImage.style.backgroundImage = "url('https://graph.facebook.com/" + draw.user.fb.id + "/picture?type=large')";
      _location.innerHTML = "Paris, France";
      _likeTot.innerHTML = "421 Mi Piace";
      _commentsTot.innerHTML = "32 Commenti";
      _shareTot.innerHTML = "23 Condivisioni";
      */

      app.Utils.fadeInElements(_overlay);
      _tooltip.classList.add("cloudnote-dashboard-tooltip__panel-visible");

    }

  }

  function _hide () {

    _selectedId = 0;
    app.Utils.fadeOutElements(_overlay);
    _tooltip.classList.remove("cloudnote-dashboard-tooltip__panel-visible");

  }

  function _onRotate (e) {
    // do some stuff
  }

  function _initDom (container) {

    if (_config.tooltipSide === "right") {
      app.Utils.addGlobalStatus("cloudnote__DASHBOARD-TOOLTIP-RIGHT");
    } else {
      app.Utils.addGlobalStatus("cloudnote__DASHBOARD-TOOLTIP-LEFT");
    }

    _overlay = app.Utils.createDom("cloudnote-dashboard-tooltip__overlay", "displayNone", "fadeOut");
    _overlay.addEventListener(app.Param.eventStart, _hide);
    var close = app.Utils.createDom("cloudnote-dashboard-tooltip__close");
    _overlay.appendChild(close);
    _tooltip = app.Utils.createDom("cloudnote-dashboard-tooltip__panel");

    var previewCont = app.Utils.createDom("cloudnote-dashboard-tooltip__preview-container");
    _previewImage.classList.add("cloudnote-dashboard-tooltip__preview");
    previewCont.appendChild(_previewImage);
    _tooltip.appendChild(previewCont);

    var infoCont = app.Utils.createDom("cloudnote-dashboard-tooltip__info-container");
    var infoBg = app.Utils.createDom("cloudnote-dashboard-tooltip__info-background");
    var infoBoxDraw = app.Utils.createDom("cloudnote-dashboard-tooltip__info-box", "cloudnote-dashboard-tooltip__info-box-draw");
    var infoBoxUser = app.Utils.createDom("cloudnote-dashboard-tooltip__info-box", "cloudnote-dashboard-tooltip__info-box-user");
    var infoBoxRelated = app.Utils.createDom("cloudnote-dashboard-tooltip__info-box", "cloudnote-dashboard-tooltip__info-box-related");

    infoCont.appendChild(infoBg);
    infoCont.appendChild(infoBoxDraw);
    infoCont.appendChild(infoBoxUser);
    infoCont.appendChild(infoBoxRelated);
    _tooltip.appendChild(infoCont);

    container.appendChild(_overlay);
    container.appendChild(_tooltip);
    app.Main.addRotationHandler(_onRotate);

    //var promise = w.Main.templateManager.load(w.Param.pathTemplate + 'pagination.html', container, _paginations[type]);

  }

  function init (params, container) {

    _config = app.Utils.setConfig(params, _config);
    _initDom(container);

  }

  app.Dashboard.Tooltip = {
    init: init,
    show: show
  };

})(cloudnote);
