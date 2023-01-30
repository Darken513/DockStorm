import { VinaModeResDetails } from "./VinaModeResDetails";

describe('vinaModeResDetails', () => {

    beforeEach(() => {
    });
    test('should parse line and init the values correctly', () => {
        let line = '   1         -7.7      0.000      0.000';
        let vinaModeResDetails = new VinaModeResDetails();
        vinaModeResDetails.parseLineAndInit(line);
        expect(vinaModeResDetails.mode).toBe(1);
        expect(vinaModeResDetails.affinity).toBe(-7.7);
        expect(vinaModeResDetails.rsmd_lb).toBe(0);
        expect(vinaModeResDetails.rsmd_ub).toBe(0);
    });

    test('should set correct values (fromJSON)', () => {
        let json = {
            mode: 0,
            affinity: 1,
            rsmd_lb: 2,
            rsmd_ub: 3,
        };
        let vinaModeResDetails = VinaModeResDetails.fromJSON(json);
        expect(vinaModeResDetails.mode).toBe(json.mode);
        expect(vinaModeResDetails.affinity).toBe(json.affinity);
        expect(vinaModeResDetails.rsmd_lb).toBe(json.rsmd_lb);
        expect(vinaModeResDetails.rsmd_ub).toBe(json.rsmd_ub);
    });

});