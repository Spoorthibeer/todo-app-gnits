import { useEffect, useState } from "react";
import { getTodos, createTodo, updateTodo, deleteTodo } from "./api";
import { FILTERS } from "./filters";
import Sidebar from "./components/Sidebar";
import TodoForm from "./components/TodoForm";
import TodoItem from "./components/TodoItem";

const ITEMS_PER_PAGE = 5;

function App() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Shows an error in the banner (and logs it in the console)
  function showError(err) {
    console.error(err);
    setError(err.message);
  }

  // Load all todos once when the page opens
  useEffect(() => {
    async function loadTodos() {
      try {
        setError("");
        const data = await getTodos();
        setTodos(data);
      } catch (err) {
        showError(err);
      } finally {
        // Stop loading whether it worked or failed
        setLoading(false);
      }
    }

    loadTodos();
  }, []);

  // Reset to page 1 whenever the user switches tabs
  function handleFilterChange(newFilter) {
    setFilter(newFilter);
    setCurrentPage(1);
  }

  // Add a new todo to the top of the list and return to page 1
  async function handleAdd(title) {
    try {
      setError("");
      const newTodo = await createTodo(title);
      setTodos((prev) => [newTodo, ...prev]);
      setCurrentPage(1);
    } catch (err) {
      showError(err);
    }
  }

  // Replace the edited todo with the updated version from the server
  async function handleUpdate(id, data) {
    try {
      setError("");
      const updated = await updateTodo(id, data);
      setTodos((prev) =>
        prev.map((todo) => (todo._id === id ? updated : todo))
      );
    } catch (err) {
      showError(err);
    }
  }

  // Remove one todo and adjust page index if deleting the last item on the page
  async function handleDelete(id) {
    try {
      setError("");
      await deleteTodo(id);
      setTodos((prev) => {
        const next = prev.filter((todo) => todo._id !== id);
        const newTotalPages = Math.ceil(next.length / ITEMS_PER_PAGE) || 1;
        if (currentPage > newTotalPages) {
          setCurrentPage(newTotalPages);
        }
        return next;
      });
    } catch (err) {
      showError(err);
    }
  }

  // Remove every completed todo
  async function handleClearDone() {
    try {
      setError("");
      const doneTodos = todos.filter((todo) => todo.completed);

      for (const todo of doneTodos) {
        await deleteTodo(todo._id);
      }

      setTodos((prev) => prev.filter((todo) => !todo.completed));
      setCurrentPage(1);
    } catch (err) {
      showError(err);
    }
  }

  // Only the todos that match the selected filter
  const filteredTodos = todos.filter(FILTERS[filter].test);

  // Pagination calculations (10 items per page)
  const totalPages = Math.ceil(filteredTodos.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTodos = filteredTodos.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // "1 task" or "3 tasks"
  const taskWord = filteredTodos.length === 1 ? "task" : "tasks";

  // Creates numbered pages with ellipsis: < 1 ... 4 5 6 ... 20 >
  function getPageNumbers() {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(
          1,
          "...",
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }
    return pages;
  }

  // Decide what to show in the list area
  function renderTodos() {
    if (loading) {
      return <p className="empty">Loading...</p>;
    }

    if (filteredTodos.length === 0) {
      let message = "You're all caught up. Add a task above.";
      if (filter === "done") {
        message = "Nothing completed yet";
      }

      return (
        <div className="empty">
          <img src="/logo.png" alt="" />
          <p>{message}</p>
        </div>
      );
    }

    return (
      <>
        <ul className="todo-list">
          {paginatedTodos.map((todo) => (
            <TodoItem
              key={todo._id}
              todo={todo}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </ul>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="page-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              &lt;
            </button>

            {getPageNumbers().map((item, idx) =>
              item === "..." ? (
                <span key={`dots-${idx}`} className="page-dots">
                  ...
                </span>
              ) : (
                <button
                  key={item}
                  className={`page-btn ${currentPage === item ? "active" : ""}`}
                  onClick={() => setCurrentPage(item)}
                >
                  {item}
                </button>
              )
            )}

            <button
              className="page-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              &gt;
            </button>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="layout">
      <Sidebar
        todos={todos}
        filter={filter}
        onFilter={handleFilterChange}
        onClearDone={handleClearDone}
      />

      <main className="panel content">
        <header className="content-header">
          <h2>{FILTERS[filter].label}</h2>
          <span className="content-count">
            {filteredTodos.length} {taskWord}
          </span>
        </header>

        <TodoForm onAdd={handleAdd} />

        {error && (
          <div className="error" role="alert">
            <span>{error}</span>
            <button onClick={() => setError("")} aria-label="Dismiss">
              ×
            </button>
          </div>
        )}

        {renderTodos()}
      </main>
    </div>
  );
}

export default App;