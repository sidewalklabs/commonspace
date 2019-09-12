import * as admin from 'firebase-admin';
import * as uuid from 'uuid';
import * as functions from 'firebase-functions';
import * as pg from 'pg';


// https://firebase.google.com/docs/functions/config-env
const connectionName =
  process.env.INSTANCE_CONNECTION_NAME || functions.config().db.instance_connection_name;
const dbUser = process.env.DB_USER || functions.config().db.db_user;
const dbPassword = process.env.DB_PASS || functions.config().db.db_pass;
const dbName = process.env.DB_NAME || functions.config().db.db_name;

const pgConfig: pg.PoolConfig = {
  host: `/cloudsql/${connectionName}`,
  max: 1,
  user: dbUser,
  password: dbPassword,
  database: dbName,
};

console.log("config: ", pgConfig);

// Connection pools reuse connections between invocations,
// and handle dropped or expired connections automatically.
let pgPool: pg.Pool;


// https://cloud.google.com/functions/docs/sql
exports.addNewUserToDatabase = functions.auth.user().onCreate(async (user) => { 
    // create a user in the postgres database
    if (!pgPool) {
        pgPool = new pg.Pool(pgConfig);
    }

    const { email } = user;
    // ON CONFLICT- don't assume the user hasn't already signed in using another method
    const query = `INSERT INTO users(user_id, email)
                   VALUES($1, $2)
                   ON CONFLICT DO NOTHING
                   RETURNING user_id`;
    const values = [uuid.v4(), email];
    try {
      const { rows } = await pgPool.query(query, values);
      const { user_id: userId } = rows[0];
      console.log('user id: ', userId);
      // add the user to the firestore instance
      try {
        const docRef = admin.firestore().collection('users').doc(user.uid);
        await docRef.set({...user.toJSON(), postgresId: userId});
      } catch (error) {
        console.error(`[userId ${userId}] [firebaseUser ${user}] ${error}`);
      }
    } catch (error) {
      console.error(`[query ${query}][values ${JSON.stringify(values)}] ${error}`);
    }
})
