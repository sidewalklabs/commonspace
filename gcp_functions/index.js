const pg = require('pg');
const uuid = require('uuid');

// https://cloud.google.com/functions/docs/sql
const pgConfig = {
    connectionLimit: 1,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
};

if (process.env.NODE_ENV === 'production') {
    pgConfig.host = `/cloudsql/${process.env.DB_HOST}`;
}

const pool = new pg.Pool(pgConfig);

async function createVerifiedUserFromEmail(pool, email) {
    const userId = uuid.v4();
    const query = `INSERT INTO users(user_id, email, password, is_verified)
                   VALUES($1, $2, '', TRUE)
                   RETURNING user_id`;
    const values = [userId, email];
    try {
        const { rows } = await pool.query(query, values);
        const { user_id } = rows[0];
        return user_id;
    } catch (error) {
        const { code, constraint } = error;
        const emailConstaintViolation =
            constraint === 'users_lower_email_unique_idx' || constraint === 'users_email_key';
        if (code === '23505' && emailConstaintViolation) {
            const queryExistingUser = `WITH lowered_email AS (
                            SELECT lower(email) as email, user_id, password
                            FROM users
                        )
                        SELECT user_id, password
                        FROM lowered_email usrs
                        WHERE usrs.email = lower($1)`;
            try {
                const { rows: rs} = await pool.query(
                    queryExistingUser,
                    [email]
                );
                const { user_id } = rs[0];
                return user_id;
            } catch (error) {
                console.error(
                    `[query ${update}][values ${JSON.stringify(
                        autoCreatedUsersUpdateValues
                    )}] ${error}`
                );
                throw error;
            }
        } else {
            console.error(`[query ${query}][values ${JSON.stringify(values)}] ${error}`);
            throw error;
        }

    }
}

exports.saveNewUser = async (req, res) => {
    try {
        const { email } = req.body;
        const userId = await createVerifiedUserFromEmail(pool, email);
        res.send({ email, user_id: userId });
    } catch (error) {
        console.error(error);
        res.send(500);
    }
};
