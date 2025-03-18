/** Prefix for section separators */
export declare const SECTION_SEPARATOR_PREFIX = "-----";
/** Heading for chart list */
export declare const CHART_SECTION_HEADING = "Charts to be processed:";
/** RegExp for parsing chart entries */
export declare const CHART_ENTRY_REGEXP: RegExp;
/** Message reported if no charts are found */
export declare const NO_CHARTS_FOUND_MESSAGE = "No charts found!";
/** Desired behaviour if no charts are found */
export declare enum NotFoundBehaviour {
    IGNORE = "ignore",
    ERROR = "error",
    WARN = "warn"
}
/** Action's input name */
export declare enum InputName {
    CT_LOG_FILE = "ct-log-file",
    IF_NO_CHARTS_FOUND = "if-no-charts-found"
}
/** Action's output name */
export declare enum OutputName {
    CHARTS = "charts"
}
