
import React, { useState } from 'react';
import './MediaGallery.css';
import { Project, Message } from '../../types';

interface MediaGalleryProps {
  project: Project;
  messages: Message[];
}

function MediaGallery({ project, messages }: MediaGalleryProps) {
  const [filter, setFilter] = useState<'all' | 'image' | 'video' | 'file'>('all');
  const [selectedMedia, setSelectedMedia] = useState<Message | null>(null);

  const filteredMessages = messages.filter(m => 
    filter === 'all' || m.type === filter
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="media-gallery">
      <div className="gallery-header">
        <h2>📁 Media - {project.name}</h2>
        <div className="filter-buttons">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            Tutti
          </button>
          <button
            className={filter === 'image' ? 'active' : ''}
            onClick={() => setFilter('image')}
          >
            🖼️ Immagini
          </button>
          <button
            className={filter === 'video' ? 'active' : ''}
            onClick={() => setFilter('video')}
          >
            🎥 Video
          </button>
          <button
            className={filter === 'file' ? 'active' : ''}
            onClick={() => setFilter('file')}
          >
            📎 File
          </button>
        </div>
      </div>

      <div className="gallery-content">
        {filteredMessages.length === 0 ? (
          <div className="no-media">
            <p>📭 Nessun media disponibile</p>
          </div>
        ) : (
          <div className="media-grid">
            {filteredMessages.map(message => (
              <div
                key={message.id}
                className="media-item"
                onClick={() => setSelectedMedia(message)}
              >
                {message.type === 'image' && message.mediaUrl && (
                  <img src={message.mediaUrl} alt={message.content} />
                )}

                {message.type === 'video' && message.mediaUrl && (
                  <div className="video-thumbnail">
                    <video src={message.mediaUrl} />
                    <div className="play-overlay">▶️</div>
                  </div>
                )}

                {message.type === 'file' && (
                  <div className="file-thumbnail">
                    <span className="file-icon">📎</span>
                    <span className="file-name">{message.content}</span>
                  </div>
                )}

                <div className="media-info">
                  <span className="media-sender">{message.senderName}</span>
                  <span className="media-date">{formatDate(message.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedMedia && (
        <div className="media-modal" onClick={() => setSelectedMedia(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setSelectedMedia(null)}>
              ✕
            </button>

            {selectedMedia.type === 'image' && selectedMedia.mediaUrl && (
              <img src={selectedMedia.mediaUrl} alt={selectedMedia.content} />
            )}

            {selectedMedia.type === 'video' && selectedMedia.mediaUrl && (
              <video controls src={selectedMedia.mediaUrl} />
            )}

            <div className="modal-info">
              <h3>{selectedMedia.content}</h3>
              <p>Inviato da {selectedMedia.senderName}</p>
              <p>{formatDate(selectedMedia.createdAt)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MediaGallery;
