CREATE TABLE IF NOT EXISTS users
(
    user_id UUID PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL
);

CREATE UNIQUE INDEX users_lower_email_unique_idx ON users (lower(email));

