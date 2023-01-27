import * as path from 'path';
import * as fs from 'fs';
import { VinaScheduler } from '../Vina/VinaScheduler/VinaScheduler';

class GodService {
    static globalConf: any = {}
    static loadGlobalConf() {
        let globalConfPath = path.join(__dirname, '../../configuration/DOCSRVconf.json');
        let rawConf = fs.readFileSync(globalConfPath).toString();
        GodService.globalConf = JSON.parse(rawConf);
        VinaScheduler.loadSchedulerConf();
    }
}

export { GodService }