/**
 * Represents a possible search result that can trigger a tab switch
 * or tab open.  
 */
export default interface SearchResult {
    readonly title: string
    readonly url: string
    readonly icon?: string
    readonly wraps: browser.tabs.Tab
    readonly selected: boolean
}
