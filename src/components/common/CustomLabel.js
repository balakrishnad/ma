import React, { useState, useRef, useEffect } from 'react';
import { Overlay, Popover } from 'react-bootstrap';
import useOnClickOutside from '../../components/common/OutsideHandler';
import './CustomLabel.css';
import { serviceUrlHost } from '../../utils/apiUrls';

export default ({ name, value, maxwidth, isLink, isServiceLink, linkUrl, tooltipEnabled, tooltipInline, valueAsHTML = null, maxheight , wrap = false}) => {

    const isLabelValueaLink = (isLink || isServiceLink || false);
    const isTooltipEnabled = (tooltipEnabled || false);
    const isTooltipInline = (tooltipInline || false);
    const [displayToolTip, setDisplayToolTip] = useState(false);
    const [expandTooltip, setExpandTooltip] = useState(true);
    const [showTooltip, setShowTooltip] = useState(false);
    const [target, setTarget] = useState(null);
    const ref = useRef(null);
    const containerRef = useRef(null);
    const popoverRef = useRef(null);

    const onLinkClick = () => {
        if (isServiceLink) {
            window.open(serviceUrlHost + linkUrl);
        } else if (isLink) {
            if (!linkUrl.match(/^https?:\/\//i)) {
                linkUrl = 'https://' + linkUrl;
            }

            window.open(linkUrl, '_blank');
        }
    }

    const isEllipsisActive = (element) => {
        let isEllipsis = false;
        // if it has more than 2 lines or if the second p tag has longer text
        if (valueAsHTML) {
            isEllipsis = element.childElementCount > 2 || (element.children.length > 1 && (element.children[0].offsetWidth < element.children[0].scrollWidth || element.children[1].offsetWidth < element.children[1].scrollWidth));
        } else {
            isEllipsis = element.offsetWidth < element.scrollWidth;
        }
        return isEllipsis
    }

    useOnClickOutside(popoverRef, () => {
        setShowTooltip(false);
        setExpandTooltip(true);
    });

    useEffect(() => {
        if (isTooltipEnabled) {
            if (isEllipsisActive(containerRef.current)) {
                setDisplayToolTip(true);
            } else {
                setDisplayToolTip(false);
            }
        }
    });

    return (
        <div className="custom-label-wrapper">
            <div className="custom-label-name">{name}</div>
            <div style={{ maxWidth: maxwidth || 200, height: maxheight || '' }}>
                <div ref={containerRef} style={{whiteSpace: wrap ? 'normal' : 'nowrap'}} className={isLabelValueaLink ? "custom-label-link-value custom-label-value-ellipsis" : "custom-label-value custom-label-value-ellipsis " + (maxheight ? 'heightInherit' : '')}
                    title={typeof value === 'string' ? value : null}
                    onClick={onLinkClick}>
                    {valueAsHTML === null ? value : valueAsHTML}
                </div>
                {displayToolTip &&
                    <div className='custom-label-tooltip-container'>
                        <div ref={popoverRef} className='custom-label-tooltip-icon' onClick={(event) => {
                            setShowTooltip(!showTooltip);
                            setExpandTooltip(!expandTooltip);
                            setTarget(event.target);
                        }}>
                            <span className={expandTooltip ? 'custom-label-arrow-icon down' : 'custom-label-arrow-icon up'}></span>
                        </div>
                        <div>
                            <Overlay
                                show={showTooltip}
                                target={target}
                                placement={valueAsHTML ? 'top' : 'bottom'}
                                container={ref.current}
                                containerPadding={20}
                                onHide={() => { }}
                            >
                                <Popover id="custom-label-popover-contained" className={valueAsHTML ? 'popoverWidth' : ''}>
                                    <Popover.Content>
                                        <span>{
                                            valueAsHTML ? <p>{valueAsHTML}</p> :
                                                !isTooltipInline ? value.split(',').map((item, i) => {
                                                    return <p key={i}>{item}</p>;
                                                }) : <p>{value}</p>}</span>
                                    </Popover.Content>
                                </Popover>
                            </Overlay>
                        </div>
                    </div>}
            </div>
        </div>
    );
}
