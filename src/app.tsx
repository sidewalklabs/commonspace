import React from 'react';
import { render } from 'react-dom';
import { MuiThemeProvider } from '@material-ui/core/styles';

import MainWrapper from './components/MainWrapper';
import theme from './components/theme';
import router from './stores/router';

render(
    <MuiThemeProvider theme={theme}>
        <MainWrapper router={router} />
    </MuiThemeProvider>,
    document.getElementById('app')
);
