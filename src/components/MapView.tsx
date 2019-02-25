import React from 'react';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import uuid from 'uuid';

import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { Map, TileLayer, FeatureGroup, Feature, GeoJSON, withLeaflet } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import { ReactLeafletSearch } from 'react-leaflet-search';

import applicationState, { updateFeatureName, Study } from '../stores/applicationState';
import { FeatureCollection } from 'geojson';
import { closeModalIfVisible } from '../stores/ui';
import { stringHash } from '../utils';

const { TILE_SERVER_URL } = process.env;
//    'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png';
const MAP_ATTRIBUTION = process.env.MAP_ATTRIBUTION
    ? process.env.MAP_ATTRIBUTION
    : '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors';

const styles = theme => ({
    header: {
        borderBottom: `1px solid ${theme.palette.divider}`,
        padding: theme.spacing.unit * 3,
        paddingBottom: theme.spacing.unit * 2
    },
    body: {
        padding: theme.spacing.unit * 3,
        display: 'flex',
        height: '450px'
    },
    footer: {
        borderTop: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        padding: theme.spacing.unit * 3,
        justifyContent: 'flex-end'
    },
    map: {
        flex: '1 0 auto'
    }
});

type MapDrawShape = 'line' | 'polygon';

interface MapViewProps {
    lat: number;
    lng: number;
    featureCollection: FeatureCollection;
    allowedShapes: MapDrawShape;
    editable?: boolean;
    study: Study;
}

function onEdited() {}

function createMarkerFromLeafletLayer(layer, name: string): Feature {
    const { _latlng } = layer;
    const { lat, lng } = _latlng;
    return {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [lng, lat]
        },
        properties: {
            name,
            locationId: uuid.v4()
        }
    };
}

function createPolygonFromLeafletLayer(layer, name: string): Feature {
    const { _latlngs } = layer;
    const lngLats = _latlngs[0].map(({ lat, lng }) => [lng, lat]);
    const coordinates = [...lngLats, lngLats[0]];
    return {
        type: 'Feature',
        geometry: {
            type: 'Polygon',
            coordinates: [coordinates]
        },
        properties: {
            name,
            locationId: uuid.v4()
        }
    };
}

function createLineFromLeafletLayer(layer, name: string): Feature {
    const { _latlngs } = layer;
    const coordinates = _latlngs.map(({ lat, lng }) => [lng, lat]);
    return {
        type: 'Feature',
        geometry: {
            type: 'LineString',
            coordinates
        },
        properties: {
            name,
            locationId: uuid.v4()
        }
    };
}

const WrappedLeaftletSearch = withLeaflet(ReactLeafletSearch);

function onCreated(e) {
    const { layer, layerType } = e;
    const features = applicationState.currentStudy.map.features;
    if (layerType === 'marker') {
        const newMarker = createMarkerFromLeafletLayer(
            layer,
            'marker_' + features.length.toString()
        );
        applicationState.currentStudy.map.features = [...features, newMarker];
    }

    if (layerType === 'polygon') {
        const newPolygon = createPolygonFromLeafletLayer(
            layer,
            'zone_' + features.length.toString()
        );
        applicationState.currentStudy.map.features = [...features, newPolygon];
    }

    if (layerType === 'polyline') {
        const newLine = createLineFromLeafletLayer(layer, 'line_' + features.length.toString());
        applicationState.currentStudy.map.features = [...features, newLine];
    }
}
function onDeleted() {}
function onMounted() {}
function onEditStart() {}
function onEditStop() {}
function onDeleteStart() {}
function onDeleteStop() {}

const MapView = observer((props: MapViewProps & WithStyles) => {
    const { study, allowedShapes, classes, lat, lng, featureCollection, editable } = props;
    const ControlMenuOptions = {
        polygon: {
            allowIntersection: false, // Restricts shapes to simple polygons
            drawError: {
                color: '#e1e100', // Color the shape will turn when intersects
                message: "<strong>Oh snap!<strong> you can't draw that!" // Message that will show when intersect
            },
            shapeOptions: {
                color: '#97009c'
            }
        },
        // disable toolbar item by setting it to false
        circlemarker: false,
        circle: false, // Turns off this drawing tool
        rectangle: false,
        marker: {
            zIndexOffset: 1000
        },
        simpleShape: false
    };

    if (allowedShapes === 'polygon') {
        // @ts-ignore
        ControlMenuOptions.polyline = false;
    } else if (allowedShapes === 'line') {
        // @ts-ignore
        ControlMenuOptions.polygon = false;
    } else {
        console.warn(`unrecognized map shape: ${allowedShapes}`);
    }

    const geojson = toJS(featureCollection);
    const geojsonHash = stringHash(JSON.stringify(geojson));

    const onEachFeature = (feature, layer) => {
        if (feature.properties && feature.properties.name) {
            const { locationId, name } = feature.properties;
            layer.bindPopup(`<form>
                                 User name:<br>
                                 <input id="${locationId}" type="text" name="username"><br>
                             </form>`);
            layer.on('click', e => {
                const inputBox = document.getElementById(locationId) as HTMLInputElement;
                inputBox.value = feature.properties.name;
                inputBox.onchange = f => {
                    // @ts-ignore this event type is wrong
                    updateFeatureName(study, locationId, f.target.value);
                };
            });
        }
    };

    return (
        <>
            <div className={classes.header}>
                <Typography component="h2" variant="h6" color="inherit" gutterBottom noWrap>
                    Draw Zones and Points of Interest
                </Typography>
                <Typography component="h2" variant="subtitle1" color="inherit" gutterBottom noWrap>
                    Double click existing zones to rename them
                </Typography>
            </div>
            <div className={classes.body}>
                <Map className={classes.map} center={[lat, lng]} zoom={17} zoomControl={false}>
                    <TileLayer attribution={MAP_ATTRIBUTION} url={TILE_SERVER_URL} />
                    <GeoJSON
                        data={geojson}
                        key={geojsonHash}
                        onEachFeature={(feature, layer) =>
                            layer.on({ click: () => onEachFeature(feature, layer) })
                        }
                    />
                    <WrappedLeaftletSearch position="topleft" />
                    <FeatureGroup>
                        <EditControl
                            position="topright"
                            onEdited={onEdited}
                            onCreated={onCreated}
                            onDeleted={onDeleted}
                            onMounted={onMounted}
                            onEditStart={onEditStart}
                            onEditStop={onEditStop}
                            onDeleteStart={onDeleteStart}
                            onDeleteStop={onDeleteStop}
                            draw={ControlMenuOptions}
                        />
                    </FeatureGroup>
                </Map>
            </div>
            <div className={classes.footer}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => closeModalIfVisible('map')}
                >
                    Return to Study
                </Button>
            </div>
        </>
    );
});

// @ts-ignore
export default withStyles(styles)(MapView);
