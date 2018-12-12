import React from 'react';
import { render } from 'react-dom';
import { MuiThemeProvider } from '@material-ui/core/styles';

import applicationState from './stores/applicationState';
import Main from './components/Main';
import theme from './components/theme';

render(
    <MuiThemeProvider theme={theme}>
        <Main applicationState={applicationState} />
    </MuiThemeProvider>,
    document.getElementById('app')
);
