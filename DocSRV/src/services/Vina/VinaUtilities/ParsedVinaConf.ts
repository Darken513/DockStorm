import { GodService } from "../../godService/God.Service";

/**
* @class ParsedVinaConf
* is a class that represents the parsed configuration of the AutoDock Vina program.
*/
class ParsedVinaConf {
    receptor: string|undefined;
    flex: string|undefined;
    ligand: string|undefined;
    out: string|undefined; //the output structure should be the following : absPath/receptor_ligand.pdbqt
    log: string|undefined; //the output structure should be the following : absPath/resLog.txt
    center_x: number|undefined;
    center_y: number|undefined;
    center_z: number|undefined;
    size_x: number|undefined;
    size_y: number|undefined;
    size_z: number|undefined;
    energy_range: number|undefined;
    exhaustiveness: number|undefined;
    num_modes: number|undefined;
    cpu: number|undefined;
    constructor() {
        this.loadDefaultValues();
    }
    loadDefaultValues() {
        let globalConf = GodService.globalConf.vinaDefault;
        this.size_x = globalConf.size_x;
        this.size_y = globalConf.size_y;
        this.size_z = globalConf.size_z;
        this.energy_range = globalConf.energy_range;
        this.exhaustiveness = globalConf.exhaustiveness;
        this.num_modes = globalConf.num_modes;
    }
    static fromJSON(json:any){
        let toret = new ParsedVinaConf();
        toret.receptor = json.receptor; 
        toret.flex = json.flex; 
        toret.ligand = json.ligand; 
        toret.out = json.out; 
        toret.log = json.log;  
        toret.center_x = json.center_x;
        toret.center_y = json.center_y;
        toret.center_z = json.center_z;
        toret.size_x = json.size_x;
        toret.size_y = json.size_y;
        toret.size_z = json.size_z;
        toret.energy_range = json.energy_range;
        toret.exhaustiveness = json.exhaustiveness;
        toret.num_modes = json.num_modes;
        toret.cpu = json.cpu;
        return toret;
    }
}

export { ParsedVinaConf }