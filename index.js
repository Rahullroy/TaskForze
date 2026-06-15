const fs = require("fs");
const express = require("express");
const path = require("path");
const app = express();
const PORT = 5566;

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.set("view engine","ejs");
app.set("views",path.resolve("./views"));
app.use(express.static("public"));

let tasks =[];

app.get('/',(req,res)=>{
    res.render("index",{tasks:tasks});
});

app.post('/add-task',(req,res)=>{
    const task = req.body.task;
    const dueDate = req.body.dueDate;
        
        tasks.push({
            task: task,
            completed: false,
            dueDate:dueDate,
        });
    return res.redirect('/');


})

app.post('/delete-task/:index',(req,res)=>{
    const index = parseInt(req.params.index);

        tasks.splice(index, 1);

    res.redirect('/');
});







app.listen(PORT , ( )  => {
    console.log("server running on port",{PORT});
})


