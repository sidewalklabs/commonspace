import React from 'react';

import auth from 'firebase/auth';
import { render } from 'react-dom';
import Main from './main';


import applicationState, { getStudies } from './stores/applicationState';

getStudies().then(studies => {
    render(<Main isOpen={true} />, document.getElementById('app'));
});
