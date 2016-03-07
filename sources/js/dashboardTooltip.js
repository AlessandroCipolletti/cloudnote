(function (app) {

  var _config = {
    tooltipSide: "right"
  };

  var _container = {}, _overlay = {}, _tooltip = {}, _previewImage = new Image();
  var _likeButton = {};
  var _selectedId = 0;

  function _onLikeClick () {

  }

  function _onCommentClick () {

  }

  function _onShareClick () {

  }

  function _onUserClick () {

  }

  function _onFollowClick () {

  }

  function _onPositionClick () {

  }

  function _onBoutiqueClick () {

  }
  
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

    var drawLike = app.Utils.createDom("cloudnote-dashboard-tooltip__info-like");
    _likeButton = new Image();
    _likeButton.classList("cloudnote-dashboard-tooltip__info-like-button");
    _likeButton.addEventListener(app.Param.eventStart, _onLikeClick);
    _likeText = app.Utils.createDom("cloudnote-dashboard-tooltip__info-like-text");
    drawLike.appendChild(_likeButton);
    drawLike.appendChild(_likeText);
    var drawComment = app.Utils.createDom("cloudnote-dashboard-tooltip__info-comment");
    drawComment.addEventListener(app.Param.eventStart, _onCommentClick);
    var drawShare = app.Utils.createDom("cloudnote-dashboard-tooltip__info-share");
    drawShare.addEventListener(app.Param.eventStart, _onShareClick);
    infoBoxDraw.appendChild(drawLike);
    infoBoxDraw.appendChild(drawComment);
    infoBoxDraw.appendChild(drawShare);

    var drawUser = app.Utils.createDom("cloudnote-dashboard-tooltip__info-user");
    var drawPosition = app.Utils.createDom("cloudnote-dashboard-tooltip__info-position");
    var drawBoutique = app.Utils.createDom("cloudnote-dashboard-tooltip__info-boutique");
    infoBoxUser.appendChild(drawUser);
    infoBoxUser.appendChild(drawPosition);
    infoBoxUser.appendChild(drawBoutique);

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
