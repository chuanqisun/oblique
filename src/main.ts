/* model */
class Model {
    private strategies: string[];
    private currentStrategy: number;

    constructor() {
        this.currentStrategy = 0;
        this.strategies = [];
    }

    public setStrategies(stratigies: string[]): void {
        this.strategies = stratigies;
    }

    public getCurrentStrategy(): string {
        return this.strategies[this.currentStrategy];
    }

    public getNextStrategy(): string {
        this.currentStrategy = (this.currentStrategy + 1) % this.strategies.length;
        return this.getCurrentStrategy();
    }
}

/* view-model */
class ViewModel {
    // view-model -> view
    private strategy: HTMLElement;
    
    // view -> view-model
    private nextButton: HTMLElement;

    constructor(private model: Model) {
        this.initModel().then(() => {
            this.initViewModel();
        });
    }

    private initViewModel() {
        this.strategy = document.getElementById('o-strategy');
        this.strategy.innerHTML = this.model.getCurrentStrategy();
        this.nextButton = document.getElementById('o-next');
        this.nextButton.addEventListener("click", () => {
            this.strategy.innerHTML = this.model.getNextStrategy();
            console.dir('click');
        });
    }

    private async initModel() {
        const strategies = await Util.loadJson<string[]>('./strategies.json');
        this.model.setStrategies(strategies);
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
const viewModel = new ViewModel(model);

