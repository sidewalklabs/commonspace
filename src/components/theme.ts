import { createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#0271cd'
        },
        secondary: {
            main: '#FFFFFF'
        }
    }
});

console.log(theme);

export default theme;
