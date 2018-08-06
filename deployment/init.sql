CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users
(
    user_id UUID PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL
);

CREATE UNIQUE INDEX users_lower_email_unique_idx ON users (lower(email));

CREATE SCHEMA IF NOT EXISTS data_collection;
-- ALTER ROLE <your_login_role> SET search_path TO data_collection,"$user",public;

CREATE TYPE studyScale AS ENUM ('district', 'city', 'cityCentre', 'neighborhood', 'blockScale', 'singleSite');

CREATE TABLE IF NOT EXISTS data_collection.study
(
    study_id UUID PRIMARY KEY,
    title TEXT,
    project TEXT,
    project_phase TEXT,
    stateDate TIMESTAMP,
    endDate TIMESTAMP,
    scale studyScale,
    userId UUID REFERENCES users(user_id) NOT NULL,
    protocolVersion TEXT NOT NULL,
    notes TEXT
);


-- INSERT INTO datacollection.study (study_id, title, userId, protocolVersion)
--   VALUES (
--     uuid_generate_v4(),
--     'Throncliffe Park Friday Night Markets',
--   )
