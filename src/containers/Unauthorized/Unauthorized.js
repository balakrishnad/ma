import React, { useEffect, useState, Fragment } from 'react';
import Axios from 'axios';
import { serviceUrlHost } from '../../utils/apiUrls';

export default () => {
    const [admins, setAdmins] = useState(null);

    useEffect(() => {
        Axios({
            url: serviceUrlHost + '/api/EmailService/GetAdmins',
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': true
            },
        }).then(res => {
            setAdmins(res.data);
        }).catch(error => {
            console.log('fetching Admins', error);
        });
    }, []);

    return (
        <div style={{ marginTop: '5rem', padding: '2rem' }}>
            <h2>You do not have the required permission to view this page. </h2>
            <br />
            <div>
                Please reach out to MEDIA ANNEX ADMINISTRATORS (
                {
                    admins && admins.map(admin => {
                        const displayName = admin.UserDisplayName ? admin.UserDisplayName.replace('- Contractor', '') : admin.UserEmailID;

                        return <Fragment><a href={"mailto:" + admin.UserEmailID}>{displayName}</a>{'; '}</Fragment>
                    })
                }
                ) in case of any access issues.
                <br />
                <br />
                If you need support in resolution of issues, please send an email to  <a href={"mailto:svcmediaanx@pepsico.com"}>svcmediaanx@pepsico.com</a>
            </div>
        </div>
    )
}
