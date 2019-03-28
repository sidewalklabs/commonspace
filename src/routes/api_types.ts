import { Feature, FeatureCollection, Point } from 'geojson';

export type Activity =
    | 'commercial'
    | 'consuming'
    | 'conversing'
    | 'cultural'
    | 'disruptive'
    | 'electronic_engagement'
    | 'living_public'
    | 'recreation_active'
    | 'recreation_passive'
    | 'smoking'
    | 'soliciting'
    | 'waiting_transfer'
    | 'waiting_other'
    | 'working_civic';

export type StudyField =
    | 'gender'
    | 'age'
    | 'mode'
    | 'posture'
    | 'activities'
    | 'groups'
    | 'object'
    | 'location'
    | 'notes';

export type StudyStatus = 'active' | 'completed';
export type StudyType = 'stationary' | 'movement';

export interface Survey {
    survey_id: string;
    title?: string;
    location?: Feature;
    location_id: string;
    start_date: string;
    end_date: string;
    email: string;
    representation: string;
    microclimate?: string;
    temperature_celsius?: string;
    method: string;
    notes?: string;
}

export interface DataPoint {
    data_point_id: string; // UUID
    creation_date?: string;
    last_updated?: string;
    gender?: string;
    age?: string;
    mode?: string;
    posture?: string;
    activities?: Activity[];
    groups?: string;
    object?: string;
    date: string;
    location?: Point;
    notes?: string;
}

export interface Study {
    study_id: string;
    title: string;
    author?: string;
    author_url?: string;
    protocol_version: string;
    surveyors: string[];
    type: StudyType;
    status: StudyStatus;
    map?: FeatureCollection;
    surveys?: Survey[];
    fields: StudyField[];
    location: string;
    description?: string;
    created_at?: any;
    last_updated?: any;
    data_points?: DataPoint[];
}
