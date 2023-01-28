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
    activeSite: string = 'AS0';
    scheduleTime: number | undefined;
    resolveTime: number | undefined;
    /**
    * @constructor - The constructor accepts an optional confPath parameter, and initializes the configuration from the file if provided.
    * @param {string} rawConf - The raw content of a vina configuration file.
    */
    constructor(confPath?: string) {
        if (confPath) {
            this.initFromPath(confPath);
        }
    }
    static fromJSON(json:any){
        let toret = new VinaConf();
        toret.confParsed = ParsedVinaConf.fromJSON(json.confParsed);
        toret.confPath = json.confPath;
        toret.outputCopiesPath = json.outputCopiesPath;
        toret.activeSite = json.activeSite;
        toret.scheduleTime = json.scheduleTime;
        toret.resolveTime = json.resolveTime;
        return toret;
    }
    /**
    * setLigandPath - A method that sets the ligand for the AutoDock Vina configuration and re-affects
    * the parameter out ( output file ) if it has a receptor path as well
    * @param {string} ligand - The ligand file path 
    * @returns {this} - The current instance of the class
    */
    setLigandPath(ligand: string) {
        this.confParsed.ligand = ligand;
        return this;
    }
    //TODO Find a way to use these in a proper way 

    /**
    * setReceptorPath - A method that sets the receptor for the AutoDock Vina configuration and re-affects 
    * the parameter out ( output file ) if it has a ligand path as well
    * @param {string} receptor - The receptor file path 
    * @returns {this} - The current instance of the class
    */
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
    * A method that re-affects the output file based on the ligand and receptor paths
    * if predifined then it decides where to make copies of them
    * @param {string} receptor - The receptor file path 
    * @returns {this} - The current instance of the class
    */
    reAffectOutput() {
        if (!this.confParsed.receptor || !this.confParsed.ligand)
            return;
        let receptorBase = path.parse(this.confParsed.receptor).name;
        let ligandBase = path.parse(this.confParsed.ligand).name;
        let out = path.join(
            GodService.globalConf.output.path,
            GodService.globalConf.output.folderName,
            receptorBase.concat('_', ligandBase),
            this.activeSite,
            this.scheduleTime!.toString(),
            'Result.pdbqt'
        );
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
}

export { VinaConf };