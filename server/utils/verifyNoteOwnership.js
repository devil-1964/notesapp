const db = require("../config/db");

const verifyNoteOwnership = async (noteId, userId) => {
  const [notes] = await db.query(
    `SELECT id FROM notes WHERE id=? AND user_id=?`,
    [noteId, userId]
  );

  return notes.length > 0;
};

module.exports = { verifyNoteOwnership };
