require("dotenv").config();

const express = require("express");
const path = require("path");
const mongoose = require("mongoose"); // Fixed the incorrect import here!
const app = express();
const dns = require("dns");
const PORT = 5432;

//change DNS
dns.setServers(["1.1.1.1","8.8.8.8"]);

// 1. MongoDB Setup
const DB_URL = process.env.atlas_URL;
console.log("Connecting to:", DB_URL);

mongoose.connect(DB_URL)
    .then(() => console.log('Successfully connected to MongoDB Atlas!'))
    .catch((err) => console.error('MongoDB connection error:', err));

// 2. Define Schema & Model (Replaces tasks.json logic)
const taskSchema = new mongoose.Schema({
    task: { type: String, required: true },
    completed: { type: Boolean, default: false },
    dueDate: String,
    priority: String,
    editing: { type: Boolean, default: false }
});

const Task = mongoose.model("Task", taskSchema);

// 3. Express Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
app.use(express.static("public"));

// 4. Routes (Converted to async/await for Database calls)
app.get('/', async (req, res) => {
    try {
        const allTasks = await Task.find({});
        const totalTasks = allTasks.length;
        const completedTasks = allTasks.filter(t => t.completed).length;
        const pendingTasks = allTasks.filter(t => !t.completed).length;

        let progressPercentage = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;

        const search = req.query.search;
        let filteredTasks = allTasks;

        if (search && search.trim() !== "") {
            filteredTasks = allTasks.filter(t =>
                t.task.toLowerCase().includes(search.toLowerCase())
            );
        }

        res.render("index", {
            tasks: filteredTasks,
            totalTasks,
            completedTasks,
            pendingTasks,
            progressPercentage,
        });
    } catch (err) {
       console.error("Asli Error Yeh Hai Bhai:", err); // Yeh terminal me error print karega
       res.status(500).send("Database Error: " + err.message);
    }
});

app.post('/add-task', async (req, res) => {
    try {
        const newTask = new Task({
            task: req.body.task,
            dueDate: req.body.dueDate,
            priority: req.body.priority
        });
        await newTask.save();
        res.redirect('/');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// NOTE: Changed route parameter from /:index to Mongoose /:id for unique matching
app.post('/delete-task/:id', async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.redirect('/');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.post('/complete-task/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        task.completed = !task.completed;
        await task.save();
        res.redirect('/');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get('/edit-task/:id', async (req, res) => {
    try {
        await Task.findByIdAndUpdate(req.params.id, { editing: true });
        res.redirect('/');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.post('/update-task/:id', async (req, res) => {
    try {
        await Task.findByIdAndUpdate(req.params.id, { 
            task: req.body.updatedTask, 
            editing: false 
        });
        res.redirect('/');
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});