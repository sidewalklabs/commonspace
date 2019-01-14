import React from 'react';
import { render } from 'react-dom';
import { MuiThemeProvider } from '@material-ui/core/styles';

import MainWrapper from './components/MainWrapper';
import theme from './components/theme';
import router from './stores/router';
import uiState from './stores/ui';

render(
    <MuiThemeProvider theme={theme}>
        <MainWrapper router={router} uiState={uiState} />
    </MuiThemeProvider>,
    document.getElementById('app')
);
