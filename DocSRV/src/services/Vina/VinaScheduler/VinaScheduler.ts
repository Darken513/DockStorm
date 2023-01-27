import { EventEmitter } from "stream";
import { GodService } from "../../godService/God.Service";
import { VinaInstance } from "../VinaUtilities/VinaInstance";

class VinaScheduler {
    static scheduledInstances: Array<VinaInstance> = [];
    static currentInstance: VinaInstance | undefined;
    static stateEmitter: EventEmitter = new EventEmitter();
    constructor() {
        throw new Error("Class can't be instantiated");
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
        if (!this.scheduledInstances.length) {
            this.stateEmitter.emit('allDone', true);
            return;
        }
        this.runScheduled();
    };
}

export { VinaScheduler }