import React, { useState, useEffect } from 'react';
import './InventoriesStatus.css';

export default (props) => {
    const [containerColor, setContainerColor] = useState('');

    useEffect(() => {
        switch (props.status.toLowerCase()) {
            case 'available':
                setContainerColor('#008240');
                break;
            case 'hold':
                setContainerColor('#D8AF04');
                break;
            case 'locked':
                setContainerColor('#CE032A');
                break;
            case 'archived': 
                setContainerColor('#99005C');
                break;
            case 'rejected':
                setContainerColor('#DB7093');
                break;
            default:
                setContainerColor('');
                break;
        }
    }, [props.status]);

    return (
        <div className='status-container' style={{ backgroundColor: containerColor }}>
            <span className="status-text">{props.status}</span>
        </div>
    );
}