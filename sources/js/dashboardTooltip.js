(function (app) {

  // Dependencies
  var Param = {};
  var Utils = {};
  var Main = {};
  var User = {};

  var _config = {
    tooltipSide: "right"
  };

  var _container = {}, _overlay = {}, _tooltip = {}, _previewImage = new Image();
  var _likeButton = {}, _commentText = {}, _userImage = {}, _userName = {}, _drawPosition = {};
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
      _userImage.style.backgroundImage = "url('https://graph.facebook.com/" + User.getUserInfo().fb.id + "/picture?type=large')";
      //_userName.innerHTML = draw.user.name;
      _userName.innerHTML = User.getUserInfo().name;

      _likeText.innerHTML = "123 Likes";
      _likeButton.src = "img/icons/likeOn.png";
      _commentText.innerHTML = "<p>23 Comments</p>";
      _drawPosition.innerHTML = "<p>30 rue Monge, Paris</p>";

      /*
      _title.innerHTML = "Titolo Disegno";
      _location.innerHTML = "Paris, France";
      */

      Utils.fadeInElements(_overlay);
      _tooltip.classList.add("cloudnote-dashboard-tooltip__panel-visible");

    }

  }

  function hide () {

    _selectedId = 0;
    Utils.fadeOutElements(_overlay);
    _tooltip.classList.remove("cloudnote-dashboard-tooltip__panel-visible");

  }

  function _onRotate (e) {
    // do some stuff
  }

  function _initDom (container) {

    if (_config.tooltipSide === "right") {
      Utils.addGlobalStatus("cloudnote__DASHBOARD-TOOLTIP-RIGHT");
    } else {
      Utils.addGlobalStatus("cloudnote__DASHBOARD-TOOLTIP-LEFT");
    }

    _overlay = Utils.createDom("cloudnote-dashboard-tooltip__overlay", "displayNone", "fadeOut");
    _overlay.addEventListener(Param.eventStart, hide);
    var close = Utils.createDom("cloudnote-dashboard-tooltip__close");
    _overlay.appendChild(close);
    _tooltip = Utils.createDom("cloudnote-dashboard-tooltip__panel");

    var previewCont = Utils.createDom("cloudnote-dashboard-tooltip__preview-container");
    _previewImage.classList.add("cloudnote-dashboard-tooltip__preview");
    previewCont.appendChild(_previewImage);
    _tooltip.appendChild(previewCont);

    var infoCont = Utils.createDom("cloudnote-dashboard-tooltip__info-container");
    var infoBg = Utils.createDom("cloudnote-dashboard-tooltip__info-background");
    var infoBoxDraw = Utils.createDom("cloudnote-dashboard-tooltip__info-box", "cloudnote-dashboard-tooltip__info-box-draw");
    var infoBoxUser = Utils.createDom("cloudnote-dashboard-tooltip__info-box", "cloudnote-dashboard-tooltip__info-box-user");
    var infoBoxRelated = Utils.createDom("cloudnote-dashboard-tooltip__info-box", "cloudnote-dashboard-tooltip__info-box-related");

    var drawLike = Utils.createDom("cloudnote-dashboard-tooltip__info-like");
    _likeButton = document.createElement("img");
    _likeButton.classList.add("cloudnote-dashboard-tooltip__info-like-button");
    _likeButton.addEventListener(Param.eventStart, _onLikeClick);
    _likeText = Utils.createDom("cloudnote-dashboard-tooltip__info-like-text");
    drawLike.appendChild(_likeButton);
    drawLike.appendChild(_likeText);
    var drawComment = Utils.createDom("cloudnote-dashboard-tooltip__info-comment");
    drawComment.addEventListener(Param.eventStart, _onCommentClick);
    var commentIcon = document.createElement("img");
    commentIcon.src = "img/icons/comments.png";
    _commentText = document.createElement("p");
    drawComment.appendChild(commentIcon);
    drawComment.appendChild(_commentText);
    var drawShare = Utils.createDom("cloudnote-dashboard-tooltip__info-share");
    drawShare.innerHTML = "<img src='img/icons/share.png'><p>Share</p>";
    drawShare.addEventListener(Param.eventStart, _onShareClick);
    infoBoxDraw.appendChild(drawLike);
    infoBoxDraw.appendChild(drawComment);
    infoBoxDraw.appendChild(drawShare);

    var drawUser = Utils.createDom("cloudnote-dashboard-tooltip__info-user");
    _userImage = Utils.createDom("cloudnote-dashboard-tooltip__info-user-image");
    _userName = Utils.createDom("cloudnote-dashboard-tooltip__info-user-name");
    var followButton = Utils.createDom("cloudnote-dashboard-tooltip__info-user-follow");
    followButton.addEventListener(Param.eventStart, _onFollowClick);
    drawUser.appendChild(_userImage);
    drawUser.appendChild(_userName);
    drawUser.appendChild(followButton);
    _drawPosition = Utils.createDom("cloudnote-dashboard-tooltip__info-position");
    _drawPosition.addEventListener(Param.eventStart, _onPositionClick);
    var drawBoutique = Utils.createDom("cloudnote-dashboard-tooltip__info-boutique");
    drawBoutique.addEventListener(Param.eventStart, _onBoutiqueClick);
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
    Main.addRotationHandler(_onRotate);

    //var promise = w.Main.templateManager.load(w.Param.pathTemplate + 'pagination.html', container, _paginations[type]);

  }

  function init (params, container) {

    Param = app.Param;
    Utils = app.Utils;
    Main = app.Main;
    User = app.User;
    _config = Utils.setConfig(params, _config);
    _initDom(container);

  }

  app.module("Dashboard.Tooltip", {
    init: init,
    show: show,
    hide: hide
  });

})(cloudnote);
