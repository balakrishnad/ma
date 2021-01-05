import React from 'react';
import './LineChart.css';

export default ({ inputData, title, isPercentage }) => {
    const bars = inputData && inputData.length && inputData.map(function (item, i) {
        if (item.value > 0) {
            return (
                <div className="bar" style={{ 'backgroundColor': item.color, 'width': item.value + '%' }} key={i}></div>
            )
        }
    });
    const values = inputData && inputData.length && inputData.map(function (item, i) {
        if (item.value > 0) {
            return (
                <div className="legendsWrapper">
                    <div style={{ 'backgroundColor': item.color }} className="colorBox"></div>
                    <span className="itemvalue-styling">{item.value}{isPercentage ? '%' : ''} </span>
                    <span className="itemname-styling">&nbsp;&nbsp;{item.name}</span>
                </div>
            )
        }
    });

    return (
        <div className="multicolor-bar">
            <div className="lineChartTitle lineChart-styling">{title}</div>
            <div className="bars">
                {bars == '' ? '' : bars}
            </div>
            <div className="values">
                {values == '' ? '' : values}
            </div>
        </div>
    );
}

