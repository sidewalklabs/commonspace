import React from 'react';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import EditIcon from '@material-ui/icons/Edit';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';

import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { Map, TileLayer, GeoJSON } from 'react-leaflet';

import { FeatureCollection } from 'geojson';
import { stringHash } from '../utils';
import uiState from '../stores/ui';

const { TILE_SERVER_URL } = process.env;
//    'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png';
const MAP_ATTRIBUTION = process.env.MAP_ATTRIBUTION
    ? process.env.MAP_ATTRIBUTION
    : '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors';

const styles = theme => ({
    container: {
        flexWrap: 'wrap'
    },
    instructionOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    editButton: {
        position: 'absolute',
        bottom: theme.spacing.unit,
        right: theme.spacing.unit,
        zIndex: 1000
    },
    editIcon: {
        marginRight: theme.spacing.unit
    },
    root: {
        display: 'flex',
        position: 'relative',
        width: '100%',
        flex: 1,
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
    isEditable: boolean;
    showOverlay: boolean;
}

const MapView = observer((props: MapViewProps & WithStyles) => {
    const { classes, lat, lng, featureCollection, isEditable, showOverlay } = props;

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
            {isEditable && showOverlay ? (
                <div className={classes.instructionOverlay}>
                    <Button
                        className={classes.overlayEditButton}
                        variant="contained"
                        aria-label="Edit Features"
                        onClick={() => uiState.modalStack.push('map')}
                    >
                        <EditIcon className={classes.editIcon} />
                        Add a zone
                    </Button>
                </div>
            ) : null}
            {isEditable && !showOverlay ? (
                <Button
                    className={classes.editButton}
                    variant="contained"
                    aria-label="Edit Features"
                    onClick={() => uiState.modalStack.push('map')}
                >
                    <EditIcon className={classes.editIcon} />
                    Edit Zones
                </Button>
            ) : null}
        </Paper>
    );
});

// @ts-ignore
export default withStyles(styles)(MapView);
