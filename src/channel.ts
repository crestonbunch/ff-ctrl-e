export interface Producer<T> {
    produce: (t: T) => void;
}

export interface Consumer<T> {
    consume: (handler: (t: T) => void) => void;
}

/**
 * Basic object for sharing data between a producer and consumer.
 */
export default class Channel<T> implements Producer<T>, Consumer<T> {
    private producer: Producer<T>;
    private consumer: Consumer<T>;

    private handler: ((t: T) => void) | undefined;

    constructor() {
        this.producer = this;
        this.consumer = this;
    }

    produce = (t: T) => {
        if (this.handler !== undefined) {
            this.handler(t);
        }
    }

    consume = (handler: (t: T) => void) => {
        this.handler = handler;
    }
}