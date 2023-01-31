import * as fs from 'fs';
import * as path from "path";
import { LOGGER } from "../../../utilities/Logging";
import { VINA_CONF_KEYWORDS } from "../../../utilities/Constants";
import { ParsedVinaConf } from "./ParsedVinaConf";
import { GodService } from '../../godService/God.Service';

/**
* @class VinaConf - The main class to configure and run Vina
* @property {ParsedVinaConf} confParsed - The parsed configuration of the vina run
* @property {string | undefined} confPath - The path of the vina configuration file
* @property {{out: string, log: string}} outputCopiesPath - Output path for vina runs
* @property {string} activeSite - The active site where the vina will run
* @property {number | undefined} scheduleTime - The time at which the vina run is scheduled
* @property {number | undefined} resolveTime - The time at which the vina run is resolved
* @property {number} repeatNtimes - The number of times the vina run will be repeated
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
    * @constructor - The constructor creates an instance of VinaConf and initializes it with the configuration provided in the confPath parameter if provided.
    * If no confPath is provided, the instance is created with default values.
    * @param {object} options - The options for the VinaConf
    * @param {string} options.confPath - The path of the vina configuration file
    * @param {number} options.repitions - The number of times the vina run will be repeated
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

    /**
    * @method static fromJSON - Create a VinaConf object from a JSON object
    * @param {object} json - The JSON object from which to create a VinaConf object
    */
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

    /** 
    * @method setLigandPath - Set the path of the ligand
    * @param {string} ligand - The path of the ligand 
    */
    setLigandPath(ligand: string) {
        this.confParsed.ligand = ligand;
        return this;
    }
    //TODO Find a way to use these in a proper way 

    /** 
    * @method setReceptorPath - Set the path of the receptor
    * @param {string} receptor - The path of the receptor
    */
    setReceptorPath(receptor: string) {
        this.confParsed.receptor = receptor;
        return this;
    }
    
    /** 
    * @method setActiveSite - Set the active site where the vina will run
    * @param {string} name - The name of the active site
    * @param {any} vec3D - The 3D vector of the active site
    */
    setActiveSite(name: string, vec3D: any) {
        this.activeSite = name;
        this.confParsed.center_x = vec3D.x;
        this.confParsed.center_y = vec3D.y;
        this.confParsed.center_z = vec3D.z;
    }

    /** 
    * @method getBasePath - Get the base path of the vina run
    */
    public getBasePath(){
        let receptorBase = path.parse(this.confParsed.receptor!).name;
        let ligandBase = path.parse(this.confParsed.ligand!).name;
        return path.join(
            GodService.globalConf.output.path,
            GodService.globalConf.output.folderName,
            receptorBase.concat('_', ligandBase)
        );
    }

    /**
    * reAffectOutput method updates the output file path and log file path for the given input parameters.
    * @param {number} repLef - The remaining repeat times for the process.
    * @returns {void}
    */
    reAffectOutput(repLef: number) {
        if (!this.confParsed.receptor || !this.confParsed.ligand)
            return;
        let basePath = this.getBasePath();
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
            const [key, value] = line.trim().split(" = ");
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
                ? 'AS' + (compositionConf.sites.length + 1)
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