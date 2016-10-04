'use strict'
const def = require("def-schema");

class Merge {
    constructor(options) {
        def.or(Function,{
            timeout:def.opt(Number),
            errorHandler: def.opt(Function),
            worker:Function
        }).validate(options);

        if(def(Function).match(options)) {
            options = {worker:options};
        }
        this.options = Object.assign({},options);
        this.cache = {};
    }

    submit(task) {
        def.or(String,Number,Boolean).validate(task);

        task = String(task);
        if(this.cache[task] === undefined) {
            let id = String(Math.random());
            this.cache[task] = {
                id: id,
                promises :[]
            };
            let resovle = this.__resolve(task, id);
            let reject = this.__reject(task, id);
            this.__ifTimeout(task, reject);
            process.nextTick(() => {
                try {
                    this.options.worker.call({task}, resovle, reject);
                } catch(e) {
                    reject(e);
                }

            });
        }
        return new Promise((resovle,reject) => {
            this.cache[task].promises.push({resovle, reject});
        })
    }

    __resolve(task, id) {
        return (result) => {
            if(this.cache[task] === undefined || this.cache[task].id !== id) {
                return;
            }
            this.__clearTimeout(task);
            let promises = this.cache[task].promises;
            delete this.cache[task];
            let errors = [];
            promises.forEach(p => {
                try {
                    p.resovle(result);
                } catch(e) {
                    try {
                        p.reject(e);
                    } catch(e) {
                        errors.push(e);
                    }
                }
            });
            this.__errorHandling(errors, task);
        };
    }

    __reject(task, id) {
        return (err) => {
            if(this.cache[task] === undefined || this.cache[task].id !== id) {
                return;
            }
            this.__clearTimeout(task);
            let promises = this.cache[task].promises;
            delete this.cache[task];
            let errors = [];
            promises.forEach(p => {
                try {
                    p.reject(err);
                } catch(e) {
                    errors.push(e);
                }
            });
            this.__errorHandling(errors, task);
        };
    }

    __ifTimeout(task, reject) {
        if(this.options.timeout > 0) {
            this.cache[task].ot = setTimeout(()=>{
                reject(Error('timeout'));
            }, this.options.timeout);
        }
    }

    __clearTimeout(task) {
        if (this.cache[task] && this.cache[task].ot) {
            clearTimeout(this.cache[task].ot);
        }
    }

    __errorHandling(errors, task) {
        if(errors.length ===0) {
            return;
        }
        let errorHandler = this.options.errorHandler;
        if(errorHandler && typeof errorHandler === 'function') {
            errorHandler({task},errors);
        } else {
            throw Error(`unexcepted excetion occured when deal with task: ${task}, errors : ${errors.map(e=>String(e)).join(', ')}`);
        }
    }
}

module.exports = Merge;