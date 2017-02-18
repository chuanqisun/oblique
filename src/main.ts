///<reference path='../node_modules/@types/facebook-js-sdk/index.d.ts'/>

/* contracts */
interface StrategyList {
    version: string;
    strategies: Strategy[];
}

interface Strategy {
    id: string;
    text: string;
}

interface AppState {
    version: string;
    strategies: Strategy[];
    unviewedStrategyIds: string[];
    currentStrategy: Strategy;
}

type StateChangeCallback = (state: any) => any;

/* constants */
const appStateKey = 'appState';
const strategyListPath = './strategy-list.json';

/* model */
class Model implements AppState {
    public version: string;
    public strategies: Strategy[];
    public unviewedStrategyIds: string[];
    public currentStrategy: Strategy;

    public init(state: AppState) {
        this.version = state.version;
        this.strategies = state.strategies;
        this.unviewedStrategyIds = state.unviewedStrategyIds;
        this.currentStrategy = state.currentStrategy;
    }

    public setCurrentStrategy(viewedId: string): Strategy {
        this.unviewedStrategyIds = this.unviewedStrategyIds.filter(id => id !== viewedId);
        this.currentStrategy = this.strategies.filter(strategy => strategy.id === viewedId)[0];
        return this.currentStrategy;
    }

    public getNextStrategyId(): string {
        if (this.unviewedStrategyIds.length === 0)
            return null;

        return this.unviewedStrategyIds[Math.floor(Math.random()*this.unviewedStrategyIds.length)];
    }

    public resetUnviewedStrategies(): void {
        this.unviewedStrategyIds = this.strategies.map(strategy => strategy.id);
    }
}

/* view-model */
class ViewModel {
    // view-model -> view
    private strategy: HTMLElement;
    
    // view -> view-model
    private nextButton: HTMLElement;
    private facebookShareLink: HTMLLinkElement;
    private twitterLink: HTMLLinkElement;

    constructor(private model: Model, private service: Service, private router: Router) {
        this.initModel().then(() => {
            this.initViewModel();
        });
    }

    private initViewModel(): void {
        this.strategy = document.getElementById('o-strategy');
        this.nextButton = document.getElementById('o-next');
        this.facebookShareLink = <HTMLLinkElement>document.getElementById('o-facebook-share');
        this.twitterLink = <HTMLLinkElement>document.getElementById('o-twitter-tweet');

        this.nextButton.addEventListener("click", () => {
            this.tryDisplayNextStrategy();
        });
        this.facebookShareLink.addEventListener("click", () => {
            FB.ui({
                method: 'share',
                href: location.href,
                quote: this.model.currentStrategy.text,
            }, (response) => {});
        });
        this.twitterLink.addEventListener("click", () => {
            let href = 'https://twitter.com/intent/tweet?';
            href = href + 'text=' + encodeURIComponent(this.model.currentStrategy.text);
            href = href + '&url=' + encodeURIComponent('http://oblique.me');
            href = href + '&hashtags=ObliqueMe';
            this.twitterLink.href = href;
        });

        this.nextButton.addEventListener("mouseup", () => {
            this.nextButton.blur();
        });

        this.router.registerStateChangeHandler(id => {
            const currentStrategyText = this.model.setCurrentStrategy(id).text;
            const url = location.href;
            this.strategy.innerHTML = currentStrategyText;
            this.service.cacheAppState(this.model);
        });

        if (this.router.getCurrentState().length > 0) { // init from url
            this.router.navigateToStrategy(this.router.getCurrentState(), true);
        } else if (this.model.currentStrategy) { // init from cache
            this.router.navigateToStrategy(this.model.currentStrategy.id, true);
        } else { // first time experience
            this.tryDisplayNextStrategy(true);
        }
    }

    private tryDisplayNextStrategy(replace = false) {
        const nextId = this.model.getNextStrategyId();
        if (nextId) {
            this.router.navigateToStrategy(nextId, replace);
        } else {
            this.model.resetUnviewedStrategies();
            this.service.cacheAppState(this.model);
            this.tryDisplayNextStrategy(replace);
        }
    }

    private async initModel() {
        const appState = await this.service.getAppState();
        this.model.init(appState);
    }
}

/* service */
class Service {
    public async getAppState() {
        return new Promise<AppState>((resolve, reject) => {
            const cachedAppStateString = localStorage.getItem(appStateKey);
            const cachedAppState: AppState = cachedAppStateString ? JSON.parse(cachedAppStateString) : null;

            Util.loadJson<StrategyList>(strategyListPath).then(strategyList => {
                if (!cachedAppState || strategyList.version !== cachedAppState.version) {
                    const appState: AppState = {
                        version: strategyList.version,
                        strategies: strategyList.strategies,
                        unviewedStrategyIds: strategyList.strategies.map(strategy => strategy.id),
                        currentStrategy: null,
                    }
                    resolve(appState);
                    this.cacheAppState(appState);
                } else {
                    resolve(cachedAppState);
                }
            });
        });
    }

    public cacheAppState(appState: AppState): void {
        localStorage.setItem(appStateKey, JSON.stringify(appState));
    } 
}

/* router */
class Router {
    private stateChangeCallbacks: StateChangeCallback[] = [];
    constructor() {
        window.onpopstate = ((ev: PopStateEvent) => {
            this.onStateChange(ev.state);
        }); 
    }

    public registerStateChangeHandler(callback: StateChangeCallback) {
        this.stateChangeCallbacks.push(callback);
    }

    private onStateChange(state: any) {
        this.stateChangeCallbacks.forEach(callback => callback(state));
    }

    public navigateToStrategy(id: string, replace = false): void {
        if (replace)
            history.replaceState(id, 'Oblique #' + id, '?s=' + id)
        else
            history.pushState(id, 'Oblique #' + id, '?s=' + id);
        this.onStateChange(id);
    }

    public getCurrentState(): string {
        const pathArray = location.search.split('?s=')
        return pathArray[pathArray.length - 1];
    }
}

/* helpers */
class Util {
    static async loadJson<T>(url: string) {
        return new Promise<T>((resolve, reject) => {
            const request = new XMLHttpRequest();
            request.open('GET', url);
            request.onload = () => {
                if (request.status === 200) {
                    resolve(JSON.parse(request.response));
                } else {
                    reject(Error('json file did not load. error code:' + request.statusText));
                }
            };
            request.onerror = () => {
                reject(Error('There was a network error loading json.'));
            };
            request.send();
        });
    }
}

/* init */
const model = new Model();
const service = new Service();
const router = new Router();
const viewModel = new ViewModel(model, service, router);
