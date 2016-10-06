'use strict'
const def = require("def-schema");

class Merge {
    constructor({timeout, worker}) {
        def([Number,Function]).validate([timeout,worker]);

        this.timeout = timeout;
        this.worker = worker;
        this.tasks = {};
    }

    submit(task) {
        def(String).validate(task);

        if(this.tasks[task] === undefined) {
            this.tasks[task] = new Promise((resolve, reject) => {
                let clean = (fn) => {
                    return (r) => {
                        delete this.tasks[task];
                        clearTimeout(tm);
                        fn(r);
                    }
                }
                let tm = setTimeout(clean(reject),this.timeout,'ETIMEOUT');
                process.nextTick(() => {
                    try {
                        this.worker.call(undefined, task, clean(resolve), clean(reject));
                    } catch(e) {
                        clean(reject)(e);
                    }
                });
            });
        }
        return this.tasks[task];
    }

    get size() {
        return Object.keys(this.tasks).length;
    }
}

module.exports = Merge;