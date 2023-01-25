import * as child_process from 'child_process';
import { VinaConf } from './VinaConf';
import { parsePathForWin } from '../../../utilities/WinUtilities';
import { LOGGER } from '../../../utilities/Logging';
import { VinaModeResDetails } from './VinaModeResDetails';
import { VinaOutput } from './VinaOutput';


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
    /**
    * @constructor - The constructor accepts a VinaConf object, and assigns it to the vinaConf property.
    * @param {string} vinaConf - The Vina configuration file 
    */
    constructor(vinaConf: VinaConf) {
        this.vinaConf = vinaConf;
    }

    /**
    * Used to update the configuration of the class with new settings.
    * @param {VinaConf} vinaConf - The new configuration settings to be used.
    */
    reConfigure(vinaConf: VinaConf) {
        this.vinaConf = vinaConf;
    }

    /**
    * Runs the vina command using the exec method of child_process module,
    * and then triggers the parsing process.
    */
    runVinaCommand() {
        const cmd = parsePathForWin(<string>process.env.vinaPath).concat(
            ' --config ',
            parsePathForWin(this.vinaConf.confPath)
        );
        this.command = cmd;
        child_process.exec(cmd, (error, stdout, stderr) => {
            if (error) {
                LOGGER.error({
                    message: JSON.stringify(error),
                    className: this.constructor.name
                })
                return;
            }
            if (stderr) {
                LOGGER.error({
                    message: JSON.stringify(stderr),
                    className: this.constructor.name
                })
                return;
            }
            if (!stdout) {
                LOGGER.error({
                    message: JSON.stringify("No stdout content for the following command : " + cmd),
                    className: this.constructor.name
                })
                return;
            }
            this.vinaOutput = this.getParsedVinaRes(stdout)
            //TODO now save the final content using the vinaConf details ( output ) along with the env file
            console.log(this);
        });
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
}

export { VinaInstance };