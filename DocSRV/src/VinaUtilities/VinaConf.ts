import * as fs from 'fs';
import * as path from "path";
import { LOGGER } from "../utilities/Logging";
import { VINA_CONF_KEYWORDS } from "../utilities/Constants";
import { ParsedVinaConf } from "./ParsedVinaConf";

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
    confPath: string;
    /**
    * @constructor - The constructor accepts an optional confPath parameter, and initializes the configuration from the file if provided.
    * @param {string} rawConf - The raw content of a vina configuration file.
    */
    constructor(confPath?: string) {
        if (confPath) {
            this.initFromPath(confPath);
        }
    }

    /**
    * setLigandPath - A method that sets the ligand for the AutoDock Vina configuration and re-affects
    * the parameter out ( output file ) if it has a receptor path as well
    * @param {string} ligand - The ligand file path 
    * @returns {this} - The current instance of the class
    */
    setLigandPath(ligand) {
        this.confParsed.ligand = ligand;
        if (this.confParsed.ligand) {
            this.reAffectOutput();
        }
        return this;
    }
    //TODO Find a way to use these in a proper way 

    /**
    * setReceptorPath - A method that sets the receptor for the AutoDock Vina configuration and re-affects 
    * the parameter out ( output file ) if it has a ligand path as well
    * @param {string} receptor - The receptor file path 
    * @returns {this} - The current instance of the class
    */
    setReceptorPath(receptor) {
        this.confParsed.receptor = receptor;
        if (this.confParsed.ligand) {
            this.reAffectOutput();
        }
        return this;
    }
    /**
    * A method that re-affects the output file based on the ligand and receptor paths
    * @param {string} receptor - The receptor file path 
    * @returns {this} - The current instance of the class
    */
    reAffectOutput() {
        let receptorBase = path.parse(this.confParsed.receptor).base
        let ligandBase = path.parse(this.confParsed.ligand).base
        let out = path.join(
            process.env.output_parent_path,
            process.env.output_folder_name,
            receptorBase.concat('_', ligandBase)
        );
        this.confParsed.out = out;
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
        lines.forEach(line => {
            const [key, value] = line.split(" = ")
            this.confParsed[key] = value
        });
    }
}

export { VinaConf };