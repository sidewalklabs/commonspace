import * as pg from 'pg';
import { Polygon } from 'geojson';

export interface Location {
    locationId: string;
    country?: string;
    city?: string;
    namePrimary: string;
    subdivision?: string;
    geometry: Polygon;
}

export async function createLocation(pool: pg.Pool, location: Location) {
    const { locationId, namePrimary, geometry, country='', city='', subdivision='' } = location;
    const query = `INSERT INTO data_collection.location
                   (location_id, country, city, name_primary, subdivision, geometry)
                   VALUES ($1, $2, $3, $4, $5, ST_GeomFromGeoJSON($6))`;
    const values = [locationId, country, city, namePrimary, subdivision, JSON.stringify(geometry)];
    try {
        return await pool.query(query, values);
    } catch (error) {
        console.error(`[query ${query}][values ${values}] ${error}`);
    }
}
