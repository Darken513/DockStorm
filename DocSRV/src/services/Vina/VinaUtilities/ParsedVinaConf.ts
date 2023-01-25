import { GodService } from "../../godService/God.Service";

/**
* @class ParsedVinaConf
* is a class that represents the parsed configuration of the AutoDock Vina program.
*/
class ParsedVinaConf {
    receptor: string;
    flex: string;
    ligand: string;
    out: string; //the output structure should be the following : absPath/receptor_ligand.pdpqt
    log: string; //the output structure should be the following : absPath/resLog.txt
    center_x: number;
    center_y: number;
    center_z: number;
    size_x: number;
    size_y: number;
    size_z: number;
    energy_range: number;
    exhaustiveness: number;
    num_modes: number;
    cpu: number;
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
}

export { ParsedVinaConf }