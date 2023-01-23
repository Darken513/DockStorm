/**
* parsePathForWin is a utility function that wraps a file path in double quotes,
* this is needed to handle paths with spaces on Windows systems.
*
* @function parsePathForWin
* @param {string} path - The file path to be parsed.
* @return {string} - The parsed file path, wrapped in double quotes.
*/
function parsePathForWin(path: string) {
    return `"${path}"`;
}

export { parsePathForWin }