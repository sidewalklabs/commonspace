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
                   VALUES ('${locationId}', '${country}', '${city}', '${namePrimary}', '${subdivision}', ST_GeomFromGeoJSON('${JSON.stringify(geometry)}'))`;
    try {
        return await pool.query(query);
    } catch (error) {
        console.error(error);
        console.error(`could not add location: ${JSON.stringify(location)} with query ${query}`);
    }
}
