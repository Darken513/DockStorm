import * as fs from 'fs';
import * as path from 'path';
import { GodService } from './God.Service';

jest.mock('fs');

describe('GodService', () => {
    beforeEach(() => {
        // Clear the globalConf property before each test
        GodService.globalConf = {};
    });

    test('loadGlobalConf should load the global configuration', () => {
        // Arrange
        const globalConf = {
            key1: 'value1',
            key2: 'value2'
        };

        // Configure the mocked fs.readFileSync to return the globalConf object
        // when called with '../configuration/DocSRVconf.json' as the first argument
        jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(globalConf));

        // Act
        GodService.loadGlobalConf();

        // Assert
        expect(GodService.globalConf).toEqual(globalConf);
        expect(fs.readFileSync).toHaveBeenCalledWith(path.join(__dirname, '../../configuration/DocSRVconf.json'));
    });
});