const crypto = require("crypto");
const db = require("../config/db");
const { verifyNoteOwnership } = require("../utils/verifyNoteOwnership");

const generateShareLink = async (req, res) => {
  let connection;
  try {
    const noteId = req.params.id;
    connection = await db.getConnection();

    if (!(await verifyNoteOwnership(noteId, req.user.id))) {
      return res.status(403).json({
        error: "Not authorized to share this note",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    await connection.query(
      `INSERT INTO shared_notes 
        (note_id, share_token) 
        VALUES (?, ?)`,
      [noteId, token]
    );    const baseUrl = process.env.BASE_URL || 'http://localhost:5174';
    
    res.json({
      shareLink: `${baseUrl}/shared/${token}`,
      noteId,
    });
  } catch (error) {
    console.error("Share generation error:", error);
    res.status(500).json({ error: "Failed to generate share link" });
  } finally {
    if (connection) await connection.release();
  }
};

const revokeShareLink = async (req, res) => {
  let connection;
  try {
    const noteId = req.params.id;
    connection = await db.getConnection();

    if (!(await verifyNoteOwnership(noteId, req.user.id))) {
      return res.status(403).json({
        error: "Not authorized to share this note",
      });
    }

    // Verify ownership and delete share
    const [result] = await connection.query(
      `DELETE FROM shared_notes 
      WHERE note_id = ? `,
      [noteId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "No active share link found",
      });
    }

    res.json({
      message: "Share link revoked successfully",
      noteId,
    });
  } catch (error) {
    console.error("Revoke share error:", error);
    res.status(500).json({ error: "Failed to revoke share link" });
  } finally {
    if (connection) await connection.release();
  }
};

const getSharedNote = async (req, res) => {
  try {
    const token = req.params.token;

    const [sharedNotes] = await db.query(
      `SELECT n.id, n.title, n.content, n.created_at, 
                u.username as author
        FROM shared_notes s
        JOIN notes n ON s.note_id = n.id
        JOIN users u ON n.user_id = u.id
        WHERE s.share_token = ?`,
      [token]
    );

    if (sharedNotes.length === 0) {
      return res
        .status(404)
        .json({ error: "Shared note not found or link revoked" });
    }

    res.json(sharedNotes[0]);
  } catch (error) {
    console.error("Get shared note error:", error);
    res.status(500).json({ error: "Failed to fetch shared note" });
  }
};

// Get current share status and link for a note
const getShareStatus = async (req, res) => {
  let connection;
  try {
    const noteId = req.params.id;
    connection = await db.getConnection();

    if (!(await verifyNoteOwnership(noteId, req.user.id))) {
      return res.status(403).json({
        error: "Not authorized to access this note",
      });
    }

    const [sharedNotes] = await connection.query(
      `SELECT share_token, created_at FROM shared_notes WHERE note_id = ?`,
      [noteId]
    );

    if (sharedNotes.length === 0) {
      return res.json({
        isShared: false,
        shareLink: null,
        createdAt: null,
      });
    }    const baseUrl = process.env.BASE_URL || 'http://localhost:5174';
    const token = sharedNotes[0].share_token;
    res.json({
      isShared: true,
      shareLink: `${baseUrl}/shared/${token}`,
      createdAt: sharedNotes[0].created_at,
    });
  } catch (error) {
    console.error("Get share status error:", error);
    res.status(500).json({ error: "Failed to get share status" });
  } finally {
    if (connection) await connection.release();
  }
};

module.exports = {
  generateShareLink,
  revokeShareLink,
  getSharedNote,
  getShareStatus,
};