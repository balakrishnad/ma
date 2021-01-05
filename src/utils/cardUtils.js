export const getFrequencyString = (frequecyArray) => {
    if (!frequecyArray) {
        return '';
    } else {
        const temp = frequecyArray.map((obj, i) => {
            return (obj.Number + ' per ' + obj.FrequencyDuration);
        })
        return temp.join(', ');
    }
};

export const getDateString = (date) => {
    if (!date) {
        return '';
    } else {
        const dateArray = date.split(';');
        const rtnArr = dateArray.map((item, i) => {
            const temp = item.split(':');
            if (temp.every((val, i, arr) => val === arr[0])) {
                return temp[0];
            } else {
                return temp[0] + ' to ' + temp[1];
            }
        })
        return rtnArr.join(', ');
    }
};

export const getColororBnwString = (color) => {
    if (!color) {
        return '';
    } else {
        let rtn = '';
        switch (color) {
            case 'color':
                rtn = 'Color'
                break;
            case 'bnw':
                rtn = 'Black and White'
                break;
            default:
                // TODO.. lets show what they send... 
                rtn = color;
                break;
        }
        return rtn;
    }
};

export const getPreferredBrands = (brands) => {
    if (!brands) {
        return '';
    } else {
        return brands.split(';').join(', ');
    }
}
