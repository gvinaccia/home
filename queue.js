module.exports = class Queue {
    constructor(size)
    {
        this.size = size;
        this._data = [];
    }

    push(val) {
        if (this._data.length == this.size) {
            this._data.shift();
        }
        this._data.push(val);
    }

    get data() {
        return this._data;
    }
}