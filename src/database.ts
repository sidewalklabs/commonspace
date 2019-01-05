import * as pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
//dotenv.config({ path: path.join(process.env.DOTENV_CONFIG_DIR, '.env')});
dotenv.config({ path: process.env.DOTENV_CONFIG_DIR ? path.join(process.env.DOTENV_CONFIG_DIR, '.env'): ''});

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_NAME,
    max: parseInt(process.env.DB_POOL_SIZE),
    idleTimeoutMillis: parseInt(process.env.DB_CLIENT_TIMEOUT)
};

const pool = new pg.Pool(config);

pool.connect(function(err, client, done) {
    if (err) {
        console.error(`[config ${JSON.stringify(config)}] ${err}`);
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
