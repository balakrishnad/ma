import React, { useState } from "react";
import './Accordion.css';

const Panel = ({ label, content, activeTab, index, activateTab }) => {
    const [height, setHeight] = useState('auto');

    const isActive = activeTab === index;
    const innerStyle = {
        height: `${isActive ? height : '0'}px`
    }

    return (
        <div >
            <div onClick={activateTab} className="manager-title">
                <span >
                    {label}
                </span>
                <span className={'floatRight'}>
                    {isActive ? '-' : '+'}
                </span>
            </div>
            {isActive && <div style={{ ...innerStyle, margin: '0.5rem' }}>
                {content}
            </div>
            }
        </div >
    );
};

export default ({ panels }) => {
    const [activeTab, setActiveTab] = useState(0);

    const activateTab = (index) => {
        setActiveTab(activeTab === index ? -1 : index);
    };

    return (
        <div role='tablist' style={{
            border: '0.5px solid lightgrey',
        }}>
            {panels.map((panel, index) =>
                <Panel
                    key={index}
                    activeTab={activeTab}
                    index={index}
                    {...panel}
                    activateTab={() => activateTab(index)}
                />
            )}
        </div>
    );
};
