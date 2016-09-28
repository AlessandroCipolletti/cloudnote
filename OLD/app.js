var App = (function () {
	var DOCUMENT = document,
		_domGet = function (selector) {
			return DOCUMENT.querySelector(selector);
		},
		_domGetAll = function (selector) {
			return DOCUMENT.querySelectorAll(selector);
		},
		_body = DOCUMENT.body,
		WINDOW = window,
		_darkOverlay,
		_spinner,
		XX, YY, XX2, YY2, DXX, DYY,
		MATH = Math,
		round = function (n, d) {
			var m = d ? MATH.pow(10, d) : 1;
			return MATH.round(n * m) / m;
		},
		random = function (n) {
			return MATH.random() * n | 0;
		},
		toHex = function (n) {
			n = n.toString(16);
			return (n.length === 1 ? "0" + n : n);
		},
		orderNumberUp = function (a, b) {
			return a - b;
		},
		orderNumberDown = function (a, b) {
			return b - a;
		},
		orderStringDown = function (a, b) {
			if (a < b) return +1;
			if (a > b) return -1;
			return 0;
		},
		orderStringUp = function (a, b) {
			if (a > b) return +1;
			if (a < b) return -1;
			return 0;
		},
		preventDefault = function (e) {
			e.preventDefault();
		},
		requestAnimationFrame = WINDOW.requestAnimationFrame || WINDOW.mozRequestAnimationFrame || WINDOW.webkitRequestAnimationFrame ||
		function (callback) {
			setTimeout(callback, 25);
		},
		PI = MATH.PI,
		PI2 = 2 * PI,
		EmptyFN = function () {},
		_mouseWheelEvent,

		Config = (function () {
			return {
				debug: true,
				socketUrl: "http://46.252.150.61:5000",
				fb: {
					appId: "1448620825449065",
					apiVersion: "v2.2"
				},
				workers: {
					blur: "file blur.js",
					scarica: "file scarica.js"
				}
			}
		})(),

		Info = (function () {
			var get_len = function (len) {
				return "ita"; // TODO da implementare per filtrare le lingue non supportate, e restituire il formato a 3 caratteri
			};
			return {
				name: "Social.Art",
				version: "0.5",
				lenguage: get_len(WINDOW.navigator.language),
				macOS: navigator.platform.toUpperCase().indexOf("MAC") !== -1,
				firefox: /Firefox/i.test(navigator.userAgent)
			}
		})(),

		label = (function (len) {
			var _labels = {};
			_labels["ita"] = {
				"closePrevent": "Salva una bozza prima di uscire!",
				"Dimensione": "Dimensione",
				"Matita": "Matita",
				"Pennello": "Pennello",
				"Gomma": "Gomma",
				"Ottimizza": "Ottimizza",
				"Anteprima": "Anteprima",
				"Colori": "Colori",
				"Casuale": "Casuale",
				"SalvaBozza": "Salva Bozza",
				"Ripristina": "Ripristina",
				"FoglioQuadretti": "Foglio a Quadretti",
				"FoglioBianco": "Foglio Bianco",
				"FoglioRighe": "Foglio a Righe",
				"Esporta": "Esporta",
				"Svuota": "Svuota",
				"Chiudi": "Chiudi",
				"Pausa": "Pausa",
				"NienteDaEsportare": "Niente da esportare",
				"areYouSure": "Sei sicuro?",
				"loggedAs": "Collegato come ",
				"salvoDisegno": " Salvo disegno...",
				"nothingToSave": "Niente da salvare",
				"genericError": "Errore che 2 palle",
				"editorSaveError": "Oooops :( Ora non &egrave; possibile salvare. Riprova pi&ugrave; tardi",
				"socketError": "Errore di connessione nel Socket",
				"editorSaveConfirm": "Dopo aver salvato non potrai più modificare il disegno. Confermi?"
			};
			_labels["eng"] = {

			};
			var _lingua = _labels[len] || {};
			return _lingua;
		})(Info.lenguage),

		Utils = (function () {
			var _checkError = (function _checkError()  {
					var _function, errorMsg,
						setFunc = function (func) {
							_function = func;
							return this;
						},
						setError = function (error) {
							errorMsg = error;
							return this;
						},
						exec = function (params) {
							try {
								return _function(params);
							} catch (error) {
								if (Config.debug) {
									var msg = errorMsg + "[" + error.code + " - " + error.message + "] {" + JSON.stringify(params) + "}";
									logError(msg);
								}
								return false;
							}
						};
					return {
						exec: exec,
						setFunc: setFunc,
						setError: setError
					}
				})(),
				checkError = function (func, error, params) {
					return _checkError.setFunc(func).setError(error).exec(params);
				},
				isEmpty = function (value) {
					return ((typeof value == "undefined" || value === null || value === "" || value === false || value === [] ||
						value === {} || value === NaN || value === undefined) ? true : false);
				},
				areEmpty = function (obj) {
					var res = false;
					if (obj instanceof Array) {
						var i = obj.length;
						if (i === 0) return true;
						for (; i--;)
							if (isEmpty(obj[i])) return true;
						return false;
					} else
						return isEmpty(obj);
				},
				getRemoteData = function (url, params) {
					// chiamata AJAX (magari jquery) con paramsin post che restituisce un oggetto de-jsonato, o false
				},
				cancelEvent = function (e) {
					e.preventDefault();
				},
				_iterable = function (els, fn) {
					if (els.length) {
						for (var i = els.length; i--;)
							fn(els[i]);
					} else
						fn(els);
				},
				_fadeInEl = function (el) {
					if (el) {
						el.classList.remove("displayNone");
						requestAnimationFrame(function () {
							el.classList.add("fadeIn");
							el.classList.remove("fadeOut");
						});
					}
				},
				_fadeOutEl = function (el) {
					if (el) {
						el.classList.add("fadeOut");
						el.classList.remove("fadeIn");
						setTimeout(function () {
							el.classList.add("displayNone");
						}, 400);
					}
				},
				_enableEl = function (el) {
					if (el) {
						el.classList.add("enabled");
						el.classList.remove("disabled");
					}
				},
				_disableEl = function (el) {
					if (el) {
						el.classList.add("disabled");
						el.classList.remove("enabled");
					}
				},
				fadeInElements = function (els) {
					_iterable(els, _fadeInEl);
				},
				fadeOutElements = function (els) {
					_iterable(els, _fadeOutEl);
				},
				enableElements = function (els) {
					_iterable(els, _enableEl);
				},
				disableElements = function (els) {
					_iterable(els, _disableEl);
				},
				logError = function (msg) {
					console.log(msg);
					// qui possiamo anche tentare una chiamata ajax per inviarci _msg per le statistiche sugli errori,
				},
				setSpinner = function (state, dark) {
					if (state) {
						fadeInElements(_spinner);
						dark && overlay.show();
					} else {
						fadeOutElements(_spinner);;
						dark && overlay.hide();
					}
				},
				overlay = (function () {
					var _callback = false,
						show = function (onClick) {
							if (onClick) {
								_darkOverlay.classList.add("cursorX");
								_callback = onClick;
								_darkOverlay.addEventListener("click", onClick);
							}
							fadeInElements(_darkOverlay);
						},
						hide = function () {
							if (_callback) {
								_darkOverlay.classList.remove("cursorX");
								_callback = false;
								_darkOverlay.removeEventListener("click", _callback);
							}
							fadeOutElements(_darkOverlay);
						};
					return {
						show: show,
						hide: hide
					};
				})();
			return {
				CK: checkError,
				isEmpty: isEmpty,
				areEmpty: areEmpty,
				getRemoteData: getRemoteData,
				cancelEvent: cancelEvent,
				enableElements: enableElements,
				disableElements: disableElements,
				fadeInElements: fadeInElements,
				fadeOutElements: fadeOutElements,
				setSpinner: setSpinner,
				overlay: overlay
			}
		})(),

		Socket = (function () {
			var _socket = {},
				_buffer = [],
				_onError = function () {

				},
				init = function () {
					var url = Config.socketUrl,
						_onConnect = function () {
							var data;
							for (var i = _buffer.length; i--;) {
								data = _buffer.pop();
								_socket.io.emit(data[0], data[1]);
							}
						};
					_socket = {
						url: url,
						io: io(url)
					};
					_socket.io.on("error", function () {
						console.log(label["socketError"]);
					});
					_socket.io.on("disconnect", function () {
						console.log("socket disconnect");
					});
					_socket.io.on("reconnect", function () {
						_onConnect();
					});
					_socket.io.on("connect", function () {
						console.log("Socket Connect OK");
						_onConnect();
					});
					_socket.io.on("user login", CurrentUser.onSocketLogin);
					_socket.io.on("dashboard drag", Dashboard.onSocketMessage);
					_socket.io.on("editor save", Editor.onSocketMessage);
				},
				emit = function (event, data) {
					(typeof data === "object") && (data = JSON.stringify(data));
					if (_socket.io.connected) {
						_socket.io.emit(event, data);
					} else {
						_buffer.push([event, data]);
					}
				};
			return {
				init: init,
				emit: emit
			};
		})(),

		Worker = (function () {
			var _list = {},
				create = function (file) {

				},
				close = function (file) {

				},
				one = function (file) {

				},
				oneOrNew = function (file) {
					// queste 2 funzioni che sono uguali in più moduli le possiamo aggiungere col metodo oggetto.method preso dal libro, cosi le scriviamo una volta sola
				};
			return {
				create: function (file) {
					return Utils.CK(create, "Error: Worker not created. ", file)
				},
				close: function (file) {
					return Utils.CK(close, "Error: Worker not closed. ", file)
				},
				one: one,
				oneOrNew: oneOrNew
			}
		})(),

		Dashboard = (function () {
			var _dom, _imageGroup = {},
				_buttonEditor, _zoomLabel, _coordsLabel, _allDom, _canvasForClick = DOCUMENT.createElement("canvas"),
				_contextForClick = _canvasForClick.getContext("2d"),
				_imageForDraw = new Image(),
				_isDebug = Config.debug,
				_draggable = true,
				_isMouseDown = false,
				_zoomable = true,
				_isLoading = false,
				_timeoutForSpinner = false,
				_idsImagesOnDashboard = [],
				_idsImagesOnScreen = [],
				_cacheNeedsUpdate = true,
				_zoomScaleLevelsDown = [1, 0.88, 0.7744, 0.681472, 0.59969536, 0.5277319168, 0.464404086783, 0.408675596397,
					0.359634524806, 0.316478381829, 0.278500976009, 0.245080858888, 0.215671155822, 0.189790617123, 0.167015743068,
					0.146973853900, 0.129336991432, 0.113816552460, 0.100158566165, 0.088139538225
				],
				_zoomScaleLevelsUp = [1, 1.136363636364, 1.291322314050, 1.467411720511, 1.667513318762, 1.894901498594,
					2.153297157493, 2.446928588060, 2.780600668250, 3.159773486648, 3.590651689372, 4.080286010650, 4.636688648466,
					5.268964373257, 5.987459515065, 6.803931267119, 7.731740076272, 8.786068268491, 9.984168486921, 11.34564600787
				],
				_mouseX, _mouseY, _clickX, _clickY, _currentX, _currentY, _zoom = 1,
				_decimals = 0,
				socket = Socket,
				_socketCallsInProgress = 0,
				_animationZoom = false,
				_deltaVisibleCoordX = 0,
				_deltaVisibleCoordY = 0,
				_minVisibleCoordX = 0,
				_minVisibleCoordY = 0,
				_maxVisibleCoordX = 0,
				_maxVisibleCoordY = 0,
				_zoomScale = 0.12,
				_zoom = 1,
				_zoomMax = 20,
				_deltaZoomMax = 2,
				_deltaZoom = 0,
				_deltaDragMax = 200,
				_deltaDragX = 0,
				_deltaDragY = 0, // per ricalcolare le immagini visibili o no durante il drag

				_cache = (function () {
					var _list = {},
						_ids = [],
						_maxCacheSize = 100, // forse sarebbe cool parametrizzare questo in base alle prestazioni locali
						_updateIds = function () {
							_ids = Object.keys(_list);
						},
						add = function (id, data) {
							// se la cache html5 può fare al caso nostro, salviamo data in cache, e id nella lista cosi sappiamo cosa abbiamo e cosa no
							// altrimenti mettiamo entrambi nel dizionario _list
							if (_list[id]) return;
							_list[id] = data;
							_updateIds();
						},
						get = function (id) {
							return _list[id] || false;
						},
						set = function (id, data) {
							del(id);
							add(id, data);
						},
						del = function (id) {
							_list[id] = undefined;
							delete _list[id];
							_updateIds();
						},
						log = function () {
							console.log(_list);
						},
						ids = function () {
							return _ids;
						},
						length = function () {
							return _ids.length;
						},
						exist = function (id) {
							return _ids.indexOf(id) >= 0;
						},
						clean = function (force) { // magari anche un metodo che controlli quanto abbiamo in cache e se necessario la liberi
							if (force || _ids.length > _maxCacheSize) {

							}
						},
						reset = function () {
							for (var i = _ids.length; i--;) {
								var draw = _list[_ids[i]];
								draw.onScreen = draw.onDashboard = false;
							}
						};
					return {
						get: get,
						set: set,
						add: add,
						del: del,
						log: log,
						ids: ids,
						length: length,
						exist: exist,
						clean: clean,
						reset: reset
					};
				})(),
				_tooltip = (function () {
					var _dom, _close, _like, _comments, _share, _save, _userImage, _title, _userName, _drawContainer, _likeTot,
						_commentsTot, _shareTot,
						_selectedId, _idUser, _location, _previewWidth = 170,
						_previewHeight = 130,
						init = function () {
							_dom = _domGet("#dashboardTooltip");
							_close = _domGet(".close", _dom);
							_userImage = _domGet("#tooltipUserImage");
							_title = _domGet("#tooltipTitle");
							_userName = _domGet("#tooltipUserName");
							_location = _domGet("#tooltipLocation");
							_likeTot = _domGet("#tooltipLikeTot");
							_commentsTot = _domGet("#tooltipCommentsTot");
							_shareTot = _domGet("#tooltipShareTot");
							_drawContainer = _domGet("#tooltipDrawContainer");
							_like = _domGet("#tooltipLike");
							_comments = _domGet("#tooltipComment");
							_share = _domGet("#tooltipShare");
							_save = _domGet("#tooltipSave");
							_close.addEventListener("click", hide);
							_title.addEventListener("click", _goToDrawPage);
							_userName.addEventListener("click", _goToUserPage);
							_location.addEventListener("click", _goToLocation)
							_drawContainer.addEventListener("click", _goToDrawPage);
							_userImage.addEventListener("click", _goToUserPage);
							_like.addEventListener("click", _like);
							_comments.addEventListener("click", _comments);
							_share.addEventListener("click", _share);
							_save.addEventListener("click", _save);
						},
						show = function (idDraw, x, y) {
							if (idDraw && x && y) {
								_selectedId = idDraw;
								var draw = _cache.get(_selectedId);
								if (!draw) return;

								//_location = draw.location;
								_title.innerHTML = "Titolo Disegno";
								_userName.innerHTML = draw.user.name;
								_userImage.style.backgroundImage = "url('https://graph.facebook.com/" + draw.user.fb.id +
									"/picture?type=large')";
								_location.innerHTML = "Paris, France";
								_likeTot.innerHTML = "421 Mi Piace";
								_commentsTot.innerHTML = "32 Commenti";
								_shareTot.innerHTML = "23 Condivisioni";

								var scale = draw.pxw / draw.pxh,
									w, h;
								if (scale > (_previewWidth / _previewHeight)) {
									w = _canvasForClick.width = _previewWidth;
									h = _canvasForClick.height = round(_previewWidth / scale);
								} else {
									h = _canvasForClick.height = _previewHeight;
									w = _canvasForClick.width = round(_previewHeight * scale);
								}
								_imageForDraw.src = _imageForDraw.src = draw.data.getAttributeNS("http://www.w3.org/1999/xlink", "href");
								_contextForClick.drawImage(_imageForDraw, 0, 0, w, h);
								_drawContainer.style.paddingTop = (_previewHeight - h) / 2 + "px";
								_drawContainer.appendChild(_canvasForClick);
								_dom.style.left = x + "px";
								_dom.style.top = y + "px";
								_dom.classList.add("visible");
							}
						},
						_goToDrawPage = function () {
							//_selectedId
						},
						_goToUserPage = function () {
							//_idUser
						},
						_goToLocation = function () {
							//_location
						},
						hide = function () {
							_dom.style.left = "-1000px";
							_dom.style.top = "-1000px";
							_dom.classList.remove("visible");
							_drawContainer.style.paddingTop = "";
							_contextForClick.clearRect(0, 0, _canvasForClick.width, _canvasForClick.height);
							_canvasForClick.width = _canvasForClick.height = 0;
							_imageForDraw = new Image();
						},
						_like = function () {

						},
						_comments = function () {

						},
						_share = function () {

						},
						_save = function () {

						};
					return {
						init: init,
						show: show,
						hide: hide
					};
				})(),

				_initDomGroup = function () {
					if (_imageGroup.tag) {
						_dom.removeChild(_imageGroup.tag);
						_imageGroup.origin = _imageGroup.tag = null;
						_imageGroup.pxx = _imageGroup.pxy = 0;
						_imageGroup.matrix = null;
					}
					var g = DOCUMENT.createElementNS("http://www.w3.org/2000/svg", "g");
					var origin = document.createElementNS("http://www.w3.org/2000/svg", "rect");
					g.setAttribute("id", "imageGroup");
					origin.setAttributeNS(null, "x", 0);
					origin.setAttributeNS(null, "y", 0);
					origin.setAttributeNS(null, "height", "1");
					origin.setAttributeNS(null, "width", "1");
					origin.setAttributeNS(null, "fill", "#FFF");
					g.appendChild(origin);
					_dom.appendChild(g);
					_imageGroup.tag = g;
					_imageGroup.origin = origin;
					_imageGroup.matrix = _imageGroup.tag.getCTM();
					var z = _imageGroup.matrix.a;
					_deltaVisibleCoordX = DXX / z;
					_deltaVisibleCoordY = DYY / z;
				},
				_initDom = function () {
					_dom = _domGet("#dashboard");
					_zoomLabel = _domGet("#zoomLabel");
					_initDomGroup();
					_buttonEditor = _domGet("#showEditor");
					_allDom = _domGetAll("#showEditor, #zoomLabel, #zoomLabelCont");
					_buttonEditor.classList.remove("displayNone");
					if (_isDebug) {
						_domGet("#dashboardCoords").classList.remove("displayNone");
						_coordsLabel = _domGet("#dashboardCoords span");
						_updateCoordsLabel(_currentX, _currentY);
					}
				},
				_updateCoordsLabel = _isDebug ? function (x, y) {
					_coordsLabel.innerHTML = "(" + x + ", " + y + ")";
				} : function () {},
				_updateCurrentCoords = function (x, y) {
					_currentX = x;
					_currentY = y;
					_minVisibleCoordX = x - _deltaVisibleCoordX;
					_maxVisibleCoordX = x + _deltaVisibleCoordX;
					_minVisibleCoordY = y - _deltaVisibleCoordY;
					_maxVisibleCoordY = y + _deltaVisibleCoordY;
					_updateCoordsLabel(x, y);
				},
				_animZoom = function () {
					if (_zoom === 1) {
						Editor.show();
						_animationZoom = false;
					} else {
						_zoomTo(_zoom - 1, XX2, YY2, true);
						requestAnimationFrame(_animZoom);
					}
				},
				_buttonEditorClick = function (e) {
					if (_animationZoom) return;
					CurrentUser.doLogin().then(function () {
						_animationZoom = true;
						_animZoom();
					});
				},
				_updateGroupOrigin = function () {
					var _groupRect = _imageGroup.origin.getBoundingClientRect();
					_imageGroup.pxx = round(_groupRect.left, _decimals);
					_imageGroup.pxy = round(_groupRect.top, _decimals);
				},
				_highlightsDraw = function (id, x, y) { // TODO evidenzio il disegno e mostro il box con le sue info
					console.log("clicked draw id:", id);
					_tooltip.show(id, x, y);
				},
				_selectDrawAtPx = function (x, y) { // OK! capisco su quale disegno l'utente voleva fare click
					_cacheNeedsUpdate && _updateCache();
					_idsImagesOnScreen.sort(orderStringUp);
					var draw, selectedID = false;
					for (var i = 0, l = _idsImagesOnScreen.length; i < l; i++) {
						draw = _cache.get(_idsImagesOnScreen[i]);
						if (draw.pxx < x && draw.pxr > x && draw.pxy < y && draw.pxb > y) {
							(!selectedID) && (selectedID = draw.id);
							_contextForClick.clearRect(0, 0, _canvasForClick.width, _canvasForClick.height);
							_canvasForClick.width = draw.pxw;
							_canvasForClick.height = draw.pxh;
							_imageForDraw.src = draw.data.getAttributeNS("http://www.w3.org/1999/xlink", "href");
							_contextForClick.drawImage(_imageForDraw, 0, 0, draw.pxw, draw.pxh);
							if (_contextForClick.getImageData(x - draw.pxx, y - draw.pxy, 1, 1).data[3] > 0) {
								selectedID = draw.id;
								break;
							}
						}
					}
					_contextForClick.clearRect(0, 0, _canvasForClick.width, _canvasForClick.height);
					_canvasForClick.width = _canvasForClick.height = 0;
					_imageForDraw = new Image();
					selectedID && _highlightsDraw(selectedID, x, y);
				},
				_isOnScreen = function (img) {
					return (img.pxr > 0 && img.pxx < XX && img.pxb > 0 && img.pxy < YY);
				},
				_isOnDashboard = function (img) { // OK - la zona "visibile" è quella attualmente a video, più una schermata per ogni lato, come sorta di 'cache'
					return (img.r > _minVisibleCoordX && img.b < _maxVisibleCoordY && img.x < _maxVisibleCoordX && img.y >
						_minVisibleCoordY);
				},
				_updateCache = function () {
					var ids = _cache.ids(),
						isOnDashboard = _isOnDashboard,
						isOnScreen = _isOnScreen,
						R = round,
						decimals = _decimals,
						img, rect;
					_idsImagesOnScreen = [];
					for (var i = ids.length; i--;) {
						img = _cache.get(ids[i]);
						rect = img.data.getBoundingClientRect();
						img.pxx = R(rect.left, decimals);
						img.pxy = R(rect.top, decimals);
						img.pxw = R(rect.width, decimals);
						img.pxh = R(rect.height, decimals);
						img.pxr = img.pxx + img.pxw;
						img.pxb = img.pxy + img.pxh;
						img.onDashboard = isOnDashboard(img);
						img.onScreen = isOnScreen(img);
						(_idsImagesOnDashboard.indexOf(img.id) >= 0) && (!img.onDashboard) && _removeDraw(img.id, false);
						img.onScreen && _idsImagesOnScreen.push(img.id);
						_cache.set(img.id, img);
					}
					isOnDashboard = isOnScreen = decimals = R = undefined;
					_cacheNeedsUpdate = false;
				},
				_zoomTo = function (level, x, y, animated) { // "OK"
					if (level === _zoom || level > _zoomMax || level < 1) return;
					_tooltip.hide();
					var refreshCache = (level === 1 || animated !== true),
						deltaZoomLevel = level - _zoom,
						newp = _dom.createSVGPoint(),
						//_zz = (deltaZoomLevel > 0) ? MATH.pow(1 - _zoomScale, -deltaZoomLevel) : MATH.pow(1 / (1 - _zoomScale), deltaZoomLevel),
						//_z = (deltaZoomLevel > 0) ? MATH.pow(1 - _zoomScale, deltaZoomLevel) : MATH.pow(1 / (1 - _zoomScale), -deltaZoomLevel),
						_scaleLevelIndex = MATH.abs(deltaZoomLevel),
						_zz = (deltaZoomLevel > 0) ? _zoomScaleLevelsUp[_scaleLevelIndex] : _zoomScaleLevelsDown[_scaleLevelIndex],
						_z = (deltaZoomLevel > 0) ? _zoomScaleLevelsDown[_scaleLevelIndex] : _zoomScaleLevelsUp[_scaleLevelIndex],
						_currentScale = 1 / _imageGroup.matrix.a,
						_currentScaleAndZoom = _currentScale * round(_zz - 1, 12);
					_zoom = level;
					_deltaZoom = _deltaZoom + MATH.max(deltaZoomLevel, 0);
					newp.x = x;
					newp.y = y;
					newp = newp.matrixTransform(_imageGroup.tag.getScreenCTM().inverse());
					newp.x = round(newp.x);
					newp.y = round(newp.y);
					_imageGroup.matrix = _imageGroup.matrix.translate(-(newp.x * (_z - 1)), -(newp.y * (_z - 1)));
					_imageGroup.matrix.a = _imageGroup.matrix.d = _zoomScaleLevelsDown[_zoom - 1];
					_imageGroup.updateMatrix();
					var _newCoordX = round(_currentX + ((XX2 - x) * _currentScaleAndZoom), _decimals),
						_newCoordY = round(_currentY - ((YY2 - y) * _currentScaleAndZoom), _decimals),
						z = _imageGroup.matrix.a;
					_deltaVisibleCoordX = DXX / z;
					_deltaVisibleCoordY = DYY / z;
					_updateCurrentCoords(_newCoordX, _newCoordY);
					_updateGroupOrigin();
					if (refreshCache && (_deltaZoom > _deltaZoomMax)) {
						_fillScreen(); // dopo lo zoom e l'aggiornamento delle imm, scarico e visualizzo le nuove. necessario solo se sto rimpicciolendo la schermata.
					} else {
						_cacheNeedsUpdate = true;
					}
					_zoomLabel.textContent = [round(100 - (95 / _zoomMax) * (level - 1)), "%"].join("");
				},
				_drag = function (dx, dy, forceLoad) { // OK. dx dy sono le differenze in px, non in coordinate (bisogna tenere conto dello zoom)
					if (dx === 0 && dy === 0) return;
					var scale = _imageGroup.matrix.a,
						_deltaX = round(dx / scale, _decimals),
						_deltaY = round(dy / scale, _decimals);
					_deltaDragX = _deltaDragX + dx;
					_deltaDragY = _deltaDragY + dy;
					_imageGroup.matrix = _imageGroup.matrix.translate(_deltaX, _deltaY);
					_imageGroup.updateMatrix();
					var _newCoordX = round(_currentX - _deltaX, _decimals),
						_newCoordY = round(_currentY + _deltaY, _decimals);
					_updateCurrentCoords(_newCoordX, _newCoordY);
					_updateGroupOrigin();
					if (forceLoad || MATH.abs(_deltaDragX) > _deltaDragMax || MATH.abs(_deltaDragY) > _deltaDragMax) {
						_fillScreen();
					} else {
						_cacheNeedsUpdate = true;
					}
				},
				onSocketMessage = function (data) {
					if (["end", "none", "error"].indexOf(data) >= 0) {
						_socketCallsInProgress--;
						if (_socketCallsInProgress === 0) {
							_isLoading = false;
							Utils.setSpinner(false);
						}
					} else {
						console.log(JSON.parse(data));
						_addDraws(JSON.parse(data));
					}
				},
				_addDraws = function (draws) { // aggiunge uno ad uno i disegni ricevuti dal socket
					var draw;
					for (var i = 0, l = draws.length; i < l; i++) {
						draw = draws[i];
						if (_cache.exist(draw.id)) continue; // questo controllo dovrebbe essere inutile, ma meglio evitarsi il lavoro di aggiungere un disegno per sbaglio
						addDraw(draw);
					}
				},
				addDraw = function (draw, replace) { // OK	aggiunge e salva un disegno passato dall editor o dal socket
					//console.log(draw);
					if (!draw || !draw.id) return false;
					var _drawExist = _cache.exist(draw.id),
						z = _imageGroup.matrix.a;
					if (!_drawExist || replace) {
						_drawExist && _removeDraw(draw.id, true);
						var _newDraw = DOCUMENT.createElementNS("http://www.w3.org/2000/svg", "image");
						_newDraw.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", draw.base64);
						_newDraw.setAttribute("x", round(((draw.x - _currentX) * z + XX2 - _imageGroup.pxx) / z, _decimals));
						_newDraw.setAttribute("y", round(((_currentY - draw.y) * z + YY2 - _imageGroup.pxy) / z, _decimals));
						_newDraw.setAttribute("width", draw.w);
						_newDraw.setAttribute("height", draw.h);
						_newDraw.id = draw.id;
						draw.base64 = undefined;
						delete draw.minX;
						delete draw.minY;
						delete draw.maxX;
						delete draw.maxY;
						delete draw.coordX;
						delete draw.coordY;
						delete draw.base64;
						draw.data = _newDraw;
						_appendDraw(draw);
						_newDraw = draw = undefined;
					}
					_cacheNeedsUpdate = true;
					return true;
				},
				_removeDraw = function (id, del) { // OK
					//console.log("rimuovo:" + id);
					(del || false) && _cache.del(id);
					_idsImagesOnDashboard.splice(_idsImagesOnDashboard.indexOf(id), 1);
					var _oldDraw = DOCUMENT.getElementById(id);
					_oldDraw && _imageGroup.tag.removeChild(_oldDraw);
				},
				_appendDraw = function (draw) { // aggiunge alla dashboard un svg image già elaborato
					if (!draw || !draw.id || _idsImagesOnDashboard.indexOf(draw.id) >= 0) return false;
					//console.log(["aggiungo", draw]);
					_idsImagesOnDashboard.push(draw.id);
					_idsImagesOnDashboard = _idsImagesOnDashboard.sort(orderStringDown);
					var index = _idsImagesOnDashboard.indexOf(draw.id) + 1;
					if (index < _idsImagesOnDashboard.length) {
						_imageGroup.tag.insertBefore(draw.data, DOCUMENT.getElementById(_idsImagesOnDashboard[index]));
					} else {
						_imageGroup.tag.appendChild(draw.data);
					}
					draw.onDashboard = true;
					_cache.add(draw.id, draw);
				},
				_getVisibleArea = function () { // OK - in coordinate assolute
					// TODO - per adesso cambio qui la dimensione dell'area da scaricare per scaricare tutto in un colpo,
					//			ma in futuro sarà meglio fare prima la chiamata per la schermata a video e poi un'altra chiamata per la zona intorno
					return {
						minX: _minVisibleCoordX,
						maxX: _maxVisibleCoordX,
						minY: _minVisibleCoordY,
						maxY: _maxVisibleCoordY,
						x: _currentX,
						y: _currentY
					}
				},
				_findInCache = function () {
					var _ids = _cache.ids().filter(function (i) {
							return _idsImagesOnDashboard.indexOf(i) < 0
						}),
						_draw;
					for (var i = _ids.length; i--;) {
						_draw = _cache.get(_ids[i]);
						(_isOnDashboard(_draw)) && _appendDraw(_draw);
					}
				},
				_callSocketFor = function (area, notIds) { // OK
					_socketCallsInProgress++;
					if (!_isLoading) {
						_isLoading = true;
						if (_timeoutForSpinner === false) {
							_timeoutForSpinner = true;
							setTimeout(function () {
								_isLoading && Utils.setSpinner(true);
								_timeoutForSpinner = false;
							}, 100);
						}
					}
					socket.emit("dashboard drag", {
						"area": area,
						"ids": notIds
					});
				},
				_fillScreen = function () { // OK
					// 1 - aggiorna le coordinate in px delle immagini in cache (e rimuove quelle non piu visibili)
					_deltaDragX = _deltaDragY = _deltaZoom = 0;
					_updateCache();
					// 2° calcola la porzione da mostrare in base alle coordinate correnti, zoom e dimensioni schermo
					var _area = _getVisibleArea();
					// 3° visualizza subito quello che c'è già in cache
					_findInCache();
					// 4° avvia trasferimenti di ciò che non è in cache e che deve comparire
					_callSocketFor(_area, _cache.ids());
				},
				goToXY = function (x, y) { // OK
					// calcolo la differenza in px invece che coord, e chiamo _drag. se si inseriscono coordinate poco distanti dalle attuali, forzo l'aggiornamento e il caricamento delle nuove
					if (Utils.areEmpty([x, y])) return;
					var z = _imageGroup.matrix.a,
						dx = round((x - _currentX) * z),
						dy = round((y - _currentY) * z);
					_updateCurrentCoords(x, y);
					_idsImagesOnDashboard = [];
					_cache.reset();
					_initDomGroup();
					_fillScreen();
				},
				goToDraw = function (id) { // TODO
					// precarica (se necessario) il disegno e poi va alle sue coordinate. in questo modo sono sicuro che sarà visualizzato per primo (importante visto che è stato richiesto specificamente)
					if (Utils.isEmpty(id)) return;
					if (_cache.exist(id)) {
						var draw = _cache.get(id);
					} else {
						// TODO: prendo via socket il disegno passando l'id,
						var draw = {
							id: id,
							x: 0,
							y: 0,
							w: 0,
							h: 0,
							data: {}
						};
						_cache.set(id, draw);
					}
					goToXY(draw.x + draw.w / 2, draw.y + draw.h / 2);
				},
				_mousedown = function (e) {
					if (e.button !== 0) return false;
					_isMouseDown = true;
					_tooltip.hide();
					_dom.classList.add("dragging");
					_mouseX = _clickX = e.pageX;
					_mouseY = _clickY = e.pageY;
					_imageGroup.matrix = _imageGroup.tag.getCTM();
				},
				__mousemove = function () {
					_drag(this[0], this[1], false);
					_mouseX = this[2]; // questo init lo metto qui perché se ci sono dei mousemove che vanno persi nell"attesa di requestAnimationFrame, i delta cords non vanno persi
					_mouseY = this[3];
					_draggable = true;
				},
				_mousemove = function (e) {
					if (_isMouseDown && _draggable) {
						var dx = e.pageX - _mouseX,
							dy = e.pageY - _mouseY;
						_draggable = false;
						requestAnimationFrame(__mousemove.bind([dx, dy, e.pageX, e.pageY]));
					}
				},
				_click = function (e) {

				},
				_mouseend = function () {
					_mouseX = 0;
					_mouseY = 0;
					_isMouseDown = false;
					_dom.classList.remove("dragging");
				},
				_mouseup = function (e) {
					if (e.button !== 0) return false;
					var abs = MATH.abs;
					(abs(_clickX - e.pageX) < 5 && abs(_clickY - e.pageY) < 5) && _selectDrawAtPx(e.pageX, e.pageY);
					_mouseend();
				},
				_mouseout = function (e) {
					_mouseend();
				},
				_mouseover = function (e) {
					if (e.target.id === "dashboard") {
						_mouseX = e.pageX;
						_mouseY = e.pageY;
					}
				},
				__mouseWheel = function () {
					_zoomTo(this[0] > 0 ? _zoom - 1 : _zoom + 1, this[1], this[2]);
					_zoomable = true;
				},
				_mouseWheel = function (e) { // TODO: Test browser
					if (e.preventDefault)
						e.preventDefault();
					e.returnValue = false;
					var _delta = e.wheelDelta ? e.wheelDeltaY : -e.detail; // delta negativo --> scroll verso il basso --> le immagini si rimpiccioliscono e la lavagna si ingrandisce --> zoom + 1
					if (_zoomable && !_isMouseDown) {
						_zoomable = false;
						requestAnimationFrame(__mouseWheel.bind([_delta, e.clientX, e.clientY]));
					}
				},
				_keyDown = function (e) {
					if (e.keyCode === 37) _drag(-1, 0);
					else if (e.keyCode === 38) _drag(0, -1);
					else if (e.keyCode === 39) _drag(1, 0);
					else if (e.keyCode === 40) _drag(0, 1);
				},
				_addEvents = function () {
					_dom.addEventListener("click", _click, true);
					_dom.addEventListener("mousedown", _mousedown, true);
					_dom.addEventListener("mousemove", _mousemove, true);
					_dom.addEventListener("mouseup", _mouseup, true);
					//_dom.addEventListener("mouseout",		_mouseout,	true);
					_dom.addEventListener("mouseover", _mouseover, true);
					DOCUMENT.addEventListener(_mouseWheelEvent, _mouseWheel, true);
					_isDebug && DOCUMENT.addEventListener("keydown", _keyDown, false);
					_buttonEditor.addEventListener("mousedown", _buttonEditorClick);
				},
				_removeEvents = function () {
					_dom.removeEventListener("click", _click, true);
					_dom.removeEventListener("mousedown", _mousedown, true);
					_dom.removeEventListener("mousemove", _mousemove, true);
					_dom.removeEventListener("mouseup", _mouseup, true);
					//_dom.removeEventListener("mouseout",		_mouseout,	true);
					_dom.removeEventListener("mouseover", _mouseover, true);
					_dom.removeEventListener(_mouseWheelEvent, _mouseWheel, true);
					_isDebug && DOCUMENT.removeEventListener("keydown", _keyDown, false);
					_buttonEditor.removeEventListener("mousedown", _buttonEditorClick);
				},
				overshadow = function () { // mette in secondo piano e blocca la dashboard per mostrare l"editor
					_draggable = _zoomable = false;
					_removeEvents();
					_tooltip.hide();
					Utils.fadeOutElements(_allDom);
				},
				foreground = function () { // riporta in primo piano la dashboard e la rende funzionante
					_draggable = _zoomable = true;
					_addEvents();
					Utils.fadeInElements(_allDom);
				},
				getCoords = function () {
					return {
						x: round(_currentX),
						y: round(_currentY)
					};
				},
				onResize = function () { // TODO
					// calcolo coordinate, punto in centro pagina, aggiungo o rimuovo disegni
					// i disegni non devono spostarsi rispetto allo schermo, ma le coordinate correnti devono essere calcolate al centro della finestra
				},
				init = function () {
					//scelgo a che posizione aprire la lavagna
					_imageGroup.updateMatrix = function () {
						var matrix = _imageGroup.matrix;
						_imageGroup.tag.setAttribute("transform", "matrix(" + matrix.a + "," + matrix.b + "," + matrix.c + "," +
							matrix.d + "," + round(matrix.e, 4) + "," + round(matrix.f, 4) + ")");
					};
					_initDom();
					_tooltip.init();
					_addEvents();
					goToXY(0, 0);
				};
			_mouseX = _mouseY = _currentX = _currentY = 0;
			return {
				overshadow: overshadow,
				foreground: foreground,
				goToXY: goToXY,
				goToDraw: goToDraw,
				addDraw: addDraw,
				getCoords: getCoords,
				onSocketMessage: onSocketMessage,
				onResize: onResize,
				init: init
			};
		})(),

		Editor = (function () {
			var _dom, _context, _editorContainer, _allMenuTools, _brushTool, _pencilTool, _eraserTool, _pickerTool,
				_editorUndo, _editorRedo, _editorHide,
				_options, _pickerToolPreview, _pickerToolColor, _pickerToolColor2, _randomColorButton, _editorSave,
				_sizeToolContainer, _grayscaleContainer, _grayscalePointer,
				_editorShowOptions, _optionDraft, _optionRestore, _optionSquare, _optionExport, _optionClear, _closeButton,
				_minX, _minY, _maxX, _maxY, _oldX, _oldY, _mouseX = 0,
				_mouseY = 0,
				_numUndoStep = 31,
				_currentStep = 0,
				_oldMidX, _oldMidY, _sizeToolPreview, _sizeToolLabel,
				_isInit, _isMouseDown, _isPressedShift, _restored = false,
				_randomColor = true,
				_overlay = false,
				_grayscaleIsScrolling = false,
				_isSaving = false,
				_draft = {},
				_step = [],
				_toolSelected = 0,
				_editorMenuActions = [],
				_editorMenuActionsLength = 0,
				_savedDraw = {},
				socket = Socket,
				_color, _size, _pencilSize = 2,
				_pencilColor = "",
				_pencilColorID = 12,
				_brushSize = 50,
				_eraserSize = 50,
				_brushColor, _maxToolSize = 200,
				_grayscaleColors = ["#FFF", "#EEE", "#DDD", "#CCC", "#BBB", "#AAA", "#999", "#888", "#777", "#666", "#555",
					"#444", "#333", "#222", "#111", "#000"
				],
				_enableElements = Utils.enableElements,
				_disableElements = Utils.disableElements,
				_currentUser = {},
				_labelAnnulla = label["Annulla"],
				_labelRipeti = label["Ripeti"],

				_colorPicker = (function () { // sottomodulo di editor per gestire il color-picker
					var _container, _context, _dom, _imagePicker = new Image(),
						_imageSelector = new Image(),
						_preview,
						_isMouseDown = false,
						width = 240,
						height = 120,
						_mouseX, _mouseY, _oldX, _oldY, _color = false,
						init = function () {
							_dom = DOCUMENT.querySelector("#colorPicker");
							_dom.width = width;
							_dom.height = height;
							_context = _dom.getContext("2d");
							_container = _domGet("#colorPickerCont");
							_preview = _domGet("#colorPreview");
							_imagePicker.onload = function () {
								_context.drawImage(_imagePicker, 0, 0, width, height);
								_imagePicker.onload = undefined;
							};
							_imagePicker.src = "img/colors.png";
							_imageSelector.src = "img/selector.png";
						},
						addEvents = function () {
							DOCUMENT.addEventListener("mouseup", _mouseup, true);
							_dom.addEventListener("mousedown", _mousedown, true);
							_dom.addEventListener("mousemove", _mousemove, true);
							_dom.addEventListener("mouseout", _mouseout, true);
						},
						removeEvents = function () {
							DOCUMENT.removeEventListener("mouseup", _mouseup, true);
							_dom.removeEventListener("mousedown", _mousedown, true);
							_dom.removeEventListener("mousemove", _mousemove, true);
							_dom.removeEventListener("mouseout", _mouseout, true);
						},
						_update = function () {
							var px, __color;
							_context.drawImage(_imagePicker, 0, 0, width, height);
							px = _context.getImageData(_mouseX, _mouseY, 1, 1).data;
							__color = "rgb(" + px[0] + "," + px[1] + "," + px[2] + ")";
							_preview.style.backgroundColor = __color;
							_context.drawImage(_imageSelector, _oldX - 5, _oldY - 5);
							if (_isMouseDown) {
								_color = __color;
								Editor.setColor(_color);
							}
						},
						_updatePoint = function (e) {
							_mouseX = e.offsetX;
							_mouseY = e.offsetY;
						},
						_updateOldPoint = function () {
							_oldX = _mouseX;
							_oldY = _mouseY;
						},
						_mousedown = function (e) {
							_isMouseDown = true;
							_updatePoint(e);
							_updateOldPoint();
							_update();
						},
						_mousemove = function (e) {
							_updatePoint(e);
							_isMouseDown && _updateOldPoint();
							_update();
						},
						_mouseup = function () {
							if (_isMouseDown) {
								_isMouseDown = false;
								_updateOldPoint();
								_update();
							}
						},
						_mouseout = function () {
							_preview.style.backgroundColor = _color ? _color : "#FFF";
						},
						show = function () {
							Utils.fadeInElements(_container);
						},
						hide = function () {
							Utils.fadeOutElements(_container);
						},
						setColor = function (color) {
							_color = color;
							_context.drawImage(_imagePicker, 0, 0, width, height);
							_preview.style.backgroundColor = color
							_oldX = _oldY = -10;
						},
						getColor = function () {
							return _color;
						};
					// auto-init del sottomodulo _colorPicker
					_mouseX = _mouseY = 0;
					_oldX = _oldY = -10;
					return {
						init: init,
						show: show,
						hide: hide,
						addEvents: addEvents,
						removeEvents: removeEvents,
						setColor: setColor,
						getColor: getColor
					}
				})(),

				__init = function () {
					_dom = DOCUMENT.querySelector("#editor");
					_context = _dom.getContext("2d");
					_dom = _domGet("#editor");
					_options = _domGet("#editorOptions");
					_pickerToolPreview = _domGet("#pickerToolPreview");
					_pickerToolColor = _domGet("#pickerToolColor");
					_pickerToolColor2 = _domGet("#pickerToolColor2");
					_editorContainer = _domGet("#editorContainer");
					_dom.width = XX;
					_dom.height = YY;
					_editorMenuActions = [_hide, _selectBrush, _selectPencil, _selectEraser, _selectPicker, _selectRandomColor,
						_undo, _redo, _save, _showOptions
					];
					_editorMenuActionsLength = _editorMenuActions.length;
					_brushTool = _domGet("#editorMenu1");
					_pencilTool = _domGet("#editorMenu2");
					_eraserTool = _domGet("#editorMenu3");
					_pickerTool = _domGet("#editorMenu4");
					_randomColorButton = _domGet("#editorMenu5");
					_editorUndo = _domGet("#editorMenu6");
					_editorRedo = _domGet("#editorMenu7");
					_editorSave = _domGet("#editorMenu8");
					_editorShowOptions = _domGet("#editorMenu9");
					_editorHide = _domGet("#editorMenu0");
					_allMenuTools = _domGetAll("#editorMenu1, #editorMenu2, #editorMenu3, #editorMenu4");
					_optionDraft = _domGet("#optionDraft");
					_optionDraft.innerHTML = label["SalvaBozza"];
					_optionRestore = _domGet("#optionRestore");
					_optionRestore.innerHTML = label["Ripristina"];
					_optionSquare = _domGet("#optionSquare");
					_optionSquare.innerHTML = label["FoglioQuadretti"];
					_optionExport = _domGet("#optionExport");
					_optionExport.innerHTML = label["Esporta"];
					_optionClear = _domGet("#optionClear");
					_optionClear.innerHTML = label["Svuota"];
					_disableElements(_optionRestore);
					_sizeToolPreview = _domGet("#sizeToolPreview");
					_closeButton = _domGet("#editorOptions .close");
					_sizeToolLabel = _domGet("#sizeToolLabel");
					_sizeToolContainer = _domGet("#sizeToolContainer");
					_grayscaleContainer = _domGet("#pencilGrayscaleCont");
					_grayscalePointer = _domGet("#grayscalePointer");
				},
				_init = function () {
					if (!_isInit) {
						_isInit = true;
						__init();
						_saveStep();
						_initGrayscale();
						_colorPicker.init();
						_onResize();
						_brushColor = _getColor();
						_selectBrush();
					}
				},
				_addEvents = function () {
					_dom.addEventListener("mouseup", _mouseend, true);
					_dom.addEventListener("mousedown", _mousedown, true);
					DOCUMENT.addEventListener("mousemove", _mousemove, true);
					DOCUMENT.addEventListener("mouseout", _mouseend, true);
					DOCUMENT.addEventListener("keydown", _keyDown, false);
					DOCUMENT.addEventListener("keyup", _keyUp, false);
					_brushTool.addEventListener("mousedown", _editorMenuActions[1]);
					_pencilTool.addEventListener("mousedown", _editorMenuActions[2]);
					_eraserTool.addEventListener("mousedown", _editorMenuActions[3]);
					_pickerTool.addEventListener("mousedown", _editorMenuActions[4]);
					_randomColorButton.addEventListener("mousedown", _editorMenuActions[5]);
					_editorUndo.addEventListener("mousedown", _editorMenuActions[6]);
					_editorRedo.addEventListener("mousedown", _editorMenuActions[7]);
					_editorSave.addEventListener("mousedown", _editorMenuActions[8]);
					_editorShowOptions.addEventListener("mousedown", _editorMenuActions[9]);
					_editorHide.addEventListener("mousedown", _editorMenuActions[0]);
					_optionDraft.addEventListener("click", _draft);
					_optionRestore.addEventListener("click", _restore);
					_optionSquare.addEventListener("click", _toggleBackground);
					_optionExport.addEventListener("click", _export);
					_optionClear.addEventListener("click", clear);
					_closeButton.addEventListener("click", _hideOptions);
					_colorPicker.addEvents();
					(Config.debug === false) && (WINDOW.onbeforeunload = function () {
						return label["closePrevent"];
					});
					WINDOW.addEventListener("resize", _onResize, true);
					_dom.addEventListener(_mouseWheelEvent, _mouseWheel, true);
					_sizeToolContainer.addEventListener(_mouseWheelEvent, _mouseWheel, true);
				},
				_removeEvents = function () {
					_dom.removeEventListener("mouseup", _mouseend);
					_dom.removeEventListener("mousedown", _mousedown);
					DOCUMENT.removeEventListener("mousemove", _mousemove);
					DOCUMENT.removeEventListener("mouseout", _mouseend);
					DOCUMENT.removeEventListener("keydown", _keyDown, false);
					DOCUMENT.removeEventListener("keyup", _keyUp, false);
					_brushTool.removeEventListener("mousedown", _editorMenuActions[1]);
					_pencilTool.removeEventListener("mousedown", _editorMenuActions[2]);
					_eraserTool.removeEventListener("mousedown", _editorMenuActions[3]);
					_pickerTool.removeEventListener("mousedown", _editorMenuActions[4]);
					_randomColorButton.removeEventListener("mousedown", _editorMenuActions[5]);
					_editorUndo.removeEventListener("mousedown", _editorMenuActions[6]);
					_editorRedo.removeEventListener("mousedown", _editorMenuActions[7]);
					_editorSave.removeEventListener("mousedown", _editorMenuActions[8]);
					_editorShowOptions.removeEventListener("mousedown", _editorMenuActions[9]);
					_editorHide.removeEventListener("mousedown", _editorMenuActions[0]);
					_optionDraft.removeEventListener("click", _draft);
					_optionRestore.removeEventListener("click", _restore);
					_optionSquare.removeEventListener("click", _toggleBackground);
					_optionExport.removeEventListener("click", _export);
					_optionClear.removeEventListener("click", clear);
					_closeButton.removeEventListener("click", _hideOptions);
					_colorPicker.removeEvents();
					WINDOW.onbeforeunload = undefined;
					WINDOW.removeEventListener("resize", _onResize);
					_dom.removeEventListener(_mouseWheelEvent, _mouseWheel, true);
					_sizeToolContainer.removeEventListener(_mouseWheelEvent, _mouseWheel, true);
				},
				_initGrayscale = function () {
					var length = _grayscaleColors.length;
					for (var i = 0; i < length; i++) {
						var div = DOCUMENT.createElement("div");
						div.style.backgroundColor = _grayscaleColors[i];
						_grayscaleContainer.appendChild(div);
					}
					_pencilColor = _grayscaleColors[_pencilColorID];
					_grayscalePointer.style.top = _pencilColorID * 20 + 2 + "px";
					_grayscalePointer.style.borderColor = "transparent transparent transparent " + _pencilColor;
				},
				_saveLayer = function () {
					return {
						data: _minX === -1 ? _context.getImageData(-1, -1, -1, -1) : _context.getImageData(_minX, _minY, _maxX - _minX,
							_maxY - _minY),
						minX: _minX,
						minY: _minY,
						maxX: _maxX,
						maxY: _maxY,
						oldX: _oldX,
						oldY: _oldY
					}
				},
				_saveStep = function () {
					if (_currentStep !== 0) {
						_step.splice(0, _currentStep);
						_currentStep = 0;
					}
					_step.splice(0, 0, _saveLayer());
					if (_step.length > _numUndoStep)
						_step.splice(_numUndoStep, _step.length);
					if (_step.length > 1)
						_enableElements(_editorUndo);
					else
						_disableElements(_editorUndo);
					_disableElements(_editorRedo);
				},
				_restoreStep = function (step) {
					_context.putImageData(step.data, step.minX, step.minY);
					_minX = step.minX;
					_minY = step.minY;
					_maxX = step.maxX;
					_maxY = step.maxY;
					_oldX = step.oldX;
					_oldY = step.oldY
				},
				_line = function (X, Y) {
					_context.beginPath();
					_context.moveTo(_oldX, _oldY);
					_context.lineWidth = _size;
					_context.strokeStyle = _color;
					_context.lineJoin = "round";
					_context.lineCap = "round";
					_context.lineTo(X, Y);
					_context.stroke();
				},
				_circle = function (X, Y) {
					_context.beginPath();
					_context.fillStyle = _color;
					_context.arc(X, Y, _size / 2, 0, PI2, true);
					_context.fill();
				},
				_checkCoord = function (X, Y) {
					if (_toolSelected === 0 || _toolSelected === 1) {
						var offset = _size / 2;
						if (_minX === -1 || _minX > (X - offset)) _minX = X - offset;
						if (_minY === -1 || _minY > (Y - offset)) _minY = Y - offset;
						if (_maxX === -1 || _maxX < (X + offset)) _maxX = X + offset;
						if (_maxY === -1 || _maxY < (Y + offset)) _maxY = Y + offset;
						if (_minX < 0) _minX = 0;
						if (_minY < 0) _minY = 0;
						if (_maxX > XX) _maxX = XX;
						if (_maxY > YY) _maxY = YY;
					}
					_oldX = X;
					_oldY = Y;
				},
				_deselectMenuTool = function (el) {
					for (var i = _allMenuTools.length; i--;) {
						_allMenuTools[i].classList.remove("selected");
					}
				},
				_selectBrush = function () {
					if (_toolSelected !== 0) {
						_toolSelected = 0; // PENNELLO
						_dom.classList.remove("usePencil", "useEraser", "usePicker");
						_dom.classList.add("useBrush");
						_deselectMenuTool();
						_brushTool.classList.add("selected");
						_context.globalCompositeOperation = "source-over";
						_pickerToolPreview.classList.add("displayNone");
						_sizeToolContainer.classList.add("displayNone");
					}
					_size = _brushSize;
					_color = _brushColor;
					_getColor();
				},
				_selectPencil = function () {
					if (_toolSelected !== 1) {
						_toolSelected = 1; // MATITA
						_dom.classList.remove("useBrush", "useEraser", "usePicker");
						_dom.classList.add("usePencil");
						_deselectMenuTool();
						_pencilTool.classList.add("selected");
						_context.globalCompositeOperation = "source-over";
						_pickerToolPreview.classList.add("displayNone");
						_sizeToolContainer.classList.add("displayNone");
					}
					_color = _pencilColor;
					_size = _pencilSize;
				},
				_selectEraser = function () {
					if (_toolSelected !== 2) {
						_toolSelected = 2; // GOMMA
						_dom.classList.remove("usePencil", "useBrush", "usePicker");
						_dom.classList.add("useEraser");
						_deselectMenuTool();
						_eraserTool.classList.add("selected");
						_context.globalCompositeOperation = "destination-out";
						_pickerToolPreview.classList.add("displayNone");
						_sizeToolContainer.classList.add("displayNone");
					}
					_size = _eraserSize;
				},
				_selectPicker = function () {
					if (_toolSelected !== 3) {
						_toolSelected = 3; // PIPETTA
						_dom.classList.remove("usePencil", "useEraser", "useBrush");
						_dom.classList.add("usePicker");
						_deselectMenuTool();
						_pickerTool.classList.add("selected");
						_pickerToolColor2.style.backgroundColor = _randomColor ? "white" : _color;
						_pickerToolPreview.classList.remove("displayNone");
						_sizeToolContainer.classList.add("displayNone");
					}
					_color = _brushColor;
				},
				_selectRandomColor = function () {
					if (!_randomColor) {
						if (_toolSelected === 3)
							_selectBrush();
						_randomColor = true;
						_randomColorButton.classList.add("selected");
					}
					_getColor();
				},
				_updatePickerTool = function () {
					var px = _context.getImageData(_mouseX, _mouseY, 1, 1).data,
						__color = px[3] === 0 ? "white" : "rgb(" + px[0] + "," + px[1] + "," + px[2] + ")";
					_pickerToolColor.style.backgroundColor = __color;
					if (_isMouseDown && px[3] > 0) {
						_brushColor = __color;
						_randomColorButton.classList.remove("selected");
						_pickerToolColor2.style.backgroundColor = __color;
						_randomColor = false;
						_colorPicker.setColor(__color);
					}
				},
				_darkClick = function () {
					(_isSaving === false) && _hideOptions();
				},
				__keyDown = Info.macOS ?
				function (e) {
					return e.metaKey;
				} :
				function (e) {
					return e.ctrlKey;
				},
				_keyDown = function (e) {
					//console.log("editor: " + e.keyCode);
					var keyCode = e.keyCode;
					if (keyCode === 27) {
						e.preventDefault();
						e.stopPropagation();
					}
					if (_overlay) {
						if (keyCode === 27 || keyCode === 57) // esc o pulsante 9
							_hideOptions();
					} else {
						if (keyCode >= 48 && keyCode <= (48 + _editorMenuActionsLength) && !_isPressedShift) {
							_editorMenuActions[keyCode - 48]();
							return;
						}
						if (__keyDown(e))
							if (keyCode === 90) {
								if (e.shiftKey)
									_redo();
								else
									_undo();
								e.preventDefault();
								return;
							} else if (keyCode === 83) {
							_draft();
							e.preventDefault();
							return;
						}
						if (e.shiftKey) {
							_isPressedShift = true;
							e.preventDefault();
						}
					}
				},
				_keyUp = function (e) {
					e.preventDefault();
					if (e.keyCode === 16)
						_isPressedShift = false;
				},
				_mousedown = function (e) {
					var x = e.clientX,
						y = e.clientY;
					_sizeToolContainer.classList.add("displayNone");
					_grayscaleContainer.classList.add("displayNone");
					if (e.button === 0 && !_overlay) {
						_isMouseDown = true;
						if (_toolSelected === 3)
							_updatePickerTool();
						else {
							if (_isPressedShift && _oldX !== -1)
								_line(x, y);
							_checkCoord(x, y);
							_circle(x, y);
							_context.beginPath();
							//con le seguenti due righe si può creare una specie di pennello
							//_context.shadowBlur = 3;
							//_context.shadowColor = _color;
							_context.lineWidth = _size;
							_context.strokeStyle = _color;
							_context.lineJoin = "round";
							_context.lineCap = "round";
							_oldMidX = _mouseX;
							_oldMidY = _mouseY;
							_restored = false;
						}
					}
					return false;
				},
				_mousemove = function (e) {
					_mouseX = e.clientX;
					_mouseY = e.clientY;
					if (_overlay) return;
					if (_toolSelected === 3)
						_updatePickerTool();
					else if (_isMouseDown) {
						var midX = _oldX + _mouseX >> 1,
							midY = _oldY + _mouseY >> 1;
						_context.beginPath();
						_context.moveTo(midX, midY);
						_context.quadraticCurveTo(_oldX, _oldY, _oldMidX, _oldMidY);
						_context.stroke();
						_oldX = _mouseX;
						_oldY = _mouseY;
						_oldMidX = midX;
						_oldMidY = midY;
						_checkCoord(_mouseX, _mouseY);
						_restored = false;
					}
				},
				_mouseend = function (e) {
					if (!_isMouseDown) return;
					_isMouseDown = false;
					if (_toolSelected === 3) return;
					(_toolSelected === 0) && _getColor();
					_mouseX = e.clientX;
					_mouseY = e.clientY;
					if (_mouseX !== _oldX) {
						var midX = _oldX + _mouseX >> 1,
							midY = _oldY + _mouseY >> 1;
						_context.beginPath();
						_context.moveTo(_oldMidX, _oldMidY);
						_context.quadraticCurveTo(_oldX, _oldY, _mouseX, _mouseY);
						_context.stroke();
					}
					_saveStep();
				},
				_getMouseWheelDelta = function (deltaY) {
					var delta = MATH.round(deltaY / 20, 0);
					if (delta === 0)
						delta = deltaY < 0 ? -1 : 1;
					else if (delta < 0) {
						delta = MATH.min(delta, -1);
						delta = MATH.max(delta, -15);
					} else {
						delta = MATH.max(delta, 1);
						delta = MATH.min(delta, 15);
					}
					return delta;
				},
				_mouseWheel = function (e) {
					if (_isMouseDown || [0, 1, 2].indexOf(_toolSelected) === -1) return;
					var wheelY = Info.firefox ? -e.detail : e.wheelDeltaY;
					if (_toolSelected === 1) { // matita, quindi color picker a scrollbar
						_grayscaleContainer.classList.remove("displayNone");
						_grayscaleScroll(_getMouseWheelDelta(wheelY));
					} else { // pennello o gomma, quindi size picker a cerchio
						var size = _toolSelected === 0 ? _brushSize : _eraserSize;
						if ((wheelY > 0 && size < _maxToolSize) || (wheelY < 0 && size > 1))
							_setToolSize(_toolSelected, size + _getMouseWheelDelta(wheelY));
						_sizeToolContainer.classList.remove("displayNone");
					}
				},
				__grayscaleScroll = function () {
					_grayscaleIsScrolling = false;
				},
				_grayscaleScroll = function (y) {
					if (_grayscaleIsScrolling) return;
					_grayscaleIsScrolling = true;
					if (y < 0)
						_pencilColorID = MATH.min(_pencilColorID + 1, 15);
					else
						_pencilColorID = MATH.max(_pencilColorID - 1, 0);
					_color = _pencilColor = _grayscaleColors[_pencilColorID];
					_grayscalePointer.style.top = _pencilColorID * 20 + 2 + "px";
					_grayscalePointer.style.borderColor = "transparent transparent transparent " + _pencilColor;
					setTimeout(__grayscaleScroll, 100);
				},
				_setToolSize = function (tool, size) {
					// setta un valore per il picker del tool passato -> 0: brush, 2: eraser
					size = MATH.min(size, 200);
					size = MATH.max(size, 1);
					if (tool === 0) {
						_size = _brushSize = size;
					} else if (tool === 2) {
						_size = _eraserSize = size;
					} else return;
					var sizepx = size + "px",
						size2 = "-" + (size / 2) + "px";
					_sizeToolLabel.innerHTML = sizepx;
					_sizeToolPreview.style.width = sizepx;
					_sizeToolPreview.style.height = sizepx;
					_sizeToolPreview.style.marginTop = size2;
					_sizeToolPreview.style.marginLeft = size2;
					_sizeToolPreview.style.backgroundColor = (tool === 0 && !_randomColor ? _color : "white");
				},
				_getColor = function () {
					if (_randomColor && _toolSelected === 0) {
						//function (a,b,c){return"#"+((256+a<<8|b)<<8|c).toString(16).slice(1)};
						_color = "rgb(" + random(255) + ", " + random(255) + ", " + random(255) + ")";
						_colorPicker.setColor(_color);
					}
					return _color;
				},
				_clear = function () {
					_context.clearRect(0, 0, XX, YY);
					_minX = _minY = _maxX = _maxY = _oldX = _oldY = -1;
					_restored = false;
				},
				_toggleBackground = function () {
					if (_dom.classList.contains("squares")) {
						_dom.classList.remove("squares");
						_dom.classList.add("lines");
						_optionSquare.innerHTML = label["FoglioBianco"];
					} else if (_dom.classList.contains("lines")) {
						_dom.classList.remove("lines");
						_optionSquare.innerHTML = label["FoglioQuadretti"];
					} else {
						_dom.classList.add("squares");
						_optionSquare.innerHTML = label["FoglioRighe"];
					}
				},
				_showOptions = function () {
					_overlay = true;
					Utils.overlay.show(_darkClick);
					Utils.fadeInElements(_options);
					Utils.fadeOutElements(_pickerToolPreview);
					Utils.fadeOutElements(_sizeToolContainer);
				},
				_hideOptions = function () {
					_overlay = false;
					Utils.fadeOutElements(_options);
					Utils.overlay.hide();
					Utils.fadeOutElements(_sizeToolContainer);
					if (_toolSelected === 3) {
						_pickerToolColor2.style.backgroundColor = _randomColor ? "white" : _color
						Utils.fadeInElements(_pickerToolPreview);
					}
				},
				_undo = function (e) {
					var step = _step[_currentStep + 1];
					if (step) {
						var _tot = _step.length - _currentStep - 2;
						_currentStep = _currentStep + 1;
						_clear();
						_restoreStep(step);
						if (!_tot)
							_disableElements(_editorUndo);
						_enableElements(_editorRedo);
						_restored = false;
					}
				},
				_redo = function () {
					if (_currentStep > 0) {
						_currentStep -= 1;
						var step = _step[_currentStep];
						_clear();
						_restoreStep(step);
						_enableElements(_editorUndo);
						if (_currentStep <= 0)
							_disableElements(_editorRedo);
					}
				},
				show = function (x, y) {
					var _tot = _step.length - _currentStep - 1;
					!_isInit && _init();
					_dom.classList.add("semiTransparent");
					Dashboard.overshadow();
					_addEvents();
					Utils.fadeInElements(_editorContainer);
					_colorPicker.show();
					if (!_draft.data)
						_disableElements(_domGet("#optionRestore"));
					if (_step.length - _currentStep <= 1)
						_disableElements(_editorUndo);
					if (_currentStep === 0)
						_disableElements(_editorRedo);
					(_toolSelected === 0) && _getColor();
				},
				_hide = function () {
					_hideOptions();
					_colorPicker.hide();
					Utils.fadeOutElements(_editorContainer);
					_removeEvents();
					Dashboard.foreground();
				},
				_draft = function () {
					if (_maxX !== -1 || _maxY !== -1) {
						_draft = _saveLayer();
						_enableElements(_optionRestore);
					}
				},
				_restore = function () {
					if (_draft.minX && !_restored) {
						_clear();
						_context.putImageData(_draft.data, _draft.minX, _draft.minY);
						_minX = _draft.minX;
						_minY = _draft.minY;
						_maxX = _draft.maxX;
						_maxY = _draft.maxY;
						_oldX = _draft.oldX;
						_oldY = _draft.oldY;
						_saveStep();
						_restored = true;
						//_disableElements(_domGet("#optionRestore"));
						//_draft = {};
					}
				},
				onUserLogin = function (user) {
					_currentUser = user;
				},
				onUserLogout = function () {
					_currentUser = {};
				},
				onSocketMessage = function (data) { // OK - qui riceviamo le risposte ai salvataggi
					Utils.setSpinner(false);
					_isSaving = false;
					data = JSON.parse(data);
					if (data.ok) {
						_savedDraw.id = data.id;
						(_currentUser.id) && (_savedDraw.user = _currentUser);
						Dashboard.addDraw(_savedDraw, true);
						_savedDraw = undefined;
						_clear();
						_step = [];
						_currentStep = 0;
						_saveStep();
						_draft = {};
						_dom.classList.remove("semiTransparent");
						_hide();
					} else {
						Messages.error(label["editorSaveError"]);
					}
				},
				_saveToServer = function (draw) {
					if (_currentUser.id) {
						draw.userId = _currentUser.id;
						socket.emit("editor save", draw);
					} else {
						Messages.alert(label["genericError"]);
						Utils.setSpinner(false);
					}
				},
				_save = function () { // OK
					if (_maxX === -1 || _maxY === -1) {
						Messages.alert(label["nothingToSave"]);
					} else {
						if (Messages.confirm(label["editorSaveConfirm"])) {
							_isSaving = true;
							Utils.setSpinner(true, true);
							_savedDraw = _saveLayer();
							var _coords = Dashboard.getCoords(),
								_tempCanvas = DOCUMENT.createElement("canvas");
							_tempCanvas.width = _savedDraw.data.width;
							_tempCanvas.height = _savedDraw.data.height;
							_tempCanvas.getContext("2d").putImageData(_savedDraw.data, 0, 0);
							_savedDraw.base64 = _tempCanvas.toDataURL("image/png");
							_savedDraw.w = _savedDraw.maxX - _savedDraw.minX;
							_savedDraw.h = _savedDraw.maxY - _savedDraw.minY;
							_savedDraw.x = _savedDraw.minX - XX2 + _coords.x; // coordinate del px in alto a sx rispetto alle coordinate assolute correnti della lavagna
							_savedDraw.y = _coords.y + (YY2 - _savedDraw.minY);
							_savedDraw.r = _savedDraw.x + _savedDraw.w; // ccordinate assolute massime e minime del disegno
							_savedDraw.b = _savedDraw.y - _savedDraw.h;
							_savedDraw.data = undefined;
							delete _savedDraw.data;
							delete _savedDraw.oldX;
							delete _savedDraw.oldY;
							delete _savedDraw.maxX;
							delete _savedDraw.maxY;
							delete _savedDraw.minX;
							delete _savedDraw.minY;
							_saveToServer(_savedDraw);
						}
					}
				},
				_export = function () {
					if (_maxX === -1 || _maxY === -1)
						Messages.warning(label["NienteDaEsportare"]);
					else {
						var canvas = DOCUMENT.createElement("canvas");
						canvas.width = _maxX - _minX;
						canvas.height = _maxY - _minY;
						canvas.getContext("2d").putImageData(_context.getImageData(_minX, _minY, _maxX, _maxY), 0, 0);
						WINDOW.open(canvas.toDataURL("image/png"), "_blank");
					}
				},
				clear = function (force) {
					if (Messages.confirm(label["areYouSure"])) {
						_clear();
						_step = [];
						_currentStep = 0;
						//_draft = {};
						_saveStep();
						_disableElements(_domGetAll("#editorUndo, #editorRedo"));
						//_editorUndo.innerHTML = _labelAnnulla;
					}
				},
				_onResize = function () {

				},
				setColor = function (rgb) {
					if (rgb) {
						_brushColor = _color = rgb;
						_randomColor = false;
						_randomColorButton.classList.remove("selected");
					} else {
						_randomColor = true;
						_getColor();
						_brushColor = _color;
					}
					_selectBrush();
				};

			// auto-init del modulo Editor
			_minX = _minY = _maxX = _maxY = _oldX = _oldY = -1;
			_isInit = _isMouseDown = _isPressedShift = false;
			return {
				show: show,
				setColor: setColor,
				onSocketMessage: onSocketMessage,
				onUserLogin: onUserLogin,
				onUserLogout: onUserLogout
					/*,
			hide	: hide,
			save	: function (data) { return Utils.CK(save,	"Error: editor cannot save. ",	data) },
			*/
			}
		})(),

		Overlay = (function () {
			// rappresenta l'elemento che finisce sopra la lavagna per mostrare le ricerche, utenti, pagine ecc.
			// gli altri moduli lo possono richiamare e riempire
			var _dom = DOCUMENT.querySelector("#overlay"),
				_isVisible = false,
				_html = "",
				_appear = function (html) {
					// fa comparire l'overlay già al centro con effetto fade
					_isVisible = true;
					_html = html;
					return true;
				},
				_reappear = function () {
					if (_html > "") {
						// fa comparire l'overlay dal basso per mostrare quello che già conteneva in _html
						_isVisible = true;
						return true;
					} else
						return false;
				},
				show = function (html) {
					if (html)
						return _appear(html); // se voglio visualizzare qualcosa di nuovo, basta passare l'html e quello già presente viene ignorato
					else if (_html > "")
						return _reappear(); // se lo richiamo semplicemente con .show() provo a rimostrare quello di prima
					else
						return false; // se non ho passato niente, e non avevo niente, non faccio niente. per aprire pagina news base si farà App.News.show();
				},
				hide = function () {
					// fa scomparire verso il basso senza svuotare contenuto
					_isVisible = false;
				},
				close = function () {
					// se si preme sulla X in alto dx, fa scomparire con effetto fade, poi viene svuotato.
					_html = "";
					_isVisible = false;
				};
			return {
				show: show,
				hide: hide,
				close: close
			}
		})(),

		News = (function () {
			// modulo che renderizza la pagina a quadrettoni delle news / risultati ricerca per tag, data, paese, classifica
			var _template = "",
				_render = function (params, VisEffettoFigo) {
					// riempie _template coi parametri
					// se VisEffettoFigo è true si aggiunge il js per muovere i quadrettoni con effetto comparsa da dx
					var result = _template;
					return result;
				},
				show = function (query) {
					var params = { // deve contenere l'identificativo di connessione, e tutto il necessario
						query: query // se query è vuota, il lato server restituirà la pagina default con nuove news
					};
					var result = Utils.getRemoteData(Config.services.news, params);
					if (Utils.isEmpty(result))
						Messages.error(label["ConnectionError"]);
					else {
						var html = _render(result, Utils.isEmpty(query));
						Overlay.show(html);
					}
				};
			return {
				show: show
			}
		})(),

		UserPage = (function () {
			// elemento che renderizza le pagine degli utenti
			var _render = function (params) {
					// contiene template html e lo riempie coi parametri
					var template = "bla bla bla ";
					return template;
				},
				show = function (idUser) {
					var params = { // deve contenere l'identificativo di connessione, e tutto il necessario
						idUser: idUser
					};
					var result = Utils.getRemoteData(Config.services.news, params);
					if (Utils.isEmpty(result))
						Messages.error(label["ConnectionError"]);
					else {
						var html = _render(result);
						Overlay.show(html);
					}
				};
			return {
				show: show
			}
		})(),

		CurrentUser = (function () {
			var _popup, _closeButton, socket = Socket,
				_logged = false,
				_userInfo = {},
				_callbackLoginOK = false,
				_callbackLoginKO = false,
				init = function () {
					_popup = _domGet("#socialLoginPopup");
					_closeButton = _domGet("#socialLoginPopup .close");
					_closeButton.addEventListener("click", _hideLogin);
					_facebook.init();
				},
				isLogged = function () {
					return _logged;
				},
				_login = function (mode, data) {
					if (mode === "fb") {
						delete data.updated_time;
						delete data.verified;
					}
					(!_userInfo.name) && (_userInfo.name = data.name);
					(!_userInfo.email) && (_userInfo.email = data.email);
					(!_userInfo.locale) && (_userInfo.locale = data.locale);
					_userInfo[mode] = data;
					socket.emit("user login", _userInfo);
				},
				logout = function () {
					if (Messages.confirm(label["areYouSure"])) {
						_logged = false;
						_userInfo = {};
						_onLogout();
						_facebook.logout();
					}
				},
				doLogin = function () {
					return new Promise(_asyncLoginPopup);
				},
				_asyncLoginPopup = function (resolve, reject) {
					if (_logged) {
						resolve(true);
					} else {
						_callbackLoginOK = resolve;
						_callbackLoginKO = reject;
						_showLogin();
					}
				},
				_showLogin = function () {
					Utils.overlay.show(_hideLogin);
					Utils.fadeInElements(_popup);
				},
				_hideLogin = function () {
					Utils.overlay.hide();
					Utils.fadeOutElements(_popup);
					if (_callbackLoginOK !== false) {
						_callbackLoginKO(false);
						_callbackLoginOK = _callbackLoginKO = false;
					}
				},
				_onLogin = function () {
					Editor.onUserLogin(_userInfo);
				},
				_onLogout = function () {
					Editor.onUserLogout();
				},
				onSocketLogin = function (data) {
					var user = JSON.parse(data);
					if (user.id) {
						if (user.new) { // TODO: gli chiedo altre info in fase di registrazione, tipo nome d'arte

						}
						_userInfo.id = user.id;
						_logged = true;
						_onLogin();
						(_callbackLoginOK !== false) && _callbackLoginOK(true);
					} else {
						(_callbackLoginKO !== false) && _callbackLoginKO(false);
					}
					(_callbackLoginKO !== false) && _hideLogin();
					_callbackLoginOK = _callbackLoginKO = false;
				},
				_facebook = (function () {
					var config = Config.fb,
						_loginButton, _logged, _status,
						init = function () {
							WINDOW.fbAsyncInit = function () {
								FB.init({
									appId: config.appId,
									cookie: true, // enable cookies to allow the server to access the session
									xfbml: true, // parse social plugins on this page
									version: config.apiVersion
								});
								FB.getLoginStatus(_loginCallback);
							};
							(function (d, s, id) { // Load the SDK asynchronously
								var js, fjs = d.getElementsByTagName(s)[0];
								if (d.getElementById(id)) return;
								js = d.createElement(s);
								js.id = id;
								js.src = "//connect.facebook.net/en_US/sdk.js";
								fjs.parentNode.insertBefore(js, fjs);
							}(document, "script", "facebook-jssdk"));
							_loginButton = _domGet("#fbLogin");
							_loginButton.querySelector("img").addEventListener("click", function () {
								var fb = FB;
								fb && fb.login(_loginCallback, {
									scope: "public_profile,email"
								});
							});
							_logged = _domGet("#fbLogged");
							_status = _domGet("#fbStatus");
						},
						_getUserInfo = function () {
							FB.api("/me", function (response) {
								console.log("User Info: ", response);
								_status.innerHTML = label["loggedAs"] + response.name;
								// TODO qui devo cercare con le api di fb le altre info che voglio salvare, tipo l'immagine di profilo
								//graph.facebook.com/{{fid}}/picture?type=large
								_login("fb", response);
							});
						},
						_loginCallback = function (response) {
							console.log("Login", response);
							_status.innerHTML = "";
							if (response.status === "connected") {
								_logged.classList.remove("displayNone");
								_loginButton.classList.add("displayNone");
								_getUserInfo();
							} else {
								_logged.classList.add("displayNone");
								_loginButton.classList.remove("displayNone");
							}
						},
						logout = function () {

						};
					return {
						init: init,
						logout: logout
					};
				})();
			return {
				init: init,
				isLogged: isLogged,
				doLogin: doLogin,
				onSocketLogin: onSocketLogin
			}
		})(),

		Messages = (function () {
			// overlay per i messaggi agli utenti: caricamento, errore, salvataggio ecc
			var _dom = DOCUMENT.querySelector("#messages"),
				_template = "",
				_btnTemplate,
				_render = function (image, msg, buttons) {
					// inserisce le variabili dentro ai template
					var result = "";
					return result;
				},
				_show = function (html) {
					// oscura lo sfondo e fa comparire l'elemento dom
					_dom.innerHTML = html;
					return true;
				},
				error = function (msg) {
					var image = '<img src="" class="">'; // logo di errore
					var buttons = {
						"OK": Messages._close
					};
					//_show(_render(image, msg, buttons));
				},
				loading = function (msg) {
					//_show(_render(image, msg, buttons));
				},
				remove = function () {
					// rimuove il messages, usato per far terminare il loading
				},
				info = function (msg) {
					var image = '<img src="" class="">'; // logo info
					var buttons = {
						"Annulla": Messages._close
					};
					//_show(_render(image, msg, buttons));
				},
				_close = function () {
					// fa scomparire l'elemento e toglie overlay scuro
					return true;
				},
				warning = function (msg) {
					// pensata come piccolo messaggio in un angolo dello schermo che scompare da solo e non richiede interazione
					WINDOW.alert(msg);
				},
				confirm = function (msg) {
					// in realtà creeremo una finestra ad hoc gestita con show, close, hide
					return WINDOW.confirm(msg);
				},
				alert = function (msg) {
					WINDOW.alert(msg);
				},
				custom = function (msg, buttons) {

				};
			return {
				error: error,
				loading: loading,
				info: info,
				confirm: confirm,
				alert: alert,
				custom: custom,
				warning: warning,
				remove: remove
			}
		})(),

		Init = function () {
			// qui ci sarà il driver lato client che legge l'url corrente e si inizializza e crea la pagina di conseguenza
			var _onResize = function () {
				XX = WINDOW.innerWidth;
				YY = WINDOW.innerHeight;
				XX2 = XX / 2;
				YY2 = YY / 2;
				DXX = 2 * XX;
				DYY = 2 * YY;
			};
			_onResize();
			_darkOverlay = _domGet("#darkOverlay");
			_spinner = _domGet("#spinner");
			_mouseWheelEvent = Info.firefox ? "DOMMouseScroll" : "mousewheel";
			WINDOW.addEventListener("resize", _onResize, true);
			DOCUMENT.body.addEventListener("mousedown", preventDefault, true);
			DOCUMENT.body.addEventListener("mousemove", preventDefault, true);
			DOCUMENT.body.addEventListener("mouseup", preventDefault, true);
			DOCUMENT.body.addEventListener("mouseout", preventDefault, true);
			var requestUrl = DOCUMENT.location.href;
			Socket.init();
			if (true) { // url corrente corrispondente ad home
				CurrentUser.init();
				Dashboard.init();
			}
		};

	return { // moduli pubblici di App
		Init: Init,
		Config: Config,
		Info: Info,
		Socket: Socket,
		Worker: Worker,
		Dashboard: Dashboard,
		Editor: Editor,
		Messages: Messages,
		Overlay: Overlay,
		News: News,
		UserPage: UserPage,
		CurrentUser: CurrentUser
	};
})();
