CREATE SCHEMA IF NOT EXISTS public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE ROLE data_collector;

CREATE TABLE IF NOT EXISTS users
(
    user_id UUID PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT,
    is_oauth BOOLEAN DEFAULT FALSE,
    name TEXT
);

CREATE UNIQUE INDEX users_lower_email_unique_idx ON users (lower(email));

CREATE TABLE IF NOT EXISTS password_reset
(
    email TEXT UNIQUE REFERENCES users(email) ON DELETE CASCADE,
    token TEXT PRIMARY KEY,
    expiration TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS account_verification
(
    email TEXT UNIQUE REFERENCES users(email) ON DELETE CASCADE,
    token TEXT PRIMARY KEY,
    expiration TIMESTAMP WITH TIME ZONE,
    verified BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS admin_whitelist
(
    email TEXT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS token_blacklist
(
    token TEXT PRIMARY KEY,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    blacklisted_at TIMESTAMP WITH TIME ZONE default now()
);

CREATE SCHEMA IF NOT EXISTS data_collection;
ALTER ROLE data_collector SET search_path TO data_collection,"$user",public;
-- ALTER ROLE <your_login_role> SET search_path TO data_collection,"$user",public;
SET search_path TO data_collection;

CREATE TYPE studyScale AS ENUM ('district', 'city', 'cityCentre', 'neighborhood', 'blockScale', 'singleSite');
CREATE TYPE studyType AS ENUM('stationary', 'movement');


CREATE TABLE IF NOT EXISTS location
(
    location_id UUID PRIMARY KEY,
    country TEXT,
    city TEXT,
    name_primary TEXT,
    subdivision TEXT,
    geometry public.geometry
);

CREATE TABLE IF NOT EXISTS study
(
    study_id UUID PRIMARY KEY,
    title TEXT,
    author TEXT,
    author_url TEXT,
    project TEXT,
    project_phase TEXT,
    state_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    scale studyScale,
    user_id UUID REFERENCES public.users(user_id) NOT NULL,
    protocol_version TEXT NOT NULL,
    study_type studyType NOT NULL,
    fields VARCHAR[],
    tablename VARCHAR(63),
    location TEXT,
    map JSON,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE default now(),
    last_updated TIMESTAMP WITH TIME ZONE default now()
);

CREATE TYPE gender AS ENUM ('male', 'female', 'unknown');
CREATE TYPE age AS ENUM ('0-14', '15-24', '25-64', '65+');
CREATE TYPE mode AS ENUM ('pedestrian', 'bicyclist', 'other');
CREATE TYPE posture AS ENUM ('leaning', 'lying', 'sitting', 'sitting on the ground', 'standing', 'sitting_informal', 'sitting_formal');
CREATE TYPE activities AS ENUM ('commercial', 'consuming', 'conversing', 'electronic_engagement', 'recreation_active', 'pets', 'idle', 'running', 'recreation_passive', 'working_civic', 'cultural');
CREATE TYPE groups AS ENUM ('group_1', 'group_2', 'group_3-7', 'group_8+');
CREATE TYPE object AS ENUM ('animal', 'bag_carried', 'clothing_cultural', 'clothing_activity', 'goods_carried', 'equipment_construction', 'equipment_receational', 'equipment_sport', 'protection_safety', 'protection_weather', 'furniture_carried', 'transportation_carried', 'transportation_stationary', 'pushcart', 'stroller', 'luggage');

CREATE TABLE IF NOT EXISTS surveyors (
    user_id UUID references public.users(user_id) NOT NULL,
    study_id UUID references study(study_id) ON DELETE CASCADE NOT NULL,
    PRIMARY KEY(study_id, user_id)
);

-- survey metadata
--  no user tied to this? I guess anonymous surveys are a thing, what about fake data?
-- TODO should id have default uuid function call?
CREATE TABLE IF NOT EXISTS survey (
    study_id UUID references study(study_id) ON DELETE CASCADE NOT NULL,
    title TEXT,
    location_id UUID,
    survey_id UUID PRIMARY KEY,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    time_character TEXT,
    representation TEXT NOT NULL,
    microclimate TEXT,
    temperature_c FLOAT,
    method TEXT NOT NULL,
    user_id UUID references public.users(user_id),
    FOREIGN KEY (study_id, user_id) references surveyors (study_id, user_id) ON DELETE CASCADE,
    notes TEXT
);


CREATE OR REPLACE VIEW survey_to_tablename AS
 SELECT sr.survey_id, st.tablename
 FROM study as st
 INNER JOIN survey as sr
 ON st.study_id = sr.study_id;

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
