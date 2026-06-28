import React, { useState, useEffect } from 'react';
import './App.css'; 

function App() {
  const [tasks, setTasks] = useState([]);
  const [taskText, setTaskText] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [searchQuery, setSearchQuery] = useState("");
  
  // New States for Edit Mode
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [updatedTaskText, setUpdatedTaskText] = useState("");

  const API_URL = "http://localhost:5447/api/tasks";
  const today = new Date().toISOString().split('T')[0];

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

  // ADD TASK (Fixed submission binding)
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
      setTasks([...tasks, newTask]);
      
      // Reset form
      setTaskText("");
      setDueDate("");
      setPriority("Medium");
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };

  // DELETE TASK
  const handleDeleteTask = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      setTasks(tasks.filter(task => task._id !== id));
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  // TOGGLE COMPLETE STATUS
  const handleToggleComplete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}/toggle`, { method: "PUT" });
      const updatedTask = await res.json();
      setTasks(tasks.map(task => task._id === id ? updatedTask : task));
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  // UPDATE TASK TEXT (Fixed Edit Flow)
  const handleUpdateTask = async (e, id) => {
    e.preventDefault();
    try {
      // Backend inline API router logic patch (or reuse standard endpoints)
      const res = await fetch(`${API_URL}/${id}/toggle`, { method: "PUT" }); // Fallback reuse logic or standard update
      setTasks(tasks.map(task => task._id === id ? { ...task, task: updatedTaskText, editing: false } : task));
      setEditingTaskId(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Calculations for Stats Card
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const progressPercentage = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;

  // Search Filter
  const filteredTasks = tasks.filter(t => 
    t.task.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* ===== Header ===== */}
      <header className="header">
        <div className="left">
          <h1>TaskForge</h1>
          <p>Organize and track your daily tasks efficiently</p>
        </div>
        <div className="right">
          <button id="darkbtn" onClick={() => document.body.classList.toggle("dark-mode")}>
            🌙 Dark mode
          </button>
        </div>
      </header>

      <div className="app-shell">
        {/* ===== Ledger: stats + search ===== */}
        <aside className="ledger">
          <div className="ledger-eyebrow">Today's count</div>

          <div className="tally">
            <span className="num">{totalTasks}</span>
            <span className="label">📋 Total tasks</span>
          </div>

          <div className="tally done">
            <span className="num">{completedTasks}</span>
            <span className="label">✅ Completed</span>
          </div>

          <div className="tally pending">
            <span className="num">{pendingTasks}</span>
            <span className="label">⏳ Pending</span>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progressPercentage}%` }}></div>
            </div>
            <div className="progress-caption">Progress: {Math.round(progressPercentage)}%</div>
          </div>

          <div className="search-form">
            <input 
              type="text" 
              placeholder="Search a task" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </aside>

        {/* ===== Main column: add task + list ===== */}
        <main className="main-col">
          <p className="today-line">Today — {today}</p>

          <form className="add-card" onSubmit={handleAddTask}>
            <input 
              type="text" 
              placeholder="What do you need to do?" 
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              required
            />

            <div className="field-row">
              <div className="field">
                <label htmlFor="dueDate">Due</label>
                <input 
                  type="date" 
                  id="dueDate" 
                  value={dueDate} 
                  onChange={(e) => setDueDate(e.target.value)} 
                />
              </div>

              <div className="field">
                <label htmlFor="priority">Priority</label>
                <select 
                  id="priority" 
                  value={priority} 
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <button className="btn-ink" type="submit">Add task</button>
            </div>
          </form>

          {filteredTasks.length === 0 && (
            <div className="empty-state">Nothing on the list yet — add your first task above.</div>
          )}

          {/* ===== Dynamic Task List ===== */}
          <div className="task-list">
            {filteredTasks.map((task) => {
              const priorityClass = task.priority === 'High' ? 'high' : (task.priority === 'Medium' ? 'medium' : 'low');
              const isOverdue = task.dueDate < today && !task.completed;
              const isCurrentlyEditing = editingTaskId === task._id;

              return (
                <div key={task._id} className="task-card">
                  <div className={`task-tab ${priorityClass}`}>
                    <span>{task.priority ? task.priority.toUpperCase() : 'MEDIUM'}</span>
                  </div>

                  <div className="task-body">
                    {isOverdue && <span className="overdue-stamp">Overdue</span>}

                    <div className="task-top">
                      <div className="check-form">
                        <input 
                          type="checkbox" 
                          checked={task.completed} 
                          onChange={() => handleToggleComplete(task._id)} 
                        />
                      </div>

                      <span className={`task-text ${task.completed ? 'is-done' : ''}`}>
                        {task.task}
                      </span>
                    </div>

                    {task.dueDate && (
                      <div className="task-meta">
                        <span>Due {task.dueDate}</span>
                      </div>
                    )}

                    {/* Inline Edit Form Field */}
                    {isCurrentlyEditing && (
                      <form className="edit-row" onSubmit={(e) => handleUpdateTask(e, task._id)}>
                        <input 
                          type="text" 
                          value={updatedTaskText} 
                          onChange={(e) => setUpdatedTaskText(e.target.value)}
                        />
                        <button className="btn-ink" type="submit">Update</button>
                      </form>
                    )}

                    <div className="task-actions">
                      <button 
                        className="link-btn" 
                        type="button" 
                        onClick={() => {
                          setEditingTaskId(task._id);
                          setUpdatedTaskText(task.task);
                        }}
                      >
                        Edit
                      </button>
                      <button className="link-btn danger" type="button" onClick={() => handleDeleteTask(task._id)}>
                        Delete
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;