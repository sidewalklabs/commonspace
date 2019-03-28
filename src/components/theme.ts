import { createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
    typography: {
        useNextVariants: true
    },
    palette: {
        primary: {
            main: '#0271cd'
        },
        secondary: {
            main: '#FFFFFF'
        }
    }
});

export default theme;
