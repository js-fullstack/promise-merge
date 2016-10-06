'use strict'
const assert = require('assert');
const Merge = require("../index");

describe('Happy path', () => {
    it('merge task into same promise',done => {
    	let count = 0;
        let m = new Merge({timeout: 3000, worker(task, resolve, reject) {
            setTimeout(() => {
            	count++;
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
        	assert.equal(count, 1);
        	assert.equal(m.size,0);
        }).then(done, done);
    });

    it('merge into different promise, if different task submited', done => {
        let count = 0;
        let m = new Merge({timeout: 3000, worker(task, resolve, reject) {
            setTimeout(() => {
            	count++;
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
        });
        let p34 = Promise.all([p1,p2]).then((rs) => {
            rs.forEach(r => assert.equal(r, 'a'));
        });
        Promise.all([p12, p34]).then(()=>{
            assert.equal(count, 2);
            assert.equal(m.size, 0);
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
    	let count = 0;
        let m = new Merge({timeout: 3000, worker(task, resolve, reject) {
            setTimeout(() => {
            	count++;
            	reject(task);
            },1000);
        }});

        let p1 = m.submit('a').catch(r => { assert.equal(r, 'a')});
        let p2 = m.submit('a').catch(r => { assert.equal(r, 'a')});
        let p3 = m.submit('a').catch(r => { assert.equal(r, 'a')});
        let p4 = m.submit('a').catch(r => { assert.equal(r, 'a')});
        assert.equal(m.size,1);
        Promise.all([p1,p2,p3,p4]).then((rs) => {
        	assert.equal(count, 1);
        	assert.equal(m.size,0);
        }).then(done, done);
    });
});

describe('exception', () => {});

describe('timeout', () => {});

