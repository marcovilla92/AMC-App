
import React, { useState, useRef, useEffect } from 'react';
import './ChatWindow.css';
import { Project, Message, User, TimeEntry } from '../../types';
import TimeTracker from './TimeTracker';
import ImageModal from '../../components/ImageModal';

interface ChatWindowProps {
  project: Project;
  messages: Message[];
  currentUser: User;
  onSendMessage: (content: string, type?: Message['type'], mediaUrl?: string) => void;
  onBack?: () => void;
}

function ChatWindow({ project, messages, currentUser, onSendMessage, onBack }: ChatWindowProps) {
  const [inputValue, setInputValue] = useState('');
  const [showTimeTracker, setShowTimeTracker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string; caption: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      let type: Message['type'] = 'file';
      
      if (file.type.startsWith('image/')) type = 'image';
      else if (file.type.startsWith('video/')) type = 'video';

      onSendMessage(file.name, type, result);
    };
    reader.readAsDataURL(file);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  };

  const handleCheckIn = (entry: TimeEntry) => {
    const message = `✅ ${entry.userName} ha iniziato a lavorare`;
    onSendMessage(message, 'text');
  };

  const handleCheckOut = (entry: TimeEntry) => {
    const message = `🛑 ${entry.userName} ha terminato il lavoro`;
    onSendMessage(message, 'text');
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        {onBack && (
          <button className="back-button" onClick={onBack} title="Indietro">
            ←
          </button>
        )}
        <div className="project-header-avatar">
          📊
        </div>
        <div className="project-header-info">
          <h2>{project.name}</h2>
          <p>{messages.length} messaggi</p>
        </div>
        <div className="header-actions">
          <button className="header-action-btn" title="Videocall">
            📹
          </button>
          <button className="header-action-btn" title="Info">
            ℹ️
          </button>
        </div>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>📭 Nessun messaggio. Inizia la conversazione!</p>
          </div>
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              className={`message ${
                message.senderId === currentUser.id ? 'own' : 'other'
              }`}
            >
              <div className="message-content">
                <div className="message-header">
                  <span className="sender-name">{message.senderName}</span>
                  <span className="message-time">{formatTime(message.createdAt)}</span>
                </div>

                {message.type === 'text' && (
                  <p className="message-text">{message.content}</p>
                )}

                {message.type === 'image' && message.mediaUrl && (
                  <div className="message-media">
                    <img
                      src={message.mediaUrl}
                      alt={message.content}
                      onClick={() => setSelectedImage({ url: message.mediaUrl!, caption: message.content })}
                      style={{ cursor: 'pointer' }}
                      title="Clicca per ingrandire"
                    />
                    <p className="media-caption">{message.content}</p>
                  </div>
                )}

                {message.type === 'video' && message.mediaUrl && (
                  <div className="message-media">
                    <video controls src={message.mediaUrl} />
                    <p className="media-caption">{message.content}</p>
                  </div>
                )}

                {message.type === 'file' && (
                  <div className="message-file">
                    <span className="file-icon">📎</span>
                    <span className="file-name">{message.content}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Time Tracker - sopra l'input */}
      {showTimeTracker && (
        <TimeTracker
          user={currentUser}
          project={project}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
        />
      )}

      <form className="message-input-container" onSubmit={handleSubmit}>
        <div className="input-actions-left">
          <button type="button" className="action-button" title="Emoji">
            😊
          </button>
          <label className="file-upload-button" title="Allega file">
            📎
            <input
              type="file"
              accept="image/*,video/*,.pdf,.doc,.docx"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>
          <button
            type="button"
            className="action-button time-tracker-toggle"
            onClick={() => setShowTimeTracker(!showTimeTracker)}
            title="Gestione Ore"
          >
            ⏱️
          </button>
        </div>

        <div className="message-input-wrapper">
          <input
            type="text"
            className="message-input"
            placeholder="Messaggio"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>

        <button type="submit" className="send-button" disabled={!inputValue.trim()}>
          {inputValue.trim() ? '➤' : '🎤'}
        </button>
      </form>

      {/* Modal per preview immagini */}
      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage.url}
          altText={selectedImage.caption}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}

export default ChatWindow;
