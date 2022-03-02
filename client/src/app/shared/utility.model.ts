export const generateId = () => (Date.now() + Math.random()).toString().replace('.', '_');

export const formatDateRelative = (time: Date) => {
    // console.log(time);
    if (!time) return 'never (invalid Date)';

    // return timeDifference(new Date().valueOf(), new Date(time).valueOf());
    return getRelativeTime(new Date(time).valueOf(), new Date().valueOf());
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

export const getRelativeTime = (d1: number, d2: number = Date.now()) => {
    const elapsed = d1 - d2;
    for (var u in timeUnits)
        if (Math.abs(elapsed) > timeUnits[u] || u == 'second') return rtf.format(Math.round(elapsed / timeUnits[u]), u);
};

export const reverseString = (str: string) => str.split('').reverse().join('');

export const multiplyString = (text = '!', multiplier = 3) => {
    let result = '';
    for (let i = 0; i < multiplier; i++) result += text;
    return result;
};

const replacementChars = [
    {
        searchChar: 'E',
        replaceChar: '3',
    },
    {
        searchChar: 'A',
        replaceChar: '4',
    },
    {
        searchChar: 'O',
        replaceChar: '0',
    },
    {
        searchChar: 'S',
        replaceChar: '5',
    },
    {
        searchChar: 'I',
        replaceChar: '1',
    },
];
export const replaceCharsWithNumbers = (
    text: string,
    replacementArr: {
        searchChar: string;
        replaceChar: string;
    }[] = replacementChars
) =>
    text
        .split('')
        .map(char =>
            replacementArr.some(c => c.searchChar == char)
                ? replacementArr.find(c => c.searchChar == char).replaceChar
                : char
        )
        .join(''); // prettier-ignore

export const generatePassword = (blockCount: number = 4) => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = [];
    const blockTemplate = 'XXXX'.split('');
    for (let i = 0; i < blockCount; i++)
        password.push(blockTemplate.map(_x => chars[Math.round(Math.random() * (chars.length - 1))]).join(''));
    return password.join('-');
};

export const isTouchDevice = () =>
    'ontouchstart' in window || navigator.maxTouchPoints > 0 || (navigator as any).msMaxTouchPoints > 0;

export const validateAndFormatUrl = (url: string) => {
    url = (url || '').trim().toLocaleLowerCase();
    const isProtocolValid = /^https?:\/\//.test(url);
    const isDomainValid = /([^\s"/,;:]+\.)+[^\s".,;:]+$/g.test(url);

    if (!isProtocolValid && url != '') url = 'http://' + url;

    return {
        isProtocolValid,
        isDomainValid,
        resUrl: url,
    };
};

export const escapeHTML = (unsafe: string) =>
    unsafe == '' || unsafe == null
        ? ''
        : unsafe.replace(/[&<"']/g, match => {
              switch (match) {
                  case '&':
                      return '&amp;';
                  case '<':
                      return '&lt;';
                  case '"':
                      return '&quot;';
                  case "'":
                      return '&apos;';
                  default:
                      return match;
              }
          });

export const getCopyOf = <T extends object | any[]>(obj: T): T => JSON.parse(JSON.stringify(obj));

/**
 * ## download JSON object or array as file
 * @param {object | array} exportObj
 * @param {string} fileName -> **without the file extension**
 * @param {boolean} readable [defaults to false]
 */
export const downloadObjectAsJson = (exportObj: object, fileName: string, readable: boolean = false) => {
    const dataString =
        'data:text/json;charset=utf-8,' +
        encodeURIComponent(readable ? JSON.stringify(exportObj, null, 4) : JSON.stringify(exportObj));
    console.log('char length: ' + dataString.length);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.href = dataString;
    downloadAnchorNode.download = fileName + '.json';
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
};

export class Utility {
    public generateId = generateId;
    public formatDateRelative = formatDateRelative;
    public multiplyString = multiplyString;
    public escapeHTML = escapeHTML;
    public isTouchDevice = isTouchDevice;
}
