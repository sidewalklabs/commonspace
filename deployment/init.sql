CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

CREATE ROLE data_collection_admin;

CREATE TABLE IF NOT EXISTS users
(
    user_id UUID PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL
);

CREATE UNIQUE INDEX users_lower_email_unique_idx ON users (lower(email));

CREATE SCHEMA IF NOT EXISTS data_collection;
ALTER ROLE data_collection_admin SET search_path TO data_collection,"$user",public;
-- ALTER ROLE <your_login_role> SET search_path TO data_collection,"$user",public;
set search_path TO data_collection;

CREATE TYPE studyScale AS ENUM ('district', 'city', 'cityCentre', 'neighborhood', 'blockScale', 'singleSite');

CREATE TABLE IF NOT EXISTS study
(
    study_id UUID PRIMARY KEY,
    title TEXT,
    project TEXT,
    project_phase TEXT,
    state_date TIMESTAMP,
    end_date TIMESTAMP,
    scale studyScale,
    user_id UUID REFERENCES public.users(user_id) NOT NULL,
    protocol_version TEXT NOT NULL,
    notes TEXT
);


-- survey metadata
--  no user tied to this? I guess anonymous surveys are a thing, what about fake data?
-- TODO should id have default uuid function call?
CREATE TABLE IF NOT EXISTS survey (
    study_id UUID references study(study_id) NOT NULL,
    location_id UUID,
    survey_id UUID PRIMARY KEY,
    time_character TEXT,
    representation TEXT NOT NULL,
    microclimate TEXT,
    temperature_c FLOAT,
    method TEXT NOT NULL,
    user_id UUID references public.users(user_id),
    notes TEXT
);

CREATE TYPE gender AS ENUM ('male', 'female', 'unknown');

CREATE TABLE IF NOT EXISTS surveyors(
    survey_id references survey(survey_id) NOT NULL,
    user_id references users(user_id) NOT NULL,
    PRIMARY KEY(survey_id, user_id)
)

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
