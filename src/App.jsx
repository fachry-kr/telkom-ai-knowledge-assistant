import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

const STORAGE_KEY = "telkom-ai-knowledge-chats-v1";
const THEME_KEY = "telkom-ai-theme";

const newChat = () => ({
  id: crypto.randomUUID(),
  title: "Percakapan baru",
  messages: [],
  updatedAt: new Date().toISOString()
});

function loadChats() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function loadTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved;
  } catch {
    /* ignore */
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/* ---------- Icons ---------- */
const ICONS = {
  plus: "M12 5v14M5 12h14",
  doc: "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h6",
  chat: "M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  trash: "M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v5M14 11v5",
  send: "M12 19V5M5 12l7-7 7 7",
  copy: "M9 9h10v12H9zM5 15V3h10",
  check: "M5 12l5 5L20 7",
  sun: "M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  moon: "M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z",
  menu: "M4 6h16M4 12h16M4 18h16",
  close: "M6 6l12 12M18 6L6 18",
  sparkle: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z",
  upload: "M12 16V4M7 9l5-5 5 5M4 20h16",
  book: "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 21V5",
  cpu: "M9 3v2M15 3v2M9 19v2M15 19v2M3 9h2M3 15h2M19 9h2M19 15h2M7 7h10v10H7z",
  globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18",
  code: "M8 8l-5 4 5 4M16 8l5 4-5 4M14 4l-4 16",
  layers: "M12 3l9 5-9 5-9-5zM3 13l9 5 9-5M3 17.5l9 5 9-5",
  info: "M12 8h.01M11 12h1v5h1M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z",
  chevron: "M9 6l6 6-6 6",
  panel: "M4 4h16v16H4zM15 4v16"
};

function Icon({ name, size = 18, stroke = 1.8 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={ICONS[name]} />
    </svg>
  );
}

/* ---------- Markdown code block with copy ---------- */
function Pre({ children }) {
  const ref = useRef(null);
  const [copied, setCopied] = useState(false);
  const className = children?.props?.className || "";
  const lang = (className.match(/language-([\w-]+)/) || [])[1] || "code";

  async function copy() {
    try {
      await navigator.clipboard.writeText(ref.current?.innerText || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="code-block">
      <div className="code-head">
        <span>{lang}</span>
        <button onClick={copy} type="button">
          <Icon name={copied ? "check" : "copy"} size={14} />
          {copied ? "Disalin" : "Salin"}
        </button>
      </div>
      <pre ref={ref}>{children}</pre>
    </div>
  );
}

const mdComponents = {
  pre: Pre,
  a: ({ node, ...props }) => <a {...props} target="_blank" rel="noreferrer" />
};

function Markdown({ children }) {
  return (
    <div className="markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={mdComponents}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

/* ---------- Message ---------- */
function Message({ message }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  async function copy() {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <article className={`msg ${message.role}`}>
      <div className="avatar">
        {isUser ? "FK" : <Icon name="sparkle" size={16} />}
      </div>
      <div className="msg-main">
        <div className="msg-author">{isUser ? "Kamu" : "Telkom AI"}</div>
        <div className="bubble">
          {isUser ? <p className="plain">{message.content}</p> : <Markdown>{message.content}</Markdown>}
        </div>

        {!isUser && message.sources?.length > 0 && (
          <details className="sources">
            <summary>
              <Icon name="book" size={15} />
              {message.sources.length} sumber dari knowledge base
              <Icon name="chevron" size={14} />
            </summary>
            <div className="source-list">
              {message.sources.map((source, index) => (
                <div className="source-item" key={`${source.name}-${index}`}>
                  <div className="source-top">
                    <b>{source.name}</b>
                    <span className="score">{Math.round((source.score || 0) * 100)}% relevan</span>
                  </div>
                  <p>{source.excerpt}…</p>
                </div>
              ))}
            </div>
          </details>
        )}

        {!isUser && (
          <div className="msg-actions">
            <button onClick={copy} type="button">
              <Icon name={copied ? "check" : "copy"} size={14} />
              {copied ? "Disalin" : "Salin"}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

/* ---------- App ---------- */
export default function App() {
  const [chats, setChats] = useState(loadChats);
  const [activeId, setActiveId] = useState(() => loadChats()[0]?.id || null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [useKnowledge, setUseKnowledge] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [theme, setTheme] = useState(loadTheme);
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 900);
  const [panelOpen, setPanelOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [health, setHealth] = useState({ state: "checking", model: "" });

  const fileRef = useRef(null);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  const activeChat = chats.find((chat) => chat.id === activeId) || null;
  const messages = activeChat?.messages || [];

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    } catch {
      /* ignore */
    }
  }, [chats]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  useEffect(() => {
    fetchDocuments();
    checkHealth();
    const timer = setInterval(checkHealth, 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, busy, activeId]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [input]);

  async function checkHealth() {
    try {
      const response = await fetch("/api/health");
      const data = await response.json();
      if (!response.ok) throw new Error();
      setHealth({
        state: data.ollamaConnected ? "online" : "offline",
        model: data.chatModel || ""
      });
    } catch {
      setHealth({ state: "offline", model: "" });
    }
  }

  async function fetchDocuments() {
    try {
      const response = await fetch("/api/documents");
      const data = await response.json();
      if (response.ok) setDocuments(data.documents || []);
    } catch {
      /* status ditampilkan lewat health */
    }
  }

  function updateChat(id, updater) {
    setChats((previous) =>
      previous.map((chat) =>
        chat.id === id ? { ...updater(chat), updatedAt: new Date().toISOString() } : chat
      )
    );
  }

  function closeDrawersOnMobile() {
    if (window.innerWidth <= 900) setSidebarOpen(false);
  }

  function createChat() {
    const chat = newChat();
    setChats((previous) => [chat, ...previous]);
    setActiveId(chat.id);
    setInput("");
    setError("");
    closeDrawersOnMobile();
    textareaRef.current?.focus();
  }

  function deleteChat(id) {
    const next = chats.filter((chat) => chat.id !== id);
    setChats(next);
    if (activeId === id) setActiveId(next[0]?.id || null);
  }

  async function sendMessage(text = input) {
    const content = text.trim();
    if (!content || busy) return;

    let chat = activeChat;
    if (!chat) {
      chat = newChat();
      setChats((previous) => [chat, ...previous]);
      setActiveId(chat.id);
    }

    const userMessage = { id: crypto.randomUUID(), role: "user", content };
    const priorMessages = chat.messages || [];

    updateChat(chat.id, (current) => ({
      ...current,
      title: current.messages.length ? current.title : content.slice(0, 42),
      messages: [...current.messages, userMessage]
    }));
    setInput("");
    setBusy(true);
    setError("");

    try {
      const history = priorMessages
        .slice(-10)
        .map(({ role, content: value }) => ({ role, content: value }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, history, useKnowledge })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Permintaan gagal.");

      const assistantMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.answer,
        sources: data.sources || []
      };
      updateChat(chat.id, (current) => ({
        ...current,
        messages: [...current.messages, assistantMessage]
      }));
    } catch (err) {
      setError(err.message || "Tidak dapat menghubungi server.");
    } finally {
      setBusy(false);
    }
  }

  async function uploadPdf(file) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setError("File harus berupa PDF.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/documents", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload gagal.");
      await fetchDocuments();
      setNotice(`“${data.name}” berhasil diindeks (${data.chunks} potongan teks).`);
      setPanelOpen(true);
    } catch (err) {
      setError(err.message || "Upload PDF gagal.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function removeDocument(id) {
    try {
      const response = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal menghapus dokumen.");
      await fetchDocuments();
    } catch (err) {
      setError(err.message);
    }
  }

  function onDrop(event) {
    event.preventDefault();
    setDragging(false);
    uploadPdf(event.dataTransfer.files?.[0]);
  }

  const suggestions = useMemo(
    () => [
      { icon: "cpu", title: "Large Language Model", text: "Jelaskan apa itu Large Language Model" },
      { icon: "globe", title: "REST API", text: "Bagaimana cara kerja REST API?" },
      { icon: "code", title: "React vs React Native", text: "Apa perbedaan React dan React Native?" },
      { icon: "layers", title: "Konsep RAG", text: "Jelaskan konsep RAG dengan bahasa sederhana" }
    ],
    []
  );

  const statusLabel =
    health.state === "online"
      ? health.model || "Online"
      : health.state === "checking"
      ? "Memeriksa…"
      : "Offline";

  return (
    <div
      className={`app ${dragging ? "dragging" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        if (e.dataTransfer.types?.includes("Files")) setDragging(true);
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setDragging(false);
      }}
      onDrop={onDrop}
    >
      {/* ===== Sidebar ===== */}
      <div className={`backdrop ${sidebarOpen || panelOpen ? "show" : ""}`} onClick={() => { setSidebarOpen(false); setPanelOpen(false); }} />

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">TK</div>
          <div className="brand-text">
            <strong>Telkom AI</strong>
            <small>Knowledge Assistant</small>
          </div>
          <button className="ghost-btn only-mobile" onClick={() => setSidebarOpen(false)} aria-label="Tutup sidebar">
            <Icon name="close" />
          </button>
        </div>

        <button className="new-chat" onClick={createChat}>
          <Icon name="plus" size={18} /> Percakapan baru
        </button>

        <nav className="nav">
          <div className="nav-label">Workspace</div>
          <button className="nav-item active" onClick={closeDrawersOnMobile}>
            <Icon name="sparkle" /> AI Assistant
          </button>
          <button className="nav-item" onClick={() => { setPanelOpen(true); closeDrawersOnMobile(); }}>
            <Icon name="doc" /> Knowledge documents
            {documents.length > 0 && <span className="pill">{documents.length}</span>}
          </button>
        </nav>

        <div className="history">
          <div className="nav-label">Riwayat</div>
          {chats.length === 0 ? (
            <p className="empty-history">Percakapan kamu akan muncul di sini.</p>
          ) : (
            chats.map((chat) => (
              <div className={`history-item ${chat.id === activeId ? "selected" : ""}`} key={chat.id}>
                <button
                  className="history-main"
                  onClick={() => { setActiveId(chat.id); closeDrawersOnMobile(); }}
                  title={chat.title}
                >
                  <Icon name="chat" size={16} />
                  <span>{chat.title}</span>
                </button>
                <button className="history-del" onClick={() => deleteChat(chat.id)} aria-label="Hapus percakapan" title="Hapus">
                  <Icon name="trash" size={15} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="sidebar-foot">
          <div className="me">FK</div>
          <div>
            <strong>Workspace</strong>
            <small>Personal prototype</small>
          </div>
        </div>
      </aside>

      {/* ===== Main ===== */}
      <main className="main">
        <header className="topbar">
          <div className="topbar-left">
            <button className="ghost-btn" onClick={() => setSidebarOpen((v) => !v)} aria-label="Buka/tutup sidebar">
              <Icon name="menu" />
            </button>
            <div className="crumbs">
              <span>Workspace</span>
              <i>/</i>
              <strong>{activeChat && activeChat.messages.length ? activeChat.title : "AI Assistant"}</strong>
            </div>
          </div>
          <div className="topbar-right">
            <div className={`status ${health.state}`} title="Status layanan AI lokal">
              <span className="dot" />
              {statusLabel}
            </div>
            <button className="ghost-btn" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Ganti tema" title="Ganti tema">
              <Icon name={theme === "dark" ? "sun" : "moon"} />
            </button>
            <button className="ghost-btn panel-toggle" onClick={() => setPanelOpen((v) => !v)} aria-label="Knowledge base" title="Knowledge base">
              <Icon name="panel" />
            </button>
          </div>
        </header>

        <div className="body">
          <section className="chat">
            <div className="messages">
              <div className="messages-inner">
                {messages.length === 0 ? (
                  <div className="welcome">
                    <div className="welcome-mark">
                      <Icon name="sparkle" size={30} />
                    </div>
                    <span className="eyebrow">Knowledge Management</span>
                    <h1>
                      Apa yang ingin kamu <span>pahami hari ini?</span>
                    </h1>
                    <p>
                      Tanyakan apa saja, atau unggah dokumen PDF agar jawaban AI didasarkan pada pengetahuan milikmu.
                    </p>

                    <div className="suggestions">
                      {suggestions.map((item) => (
                        <button key={item.title} onClick={() => sendMessage(item.text)}>
                          <span className="s-icon"><Icon name={item.icon} size={18} /></span>
                          <span className="s-text">
                            <b>{item.title}</b>
                            <small>{item.text}</small>
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((message) => <Message key={message.id} message={message} />)
                )}

                {busy && (
                  <article className="msg assistant">
                    <div className="avatar"><Icon name="sparkle" size={16} /></div>
                    <div className="msg-main">
                      <div className="msg-author">Telkom AI</div>
                      <div className="typing"><i /><i /><i /><span>Sedang berpikir…</span></div>
                    </div>
                  </article>
                )}
                <div ref={bottomRef} />
              </div>
            </div>

            <div className="composer-zone">
              {error && (
                <div className="banner error" role="alert">
                  <Icon name="info" size={16} />
                  <span>{error}</span>
                  <button onClick={() => setError("")} aria-label="Tutup"><Icon name="close" size={14} /></button>
                </div>
              )}
              {notice && (
                <div className="banner ok" role="status">
                  <Icon name="check" size={16} />
                  <span>{notice}</span>
                  <button onClick={() => setNotice("")} aria-label="Tutup"><Icon name="close" size={14} /></button>
                </div>
              )}

              <div className="composer">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                      event.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Tanyakan sesuatu tentang knowledge base kamu…"
                  rows={1}
                />
                <div className="composer-bar">
                  <div className="composer-tools">
                    <button type="button" className="tool" onClick={() => fileRef.current?.click()} disabled={uploading}>
                      <Icon name="upload" size={16} /> {uploading ? "Memproses…" : "Lampirkan PDF"}
                    </button>
                    <label className={`switch ${useKnowledge ? "on" : ""}`}>
                      <input type="checkbox" checked={useKnowledge} onChange={(e) => setUseKnowledge(e.target.checked)} />
                      <span className="track"><span className="thumb" /></span>
                      Gunakan knowledge base
                    </label>
                  </div>
                  <button className="send" onClick={() => sendMessage()} disabled={!input.trim() || busy} aria-label="Kirim">
                    <Icon name="send" size={18} stroke={2.2} />
                  </button>
                </div>
              </div>
              <p className="disclaimer">AI bisa saja keliru. Periksa kembali informasi penting dengan sumber tepercaya.</p>
            </div>
          </section>

          {/* ===== Right panel ===== */}
          <aside className={`panel ${panelOpen ? "open" : ""}`}>
            <div className="panel-head only-mobile">
              <strong>Knowledge base</strong>
              <button className="ghost-btn" onClick={() => setPanelOpen(false)} aria-label="Tutup panel"><Icon name="close" /></button>
            </div>

            <div className="card">
              <div className="card-title">
                <span className="c-icon"><Icon name="book" size={17} /></span>
                <strong>Knowledge base</strong>
                <span className="badge">{documents.length}</span>
              </div>
              <p className="muted">Dokumen PDF yang menjadi sumber jawaban AI.</p>

              <button className="dropzone" onClick={() => fileRef.current?.click()} disabled={uploading}>
                <Icon name="upload" size={20} />
                <b>{uploading ? "Memproses PDF…" : "Upload PDF"}</b>
                <small>Klik atau seret file ke mana saja · maks 12 MB</small>
              </button>
              <input ref={fileRef} type="file" accept="application/pdf,.pdf" hidden onChange={(e) => uploadPdf(e.target.files?.[0])} />

              <div className="doc-list">
                {documents.length === 0 ? (
                  <div className="no-docs">
                    <Icon name="doc" size={26} />
                    <p>Belum ada dokumen</p>
                    <small>Upload PDF untuk mengaktifkan RAG.</small>
                  </div>
                ) : (
                  documents.map((doc) => (
                    <div className="doc" key={doc.id}>
                      <div className="pdf-badge">PDF</div>
                      <div className="doc-info">
                        <strong title={doc.name}>{doc.name}</strong>
                        <small>{doc.chunks} potongan teks</small>
                      </div>
                      <button onClick={() => removeDocument(doc.id)} aria-label={`Hapus ${doc.name}`} title="Hapus dokumen">
                        <Icon name="trash" size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="storage"><span className="dot warn" /> Penyimpanan demo · hanya di memori server</div>
            </div>

            <div className="card">
              <div className="card-title">
                <span className="c-icon amber"><Icon name="sparkle" size={17} /></span>
                <strong>Tips jawaban lebih baik</strong>
              </div>
              <ul className="tips">
                <li>Ajukan pertanyaan yang spesifik.</li>
                <li>Unggah dokumen PDF yang relevan.</li>
                <li>Sebutkan bagian dokumen yang ingin dianalisis.</li>
              </ul>
            </div>
          </aside>
        </div>
      </main>

      {dragging && (
        <div className="drop-overlay">
          <div>
            <Icon name="upload" size={34} />
            <strong>Lepaskan PDF untuk menambahkan ke knowledge base</strong>
          </div>
        </div>
      )}
    </div>
  );
}
