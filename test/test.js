'use strict'
const Merge = require("../index.js");

// let merge = new Merge(function(resovle, reject) {
//     let tm = Math.random() * 500;
//     setTimeout(()=>{
//         console.log('called', this);
//         resovle(this);
//     },tm);
// });

// merge.submit('abc').then((data)=> console.log('done', data));
// merge.submit('abc').then((data)=> console.log('done', data));
// merge.submit('xyz').then((data)=> console.log('done', data));
// setTimeout(()=>{
//     merge.submit('abc').then((data)=> console.log('done', data));
//     merge.submit('xyz').then((data)=> console.log('done', data));
// },Math.random() * 500);

let merge2 = new Merge({
    timeout:100,
    worker:function(resolve, reject){
        setTimeout(()=>{
            resolve(this.task);
        },500);
    }
});

let px = merge2.submit('x');
console.log(merge2.cache);
px.catch((e)=> {
    console.log('====>',e);
    console.log(merge2.cache);
});