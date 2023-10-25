type RenderJobResultSuccessCallback<T> = (outputs: T) => void;
type RenderJobResultErrorCallback = (error: unknown) => void;

/**
 * Promise-like utility class that passes the result to multiple subscribers.
 */
export class RenderJobResult<T> {
    private readonly okCallbacks: Array<RenderJobResultSuccessCallback<T>> = [];
    private readonly errorCallbacks: Array<RenderJobResultErrorCallback> = [];

    constructor(
        public readonly type: "node" | "preview",
        public readonly nodeId?: number,
    ) {}

    public then(callback: RenderJobResultSuccessCallback<T>) {
        this.okCallbacks.push(callback);
    }

    public catch(callback: RenderJobResultErrorCallback) {
        this.errorCallbacks.push(callback);
    }

    public resolve(outputs: T) {
        this.okCallbacks.forEach((callback) => {
            callback(outputs);
        });
    }

    public reject<E>(error: E) {
        if (this.errorCallbacks.length === 0) {
            console.error("Unhandled error:", error);
        }

        this.errorCallbacks.forEach((callback) => {
            callback(error);
        });
    }
}
