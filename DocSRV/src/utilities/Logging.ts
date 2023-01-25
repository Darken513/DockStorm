import * as path from 'path';
import * as winston from 'winston';

/**
*  A logger instance that uses the winston library to log messages to different destinations
* 
* @level: the minimum level of log messages to be captured is set to 'info'
* 
* @format: `[timestamp] [level] [className]: {message in json format}}`
* 
* @transports: the destinations to which log messages are sent
*  - File transport for error logs, with a filename 'error.log'
*  - File transport for combined logs, with a filename 'combined.log'
* 
* If the environment is not 'production', an additional console transport is added
* with the simple format
*/
const LOGGER = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.printf(info => {
            return `[${info.timestamp}] [${info.level}] [${info.className}]: ${info.message}`;
        })
    ),
    transports: [
        //new winston.transports.File({ filename: path.join(__dirname, '../../logs/error.log'), level: 'error' }),
        //new winston.transports.File({ filename: path.join(__dirname, '../../logs/combined.log') })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    LOGGER.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

export { LOGGER }
