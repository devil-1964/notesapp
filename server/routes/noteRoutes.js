const express=require("express");
const { authenticate } = require("../middlewares/authMiddleware");
const { createNote,getNotes, updateNote, deleteNote, getNoteById } = require("../controllers/noteController");
const { generateShareLink, revokeShareLink, getSharedNote, getShareStatus } = require("../controllers/shareController");
const router=express.Router();

// Public route (must be before authentication middleware)
router.get('/shared/:token', getSharedNote); // Access shared note

router.use(authenticate)
    
router.post('/notes',createNote)
router.get('/notes',getNotes)
router.get('/notes/:id',getNoteById)
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);


// Protected routes
router.get('/:id/share', getShareStatus); // Get share status
router.post('/:id/share', generateShareLink); // Create share link
router.delete('/:id/share', revokeShareLink); // Revoke share link

module.exports=router