# promise-merge

Consolidate Promise with the same task and not complete.

For example, merge same HTTP call in same promise before it resolved/rejected.

## install

npm install promise-merged

## Sample

```
let Merge = require('merge');

let merge = new Merge(function(resolve, reject) {
   let task = this.task;

   asyncall('somewhere', (err, data) => {
       if(err) {
           reject(err);
       }
       resolve(data);
   })
});


let p1 = merge.submit('task-abc');
let p2 = merge.submit('task-abc'); // suppose p1 is still in pending status, then p2 === p1
let p3 = merge.submit('task-xyz'); // p3 is new promise
let p4 = merge.submit('task-abc'); // suppose p1 is completed now (resolved/rejected), then p4 !== p1
let p5 = merge.submit('task-xyz');  //suppose p3 is still in pending status, then p5 === p3


```

## Important

Only support ES6.
