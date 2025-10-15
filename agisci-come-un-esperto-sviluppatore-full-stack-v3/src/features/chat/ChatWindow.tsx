
import React, { useState, useRef, useEffect } from 'react';
import './ChatWindow.css';
import { Project, Message, User } from '../../types';

interface ChatWindowProps {
  project: Project;
  messages: Message[];
  currentUser: User;
  onSendMessage: (content: string, type?: Message['type'], mediaUrl?: string) => void;
}

function ChatWindow({ project, messages, currentUser, onSendMessage }: ChatWindowProps) {
  const [inputValue, setInputValue] = useState('');
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

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="project-header-info">
          <h2>{project.name}</h2>
          <p>{project.description}</p>
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
                    <img src={message.mediaUrl} alt={message.content} />
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

      <form className="message-input-container" onSubmit={handleSubmit}>
        <label className="file-upload-button" title="Carica file">
          📎
          <input
            type="file"
            accept="image/*,video/*,.pdf,.doc,.docx"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </label>
        
        <input
          type="text"
          className="message-input"
          placeholder="Scrivi un messaggio..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        
        <button type="submit" className="send-button" disabled={!inputValue.trim()}>
          ➤
        </button>
      </form>
    </div>
  );
}

export default ChatWindow;
