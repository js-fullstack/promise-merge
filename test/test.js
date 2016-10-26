'use strict'
const assert = require('assert');
const Merge = require("../index");
const Trace = require("trace-step");

describe('Happy path', () => {
    it('merge task into same promise',done => {
    	let t = new Trace();
    	done = t.wrap(done);
        let m = new Merge({timeout: 3000, worker(task, resolve, reject) {
            setTimeout(() => {
            	t.step(1);
            	resolve(task);
            },1000);
        }});

        let p1 = m.submit('a');
        let p2 = m.submit('a');
        let p3 = m.submit('a');
        let p4 = m.submit('a');
        assert.equal(m.size,1);
        Promise.all([p1,p2,p3,p4]).then((rs) => {
            rs.forEach(r => assert.equal(r, 'a'));
        	t.match(1);
        	assert.equal(m.size,0);
        }).then(done, done);
    });

    it('merge into different promise, if different task submited', done => {
        let t = new Trace();
        done = t.wrap(done);
        let m = new Merge({timeout: 3000, worker(task, resolve, reject) {
            setTimeout(() => {
            	t.step(1);
            	resolve(task);
            },1000);
        }});

        let p1 = m.submit('a');
        let p2 = m.submit('a');
        let p3 = m.submit('b');
        let p4 = m.submit('b');
        assert.equal(m.size,2);
        let p12 = Promise.all([p1,p2]).then((rs) => {
            rs.forEach(r => assert.equal(r, 'a'));
            t.step(2);
        });
        let p34 = Promise.all([p3,p4]).then((rs) => {
            rs.forEach(r => assert.equal(r, 'b'));
            t.step(3);
        });
        Promise.all([p12, p34]).then(()=>{
            assert.equal(m.size, 0);
            t.resemble(1,2,1,3);
        }).then(done, done);
    });

    it('merge twice, if first promise was resolved',done => {
        let count = 0;
        let m = new Merge({timeout: 3000, worker(task, resolve, reject) {
            setTimeout(() => {
            	count++;
            	resolve(task);
            },500);
        }});

        let p1 = m.submit('a');
        let p2 = m.submit('a');
        assert(m.size, 1);
        Promise.all([p1,p2]).then((rs) => {
            rs.forEach(r => assert.equal(r, 'a'));
        	assert.equal(count, 1);
        	assert.equal(m.size,0);
            return Promise.all([m.submit('a'), m.submit('a')]);
        }).then((rs) => {
            rs.forEach(r => assert.equal(r, 'a'));
        	assert.equal(count, 2);
        	assert.equal(m.size,0);
        }).then(done, done);
    });

    it('merge task into same promise, reject all',done => {
    	let t = new Trace();
    	done = t.wrap(done);
        let m = new Merge({timeout: 3000, worker(task, resolve, reject) {
            setTimeout(() => {
            	t.step(0);
            	reject(task);
            },1000);
        }});

        let p1 = m.submit('a').catch(r => { t.step(1,()=>assert.equal(r, 'a'))});
        let p2 = m.submit('a').catch(r => { t.step(2,()=>assert.equal(r, 'a'))});
        let p3 = m.submit('a').catch(r => { t.step(3,()=>assert.equal(r, 'a'))});
        let p4 = m.submit('a').catch(r => { t.step(4,()=>assert.equal(r, 'a'))});
        assert.equal(m.size,1);
        Promise.all([p1,p2,p3,p4]).then((rs) => {
        	assert.equal(m.size,0);
        	t.resemble(0,1,2,3,4);
        }).then(done, done);
    });
});

describe('exception', () => {
    it('reject with exception if the exception was thrown when executing worker', done => {
        let m = new Merge({timeout:3000, worker(task, resolve, reject){
            throw 'err';
        }});
        let t = new Trace();
        done = t.wrap(done);
        m.submit('a')
            .catch(e => t.step(1, () => assert.equal(e, 'err')))
            .then(() => {assert.equal(m.size, 0); t.match(1);})
            .then(done, done);

    });
});

describe('timeout', () => {
    it('timeout will throw exception if timeout',done => {
        let t = new Trace();
        done = t.wrap(done);
        let m = new Merge({timeout: 100, worker(task, resolve, reject) {
            t.step(1);
        }});

        m.submit('a')
            .catch(e => {
                assert.equal(m.size, 0);
                assert.equal(e.message, 'ETIMEOUT');
                t.match(1);
            })
            .then(done, done)
    });

    it('timeout caused double reject/resolve wont impact same task submited',done => {
        let t = new Trace();
        done = t.wrap(done);
        let i = 0;
        let m = new Merge({timeout: 1000, worker(task, resolve, reject) {
            t.step(0);
            if(i++ === 0){
                setTimeout(() => {
                    t.step(1);
                    reject(task + 'err');
                },1400);
            } else {
                setTimeout(() => {
                    t.step(2);
                    resolve(task + task);
                },800);
            }
        }});

        m.submit('a')
            .catch(e => {
                assert.equal(m.size, 0);
                assert.equal(e.message, 'ETIMEOUT');
                t.step(3);
                let p =  m.submit('a');
                setTimeout(()=>{
                    assert.equal(m.size, 1);
                    t.step(4);
                }, 600);
                return p;
            }).then((r) => {
                assert.equal(r, 'aa');
                assert.equal(m.size, 0);
                t.match(0, 3, 0, 1, 4, 2);
            })
            .then(done, done)
    });
});

