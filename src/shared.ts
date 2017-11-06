const suiteIdRegExp: RegExp = /\bT?S(\d+)\b/g;
const testCaseIdRegExp: RegExp = /\bT?C(\d+)\b/g;

function titleToIds(title: string, regexp: RegExp): number[] {
  const result: number[] = [];

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
export function titleToCaseIds(title: string): number[] {
  return titleToIds(title, testCaseIdRegExp);
}

/**
 * Search for all applicable suite ids
 * @param title
 * @returns {any}
 */
export function titleToSuiteId(title: string): number | undefined {
  return titleToIds(title, suiteIdRegExp)[0];
}
