"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const suiteIdRegExp = /\bT?S(\d+)\b/g;
const testCaseIdRegExp = /\bT?C(\d+)\b/g;
function titleToIds(title, regexp) {
    const result = [];
    let m;
    while ((m = regexp.exec(title)) !== null) {
        result.push(parseInt(m[1], 10));
    }
    return result;
}
/**
 * Search for all applicable test cases
 * @param title
 * @returns {any}
 */
function titleToCaseIds(title) {
    return titleToIds(title, testCaseIdRegExp);
}
exports.titleToCaseIds = titleToCaseIds;
/**
 * Search for all applicable suite ids
 * @param title
 * @returns {any}
 */
function titleToSuiteId(title) {
    return titleToIds(title, suiteIdRegExp)[0];
}
exports.titleToSuiteId = titleToSuiteId;
//# sourceMappingURL=shared.js.map