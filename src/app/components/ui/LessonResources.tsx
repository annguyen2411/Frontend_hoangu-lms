import { useState } from 'react';
import { 
  Download, FileText, Headphones, File, Link as LinkIcon,
  Play, Edit3, Save, Plus, Trash2, FolderOpen
} from 'lucide-react';

interface Resource {
  id: string;
  type: 'pdf' | 'audio' | 'video' | 'link' | 'document';
  title: string;
  url: string;
  size?: string;
}

interface UserNote {
  id: string;
  content: string;
  timestamp: number;
  created_at: string;
}

interface LessonResourcesProps {
  resources: Resource[];
  lessonId: string;
  userNotes?: UserNote[];
  onSaveNote?: (content: string) => Promise<void>;
  onDeleteNote?: (noteId: string) => Promise<void>;
}

export function LessonResources({ resources, lessonId, userNotes = [], onSaveNote, onDeleteNote }: LessonResourcesProps) {
  const [notes, setNotes] = useState(userNotes);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const groupedResources = resources.reduce((acc, resource) => {
    if (!acc[resource.type]) acc[resource.type] = [];
    acc[resource.type].push(resource);
    return acc;
  }, {} as Record<string, Resource[]>);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    if (onSaveNote) {
      await onSaveNote(newNote);
    } else {
      const note: UserNote = {
        id: Date.now().toString(),
        content: newNote,
        timestamp: Date.now(),
        created_at: new Date().toISOString()
      };
      setNotes(prev => [...prev, note]);
    }
    setNewNote('');
    setIsAddingNote(false);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (onDeleteNote) {
      await onDeleteNote(noteId);
    } else {
      setNotes(prev => prev.filter(n => n.id !== noteId));
    }
  };

  const startEditing = (note: UserNote) => {
    setEditingNote(note.id);
    setEditContent(note.content);
  };

  const saveEdit = async () => {
    if (!editContent.trim() || !editingNote) return;
    
    if (onSaveNote) {
      await onSaveNote(editContent);
    } else {
      setNotes(prev => prev.map(n => n.id === editingNote ? { ...n, content: editContent } : n));
    }
    setEditingNote(null);
    setEditContent('');
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="h-5 w-5 text-red-400" />;
      case 'audio': return <Headphones className="h-5 w-5 text-pink-400" />;
      case 'video': return <Play className="h-5 w-5 text-purple-400" />;
      case 'link': return <LinkIcon className="h-5 w-5 text-blue-400" />;
      default: return <File className="h-5 w-5 text-white/60" />;
    }
  };

  const getResourceColor = (type: string) => {
    switch (type) {
      case 'pdf': return 'bg-red-500/20 hover:bg-red-500/30 border-red-500/30';
      case 'audio': return 'bg-pink-500/20 hover:bg-pink-500/30 border-pink-500/30';
      case 'video': return 'bg-purple-500/20 hover:bg-purple-500/30 border-purple-500/30';
      case 'link': return 'bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/30';
      default: return 'bg-white/5 hover:bg-white/10 border-white/10';
    }
  };

  return (
    <div className="space-y-6">
      {/* Resources Section */}
      {resources.length > 0 && (
        <div>
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-purple-400" />
            Tài nguyên bài học
          </h3>
          
          {Object.entries(groupedResources).map(([type, items]) => (
            <div key={type} className="mb-4">
              <p className="text-white/50 text-sm mb-2 uppercase tracking-wider">{type}</p>
              <div className="grid gap-2">
                {items.map((resource) => (
                  <a
                    key={resource.id}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${getResourceColor(resource.type)}`}
                  >
                    <div className="flex items-center gap-3">
                      {getResourceIcon(resource.type)}
                      <div>
                        <p className="text-white font-medium">{resource.title}</p>
                        {resource.size && (
                          <p className="text-white/40 text-xs">{resource.size}</p>
                        )}
                      </div>
                    </div>
                    <Download className="h-4 w-4 text-white/40" />
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notes Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Edit3 className="h-5 w-5 text-purple-400" />
            Ghi chú của tôi
          </h3>
          <button
            onClick={() => setIsAddingNote(true)}
            className="p-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {isAddingNote && (
          <div className="mb-4 p-4 bg-slate-800/50 rounded-lg border border-purple-500/30">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Viết ghi chú..."
              className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              rows={3}
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => { setIsAddingNote(false); setNewNote(''); }}
                className="px-3 py-1.5 text-white/60 hover:text-white transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleAddNote}
                className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition-colors"
              >
                <Save className="h-4 w-4" /> Lưu
              </button>
            </div>
          </div>
        )}

        {notes.length === 0 && !isAddingNote ? (
          <div className="text-center py-8 text-white/40">
            <Edit3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Chưa có ghi chú</p>
            <p className="text-sm mt-1">Click + để thêm ghi chú</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="p-4 bg-slate-800/30 rounded-lg border border-white/5">
                {editingNote === note.id ? (
                  <div>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex justify-end gap-2 mt-3">
                      <button
                        onClick={() => setEditingNote(null)}
                        className="px-3 py-1.5 text-white/60 hover:text-white transition-colors"
                      >
                        Hủy
                      </button>
                      <button
                        onClick={saveEdit}
                        className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                      >
                        Lưu
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-white/80 whitespace-pre-wrap">{note.content}</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                      <span className="text-white/40 text-xs">
                        {new Date(note.created_at).toLocaleDateString('vi-VN')}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditing(note)}
                          className="p-1.5 rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1.5 rounded hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
