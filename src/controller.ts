import Fuse from "fuse.js";
import Channel, { Producer } from "./channel";
import SearchResult from "./model";

const FUSE_OPTIONS = {
    shouldSort: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
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

    setCollection = (tabs: Array<browser.tabs.Tab>) => {
        const results = tabs
            .filter(tab => tab.url)
            .map(tab => ({
                title: tab.title || "",
                url: tab.url!,
                icon: tab.favIconUrl,
                wraps: tab,
                selected: false
            }))
        this.fuse.setCollection(results);
    }

    private onInput = (ev: Event) => {
        const val = (ev.target! as HTMLInputElement).value;
        this.results = this.fuse.search(val);
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
        const result = this.results[this.selected].wraps;
        if (result.id === undefined) {
            return;
        }
        await browser.tabs.update(result.id, { active: true });
        window.close();
    }

    private produce = () => {
        if (this.selected !== undefined) {
            // Mark the selected result as 'selected' before sending it
            // to the consumer.
            const sub = { ...this.results[this.selected], selected: true };
            const copy = this.results.slice();
            copy.splice(this.selected, 1, sub);
            this.channel.produce(copy);
        } else {
            this.channel.produce([]);
        }
    }
}