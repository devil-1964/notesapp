import { useState, useEffect, useContext } from 'react';
import NoteList from '../components/NoteList';
import NoteEditor from '../components/NoteEditor';
import ShareModal from '../components/ShareModal';
import { Share2, Search, FileText, User, Settings, LogOut, ChevronDown, Plus } from 'lucide-react';
import useApi from '../hooks/useApi';
import { AuthContext } from '../contexts/AuthContext';

export default function Home() {
  const [selectedNote, setSelectedNote] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notes, setNotes] = useState([]);
  const { request } = useApi();
  const { user, isAuthenticated, logout } = useContext(AuthContext);

  // Transform 
  const displayUser = user ? {
    id: user.id,
    name: user.username,
    email: user.email,
    avatar: null,
    initials: user.username.substring(0, 2).toUpperCase(),
    created_at: user.created_at
  } : null;

  // Fetch notes from API
  const fetchNotes = async () => {
    try {
      const data = await request('/api/notes');
      setNotes(Array.isArray(data.notes) ? data.notes : []);
    } catch (err) {
      console.error('Failed to fetch notes:', err);
      if (err.message?.includes('401')) {
        window.location.href = '/login';
      }
      setNotes([]);
    }
  };

  // Load notes once on component mount
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotes();
    } else if (!isAuthenticated) {
      window.location.href = '/login';
    }
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    console.log('Logging out...');
    setShowProfileMenu(false);
    logout(); // Use the context logout function
    window.location.href = '/login';
  };

  const handleSaveNote = (updatedNote) => {
    setNotes(prevNotes =>
      prevNotes.map(note =>
        (note._id || note.id) === (updatedNote._id || updatedNote.id)
          ? {
            ...note,
            ...updatedNote,
            title: updatedNote.title || note.title,
            content: updatedNote.content || note.content,
            updated_at: updatedNote.updated_at || note.updated_at || new Date().toISOString()
          }
          : note
      )
    );

    // Update selected note if it's the current one
    if (selectedNote && (selectedNote._id || selectedNote.id) === (updatedNote._id || updatedNote.id)) {
      setSelectedNote(prev => ({
        ...prev,
        ...updatedNote
      }));
    }
  };

  const handleSave = (savedNote) => {
    handleSaveNote(savedNote); // Reuse the same logic
    fetchNotes(); // Optional: refresh the list if needed
  };

  // Handle delete note request from NoteItem (via NoteList)
  const handleDelete = (id) => {
    // Remove from local state
    setNotes(prevNotes => prevNotes.filter(note => (note._id || note.id) !== id));

    // Clear selection if the deleted note was selected
    if (selectedNote && (selectedNote._id === id || selectedNote.id === id)) {
      setSelectedNote(null);
    }
  };

  // Show loading if user data is not loaded yet
  if (!isAuthenticated || !displayUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-xl">
              <FileText className="text-purple-600" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notes</h1>
              <p className="text-gray-500 text-sm">Organize your thoughts</p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 lg:w-96">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors shadow-sm"
              />
            </div>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {displayUser.avatar ? (
                    <img src={displayUser.avatar} alt={displayUser.name} className="w-8 h-8 rounded-full" />
                  ) : (
                    displayUser.initials
                  )}
                </div>
                <ChevronDown size={16} className={`text-gray-500 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                        {displayUser.avatar ? (
                          <img src={displayUser.avatar} alt={displayUser.name} className="w-10 h-10 rounded-full" />
                        ) : (
                          displayUser.initials
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{displayUser.name}</p>
                        <p className="text-sm text-gray-500 truncate">{displayUser.email}</p>
                      </div>
                    </div>
                  </div>



                  <div className="border-t border-gray-100 py-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-red-50 transition-colors text-red-600"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Layout */}
        <div className=" grid grid-cols-1  lg:grid-cols-5 gap-8">
          {/* Note List Sidebar */}
          <div className="lg:col-span-2 max-md:order-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-900">All Notes</h2>
                </div>

                <button
                  onClick={() => { setSelectedNote(null); setIsExpanded(true); setSearchQuery(''); }}  // Clear selection and search
                  onMouseDown={(e) => e.preventDefault()}  // Prevent focus change
                  // Clear selection to create new note
                  className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white"
                  title="Create New Note"
                >
                  <Plus size={18} />
                </button>

              </div>

              {/* Notes List */}
              <div className="p-4 overflow-auto h-[calc(90vh-200px)]">                <NoteList
                  notes={notes}
                  onSelectNote={setSelectedNote}
                  onDeleteNote={handleDelete}
                  onSaveNote={handleSaveNote}
                  onShareNote={(note) => {
                    setSelectedNote(note);
                    setShowShareModal(true);
                  }}
                  searchQuery={searchQuery}
                />

              </div>
            </div>
          </div>

          {/* Editor Area */}
          <div className="lg:col-span-3 max-md:order-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-fit">
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedNote ? 'Edit Note' : 'Create Note'}
                  </h2>
                  {selectedNote && (
                    <span className="px-2 py-1 text-xs bg-purple-100 text-purple-600 rounded-md font-medium">
                      Editing
                    </span>
                  )}
                </div>

                {selectedNote && (
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors shadow-sm hover:shadow-md"
                    title="Share Note"
                  >
                    <Share2 size={18} />
                  </button>
                )}
              </div>

              <div className="p-6">
                <NoteEditor setIsExpanded={setIsExpanded} isExpanded={isExpanded} note={selectedNote} onSave={handleSave} />
              </div>
            </div>
          </div>
        </div>        {/* Share Modal */}
        {showShareModal && selectedNote && (
          <ShareModal
            noteId={selectedNote._id || selectedNote.id}
            onClose={() => setShowShareModal(false)}
          />
        )}
      </div>

      {/* Backdrop for closing profile menu */}
      {showProfileMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </div>
  );
}