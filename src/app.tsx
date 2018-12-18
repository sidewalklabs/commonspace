import React from 'react';
import { render } from 'react-dom';
import { MuiThemeProvider } from '@material-ui/core/styles';

import MainWrapper from './components/MainWrapper';
import theme from './components/theme';

render(
    <MuiThemeProvider theme={theme}>
        <MainWrapper />
    </MuiThemeProvider>,
    document.getElementById('app')
);
