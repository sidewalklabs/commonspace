import React from 'react';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';

import { get, set, toJS } from 'mobx';
import { observer } from 'mobx-react';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet'


const INITIAL_ZOOM_LEVEL = 17;
const CENTER_COORDINATES = [-74.00293, 40.750496];
const TILE_SERVER_URL =
    'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png';

const regions = [];

const styles = theme => ({
    container: {
        display: 'flex',
        flexWrap: 'wrap'
    },
    root: {
        width: '400px',
        height: '400px',
        marginTop: theme.spacing.unit * 3,
        overflow: 'auto'
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



const MapView = observer((props: { surveys: any[] } & WithStyles) => {
    const { classes, surveys } = props;
    console.log('map view render');

    return (
        <Paper id="map-container" className={classes.root}>
        </Paper>
    );
});

export default withStyles(styles)(MapView);
