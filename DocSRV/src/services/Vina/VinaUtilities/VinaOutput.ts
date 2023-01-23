import { VinaModeResDetails } from "./VinaModeResDetails";

/**
* @class VinaOutput
* is a class that represents the output of a Vina command execution.
* @property {number} randomSeed - The random seed value used in the Vina command execution, default is -1.
* @property {Array<VinaModeResDetails>} modes - An array that contains the details of the generated modes by the Vina command execution.
* @property {string} warningMsg - A string that contains a warning message if the execution of the Vina command generated one.
*/
class VinaOutput {
    randomSeed: number = -1;
    modes: Array<VinaModeResDetails> = [];
    warningMsg: string = '';
    /**
    * @constructor - The constructor initializes an empty instance of the class.
    */
    constructor() { }
}

export { VinaOutput }