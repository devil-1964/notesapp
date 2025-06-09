const { ZodError } = require("zod");
const db = require("../config/db");
const { noteSchema } = require("../schemas/notesSchemas");
const { verifyNoteOwnership } = require("../utils/verifyNoteOwnership");

const createNote = async (req, res) => {
  let connection;
  try {
    const { title, content } = noteSchema.parse(req.body);
    connection = await db.getConnection();
    const [result] = await connection.query(
      "INSERT INTO notes (user_id,title,content) VALUES (?,?,?)",
      [req.user.id, title, content]
    );

    const [notes] = await connection.query(
      "SELECT id,title,content,created_at, updated_at FROM notes WHERE id=?",
      [result.insertId]
    );
    res.status(201).json({
      message: "Note created successfully",
      note: notes[0],
    });
  } catch (error) {
    console.error("Created note error", error);

    if (error instanceof ZodError) {
      return res.status(400).json({
        error: "Validation failed",
        details: error.errors.map((err) => err.message),
      });
    }

    res.status(500).json({
      error: "Failed to create note",
    });
  } finally {
    if (connection) await connection.release();
  }
};

const getNotes = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    const [notes] = await connection.query(
      "SELECT id,title,content,created_at, updated_at FROM notes WHERE user_id=?",
      [req.user.id]
    );
    res.status(200).json({
      message: "Notes fetched successfully",
      notes,
    });
  } catch (error) {
    console.error("Get notes error", error);
    res.status(500).json({
      error: "Failed to fetch notes",
    });
  } finally {
    if (connection) await connection.release();
  }
};

const getNoteById = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();

    if (!(await verifyNoteOwnership(noteId, req.user.id))) {
      return res.status(403).json({
        error: "Not authorized to view this note",
      });
    }

    const [notes] = await connection.query(
      `SELECT id, title, content, created_at, updated_at 
       FROM notes 
       WHERE id = ? `,
      [noteId]
    );

    if (notes.length === 0) {
      return res.status(404).json({
        error: "Note not found",
      });
    }

    res.status(200).json({
      message: "Note fetched successfully",
      note: notes[0],
    });
  } catch (error) {
    console.error("Get note error:", error);
    res.status(500).json({
      error: "Failed to fetch note",
    });
  } finally {
    if (connection) await connection.release();
  }
};

const updateNote = async (req, res) => {
  let connection;
  try {
    const noteId = req.params.id;
    const { title, content } = noteSchema.parse(req.body);

    if (!(await verifyNoteOwnership(noteId, req.user.id))) {
      return res.status(403).json({
        error: "Not authorized to update this note",
      });
    }
    connection = await db.getConnection();

    await connection.query(`UPDATE notes SET title=?, content=? WHERE id=?`, [
      title,
      content,
      noteId,
    ]);    const [notes] = await connection.query(
      `SELECT id,title,content,created_at,updated_at FROM notes WHERE id=?`,
      [noteId]
    );

    res.json({
      message: "Note updated successfully",
      note: notes[0],
    });
  } catch (error) {
    console.error("Get notes error", error);
    res.status(500).json({
      error: "Failed to update notes",
    });
  } finally {
    if (connection) await connection.release();
  }
};

const deleteNote = async (req, res) => {
  let connection;
  try {
    const noteId = req.params.id;
    connection = await db.getConnection();

    if (!(await verifyNoteOwnership(noteId, req.user.id))) {
      return res.status(403).json({
        error: "Not authorized to delete this note",
      });
    }

    const [result] = await connection.query(
      "DELETE FROM notes WHERE id = ? AND user_id = ?",
      [noteId, req.user.id]
    );

    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Delete note error:", error);
    res.status(500).json({ error: "Failed to delete note" });
  } finally {
    if (connection) await connection.release();
  }
};

module.exports = { createNote, getNotes,getNoteById, updateNote, deleteNote };
