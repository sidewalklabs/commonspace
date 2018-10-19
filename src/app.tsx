import React from 'react';

import { render } from 'react-dom';
import Main from './components/main';

import applicationState, { getStudies } from './stores/applicationState';

getStudies().then(studies => {
    render(<Main isOpen={true} />, document.getElementById('app'));
});
