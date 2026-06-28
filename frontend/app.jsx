import React, { useState, useEffect } from 'react';
import './App.css'; // Aap apni styling yahan daal sakte ho

function App() {
  // States to store tasks and form inputs
  const [tasks, setTasks] = useState([]);
  const [taskText, setTaskText] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [searchQuery, setSearchQuery] = useState("");

  const API_URL = "https://taskforze.onrender.com";

  // 1. Fetch all tasks from MongoDB on page load
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  // 2. Add Task (Bina refresh ke)
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskText.trim()) return;

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: taskText, dueDate, priority })
      });
      const newTask = await res.json();
      
      // State update: Purane tasks me naya task bina reload ke jodo
      setTasks([...tasks, newTask]);
      
      // Reset form
      setTaskText("");
      setDueDate("");
      setPriority("Medium");
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  // 3. Delete Task (Bina refresh ke)
  const handleDeleteTask = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      // UI update: Us task ko array se filter out kar do
      setTasks(tasks.filter(task => task._id !== id));
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  // 4. Toggle Complete Status (Bina refresh ke)
  const handleToggleComplete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}/toggle`, { method: "PUT" });
      const updatedTask = await res.json();
      // UI update: Match hone wale task ki properties update karo
      setTasks(tasks.map(task => task._id === id ? updatedTask : task));
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  // Calculations for Stats Card
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const progressPercentage = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;

  // Search filter implementation
  const filteredTasks = tasks.filter(t => 
    t.task.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="app-shell">
      {/* Header */}
      <header className="header">
        <h1>TaskForge (React)</h1>
        <p>Organize and track your daily tasks efficiently</p>
      </header>

      <div className="main-content" style={{ display: 'flex', gap: '20px', padding: '20px' }}>
        {/* Sidebar Ledger / Stats */}
        <aside className="ledger" style={{ width: '250px' }}>
          <h3>Today's Count</h3>
          <div>📋 Total tasks: {totalTasks}</div>
          <div>✅ Completed: {completedTasks}</div>
          <div>⏳ Pending: {pendingTasks}</div>
          <div className="progress-track" style={{ background: '#eee', height: '10px', marginTop: '10px' }}>
            <div style={{ background: 'green', width: `${progressPercentage}%`, height: '10px' }}></div>
          </div>
          <p>Progress: {Math.round(progressPercentage)}%</p>

          {/* Live Search Input */}
          <input 
            type="text" 
            placeholder="Search a task..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ marginTop: '20px', padding: '5px' }}
          />
        </aside>

        {/* Main Column Form + List */}
        <main className="main-col" style={{ flex: 1 }}>
          <form onSubmit={handleAddTask} className="add-card">
            <input 
              type="text" 
              placeholder="What do you need to do?" 
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              required 
            />
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <button type="submit">Add Task</button>
          </form>

          {/* Dynamic Task Cards List */}
          <div className="task-list" style={{ marginTop: '20px' }}>
            {filteredTasks.length === 0 ? (
              <p>No tasks found.</p>
            ) : (
              filteredTasks.map((task) => (
                <div key={task._id} className="task-card" style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
                  <input 
                    type="checkbox" 
                    checked={task.completed} 
                    onChange={() => handleToggleComplete(task._id)} 
                  />
                  <span style={{ textDecoration: task.completed ? 'line-through' : 'none', marginLeft: '10px' }}>
                    {task.task}
                  </span>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Priority: {task.priority} | Due: {task.dueDate || "No Date"}
                  </div>
                  <button onClick={() => handleDeleteTask(task._id)} style={{ color: 'red', marginTop: '5px' }}>
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;