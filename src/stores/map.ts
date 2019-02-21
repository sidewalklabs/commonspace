import { observable, autorun, toJS } from 'mobx';

import { FeatureCollection } from 'react-leaflet';

const mapState: FeatureCollection = observable({
    type: 'FeatureCollection',
    features: []
});

autorun(() => {
    console.log('features: ', toJS(mapState));
});

export default mapState;
