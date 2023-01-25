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

function formarToHoursMinSec(seconds:number){
    let sec = seconds%60;
    let min = Math.floor(seconds/60)%60;
    let hours = Math.floor(Math.floor(seconds/60)/60);
    if(hours){
        return hours+'H '+min+'Min '+sec+ 's'
    }
    if(min){
        return min+'Min '+sec+ 's'
    }
    return sec+ 's'
}
export { parsePathForWin, formarToHoursMinSec }