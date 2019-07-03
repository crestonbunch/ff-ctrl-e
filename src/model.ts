interface Result {
    readonly title: string
    readonly url: string
    readonly icon?: string
    readonly selected: boolean
}

export interface TabResult extends Result {
    readonly kind: "tab"
    readonly wraps: browser.tabs.Tab
}

export interface HistoryResult extends Result {
    readonly kind: "history"
    readonly wraps: browser.history.HistoryItem
}

/**
 * Represents a possible search result that can trigger a tab switch
 * or tab open.  
 */
type SearchResult = TabResult | HistoryResult;

export default SearchResult;
