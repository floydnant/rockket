export const generateId = () => (Date.now() + Math.random()).toString().replace('.', '_');

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

export const validateAndFormatUrl = (url: string) => {
    url = (url || '').trim().toLocaleLowerCase();
    const isProtocolValid = /^https?:\/\//.test(url);
    const isDomainValid = /([^\s"/,;:]+\.)+[^\s".,;:]+$/g.test(url);

    if (!isProtocolValid && url != '') url = 'https://' + url;

    return {
        isProtocolValid,
        isDomainValid,
        resUrl: url,
    };
};
export const parseUrls = (text: string) => {
    let urls = [];
    const sanitizedText = text.replace(/https?:\/\/([^\s"/,;:]+\.)+[^\s".,;:]+/g, match => {
        urls.push(match);
        return '';
    });

    return {
        sanitizedText,
        urls,
    };
};

/**
 * @param appendElipsis wether to append three dots (**adds to the length**) [defaults to true]
 */
export const shortenText = (text: string, maxLength: number, appendElipsis = true) => {
    const shortend = text.slice(0, maxLength);
    return shortend + (appendElipsis && text.length > maxLength ? '...' : '');
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
