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
    console.log('file length: ' + dataString.length);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.href = dataString;
    downloadAnchorNode.download = fileName + '.json';
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
};

/** Provides static methods for value comparison */
export class Compare {
    /** Deep compares two arrays */
    static array(a: any[], b: any[]) {
        if (a === b) return true;
        if (a.length !== b.length) return false;

        if (!a.every((v, i) => this.any(v, b[i]))) return false;
        // for (let i = 0; i < a.length; i++) {
        //     if (!this.any(a[i], b[i])) return false;
        // }
        return true;
    }

    /** Deep compares two objects */
    static object(a: object, b: object) {
        if (a === b) return true;

        for (let i in a) {
            if (b.hasOwnProperty(i)) {
                if (!this.any(a[i], b[i])) return false;
            } else return false;
        }

        for (let i in b) {
            if (!a.hasOwnProperty(i)) return false;
        }

        return true;
    }

    /** Compares two Date objects */
    static date(a: Date, b: Date) { return a.getTime() === b.getTime(); } //prettier-ignore

    /** Compares two RegExp objects */
    static regexp(a: RegExp, b: RegExp) { return a.toString() === b.toString(); } //prettier-ignore

    /** Compares any two values (deep comparison for arrays and objects) */
    static any(a: any, b: any): boolean {
        if (a === b) return true;

        const aType = this.whatIs(a);
        const bType = this.whatIs(b);
        if (aType === bType) return this.hasOwnProperty(aType) ? this[aType](a, b) : a == b;
        else return false;
    }

    /** Returns the object's class: Array, Date, RegExp, Object */
    private static getClass(val: object): 'Array' | 'Date' | 'RegExp' | 'Object' {
        return Object.prototype.toString.call(val).match(/^\[object\s(.*)\]$/)[1];
    }

    /** Defines the type of the value, extended typeof */
    private static whatIs(val: any) {
        if (val === undefined) return 'undefined';
        if (val === null) return 'null';

        let type = typeof val;

        if (type === 'object') return this.getClass(val).toLowerCase();
        if (type === 'number') {
            if (val.toString().indexOf('.') > 0) return 'float';
            else return 'integer';
        }
        return type;
    }
}
