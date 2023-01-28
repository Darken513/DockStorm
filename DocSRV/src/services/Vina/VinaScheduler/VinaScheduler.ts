import { EventEmitter } from "stream";
import { GodService } from "../../godService/God.Service";
import { VinaInstance } from "../VinaUtilities/VinaInstance";
import * as path from 'path';
import * as fs from 'fs';

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
        console.info(JSON.parse(rawConf))
        if (VinaScheduler.scheduledInstances.length)
            VinaScheduler.runScheduled();
    }

    static updateSchedulerConf() {
        let schedulerConfPath = path.join(__dirname, '../../../configuration/SCHEDULERconf.json');
        let parsedConf = JSON.parse(fs.readFileSync(schedulerConfPath).toString());
        parsedConf.vinaScheduled = VinaScheduler.scheduledInstances.map((instance) => {
            return {
                vinaConf: instance.vinaConf
            };
        });
        fs.writeFileSync(schedulerConfPath, JSON.stringify(parsedConf));
    }

    static runScheduled() {
        if (this.currentInstance)
            return;
        this.currentInstance = this.scheduledInstances[0];
        this.currentInstance.update.addListener('closed', this.runNext.bind(this));
        this.currentInstance.update.addListener('percentage', this.updatePercentage.bind(this));
        this.currentInstance.update.addListener('vina_split', this.alertUser.bind(this));
        this.stateEmitter.emit('InstanceStarted', this.currentInstance);
        this.currentInstance.runVinaCommand();
    }

    static updatePercentage(param: any) {
        this.stateEmitter.emit('percentage', param);
    }

    static alertUser(param: any) {
        this.stateEmitter.emit('alertUser', param);
    }

    static scheduel(vinaInstance: VinaInstance) {
        this.scheduledInstances.push(vinaInstance);
        VinaScheduler.updateSchedulerConf();
        this.stateEmitter.emit('InstanceScheduled', vinaInstance);
        if (this.currentInstance)
            return;
        this.runScheduled();
    }

    static runNext(msg: any) {
        let done = this.scheduledInstances.shift();
        done?.update.removeAllListeners();
        this.stateEmitter.emit('InstanceFinished', { instance: done, exitCode: msg });
        this.currentInstance = undefined;
        VinaScheduler.updateSchedulerConf();
        if (!this.scheduledInstances.length) {
            this.stateEmitter.emit('allDone', true);
            return;
        }
        this.runScheduled();
    };
}

export { VinaScheduler }