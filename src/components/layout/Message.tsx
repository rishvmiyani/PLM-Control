import { useState, useRef, useEffect } from "react";

interface Message {
  id: number;
  from: string;
  avatar: string;
  text: string;
  time: string;
  isSent: boolean;
}

interface Conversation {
  id: number;
  loginId: string;
  avatar: string;
  lastMessage: string;
  time: string;
  messages: Message[];
}

const initialConversations: Conversation[] = [
  {
    id: 1,
    loginId: "@alex_dev",
    avatar: "https://i.pravatar.cc/40?img=1",
    lastMessage: "Hey, did you check the latest PR?",
    time: "10:42 AM",
    messages: [
      { id: 1, from: "@alex_dev", avatar: "https://i.pravatar.cc/40?img=1", text: "Hey, did you check the latest PR?", time: "10:40 AM", isSent: false },
      { id: 2, from: "@alex_dev", avatar: "https://i.pravatar.cc/40?img=1", text: "It's been merged. Let me know your thoughts!", time: "10:42 AM", isSent: false },
    ],
  },
  {
    id: 2,
    loginId: "@sara_ux",
    avatar: "https://i.pravatar.cc/40?img=5",
    lastMessage: "The new designs look amazing 🎨",
    time: "9:15 AM",
    messages: [
      { id: 1, from: "@sara_ux", avatar: "https://i.pravatar.cc/40?img=5", text: "The new designs look amazing 🎨", time: "9:15 AM", isSent: false },
    ],
  },
  {
    id: 3,
    loginId: "@mike_ops",
    avatar: "https://i.pravatar.cc/40?img=8",
    lastMessage: "Server is back online ✅",
    time: "Yesterday",
    messages: [
      { id: 1, from: "@mike_ops", avatar: "https://i.pravatar.cc/40?img=8", text: "We had a brief outage", time: "Yesterday", isSent: false },
      { id: 2, from: "@mike_ops", avatar: "https://i.pravatar.cc/40?img=8", text: "Server is back online ✅", time: "Yesterday", isSent: false },
    ],
  },
];

export default function MessagingWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [toField, setToField] = useState("");
  const [messageText, setMessageText] = useState("");
  const [fromField] = useState("@you");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv?.messages]);

  const handleSend = () => {
    if (!messageText.trim()) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newMsg: Message = {
      id: Date.now(),
      from: fromField,
      avatar: "https://i.pravatar.cc/40?img=12",
      text: messageText.trim(),
      time,
      isSent: true,
    };

    if (activeConv) {
      const updated = conversations.map((c) =>
        c.id === activeConv.id
          ? { ...c, messages: [...c.messages, newMsg], lastMessage: messageText.trim(), time }
          : c
      );
      setConversations(updated);
      setActiveConv(updated.find((c) => c.id === activeConv.id) || null);
    } else if (toField.trim()) {
      const newConv: Conversation = {
        id: Date.now(),
        loginId: toField.trim(),
        avatar: `https://i.pravatar.cc/40?img=${Math.floor(Math.random() * 20) + 1}`,
        lastMessage: messageText.trim(),
        time,
        messages: [newMsg],
      };
      setConversations([newConv, ...conversations]);
      setActiveConv(newConv);
    }
    setMessageText("");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; min-height: 100vh; }

        .demo-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f3eafc 0%, #e8daf5 100%);
        }
        .demo-hint {
          font-family: 'Syne', sans-serif;
          color: #8b3b9e;
          opacity: 0.45;
          font-size: 15px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        /* Footer — single FAB, bottom-right */
        .footer-fab {
          position: fixed;
          bottom: 24px;
          right: 28px;
          z-index: 100;
        }
        .msg-fab-btn {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #8b3b9e;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 22px rgba(139,59,158,0.42);
          transition: transform 0.18s cubic-bezier(.34,1.56,.64,1), box-shadow 0.18s;
        }
        .msg-fab-btn:hover {
          transform: scale(1.1) translateY(-2px);
          box-shadow: 0 10px 30px rgba(139,59,158,0.52);
        }
        .msg-fab-btn:active { transform: scale(0.95); }

        /* Popup */
        .msg-popup {
          position: fixed;
          bottom: 94px;
          right: 24px;
          width: 370px;
          max-height: 560px;
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 24px 64px rgba(139,59,158,0.18), 0 2px 12px rgba(0,0,0,0.07);
          z-index: 200;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: popIn 0.22s cubic-bezier(.34,1.56,.64,1);
          border: 1px solid #ecdff5;
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.88) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        .popup-header {
          background: linear-gradient(135deg, #8b3b9e 0%, #a855c8 100%);
          padding: 16px 18px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .popup-title {
          font-family: 'Syne', sans-serif;
          color: #fff;
          font-size: 17px;
          letter-spacing: 0.03em;
        }
        .popup-close {
          background: rgba(255,255,255,0.18);
          border: none;
          cursor: pointer;
          color: #fff;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          transition: background 0.15s;
        }
        .popup-close:hover { background: rgba(255,255,255,0.32); }

        .field-row {
          display: flex;
          align-items: center;
          padding: 8px 16px;
          border-bottom: 1px solid #f3eafc;
          gap: 8px;
        }
        .field-label {
          font-size: 11px;
          font-weight: 600;
          color: #8b3b9e;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          min-width: 36px;
        }
        .field-input {
          flex: 1;
          border: none;
          outline: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: #2a1535;
          background: transparent;
        }
        .field-input::placeholder { color: #c4aad0; }

        .conv-list { flex: 1; overflow-y: auto; padding: 8px 0; }
        .conv-list::-webkit-scrollbar { width: 4px; }
        .conv-list::-webkit-scrollbar-thumb { background: #dcc8ea; border-radius: 4px; }

        .conv-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px 16px;
          cursor: pointer;
          transition: background 0.12s;
          border-radius: 10px;
          margin: 2px 8px;
        }
        .conv-item:hover { background: #f8f0fd; }

        .avatar { width: 38px; height: 38px; border-radius: 50%; object-fit: cover; border: 2px solid #dcc8ea; flex-shrink: 0; }
        .conv-meta { flex: 1; min-width: 0; }
        .conv-login { font-size: 13px; font-weight: 600; color: #2a1535; margin-bottom: 2px; }
        .conv-preview { font-size: 12px; color: #8b7099; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .conv-time { font-size: 10px; color: #b89dc8; white-space: nowrap; margin-top: 2px; }

        .chat-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          border-bottom: 1px solid #f3eafc;
          background: #fdf8ff;
        }
        .back-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #8b3b9e;
          font-size: 18px;
          padding: 2px 4px;
          border-radius: 6px;
          transition: background 0.12s;
        }
        .back-btn:hover { background: #f3eafc; }
        .chat-login { font-weight: 600; font-size: 14px; color: #2a1535; }
        .chat-status { font-size: 11px; color: #8b3b9e; }

        .messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: #fdf8ff;
        }
        .messages-area::-webkit-scrollbar { width: 3px; }
        .messages-area::-webkit-scrollbar-thumb { background: #dcc8ea; border-radius: 4px; }

        .msg-row { display: flex; align-items: flex-end; gap: 7px; }
        .msg-row.sent { flex-direction: row-reverse; }
        .msg-avatar { width: 28px; height: 28px; border-radius: 50%; object-fit: cover; border: 1.5px solid #dcc8ea; flex-shrink: 0; }
        .msg-bubble-wrap { display: flex; flex-direction: column; max-width: 72%; }
        .sent .msg-bubble-wrap { align-items: flex-end; }
        .msg-sender { font-size: 10px; color: #b89dc8; margin-bottom: 2px; font-weight: 500; }
        .msg-bubble { padding: 8px 13px; border-radius: 16px; font-size: 13px; line-height: 1.45; word-break: break-word; }
        .received .msg-bubble { background: #fff; color: #2a1535; border: 1px solid #ecdff5; border-bottom-left-radius: 4px; box-shadow: 0 1px 4px rgba(139,59,158,0.07); }
        .sent .msg-bubble { background: linear-gradient(135deg, #8b3b9e, #a855c8); color: #fff; border-bottom-right-radius: 4px; }
        .msg-time { font-size: 10px; color: #c4aad0; margin-top: 3px; }

        .compose-bar { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-top: 1px solid #f3eafc; background: #fff; }
        .compose-input {
          flex: 1;
          border: 1.5px solid #ecdff5;
          border-radius: 20px;
          padding: 8px 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: #2a1535;
          outline: none;
          transition: border-color 0.15s;
          background: #fdf8ff;
        }
        .compose-input:focus { border-color: #8b3b9e; }
        .compose-input::placeholder { color: #c4aad0; }

        .send-btn {
          width: 38px; height: 38px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8b3b9e, #a855c8);
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 10px rgba(139,59,158,0.3);
          transition: transform 0.15s, box-shadow 0.15s;
          flex-shrink: 0;
        }
        .send-btn:hover { transform: scale(1.08); box-shadow: 0 4px 16px rgba(139,59,158,0.4); }
        .send-btn:active { transform: scale(0.94); }
        .send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
      `}</style>

      {/* Background page */}
      <div className="demo-page">
        <span className="demo-hint">Click the message icon →</span>
      </div>

      {/* Popup */}
      {isOpen && (
        <div className="msg-popup">
          <div className="popup-header">
            <span className="popup-title">{activeConv ? activeConv.loginId : "Messages"}</span>
            <button className="popup-close" onClick={() => { if (activeConv) setActiveConv(null); else setIsOpen(false); }}>
              {activeConv ? "←" : "✕"}
            </button>
          </div>

          {!activeConv ? (
            <>
              <div className="field-row">
                <span className="field-label">From</span>
                <input className="field-input" value={fromField} readOnly style={{ color: "#8b3b9e", fontWeight: 600 }} />
              </div>
              <div className="field-row">
                <span className="field-label">To</span>
                <input className="field-input" placeholder="@username" value={toField} onChange={(e) => setToField(e.target.value)} />
              </div>
              <div className="conv-list">
                {conversations.map((c) => (
                  <div key={c.id} className="conv-item" onClick={() => { setActiveConv(c); setToField(c.loginId); }}>
                    <img src={c.avatar} className="avatar" alt={c.loginId} />
                    <div className="conv-meta">
                      <div className="conv-login">{c.loginId}</div>
                      <div className="conv-preview">{c.lastMessage}</div>
                    </div>
                    <div className="conv-time">{c.time}</div>
                  </div>
                ))}
              </div>
              <div className="compose-bar">
                <input className="compose-input" placeholder="Type a message…" value={messageText} onChange={(e) => setMessageText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} />
                <button className="send-btn" onClick={handleSend} disabled={!messageText.trim() || !toField.trim()}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="chat-header">
                <button className="back-btn" onClick={() => setActiveConv(null)}>←</button>
                <img src={activeConv.avatar} className="msg-avatar" alt={activeConv.loginId} style={{ width: 34, height: 34 }} />
                <div>
                  <div className="chat-login">{activeConv.loginId}</div>
                  <div className="chat-status">● Active now</div>
                </div>
              </div>
              <div className="messages-area">
                {activeConv.messages.map((msg) => (
                  <div key={msg.id} className={`msg-row ${msg.isSent ? "sent" : "received"}`}>
                    {!msg.isSent && <img src={msg.avatar} className="msg-avatar" alt={msg.from} />}
                    <div className="msg-bubble-wrap">
                      {!msg.isSent && <div className="msg-sender">{msg.from}</div>}
                      <div className="msg-bubble">{msg.text}</div>
                      <div className="msg-time">{msg.time}</div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="compose-bar">
                <input className="compose-input" placeholder={`Message ${activeConv.loginId}…`} value={messageText} onChange={(e) => setMessageText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} autoFocus />
                <button className="send-btn" onClick={handleSend} disabled={!messageText.trim()}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Footer — message FAB only */}
      <div className="footer-fab">
        <button className="msg-fab-btn" onClick={() => setIsOpen((v) => !v)} title="Open Messages">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </>
  );
}