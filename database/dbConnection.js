const Task = require("../objects/Task");

class dbConnection {
    constructor(client) {
        this.client = client;
    }

    startDB(tasksList) {
        this.client.connect();
        this.loadTasks(tasksList);
    }

    updateTaskFile(filename, id) {
        this.client.query('UPDATE tasks SET tfile = $1 WHERE tid = $2', [filename, id], function(err, result) {
            if (err) {throw err;}
        });
    }

    insertTask(name = null, description = null, status = false, date = null) {
        this.client.query('INSERT INTO tasks (tname, tdescription, tisimportant, tdate) VALUES ($1, $2, $3, $4)', [name, description, status, date], function(err, result) {
            if (err) {throw err;}
        });
    }

    deleteTask(id) {
        this.client.query('DELETE FROM tasks WHERE tid = $1', [id], function(err, result) {
            if (err) {throw err;}
        });
    }

    loadTasks(tasksList) {
        this.client.query('SELECT * FROM tasks', (err, result) => {
            if (err) {throw err;}
            tasksList.splice(0, tasksList.length);
            for (let i = 0, numTasks = result.rows.length; i < numTasks; i++) {
                this.createTaskFromRow(result.rows[i], tasksList);
            }
        });
        return tasksList;
    }

    createTaskFromRow(row, tasksList) {
        let id = row.tid;
        let name = row.tname;
        let date = row.tdate;
        let description = row.tdescription;
        let status = row.tisimportant;
        let file = row.tfile;
        tasksList.push(new Task(id, name, description, status, date, file));
    }
}

module.exports = dbConnection;




