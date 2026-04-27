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
  const [showFullMeaning, setShowFullMeaning] = useState(false);
  const showFurigana = useStore((state) => state.showFurigana);
  const toggleFurigana = useStore((state) => state.toggleFurigana);

  const isMeaningTruncated = word.korean && word.korean.split(',').length > 3;

  const truncateMeaning = (meaning: string) => {
    if (!meaning) return '';
    const parts = meaning.split(',');
    if (parts.length > 3) {
      return parts.slice(0, 3).join(', ') + '...';
    }
    return meaning;
  };

  const handleFlip = () => {
    setFlipped(!flipped);
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="flashcard-container" onClick={handleFlip}>
        <div className={`flashcard ${flipped ? 'flipped' : ''}`}>

          {/* FRONT */}
          <div className="flashcard-face flashcard-front">
            {!isKanaMode && word.type !== 'KANJI' && (
              <button
                className="icon-btn"
                onClick={(e) => { e.stopPropagation(); toggleFurigana(); }}
                style={{ position: 'absolute', top: '15px', right: '15px' }}
              >
                {showFurigana ? <Eye size={24} /> : <EyeOff size={24} />}
              </button>
            )}

            {!isKanaMode && word.type !== 'KANJI' && (
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
            {word.type === 'KANJI' ? (
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden', boxSizing: 'border-box' }}>
                {/* Header: Kanji & Main Meaning */}
                <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '15px', marginBottom: '15px', flexShrink: 0 }}>
                  <div className="word-original jp-font" style={{ fontSize: '3.5rem', lineHeight: 1, flexShrink: 0, minWidth: '70px', textAlign: 'center' }}>
                    {word.original}
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-color)', wordBreak: 'keep-all', textAlign: 'left' }}>
                      {showFullMeaning ? word.korean : truncateMeaning(word.korean)}
                    </div>
                    {isMeaningTruncated && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setShowFullMeaning(!showFullMeaning); }}
                        style={{ 
                          marginTop: '6px', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700,
                          background: 'rgba(0,0,0,0.04)', border: 'none', borderRadius: '12px', 
                          color: 'var(--text-secondary)', cursor: 'pointer'
                        }}
                      >
                        {showFullMeaning ? '▲ 접기' : '▼ 전체 뜻 보기'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Readings */}
                <div style={{ background: 'var(--card-bg)', borderRadius: '12px', padding: '12px', marginBottom: '15px', border: '1px solid var(--card-border)', flexShrink: 0 }}>
                  <div style={{ display: 'flex', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, width: '40px', color: 'var(--text-muted)' }}>훈독</span>
                    <span className="jp-font" style={{ flex: 1, fontSize: '0.95rem' }}>{word.kunyomi || '없음'}</span>
                  </div>
                  <div style={{ display: 'flex' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, width: '40px', color: 'var(--text-muted)' }}>음독</span>
                    <span className="jp-font" style={{ flex: 1, fontSize: '0.95rem' }}>{word.onyomi || '없음'}</span>
                  </div>
                </div>

                {/* Examples */}
                {word.examples && word.examples.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', flexShrink: 0 }}>대표 예문</div>
                    {word.examples.slice(0, 3).map((ex, idx) => (
                      <div key={idx} style={{ background: 'rgba(0,0,0,0.02)', padding: '10px', borderRadius: '8px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                          <span className="jp-font" style={{ fontSize: '1.1rem', fontWeight: 600 }}>{ex.word}</span>
                          <span className="jp-font" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{ex.reading}</span>
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{ex.meaning}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
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
              </>
            )}
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
