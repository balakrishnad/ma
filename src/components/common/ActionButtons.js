import React from 'react';
import './ActionButtons.css';

export default (props) => {
    return (
        <div className='action-buttons-conatiner'>
            {props.deleteActionImg &&
                <span className="delete-action-icon" style={props.deleteActionImg.style}
                    onClick={() => { props.deleteActionImg.actionHandler(props.onlyCampaign ? props.dataToDisplay : props.data) }}>
                    <img className="action-icon" src={props.deleteActionImg.icon}></img>
                </span>}
            {props.leftActionimg &&
                <span className="left-action-icon" style={props.leftActionimg.style}
                    onClick={() => { props.leftActionimg.actionHandler(props.onlyCampaign ? props.dataToDisplay : props.data) }}>
                    <img className="action-icon" src={props.leftActionimg.icon}></img>
                </span>}
            {props.rightActionImg &&
                <span className="right-action-icon" style={props.rightActionImg.style}
                    onClick={() => { props.rightActionImg.actionHandler(props.onlyCampaign ? props.dataToDisplay : props.data) }}>
                    <img className="action-icon" src={props.rightActionImg.icon}></img>
                </span>}
        </div>
    );
}