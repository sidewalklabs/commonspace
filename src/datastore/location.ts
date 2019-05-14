import { Pool } from 'pg';
import { Feature, FeatureCollection, Point, Polygon } from 'geojson';
import { IdDoesNotExist } from './utils';

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/reverse?format=json';

export interface Location {
    locationId: string;
    country?: string;
    city?: string;
    namePrimary: string;
    subdivision?: string;
    geometry: Polygon;
}

export async function createLocation(pool: Pool, location: Location): Promise<Location> {
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

export async function deleteLocation(pool: Pool, locationId: string): Promise<void> {
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

export async function saveGeoJsonFeatureAsLocation(pool: Pool, x: Feature) {
    const { geometry, properties } = x;
    const { location_id: locationId, name: namePrimary } = properties;
    let shape;
    if (geometry.type === 'Polygon') {
        shape = geometry.coordinates[0];
    }
    if (geometry.type === 'LineString') {
        shape = geometry.coordinates;
    }
    if (x.type === 'Feature' && geometry.type === 'Polygon') {
        const [lngs, lats] = shape.reduce(
            ([lngs, lats], [lng, lat]) => {
                return [lngs + lng, lats + lat];
            },
            [0, 0]
        );
        const lngCenterApprox = lngs / geometry.coordinates[0].length;
        const latCenterApprox = lats / geometry.coordinates[0].length;
        const url = NOMINATIM_BASE_URL + `&lat=${latCenterApprox}&lon=${lngCenterApprox}`;
        //const response = await fetch(url);
        //const body = await response.json();
        const city = '';
        const country = '';
        const subdivision = '';
        return createLocation(pool, {
            locationId,
            namePrimary,
            city,
            country,
            subdivision,
            geometry
        });
    }
}
