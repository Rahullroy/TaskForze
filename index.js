const fs = require("fs");
const express = require("express");
const path = require("path");
const app = express();
const PORT = 5446;

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.set("view engine","ejs");
app.set("views",path.resolve("./views"));
app.use(express.static("public"));

let fileContent = fs.readFileSync('./tasks.json','utf-8');
let tasks= JSON.parse(fileContent);


function saveTasks(){
        let taskstring = JSON.stringify(tasks);
        fs.writeFileSync('./tasks.json',taskstring);

    }

app.get('/',(req,res)=>{
    const totalTasks = tasks.length;

    const completedTasks = tasks.filter(task => task.completed).length;

    const pendingTasks = tasks.filter(task => !task.completed).length;

    const search = req.query.search;

    let filteredTasks;

    if(!search || search.trim() === ""){
        filteredTasks = tasks;
    }
    else{
        filteredTasks = tasks.filter(task =>
            task.task.toLowerCase().includes(search.toLowerCase())
        );
    }

   res.render("index",{
    tasks: filteredTasks,
    totalTasks,
    completedTasks,
    pendingTasks
});
});

app.post('/add-task',(req,res)=>{
    const task = req.body.task;
    const dueDate = req.body.dueDate;
    const priority = req.body.priority;
    
        tasks.push({
            task: task,
            completed: false,
            dueDate:dueDate,
            priority:priority,
            editing: false,
        });

    saveTasks();
    res.redirect('/');


})

app.post('/delete-task/:index',(req,res)=>{
    const index = parseInt(req.params.index);

    tasks.splice(index, 1);
    saveTasks();
    

    res.redirect('/');
});

app.post('/complete-task/:index',(req,res)=>{
    const index = parseInt(req.params.index);
     if(index >= 0 && index < tasks.length){
        tasks[index].completed = !tasks[index].completed;
    }
    saveTasks();

    res.redirect('/');


})
 
app.get('/edit-task/:index',(req,res)=>{
    const index = parseInt(req.params.index);
    tasks[index].editing = true;
    saveTasks();
    res.redirect('/');

})

app.post('/update-task/:index',(req,res)=>{

    const index = parseInt(req.params.index);

    const updatedTask = req.body.updatedTask;

    tasks[index].task = updatedTask;

    tasks[index].editing = false;

    saveTasks();

    res.redirect('/');
})









app.listen(PORT , ( )  => {
    console.log("server running on port",{PORT});
})


