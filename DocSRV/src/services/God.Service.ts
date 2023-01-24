import * as path from 'path';
import * as fs from 'fs';

class GodService{
    static globalConf:any = {}
    static loadGlobalConf(){
        let globalConfPath = path.join(__dirname, '../configuration/DocSRVconf.json');
        let rawConf = fs.readFileSync(globalConfPath).toString();
        GodService.globalConf = JSON.parse(rawConf);
    }
}

export {GodService}