import React from 'react';
import CheckCircleSharpIcon from '@material-ui/icons/CheckCircleSharp';

import { Step1Icon, Step2Icon, Step3Icon } from './SVG';
import './CirclesCI.css';

const Step1Circle = ({ isActive, stepId, setStep, isValid }) => {
    let outerCirleWidth = '64px';
    let innerCirleWidth = '48px';

    if (isActive) {
        outerCirleWidth = '71px';
        innerCirleWidth = '56px';
    }

    const stepChange = () => {
        if (isValid) {
            setStep(1);
        }
    }

    return (
        <div className="circle-radius"
        style={{
            minWidth: outerCirleWidth,
            minHeight: outerCirleWidth,
            maxWidth: outerCirleWidth,
            maxHeight: outerCirleWidth,
            border: `1px solid ${stepId === 1 ? '#F0751D' : '#008240'}`,
          
        }} onClick={stepChange}>
            {stepId > 1 && <div className="circle-change">
                <CheckCircleSharpIcon className="tick-icon"/>
            </div>}
            <div className="circle-icon" 
            style={{
                width: innerCirleWidth,
                height: innerCirleWidth,
                background: `${stepId === 1 ? '#EE711B' : '#008240'} 0% 0% no-repeat padding-box`,
                
            }}>
                <div className="inner-icon">
              
                    <Step1Icon style={{ fill: 'white' }} />
                </div>
            </div>
        </div>
    );
}

const Step2Circle = ({ isActive, stepId, setStep, isValid }) => {
    let outerCirleWidth = '64px';
    let innerCirleWidth = '48px';

    if (isActive) {
        outerCirleWidth = '71px';
        innerCirleWidth = '56px';
    }

    const stepChange = () => {
        if (isValid) {
            setStep(2);
        }
    }

    return (
        <div className="circle-radius" 
        style={{
            minWidth: outerCirleWidth,
            minHeight: outerCirleWidth,
            maxWidth: outerCirleWidth,
            maxHeight: outerCirleWidth,
            border: `1px solid ${stepId === 1 ? '#D1D1D1' : (stepId === 2 ? '#EE711B' : '#008240')}`,
         
        }} onClick={stepChange}>
            {stepId > 2 && <div className="circle-change">
          <CheckCircleSharpIcon className="tick-icon"/>
            </div>}
            <div className="circle-icon"
            style={{
                width: innerCirleWidth,
                height: innerCirleWidth,
                background: `${stepId === 1 ? '#D7D7D7' : (stepId === 2 ? '#EE711B' : '#008240')} 0% 0% no-repeat padding-box`,
            }}>
                <div style={{ padding: `${isActive ? '0.9rem 0.7rem' : '0.7rem'}` }}>
                    <Step2Icon style={{ fill: `${stepId === 1 ? '#909090' : '#FFFFFF'}` }} />
                </div>
            </div>
        </div>
    );
}

const Step3Circle = ({ isActive, stepId, setStep, isValid }) => {
    let outerCirleWidth = '64px';
    let innerCirleWidth = '48px';

    if (isActive) {
        outerCirleWidth = '71px';
        innerCirleWidth = '56px';
    }

    const stepChange = () => {
        if (isValid) {
            setStep(3);
        }
    }

    return (
        <div className="circle-radius"
        style={{
            minWidth: outerCirleWidth,
            minHeight: outerCirleWidth,
            maxWidth: outerCirleWidth,
            maxHeight: outerCirleWidth,
            border: `1px solid ${stepId <= 2 ? '#D1D1D1' : (stepId === 3 ? '#EE711B' : '#008240')}`,
        }} onClick={stepChange}>
            {stepId > 3 && <div className="circle-change">
                <CheckCircleSharpIcon className="tick-icon" />
            </div>}
            <div className="circle-icon" 
            style={{
                width: innerCirleWidth,
                height: innerCirleWidth,
                background: `${stepId <= 2 ? '#D7D7D7' : (stepId === 3 ? '#EE711B' : '#008240')} 0% 0% no-repeat padding-box`,
            }}>
                <div style={{ padding: `${isActive ? '0.9rem 1.1rem' : '0.7rem 0.9rem'}` }}>
                    <Step3Icon style={{ fill: `${stepId < 3 ? '#909090' : '#FFFFFF'}` }} />
                </div>
            </div>
        </div>


    );
}

export { Step1Circle, Step2Circle, Step3Circle };