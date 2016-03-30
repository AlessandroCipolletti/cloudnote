(function (app) {

  // Dependencies
  var Param = {};
  var Utils = {};
  var Main = {};
  var Socket = {};
  var Header = {};

  var _config = {
    fbAppId: "",
    fbApiVersion: ""
  };

  var _loginPanel = {}, _headerUserButton = {}, _facebookLoginButton = {};
  var _userInfo = {};

  var _facebook = (function () {

    function _getUserInfo () {

      FB.api("/me", function (response) {
        console.log("User Info: ", response);
        // TODO qui devo cercare con le api di fb le altre info che voglio salvare, tipo l'immagine di profilo
        //graph.facebook.com/{{fid}}/picture?type=large
        _doLogin("fb", response);
      });

    }

    function _loginCallback (response) {

      console.log("Login", response);
      if (response.status === "connected") {
        _getUserInfo();
      }

    }

    function testLogin () {

      if (Param.isDebug) {
        _doLogin("fb", {
          email: "cipolletti.alessandro@gmail.com",
          first_name: "Alessandro",
          gender: "male",
          id: "884481848254624",
          last_name: "Cippo",
          link: "https://www.facebook.com/app_scoped_user_id/884481848254624/",
          locale: "it_IT",
          name: "Alessandro Cippo",
          timezone: 1
        });
      } else {
        FB.login(_loginCallback, { scope: "public_profile,email" });
      }

    }

    function init () {

      window.fbAsyncInit = function () {
        FB.init({
          appId: _config.fbAppId,
          cookie: true,  // enable cookies to allow the server to access the session
          xfbml: true,  // parse social plugins on this page
          version: _config.fbApiVersion
        });
        FB.getLoginStatus(_loginCallback);
      };

      (function (d, s, id) {// Load the SDK asynchronously
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
      }(document, "script", "facebook-jssdk"));

      _facebookLoginButton.addEventListener(Param.eventStart, testLogin);
      testLogin();

    }

    return {
      init: init,
      testLogin: testLogin
    };

  })();

  function _doLogin (mode, data) {

    _userInfo.mode = mode;
    _userInfo[mode] = data;

    if (mode === "fb") {

      delete data.updated_time;
      delete data.verified;
      _userInfo.name = data.name;
			_userInfo.email = data.email;
			_userInfo.locale = data.locale;
      _headerUserButton.style.backgroundImage = "url('http://graph.facebook.com/" + data.id + "/picture?type=large')";

    }

    if (Param.isDebug) {
      onSocketLogin(JSON.stringify({
        id: "5584332c21b3985708c33bf7"
      }));
    } else {
      Socket.emit("user login", _userInfo);
    }

  }

  function onSocketLogin (data) {

    var user = JSON.parse(data);
    if (user.id) {
      if (user.new) {	// TODO: gli chiedo altre info in fase di registrazione, tipo nome d'arte

      }
      _userInfo.id = user.id;
    } else {

    }
    _hideLogin();
    Utils.addGlobalStatus("cloudnode__USER-LOGGED");

  }

  function _showLogin () {
    Utils.fadeInElements(_loginPanel);
  }

  function _hideLogin (e) {

    if (e) {
      e.preventDefault();
    }
    Utils.fadeOutElements(_loginPanel);

  }

  function _headerButtonClick (e) {

    if (_userInfo.id) {

    } else {
      _showLogin();
    }

  }

  function getUserInfo () {
    return _userInfo;
  }

  function _onRotate (e) {
    // do some stuff
  }

  function _initDom () {

    _headerUserButton = Utils.createDom("cloudnote-user__header-button");
    _headerUserButton.addEventListener(Param.eventStart, _headerButtonClick);
    Header.addButton(_headerUserButton, "right");

    Main.loadTemplate("user", {}, Param.container, function (templateDom) {

      _loginPanel = templateDom;
      _facebookLoginButton = templateDom.querySelector(".cloudnote-user__login-panel-facebook");
      templateDom.querySelector(".cloudnote-user__login-panel-overlay").addEventListener(Param.eventStart, _hideLogin);
      Main.addRotationHandler(_onRotate);
      _facebook.init();

    });

  }

  function init (params) {

    Param = app.Param;
    Utils = app.Utils;
    Main = app.Main;
    Socket = app.Socket;
    Header = app.Header;

    _config = Utils.setConfig(params, _config);
    _initDom();

  }

  app.module("User", {
    init: init,
    onSocketLogin: onSocketLogin,
    getUserInfo: getUserInfo
  });

})(cloudnote);
