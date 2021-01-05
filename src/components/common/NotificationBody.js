import React from 'react';
const NotificationBody = (props) => { // to show the html response as it is in the pop up
    const htmlString = props.emailContent;
    return (
        <div dangerouslySetInnerHTML={{ __html: htmlString }} />
    );
}
export default NotificationBody;