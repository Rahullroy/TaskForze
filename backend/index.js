require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors"); // 1. REQUIRE KIYA

const app = express();
const PORT = process.env.PORT || 5447;

app.use((req, res, next) => {
    // Isko '*' kar do taaki koi bhi live frontend seamlessly baat kar sake
    res.setHeader("Access-Control-Allow-Origin", "*"); 
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

// 3. DATA PARSING MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Iske baad tumhara baki MongoDB connect aur routes ka code aayega ---
const dns = require("dns");

//change DNS
dns.setServers(["1.1.1.1","8.8.8.8"]);

// MongoDB Setup
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

// Middleware
app.use(cors()); // Isse React app aapki Express API ko access kar payegi
app.use(express.json());

// ===== API ROUTES FOR REACT =====

// 1. Get all tasks
app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await Task.find({});
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Add a task
// ❌ app.post('/add-task', ...) KO BADAL KAR YEH KRO:
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
// 3. Delete a task
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Task deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Toggle Complete status
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