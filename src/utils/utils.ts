


class Compare {
    public static inRange(x:number,min:number,max:number):Boolean{
        return (x <= max&&x>=min);
    }
}

class Queue<T> {
    private count: number;
    private lowestCount: number;
    private items: any;

    constructor() {
        this.count = 0;
        this.lowestCount = 0;
        this.items = {};
    }

    public push(element: T) {
        this.items[this.count] = element;
        this.count++;
    }

    public pop() {
        if (this.isEmpty()) {
            return undefined;
        }
        const result = this.items[this.lowestCount];
        delete this.items[this.lowestCount];
        this.lowestCount++;
        return result;
    }

    public peek() {
        if (this.isEmpty()) {
            return undefined;
        }
        return this.items[this.lowestCount];
    }

    public isEmpty() {
        return this.size() === 0;
    }

    public clear() {
        this.items = {};
        this.count = 0;
        this.lowestCount = 0;
    }

    public size() {
        return this.count - this.lowestCount;
    }

    public toString() {
        if (this.isEmpty()) {
            return '';
        }
        let objString = `${this.items[this.lowestCount]}`;
        for (let i = this.lowestCount + 1; i < this.count; i++) {
            objString = `${objString},${this.items[i]}`;
        }
        return objString;
    }
}

export{Compare,Queue}