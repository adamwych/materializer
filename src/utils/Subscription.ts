export type SubscriptionCallback<T> = (data?: T) => void;

export class Emitter<T> {
    public lastEmittedValue?: T;
    private readonly subscriptions: Array<Subscription<T>> = [];

    public emit(value?: T) {
        this.lastEmittedValue = value;
        this.subscriptions.forEach((subscription) => {
            subscription.callback(value);
        });
    }

    public subscribe(callback: SubscriptionCallback<T>): Subscription<T> {
        const subscription = new Subscription(this, callback);
        this.subscriptions.push(subscription);

        if (this.lastEmittedValue) {
            callback(this.lastEmittedValue);
        }

        return subscription;
    }

    public unsubscribe(subscription: Subscription<T>) {
        const index = this.subscriptions.findIndex((s) => s === subscription);
        if (index > -1) {
            this.subscriptions.splice(index, 1);
        }
    }
}

export default class Subscription<T> {
    constructor(
        private readonly emitter: Emitter<T>,
        public readonly callback: SubscriptionCallback<T>,
    ) {}

    public unsubscribe() {
        this.emitter.unsubscribe(this);
    }
}
