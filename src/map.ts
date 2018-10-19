import L from 'leaflet';
import 'leaflet-draw';

import { flatMap } from './utils';

declare var document;

const INITIAL_ZOOM_LEVEL = 17;
const CENTER_COORDINATES = { latitude: 40.750496, longitude: -74.00293 };
const OSM_ATTRIBUTION =
    'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors';
const TILE_SERVER_URL =
    'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png';

const map = L.map('map');
const regions = [];

// Get the modal


var MODAL = document.getElementById('attributeModal');
const MODAL_CONTENT = document.getElementsByClassName('modal-content')[0];

// Get the <span> element that closes the modal
var CLOSE_MODAL_SPAN = document.getElementsByClassName('close')[0];

CLOSE_MODAL_SPAN.onclick = function() {
    MODAL.style.display = 'none';
    removeInputsFromModal(MODAL);
};

window.onclick = function(event) {
    if (event.target == MODAL) {
        console.log('remove');
        MODAL.style.display = 'none';
        removeInputsFromModal(MODAL);
    }
};

function removeInputsFromModal(modal) {
    const tableBody = modal.querySelectorAll('.table-body')[0];
    while (tableBody.firstChild) {
        tableBody.removeChild(tableBody.firstChild);
    }
    tableBody.remove();
    const attributeKeys = modal.querySelectorAll('.attribute-key');
    const valueKeys = modal.querySelectorAll('.attribute-value');
    const breaks = modal.querySelectorAll('.br');
    attributeKeys.forEach(k => {
        k.remove();
    });
    valueKeys.forEach(v => {
        v.remove();
    });
    breaks.forEach(b => {
        b.remove();
    });
}


function createKeyValueInputElements(key, value) {
    const keyElem = document.createElement('td');
    keyElem.contentEditable = true;
    keyElem.name = 'key';
    keyElem.className = 'attribute-key';
    keyElem.appendChild(document.createTextNode(key))
    keyElem.onblur = () => {
        valueElem.name = keyElem.value;
        valueElem.focus();
    };
    
    const valueElem = document.createElement('td');
    valueElem.contentEditable = true;
    valueElem.className = 'attribute-value';
    valueElem.appendChild(document.createTextNode(value));
    return [keyElem, valueElem]
}

/** What is the data structure that we want
 * a linked list that represents a hash map
 * one trick is that we can't write the same key twice
 * other wise the user would be confused, so you have
 * to throw an error and do a check every time you insert 
 * a new hash
 */
function addAttributeEntry(modal, properties) {
    const newTable = document.createElement('tbody');
    newTable.className = 'table-body'
    const headerRow = document.createElement('tr'); 
    ['name', 'Value'].forEach(columnName => {
        const tableHeaderCell = document.createElement('th');
        tableHeaderCell.className = 'modal-table-cell'
        tableHeaderCell.appendChild(document.createTextNode(columnName));
        headerRow.appendChild(tableHeaderCell);
    });
    newTable.appendChild(headerRow);
    const inputs = hashmapToArray(properties, createKeyValueInputElements)
    inputs.forEach(([kElem, vElem]) => {
        const row = document.createElement('tr')
        row.appendChild(kElem);
        row.appendChild(vElem);
        //const deleteRowSpan = document.createElement('span');
        //deleteRowSpan.className = 'table-remove glyphicon glyphicon-remove';
        //row.appendChild(deleteRowSpan);
        newTable.appendChild(row);
        
    });

    const keyInput = document.createElement('td');
    keyInput.contentEditable = true;
    keyInput.name = 'key';
    keyInput.className = 'attribute-key';
    const valueInput = document.createElement('td');
    valueInput.contentEditable = true;
    valueInput.className = 'attribute-value';
    keyInput.onblur = () => {
        valueInput.focus();
        valueInput.name = keyInput.value;
    };
    valueInput.onblur = function() {
        if (keyInput.value && valueInput.value) {
            console.log('saving new key value')
            properties.push([keyInput.value, valueInput.value])
        }
    };
    modal.appendChild(keyInput);
    modal.appendChild(valueInput);
    modal.appendChild(document.createElement('br'));

    modal.appendChild(newTable);
}

function initmap(map: L.Map) {
    // set up the map
    map.setView(
        new L.LatLng(CENTER_COORDINATES.latitude, CENTER_COORDINATES.longitude),
        INITIAL_ZOOM_LEVEL
    );

    // create the tile layer with correct attribution
    var osmUrl = TILE_SERVER_URL;
    var osm = new L.TileLayer(osmUrl, {
        minZoom: 8,
        maxZoom: 20,
        attribution: OSM_ATTRIBUTION
    });

    map.addLayer(osm);
}

const editableLayers = new L.FeatureGroup();
map.addLayer(editableLayers);

// @ts-ignore
const drawPluginOptions = {
    position: 'topright',
    draw: {
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
        polyline: false,
        circle: false, // Turns off this drawing tool
        rectangle: false,
        marker: {
            zIndexOffset: 1000
        },
        simpleShape: false
    },
    edit: {
        featureGroup: editableLayers, //REQUIRED!!
        remove: false
    }
};

// Initialise the draw control and pass it the FeatureGroup of editable layers
const drawControl = new L.Control.Draw(drawPluginOptions);
map.addControl(drawControl);


function latLngsToPolygonGeoJson(
    coordinates: { lat: number; lng: number }[],
    index: number
) {
    const lngLatArray = coordinates.map(({ lat, lng }) => [lng, lat])
    return {
        type: 'Feature',
        geometry: {
            type: 'Polygon',
            coordinates: [[...lngLatArray, lngLatArray[0]]]
        },
        properties: {}
    };
}

function latLngToGeoJsonPoint({
    lat,
    lng
}: {
        lat: number;
        lng: number;
    }) {
    return {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [lng, lat]
        },
        properties: {}
    };
}

function featuresArrayToFeatureCollection(features: any[]) {
    return {
        type: 'FeatureCollection',
        features
    };
}

interface KeyPair {

}
function keyValueArrayToObject(xs: [string, string][]) {
    const keyPairs = xs.map(([x, y]) => {
        const keyPair = {}; 
        keyPair[x] = y;
        return keyPairs
    });
    return Object.assign({}, ...keyPairs);
}

/**
 * take an object of string-> string and apply a function to each key value pair
 * returning an array of the outputs.
 */
function hashmapToArray(obj: {[x: string]: string}, f: (x: string, y: string) => any): any[] {
    const xs = [];
    Object.keys(obj).map(key => {
        console.log('kye: ', key);
        const value = obj[key]; 
        console.log('value: ', value);
        xs.push(f(key, value));
    });
    return xs;
}

let selectedRegion = 0;

map.on('draw:created', function(event: any) {
    const { layerType, layer, target } = event;

    if (layerType === 'polygon') {
        const { _latlngs } = layer;
        const geojson = latLngsToPolygonGeoJson(_latlngs[0], regions.length);
        regions.push(geojson);
        geojson.properties.name = 'zone_' + regions.length.toString();
    }

    if (layerType === 'marker') {
        const { _latlng } = layer;
        const geojson = latLngToGeoJsonPoint(_latlng);
        const regionIndex = regions.length;
        console.log('new region: ', regionIndex);
        regions.push(geojson);
        geojson.properties = {name: 'marker: ' + regions.length.toString()}
        const geojsonProperties = [{name: 'marker: ' + regions.length.toString()}];

        const clickHandler = () => {
            MODAL.style.display = 'block';
            selectedRegion = regionIndex;
            const { properties } = geojson;
            // console.log('a: ', expand(regions[regionIndex].properties, (k, v) => [k, v]));
            //console.log('b: ', JSON.stringify(geojson.properties));
            // TODO use the collapse and expand functions to create the attributes table 
            addAttributeEntry(MODAL_CONTENT, properties);
        };
        layer.on('click', clickHandler);
    }

    // const clickHandler = function() {
    //     console.log('attach new click handler to modal');
    //     MODAL.style.display = 'block';
    //     // TODO prepopulate
    //     addAttributeEntry(MODAL_CONTENT, geojson.properties);
    // }
    editableLayers.addLayer(layer);
});

initmap(map);

export default function downloadAsJson() {
    // * transform my data strucutre into what I want
    const featureCollection = featuresArrayToFeatureCollection(regions);
    console.log(featureCollection);
    const data =
        'data:text/json;charset=utf-8,' +
        encodeURIComponent(JSON.stringify(featureCollection));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', data);
    downloadAnchorNode.setAttribute('download', 'regions.json');
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

async function sendGeoJsonToRoute(url: string) {
    const featureCollection = featuresArrayToFeatureCollection(regions);
    const data = JSON.stringify(featureCollection);
    const response = await fetch(url, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, cors, *same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, same-origin, *omit
        headers: {
            "Content-Type": "application/json; charset=utf-8"
            // "Content-Type": "application/x-www-form-urlencoded",
        },
        redirect: "follow", // manual, *follow, error
        referrer: "no-referrer", // no-referrer, *client
        body: data, // body data type must match "Content-Type" header
    })
    if (response.status === 200){
        // we rely on the backend to give us the location Ids .... in case it decides to match ours up with something very similar (a were you trying to draw this feature cause someone else already did, maybe you should us it
        const bcAvailableLocations = new BroadcastChannel('available_locations');
        const { features } = await response.json();
        const locations = flatMap(features, ({id, properties, geometry}) => geometry.type === 'Polygon' ?
                                  {locationId: id, name: properties.name }
                                  : null
        )
        bcAvailableLocations.postMessage(locations);
    };
}

document
    .querySelector('#json-download')
    .addEventListener('click', async () => await sendGeoJsonToRoute('http://localhost:3000/locations'));
