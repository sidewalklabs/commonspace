import dotenv from 'dotenv';
dotenv.config();

export function getEnvVariableRetry(varName: string, nRetries: number = 10, timeout: number = 50000) {
    if (nRetries > 0) {
        if (process.env[varName] && typeof process.env[varName] === 'string' && process.env[varName].length > 0) {
            return process.env[varName];
        }
        setTimeout(() => getEnvVariableRetry(varName, nRetries - 1, timeout), timeout);
    }
    if (nRetries === 0) {
        throw new Error(`Unable to load environment variable after ${nRetries} retries`);
    }
}
