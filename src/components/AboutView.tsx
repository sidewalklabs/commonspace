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
    },
    blockquote: {
        borderLeft: `2px solid ${theme.palette.primary.main}20`,
        marginLeft: theme.spacing.unit * 4,
        paddingLeft: theme.spacing.unit * 2
    }
});

export interface AboutViewProps {
    webview?: boolean;
}

const AboutView = observer((props: AboutViewProps & WithStyles) => {
    const { classes, webview } = props;
    return (
        <>
            {!webview && <AppBar rightHeaderType="login" />}
            <div className={classes.content}>
                <Typography variant="h6" gutterBottom>
                    About CommonSpace
                </Typography>
                <Typography variant="body1" paragraph>
                    CommonSpace is a map-based data collection mobile application that makes it
                    easier to record observations of human activities in open spaces — a method
                    known as public life studies. Public life studies are used to develop a better
                    understanding of how public spaces serve the needs of people and communities.
                </Typography>
                <Typography variant="body1" paragraph>
                    People who are interested in conducting a public life study — city planners,
                    designers, community groups, etc — can create a study using a web portal for
                    CommonSpace. A study organizer begins by defining their research question, and
                    then configuring the needed observations into the app. Then, they recruit
                    surveyors to conduct the study, who are assigned “shifts” in the public space
                    under study. The surveyors spend time in the space and use the CommonSpace
                    mobile app to record data about what they observe at defined intervals to
                    capture a snapshot of public life activity. CommonSpace implements an open data
                    standard known as the Public Life Data Protocol.
                </Typography>
                <Typography variant="body1" paragraph>
                    Afterwards, study organizers are able to download the data and can select
                    a toggle to post their study and publish the underlying data on a public data
                    portal.
                </Typography>

                <Typography variant="h6" gutterBottom>
                    Why we built CommonSpace
                </Typography>
                <Typography variant="body1" paragraph>
                    A people-first public realm starts with knowing and understanding how our shared
                    spaces function. Understanding how people use parks, plazas, and neighbourhood
                    spaces enables students, researchers, communities, and governments alike to
                    understand the impact of design and programming on public life. Public life data
                    can support civic action, policy revisions and decision-making that affect how
                    spaces are designed, built, operated and programmed.
                </Typography>
                <Typography variant="body1" paragraph>
                    However, the complexity of preparing a public life study can be a barrier to
                    understanding how our public spaces work. The objective of CommonSpace is to
                    make it easier to conduct these types of studies. Our hope is to enable all
                    types of people to use public life data in their work, from research to planning
                    to civic engagement.
                </Typography>
                <Typography variant="body1" paragraph>
                    CommonSpace builds on a decades-long tradition of using data to understand how
                    people interact with parks and public spaces in order to improve quality of
                    life. CommonSpace implements the Public Life Data Protocol, a data standard
                    published by Gehl Institute, in partnership with Copenhagen, San Francisco,
                    Seattle and the Gehl practice, to standardize the data collection process,
                    support evaluating the impact of public spaces, and enable new innovations in
                    making cities for and with people.
                </Typography>

                <Typography variant="h6" gutterBottom>
                    The Public Life Data Protocol
                </Typography>
                <Typography variant="body1" paragraph>
                    From{' '}
                    <a
                        href="https://gehlinstitute.org/tool/public-life-data-protocol/"
                        target="_blank"
                    >
                        Gehl Institute
                    </a>
                </Typography>
                <Typography variant="body1" className={classes.blockquote} paragraph>
                    The Public Life Data Protocol (the Protocol) describes a set of metrics that are
                    important to the understanding of public life—people moving and staying in
                    public space—and aims to establish a common format for the collection and
                    storage of such data. Used in conjunction with the Public Life Data Tools or
                    other observational methods for collecting data about people in public space,
                    the Protocol provides the structure for the data you collect.
                </Typography>
                <Typography variant="body1" className={classes.blockquote} paragraph>
                    Based on four decades of research and application of data about public life to
                    shape public policy, planning, and urban design, the Protocol is an open data
                    specification intended to improve the ability of everyone to share and compare
                    information about public life activity in public space. In recent years,
                    practitioners and cities have incorporated people-centered metrics and public
                    life data into their engineering models, investment decisions, and design
                    choices. These methods, based on decades of research, have now been applied in
                    hundreds of cities around the world. There is tremendous potential to make
                    public life datasets more compatible, scalable, and comparable across different
                    cities and regions.
                </Typography>

                <Typography variant="h6" gutterBottom>
                    Pilot in Thorncliffe Park
                </Typography>
                <Typography variant="body1" paragraph>
                    CommonSpace was co-developed and field-tested with three partner organizations:
                    Gehl Institute, Park People, and the Thorncliffe Park Women’s Committee.
                </Typography>
                <ul>
                    <li>
                        <Typography variant="body1">
                            <a href="https://gehlinstitute.org/" target="_blank">
                                Gehl Institute
                            </a>{' '}
                            is a non profit with the mission to transform the way cities are shaped
                            by making public life an intentional driver for design, policy, and
                            governance. Their work has included the publication of a number of tools
                            and worksheets that make it easier to design and conduct public life
                            studies. In 2017, they partnered with the Gehl practice, Copenhagen
                            Municipality, San Francisco City Planning, and Seattle Department of
                            Transportation to publish the Public Life Data Protocol, a data standard
                            for collecting public life data.
                        </Typography>
                    </li>
                    <li>
                        <Typography variant="body1">
                            <a href="https://parkpeople.ca/" target="_blank">
                                Park People
                            </a>{' '}
                            is a non profit that helps people activate the power of parks in cities
                            across Canada, and they are experienced in designing and running public
                            life studies in Toronto. In 2018, they launched the Public Space
                            Incubator program that awarded grants to support projects that
                            re-imagine Toronto’s public spaces.
                        </Typography>
                    </li>
                    <li>
                        <Typography variant="body1">
                            <a href="https://www.tpwomenscomm.org/" target="_blank">
                                The Thorncliffe Park Women’s Committee (TPWC)
                            </a>{' '}
                            is a non profit grassroots organization dedicated to creating and
                            implementing public space enhancement projects in the community of
                            Thorncliffe Park, and over the past decade they have created a vibrant
                            public market and cafe in their neighborhood park, RV Burgess Park. They
                            are a recipient of funding from Park People’s Public Space Incubator
                            program.
                        </Typography>
                    </li>
                </ul>
                <Typography variant="body1" paragraph>
                    In September 2018, under the supervision of Park People, TPWC conducted the
                    first public life study using CommonSpace. Their research questions focused on
                    the effect of programming in the park and on the impact of adding more tables
                    and chairs near the cafe. More information about this study is available from
                    Park People{' '}
                    <a href="https://parkpeople.ca/archives/10207" target="_blank">
                        here
                    </a>
                    .
                </Typography>

                <Typography variant="h6" gutterBottom>
                    News
                </Typography>
                <ul>
                    <li>
                        <Typography variant="body1">
                            February 5, 2019: Opened pre-launch testing to Protocol Partners
                        </Typography>
                    </li>
                </ul>

                <Typography variant="h6" gutterBottom>
                    Links
                </Typography>
                <Typography variant="subheading" gutterBottom>
                    CommonSpace announcements
                </Typography>
                <ul>
                    <li>
                        <Typography variant="body1">
                            Sidewalk Labs:{' '}
                            <a
                                href="https://medium.com/sidewalk-toronto/commonspace-a-new-digital-tool-for-public-life-studies-74deeb353a40"
                                target="_blank"
                            >
                                CommonSpace: A NEW DIGITAL TOOL FOR PUBLIC LIFE STUDIES
                            </a>
                        </Typography>
                    </li>
                    <li>
                        <Typography variant="body1">
                            Park People:{' '}
                            <a href="https://parkpeople.ca/archives/10207" target="_blank">
                                What we learned from testing a new public life study tool
                            </a>
                        </Typography>
                    </li>
                    <li>
                        <Typography variant="body1">
                            Park People:{' '}
                            <a href="https://parkpeople.ca/archives/9809" target="_blank">
                                Working to make studying public life easier: a pilot project in R.V.
                                Burgess Park
                            </a>
                        </Typography>
                    </li>
                </ul>
                <Typography variant="subheading" gutterBottom>
                    General information on public life studies
                </Typography>
                <ul>
                    <li>
                        <Typography variant="body1">
                            Gehl Institute:{' '}
                            <a href="https://gehlinstitute.org/public-life-tools/" target="_blank">
                                https://gehlinstitute.org/public-life-tools/
                            </a>
                        </Typography>
                    </li>
                    <li>
                        <Typography variant="body1">
                            Public Life Data Protocol:{' '}
                            <a
                                href="https://gehlinstitute.org/tool/public-life-data-protocol/"
                                target="_blank"
                            >
                                https://gehlinstitute.org/tool/public-life-data-protocol/
                            </a>
                        </Typography>
                    </li>
                    <li>
                        <Typography variant="body1">
                            SF Planning:{' '}
                            <a
                                href="https://sf-planning.org/public-space-and-public-life-studies"
                                target="_blank"
                            >
                                https://sf-planning.org/public-space-and-public-life-studies
                            </a>
                        </Typography>
                    </li>
                    <li>
                        <Typography variant="body1">
                            Seattle DOT:{' '}
                            <a
                                href="https://www.seattle.gov/transportation/projects-and-programs/programs/urban-design-program/public-life-study"
                                target="_blank"
                            >
                                https://www.seattle.gov/transportation/projects-and-programs/programs/urban-design-program/public-life-study
                            </a>
                        </Typography>
                    </li>
                    <li>
                        <Typography variant="body1">
                            Gehl Architects:{' '}
                            <a
                                href="https://gehlpeople.com/announcement/public-space-public-life-qa-with-louise-vogel-kielgast"
                                target="_blank"
                            >
                                https://gehlpeople.com/announcement/public-space-public-life-qa-with-louise-vogel-kielgast
                            </a>
                        </Typography>
                    </li>
                </ul>

                <Typography variant="h6" gutterBottom>
                    Contact
                </Typography>
                <Typography variant="body1" paragraph>
                    We prefer to communicate about CommonSpace on our{' '}
                    <a href="https://github.com/sidewalklabs/CommonSpace" target="_blank">
                        GitHub page
                    </a>
                    . However, you can also reach the Sidewalk Labs team behind CommonSpace by
                    emailing us at{' '}
                    <a href="mailto:commonspace@sidewalklabs.com">CommonSpace@sidewalklabs.com</a>.
                </Typography>
            </div>
        </>
    );
});

// @ts-ignore
export default withStyles(styles)(AboutView);
