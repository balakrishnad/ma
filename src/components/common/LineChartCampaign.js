import React from 'react';
import './LineChart.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './LineChartCampaign.css';

export default ({ inputData, title, totalAssets }) => {
    
    const bars = inputData && inputData.length && inputData.map(function (item, i) {
        if (item.value > 0) {
            const width = (item.value / totalAssets) * 100;
            return (
                <div className="bar" style={{ 'backgroundColor': item.color, 'width': width + '%' }} key={i}></div>
            )
        }
    });
    const values = inputData && inputData.length && inputData.map(function (item, i) {
        if (item.value > 0) {
            const width = (item.value / totalAssets) * 100;
            return (
                    <div className="value" style={{ 'width': width + '%', textAlign: item.align }} key={i}>
                        <span className="line-chart-styling">{item.value === 0 ? '' : item.value} </span>
                    </div>
                )
        }
    });

    const valuesMobile = inputData && inputData.length && inputData.map(function (item, i) {
        if (item.value > 0) {
            const width = (item.value / totalAssets) * 100;
            return (
                <div className="legendsWrapper legendsWrapperMobile">
                        <div style={{ 'backgroundColor': item.color }} className="colorBox"></div>
                        <span className="line-chart-styling">{item.value}</span>
                        <span className="styling-campaign"> &nbsp;{item.name}</span>
                    </div>
                
            )
        }
    });

    return (
        <div className="multicolor-bar">
            <div className="lineChartCampaign">
                <div className="totalNumberTitle">{title}</div>
                <div className="digit_Asset d-block d-sm-none">{totalAssets}</div>
            </div>
            <div className="bars d-none d-sm-block">
                {bars == '' ? '' : bars}
            </div>
            <div className="values d-none d-sm-block">
                {values == '' ? '' : values}
            </div>
            <div className="mobileView d-block d-md-none">
                {valuesMobile == '' ? '' :valuesMobile}
            </div>
        </div>
    );
}

