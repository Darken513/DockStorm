import * as child_process from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as kill from 'tree-kill'
import { VinaConf } from './VinaConf';
import { formarToHoursMinSec, parsePathForWin } from '../../../utilities/GeneralUtilities';
import { LOGGER } from '../../../utilities/Logging';
import { VinaModeResDetails } from './VinaModeResDetails';
import { VinaOutput } from './VinaOutput';
import { GodService } from '../../godService/God.Service';
import { copyFileAndLog, writeFileAndLog } from '../../../utilities/FSutilities';
import { EventEmitter } from 'stream';
import { InstanceEvents } from '../VinaEvents';

/**
* @class VinaInstance
* @classdesc VinaInstance class is used to run the AutoDock Vina program and parse its output.
* @property {VinaConf} vinaConf - The Vina configuration object used to run the command.
* @property {VinaOutput} vinaOutput - An object that holds the parsed output of the Vina program.
* @property {string} command - The command that was used to run the Vina program.
*/
class VinaInstance {
    vinaConf: VinaConf;
    vinaOutput: VinaOutput = new VinaOutput();
    command: string = '';
    update: EventEmitter = new EventEmitter();
    execution: child_process.ChildProcessWithoutNullStreams | undefined;
    /**
    * @constructor - The constructor accepts a VinaConf object, and assigns it to the vinaConf property.
    * @param {string} vinaConf - The Vina configuration file 
    */
    constructor(vinaConf?: VinaConf);
    constructor(vinaConf: VinaConf) {
        this.vinaConf = vinaConf;
        if (!this.vinaConf)
            return this;
    }

    static fromJSON(json: any) {
        let toret = new VinaInstance();
        toret.vinaConf = VinaConf.fromJSON(json.vinaConf);
        return toret;
    }
    /**
    * Used to update the configuration of the class with new settings.
    * @param {VinaConf} vinaConf - The new configuration settings to be used.
    */
    reConfigure(vinaConf: VinaConf) {
        this.vinaConf = vinaConf;
    }
    /**
    * createConfFile creates a configuration file with name 'conf.txt' in the working directory, 
    * based on the vinaConf object and the global configuration
    * @returns {string | undefined} returns the path of the created conf file or undefined if there was an error
    */
    createConfFile() {
        let conf: any = this.vinaConf.confParsed
        Object.keys(conf).forEach((key) => {
            if (!conf[key])
                conf[key] = GodService.globalConf.vinaDefault[key];
        });
        let rawConf = Object.keys(conf).reduce((confStr, key) => {
            if (!conf[key])
                return confStr;
            confStr += key.concat(' = ', conf[key], '\n');
            return confStr
        }, '');
        let saveDir = this.getFinalDirectory();
        let confPath = path.join(this.getFinalDirectory(), 'conf.txt');
        try {
            if (!fs.existsSync(saveDir)) {
                fs.mkdirSync(saveDir, { recursive: true });
            }
            fs.writeFileSync(confPath, rawConf.toString())
        } catch (error) {
            LOGGER.error({
                message: 'Error writing file ' + JSON.stringify(error),
                className: this.constructor.name
            })
            return undefined;
        }
        return confPath
    }
    /**
    * getFinalDirectory is a helper method that returns the final directory where the output files should be saved.
    */
    getFinalDirectory() {
        if (this.vinaConf.outputCopiesPath.out)
            return path.parse(this.vinaConf.outputCopiesPath.out).dir;
        else if (this.vinaConf.outputCopiesPath.log)
            return path.parse(this.vinaConf.outputCopiesPath.log).dir;
        else
            return path.parse(this.vinaConf.confParsed.out!).dir;
    }
    /**
    * Runs the vina command using the exec method of child_process module,
    * and then triggers the parsing process.
    */
    runVinaCommand() {
        this.vinaConf.reAffectOutput();
        let confPath = this.createConfFile();

        if (!confPath)
            return undefined;

        const cmd = parsePathForWin(<string>process.env.vinaPath).concat(
            ' --config ',
            parsePathForWin(confPath)
        );

        this.command = cmd;
        let starsCount = 0;
        let stdout = '';
        let lastCall = new Date().getTime()
        this.execution = child_process.spawn(cmd, [], { shell: true });

        this.execution.stdout.on('data', (data) => {
            stdout += data;
            if (data.toString().length == 1) {
                let dTime = new Date().getTime() - lastCall;
                starsCount += 1;
                let percentage = Math.floor(starsCount / 51 * 100)
                lastCall = new Date().getTime();
                this.update.emit(InstanceEvents.PERCENTAGE, {
                    percentage: percentage,
                    timeLeft: formarToHoursMinSec(Math.floor(((100 - percentage) * dTime) / 1000))
                });
            }
        });

        this.execution.on('close', (code) => {
            if (code === 0) {
                this.onVinaRunSuccess(stdout)
                this.update.emit(InstanceEvents.PERCENTAGE, {
                    percentage: 100,
                    timeLeft: '0s'
                });
                this.update.emit(InstanceEvents.SPLIT, { msg: 'vina_split started' });
                const splitCmd = parsePathForWin(<string>process.env.vinaSplitPath).concat(
                    ' --input ',
                    parsePathForWin(path.join(this.getFinalDirectory(), 'Result.pdbqt'))
                );
                child_process.execSync(splitCmd)
            } else {
                LOGGER.error({
                    message: JSON.stringify(`Command failed with code ${code}`),
                    className: this.constructor.name
                })
            }
            this.update.emit(InstanceEvents.CLOSED, code);
        });
    }

    killProcess() {
        if (!this.execution)
            return;
        this.execution.stdout.destroy();
        this.execution.stderr.destroy();
        this.execution.stdout.removeAllListeners()
        this.execution.removeAllListeners()
        kill.default(this.execution!.pid!, (error) => {
            if (error === null){
                this.update.emit(InstanceEvents.KILL, { msg: 'process killed' });
                return;
            }
            LOGGER.error({
                message: JSON.stringify("Cannot kill process with pid : " + this.execution!.pid!),
                className: this.constructor.name
            })
        })
    }
    onVinaRunSuccess(stdout: string) {
        if (!stdout) {
            LOGGER.error({
                message: JSON.stringify("No stdout content for the following command : " + this.command),
                className: this.constructor.name
            })
            return;
        }
        this.vinaOutput = this.getParsedVinaRes(stdout)
        this.vinaConf.resolveTime = new Date().getTime();
        this.saveResData();
    }
    /**
    * getParsedVinaRes - A function that parses the output of a vina command stdout
    * @param {string} stdout - The stdout of the Vina program
    * @return {VinaOutput} - The extracted random seed value & modes wrapper in a VinaOutput object.
    */
    getParsedVinaRes(stdout: string): VinaOutput {
        let vinaOutput = new VinaOutput();
        if (stdout.includes('WARNING: Could not find any conformations completely within the search space.')) {
            vinaOutput.warningMsg = 'Could not find any conformations completely within the search space.\n' +
                'Check that it is large enough for all movable atoms, including those in the flexible side chains.'
        }
        if (!stdout.includes('mode |   affinity | dist from best mode\r\n')) {
            LOGGER.error({
                message: JSON.stringify("Parsing vinar result error ( encountreded for the following command :" + this.command),
                className: this.constructor.name
            })
            return vinaOutput;
        }
        vinaOutput.randomSeed = this.getRandomSeedValue(stdout)
        let resTable = stdout.split('-----+------------+----------+----------\r\n')[1];
        if (!resTable) {
            LOGGER.error({
                message: JSON.stringify("Can't find the result table for the following command stdout: " + this.command),
                className: this.constructor.name
            })
            return vinaOutput;
        }
        vinaOutput.modes = this.getModesResDetails(resTable);
        return vinaOutput;
    }

    /**
    * The getRandomSeedValue function extracts the random seed value from the output of a vina command.
    * @param {string} stdout - The output of the command, in string format.
    * @return {number | undefined} - The extracted random seed value, or -1 if it cannot be found.
    */
    getRandomSeedValue(stdout: string) {
        let lines = stdout.split("\n");
        let seedLine = lines.find(line => line.startsWith("Using random seed:"));
        if (!seedLine) {
            LOGGER.error({
                message: "Can't find the random seed value for the following command stdout: " + this.command,
                className: this.constructor.name
            })
            return -1;
        }
        let seedSection = seedLine.split(":")[1];
        if (!seedSection) {
            LOGGER.error({
                message: JSON.stringify("Can't find the random seed value for the following command stdout: " + this.command),
                className: this.constructor.name
            })
            return -1;
        }
        return parseFloat(seedSection.trim());
    }

    /**
    * The `getModesResDetails` function extracts the Mode results details from the output of a Vina command.
    * @param {string} resTableRaw - The result table section of the output of the vina command.
    * @return {VinaModeResDetails[]} - An array of VinaModeResDetails objects.
    */
    getModesResDetails(resTableRaw: string): VinaModeResDetails[] {
        let toret: any[] = [];
        if (this.vinaOutput.warningMsg) {
            return toret;
        }
        let lines = resTableRaw.split("\n").filter(line => !line.startsWith('Writing output') && line);
        lines.forEach(line => {
            let modeResDetails = new VinaModeResDetails().parseLineAndInit(line);
            if (modeResDetails) {
                toret.push(modeResDetails)
            }
        });
        return toret;
    }
    /**
    * saveResData method saves the vina output data, copies the output and log files, and saves the parsed configuration.
    */
    saveResData() {
        let saveDir = this.getFinalDirectory();
        if (!fs.existsSync(saveDir)) {
            fs.mkdirSync(saveDir, { recursive: true });
        }
        this.saveVinaOutput(saveDir);
        this.copyOutLogCase();
        this.saveParsedConf(saveDir);
    }
    /**
    * saveVinaOutput method saves the parsed vina output data in a json file.
    * @param {string} saveDir - The directory path where the vina output file will be saved.
    */
    saveVinaOutput(saveDir: string) {
        writeFileAndLog(path.join(saveDir, 'vinaOutput.json'), JSON.stringify({ 
            resolveTime: this.vinaConf.resolveTime, 
            vinaOutput: this.vinaOutput 
        }), this);
    }
    /**
    * copyOutLogCase method copies the output and log files based on the configuration.
    */
    copyOutLogCase() {
        if (this.vinaConf.outputCopiesPath.out) {
            copyFileAndLog(this.vinaConf.confParsed.out!, this.vinaConf.outputCopiesPath.out, this)
        }
        if (this.vinaConf.outputCopiesPath.log) {
            copyFileAndLog(this.vinaConf.confParsed.log!, this.vinaConf.outputCopiesPath.log, this)
        }
    }
    /**
    * saveParsedConf method saves the parsed configuration in a json file.
    * @param {string} saveDir - The directory path where the configuration file will be saved.
    */
    saveParsedConf(saveDir: string) {
        writeFileAndLog(path.join(saveDir, 'conf.json'), JSON.stringify({
            vinaConf: this.vinaConf,
            command: this.command
        }), this);
    }
}

export { VinaInstance };