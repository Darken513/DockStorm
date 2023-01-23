import { VinaInstance } from './services/Vina/VinaUtilities/Vina';
import * as dotenv from 'dotenv';
import { VinaConf } from './services/Vina/VinaUtilities/VinaConf';
import * as path from 'path';
import * as express from 'express';

dotenv.config({ path: path.join(__dirname, '..\\configuration\\environement\\dev.env') });

// Create an Express application
const app = express();

// Set up a route for the root path
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Set up a route for the root path
app.get('/run', (req, res) => {
    console.info('running a vina instance')
    let confPath = process.env.confPath;
    const vinaConf: VinaConf = new VinaConf(confPath)
    const vinaInstance: VinaInstance = new VinaInstance(vinaConf);
    vinaInstance.runVinaCommand();
    res.send('Running a vina instance');
});

// Start the server on port 3000
app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});