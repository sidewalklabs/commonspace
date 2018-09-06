CREATE SCHEMA IF NOT EXISTS public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

CREATE ROLE data_collector;

CREATE TABLE IF NOT EXISTS users
(
    user_id UUID PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT
);

CREATE UNIQUE INDEX users_lower_email_unique_idx ON users (lower(email));

CREATE SCHEMA IF NOT EXISTS data_collection;
ALTER ROLE data_collector SET search_path TO data_collection,"$user",public;
-- ALTER ROLE <your_login_role> SET search_path TO data_collection,"$user",public;
SET search_path TO data_collection;

CREATE TYPE studyScale AS ENUM ('district', 'city', 'cityCentre', 'neighborhood', 'blockScale', 'singleSite');

CREATE TABLE IF NOT EXISTS study
(
    study_id UUID PRIMARY KEY,
    title TEXT,
    project TEXT,
    project_phase TEXT,
    state_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    scale studyScale,
    user_id UUID REFERENCES public.users(user_id) NOT NULL,
    protocol_version TEXT NOT NULL,
    table_definition JSON,
    tablename VARCHAR(63),
    notes TEXT
);


CREATE TYPE gender AS ENUM ('male', 'female', 'unknown');
CREATE TYPE age AS ENUM ('0-14', '15-24', '25-64');
CREATE TYPE mode AS ENUM ('pedestrian', 'bicyclist');
CREATE TYPE posture AS ENUM ('leaning', 'lying', 'sitting', 'sitting on the ground', 'standing');
CREATE TYPE activities AS ENUM ('commerical', 'consuming', 'conversing', 'electronics', 'pets', 'idle', 'running');
CREATE TYPE groups AS ENUM ('group_1', 'group_2', 'group_3-7', 'group_8+');
CREATE TYPE objects AS ENUM ('animal', 'bag_carried', 'clothing_cultural', 'clothing_activity', 'goods_carried', 'equipment_construction', 'equipment_receational', 'equipment_sport', 'protection_safety', 'protection_weather', 'furniture_carried', 'transportation_carried', 'transportation_stationary', 'pushcart', 'stroller', 'luggage');

CREATE TABLE IF NOT EXISTS surveyors (
    user_id UUID references public.users(user_id) NOT NULL,
    study_id UUID references study(study_id) NOT NULL,
    PRIMARY KEY(study_id, user_id)
);

-- survey metadata
--  no user tied to this? I guess anonymous surveys are a thing, what about fake data?
-- TODO should id have default uuid function call?
CREATE TABLE IF NOT EXISTS survey (
    study_id UUID references study(study_id) NOT NULL,
    location_id UUID,
    survey_id UUID PRIMARY KEY,
    time_start TIMESTAMP WITH TIME ZONE,
    time_stop TIMESTAMP WITH TIME ZONE,
    time_character TEXT,
    representation TEXT NOT NULL,
    microclimate TEXT,
    temperature_c FLOAT,
    method TEXT NOT NULL,
    user_id UUID references public.users(user_id),
    FOREIGN KEY (study_id, user_id) references surveyors (study_id, user_id),
    notes TEXT
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
