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
