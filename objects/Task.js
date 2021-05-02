function Task(id, name, description, isImportant, date, file){
    this.tid = id;
    this.tname = name;
    this.tdescription = description;
    this.tisimportant = isImportant;
    this.tdate = date;
    this.tfile = file;
    this.addFile = function(filename){
        this.tfile = filename;
    }
    this.getFile = function(){
        return this.tfile;
    }
    this.deleteFile = function(){
        this.tfile = '';
    }
    this.setId = function(newId) {
        this.tid = newId;
    }
    this.getStatus = function() {
        return this.tisimportant;
    }
    this.getId = function() {
        return this.tid;
    }
}

module.exports = Task;