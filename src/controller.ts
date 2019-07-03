import Fuse from "fuse.js";
import Channel, { Producer } from "./channel";
import SearchResult from "./model";

const MAX_RESULTS = 20;

const FUSE_OPTIONS = {
    shouldSort: true,
    threshold: 0.6,
    location: 0,
    distance: 15,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: ["title", "url"]
};

export default class Controller {

    private tabs: Array<SearchResult> = new Array();
    private results: Array<SearchResult> = new Array();
    private fuse = new Fuse<SearchResult>([], FUSE_OPTIONS);

    private channel: Producer<Array<SearchResult>>;
    private selected: number | undefined;

    constructor(
        channel: Producer<Array<SearchResult>>, 
        input: HTMLInputElement, 
        form: HTMLFormElement,
    ) {
        input.addEventListener('input', this.onInput);
        input.addEventListener('keydown', this.onKeyDown);
        form.addEventListener('submit', this.onSubmit);
        this.channel = channel;
    }

    setCollection = (collection: Array<SearchResult>) => {
        this.fuse.setCollection(collection);
    }

    private onInput = (ev: Event) => {
        const val = (ev.target! as HTMLInputElement).value;
        this.results = val ? this.fuse.search(val).slice(0, MAX_RESULTS) : [];
        this.selected = this.results.length > 0 ? 0 : undefined;
        this.produce();
    }

    private onKeyDown = (ev: KeyboardEvent) => {
        const current = this.selected || 0;
        const max = this.results.length - 1;
        switch (ev.keyCode) {
            case 38: // up arrow
                this.selected = Math.max(0, current - 1);
                break;
            case 40: // down arrow
                this.selected = Math.min(max, current + 1);
                break;
            default:
                return;
        }
        this.produce();
    }

    private onSubmit = async (ev: Event) => {
        if (this.selected === undefined) {
            return;
        }
        const result = this.results[this.selected];
        switch (result.kind) {
            case "tab":
                if (result.wraps.id === undefined) {
                    return;
                }
                await browser.tabs.update(result.wraps.id, { active: true });
                break;
            case "history":
                await browser.tabs.create({
                    active: true,
                    url: result.url
                })
                break;
        }
        window.close();
    }

    private produce = () => {
        if (this.selected !== undefined) {
            // Mark the selected result as 'selected' before sending it
            // to the consumer.
            const copy = this.results.slice();
            const sub = { ...copy[this.selected], selected: true };
            copy.splice(this.selected, 1, sub);
            this.channel.produce(copy);
        } else {
            this.channel.produce([]);
        }
    }
}