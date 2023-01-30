import * as fs from 'fs';
import * as path from "path";
import { LOGGER } from "../../../utilities/Logging";
import { VINA_CONF_KEYWORDS } from "../../../utilities/Constants";
import { ParsedVinaConf } from "./ParsedVinaConf";
import { GodService } from '../../godService/God.Service';

/**
* @class VinaConf
* @classdesc VinaConf is a class that represents the configuration of AutoDock Vina.
* It provides methods to set the ligand and receptor paths, and re-affect the output file accordingly.
* The class also provides methods to parse and initialize the configuration from a file.
* @property {ParsedVinaConf} confParsed - An object that holds the parsed configuration values.
* @property {string} confPath - The path to the configuration file.
*/
class VinaConf {
    confParsed: ParsedVinaConf = new ParsedVinaConf();
    confPath: string | undefined;
    outputCopiesPath: any = {
        out: '',
        log: ''
    }
    activeSite: string = 'AS1';
    scheduleTime: number | undefined;
    resolveTime: number | undefined;
    repeatNtimes: number = 1;
    
    /**
    * @constructor - The constructor accepts an optional confPath parameter, and initializes the configuration from the file if provided.
    * @param {string} rawConf - The raw content of a vina configuration file.
    */
    constructor(options?: { confPath?: string, repitions?: number }) {
        if (!options)
            return;
        if (options.repitions) {
            this.repeatNtimes = options.repitions;
        }
        if (options.confPath) {
            this.initFromPath(options.confPath);
        }
    }

    static fromJSON(json: any) {
        let toret = new VinaConf();
        toret.confParsed = ParsedVinaConf.fromJSON(json.confParsed);
        toret.confPath = json.confPath;
        toret.outputCopiesPath = json.outputCopiesPath;
        toret.activeSite = json.activeSite;
        toret.scheduleTime = json.scheduleTime;
        toret.resolveTime = json.resolveTime;
        toret.repeatNtimes = json.repeatNtimes;
        return toret;
    }

    setLigandPath(ligand: string) {
        this.confParsed.ligand = ligand;
        return this;
    }
    //TODO Find a way to use these in a proper way 

    setReceptorPath(receptor: string) {
        this.confParsed.receptor = receptor;
        return this;
    }

    setActiveSite(name: string, vec3D: any) {
        this.activeSite = name;
        this.confParsed.center_x = vec3D.x;
        this.confParsed.center_y = vec3D.y;
        this.confParsed.center_z = vec3D.z;
    }

    /**
    * reAffectOutput method updates the output file path and log file path for the given input parameters.
    * @param {number} repLef - The remaining repeat times for the process.
    * @returns {void}
    */
    reAffectOutput(repLef: number) {
        if (!this.confParsed.receptor || !this.confParsed.ligand)
            return;
        let receptorBase = path.parse(this.confParsed.receptor).name;
        let ligandBase = path.parse(this.confParsed.ligand).name;
        let basePath = path.join(
            GodService.globalConf.output.path,
            GodService.globalConf.output.folderName,
            receptorBase.concat('_', ligandBase)
        );
        let compositionConf = this.getCompositionConf(basePath);
        let out = this.getOutPutPath(basePath, repLef, compositionConf);
        this.updateCompositionConf(basePath);
        if (!this.confPath) {
            this.confParsed.out = out
            this.confParsed.log = path.join(path.parse(out).dir, 'log.txt')
            return;
        }
        if (!this.confParsed.out) {
            this.confParsed.out = out
            if (!this.confParsed.log)
                this.confParsed.log = path.join(path.parse(out).dir, 'log.txt')
            else
                this.outputCopiesPath.log = path.join(path.parse(out).dir, 'log.txt')
            return;
        }
        if (!this.confParsed.log) {
            this.confParsed.log = path.join(path.parse(out).dir, 'log.txt')
            if (!this.confParsed.out)
                this.confParsed.out = out
            else
                this.outputCopiesPath.out = out
            return;
        }
        this.outputCopiesPath.log = path.join(path.parse(out).dir, 'log.txt')
        this.outputCopiesPath.out = out;
    }

    /**
    * Initializes the VinaInstance by checking if the confPath exists and parsing it
    * @param {string} confPath - The configuration file path.
    */
    initFromPath(confPath: string) {
        this.confPath = confPath;
        const exists = fs.existsSync(this.confPath);
        if (!exists) {
            LOGGER.info({
                message: JSON.stringify("Config file doesnt exist or no confPath provided :" + confPath),
                className: this.constructor.name
            })
            return;
        }
        const rawConf = fs.readFileSync(this.confPath).toString();
        this.parseAndInit(rawConf);
    }

    /**
    * startsWithKeyWord method checks if a line starts with a specific keyword of the VINA_CONF_KEYWORDS list
    * @param {string} line - The line to check if it starts with a keyword
    * @returns {string | undefined} - The keyword if the line starts with one, undefined otherwise.
    */
    startsWithKeyWord(line: string): string | undefined {
        return VINA_CONF_KEYWORDS.find((key) => line.startsWith(key));
    }

    /**
    * parseAndInit method parses the raw configuration file
    * and assigns the configuration key-value pair to its corresponding properties.
    * @param {string} rawConf - The raw content of a configuration file
    */
    parseAndInit(rawConf: string) {
        const lines = rawConf.replace(/\r/g, '').split('\n').filter((line) => line.trim() !== '');
        lines.forEach((line: string) => {
            const [key, value] = line.split(" = ");
            (<any>this.confParsed)[key] = value;
        });
    }

    /**
    * Get the composition configuration
    * @param basePath the base path to look for the configuration
    * @returns configuration object or `undefined` if the file is not found
    */
    getCompositionConf(basePath: string) {
        let confPath = path.join(basePath, 'composition_conf.json')
        let exists = fs.existsSync(confPath);
        if (!exists)
            return undefined;
        return JSON.parse(fs.readFileSync(confPath).toString());
    }

    /**
    * Get the output path
    * @param basePath the base path to construct the output path
    * @param repLeft the number of repetitions left
    * @param compositionConf the composition configuration object
    * @returns the constructed output path
    */
    getOutPutPath(basePath: string, repLeft: number, compositionConf: any) {
        let site = compositionConf ? compositionConf.sites.find((site: any) => {
            return parseFloat(site.center_x) == this.confParsed.center_x &&
                parseFloat(site.center_y) == this.confParsed.center_y &&
                parseFloat(site.center_z) == this.confParsed.center_z
        }) : undefined;
        this.activeSite = site
            ? site.label
            : compositionConf && compositionConf.sites
                ? 'AS' + compositionConf.sites.length + 1
                : 'AS1';
        return path.join(
            basePath,
            this.activeSite,
            this.scheduleTime!.toString(),
            'Try_n' + (1 + this.repeatNtimes - repLeft).toString(),
            'Result.pdbqt'
        );
    }

    /**
    * Update the composition configuration
    * @param basePath the base path to look for the configuration
    */
    updateCompositionConf(basePath: string) {
        let confPath = path.join(basePath, 'composition_conf.json')
        let exists = fs.existsSync(confPath);
        let siteData = {
            label: this.activeSite,
            center_x: this.confParsed.center_x,
            center_y: this.confParsed.center_y,
            center_z: this.confParsed.center_z,
        }
        if (exists) {
            let compositionConf = JSON.parse(fs.readFileSync(confPath).toString());
            let site = compositionConf ? compositionConf.sites.find((site: any) => {
                return parseFloat(site.center_x) == this.confParsed.center_x &&
                    parseFloat(site.center_y) == this.confParsed.center_y &&
                    parseFloat(site.center_z) == this.confParsed.center_z
            }) : undefined;
            if (site)
                return;
            compositionConf.sites.push(siteData)
            fs.writeFileSync(confPath, JSON.stringify(compositionConf))
        } else {
            fs.writeFileSync(confPath, JSON.stringify({
                sites: [siteData]
            }))
        }
    }
}

export { VinaConf };