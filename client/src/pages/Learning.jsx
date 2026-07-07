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
  
  const [currentNote, setCurrentNote] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  
  const fileInputRef = useRef(null);

  // Quiz States
  const [quizScores, setQuizScores] = useState([]);
  const [quizData, setQuizData] = useState(null);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [isTakingQuiz, setIsTakingQuiz] = useState(false);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [isCheckingAnswer, setIsCheckingAnswer] = useState(false);
  
  const [customTopic, setCustomTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [quizTopic, setQuizTopic] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [notesData, scoresData] = await Promise.all([
        api.getNotes(),
        api.getQuizScores()
      ]);
      setNotes(notesData);
      setQuizScores(scoresData);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
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
        await loadData();
        setCurrentNote(newNote);
        setIsEditing(false);
      } catch (e) {
        setError("Failed to upload note");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
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
      await loadData();
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
      await loadData();
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

  const handleGenerateQuiz = async (topic, content) => {
    if (!topic) {
      setError("Please enter a topic.");
      return;
    }
    const count = parseInt(numQuestions) || 5;
    try {
      setLoading(true);
      setError(null);
      const data = await api.generateQuiz({ topic, content, numQuestions: count });
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("Received invalid quiz data.");
      }
      setQuizData(data);
      setQuizTopic(topic);
      setQuizIndex(0);
      setQuizScore(0);
      setIsTakingQuiz(true);
      setShowQuizResult(false);
      setSelectedOption("");
      setIsCheckingAnswer(false);
    } catch (e) {
      setError(e.message || "Failed to generate quiz.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = () => {
    if (!selectedOption) return;
    setIsCheckingAnswer(true);
    
    const correct = quizData[quizIndex].answer;
    if (selectedOption === correct) {
      setQuizScore(prev => prev + 1);
    }
    
    setTimeout(() => {
      if (quizIndex + 1 < quizData.length) {
        setQuizIndex(prev => prev + 1);
        setSelectedOption("");
        setIsCheckingAnswer(false);
      } else {
        handleQuizComplete(quizScore + (selectedOption === correct ? 1 : 0));
      }
    }, 1500);
  };

  const handleQuizComplete = async (finalScore) => {
    setShowQuizResult(true);
    setIsCheckingAnswer(false);
    try {
      await api.saveQuizScore({
        topic: quizTopic,
        score: finalScore,
        maxScore: quizData.length
      });
      const scoresData = await api.getQuizScores();
      setQuizScores(scoresData);
    } catch (e) {
      console.error("Failed to save quiz score:", e);
    }
  };

  const closeQuiz = () => {
    setIsTakingQuiz(false);
    setShowQuizResult(false);
    setQuizData(null);
  };

  if (loading && notes.length === 0 && !isTakingQuiz) return <SkeletonLoader path="--learning" />;

  // Quiz View
  if (isTakingQuiz) {
    if (showQuizResult) {
      return (
        <div className="page">
          <TermHeader path={`--quiz/${quizTopic.replace(/\s+/g, '-').toLowerCase()}/result`} />
          <div className="card" style={{ textAlign: "center" }}>
            <h1>Quiz Complete!</h1>
            <div className="sub">{quizTopic}</div>
            
            <div style={{ margin: "30px 0" }}>
              <div style={{ fontSize: "48px", fontFamily: "var(--mono)", color: "var(--green)" }}>
                {quizScore} <span style={{ fontSize: "24px", color: "var(--dim)" }}>/ {quizData.length}</span>
              </div>
              <div style={{ fontSize: "14px", color: "var(--dim)", marginTop: "10px" }}>
                {quizScore === quizData.length ? "Perfect score! Outstanding." : "Great effort! Keep reviewing."}
              </div>
            </div>

            <button className="submit-btn" onClick={closeQuiz}>Back to Notes</button>
          </div>
        </div>
      );
    }

    const currentQ = quizData[quizIndex];
    
    return (
      <div className="page">
        <TermHeader path={`--quiz/${quizTopic.replace(/\s+/g, '-').toLowerCase()}`} />
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", fontSize: "12px", fontFamily: "var(--mono)", color: "var(--dim)" }}>
            <span>Question {quizIndex + 1} of {quizData.length}</span>
            <span>Score: {quizScore}</span>
          </div>
          
          <h2 style={{ fontSize: "18px", lineHeight: 1.5, marginBottom: "24px" }}>{currentQ.question}</h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
            {currentQ.options.map((opt, i) => {
              let btnClass = "status-pill";
              let btnStyle = { padding: "14px", fontSize: "14px", textAlign: "left", height: "auto" };
              
              if (isCheckingAnswer) {
                if (opt === currentQ.answer) {
                  btnStyle.background = "var(--green-dim)";
                  btnStyle.borderColor = "var(--green)";
                  btnStyle.color = "var(--green)";
                } else if (opt === selectedOption && opt !== currentQ.answer) {
                  btnStyle.background = "#2d1a1a";
                  btnStyle.borderColor = "var(--red)";
                  btnStyle.color = "var(--red)";
                }
              } else if (opt === selectedOption) {
                btnClass += " active";
              }

              return (
                <button 
                  key={i} 
                  className={btnClass} 
                  style={btnStyle}
                  onClick={() => !isCheckingAnswer && setSelectedOption(opt)}
                  disabled={isCheckingAnswer}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          <button 
            className="submit-btn" 
            onClick={handleAnswerSubmit} 
            disabled={!selectedOption || isCheckingAnswer}
          >
            {isCheckingAnswer ? "Checking..." : (quizIndex + 1 === quizData.length ? "Finish Quiz" : "Next Question")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <TermHeader path={currentNote ? `--learning/${currentNote.title.replace(/\s+/g, '-').toLowerCase()}` : "--learning"} />
      
      {error && <div className="error-banner">{error}</div>}

      {!currentNote ? (
        // --- LIST VIEW ---
        <div>
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

          <div className="card plain">
            <h2 style={{ marginBottom: "12px" }}>Generate Custom Quiz</h2>
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              <input 
                className="form-input" 
                placeholder="Topic (e.g. OSI Model, Binary Trees)" 
                value={customTopic}
                onChange={e => setCustomTopic(e.target.value)}
              />
              <input 
                type="number"
                className="form-input" 
                placeholder="Q's"
                value={numQuestions}
                onChange={e => setNumQuestions(e.target.value)}
                style={{ width: "70px", padding: "8px", textAlign: "center" }}
                title="Number of questions (default 5)"
              />
            </div>
            <button 
              className="submit-btn" 
              onClick={() => handleGenerateQuiz(customTopic, "")}
              disabled={loading || !customTopic}
            >
              {loading ? "Generating..." : "Generate Custom Quiz"}
            </button>
          </div>

          {quizScores.length > 0 && (
            <div className="card plain">
              <h2 style={{ marginBottom: "12px" }}>Past Quiz Scores</h2>
              {quizScores.map(score => (
                <div key={score._id} className="score-card">
                  <div>
                    <div className="score-type">{score.topic}</div>
                    <div className="score-date">{score.date}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="score-value">{score.score} <span style={{fontSize: "12px", color: "var(--dim)"}}>/ {score.maxScore}</span></div>
                    <div className="score-pct">{Math.round((score.score / score.maxScore) * 100)}%</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // --- DETAIL VIEW ---
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <span className="back-link" style={{ margin: 0, cursor: "pointer" }} onClick={() => setCurrentNote(null)}>
              ‹ back
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              {!isEditing && (
                <>
                  <input 
                    type="number"
                    className="form-input" 
                    value={numQuestions}
                    onChange={e => setNumQuestions(e.target.value)}
                    style={{ width: "50px", height: "30px", minHeight: "30px", padding: "4px", textAlign: "center", fontSize: "12px" }}
                    title="Number of questions"
                  />
                  <button 
                    className="status-pill" 
                    onClick={() => handleGenerateQuiz(currentNote.title, currentNote.content)}
                    disabled={loading}
                  >
                    generate quiz
                  </button>
                </>
              )}
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
