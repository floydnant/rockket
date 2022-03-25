export const formatDateRelative = (time: Date) => {
    const timestamp = new Date(time).valueOf();
    if (!time || timestamp.toString() == 'NaN') return 'no Data';

    return getRelativeTime(timestamp);
};

export const formatDateAbsolute = (time: Date) =>
    new Date(time).toLocaleString('en-EN', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: 'numeric',
    });

// export const timeDifference = (current: number, previous: number) => {
//     const msPerMinute = 60 * 1000;
//     const msPerHour = msPerMinute * 60;
//     const msPerDay = msPerHour * 24;
//     const msPerMonth = msPerDay * 30;
//     const msPerYear = msPerDay * 365;

//     const elapsed = current - previous;

//     if (elapsed < msPerMinute) return Math.round(elapsed / 1000) + ' seconds ago';
//     else if (elapsed < msPerHour) return Math.round(elapsed / msPerMinute) + ' minutes ago';
//     else if (elapsed < msPerDay) return Math.round(elapsed / msPerHour) + ' hours ago';
//     else if (elapsed < msPerMonth) return /* 'approximately ' + */ Math.round(elapsed / msPerDay) + ' days ago';
//     else if (elapsed < msPerYear) return /* 'approximately ' + */ Math.round(elapsed / msPerMonth) + ' months ago';
//     else return /* 'approximately ' + */ Math.round(elapsed / msPerYear) + ' years ago';
// };

const rtf = new (Intl as any).RelativeTimeFormat('en', { numeric: 'auto' });
/** in Milliseconds */
const timeUnits = {
    year: 24 * 60 * 60 * 1000 * 365,
    month: (24 * 60 * 60 * 1000 * 365) / 12,
    week: 24 * 60 * 60 * 1000 * 7,
    day: 24 * 60 * 60 * 1000,
    hour: 60 * 60 * 1000,
    minute: 60 * 1000,
    second: 1000,
};

export const getRelativeTime = (d1: number, d2: number = Date.now()): string | void => {
    const elapsed = d1 - d2;
    for (let u in timeUnits)
        if (Math.abs(elapsed) > timeUnits[u] || u == 'second')
            return rtf.format(Math.round(elapsed / timeUnits[u]), u); // prettier-ignore
};
