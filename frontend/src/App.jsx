
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "/api/tasks";
function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTasks() {
    try {
      setError("");
      console.log("Requesting tasks from:", API_URL);
      const response = await fetch(API_URL);
      console.log("Tasks API status:", response.status);

      if (!response.ok) {
        let details = "";
        try {
          const body = await response.text();
          if (body) details = `: ${body}`;
        } catch {
          // ignore
        }
        throw new Error(
          `Could not load tasks (${response.status}${response.statusText ? " " + response.statusText : ""})${details}`
        );
      }

      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError(err.message || "Cannot connect to the backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function addTask(event) {
    event.preventDefault();

    if (!title.trim()) return;

    try {
      setError("");
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          completed: false,
        }),
      });

      if (!response.ok) {
        let details = "";
        try {
          const body = await response.text();
          if (body) details = `: ${body}`;
        } catch {
          // ignore
        }
        throw new Error(
          `Could not add task (${response.status}${response.statusText ? " " + response.statusText : ""})${details}`
        );
      }

      setTitle("");
      await loadTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  async function updateTask(task, newTitle, completed) {
    try {
      setError("");
      const response = await fetch(`${API_URL}/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          completed,
        }),
      });

      if (!response.ok) {
        let details = "";
        try {
          const body = await response.text();
          if (body) details = `: ${body}`;
        } catch {
          // ignore
        }
        throw new Error(
          `Could not update task (${response.status}${response.statusText ? " " + response.statusText : ""})${details}`
        );
      }

      setEditingId(null);
      await loadTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteTask(id) {
    try {
      setError("");
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        let details = "";
        try {
          const body = await response.text();
          if (body) details = `: ${body}`;
        } catch {
          // ignore
        }
        throw new Error(
          `Could not delete task (${response.status}${response.statusText ? " " + response.statusText : ""})${details}`
        );
      }

      await loadTasks();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="app">
      <h1>Project 46 — Task Manager</h1>
      <p>React frontend + Java Spring Boot REST API</p>

      <form onSubmit={addTask} className="task-form">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Enter a new task"
          aria-label="New task title"
        />
        <button type="submit">Add Task</button>
      </form>

      {error && (
        <p className="error">
          {error}
          <button type="button" onClick={loadTasks}>Retry</button>
        </p>
      )}

      <h2>Your Tasks</h2>

      {loading ? (
        <p>Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p>No tasks yet. Add your first task above.</p>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <li key={task.id} className="task">
              {editingId === task.id ? (
                <>
                  <input
                    value={editTitle}
                    onChange={(event) => setEditTitle(event.target.value)}
                    aria-label="Edit task title"
                  />
                  <button
                    onClick={() =>
                      updateTask(task, editTitle.trim(), task.completed)
                    }
                    disabled={!editTitle.trim()}
                  >
                    Save
                  </button>
                  <button onClick={() => setEditingId(null)}>
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <label className="task-title">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={(event) =>
                        updateTask(task, task.title, event.target.checked)
                      }
                    />
                    <span className={task.completed ? "completed" : ""}>
                      {task.title}
                    </span>
                  </label>

                  <div className="task-actions">
                    <button
                      onClick={() => {
                        setEditingId(task.id);
                        setEditTitle(task.title);
                      }}
                    >
                      Edit
                    </button>
                    <button onClick={() => deleteTask(task.id)}>
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      <button type="button" onClick={loadTasks}>
        Refresh Tasks
      </button>
    </main>
  );
}

export default App;
