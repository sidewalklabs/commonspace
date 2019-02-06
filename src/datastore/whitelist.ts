import { Pool } from 'pg';

export async function checkUserIsWhitelistApproved(pool: Pool, email: string): Promise<boolean> {
    const query = `SELECT email
                   FROM admin_whitelist
                   WHERE email = $1`;
    const values = [email];
    try {
        const { rowCount } = await pool.query(query, values);
        if (rowCount !== 1) {
            return false;
        }
        return true;
    } catch (error) {
        console.error(`[query ${query}][values ${JSON.stringify(values)}] ${error}`);
        throw error;
    }
}

export async function checkUserIsWhitelistApprovedById(
    pool: Pool,
    userId: string
): Promise<boolean> {
    const query = `SELECT email
                   FROM users
                   INNER JOIN admin_whitelist
                   ON users.email = admin_whitelist.email
                   WHERE user_id = $1`;
    const values = [userId];
    try {
        const { rowCount } = await pool.query(query, values);
        if (rowCount !== 1) {
            return false;
        }
        return true;
    } catch (error) {
        console.error(`[query ${query}][values ${JSON.stringify(values)}] ${error}`);
        throw error;
    }
}
