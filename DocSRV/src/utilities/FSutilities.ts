import * as fs from 'fs';
import { LOGGER } from './Logging';

function copyFileAndLog(src:string, dest:string, caller:any){
    fs.copyFile(src, dest, (err) => {
        if (!err)
            return
        LOGGER.error({
            message: 'Error Copying file ' + JSON.stringify(err),
            className: caller.constructor.name
        })
    })
}

function writeFileAndLog(path:string, data:string, caller:any){
    fs.writeFile(path, data, (err) => {
        if (!err)
            return
        LOGGER.error({
            message: 'Error writing file ' + JSON.stringify(err),
            className: caller.constructor.name
        })
    });
}

function parsePathForWin(path: string) {
    return `"${path}"`;
}

export { parsePathForWin, copyFileAndLog, writeFileAndLog }