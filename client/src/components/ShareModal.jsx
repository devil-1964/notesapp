import { useState, useEffect, useCallback } from 'react';
import useApi from '../hooks/useApi';
import { X, Link2Off, Link2, Copy, Check, Share2, Globe, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ShareModal({ noteId, onClose }) {
  const [shareLink, setShareLink] = useState('');
  const [isRevoked, setIsRevoked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [shareCreatedAt, setShareCreatedAt] = useState(null);
  const { request, loading } = useApi();

  const fetchShareStatus = useCallback(async () => {
    if (!noteId) return;
    
    try {
      const data = await request(`/api/${noteId}/share`, 'GET');
      setIsShared(data.isShared);
      setShareLink(data.shareLink || '');
      setShareCreatedAt(data.createdAt);
      setIsRevoked(false);
    } catch (err) {
      console.error('Failed to fetch share status:', err);
      setIsShared(false);
      setShareLink('');
      setShareCreatedAt(null);
    }
  }, [noteId, request]);

    useEffect(() => {
    if (!noteId) {
      console.error('ShareModal: noteId is undefined');
      toast.error('Invalid note selected for sharing');
    } else {
      // Fetch share status when modal opens
      fetchShareStatus();
    }
  }, [noteId, fetchShareStatus]);  // Generate a shareable link for the note
  const generateLink = useCallback(async () => {
    if (!noteId) {
      toast.error('No note selected for sharing');
      return;
    }
    
    try {
      console.log('Generating share link for noteId:', noteId);
      const data = await request(`/api/${noteId}/share`, 'POST');
      setShareLink(data.shareLink);
      setIsShared(true);
      setIsRevoked(false);
      toast.success('Share link created!');
    } catch (err) {
      toast.error('Failed to create share link');
      console.error('Share link generation error:', err);
    }
  }, [noteId, request]);
  const revokeLink = useCallback(async () => {
    if (!noteId) {
      toast.error('No note selected for revoking');
      return;
    }
    
    try {
      await request(`/api/${noteId}/share`, 'DELETE');
      setIsRevoked(true);
      setIsShared(false);
      setShareLink('');
      setShareCreatedAt(null);
      toast.success('Share link revoked!');
    } catch (err) {
      toast.error('Failed to revoke share link');
      console.error('Share link revocation error:', err);
    }
  }, [noteId, request]);
  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
      console.error(err);
    }
  }, [shareLink]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Share2 size={18} className="text-purple-600" />
            </div>            <div>
              <h2 className="text-lg font-semibold text-gray-900">Share Note</h2>
              <p className="text-sm text-gray-600">
                {isShared ? 'Manage your shared note' : 'Create a public link to share'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>        <div className="p-6">
          {/* Share Status and Link Management */}
          {isShared && shareLink && !isRevoked ? (            <div className="space-y-6">
              {/* Status Indicator */}
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                <Check size={16} className="text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">Note is currently shared</p>
                  {shareCreatedAt && (
                    <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                      <Clock size={12} />
                      Shared {formatDate(shareCreatedAt)}
                    </p>
                  )}
                </div>
              </div>

              
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Share Link</label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 bg-transparent text-sm text-gray-700 focus:outline-none truncate"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Copy link"
                  >
                    {copied ? (
                      <Check size={16} className="text-green-600" />
                    ) : (
                      <Copy size={16} className="text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> Anyone with this link can view your note.
                  You can revoke access at any time.
                </p>
              </div>

              
              <div className="flex gap-3">
                <button
                  onClick={revokeLink}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Revoking...
                    </>
                  ) : (
                    <>
                      <Link2Off size={16} />
                      Revoke Link
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : !isShared && !isRevoked ? (
            /* Show generate link UI if note is not shared */
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="p-4 bg-purple-50 rounded-xl">
                  <Globe size={32} className="text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-700">
                    Generate a shareable link that anyone can access
                  </p>
                </div>
              </div>

              <button
                onClick={generateLink}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:bg-gray-400 transition-colors shadow-sm hover:shadow-md"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Link2 size={16} />
                    Generate Share Link
                  </>
                )}
              </button>
            </div>
          ) : isRevoked ? (
            /* Show revoked state */
            <div className="text-center space-y-6">
              <div className="p-4 bg-green-50 rounded-xl">
                <Check size={32} className="text-green-600 mx-auto mb-2" />
                <p className="text-sm text-green-800 font-medium">
                  Share link has been revoked successfully
                </p>
                <p className="text-sm text-green-700 mt-1">
                  The link is no longer accessible
                </p>
              </div>
              <button
                onClick={() => {
                  setIsRevoked(false);
                  setIsShared(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
              >
                <Link2 size={16} />
                Generate New Link
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}


