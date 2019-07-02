import { Consumer } from "./channel";
import SearchResult from "./model";

export default class View {
    private channel: Consumer<Array<SearchResult>>;
    private container: HTMLElement;

    constructor(
        channel: Consumer<Array<SearchResult>>, 
        container: HTMLElement,
    ) {
        this.channel = channel;
        this.container = container;

        this.channel.consume(this.handle);
    }

    private handle = (results: Array<SearchResult>) => {
        this.render(results);
    }

    private renderResult = (result: SearchResult) => {
        const n = document.createElement("div");
        n.classList.add("suggestion");
        if (result.selected) {
            n.classList.add("selected");
        }

        const icon = document.createElement("div");
        const title = document.createElement("div");
        const url = document.createElement("div");
        icon.classList.add("icon");
        title.classList.add("title");
        url.classList.add("url");

        if (result.icon !== undefined) {
            const img = document.createElement("img");
            img.src = result.icon || "";
            icon.appendChild(img);
        }
        title.innerText = result.title;
        url.innerText = result.url;

        n.appendChild(icon);
        n.appendChild(title);
        n.appendChild(url);

        return n;
    }

    private render = (results: Array<SearchResult>) => {
        this.container.innerText = "";
        for (const result of results) {
            this.container.appendChild(this.renderResult(result))
        }
    }
}