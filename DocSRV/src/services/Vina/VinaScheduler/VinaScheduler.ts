import * as path from 'path';
import * as fs from 'fs';
import { EventEmitter } from "stream";
import { VinaInstance } from "../VinaUtilities/VinaInstance";
import { InstanceEvents, SchedulerEvents } from "../VinaEvents";

class VinaScheduler {
    static scheduledInstances: Array<VinaInstance> = [];
    static currentInstance: VinaInstance | undefined;
    static stateEmitter: EventEmitter = new EventEmitter();
    constructor() {
        throw new Error("Class can't be instantiated");
    }

    static loadSchedulerConf() {
        let schedulerConfPath = path.join(__dirname, '../../../configuration/SCHEDULERconf.json');
        let rawConf = fs.readFileSync(schedulerConfPath).toString();
        VinaScheduler.scheduledInstances = JSON.parse(rawConf).vinaScheduled.map((instanceJSON: any) => VinaInstance.fromJSON(instanceJSON));
    }

    static updateSchedulerConf() {
        let schedulerConfPath = path.join(__dirname, '../../../configuration/SCHEDULERconf.json');
        let parsedConf = JSON.parse(fs.readFileSync(schedulerConfPath).toString());
        parsedConf.vinaScheduled = VinaScheduler.scheduledInstances.map((instance) => {
            return {
                vinaConf: instance.vinaConf,
                scheduleTime: instance.vinaConf.scheduleTime,
                resolveTime: instance.vinaConf.resolveTime
            };
        });
        fs.writeFileSync(schedulerConfPath, JSON.stringify(parsedConf));
    }

    static schedule(vinaInstance: VinaInstance) {
        vinaInstance.vinaConf.scheduleTime = new Date().getTime();
        this.scheduledInstances.push(vinaInstance);
        VinaScheduler.updateSchedulerConf();
        this.stateEmitter.emit(SchedulerEvents.SCHEDULED, vinaInstance);
    }

    static runScheduled() {
        if (this.currentInstance || !this.scheduledInstances.length)
            return;
        this.currentInstance = this.scheduledInstances[0];
        this.currentInstance.update.addListener(InstanceEvents.CLOSED, this.runNext.bind(this));
        this.currentInstance.update.addListener(InstanceEvents.PERCENTAGE, this.updatePercentage.bind(this));
        this.currentInstance.update.addListener(InstanceEvents.SPLIT, this.alertUser.bind(this));
        this.currentInstance.update.addListener(InstanceEvents.KILL, this.onProcessKill.bind(this));
        this.stateEmitter.emit(SchedulerEvents.STARTED, this.currentInstance);
        this.currentInstance.runVinaCommand();
    }

    static runNext(msg: any) {
        let done = this.scheduledInstances.shift();
        done?.update.removeAllListeners();
        this.stateEmitter.emit(SchedulerEvents.FINISHED, { instance: done, exitCode: msg });
        this.currentInstance = undefined;
        VinaScheduler.updateSchedulerConf();
        if (!this.scheduledInstances.length) {
            this.stateEmitter.emit(SchedulerEvents.ALLDONE, true);
            return;
        }
        this.runScheduled();
    };

    static stopScheduled() {
        if (!this.currentInstance)
            return;
        this.currentInstance.killProcess();
    }

    static updatePercentage(evt: any) {
        this.stateEmitter.emit(SchedulerEvents.PERCENTAGE, evt);
    }

    static alertUser(evt: any) {
        this.stateEmitter.emit(SchedulerEvents.ALERT, evt);
    }

    static onProcessKill(evt: any) {
        this.currentInstance!.update.removeAllListeners();
        this.alertUser(evt);
        this.currentInstance = undefined;
    }

}

export { VinaScheduler }