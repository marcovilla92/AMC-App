import React, { useEffect } from 'react';
import './ImageModal.css';

interface ImageModalProps {
  imageUrl: string;
  altText?: string;
  onClose: () => void;
}

function ImageModal({ imageUrl, altText, onClose }: ImageModalProps) {
  useEffect(() => {
    // Blocca scroll quando modal è aperto
    document.body.style.overflow = 'hidden';

    // Chiudi con ESC
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div className="image-modal-overlay" onClick={onClose}>
      <div className="image-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="image-modal-close" onClick={onClose} title="Chiudi (ESC)">
          ✕
        </button>

        <div className="image-modal-content">
          <img
            src={imageUrl}
            alt={altText || 'Immagine ingrandita'}
            className="image-modal-img"
          />
        </div>

        <div className="image-modal-caption">
          {altText && <p>{altText}</p>}
          <p className="image-modal-hint">Clicca fuori o premi ESC per chiudere</p>
        </div>
      </div>
    </div>
  );
}

export default ImageModal;
