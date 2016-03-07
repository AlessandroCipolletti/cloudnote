(function (app) {

  var _config = {
    tooltipSide: "right"
  };

  var _container = {}, _overlay = {}, _tooltip = {}, _previewImage = new Image();
  var _likeButton = {}, _drawComment = {}, _userImage = {}, _userName = {}, _drawPosition = {};
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

      //_userImage.style.backgroundImage = "url('https://graph.facebook.com/" + draw.user.fb.id + "/picture?type=large')";
      _userImage.style.backgroundImage = "url('https://graph.facebook.com/" + app.User.getUserInfo().fb.id + "/picture?type=large')";
      //_userName.innerHTML = draw.user.name;
      _userName.innerHTML = app.User.getUserInfo().name;

      _likeText.innerHTML = "123 Likes";
      _likeButton.src = "img/icons/likeOn.png";
      _drawComment.innerHTML = "<p>23 Comments</p>";
      _drawPosition.innerHTML = "<p>30 rue Monge, Paris</p>";

      /*
      _title.innerHTML = "Titolo Disegno";
      _location.innerHTML = "Paris, France";
      */

      app.Utils.fadeInElements(_overlay);
      _tooltip.classList.add("cloudnote-dashboard-tooltip__panel-visible");

    }

  }

  function hide () {

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
    _overlay.addEventListener(app.Param.eventStart, hide);
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
    _likeButton = document.createElement("img");
    _likeButton.classList.add("cloudnote-dashboard-tooltip__info-like-button");
    _likeButton.addEventListener(app.Param.eventStart, _onLikeClick);
    _likeText = app.Utils.createDom("cloudnote-dashboard-tooltip__info-like-text");
    drawLike.appendChild(_likeButton);
    drawLike.appendChild(_likeText);
    _drawComment = app.Utils.createDom("cloudnote-dashboard-tooltip__info-comment");
    _drawComment.addEventListener(app.Param.eventStart, _onCommentClick);
    var drawShare = app.Utils.createDom("cloudnote-dashboard-tooltip__info-share");
    drawShare.innerHTML = "<p>Share</p>";
    drawShare.addEventListener(app.Param.eventStart, _onShareClick);
    infoBoxDraw.appendChild(drawLike);
    infoBoxDraw.appendChild(_drawComment);
    infoBoxDraw.appendChild(drawShare);

    var drawUser = app.Utils.createDom("cloudnote-dashboard-tooltip__info-user");
    _userImage = app.Utils.createDom("cloudnote-dashboard-tooltip__info-user-image");
    _userName = app.Utils.createDom("cloudnote-dashboard-tooltip__info-user-name");
    var followButton = app.Utils.createDom("cloudnote-dashboard-tooltip__info-user-follow");
    followButton.addEventListener(app.Param.eventStart, _onFollowClick);
    drawUser.appendChild(_userImage);
    drawUser.appendChild(_userName);
    drawUser.appendChild(followButton);
    _drawPosition = app.Utils.createDom("cloudnote-dashboard-tooltip__info-position");
    _drawPosition.addEventListener(app.Param.eventStart, _onPositionClick);
    var drawBoutique = app.Utils.createDom("cloudnote-dashboard-tooltip__info-boutique");
    drawBoutique.addEventListener(app.Param.eventStart, _onBoutiqueClick);
    infoBoxUser.appendChild(drawUser);
    infoBoxUser.appendChild(_drawPosition);
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
    show: show,
    hide: hide
  };

})(cloudnote);
