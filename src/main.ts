/* contracts */
interface StrategyList {
    version: string;
    strategies: string[];
}

interface AppState {
    version: string;
    viewedStrategies: string[];
    unviewedStrategies: string[];
    currentStrategy: string;
}

/* constants */
const appStateKey = 'appState';
const strategyListPath = './strategy-list.json';

/* model */
class Model implements AppState {
    public version: string;
    public viewedStrategies: string[];
    public unviewedStrategies: string[];
    public currentStrategy: string;

    public init(state: AppState) {
        this.version = state.version;
        this.viewedStrategies = state.viewedStrategies;
        this.unviewedStrategies = state.unviewedStrategies;
        this.currentStrategy = state.currentStrategy;

    }

    public drawNextStrategy(): void {
        if (this.unviewedStrategies.length === 0) {
            this.resetViewingHistory();
        }
        const unviewedStrategies = this.unviewedStrategies;
        const removeAt = Math.floor(Math.random()*unviewedStrategies.length);
        const chosenStrategy = unviewedStrategies.splice(removeAt, 1)[0];
        this.currentStrategy = chosenStrategy;
        this.viewedStrategies.push(chosenStrategy);
    }

    private resetViewingHistory() {
        this.unviewedStrategies = this.viewedStrategies;
        this.viewedStrategies = [];
    }
}

/* view-model */
class ViewModel {
    // view-model -> view
    private strategy: HTMLElement;
    
    // view -> view-model
    private nextButton: HTMLElement;

    constructor(private model: Model, private service: Service) {
        this.initModel().then(() => {
            this.initViewModel();
        });
    }

    private initViewModel(): void {
        this.strategy = document.getElementById('o-strategy');
        this.strategy.innerHTML = this.model.currentStrategy;
        this.nextButton = document.getElementById('o-next');
        this.nextButton.addEventListener("click", () => {
            this.model.drawNextStrategy();
            this.service.cacheAppState(this.model);
            this.strategy.innerHTML = this.model.currentStrategy;
        });
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
                        viewedStrategies: [],
                        unviewedStrategies: strategyList.strategies,
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
const viewModel = new ViewModel(model, service);
