const MILLIS_IN_A_DAY = 24 * 60 * 60 * 1000;

const create = ({ start, end, zoom, viewportWidth = 0, minWidth = 0 }) => {
    const duration = end - start;
    const days = duration / MILLIS_IN_A_DAY;
    const daysZoomWidth = days * zoom;

    let timelineWidth;

    // timelineWidth = daysZoomWidth;
    if (daysZoomWidth > viewportWidth) {
        timelineWidth = daysZoomWidth;
    } else {
        timelineWidth = viewportWidth;
    }

    if (timelineWidth < minWidth) {
        timelineWidth = minWidth;
    }


    const timelineWidthStyle = `${timelineWidth / 16}rem`;

    const toX = from => {
        const value = (from - start) / duration;
        return Math.round(value * timelineWidth);
    }

    const toStyleLeft = from => ({
        left: `${toX(from) / 16}rem`,
    })

    const toStyleLeftAndWidth = (from, to, offset = 0, dayOffset = 0) => {
        const left = toX(from) - offset;
        return {
            left: `${(left + dayOffset) / 16}rem`,
            width: (toX(to) - offset) - left === 0 ? `${dayOffset / 16}rem` : `${(((toX(to) - offset) - left) + dayOffset) / 16}rem`,
        }
    }

    const fromX = x => new Date(start.getTime() + (x / timelineWidth) * duration);

    return {
        timelineWidth,
        timelineWidthStyle,
        start,
        end,
        zoom,
        toX,
        toStyleLeft,
        toStyleLeftAndWidth,
        fromX,
    }
}

export default create;
