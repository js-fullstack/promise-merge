# promise-merge

Submit task and return promise at once, and merge duplecated promises into one promise. All of promises will be resolve/reject if merged promised resolved/rejected.

## install

npm install promise-merged

## Sample

```
let Merge = require('merge');

let merge = new Merge(function(resolve, reject) {
   let task = this.task;
   //do something asyncnise
   asyncall('somewhere', (err, data) => {
       if(err) {
           reject(err);
       }
       resolve(data);
   })
});


let p1 = merge.submit('task-abc');
let p2 = merge.submit('task-abc');
let p3 = merge.submit('task-xyz');
let p4 = merge.submit('task-abc');
let p5 = merge.submit('task-xyz');

//p1 !== p2 !== p3 !== p4 !== p5
//p1, p2, p4 will resolve/reject at same time, because they are same tasks;
//p3, p5 will resolve/reject at same time, because they are same tasks;


```

## Important

Do not use arrow function as worker when create Merge like below
```
let merge = new Merge((resolve, reject) => {
    //error, because the task will be passed by "this", and "this" will not be bined in arrow function.
})
```