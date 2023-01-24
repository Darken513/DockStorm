import { VinaInstance } from './services/Vina/VinaUtilities/VinaInstance';
import * as dotenv from 'dotenv';
import { VinaConf } from './services/Vina/VinaUtilities/VinaConf';
import * as path from 'path';
import * as express from 'express';
import { GodService } from './services/God.Service';

dotenv.config({ path: path.join(__dirname, '..\\configuration\\environement\\dev.env') });
GodService.loadGlobalConf();

const app = express();

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.get('/run', (req, res) => {
    console.info('running a vina instance')
    let confPath = 'C:\\Users\\Darken\\Desktop\\docking\\glibenclamide with DPP4\\conf.txt';
    const vinaConf: VinaConf = new VinaConf(confPath)
    const vinaInstance: VinaInstance = new VinaInstance(vinaConf);
    vinaInstance.runVinaCommand();
    res.send('Running a vina instance');
});

app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});