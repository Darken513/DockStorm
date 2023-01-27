import { VinaInstance } from './services/Vina/VinaUtilities/VinaInstance';
import * as dotenv from 'dotenv';
import { VinaConf } from './services/Vina/VinaUtilities/VinaConf';
import * as path from 'path';
import express from 'express';
import { GodService } from './services/godService/God.Service';
import { VinaScheduler } from './services/Vina/VinaScheduler/VinaScheduler';

dotenv.config({ path: path.join(__dirname, '..\\configuration\\environement\\dev.env') });
GodService.loadGlobalConf();

VinaScheduler.stateEmitter.addListener('InstanceStarted',(data)=>console.log('InstanceStarted'))
VinaScheduler.stateEmitter.addListener('InstanceScheduled',(data)=>console.log('InstanceScheduled'))
VinaScheduler.stateEmitter.addListener('InstanceFinished',(data)=>console.log('InstanceFinished'))
VinaScheduler.stateEmitter.addListener('alertUser',(data)=>console.log(data))
VinaScheduler.stateEmitter.addListener('percentage',(data)=>console.log(data))
VinaScheduler.stateEmitter.addListener('allDone',(data)=>console.log('allDone'))

const app = express();

app.get('/', (req:any, res:any) => {
    res.send('Hello, World!');
});

app.get('/run', (req:any, res:any) => {
    let confPath = 'C:\\Users\\Darken\\Desktop\\docking\\glibenclamide with DPP4\\conf.txt';
    const vinaConf: VinaConf = new VinaConf(confPath)
    const vinaInstance: VinaInstance = new VinaInstance(vinaConf);
    VinaScheduler.scheduel(vinaInstance);
    res.send('Running a vina instance');
});

app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});