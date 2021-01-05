import React from 'react';
import './Tooltip.css';

const Tooltip = (props) => {
    return(
        <div className="MA_Tooltip" >
            <p>
                {props.message}
            </p> 
            <div className="MA_ToolInnerBox" >
            </div>
        </div>
    )
}
export default Tooltip;