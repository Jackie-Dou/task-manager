const Task = require("./objects/Task");
const express = require("express");
const bodyParser = require("body-parser");
const multer  = require("multer");
const mkdirp = require('mkdirp');
const rimraf = require("rimraf");
const { Client } = require('pg');

const urlencodedParser = bodyParser.urlencoded({extended: true});

const app = express();

const storageConfig = multer.diskStorage({
    destination: (req, file, cb) =>{
        mkdirp("addFiles/"+req.body.taskIdAdd).then(made =>
            cb(null, "addFiles/"+req.body.taskIdAdd));
    },
    filename: (req, file, cb) =>{

        cb(null, file.originalname);
    }
});

app.use(express.static(__dirname + '/public'));
app.use(multer({storage:storageConfig}).single("filedata"));
app.set("view engine", "ejs");

let tasksList = [];
const client = new Client({
    user: 'tasks',
    host: 'localhost',
    database: 'tasks',
    password: '12345',
    port: 5432
});

client.connect(function() {
    loadTasks();
});

let server = app.listen(3000);

app.get("/", function(request, response){
    console.log("show main");
    let isExisted = true;
    if (tasksList.length === 0) {
        isExisted = false;
    }
    response.render("main", {
        listExists: isExisted,
        tasks: tasksList
    });
});

app.post("/sortStatus", urlencodedParser, function (request, response) {
    let tasksSortedList = tasksList.filter(task => task.getStatus() === true);
    let isExisted = true;
    if (tasksSortedList.length === 0) {
        isExisted = false;
    }
    response.render("main", {
        listExists: isExisted,
        tasks: tasksSortedList
    });
});

app.post("/addTask", urlencodedParser, function (request, response) {
    if(!request.body)
        return response.sendStatus(400);
    let name = request.body.newTaskName;
    let date = request.body.newTaskDate;
    let description = request.body.newTaskDescriptor;
    let status;
    status = request.body.newTaskStatus === 'true';
    insertTask(name, description, status, date);
    loadTasks();
    response.redirect("/");
});

app.post("/deleteTask", urlencodedParser, function (request, response) {
    if(!request.body) return response.sendStatus(400);
    deleteTask(request.body.taskId);
    rimraf.sync('addFiles/'+request.body.taskId);
    loadTasks();
    response.redirect("/");
});

app.post("/addFile", function (request, response) {
    if(!request.file) return response.sendStatus(400);
    updateTaskFile(request.file.filename, request.body.taskIdAdd);
    loadTasks();
    response.redirect("/");
});

app.post("/loadFile", urlencodedParser, function (request, response) {
    if(!request.body) return response.sendStatus(400);
    updateTaskFile("", request.body.taskIdDel);
    loadTasks();
    response.download("./addFiles/" + request.body.taskIdDel + "/" + request.body.fileNameGet);
});

// setTimeout(function() {
//     server.close(
//         client.end()
//     );
// }, 3000);



function updateTaskFile(filename, id) {
    client.query('UPDATE tasks SET tfile = $1 WHERE tid = $2', [filename, id], function(err, result) {
        if (err) {throw err;}
    });
}

function insertTask(name = null, description = null, status = false, date = null) {
    client.query('INSERT INTO tasks (tname, tdescription, tisimportant, tdate) VALUES ($1, $2, $3, $4)', [name, description, status, date], function(err, result) {
        if (err) {throw err;}
    });
}

function deleteTask(id) {
    client.query('DELETE FROM tasks WHERE tid = $1', [id], function(err, result) {
        if (err) {throw err;}
    });
}

function loadTasks() {
    client.query('SELECT * FROM tasks', (err, result) => {
        if (err) {throw err;}
        tasksList.splice(0, tasksList.length);
        for (let i = 0, numTasks = result.rows.length; i < numTasks; i++) {
            createTaskFromRow(result.rows[i], tasksList);
        }
    });
    return true;
}

function createTaskFromRow(row, tasksList) {
    let id = row.tid;
    let name = row.tname;
    let date = row.tdate;
    let description = row.tdescription;
    let status = row.tisimportant;
    let file = row.tfile;
    tasksList.push(new Task(id, name, description, status, date, file));
}



