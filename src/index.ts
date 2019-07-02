import Controller from "./controller";
import Channel from "./channel";
import SearchResult from "./model";
import View from "./view";

const searchForm = document.getElementById("form") as HTMLFormElement;
const searchInput = document.getElementById("search") as HTMLInputElement;
const searchResults = document.getElementById("suggestions");

const channel = new Channel<Array<SearchResult>>()
const controller = new Controller(channel, searchInput, searchForm);
const view = new View(channel, searchResults!);

browser.tabs.query({ currentWindow: true }).then(
    tabs => controller.setCollection(tabs)
);
