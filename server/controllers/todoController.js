const Todo = require("../models/Todo");

// GET /api/todos
const getTodos = async (req, res) => {
  try {
    const todos = await Todo.find();
    res.status(200).json(todos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// POST /api/todos
const createTodo = async (req, res) => {
  try {
    const todo = await Todo.create(req.body);
    res.status(201).json(todo);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/todos/:id
const updateTodo = async (req, res) => {
  try {
    const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }
    res.status(200).json(todo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/todos/:id
const deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }
    res.status(200).json({ message: "Todo deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getTodos, createTodo, updateTodo, deleteTodo };