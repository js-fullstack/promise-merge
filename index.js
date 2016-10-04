'use strict'

class Merge {
    constructor(worker) {
        this.worker = worker;
        this.cache = {};
    }
    
    submit(task) {
        task = String(task);
        if(this.cache[task] === undefined) {
            this.cache[task] = [];
            let resovle = this.__resolve(task);
            let reject = this.__reject(task);
            process.nextTick(() => {
                this.worker.call({task}, resovle, reject); 
            });
        }
        return new Promise((resovle,reject) => {
            this.cache[task].push({resovle, reject});
        })
    }
    
    __resolve(task) {
        return (result) => {
            let promises = this.cache[task];
            delete this.cache[task];
            promises.forEach(p => {
                p.resovle(result);
            })
        }; 
    }
    
    __reject(task) {
        return (err) => {
            let promises = this.cache[task];
            delete this.cache[task];
            promises.forEach(p => {
                p.reject(err);
            })
        };
    }
}

module.exports = Merge;