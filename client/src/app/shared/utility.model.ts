export const generateId = () => (Date.now() + Math.random()).toString().replace('.', '_');

export const formatDate = (time: Date | string) =>
    new Date(time).toLocaleString('en-EN', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: 'numeric',
    });
// .replace(/,/g, '');

export const reverseString = (str: string) => str.split('').reverse().join('');

export const multiplyString = (text = '!', multiplier = 3) => {
    let result = '';
    for (let i = 0; i < multiplier; i++) result += text;
    return result;
};

const replacementChars = [
    {
        keyChar: 'E',
        replaceChar: '3',
    },
    {
        keyChar: 'A',
        replaceChar: '4',
    },
    {
        keyChar: 'O',
        replaceChar: '0',
    },
    {
        keyChar: 'S',
        replaceChar: '5',
    },
    {
        keyChar: 'I',
        replaceChar: '1',
    },
];
export const replaceCharsWithNumbers = (
    text: string,
    replacementArr: {
        keyChar: string;
        replaceChar: string;
    }[] = replacementChars
) => text.split('')
        .map(char => replacementArr.some(c => c.keyChar == char) ? replacementArr.find(c => c.keyChar == char).replaceChar : char)
        .join(''); // prettier-ignore

export const generatePassword = (blockCount: number = 4) => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = [];
    const blockTemplate = 'XXXX'.split('');
    for (let i = 0; i < blockCount; i++)
        password.push(blockTemplate.map(_x => chars[Math.round(Math.random() * (chars.length - 1))]).join(''));
    return password.join('-');
};

export const validateAndFormatUrl = (url: string = '') => {
    url = url.trim();
    const matchProtocol = url.search(/https?:\/\//g);
    const matchDomain = url.search(/([^\s"/,;:]+\.)+[^\s".,;:]+/g);

    const isProtocolValid = matchProtocol == 0 ? true : matchProtocol == -1 ? false : false;
    const isDomainValid = matchDomain == 0 ? true : matchDomain == -1 ? false : false;

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

export const getCopyOf = (obj: object | any[]) => JSON.parse(JSON.stringify(obj));

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
    public formatDate = formatDate;
    public multiplyString = multiplyString;
    public escapeHTML = escapeHTML;
}
