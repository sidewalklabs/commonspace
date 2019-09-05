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

export interface TermsViewProps {
    webview?: boolean;
}

const TermsView = observer((props: TermsViewProps & WithStyles) => {
    const { classes, webview } = props;
    return (
        <>
            {!webview && <AppBar />}
            <div className={classes.content}>
                <Typography variant="h4" gutterBottom>
                    Terms of Use for CommonSpace
                </Typography>
                <Typography variant="h6" paragraph>
                    Last Updated: March 1, 2019
                </Typography>

                <Typography variant="h5" gutterBottom>
                    Your Acceptance of these Terms of Use
                </Typography>
                <Typography variant="body2" paragraph>
                    Please read these terms of use carefully before using the Services (as defined
                    below) as they represent a binding agreement between each user of our Services
                    (“
                    <b>you</b>
                    ”, “<b>your</b>
                    ”) and Sidewalk Labs Employees, LLC (referred to as “<b>Sidewalk</b>
                    ”, “<b>we</b>
                    ”, “<b>us</b>
                    ”, or “<b>our</b>
                    ”).
                </Typography>
                <Typography variant="subtitle2" paragraph>
                    You agree to our Terms of Use by installing, accessing, or using our CommonSpace
                    application software (the “App”) and/or portal software (the “Portal”), as
                    applicable, and the features thereof, including without limitation, data storage
                    services provided in connection with your use of the App/Portal (together, the
                    “Services”). If you do not agree to these terms of use, then you must not access
                    or use our Services. Your continued use of the Services shall constitute your
                    agreement to these terms of use (the “Terms of Use”).
                </Typography>
                <Typography variant="body2" paragraph>
                    You agree that these Terms of Use, and any related information, communications
                    and agreements between you and us, may be made available or occur
                    electronically.
                </Typography>
                <Typography variant="body2" paragraph>
                    These Terms of Use were last updated on the “Updated” date indicated above. We
                    reserve the right, at our sole discretion, to modify these Terms of Use at any
                    time. Such modifications shall become effective immediately upon the posting to
                    our Services. You must review these Terms of Use on a regular basis to keep
                    yourself apprised of any changes.
                </Typography>

                <Typography variant="h5" gutterBottom>
                    Use of Our Services
                </Typography>
                <Typography variant="body2" paragraph>
                    The Services are intended to be used by (1) study administrators (“
                    <b>Study Administrators</b>
                    ”) who (a) are provided with an administrator’s login by Sidewalk; and (b)
                    utilize the Portal and App to design, organize, conduct and administer public
                    life surveys (the “<b>Permitted Use</b>
                    ”); and (2) surveyors who (x) download and access the App at the invitation of
                    and on behalf of a Study Administrator; and (y) are granted access to a public
                    life survey through the App by a Study Administrator in order to conduct such
                    public life survey on behalf of the Study Administrator (“
                    <b>Surveyors</b>
                    ”).
                </Typography>
                <Typography variant="body2" paragraph>
                    If you are a Study Administrator, Sidewalk grants you (as a permitted user) a
                    limited, revocable, non-exclusive, non-transferrable, non-sublicensable license
                    to access and use our Services, which for greater certainty includes the App,
                    the Portal and all of the features thereof, in accordance with the Permitted Use
                    and in compliance with applicable law.
                </Typography>
                <Typography variant="body2" paragraph>
                    If you are a Surveyor, Sidewalk grants you (as a permitted user) a limited,
                    revocable, non-exclusive, non-transferrable, non-sublicensable license to access
                    and use our Services, which for greater certainty includes only the App and all
                    of the features thereof, in connection with conducting public life surveys at
                    the invitation of and on behalf of a Study Administrator and in compliance with
                    applicable law.
                </Typography>
                <Typography variant="body2" paragraph>
                    If you are neither a Study Administrator nor a Surveyor, you may download,
                    access and use our Services (as a permitted user), which for greater certainty
                    includes only the demo features of the App, for your personal and non-commercial
                    use in accordance with applicable law. This license to access and use the demo
                    features of the App does not include any data storage services and all data
                    input into the demo features of the App will be immediately deleted after each
                    use of the demo features of the App.
                </Typography>
                <Typography variant="body2" paragraph>
                    In addition, Sidewalk has made the source code for the App and the Portal (the “
                    <b>Source Code</b>
                    ”) available at &nbsp;
                    <a href="https://github.com/sidewalklabs/commonspace" target="_blank">
                        https://github.com/sidewalklabs/commonspace
                    </a>{' '}
                    &nbsp; for download and use pursuant to the Apache License, Version 2.0 (the “
                    <b>Open Source License</b>
                    ”). You may not use the Source Code except in compliance with the Open Source
                    License. You may obtain a copy of the Open Source License at
                    <a href="http://www.apache.org/licenses/LICENSE-2.0" target="_blank">
                        http://www.apache.org/licenses/LICENSE-2.0
                    </a>
                    .Unless required by applicable law or agreed to in writing, the Source Code
                    distributed under the Open Source License is distributed on an “AS IS” BASIS,
                    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
                    Open Source License for the specific language governing permissions and
                    limitations under the Open Source License.
                </Typography>
                <Typography variant="body2" paragraph>
                    Use of our Services beyond the scope of authorized access granted to you by
                    these Terms of Use immediately terminates that license.
                </Typography>
                <Typography variant="body2" paragraph>
                    All rights not expressly granted by these Terms of Use are reserved to us, or,
                    if applicable, our licensors.
                </Typography>

                <Typography variant="h5" gutterBottom>
                    Trademark and Copyright Information
                </Typography>
                <Typography variant="body2" paragraph>
                    Our Services contain content including, but not limited to, all text, audio,
                    images and other materials or elements (collectively the “<b>Content</b>
                    ”). Certain Content is produced utilizing the Public Life Data Protocols
                    established by the Gehl Institute and its partners (available at:
                    <a
                        href="https://gehlinstitute.org/tool/public-life-data-protocol/"
                        target="_blank"
                    >
                        https://gehlinstitute.org/tool/public-life-data-protocol/
                    </a>
                    ) (the “<b>Protocol</b>
                    ”). With the exception of the Protocol, and subject to the provision of the
                    Source Code pursuant to the Open Source License, the Content displayed on or
                    through our Services is protected by copyright, pursuant to copyrights laws, and
                    international conventions. Specifically excluding the Protocol, and subject to
                    the provision of the Source Code pursuant to the Open Source License, any
                    reproduction, modification, creation of derivative works from or redistribution
                    of our Services, and/or copying or reproducing any of our Services or any
                    portion thereof to any other server or location for further reproduction or
                    redistribution is strictly prohibited without the express written consent of
                    Sidewalk.
                </Typography>
                <Typography variant="body2" paragraph>
                    Certain names, graphics, logos, icons, designs, words, titles and phrases in our
                    Services constitute trademarks, trade names, trade dress and brand names of
                    Sidewalk (collectively the “<b>Marks</b>
                    ”) and are protected in the United States of America and internationally. Any
                    reproduction, modification, creation of derivative works or any other use of the
                    Marks contrary to these Terms of Use, in whole or in part, is strictly
                    prohibited without the express written consent of Sidewalk
                </Typography>
                <Typography variant="body2" paragraph>
                    You further agree to abide by any and all copyright and trademark notices
                    displayed in our Services or required pursuant to the Open Source License.
                </Typography>
                <Typography variant="body2" paragraph>
                    Subject to the use of the Source Code pursuant to the Open Source License, you
                    may not decompile or disassemble, reverse engineer or otherwise attempt to
                    discover any source code contained in our Services.
                </Typography>

                <Typography variant="h5" gutterBottom>
                    Data Rights
                </Typography>
                <Typography variant="body2" paragraph>
                    Sidewalk disclaims ownership of the data and content prepared, generated,
                    developed or otherwise obtained by or through your use of the Services (the “
                    <b>Data</b>
                    ”). Although Sidewalk does not claim ownership of content and data that its
                    users input and generate through the Services, by providing feedback to Sidewalk
                    or posting content to any area of our Services that is accessible to all users,
                    you automatically grant, and you represent and warrant that you have the right
                    to grant, to Sidewalk an irrevocable, perpetual, non-exclusive, fully paid,
                    worldwide license to use the Data for the limited purpose of delivering and
                    improving the Services.
                </Typography>
                <Typography variant="body2" paragraph>
                    Subject to our right to terminate the Services in accordance with these Terms of
                    Use, each Study Administrator retains sole discretion in determining which Data
                    is published, the duration of its publication, its location, how and when it
                    appears on the Services, its design and any other matters pertaining to the
                    publication of the Data within the Services, including without limitation the
                    deletion of such Data. Sidewalk specifically disclaims any warranty as to the
                    validity, reliability, accuracy or legality of any published Data.
                </Typography>
                <Typography variant="body2" paragraph>
                    You agree to use the Services in accordance with all applicable laws in respect
                    of the collection, publication and processing of Data.
                </Typography>
                <Typography variant="body2" paragraph>
                    Notwithstanding anything to the contrary in these Terms of Use, you agree that
                    we may collect and use de-personalized technical and related information,
                    including but not limited to technical information about your device, system and
                    application software, and peripherals, that is gathered periodically to
                    facilitate the provision of software updates, product support and other services
                    related to the Services. You acknowledge and agree that we may use this
                    information, as long as it is in a form that does not personally identify you,
                    to improve our products and provide services and technologies to you.
                </Typography>

                <Typography variant="h5" gutterBottom>
                    Your Privacy
                </Typography>
                <Typography variant="body2" paragraph>
                    We respect your right to privacy. All information that we may collect via the
                    Services is subject to our privacy statement, which is accessible at and as
                    amended from time to time: &nbsp;
                    <a href="https://commonspace.sidewalklabs.com/privacy">
                        https://commonspace.sidewalklabs.com/privacy
                    </a>
                </Typography>

                <Typography variant="h5" gutterBottom>
                    Your Conduct
                </Typography>
                <Typography variant="body2" paragraph>
                    To the extent that our Services permit you to post, email, or otherwise make
                    available Data or other content, you agree not to post, email or otherwise make
                    available Data or other content that:
                </Typography>

                <ol type="a">
                    <li>
                        <Typography variant="body2" paragraph>
                            is unlawful;
                        </Typography>
                    </li>
                    <li>
                        <Typography variant="body2" paragraph>
                            includes personal or identifying information about another person
                            without that person’s explicit consent;
                        </Typography>
                    </li>
                    <li>
                        <Typography variant="body2" paragraph>
                            impersonates any person or entity, including, but not limited to, a
                            Sidewalk employee, or falsely states or otherwise misrepresents an
                            affiliation with a person or entity;
                        </Typography>
                    </li>
                    <li>
                        <Typography variant="body2" paragraph>
                            infringes any patent, trademark, trade secret, copyright or other
                            proprietary rights of any person, or content that you do not have a
                            right to make available under any law or under contractual or fiduciary
                            relationships;
                        </Typography>
                    </li>
                    <li>
                        <Typography variant="body2" paragraph>
                            is harmful, threatening, abusive, harassing, degrading, defamatory,
                            and/or pornographic;
                        </Typography>
                    </li>
                    <li>
                        <Typography variant="body2" paragraph>
                            constitutes or contains any form of advertising or solicitation, or that
                            includes links to commercial services, applications or websites;
                        </Typography>
                    </li>
                    <li>
                        <Typography variant="body2" paragraph>
                            contains software viruses or any other computer code, files or programs
                            designed to interrupt, destroy or limit the functionality of any
                            computer software or hardware or telecommunications equipment;
                        </Typography>
                    </li>
                    <li>
                        <Typography variant="body2" paragraph>
                            disrupts the normal use of our Services with an excessive amount of
                            content, or that otherwise negatively affects other users’ ability to
                            use our Services; or
                        </Typography>
                    </li>
                    <li>
                        <Typography variant="body2" paragraph>
                            employs misleading email addresses, or forged headers or otherwise
                            manipulated identifiers in order to disguise the origin of content
                            transmitted through our Services.
                        </Typography>
                    </li>
                </ol>
                <Typography variant="body2" paragraph>
                    You will be solely responsible and liable for any and all loss, damage, and
                    additional costs that you, Sidewalk or any other person may incur as a result of
                    your submission of any information on or through the Services.
                </Typography>
                <Typography variant="body2" paragraph>
                    Sidewalk reserves the right to refuse to post or to remove any content, in whole
                    or in part, that, in its sole discretion, is unacceptable, undesirable, or in
                    violation of these Terms of Use.
                </Typography>

                <Typography variant="h5" gutterBottom>
                    Notification and Infringement Claims
                </Typography>
                <Typography variant="body2" paragraph>
                    If you believe credit for any Content posted in connection Sidewalk’s Services
                    should be attributed to you, please notify our designated agent by written
                    communication using the following email: &nbsp;
                    <a href="mailto:commonspace@sidewalklabs.com" target="_blank">
                        commonspace@sidewalklabs.com
                    </a>
                    .
                </Typography>
                <Typography variant="body2" paragraph>
                    Sidewalk will investigate notices of alleged infringement and takes appropriate
                    actions under applicable law.
                </Typography>
                <Typography variant="body2" paragraph>
                    Your notice must include: (a) a physical or electronic signature of a person
                    authorized to act on behalf of the copyright owner of an exclusive right that is
                    alleged to be infringed; (b) a description of the copyrighted work claimed to
                    have been infringed; (c) a description of the Content that is claimed to be
                    infringing or to be the subject of infringing activity and that is to be removed
                    or access to which is to be disabled, and information reasonably sufficient to
                    permit us to locate the material; (d) information reasonably sufficient to
                    permit us to contact the copyright owner, such as an address, telephone number,
                    and, if available, an electronic mail address; (e) a statement that, as the
                    copyright owner, you have a good faith belief that use of the Content in the
                    Services in the manner complained of is not authorized by you, your agent, or
                    applicable law; and (f) a statement that the information in the notification is
                    accurate, and that, to the extent applicable under penalty of perjury, the
                    complaining party is authorized to act on behalf of the copyright owner.
                </Typography>
                <Typography variant="body2" paragraph>
                    If Sidewalk is notified that any Content infringes a copyright, Sidewalk shall
                    conduct a reasonable investigation of the conduct and may remove such Content
                    from the Services or take other steps that Sidewalk deems appropriate or that
                    may be mutually agreed upon between Sidewalk and the copyright owner.
                </Typography>
                <Typography variant="body2" paragraph>
                    Claimants who make misrepresentations concerning copyright infringement may be
                    liable for damages incurred as a result of the removal or blocking of the
                    material, court costs, and lawyer’s fees.
                </Typography>

                <Typography variant="h5" gutterBottom>
                    Account Registration
                </Typography>
                <Typography variant="body2" paragraph>
                    From time to time certain sections of our Services may only be available to you
                    upon registration for an account. By registering, you represent and warrant to
                    Sidewalk that: (a) all information provided by you to Sidewalk during the
                    registration process is truthful, accurate and complete; and (b) you will comply
                    with these Terms of Use.
                </Typography>
                <Typography variant="body2" paragraph>
                    As a registered user, you agree to maintain and promptly update your
                    registration information as necessary to keep it accurate, current and complete.
                </Typography>
                <Typography variant="body2" paragraph>
                    You will be responsible for any loss, damage, or additional costs that we and/or
                    our service providers or others may incur as a result of your submission of any
                    false, incorrect or incomplete information or your failure to update your
                    registration or other information that you submit via our Services.
                </Typography>
                <Typography variant="body2" paragraph>
                    You acknowledge that you are solely responsible for maintaining the
                    confidentiality of your account password, and that you (and not us) will be
                    responsible for any loss resulting from any unauthorized use of your account or
                    access to your content. You agree to immediately notify us of any unauthorized
                    use of your account.
                </Typography>

                <Typography variant="h5" gutterBottom>
                    Disclaimer Regarding Third Party Content
                </Typography>
                <Typography variant="body2" paragraph>
                    The Services may offer access to third party websites, applications and content
                    available over the Internet. Sidewalk generally exercises no control over such
                    third party websites, application and content or the collection or use of your
                    data shared with such websites or application. You agree that it is your
                    responsibility to review and evaluate any such content, and that any and all
                    risk associated with the use of, or reliance on, such content rests with you.
                    You are responsible for viewing, accepting and abiding by the terms of use and
                    privacy policies posted at these third party websites or application. Inclusion
                    of a link to third party content does not imply endorsement by Sidewalk of such
                    content. You further agree that Sidewalk shall not be liable, directly or
                    indirectly, in any way for any loss or damage of any kind incurred as a result
                    of, or in connection with your use of, or reliance on, any third party websites,
                    applications or content.
                </Typography>

                <Typography variant="h5" gutterBottom>
                    Disclaimer of Warranties and Liability
                </Typography>
                <Typography variant="body2" paragraph>
                    THE SERVICES (INCLUDING ITS CONTENT) ARE PROVIDED ON AN “AS IS” AND “AS
                    AVAILABLE” BASIS WITHOUT ANY WARRANTY OR CONDITION OF ANY KIND, EITHER EXPRESS
                    OR IMPLIED, INCLUDING BUT NOT LIMITED TO, ACCURACY, QUALITY, COMPLETENESS,
                    COMPREHENSIVENESS, SUITABILITY, SYSTEM AVAILABILITY OR COMPATIBILITY OF THE
                    SERVICES, OR THE IMPLIED WARRANTIES OR CONDITIONS OF MERCHANTABILITY, FITNESS
                    FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. NO SIDEWALK EMPLOYEE OR AGENT IS
                    AUTHORIZED TO MAKE ANY STATEMENT THAT ADDS TO OR AMENDS THE WARRANTIES OR
                    LIMITATION OF LIABILITY CONTAINED IN THESE TERMS OF USE. IN ADDITION, YOU
                    ACKNOWLEDGE THAT THE SERVICES MAY BE SUBJECT TO LIMITATIONS, DELAYS, LATENCY
                    ISSUES AND OTHER PROBLEMS INHERENT IN THE USE OF THE INTERNET AND ELECTRONIC
                    COMMUNICATIONS, AND THAT SIDEWALK IS NOT RESPONSIBLE FOR ANY DELAYS, DELIVERY
                    FAILURES, OR OTHER DAMAGES RESULTING FROM SUCH PROBLEMS.
                </Typography>
                <Typography variant="body2" paragraph>
                    SIDEWALK SHALL NOT BE RESPONSIBLE FOR ANY DETRIMENTAL RELIANCE YOU MAY PLACE ON
                    THE SERVICES OR THEIR CONTENT (INCLUDING, FOR GREATER CERTAINTY, THE PROTOCOL).
                    THE INFORMATION PROVIDED THROUGH THE SERVICES AND THEIR CONTENTS IS FOR
                    INFORMATION PURPOSES ONLY AND IS NOT INTENDED TO PROVIDE SPECIFIC ADVICE OF ANY
                    KIND. IT SHOULD NOT BE RELIED UPON IN THAT REGARD, AND ANY RELIANCE ON YOUR PART
                    IN THAT RESPECT IS SOLELY YOUR OWN RISK
                </Typography>
                <Typography variant="body2" paragraph>
                    SIDEWALK AND ITS AFFILIATES, AND THEIR RESPECTIVE DIRECTORS, OFFICERS,
                    EMPLOYEES, SUBSIDIARIES, AFFILIATES, SUCCESSORS, ASSIGNS, AGENTS AND SERVICE
                    PROVIDERS SHALL NOT BE LIABLE FOR ANY (I) DIRECT DAMAGES IN EXCESS OF CDN$100;
                    OR (II) SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, INCLUDING
                    WITHOUT LIMITATION, LOST REVENUES OR LOST PROFITS, WHICH MAY RESULT FROM THE USE
                    OF THE CONTENT OR THE SERVICES. YOU FURTHER AGREE THAT YOU MAY NOT INSTITUTE ANY
                    ACTION IN ANY FORM ARISING OUT OF THIS AGREEMENT MORE THAN ONE (1) YEAR AFTER
                    THE CAUSE OF ACTION HAS ARISEN. YOU ACKNOWLEDGE THAT THIS LIMITATION OF
                    LIABILITY IS A CONTROLLING FACTOR FOR SIDEWALK MAKING THE SERVICES AVAILABLE TO
                    YOU TO USE IN ACCORDANCE WITH THE TERMS AND CONDITIONS SET OUT IN THESE TERMS OF
                    USE.
                </Typography>
                <Typography variant="body2" paragraph>
                    SIDEWALK MAY MAKE CHANGES TO THE SERVICES, OR TO THE PRODUCTS DESCRIBED THEREIN,
                    AT ANY TIME WITHOUT NOTICE. SIDEWALK MAKES NO COMMITMENT TO MAINTAIN THE
                    SERVICES OR TO UPDATE THE INFORMATION CONTAINED HEREIN.
                </Typography>

                <Typography variant="h5" gutterBottom>
                    Indemnity
                </Typography>
                <Typography variant="body2" paragraph>
                    You agree to indemnify and hold Sidewalk and its affiliates, and their
                    respective directors, officers, employees, subsidiaries, affiliates, successors,
                    assigns, agents, service providers harmless from any claim or demand, including
                    reasonable legal fees and court costs, made by any third party due to or arising
                    out of Data or content you submit, post or make available through the Services,
                    your use of the Services, your violation of these Terms of Use, your breach of
                    any of the representations and warranties herein, or your violation of any
                    rights of another person.
                </Typography>

                <Typography variant="h5" gutterBottom>
                    Unsolicited Submissions
                </Typography>
                <Typography variant="body2">
                    If you submit ideas, drawings, suggestions, comments, feedback or similar
                    information to Sidewalk, whether through the Services or otherwise, you do so
                    with no expectation of confidentiality and with no expectation that you have any
                    proprietary interest in the content of your submissions.
                </Typography>
                <Typography variant="body2" paragraph>
                    You agree that the content of your submissions will immediately become the
                    property of Sidewalk. You also recognize that your submissions may be used or
                    developed by or on behalf of Sidewalk or its affiliates without any obligation
                    to you.
                </Typography>

                <Typography variant="h5" gutterBottom>
                    Termination
                </Typography>
                <Typography variant="body2" paragraph>
                    We reserve the right to terminate your access to and use of the Services at any
                    time for any reason whatsoever in our sole discretion upon providing you with 30
                    days prior written notice; provided, however, that we may terminate your access
                    to and use of the Services immediately if you are in breach of these Terms of
                    Use or applicable law. Upon termination of the Services, all Data stored by us
                    in connection with your use of the Services will be deleted.
                </Typography>

                <Typography variant="h5" gutterBottom>
                    General Matters
                </Typography>
                <Typography variant="body2">
                    These Terms of Use constitute the entire agreement between you and Sidewalk
                    regarding your use of the Services, superseding any prior agreements between you
                    and Sidewalk. These Terms of Use and the relationship between you and Sidewalk
                    shall be governed, construed and interpreted in accordance with the laws of the
                    state of New York (and the federal laws of the United States of America
                    applicable therein) without regard to its conflict of law provisions.
                </Typography>
                <Typography variant="body2" paragraph>
                    You and Sidewalk agree to submit to the non-exclusive jurisdiction of the courts
                    located in New York, New York. The failure of Sidewalk to exercise or enforce
                    any right or provision of these Terms of Use shall not constitute a waiver of
                    such right or provision. If any provision of these Terms of Use is found by a
                    court of competent jurisdiction to be invalid, the parties nevertheless agree
                    that the court should endeavour to give effect to the parties’ intentions as
                    reflected in the provision, and the other provisions of these Terms of Use
                    remain in full force and effect.
                </Typography>

                <Typography variant="h5" gutterBottom>
                    Copyright
                </Typography>
                <Typography variant="body2" paragraph>
                    Copyright © 2019, Sidewalk Labs Employees LLC. All rights reserved.
                </Typography>

                <Typography variant="h5" gutterBottom>
                    Contact Us
                </Typography>
                <Typography variant="body2" paragraph>
                    If you have any questions or comments about these Terms of Use, please contact
                    us via email at &nbsp;
                    <a href="mailto:commonspace@sidewalklabs.com" target="_blank">
                        commonspace@sidewalklabs.com
                    </a>
                    .
                </Typography>
            </div>
        </>
    );
});

// @ts-ignore
export default withStyles(styles)(TermsView);
