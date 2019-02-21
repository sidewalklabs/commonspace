import React from 'react';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import EditIcon from '@material-ui/icons/Edit';
import Paper from '@material-ui/core/Paper';
import uuid from 'uuid';

import { get, set, toJS } from 'mobx';
import { observer } from 'mobx-react';
import { Map, Marker, Popup, TileLayer, FeatureGroup, Feature, GeoJSON } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';

import applicationState from '../stores/applicationState';
import { FeatureCollection } from 'geojson';
import { stringHash } from '../utils';
import uiState from '../stores/ui';

const INITIAL_ZOOM_LEVEL = 17;
const CENTER_COORDINATES = [-74.00293, 40.750496];
const { TILE_SERVER_URL } = process.env;
//    'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png';
const MAP_ATTRIBUTION = process.env.MAP_ATTRIBUTION
    ? process.env.MAP_ATTRIBUTION
    : '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors';

const styles = theme => ({
    container: {
        flexWrap: 'wrap'
    },
    edit: {
        position: 'absolute',
        display: 'inline-block',
        bottom: 0,
        right: 0,
        width: '35px',
        height: '35px',
        zIndex: 1000
    },
    root: {
        display: 'flex',
        position: 'relative',
        width: '100%',
        flex: 1,
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

type MapDrawShape = 'line' | 'polygon';

interface MapViewProps {
    lat: number;
    lng: number;
    featureCollection: FeatureCollection;
    isEditable: boolean;
}

const MapView = observer((props: MapViewProps & WithStyles) => {
    const { classes, lat, lng, featureCollection, isEditable } = props;

    const geojson = toJS(featureCollection);
    const geojsonHash = stringHash(JSON.stringify(geojson));

    return (
        <Paper className={classes.root}>
            <Map
                className={classes.map}
                center={[lat, lng]}
                zoom={17}
                boxZoom={false}
                doubleClickZoom={false}
                scrollWheelZoom={false}
                dragging={false}
                zoomControl={false}
            >
                <TileLayer attribution={MAP_ATTRIBUTION} url={TILE_SERVER_URL} />
                <GeoJSON data={geojson} key={geojsonHash} />
            </Map>
            {isEditable ? (
                <EditIcon className={classes.edit} onClick={() => uiState.modalStack.push('map')} />
            ) : null}
        </Paper>
    );
});

// @ts-ignore
export default withStyles(styles)(MapView);
