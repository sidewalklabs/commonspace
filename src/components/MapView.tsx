import React from 'react';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import uuid from 'uuid';

import { get, set, toJS } from 'mobx';
import { observer } from 'mobx-react';
import { Map, Marker, Popup, TileLayer, FeatureGroup, Feature, GeoJSON } from 'react-leaflet'
import { EditControl } from 'react-leaflet-draw'

import applicationState from '../stores/applicationState'
import { FeatureCollection } from 'geojson';
import { stringHash } from '../utils';


const INITIAL_ZOOM_LEVEL = 17;
const CENTER_COORDINATES = [-74.00293, 40.750496];
const { TILE_SERVER_URL } = process.env;
//    'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png';
const MAP_ATTRIBUTION = process.env.MAP_ATTRIBUTION ? process.env.MAP_ATTRIBUTION : '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors';

const styles = theme => ({
    container: {
        flexWrap: 'wrap'
    },
    root: {
        display: 'flex',
        width: '100%',
        height: '400px',
        marginTop: theme.spacing.unit * 3,
        overflow: 'auto'
    },
    map: {
        flex: '1 0 auto'
    },
    table: {
        minWidth: 400,
        overflow: 'auto'
    },
    textfield: {
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        width: 125
    }
});

interface MapViewProps {
    lat: number;
    lng: number;
    featureCollection: FeatureCollection;
}

function onEdited() {
}


function onCreated(e) {
    const { layer, layerType } = e;
    const features = applicationState.currentStudy.map.features;
    if (layerType === 'marker') {
        // Do marker specific actions
        const { _latlng } = layer;
        const { lat, lng } = _latlng;
        const newMarker: Feature = {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [lng, lat]
            },
            properties: {
                name: 'marker: ' + features.length.toString()
            }
        }

        applicationState.currentStudy.map.features = [...features, newMarker];
    }

    if (layerType === 'polygon') {
        const { _latlngs } = layer;
        const lngLats = _latlngs[0].map(({ lat, lng }) => [lng, lat]);
        const coordinates = [...lngLats, lngLats[0]]
        const newPolygon: Feature = {
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [coordinates],
            },
            properties: {
                name: 'zone_' + features.length.toString(),
                locationId: uuid.v4()
            }
        }

        applicationState.currentStudy.map.features = [...features, newPolygon];
        const index = features.length - 1;
        layer.on('click', () => {
            console.log('click');
        });
    }
}
function onDeleted() { }
function onMounted() { }
function onEditStart() { }
function onEditStop() { }
function onDeleteStart() { }
function onDeleteStop() { }

const MapView = observer((props: MapViewProps & WithStyles) => {
    const { classes, lat, lng, featureCollection } = props;
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
    }

    const geojson = toJS(featureCollection);
    const geojsonHash = stringHash(JSON.stringify(geojson));

    return (
        <Paper className={classes.root}>
            <Map className={classes.map} center={[lat, lng]} zoom={17} zoomControl={false}>
                <TileLayer
                    attribution={MAP_ATTRIBUTION}
                    url={TILE_SERVER_URL}
                />
                <GeoJSON data={geojson} key={geojsonHash} />
                <FeatureGroup>
                    <EditControl
                        position='topright'
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
        </Paper >
    );
});

// @ts-ignore
export default withStyles(styles)(MapView);
