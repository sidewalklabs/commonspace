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
        }
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
                <Typography variant="headline" gutterBottom>
                    Sidewalk Toronto Privacy Policy
                </Typography>
                <Typography variant="body2" paragraph>
                    Last Updated: June 6, 2018
                </Typography>
                <Typography variant="body1" paragraph>
                    This Privacy Policy explains how your personal information is collected and used
                    by Sidewalk Toronto Limited Partnership (“Sidewalk Toronto”) when you visit its
                    websites, when you interact with Sidewalk Toronto directly or through our
                    contractors.{' '}
                </Typography>

                <Typography variant="h6" gutterBottom>
                    Collection of Information{' '}
                </Typography>
                <Typography variant="body2">Information You Provide to Us</Typography>
                <Typography variant="body1" paragraph>
                    We only collect personal information you provide directly to us, including
                    through our websites or when you contact us with respect to our programs or
                    initiatives. This may include your name, email address, phone number, online
                    profile, resume and other job application information and any other information
                    you choose to provide.
                </Typography>

                <Typography variant="body2">Information We Collect Automatically </Typography>
                <Typography variant="body1" paragraph>
                    When you use our websites, we automatically collect personal information, such
                    as the type of browser you use, your access times, your IP address and the page
                    you visited before navigating to our website. You can opt out through your
                    browser.{' '}
                </Typography>

                <Typography variant="body2">Information collected by our contractors</Typography>
                <Typography variant="body1" paragraph>
                    We use contractors to provide us with services. When contractors are collecting
                    personal information on behalf of Sidewalk Toronto, we put in place measures to
                    protect the privacy and security of that information. In some cases, we put in
                    place additional measures to limit the personal information provided by the
                    contractor to Sidewalk Toronto. For example, we may hire a survey company to
                    carry out surveys on our behalf, and will instruct the contractor to only
                    provide us with aggregate, non-identifying information.
                </Typography>

                <Typography variant="body2">Analytics Services Provided by Others</Typography>
                <Typography variant="body1" paragraph>
                    In connection with the use of our websites, we may allow others to provide
                    analytics services, such as Google Analytics. These entities may use cookies,
                    web beacons, and other technologies to collect information about your use of our
                    websites and other websites and online services, including your IP address, web
                    browser, pages viewed, time spent on pages, links clicked and conversion
                    information. This information may be used by us and others to, among other
                    things, analyze and track data, determine the popularity of certain content and
                    better understand your online activity. More information about Google Analytics
                    and Privacy is available here:{' '}
                    <a
                        href="https://support.google.com/analytics/answer/6004245?hl=en"
                        target="_blank"
                    >
                        https://support.google.com/analytics/answer/6004245?hl=en
                    </a>
                    .
                </Typography>

                <Typography variant="h6" gutterBottom>
                    Use of Information
                </Typography>
                <Typography variant="body1">We may use this information to:</Typography>
                <ul>
                    <li>
                        <Typography variant="body1">Provide and improve our websites;</Typography>
                    </li>
                    <li>
                        <Typography variant="body1">
                            Evaluate your job application and consider you for employment;
                        </Typography>
                    </li>
                    <li>
                        <Typography variant="body1">
                            Respond to your comments, questions or requests;
                        </Typography>
                    </li>
                    <li>
                        <Typography variant="body1">
                            Communicate with you about news and information we think will be of
                            interest to you;
                        </Typography>
                    </li>
                    <li>
                        <Typography variant="body1">
                            Monitor and analyze trends, usage and activities in connection with use
                            of our websites; and
                        </Typography>
                    </li>
                    <li>
                        <Typography variant="body1">
                            Administer the physical security of our premises, including through the
                            use of security video surveillance.
                        </Typography>
                    </li>
                </ul>
                <Typography variant="body1" paragraph>
                    When we solicit information, such as in connection with employment opportunities
                    or community engagement, we will provide information to you at the time about
                    the purposes for which information is being collected, used or disclosed.
                </Typography>

                <Typography variant="h6" gutterBottom>
                    Sharing of Information
                </Typography>
                <Typography variant="body1" paragraph>
                    We do not disclose your personal information to third parties unless we have
                    your consent or we are required by law. We use reasonable measures to keep your
                    personal information safe.{' '}
                </Typography>
                <Typography variant="body1" paragraph>
                    We may share your personal information with our affiliates strictly to provide
                    you our services. We require that they protect your personal information at the
                    same high level as we do.{' '}
                </Typography>

                <Typography variant="h6" gutterBottom>
                    Transfer of Information to Other Countries
                </Typography>
                <Typography variant="body1" paragraph>
                    Your personal information may be held outside of Canada and subject to foreign
                    laws. Still, we require guarantees from our partners that it will be kept safe.
                </Typography>

                <Typography variant="h6" gutterBottom>
                    Your Access and Correction Rights
                </Typography>
                <Typography variant="body1" paragraph>
                    You can request access to your personal information by contacting{' '}
                    <a href="mailto:privacy@sidewalktoronto.ca?subject=CommonSpace">
                        privacy@sidewalktoronto.ca
                    </a>
                    . We will promptly respond to your request unless we are prohibited to do so by
                    law. In that case we will justify our refusal.
                </Typography>

                <Typography variant="h6" gutterBottom>
                    Contact Us
                </Typography>
                <Typography variant="body1" paragraph>
                    If you have any questions about this Privacy Policy, please contact us at:{' '}
                    <a href="mailto:privacy@sidewalktoronto.ca?subject=CommonSpace">
                        privacy@sidewalktoronto.ca
                    </a>
                    .
                </Typography>
                <Typography variant="body1" paragraph>
                    Sidewalk Toronto 20 Bay St., Suite 1310 Toronto, ON M5J 2N8 Canada
                </Typography>
            </div>
        </>
    );
});

// @ts-ignore
export default withStyles(styles)(PrivacyView);
