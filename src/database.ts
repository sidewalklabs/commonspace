import * as pg from 'pg';
import dotenv from 'dotenv';
import { getEnvVariableRetry } from './environment';
dotenv.config();

const user = getEnvVariableRetry('DB_USER');
const password = getEnvVariableRetry('DB_PASS');
const host = getEnvVariableRetry('DB_HOST');
const port = parseInt(getEnvVariableRetry('DB_PORT'));
const database = getEnvVariableRetry('DB_NAME');
const max = parseInt(getEnvVariableRetry('DB_POOL_SIZE'));
const idleTimeoutMillis = parseInt(getEnvVariableRetry('DB_CLIENT_TIMEOUT'));

const config = {
    user,
    password,
    host,
    port,
    database,
    max,
    idleTimeoutMillis
};

const pool = new pg.Pool(config);

pool.connect(function(err, client, done) {
    if (err) {
        console.error(`[config ${config}] ${err}`);
        process.exit(1);
    }
    done();
});

pool.on("error", function(err, client) {
    // if an error is encountered by a client while it sits idle in the pool
    // the pool itself will emit an error event with both the error and
    // the client which emitted the original error
    // this is a rare occurrence but can happen if there is a network partition
    // between your application and the database, the database restarts, etc.
    // and so you might want to handle it and at least log it out
    console.error("idle client error", err.message, err.stack);
});

export default pool;
