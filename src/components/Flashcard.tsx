import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useStore, type Word } from '../store/useStore';
import { motion, type MotionValue } from 'framer-motion';

interface FlashcardProps {
  word: Word;
  overlayColor?: MotionValue<string>;
  isKanaMode?: boolean;
}

const Flashcard: React.FC<FlashcardProps> = ({ word, overlayColor, isKanaMode }) => {
  const [flipped, setFlipped] = useState(false);
  const showFurigana = useStore((state) => state.showFurigana);
  const toggleFurigana = useStore((state) => state.toggleFurigana);

  const handleFlip = () => {
    setFlipped(!flipped);
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="flashcard-container" onClick={handleFlip}>
        <div className={`flashcard ${flipped ? 'flipped' : ''}`}>

          {/* FRONT */}
          <div className="flashcard-face flashcard-front">
            {!isKanaMode && (
              <button
                className="icon-btn"
                onClick={(e) => { e.stopPropagation(); toggleFurigana(); }}
                style={{ position: 'absolute', top: '15px', right: '15px' }}
              >
                {showFurigana ? <Eye size={24} /> : <EyeOff size={24} />}
              </button>
            )}

            {!isKanaMode && (
              <div className={`furigana ${showFurigana ? 'visible' : ''}`}>
                {word.furigana}
              </div>
            )}

            <div className="word-original jp-font">
              {word.original || '—'}
            </div>
          </div>

          {/* BACK */}
          <div className="flashcard-face flashcard-back">
            <div className="furigana visible">
              {word.furigana}
            </div>

            <div className="word-original jp-font" style={{ fontSize: '3rem', marginBottom: '10px' }}>
              {word.original}
            </div>

            <div className="word-meaning">
              {word.pos && (
                <span style={{
                  display: 'inline-block',
                  fontSize: '0.8rem',
                  background: 'rgba(99, 102, 241, 0.1)',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  marginRight: '8px',
                  verticalAlign: 'middle',
                  color: 'var(--accent-color)',
                  fontWeight: 600
                }}>
                  {word.pos}
                </span>
              )}
              <span style={{ verticalAlign: 'middle' }}>{word.korean}</span>
            </div>

            <div className="word-english" style={{ fontSize: '1.2rem', marginTop: '12px' }}>
              {word.english}
            </div>
          </div>

        </div>
        {overlayColor && (
          <motion.div
            style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: overlayColor, borderRadius: '28px', pointerEvents: 'none',
              zIndex: 10
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Flashcard;
