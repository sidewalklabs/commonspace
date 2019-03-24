import React, { Fragment } from 'react';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import uuid from 'uuid';

import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import {
    Map,
    TileLayer,
    FeatureGroup,
    Feature,
    Polygon,
    Popup,
    Polyline,
    Marker,
    latLngList,
    withLeaflet,
    ZoomControl
} from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import { ReactLeafletSearch } from 'react-leaflet-search';

import applicationState, {
    updateFeatureName,
    Study,
    deleteFeatureFromMap
} from '../stores/applicationState';
import { FeatureCollection } from 'geojson';
import { closeModalIfVisible } from '../stores/ui';

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

function onMounted() {}
function onEditStart() {}
function onEditStop() {}
function onDeleteStart() {}
function onDeleteStop() {}

const leafletIdToLocationId = {};

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

    function onCreated(e) {
        const { layer, layerType, sourceTarget } = e;
        const { _leaflet_id } = layer;
        const features = applicationState.currentStudy.map.features;
        if (layerType === 'marker') {
            const newMarker = createMarkerFromLeafletLayer(
                layer,
                'marker_' + (features.length + 1).toString()
            );
            applicationState.currentStudy.map.features = [...features, newMarker];
        }

        if (layerType === 'polygon') {
            const newPolygon = createPolygonFromLeafletLayer(
                layer,
                'zone_' + (features.length + 1).toString()
            );
            const { locationId } = newPolygon.properties;
            leafletIdToLocationId[_leaflet_id] = locationId;
            applicationState.currentStudy.map.features = [...features, newPolygon];
        }

        if (layerType === 'polyline') {
            const newLine = createLineFromLeafletLayer(
                layer,
                'line_' + (features.length + 1).toString()
            );
            applicationState.currentStudy.map.features = [...features, newLine];
        }
    }

    function onDeleted({ layers }) {
        const { _layers } = layers;
        const layerIds = Object.keys(_layers);
        const locationIds = layerIds.map(k => {
            const { options } = _layers[k];
            const { locationId } = options;
            return locationId;
        });
        locationIds.forEach(deleteFeatureFromMap);
    }

    function openPopup(layer) {
        if (layer && layer.leafletElement) {
            // hack to wait for layer to be added before calling
            window.setTimeout(() => {
                layer.leafletElement.openPopup();
            });
        }
    }

    const existingFeatures = geojson.features.map(({ geometry, properties }, i) => {
        // @ts-ignore
        const { coordinates, type } = geometry;
        const { locationId, name } = properties;
        if (type === 'Polygon') {
            const positions: latLngList = coordinates[0].map(([lng, lat]) => {
                return [lat, lng];
            });
            return (
                <Polygon
                    color="blue"
                    key={locationId}
                    locationId={locationId}
                    id={locationId}
                    positions={positions}
                    ref={openPopup}
                >
                    <Popup>
                        <input
                            id={locationId}
                            type="text"
                            defaultValue={name}
                            onKeyPress={e => {
                                if (e.key === 'Enter') {
                                    const inputBox = document.getElementById(
                                        locationId
                                    ) as HTMLInputElement;
                                    updateFeatureName(study, locationId, inputBox.value);
                                }
                            }}
                        />
                        <Button
                            size="small"
                            color="primary"
                            onClick={f => {
                                const inputBox = document.getElementById(
                                    locationId
                                ) as HTMLInputElement;
                                updateFeatureName(study, locationId, inputBox.value);
                            }}
                        >
                            Save
                        </Button>
                    </Popup>
                </Polygon>
            );
        } else if (type === 'LineString') {
            const positions: latLngList = coordinates.map(([lng, lat]) => {
                return [lat, lng];
            });
            return (
                <Polyline
                    color="blue"
                    key={locationId}
                    locationId={locationId}
                    id={locationId}
                    positions={positions}
                    ref={openPopup}
                >
                    <Popup>
                        <input
                            id={locationId}
                            type="text"
                            defaultValue={name}
                            onKeyPress={e => {
                                if (e.key === 'Enter') {
                                    const inputBox = document.getElementById(
                                        locationId
                                    ) as HTMLInputElement;
                                    updateFeatureName(study, locationId, inputBox.value);
                                }
                            }}
                        />
                        <Button
                            size="small"
                            color="primary"
                            onClick={f => {
                                const inputBox = document.getElementById(
                                    locationId
                                ) as HTMLInputElement;
                                updateFeatureName(study, locationId, inputBox.value);
                            }}
                        >
                            Save
                        </Button>
                    </Popup>
                </Polyline>
            );
        } else if (type === 'Point') {
            const position = [coordinates[1], coordinates[0]];
            return (
                <Marker
                    key={locationId}
                    locationId={locationId}
                    id={locationId}
                    position={position}
                    ref={openPopup}
                >
                    <Popup>
                        <input
                            id={locationId}
                            type="text"
                            defaultValue={name}
                            onKeyPress={e => {
                                if (e.key === 'Enter') {
                                    const inputBox = document.getElementById(
                                        locationId
                                    ) as HTMLInputElement;
                                    updateFeatureName(study, locationId, inputBox.value);
                                }
                            }}
                        />
                        <Button
                            size="small"
                            color="primary"
                            onClick={f => {
                                const inputBox = document.getElementById(
                                    locationId
                                ) as HTMLInputElement;
                                updateFeatureName(study, locationId, inputBox.value);
                            }}
                        >
                            Save
                        </Button>
                    </Popup>
                </Marker>
            );
        } else {
            return null;
        }
    });

    return (
        <Fragment>
            <div className={classes.header}>
                <Typography variant="h6" color="inherit" gutterBottom noWrap>
                    Draw Zones and Points of Interest
                </Typography>
                <Typography variant="subtitle1" color="inherit" gutterBottom noWrap>
                    Use the {allowedShapes} tool to draw zones for your surveyors to study. Click
                    existing zones to rename them.
                </Typography>
            </div>
            <div className={classes.body}>
                <Map className={classes.map} center={[lat, lng]} zoom={17} zoomControl={false}>
                    <TileLayer attribution={MAP_ATTRIBUTION} url={TILE_SERVER_URL} />
                    <WrappedLeaftletSearch position="topleft" />
                    <ZoomControl position="bottomright" />
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
                        {existingFeatures}
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
        </Fragment>
    );
});

// @ts-ignore
export default withStyles(styles)(MapView);
