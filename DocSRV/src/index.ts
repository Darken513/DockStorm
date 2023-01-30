import express from 'express';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { VinaInstance } from './services/Vina/VinaUtilities/VinaInstance';
import { VinaConf } from './services/Vina/VinaUtilities/VinaConf';
import { GodService } from './services/godService/God.Service';
import { VinaScheduler } from './services/Vina/VinaScheduler/VinaScheduler';
import { SchedulerEvents } from './services/Vina/VinaEvents'

dotenv.config({ path: path.join(__dirname, '..\\configuration\\environement\\dev.env') });

//add listeners to scheduler
VinaScheduler.stateEmitter.addListener(SchedulerEvents.STARTED, (data) => console.log('InstanceStarted'))
VinaScheduler.stateEmitter.addListener(SchedulerEvents.SCHEDULED, (data) => console.log('InstanceScheduled'))
VinaScheduler.stateEmitter.addListener(SchedulerEvents.FINISHED, (data) => console.log('InstanceFinished'))
VinaScheduler.stateEmitter.addListener(SchedulerEvents.LOOP, (data) => console.log(data))
VinaScheduler.stateEmitter.addListener(SchedulerEvents.ALERT, (data) => console.log(data))
VinaScheduler.stateEmitter.addListener(SchedulerEvents.PERCENTAGE, (data) => console.log(data))
VinaScheduler.stateEmitter.addListener(SchedulerEvents.ALLDONE, (data) => console.log('allDone'))

//run load config
GodService.loadGlobalConf();
VinaScheduler.loadSchedulerConf();

//start express server
const app = express();

app.get('/', (req: any, res: any) => {
    res.send('Hello, World!');
});

app.get('/schedule', (req: any, res: any) => {
    let confPath = 'C:\\Users\\Darken\\Desktop\\docking\\glibenclamide with DPP4\\conf.txt';
    const vinaConf: VinaConf = new VinaConf({ confPath, repitions: 1 })
    const vinaInstance: VinaInstance = new VinaInstance(vinaConf);
    VinaScheduler.schedule(vinaInstance);
    res.send('scheduled a vina instance');
});

app.get('/run', (req: any, res: any) => {
    VinaScheduler.runScheduled();
    res.send('Running a vina instance');
});

app.get('/stop', (req: any, res: any) => {
    VinaScheduler.stopScheduled();
    res.send('stopd a running vina instance');
});

app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});