import { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import TermHeader from "../components/TermHeader";
import SkeletonLoader from "../components/SkeletonLoader";
import { api } from "../api";

export default function Learning() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [currentNote, setCurrentNote] = useState(null); // null if in list view
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  
  const fileInputRef = useRef(null);

  const loadNotes = async () => {
    try {
      const data = await api.getNotes();
      setNotes(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const handleCreateNew = () => {
    setCurrentNote({ _id: "new", title: "New Note", content: "# My Note\n\nStart typing..." });
    setEditTitle("New Note");
    setEditContent("# My Note\n\nStart typing...");
    setIsEditing(true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target.result;
      const title = file.name.replace(/\.md$/, '');
      try {
        setLoading(true);
        const newNote = await api.createNote({ title, content });
        await loadNotes();
        setCurrentNote(newNote);
        setIsEditing(false);
      } catch (e) {
        setError("Failed to upload note");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      let savedNote;
      if (currentNote._id === "new") {
        savedNote = await api.createNote({ title: editTitle, content: editContent });
      } else {
        savedNote = await api.updateNote(currentNote._id, { title: editTitle, content: editContent });
      }
      await loadNotes();
      setCurrentNote(savedNote);
      setIsEditing(false);
    } catch (e) {
      setError("Failed to save note");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    try {
      setLoading(true);
      await api.deleteNote(id);
      await loadNotes();
      setCurrentNote(null);
    } catch (e) {
      setError("Failed to delete note");
    } finally {
      setLoading(false);
    }
  };

  const openNote = (note) => {
    setCurrentNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setIsEditing(false);
  };

  if (loading && notes.length === 0) return <SkeletonLoader path="--learning" />;

  return (
    <div className="page">
      <TermHeader path={currentNote ? `--learning/${currentNote.title.replace(/\s+/g, '-').toLowerCase()}` : "--learning"} />
      
      {error && <div className="error-banner">{error}</div>}

      {!currentNote ? (
        // --- LIST VIEW ---
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h1 style={{ margin: 0 }}>Learning Hub</h1>
            <div>
              <button className="icon-btn" onClick={() => fileInputRef.current?.click()} title="Upload .md file">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              </button>
              <input type="file" accept=".md" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileUpload} />
              
              <button className="icon-btn" onClick={handleCreateNew} title="Create Note">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>
          </div>
          
          <div className="sub">Upload or write markdown notes here.</div>

          {notes.length === 0 ? (
            <div className="empty">No notes yet. Upload a .md file or create one.</div>
          ) : (
            notes.map((note) => (
              <div 
                key={note._id} 
                className="task" 
                onClick={() => openNote(note)}
                style={{ cursor: "pointer" }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: "14px", color: "var(--text)" }}>
                    {note.title}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--dim)", marginTop: "4px" }}>
                    Last updated: {new Date(note.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <button 
                  className="icon-btn" 
                  onClick={(e) => { e.stopPropagation(); handleDelete(note._id); }}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      ) : (
        // --- DETAIL VIEW ---
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <span className="back-link" style={{ margin: 0, cursor: "pointer" }} onClick={() => setCurrentNote(null)}>
              ‹ back
            </span>
            <div>
              {isEditing ? (
                <button className="status-pill active" onClick={handleSave} disabled={loading}>
                  {loading ? "saving..." : "save"}
                </button>
              ) : (
                <button className="status-pill" onClick={() => setIsEditing(true)}>
                  edit
                </button>
              )}
            </div>
          </div>

          {isEditing ? (
            <div>
              <div className="form-group">
                <input 
                  className="form-input" 
                  value={editTitle} 
                  onChange={(e) => setEditTitle(e.target.value)} 
                  placeholder="Note Title"
                />
              </div>
              <div className="form-group">
                <textarea 
                  className="form-textarea" 
                  style={{ minHeight: "300px", fontFamily: "var(--mono)", fontSize: "13px" }}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Markdown content..."
                />
              </div>
            </div>
          ) : (
            <div className="markdown-body">
              <h1 style={{ marginBottom: "16px", paddingBottom: "8px", borderBottom: "1px solid var(--border)" }}>
                {currentNote.title}
              </h1>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {currentNote.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
