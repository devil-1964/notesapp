import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useApi from '../hooks/useApi';
import { FileText, AlertCircle, Clock, Globe } from 'lucide-react';

export default function SharedNote() {
  const { token } = useParams();
  const [note, setNote] = useState(null);
  const { request, loading, error } = useApi();
  useEffect(() => {
    const fetchSharedNote = async () => {
      try {
        const data = await request(`/api/shared/${token}`);
        setNote(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSharedNote();
  }, [token, request]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading shared note...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="p-3 bg-red-100 rounded-full w-fit mx-auto mb-4">
              <AlertCircle size={32} className="text-red-600" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Unable to Load Note
            </h1>
            <p className="text-gray-600 mb-4">
              {error === 404 ? 
                'This note may have been deleted or the link has expired.' :
                'There was an error loading this shared note.'
              }
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!note) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Globe size={20} className="text-purple-600" />
            <span className="text-sm font-medium text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
              Shared Note
            </span>
          </div>
          <p className="text-gray-600 text-sm">
            This note has been shared with you
          </p>
        </div>

        
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          
          <div className="bg-gradient-to-r from-purple-50 to-purple-50 px-8 py-6 border-b border-gray-100">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <FileText size={24} className="text-purple-600" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {note.title || 'Untitled Note'}
                </h1>
                {note.updated_at && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={14} />
                    <span>
                      Last updated {new Date(note.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          
          <div className="p-8">
            {note.content ? (
              <div className="prose prose-gray max-w-none">
                <div className="text-gray-800 whitespace-pre-wrap leading-relaxed text-base">
                  {note.content}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">This note appears to be empty.</p>
              </div>
            )}
          </div>
        </div>

        
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Want to create your own notes? 
            <a href="/" className="text-purple-600 hover:text-purple-700 font-medium ml-1">
              Get started here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}


