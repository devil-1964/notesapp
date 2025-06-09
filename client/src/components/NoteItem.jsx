import { useEffect, useState, useCallback, memo } from 'react';
import { Trash2, X, Edit3, Share2 } from 'lucide-react';
import useApi from '../hooks/useApi';

const NoteItem = memo(function NoteItem({ note, onDelete, onSave, onShare, onSelect }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedTitle, setEditedTitle] = useState(note.title);
  const [editedContent, setEditedContent] = useState(note.content);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);  const { request, loading, error } = useApi();
  useEffect(() => {
    setEditedTitle(note.title);
    setEditedContent(note.content);
  }, [note.title, note.content]);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);
  const handleSave = useCallback(async () => {
    try {
      const response = await request(`/api/${note.id}`, 'PUT', {
        title: editedTitle,
        content: editedContent,      });
      
      const noteData = response.note || response;
      
      const updatedNote = {
        ...note,
        ...noteData,
        title: editedTitle,
        content: editedContent,
        updated_at: noteData.updated_at || new Date().toISOString()      };

      onSave(updatedNote);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to update note:', err);
    }
  }, [note, editedTitle, editedContent, request, onSave]);

  const handleShare = useCallback((e) => {
    e.stopPropagation();
    if (onShare) onShare(note);
  }, [onShare, note]);

  const handleNoteClick = useCallback(() => {
    if (onSelect) onSelect(note);
    openModal();
  }, [onSelect, note, openModal]);

  return (
    <>      <div
        onClick={handleNoteClick}
        className="group relative p-5 bg-white border border-gray-100 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-200 hover:-translate-y-0.5"
      >
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
          <button
            onClick={handleShare}
            className="p-1.5 rounded-lg hover:bg-purple-100 transition-colors"
            title="Share note"
          >
            <Share2 size={14} className="text-purple-600" />
          </button>
          <Edit3 size={16} className="text-gray-400" />
        </div>

        <h3 className="font-medium text-gray-900 truncate pr-16 mb-2">
          {note.title || 'Untitled'}
        </h3>

        <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed mb-3">
          {note.content || 'No content'}
        </p>

        <div className="text-xs text-gray-400 font-medium">
          {new Date(note.updated_at || note.updatedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </div>
      </div>

      {isModalOpen && (
        <div
          onClick={closeModal}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-2 text-gray-700">
                <Edit3 size={18} />
                <span className="font-medium">Edit Note</span>
              </div>
              <div className="flex items-center gap-2">                <button
                  onClick={handleShare}
                  className="p-1.5 rounded-lg hover:bg-purple-100 transition-colors"
                  title="Share note"
                  disabled={loading}
                >
                  <Share2 size={16} className="text-purple-600" />
                </button>
                <button
                  onClick={closeModal}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Close"
                  disabled={loading}
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  placeholder="Enter note title..."
                  disabled={loading}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  rows={8}
                  placeholder="Write your note here..."
                  disabled={loading}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 size={16} />
                Delete
              </button>

              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>      )}

      {showDeleteConfirm && (
        <div
          onClick={() => setShowDeleteConfirm(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Confirm Deletion
              </h3>
              <p className="text-sm text-gray-600">
                Are you sure you want to delete this note? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      await request(`/api/${note.id}`, 'DELETE');
                      if (onDelete) onDelete(note.id);
                      setShowDeleteConfirm(false);
                      setIsModalOpen(false);
                    } catch (err) {
                      console.error('Failed to delete note:', err);
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>          </div>
        </div>
      )}
    </>
  );
});

export default NoteItem;


