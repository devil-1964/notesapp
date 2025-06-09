// NoteEditor.jsx
import { useState, useEffect, useRef } from 'react';
import { Save, FileText, Type } from 'lucide-react';
import useApi from '../hooks/useApi';

export default function NoteEditor({ setIsExpanded,isExpanded, note, onSave }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const { request, loading } = useApi();
  const contentRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
  if (note) {
    setTitle(note.title || '');
    setContent(note.content || '');
  } else {
    // Clear the fields for new note
    setTitle('');
    setContent('');
  }
}, [note]);


  // Auto-resize textarea
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.height = 'auto';
      contentRef.current.style.height = Math.max(contentRef.current.scrollHeight, 200) + 'px';
    }
  }, [content]);

  // Focus title when expanded and no note (new note)
  useEffect(() => {
    if (isExpanded && !note && titleRef.current) {
      titleRef.current.focus();
    }
  }, [isExpanded, note]);

  const handleSubmit = async () => {
    if (!title.trim() && !content.trim()) return;

    try {
      const data = note
        ? await request(`/api/${note.id}`, 'PUT', { title: title.trim(), content: content.trim() })
        : await request('/api/notes', 'POST', { title: title.trim(), content: content.trim() });

      onSave(data);
      setTitle('');
      setContent('');
      setIsExpanded(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFocus = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  const handleCancel = () => {
    if (!note) {
      setTitle('');
      setContent('');
      setIsExpanded(false);
    }
  };

  const isEmpty = !title.trim() && !content.trim();

  return (
    <div className="w-full">
      {!isExpanded ? (
        // Collapsed State - Minimal Input
        <div 
          onClick={handleFocus}
          className="group cursor-text p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
        >
          <div className="flex items-center gap-3 text-gray-500 group-hover:text-gray-600">
            <FileText size={20} />
            <span className="text-lg">Take a note...</span>
          </div>
        </div>
      ) : (
        // Expanded State - Full Editor
        <div className="space-y-6">
          {/* Title Input */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Type size={16} />
              Title
            </label>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title..."
              className="w-full px-4 py-3 text-xl font-semibold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:bg-white transition-all"
            />
          </div>

          {/* Content Textarea */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FileText size={16} />
              Content
            </label>
            <textarea
              ref={contentRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note here..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:bg-white transition-all text-gray-800 leading-relaxed"
              style={{ minHeight: '200px' }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              {loading && (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </span>
              )}
            </div>
            
            <div className="flex gap-3">
              {!note && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              )}
              
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || isEmpty}
                className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow-md"
              >
                <Save size={16} />
                {loading ? 'Saving...' : note ? 'Update Note' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
