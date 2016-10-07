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
                let cleanup = (fn, args) => {
                    cleanup = () => {};
                    delete this.tasks[task];
                    clearTimeout(tm);
                    fn(args);
                };
                let wrapedResolve = (r) => cleanup(resolve, r);
                let wrapedReject = (e) => cleanup(reject, e);

                let tm = setTimeout(wrapedReject,this.timeout,Error('ETIMEOUT'));
                process.nextTick(() => {
                    try {
                        this.worker.call(undefined, task, wrapedResolve, wrapedReject);
                    } catch(e) {
                        wrapedReject(e);
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