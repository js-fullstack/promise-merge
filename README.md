# promise-merge

Consolidate Promise with the same task and not complete.

For example, merge same HTTP call in same promise before it resolved/rejected.

## install

npm install promise-merged

## Sample

```
let Merge = require('merge');

let merge = new Merge({timeout: 3000, worker(task, resolve, reject) { // create Merge with a worker function.
   asynCall('somewhere', (err, data) => {
       if(err) {
           reject(err);
       }
       resolve(data);
   })
}});


let p1 = merge.submit('task-abc'); // new task(task-abc). merge.submit will return a promise(here is p1) which to be resolve/reject by worker function
let p2 = merge.submit('task-abc'); // same task(task-abc), and suppose p1 is still in pending status, then p2 === p1
let p3 = merge.submit('task-xyz'); // new task(task-abc), p3 is new promise
let p4 = merge.submit('task-abc'); // same task(task-abc), and suppose p1 has completed now (resolved/rejected), then p4 !== p1
let p5 = merge.submit('task-xyz'); // same task(task-xyz), and suppose p3 is still in pending status, then p5 === p3


```

## Important

Only support ES6.

Task submitted only support String, JSON.stringify can be used if Object as task.

