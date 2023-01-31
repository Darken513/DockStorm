import path from "path";
import { GodService } from "../../godService/God.Service";
import { VinaConf } from "./VinaConf";

jest.mock("../../godService/God.Service", () => {
    return {
        GodService: {
            globalConf: {
                vinaDefault: {
                    size_x: 20,
                    size_y: 20,
                    size_z: 20,
                    energy_range: 3,
                    exhaustiveness: 8,
                    num_modes: 9,
                },
                output: {
                    path: "/output/path",
                    folderName: "folderName",
                },
            },
        },
    };
});

describe("VinaConf", () => {
    let vinaConf: VinaConf;
    var outputPath = "/output/path";
    var folderName = "folderName";
    beforeEach(() => {
        vinaConf = new VinaConf();
    });

    describe("setLigandPath", () => {
        test("should set the ligand path correctly", () => {
            const ligand = "/path/to/ligand";
            vinaConf.setLigandPath(ligand);
            expect(vinaConf.confParsed.ligand).toBe(ligand);
        });
    });

    describe("setReceptorPath", () => {
        test("should set the receptor path correctly", () => {
            const receptor = "/path/to/receptor";
            vinaConf.setReceptorPath(receptor);
            expect(vinaConf.confParsed.receptor).toBe(receptor);
        });
    });

    describe("setActiveSite", () => {
        test("should set the active site and its corresponding vec3D correctly", () => {
            const name = "AS1";
            const vec3D = { x: 1, y: 2, z: 3 };
            vinaConf.setActiveSite(name, vec3D);
            expect(vinaConf.activeSite).toBe(name);
            expect(vinaConf.confParsed.center_x).toBe(vec3D.x);
            expect(vinaConf.confParsed.center_y).toBe(vec3D.y);
            expect(vinaConf.confParsed.center_z).toBe(vec3D.z);
        });
    });

    describe("getBasePath", () => {
        test("should return the correct base path", () => {
            vinaConf.confParsed.receptor = "/path/to/receptor.pdb";
            vinaConf.confParsed.ligand = "/path/to/ligand.pdb";
            const receptorBase = "receptor";
            const ligandBase = "ligand";
            const expectedBasePath = path.join(
                outputPath,
                folderName,
                receptorBase + "_" + ligandBase
            );
            expect(vinaConf.getBasePath()).toBe(expectedBasePath);
        });
    });

    describe("startsWithKeyWord", () => {
        test("should return the keyword if the input string starts with the keyword", () => {
            const result = vinaConf.startsWithKeyWord(
                "receptor keyword input string"
            );
            expect(result).toBe("receptor");
        });

        test("should return undefined if the input string does not start with the keyword", () => {
            const result = vinaConf.startsWithKeyWord(
                "input string without receptor keyword"
            );
            expect(result).toBe(undefined);
        });
    });

    describe("parseAndInit", () => {
        test("should correctly parse and initialize the configuration", () => {
            const rawConf = `key1 = value1
                            key2 = value2
                            key3 = value3`;
            vinaConf.parseAndInit(rawConf);
            expect((vinaConf.confParsed as any).key1).toEqual("value1");
            expect((vinaConf.confParsed as any).key2).toEqual("value2");
            expect((vinaConf.confParsed as any).key3).toEqual("value3");
        });

        test("should handle empty lines correctly", () => {
            const rawConf = `key1 = value1
                            key2 = value2
                            \n\n\nkey3 = value3`;
            vinaConf.parseAndInit(rawConf);
            expect((vinaConf.confParsed as any).key1).toEqual("value1");
            expect((vinaConf.confParsed as any).key2).toEqual("value2");
            expect((vinaConf.confParsed as any).key3).toEqual("value3");
        });

        test("should handle Windows line endings correctly", () => {
            const rawConf = `key1 = value1\r\n
                            key2 = value2\r\n
                            key3 = value3`;
            vinaConf.parseAndInit(rawConf);
            expect((vinaConf.confParsed as any).key1).toEqual("value1");
            expect((vinaConf.confParsed as any).key2).toEqual("value2");
            expect((vinaConf.confParsed as any).key3).toEqual("value3");
        });
    });

    describe("getOutPutPath", () => {
        let basePath: string;
        let repLeft: number;
        let compositionConf: any;

        beforeEach(() => {
            basePath = "/path/to/base";
            repLeft = 2;
            compositionConf = {
                sites: [
                    {
                        label: "AS1",
                        center_x: 1,
                        center_y: 1,
                        center_z: 1,
                    },
                    {
                        label: "AS2",
                        center_x: 4,
                        center_y: 5,
                        center_z: 6,
                    },
                ],
            };
        });

        test("returns correct path when site is found", () => {
            vinaConf.confParsed.center_x = 1;
            vinaConf.confParsed.center_y = 1;
            vinaConf.confParsed.center_z = 1;
            vinaConf.scheduleTime = 11111111111;
            vinaConf.repeatNtimes = 4;

            const expectedPath = path.join(
                basePath,
                "AS1",
                "11111111111",
                "Try_n3",
                "Result.pdbqt"
            );

            expect(vinaConf.getOutPutPath(basePath, repLeft, compositionConf)).toBe(
                expectedPath
            );
        });

        test("returns correct path when site is not found", () => {
            vinaConf.confParsed.center_x = 2;
            vinaConf.confParsed.center_y = 2;
            vinaConf.confParsed.center_z = 2;
            vinaConf.scheduleTime = 11111111111;
            vinaConf.repeatNtimes = 5;

            const expectedPath = path.join(
                basePath,
                "AS3",
                "11111111111",
                "Try_n4",
                "Result.pdbqt"
            );

            expect(vinaConf.getOutPutPath(basePath, repLeft, compositionConf)).toBe(
                expectedPath
            );
        });
    });
});
