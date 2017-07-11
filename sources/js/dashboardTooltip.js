/*
  Documentations:

*/
(function (app) {
  "use strict";
  // Dependencies
  var Param = {};
  var Utils = {};
  var Main = {};
  var User = {};

  var _config = {
    tooltipSide: "right"
  };

  var _container = {}, _overlay = {}, _tooltip = {}, _previewImage = new Image();
  var _likeButton = {}, _commentText = {}, _likeText = {}, _userImage = {}, _userName = {}, _drawPosition = {};
  var _selectedId = 0;

  function _onLikeClick () {
    console.log("like");
  }

  function _onCommentClick () {
    console.log("comment");
  }

  function _onShareClick () {
    console.log("share");
  }

  function _onUserClick () {
    console.log("user");
  }

  function _onFollowClick () {
    console.log("follow");
  }

  function _onPositionClick () {
    console.log("position");
  }

  function _onBoutiqueClick () {
    console.log("boutique");
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
      _tooltip.classList.add("drawith-dashboard-tooltip__panel-visible");

    }

  }

  function hide () {

    _selectedId = 0;
    Utils.fadeOutElements(_overlay);
    _tooltip.classList.remove("drawith-dashboard-tooltip__panel-visible");

  }

  function _onRotate (e) {
    // do some stuff
  }

  function _initDom (moduleContainer) {

    if (_config.tooltipSide === "right") {
      Utils.addGlobalStatus("drawith__DASHBOARD-TOOLTIP-RIGHT");
    } else {
      Utils.addGlobalStatus("drawith__DASHBOARD-TOOLTIP-LEFT");
    }

    Main.loadTemplate("dashboardTooltip", {
      labelShare: "Share"
    }, moduleContainer, function (templateDom) {

      _overlay = document.querySelector(".drawith-dashboard-tooltip__overlay");
      _tooltip = document.querySelector(".drawith-dashboard-tooltip__panel");
      _previewImage = document.querySelector(".drawith-dashboard-tooltip__preview");
      _likeButton = document.querySelector(".drawith-dashboard-tooltip__info-like-button");
      _likeText = document.querySelector(".drawith-dashboard-tooltip__info-like-text");
      _commentText = document.querySelector(".drawith-dashboard-tooltip__info-comment-text");
      _userImage = document.querySelector(".drawith-dashboard-tooltip__info-user-image");
      _userName = document.querySelector(".drawith-dashboard-tooltip__info-user-name");
      _drawPosition = document.querySelector(".drawith-dashboard-tooltip__info-position");
      document.querySelector(".drawith-dashboard-tooltip__info-boutique").addEventListener(Param.eventStart, _onBoutiqueClick);
      document.querySelector(".drawith-dashboard-tooltip__info-comment").addEventListener(Param.eventStart, _onCommentClick);
      document.querySelector(".drawith-dashboard-tooltip__info-share").addEventListener(Param.eventStart, _onShareClick);
      document.querySelector(".drawith-dashboard-tooltip__info-user-follow").addEventListener(Param.eventStart, _onFollowClick);
      _overlay.addEventListener(Param.eventStart, hide);
      _likeButton.addEventListener(Param.eventStart, _onLikeClick);
      _drawPosition.addEventListener(Param.eventStart, _onPositionClick);
      _userImage.addEventListener(Param.eventStart, _onUserClick);
      _userName.addEventListener(Param.eventStart, _onUserClick);

    });

    Main.addRotationHandler(_onRotate);

  }

  function init (params, moduleContainer) {

    Param = app.Param;
    Utils = app.Utils;
    Main = app.Main;
    User = app.User;
    _config = Utils.setConfig(params, _config);
    _initDom(moduleContainer);

  }

  app.module("Dashboard.Tooltip", {
    init: init,
    show: show,
    hide: hide
  });

})(APP);
