///<reference path='../node_modules/@types/facebook-js-sdk/index.d.ts'/>
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
/* constants */
var appStateKey = 'appState';
var strategyListPath = './strategy-list.json';
/* model */
var Model = (function () {
    function Model() {
    }
    Model.prototype.init = function (state) {
        this.version = state.version;
        this.strategies = state.strategies;
        this.unviewedStrategyIds = state.unviewedStrategyIds;
        this.currentStrategy = state.currentStrategy;
    };
    Model.prototype.setCurrentStrategy = function (viewedId) {
        this.unviewedStrategyIds = this.unviewedStrategyIds.filter(function (id) { return id !== viewedId; });
        this.currentStrategy = this.strategies.filter(function (strategy) { return strategy.id === viewedId; })[0];
        return this.currentStrategy;
    };
    Model.prototype.getNextStrategyId = function () {
        if (this.unviewedStrategyIds.length === 0)
            return null;
        return this.unviewedStrategyIds[Math.floor(Math.random() * this.unviewedStrategyIds.length)];
    };
    Model.prototype.resetUnviewedStrategies = function () {
        this.unviewedStrategyIds = this.strategies.map(function (strategy) { return strategy.id; });
    };
    return Model;
}());
/* view-model */
var ViewModel = (function () {
    function ViewModel(model, service, router) {
        var _this = this;
        this.model = model;
        this.service = service;
        this.router = router;
        this.initModel().then(function () {
            _this.initViewModel();
        });
    }
    ViewModel.prototype.initViewModel = function () {
        var _this = this;
        this.strategy = document.getElementById('o-strategy');
        this.nextButton = document.getElementById('o-next');
        this.facebookShareLink = document.getElementById('o-facebook-share');
        this.twitterLink = document.getElementById('o-twitter-tweet');
        this.nextButton.addEventListener("click", function () {
            _this.tryDisplayNextStrategy();
        });
        this.facebookShareLink.addEventListener("click", function () {
            FB.ui({
                method: 'share',
                href: location.href,
                quote: _this.model.currentStrategy.text,
            }, function (response) { });
        });
        this.twitterLink.addEventListener("click", function () {
            var href = 'https://twitter.com/intent/tweet?';
            href = href + 'text=' + encodeURIComponent(_this.model.currentStrategy.text);
            href = href + '&url=' + encodeURIComponent('http://oblique.me');
            href = href + '&hashtags=ObliqueMe';
            _this.twitterLink.href = href;
        });
        this.nextButton.addEventListener("mouseup", function () {
            _this.nextButton.blur();
        });
        this.router.registerStateChangeHandler(function (id) {
            var currentStrategyText = _this.model.setCurrentStrategy(id).text;
            var url = location.href;
            _this.strategy.innerHTML = currentStrategyText;
            _this.service.cacheAppState(_this.model);
        });
        if (this.router.getCurrentState().length > 0) {
            this.router.navigateToStrategy(this.router.getCurrentState(), true);
        }
        else if (this.model.currentStrategy) {
            this.router.navigateToStrategy(this.model.currentStrategy.id, true);
        }
        else {
            this.tryDisplayNextStrategy(true);
        }
    };
    ViewModel.prototype.tryDisplayNextStrategy = function (replace) {
        if (replace === void 0) { replace = false; }
        var nextId = this.model.getNextStrategyId();
        if (nextId) {
            this.router.navigateToStrategy(nextId, replace);
        }
        else {
            this.model.resetUnviewedStrategies();
            this.service.cacheAppState(this.model);
            this.tryDisplayNextStrategy(replace);
        }
    };
    ViewModel.prototype.initModel = function () {
        return __awaiter(this, void 0, void 0, function () {
            var appState;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.service.getAppState()];
                    case 1:
                        appState = _a.sent();
                        this.model.init(appState);
                        return [2 /*return*/];
                }
            });
        });
    };
    return ViewModel;
}());
/* service */
var Service = (function () {
    function Service() {
    }
    Service.prototype.getAppState = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var cachedAppStateString = localStorage.getItem(appStateKey);
                        var cachedAppState = cachedAppStateString ? JSON.parse(cachedAppStateString) : null;
                        Util.loadJson(strategyListPath).then(function (strategyList) {
                            if (!cachedAppState || strategyList.version !== cachedAppState.version) {
                                var appState = {
                                    version: strategyList.version,
                                    strategies: strategyList.strategies,
                                    unviewedStrategyIds: strategyList.strategies.map(function (strategy) { return strategy.id; }),
                                    currentStrategy: null,
                                };
                                resolve(appState);
                                _this.cacheAppState(appState);
                            }
                            else {
                                resolve(cachedAppState);
                            }
                        });
                    })];
            });
        });
    };
    Service.prototype.cacheAppState = function (appState) {
        localStorage.setItem(appStateKey, JSON.stringify(appState));
    };
    return Service;
}());
/* router */
var Router = (function () {
    function Router() {
        var _this = this;
        this.stateChangeCallbacks = [];
        window.onpopstate = (function (ev) {
            _this.onStateChange(ev.state);
        });
    }
    Router.prototype.registerStateChangeHandler = function (callback) {
        this.stateChangeCallbacks.push(callback);
    };
    Router.prototype.onStateChange = function (state) {
        this.stateChangeCallbacks.forEach(function (callback) { return callback(state); });
    };
    Router.prototype.navigateToStrategy = function (id, replace) {
        if (replace === void 0) { replace = false; }
        if (replace)
            history.replaceState(id, 'Oblique #' + id, '?s=' + id);
        else
            history.pushState(id, 'Oblique #' + id, '?s=' + id);
        this.onStateChange(id);
    };
    Router.prototype.getCurrentState = function () {
        var pathArray = location.search.split('?s=');
        return pathArray[pathArray.length - 1];
    };
    return Router;
}());
/* helpers */
var Util = (function () {
    function Util() {
    }
    Util.loadJson = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var request = new XMLHttpRequest();
                        request.open('GET', url);
                        request.onload = function () {
                            if (request.status === 200) {
                                resolve(JSON.parse(request.response));
                            }
                            else {
                                reject(Error('json file did not load. error code:' + request.statusText));
                            }
                        };
                        request.onerror = function () {
                            reject(Error('There was a network error loading json.'));
                        };
                        request.send();
                    })];
            });
        });
    };
    return Util;
}());
/* init */
var model = new Model();
var service = new Service();
var router = new Router();
var viewModel = new ViewModel(model, service, router);
