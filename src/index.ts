import Controller from "./controller";
import Channel from "./channel";
import SearchResult, { HistoryResult, TabResult } from "./model";
import View from "./view";

const searchForm = document.getElementById("form") as HTMLFormElement;
const searchInput = document.getElementById("search") as HTMLInputElement;
const searchResults = document.getElementById("suggestions");

const channel = new Channel<Array<SearchResult>>()
const controller = new Controller(channel, searchInput, searchForm);
const view = new View(channel, searchResults!);

const buildSearchCorpus = async (): Promise<Array<SearchResult>> => {
    const tabs: Array<TabResult> =
        (await browser.tabs.query({ currentWindow: true }))
            .filter(tab => tab.url !== undefined)
            .map(tab => ({
                kind: "tab",
                title: tab.title || "",
                url: tab.url!,
                icon: tab.favIconUrl,
                wraps: tab,
                selected: false
            }));
    // favor tabs over history when they both have the same URL
    const ignoreUrls = new Set(tabs.map(tab => tab.url));
    const history: Array<HistoryResult> =
        (await browser.history.search({ 
            text: "",
            startTime: 0,
            maxResults: 1000,
        }))
            .filter(result => result.url !== undefined)
            .filter(result => !(result.url! in ignoreUrls))
            .map(result => ({
                kind: "history",
                title: result.title || "",
                url: result.url!,
                wraps: result,
                selected: false
            }));
    return [...tabs, ...history]
}

buildSearchCorpus().then(
    results => controller.setCollection(results)
);
