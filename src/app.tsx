import React from 'react';

import { render } from 'react-dom';
import applicationState from './stores/applicationState';
import Main from './components/Main';

render(<Main isOpen={true} applicationState={applicationState} />, document.getElementById('app'));
