import * as pg from 'pg';
import { Polygon } from 'geojson';
import { IdDoesNotExist } from './utils';

export interface Location {
    locationId: string;
    country?: string;
    city?: string;
    namePrimary: string;
    subdivision?: string;
    geometry: Polygon;
}

export async function createLocation(pool: pg.Pool, location: Location): Promise<Location> {
    const {
        locationId,
        namePrimary,
        geometry,
        country = '',
        city = '',
        subdivision = ''
    } = location;
    const query = `INSERT INTO data_collection.location
                   (location_id, country, city, name_primary, subdivision, geometry)
                   VALUES ($1, $2, $3, $4, $5, ST_GeomFromGeoJSON($6))`;
    const values = [locationId, country, city, namePrimary, subdivision, JSON.stringify(geometry)];
    try {
        await pool.query(query, values);
        return location;
    } catch (error) {
        console.error(`[query ${query}][values ${JSON.stringify(values)}] ${error}`);
        throw error;
    }
}

export async function deleteLocation(pool: pg.Pool, locationId: string): Promise<void> {
    const query = `DELETE
                   FROM data_collection.location
                   WHERE location_id = $1`;
    const values = [locationId];
    try {
        const { rowCount } = await pool.query(query, values);
        if (rowCount === 0) {
            throw new IdDoesNotExist(`location for location_id ${locationId} not found`);
        }
    } catch (error) {
        console.error(`[query ${query}][values ${JSON.stringify(values)}] ${error}`);
        throw error;
    }
}
