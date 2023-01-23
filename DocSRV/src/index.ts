import { VinaInstance } from './VinaUtilities/Vina';
import * as dotenv from 'dotenv';
import { VinaConf } from './VinaUtilities/VinaConf';

dotenv.config({ path: __dirname + '\\dev.env' });
let confPath = process.env.confPath;
const vinaConf: VinaConf = new VinaConf(confPath)
const vinaInstance : VinaInstance = new VinaInstance(vinaConf);
vinaInstance.runVinaCommand();


