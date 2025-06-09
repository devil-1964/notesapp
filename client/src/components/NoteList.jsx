import { useMemo } from 'react';
import NoteItem from './NoteItem';

export default function NoteList({  notes = [],
  onSelectNote,
  onDeleteNote,
  onSaveNote,
  onShareNote,
  searchQuery = ''
}) {

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    
    const query = searchQuery.toLowerCase();
    return notes.filter(note =>
      note.title?.toLowerCase().includes(query) ||
      note.content?.toLowerCase().includes(query)
    );
  }, [notes, searchQuery]);

  return (
    <div className="space-y-2">
      {filteredNotes.length > 0 ? (
        filteredNotes.map(note => (
          <NoteItem            key={note._id || note.id}
            note={note}
            onSelect={onSelectNote}
            onDelete={onDeleteNote}
            onSave={onSaveNote}
            onShare={onShareNote}
          />
        ))
      ) : (
        <div className="text-center text-gray-500">No notes found.</div>
      )}
    </div>
  );
}


