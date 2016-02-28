(function (app) {

  var _config = {
    fbAppId: "",
    fbApiVersion: ""
  };

  var _loginPanel = {}, _headerUserButton = {}, _facebookLoginButton = {};
  var _userInfo = {};

  var _facebook = (function () {

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

      _facebookLoginButton.addEventListener(app.Param.eventStart, function () {

        if (app.Param.isDebug) {
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

      });

    }

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
      _status.innerHTML = "";
      if (response.status === "connected") {
        _getUserInfo();
      }

    }

    return {
      init: init
    };

  })();

  function _doLogin (mode, data) {

    _userInfo.mode = mode;
    if (mode === "fb") {

      delete data.updated_time;
      delete data.verified;
      _userInfo.name = data.name;
			_userInfo.email = data.email;
			_userInfo.locale = data.locale;
      _headerUserButton.style.backgroundImage = "url('http://graph.facebook.com/" + data.id + "/picture?type=large')";

    }

    if (app.Param.isDebug) {
      onSocketLogin(JSON.stringify({
        id: data.id
      }));
    } else {
      app.Socket.emit("user login", _userInfo);
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
    app.Utils.addGlobalStatus("cloudnode__USER-LOGGED");

  }

  function _showLogin () {
    app.Utils.fadeInElements(_loginPanel);
  }

  function _hideLogin (e) {
    e && e.preventDefault();
    app.Utils.fadeOutElements(_loginPanel);
  }

  function _headerButtonClick (e) {

    if (_userInfo.id) {

    } else {
      _showLogin();
    }

  }

  function _onRotate (e) {
    // do some stuff
  }

  function _initDom () {

    _loginPanel = document.createElement("div");
    _loginPanel.classList.add("cloudnote-user__login-panel-container", "popup", "displayNone", "fadeOut");
    var overlay = document.createElement("div");
    overlay.classList.add("cloudnote-user__login-panel-overlay");
    overlay.addEventListener(app.Param.eventStart, _hideLogin);
    var panel = document.createElement("div");
    panel.classList.add("cloudnote-user__login-panel");
    //var logo = document.createElement("div");
    //logo.classList.add("cloudnote-user__login-panel-logo");
    //panel.appendChild(logo);
    _facebookLoginButton = document.createElement("div");
    _facebookLoginButton.classList.add("cloudnote-user__login-panel-facebook");
    panel.appendChild(_facebookLoginButton);
    _loginPanel.appendChild(panel);
    _loginPanel.appendChild(overlay);

    _headerUserButton = document.createElement("div");
    _headerUserButton.classList.add("cloudnote-user__header-button");
    _headerUserButton.addEventListener(app.Param.eventStart, _headerButtonClick)

    app.Param.container.appendChild(_loginPanel);
    app.Header.addButton(_headerUserButton, "right");
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
    _facebook.init();

  }

  app.User = {
    init: init,
    onSocketLogin: onSocketLogin
  };

})(cloudnote);
