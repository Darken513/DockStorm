import { ParsedVinaConf } from "./ParsedVinaConf";
import { GodService } from "../../godService/God.Service";

jest.mock('../../godService/God.Service', () => {
    return {
        GodService: {
            globalConf: {
                vinaDefault: {
                    size_x: 20,
                    size_y: 20,
                    size_z: 20,
                    energy_range: 3,
                    exhaustiveness: 8,
                    num_modes: 9
                }
            }
        },
    };
});

describe('ParsedVinaConf', () => {
    let parsedVinaConf: ParsedVinaConf;

    beforeEach(() => {
        parsedVinaConf = new ParsedVinaConf();
    });

    test('should set correct default values (loadDefaultValues)', () => {
        parsedVinaConf.loadDefaultValues();
        expect(parsedVinaConf.size_x).toBe(GodService.globalConf.vinaDefault.size_x);
        expect(parsedVinaConf.size_y).toBe(GodService.globalConf.vinaDefault.size_y);
        expect(parsedVinaConf.size_z).toBe(GodService.globalConf.vinaDefault.size_z);
        expect(parsedVinaConf.energy_range).toBe(GodService.globalConf.vinaDefault.energy_range);
        expect(parsedVinaConf.exhaustiveness).toBe(GodService.globalConf.vinaDefault.exhaustiveness);
        expect(parsedVinaConf.num_modes).toBe(GodService.globalConf.vinaDefault.num_modes);
    });

    test('should set correct values (fromJSON)', () => {
        let json = {
            receptor: 'receptor.pdbqt',
            flex: 'flex.pdbqt',
            ligand: 'ligand.pdbqt',
            out: 'out.pdbqt',
            log: 'log.txt',
            center_x: 1,
            center_y: 2,
            center_z: 3,
            size_x: 4,
            size_y: 5,
            size_z: 6,
            energy_range: 7,
            exhaustiveness: 8,
            num_modes: 9,
            cpu: 10
        };
        let parsedVinaConf = ParsedVinaConf.fromJSON(json);
        expect(parsedVinaConf.receptor).toBe(json.receptor);
        expect(parsedVinaConf.flex).toBe(json.flex);
        expect(parsedVinaConf.ligand).toBe(json.ligand);
        expect(parsedVinaConf.out).toBe(json.out);
        expect(parsedVinaConf.log).toBe(json.log);
        expect(parsedVinaConf.center_x).toBe(json.center_x);
        expect(parsedVinaConf.center_y).toBe(json.center_y);
        expect(parsedVinaConf.center_z).toBe(json.center_z);
        expect(parsedVinaConf.size_x).toBe(json.size_x);
        expect(parsedVinaConf.size_y).toBe(json.size_y);
        expect(parsedVinaConf.size_z).toBe(json.size_z);
        expect(parsedVinaConf.energy_range).toBe(json.energy_range);
        expect(parsedVinaConf.exhaustiveness).toBe(json.exhaustiveness);
        expect(parsedVinaConf.num_modes).toBe(json.num_modes);
        expect(parsedVinaConf.cpu).toBe(json.cpu);
    });
});