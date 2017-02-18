var $jscomp={scope:{}};$jscomp.defineProperty="function"==typeof Object.defineProperties?Object.defineProperty:function(b,a,c){if(c.get||c.set)throw new TypeError("ES3 does not support getters and setters.");b!=Array.prototype&&b!=Object.prototype&&(b[a]=c.value)};$jscomp.getGlobal=function(b){return"undefined"!=typeof window&&window===b?b:"undefined"!=typeof global&&null!=global?global:b};$jscomp.global=$jscomp.getGlobal(this);$jscomp.SYMBOL_PREFIX="jscomp_symbol_";
$jscomp.initSymbol=function(){$jscomp.initSymbol=function(){};$jscomp.global.Symbol||($jscomp.global.Symbol=$jscomp.Symbol)};$jscomp.symbolCounter_=0;$jscomp.Symbol=function(b){return $jscomp.SYMBOL_PREFIX+(b||"")+$jscomp.symbolCounter_++};
$jscomp.initSymbolIterator=function(){$jscomp.initSymbol();var b=$jscomp.global.Symbol.iterator;b||(b=$jscomp.global.Symbol.iterator=$jscomp.global.Symbol("iterator"));"function"!=typeof Array.prototype[b]&&$jscomp.defineProperty(Array.prototype,b,{configurable:!0,writable:!0,value:function(){return $jscomp.arrayIterator(this)}});$jscomp.initSymbolIterator=function(){}};$jscomp.arrayIterator=function(b){var a=0;return $jscomp.iteratorPrototype(function(){return a<b.length?{done:!1,value:b[a++]}:{done:!0}})};
$jscomp.iteratorPrototype=function(b){$jscomp.initSymbolIterator();b={next:b};b[$jscomp.global.Symbol.iterator]=function(){return this};return b};$jscomp.makeIterator=function(b){$jscomp.initSymbolIterator();var a=b[Symbol.iterator];return a?a.call(b):$jscomp.arrayIterator(b)};
$jscomp.polyfill=function(b,a,c,d){if(a){c=$jscomp.global;b=b.split(".");for(d=0;d<b.length-1;d++){var f=b[d];f in c||(c[f]={});c=c[f]}b=b[b.length-1];d=c[b];a=a(d);a!=d&&null!=a&&$jscomp.defineProperty(c,b,{configurable:!0,writable:!0,value:a})}};$jscomp.EXPOSE_ASYNC_EXECUTOR=!0;$jscomp.FORCE_POLYFILL_PROMISE=!1;
$jscomp.polyfill("Promise",function(b){function a(){this.batch_=null}if(b&&!$jscomp.FORCE_POLYFILL_PROMISE)return b;a.prototype.asyncExecute=function(a){null==this.batch_&&(this.batch_=[],this.asyncExecuteBatch_());this.batch_.push(a);return this};a.prototype.asyncExecuteBatch_=function(){var a=this;this.asyncExecuteFunction(function(){a.executeBatch_()})};var c=$jscomp.global.setTimeout;a.prototype.asyncExecuteFunction=function(a){c(a,0)};a.prototype.executeBatch_=function(){for(;this.batch_&&this.batch_.length;){var a=
this.batch_;this.batch_=[];for(var b=0;b<a.length;++b){var e=a[b];delete a[b];try{e()}catch(h){this.asyncThrow_(h)}}}this.batch_=null};a.prototype.asyncThrow_=function(a){this.asyncExecuteFunction(function(){throw a;})};var d=function(a){this.state_=0;this.result_=void 0;this.onSettledCallbacks_=[];var b=this.createResolveAndReject_();try{a(b.resolve,b.reject)}catch(e){b.reject(e)}};d.prototype.createResolveAndReject_=function(){function a(a){return function(g){e||(e=!0,a.call(b,g))}}var b=this,e=
!1;return{resolve:a(this.resolveTo_),reject:a(this.reject_)}};d.prototype.resolveTo_=function(a){if(a===this)this.reject_(new TypeError("A Promise cannot resolve to itself"));else if(a instanceof d)this.settleSameAsPromise_(a);else{var b;a:switch(typeof a){case "object":b=null!=a;break a;case "function":b=!0;break a;default:b=!1}b?this.resolveToNonPromiseObj_(a):this.fulfill_(a)}};d.prototype.resolveToNonPromiseObj_=function(a){var b=void 0;try{b=a.then}catch(e){this.reject_(e);return}"function"==
typeof b?this.settleSameAsThenable_(b,a):this.fulfill_(a)};d.prototype.reject_=function(a){this.settle_(2,a)};d.prototype.fulfill_=function(a){this.settle_(1,a)};d.prototype.settle_=function(a,b){if(0!=this.state_)throw Error("Cannot settle("+a+", "+b|"): Promise already settled in state"+this.state_);this.state_=a;this.result_=b;this.executeOnSettledCallbacks_()};d.prototype.executeOnSettledCallbacks_=function(){if(null!=this.onSettledCallbacks_){for(var a=this.onSettledCallbacks_,b=0;b<a.length;++b)a[b].call(),
a[b]=null;this.onSettledCallbacks_=null}};var f=new a;d.prototype.settleSameAsPromise_=function(a){var b=this.createResolveAndReject_();a.callWhenSettled_(b.resolve,b.reject)};d.prototype.settleSameAsThenable_=function(a,b){var e=this.createResolveAndReject_();try{a.call(b,e.resolve,e.reject)}catch(h){e.reject(h)}};d.prototype.then=function(a,b){function e(a,b){return"function"==typeof a?function(b){try{c(a(b))}catch(n){g(n)}}:b}var c,g,f=new d(function(a,b){c=a;g=b});this.callWhenSettled_(e(a,c),
e(b,g));return f};d.prototype.catch=function(a){return this.then(void 0,a)};d.prototype.callWhenSettled_=function(a,b){function e(){switch(c.state_){case 1:a(c.result_);break;case 2:b(c.result_);break;default:throw Error("Unexpected state: "+c.state_);}}var c=this;null==this.onSettledCallbacks_?f.asyncExecute(e):this.onSettledCallbacks_.push(function(){f.asyncExecute(e)})};d.resolve=function(a){return a instanceof d?a:new d(function(b,c){b(a)})};d.reject=function(a){return new d(function(b,c){c(a)})};
d.race=function(a){return new d(function(b,c){for(var e=$jscomp.makeIterator(a),f=e.next();!f.done;f=e.next())d.resolve(f.value).callWhenSettled_(b,c)})};d.all=function(a){var b=$jscomp.makeIterator(a),c=b.next();return c.done?d.resolve([]):new d(function(a,e){function f(b){return function(c){h[b]=c;g--;0==g&&a(h)}}var h=[],g=0;do h.push(void 0),g++,d.resolve(c.value).callWhenSettled_(f(h.length-1),e),c=b.next();while(!c.done)})};$jscomp.EXPOSE_ASYNC_EXECUTOR&&(d.$jscomp$new$AsyncExecutor=function(){return new a});
return d},"es6-impl","es3");
var __awaiter=this&&this.__awaiter||function(b,a,c,d){return new (c||(c=Promise))(function(f,g){function k(a){try{h(d.next(a))}catch(l){g(l)}}function e(a){try{h(d["throw"](a))}catch(l){g(l)}}function h(a){a.done?f(a.value):(new c(function(b){b(a.value)})).then(k,e)}h((d=d.apply(b,a||[])).next())})},__generator=this&&this.__generator||function(b,a){function c(a){return function(b){return d([a,b])}}function d(c){if(g)throw new TypeError("Generator is already executing.");for(;f;)try{if(g=1,k&&(e=k[c[0]&
2?"return":c[0]?"throw":"next"])&&!(e=e.call(k,c[1])).done)return e;if(k=0,e)c=[0,e.value];switch(c[0]){case 0:case 1:e=c;break;case 4:return f.label++,{value:c[1],done:!1};case 5:f.label++;k=c[1];c=[0];continue;case 7:c=f.ops.pop();f.trys.pop();continue;default:if(!(e=f.trys,e=0<e.length&&e[e.length-1])&&(6===c[0]||2===c[0])){f=0;continue}if(3===c[0]&&(!e||c[1]>e[0]&&c[1]<e[3]))f.label=c[1];else if(6===c[0]&&f.label<e[1])f.label=e[1],e=c;else if(e&&f.label<e[2])f.label=e[2],f.ops.push(c);else{e[2]&&
f.ops.pop();f.trys.pop();continue}}c=a.call(b,f)}catch(m){c=[6,m],k=0}finally{g=e=0}if(c[0]&5)throw c[1];return{value:c[0]?c[1]:void 0,done:!0}}var f={label:0,sent:function(){if(e[0]&1)throw e[1];return e[1]},trys:[],ops:[]},g,k,e;return{next:c(0),"throw":c(1),"return":c(2)}},appStateKey="appState",strategyListPath="./strategy-list.json",Model=function(){function b(){}b.prototype.init=function(a){this.version=a.version;this.strategies=a.strategies;this.unviewedStrategyIds=a.unviewedStrategyIds;this.currentStrategy=
a.currentStrategy};b.prototype.setCurrentStrategy=function(a){this.unviewedStrategyIds=this.unviewedStrategyIds.filter(function(b){return b!==a});return this.currentStrategy=this.strategies.filter(function(b){return b.id===a})[0]};b.prototype.getNextStrategyId=function(){return 0===this.unviewedStrategyIds.length?null:this.unviewedStrategyIds[Math.floor(Math.random()*this.unviewedStrategyIds.length)]};b.prototype.resetUnviewedStrategies=function(){this.unviewedStrategyIds=this.strategies.map(function(a){return a.id})};
return b}(),ViewModel=function(){function b(a,b,d){var c=this;this.model=a;this.service=b;this.router=d;this.initModel().then(function(){c.initViewModel()})}b.prototype.initViewModel=function(){var a=this;this.strategy=document.getElementById("o-strategy");this.nextButton=document.getElementById("o-next");this.facebookShareLink=document.getElementById("o-facebook-share");this.twitterLink=document.getElementById("o-twitter-tweet");this.nextButton.addEventListener("click",function(){a.tryDisplayNextStrategy()});
this.facebookShareLink.addEventListener("click",function(){FB.ui({method:"share",href:location.href,quote:a.model.currentStrategy.text},function(a){})});this.twitterLink.addEventListener("click",function(){var b;b="https://twitter.com/intent/tweet?text\x3d"+encodeURIComponent(a.model.currentStrategy.text);b=b+"\x26url\x3d"+encodeURIComponent("http://oblique.me");a.twitterLink.href=b+"\x26hashtags\x3dObliqueMe"});this.nextButton.addEventListener("mouseup",function(){a.nextButton.blur()});this.router.registerStateChangeHandler(function(b){b=
a.model.setCurrentStrategy(b).text;a.strategy.innerHTML=b;a.service.cacheAppState(a.model)});0<this.router.getCurrentState().length?this.router.navigateToStrategy(this.router.getCurrentState(),!0):this.model.currentStrategy?this.router.navigateToStrategy(this.model.currentStrategy.id,!0):this.tryDisplayNextStrategy(!0)};b.prototype.tryDisplayNextStrategy=function(a){void 0===a&&(a=!1);var b=this.model.getNextStrategyId();b?this.router.navigateToStrategy(b,a):(this.model.resetUnviewedStrategies(),
this.service.cacheAppState(this.model),this.tryDisplayNextStrategy(a))};b.prototype.initModel=function(){return __awaiter(this,void 0,void 0,function(){var a;return __generator(this,function(b){switch(b.label){case 0:return[4,this.service.getAppState()];case 1:return a=b.sent(),this.model.init(a),[2]}})})};return b}(),Service=function(){function b(){}b.prototype.getAppState=function(){return __awaiter(this,void 0,void 0,function(){var a=this;return __generator(this,function(b){return[2,new Promise(function(b,
c){var d=(c=localStorage.getItem(appStateKey))?JSON.parse(c):null;Util.loadJson(strategyListPath).then(function(c){d&&c.version===d.version?b(d):(c={version:c.version,strategies:c.strategies,unviewedStrategyIds:c.strategies.map(function(a){return a.id}),currentStrategy:null},b(c),a.cacheAppState(c))})})]})})};b.prototype.cacheAppState=function(a){localStorage.setItem(appStateKey,JSON.stringify(a))};return b}(),Router=function(){function b(){var a=this;this.stateChangeCallbacks=[];window.onpopstate=
function(b){a.onStateChange(b.state)}}b.prototype.registerStateChangeHandler=function(a){this.stateChangeCallbacks.push(a)};b.prototype.onStateChange=function(a){this.stateChangeCallbacks.forEach(function(b){return b(a)})};b.prototype.navigateToStrategy=function(a,b){void 0===b&&(b=!1);b?history.replaceState(a,"Oblique #"+a,"?s\x3d"+a):history.pushState(a,"Oblique #"+a,"?s\x3d"+a);this.onStateChange(a)};b.prototype.getCurrentState=function(){var a=location.search.split("?s\x3d");return a[a.length-
1]};return b}(),Util=function(){function b(){}b.loadJson=function(a){return __awaiter(this,void 0,void 0,function(){return __generator(this,function(b){return[2,new Promise(function(b,c){var d=new XMLHttpRequest;d.open("GET",a);d.onload=function(){200===d.status?b(JSON.parse(d.response)):c(Error("json file did not load. error code:"+d.statusText))};d.onerror=function(){c(Error("There was a network error loading json."))};d.send()})]})})};return b}(),model=new Model,service=new Service,router=new Router,
viewModel=new ViewModel(model,service,router);