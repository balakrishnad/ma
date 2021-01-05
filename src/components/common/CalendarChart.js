import React from 'react';
import './CalendarChart.css';


export default ({ input }) => {

    const CalendarChart = input.map(function (item, i) {
        return (
            <div key={i} className="CalenderChartWrapper">
                <div className="label">
                    {item.label}  
                </div>
                <div className="digit" style={{ color: item.color}}>
                    {item.value <= 9 ? '0' + item.value : item.value}
                </div>
            </div>
        )
    })

    return (
            <div>
                {CalendarChart}
            </div>
    );
}

