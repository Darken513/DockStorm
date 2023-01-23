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
    size_x: number = 20;
    size_y: number = 20;
    size_z: number = 20;
    energy_range: number = 3;
    exhaustiveness: number = 8;
    num_modes: number = 9;
    cpu: number;
    constructor() { }
}

export { ParsedVinaConf }