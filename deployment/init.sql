CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

CREATE TABLE IF NOT EXISTS users
(
    user_id UUID PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL
);

CREATE UNIQUE INDEX users_lower_email_unique_idx ON users (lower(email));

CREATE SCHEMA IF NOT EXISTS data_collection;
-- ALTER ROLE <your_login_role> SET search_path TO data_collection,"$user",public;
set search_path TO data_collection;

CREATE TYPE studyScale AS ENUM ('district', 'city', 'cityCentre', 'neighborhood', 'blockScale', 'singleSite');

CREATE TABLE IF NOT EXISTS study
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


-- survey metadata
--  no user tied to this? I guess anonymous surveys are a thing, what about fake data?
-- TODO should id have default uuid function call?
CREATE TABLE survey (
    study_id UUID references study(study_id) NOT NULL,
    location_id UUID,
    survey_id UUID,
    time_character TEXT,
    representation NOT NULL,
    microclimate TEXT,
    temperature_c FLOAT,
    method TEXT NOT NULL,
    user_id UUID references users(user_id),
    notes
);

CREATE TYPE gender AS ENUM ('male', 'female', 'unknown');

CREATE TABLE IF NOT EXISTS study_uui
(
    survey_id UUID references survey(survey_id),
    gender gender,
    location geography 
);

-- the protocol doesn't make use of what 

-- respond to an email that allows someone with super special rights to grant access to a user
-- that user must have their own password to postgres that is super secret and kept hashed in some public databse
-- for now anyone can create a new table and cuase everyone is the same postgres user right now then everyone can see everything
-- there needs to be an outside databse, in firestore that will inject the password into the cloud function or a public table with hashed keys might do

-- signing up for a study gives you read access


-- INSERT INTO datacollection.study (study_id, title, userId, protocolVersion)
--   VALUES (
--     uuid_generate_v4(),
--     'Throncliffe Park Friday Night Markets',
--   )
