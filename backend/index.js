require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors"); 

const app = express();
const PORT = process.env.PORT || 5447;

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Accept", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const dns = require("dns");


dns.setServers(["1.1.1.1","8.8.8.8"]);


const DB_URL = process.env.atlas_URL;
mongoose.connect(DB_URL)
    .then(() => console.log('Successfully connected to MongoDB Atlas!'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Task Schema
const taskSchema = new mongoose.Schema({
    task: { type: String, required: true },
    completed: { type: Boolean, default: false },
    dueDate: String,
    priority: { type: String, default: "Medium" }
});
const Task = mongoose.model("Task", taskSchema);


app.use(cors()); 
app.use(express.json());


app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await Task.find({});
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.post('/api/tasks', async (req, res) => {
    try {
        const newTask = new Task({
            task: req.body.task,
            dueDate: req.body.dueDate,
            priority: req.body.priority || "Medium"
        });
        const savedTask = await newTask.save();
        res.status(201).json(savedTask); // React ko JSON bhej diya
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/tasks/:id', async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Task deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.put('/api/tasks/:id/toggle', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        task.completed = !task.completed;
        await task.save();
        res.json(task);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => console.log(`Backend API running on port ${PORT}`));