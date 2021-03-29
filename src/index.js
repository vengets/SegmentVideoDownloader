const logUpdate = require('log-update');
const fs = require("fs");
const url = require("url");
const http = require('http');
const https = require('https');
const path = require("path");


const myArgs = process.argv.slice(2);

let start = myArgs[1];
let end = myArgs[2];
if (!start) {
    start = 1;
}
if (!end) {
    end = 1;
}

console.log('Entered URL is ' + myArgs[0]);
if (process.env.DOWNLOAD_DIR === undefined) {
    require('dotenv').config();
}

let dir = process.env.DOWNLOAD_DIR;
console.log(`Download location: ${dir}`);

let tasks = [];

if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

const proto = !myArgs[0].charAt(4).localeCompare('s') ? https : http;

let download = (urlName = '', filePath = '') => new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    let fileInfo = null;

    const request = proto.get(urlName, response => {
        if (response.statusCode !== 200) {
            reject(new Error(`Failed to get '${urlName}' (${response.statusCode})`));
            return;
        }

        fileInfo = {
            mime: response.headers['content-type'],
            size: parseInt(response.headers['content-length'], 10),
        };

        response.pipe(file);
    });

    // The destination stream is ended by the time it's called
    file.on('finish', () => resolve(fileInfo));

    request.on('error', err => {
        fs.unlink(filePath, () => reject(err));
    });

    file.on('error', err => {
        fs.unlink(filePath, () => reject(err));
    });

    request.end();
});

for (let i = start; i <= end; i++) {
    let parsed = url.parse(myArgs[0].replace("{}", i.toString()));
    tasks.push(download(
        url.parse(myArgs[0].replace("{}", i)),
        dir + path.basename(parsed.pathname)));
}

var hrstart = process.hrtime()

class PromiseQueue {

    constructor(promises = [], concurrentCount = 1) {
        this.concurrent = concurrentCount;
        this.total = promises.length;
        this.todo = promises;
        this.running = [];
        this.complete = [];
    }

    get runAnother() {
        return (this.running.length < this.concurrent) && this.todo.length;
    }

    graphTasks() {
        let {todo, running, complete, total} = this;
        logUpdate(`
==================================================
   todo: [${todo.length}]
   running: [${running.length}]
   complete: [${complete.length}]
   total: [${total}]
   
   execution-time: [${process.hrtime(hrstart)[0]}s ${process.hrtime(hrstart)[1] / 1000000}ms]
==================================================
    `);
    }

    run() {
        while (this.runAnother) {
            let promise = this.todo.shift();
            promise.then(() => {
                this.complete.push(this.running.shift());
                this.graphTasks();
                this.run();
            })
            this.running.push(promise);
            this.graphTasks();
        }
    }

}


let delayQueue = new PromiseQueue(tasks, 10);

delayQueue.run();




