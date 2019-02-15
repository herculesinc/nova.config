// IMPORTS
// ================================================================================================
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as objectPath from 'object-path';
import * as stripComments from 'strip-json-comments';
import { Settings, Logger, Decryptor } from '@nova/config';

// MODULE VARIABLES
// ================================================================================================
const CONFIG_DIR_VAR = 'CONFIG_DIR';
const CONFIG_SECRET_VAR = 'CONFIG_SECRET';

let settings: Settings;
let logger: Logger | undefined;
let decryptor: Decryptor = defaultDecryptor;

// EXPORTED FUNCTIONS
// ================================================================================================
export function getSettings() : Settings {

    // if config settings have already been read, just return them
    if (settings) return settings;

    // otherwise, read remaining settings from the configuration file
    try {
        const env = process.env.NODE_ENV || 'development';

        const configDir = getConfigDir();
        if (!configDir) throw new Error('config directory could not be found');
        
        const configFile = path.join(configDir, env) + '.json';
        logger && logger.info('Reading configuration from ' + configFile);
        const configContent = fs.readFileSync(configFile, 'utf8');
        settings = JSON.parse(stripComments(configContent));
        settings.env = env;
        
        // decrypt secrets
        const secretsFile = path.join(configDir, env) + '.secrets';
        if (fs.existsSync(secretsFile)) {
            logger && logger.info('Reading secrets from ' + secretsFile);
            const encryptedSecrets = fs.readFileSync(secretsFile, 'utf8');
            if (!decryptor) throw Error('decryptor is undefined');
            const secrets = decryptor(encryptedSecrets);
            
            // set secrets in settings object
            for (let prop in secrets) {
                objectPath.set(settings, prop, secrets[prop]);
            }
        }
        else {
            logger && logger.warn('Secrets file could not be found');
        }
    }
    catch (err) {
        err.message = 'Failed to read config file: ' + err.message;
        throw err;
    }
    
    return settings;
}

export function configure(settings: { logger?: Logger; decryptor?: Decryptor; }) {
    if (!settings) throw new TypeError('Configuration settings are undefined');
    
    // set logger
    if (settings.logger === null) {
        logger = undefined;
    }
    else if (settings.logger) {
        logger = logger;
    }

    // set decryptor
    if (settings.decryptor) {
        decryptor = decryptor;
    }
}

// HELPER FUNCTIONS
// ================================================================================================
function getConfigDir(): string | undefined {
    let basePath = process.cwd();
    let subPath = process.env[CONFIG_DIR_VAR] || 'config';
    let configDir = path.join(basePath, subPath);
    
    for (let i = 0; i < 100; i++) {
        try {
            fs.accessSync(configDir)
            return configDir;
        }
        catch (error) {
            let newBase = path.join(basePath, '..');
            if (newBase === basePath) return undefined;
            basePath = newBase;
            configDir = path.join(basePath, subPath);
        }
    }
}

function defaultDecryptor(encrypted: string): any {
    const key = process.env[CONFIG_SECRET_VAR] || settings.env;
    const decipher = crypto.createDecipher('aes-256-cbc', key);

    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
}