const Task = require("./objects/Task");
const express = require("express");
const bodyParser = require("body-parser");
const multer  = require("multer");
const mkdirp = require('mkdirp');
const rimraf = require("rimraf");
const { Client } = require('pg');
const dbConnector = require("./database/dbConnection");

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
// const client = new Client({
//     user: 'tasks',
//     host: 'localhost',
//     database: 'tasks',
//     password: '12345',
//     port: 5432
// });

// client.connect(function() {
//     loadTasks();
// });

client = new Client({
    user: 'tasks',
    host: 'localhost',
    database: 'tasks',
    password: '12345',
    port: 5432
});
let connector = new dbConnector(client);
connector.startDB(tasksList);

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
    connector.insertTask(name, description, status, date);
    connector.loadTasks(tasksList);
    response.redirect("/");
});

app.post("/deleteTask", urlencodedParser, function (request, response) {
    if(!request.body) return response.sendStatus(400);
    connector.deleteTask(request.body.taskId);
    rimraf.sync('addFiles/'+request.body.taskId);
    connector.loadTasks(tasksList);
    response.redirect("/");
});

app.post("/addFile", function (request, response) {
    if(!request.file) return response.sendStatus(400);
    connector.updateTaskFile(request.file.filename, request.body.taskIdAdd);
    connector.loadTasks(tasksList);
    response.redirect("/");
});

app.post("/loadFile", urlencodedParser, function (request, response) {
    if(!request.body) return response.sendStatus(400);
    connector.updateTaskFile("", request.body.taskIdDel);
    connector.loadTasks(tasksList);
    response.download("./addFiles/" + request.body.taskIdDel + "/" + request.body.fileNameGet);
});

// setTimeout(function() {
//     server.close(
//         client.end()
//     );
// }, 3000);







