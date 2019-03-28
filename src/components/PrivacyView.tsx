import React from 'react';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import AppBar from '../components/AppBar';

import { observer } from 'mobx-react';

const styles = theme => ({
    content: {
        width: 'auto',
        margin: 'auto',
        padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme.spacing.unit *
            3}px`,
        [theme.breakpoints.up('md')]: {
            width: theme.breakpoints.values.md
        },
        overflowWrap: 'break-word'
    }
});

export interface PrivacyViewProps {
    webview?: boolean;
}

const PrivacyView = observer((props: PrivacyViewProps & WithStyles) => {
    const { classes, webview } = props;
    return (
        <>
            {!webview && <AppBar />}
            <div className={classes.content}>
                <Typography variant="h4" gutterBottom>
                    CommonSpace Privacy Policy
                </Typography>
                <Typography variant="h6" paragraph>
                    Last Updated: March 1, 2019
                </Typography>
                <Typography variant="body2" paragraph>
                    This Privacy Policy explains how your personal information, as the surveyor, is
                    collected and used by Sidewalk Toronto Limited Partnership (“Sidewalk Toronto”)
                    or by Sidewalk Labs LLC and its controlled subsidiaries or affiliates (“Sidewalk
                    Labs,” “we”, “our”, or “us”) when you download or use CommonSpace.
                </Typography>

                <Typography variant="h5" gutterBottom>
                    Collection of Information
                </Typography>
                <Typography variant="h6">
                    Public Life Study Information Collected with CommonSpace
                </Typography>
                <Typography variant="body2" paragraph>
                    CommonSpace supports the collection of data about the characteristics of people
                    and their activities in the public realm or public spaces, through the practice
                    known as public life studies. This data does not identify individuals, and as
                    such is non-personal data and not personal information. While CommonSpace will
                    collect your personal information as set out in this policy when you use the
                    app, the app is not designed to collect personal or identifiable data for anyone
                    whose activity is observed through a public life study using the app.
                </Typography>
                <Typography variant="body2" paragraph>
                    You may enter broad demographic attributes of people in the public realm as
                    determined by you into the app. You may also input free-form comments about your
                    observations. Do not enter personal information into the free-form comments
                    field and in-line instructions. CommonSpace will remind you not to do so.
                </Typography>

                <Typography variant="h6">Information You Provide to Us</Typography>
                <Typography variant="body2" paragraph>
                    CommonSpace collects your personal information, including your email address and
                    a password for the purpose of logging in and authenticating your use of the app.
                </Typography>

                <Typography variant="h6">Information Collected Automatically</Typography>
                <Typography variant="body2" paragraph>
                    Sidewalk Labs does not collect performance metrics or usage information of
                    CommonSpace. However, a third party, that we used to build the front-end of
                    CommonSpace, does collect some user data for the purposes of detecting events or
                    crashes in order to improve their product. Sidewalk Labs does not have access to
                    this data.
                </Typography>
                <Typography variant="body2" paragraph>
                    CommonSpace pulls data from the public Google Maps API to display the basemap
                    (e.g., the locations and shapes of streets, parks, plazas, and other map
                    features). CommonSpace will request your permission to access your device’s
                    location services to display your location as a blue dot on the map; this data
                    is not transmitted off your device.
                </Typography>

                <Typography variant="h6">Information collected by our contractors</Typography>
                <Typography variant="body2" paragraph>
                    We use contractors to provide us with services. When contractors are collecting
                    personal information on behalf of Sidewalk Toronto, we put in place measures to
                    protect the privacy and security of that information. In some cases, we put in
                    place additional measures to limit the personal information provided by the
                    contractor to Sidewalk Toronto. For example, we may hire a survey company to
                    carry out surveys on our behalf, and will instruct the contractor to only
                    provide us with aggregate, non-identifying information.
                </Typography>

                <Typography variant="h5" gutterBottom>
                    Use of Information Collected Using CommonSpace
                </Typography>
                <Typography variant="body2" paragraph>
                    Sidewalk Labs uses your personal information: to authenticate your use of
                    CommonSpace; to record public life activity data that you input into
                    CommonSpace; to improve CommonSpace; to produce aggregate data to share with the
                    public and other stakeholders; to respond to your comments, questions or
                    requests about CommonSpace; and to administer the security of CommonSpace and to
                    protect other users, the public, and Sidewalk Labs.
                </Typography>
                <Typography variant="body2" paragraph>
                    Sidewalk Labs maintains custody of the public life activity data that you and
                    other users collect using CommonSpace with control granted to study organizers,
                    who have full ability to manage and delete data. Sidewalk secures this data with
                    best practices including encryption, and records access through logging.
                </Typography>
                <Typography variant="body2" paragraph>
                    CommonSpace is an open-source application and others may build, host, and
                    distribute versions or derivatives of the app not provided, hosted, or
                    controlled by Sidewalk Labs and that are not subject to this Privacy Policy. Any
                    data collected by such apps, including personal information and study data, is
                    collected and controlled by the person providing the app and not Sidewalk Labs.
                </Typography>
                <Typography variant="body2" paragraph>
                    To log into CommonSpace, users may use Google Sign-in or create a new account
                    with CommonSpace. In the case of Google Sign-in, Google maintains custody and
                    control of the source data, which is provided upon request by Sidewalk Labs. In
                    the case of a CommonSpace account, Sidewalk has custody and control of the data.
                    Sidewalk stores this data in cloud servers located in Montreal.
                </Typography>
                <Typography variant="body2" paragraph>
                    We will retain your information for as long as necessary to fulfill the purposes
                    for which it was collected and as required by law.
                </Typography>

                <Typography variant="h5" gutterBottom>
                    Sharing of Information
                </Typography>
                <Typography variant="body2" paragraph>
                    The study administrator will have access to the public life activity data that
                    you collect using CommonSpace and this data will be attributable to you. Please
                    contact the study administrator if you have questions on how they use
                    information or on their privacy practices.
                </Typography>
                <Typography variant="body2" paragraph>
                    As a general rule, we do not disclose your personal information to third parties
                    unless we have your consent or we are required by law. We use reasonable
                    measures to keep your personal information safe. We may share your personal
                    information with our affiliates and other contractors who collect and use your
                    personal information on our behalf. These contractors may use your personal
                    information only to perform the functions they carry out on our behalf, in
                    compliance with appropriate confidentiality and security measures. We require
                    that they protect your personal information at the same high level as we do.
                </Typography>

                <Typography variant="h5" gutterBottom>
                    Contact Us
                </Typography>
                <Typography variant="body2" paragraph>
                    If you have any questions about this Privacy Policy, please contact us at:{' '}
                    <a href="mailto:privacy@sidewalklabs.com?subject=CommonSpace">
                        privacy@sidewalklabs.com
                    </a>
                    .
                </Typography>
                <Typography variant="body2" paragraph>
                    Sidewalk Labs, 307 Lake Shore Boulevard East, <br />
                    Toronto, ON M5A 1C1, Canada <br />
                    <br />
                    Sidewalk Labs, 10 Hudson Yards, 26th Floor New York, NY, 10001
                </Typography>
            </div>
        </>
    );
});

// @ts-ignore
export default withStyles(styles)(PrivacyView);
