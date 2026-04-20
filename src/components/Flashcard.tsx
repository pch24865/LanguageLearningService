import React, { useState } from 'react';
import { Eye, EyeOff, X, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore, type Word } from '../store/useStore';

interface FlashcardProps {
  word: Word;
  mode: 'STUDY' | 'TEST';
  isFirst: boolean;
  onNextTest: (knewIt: boolean) => void;
  onNextStudy: () => void;
  onPrevStudy: () => void;
}

const Flashcard: React.FC<FlashcardProps> = ({ word, mode, isFirst, onNextTest, onNextStudy, onPrevStudy }) => {
  const [flipped, setFlipped] = useState(false);
  const showFurigana = useStore((state) => state.showFurigana);
  const toggleFurigana = useStore((state) => state.toggleFurigana);

  const handleFlip = () => {
    setFlipped(!flipped);
  };

  const handleAction = (e: React.MouseEvent, knewIt: boolean) => {
    e.stopPropagation(); 
    setFlipped(false);
    onNextTest(knewIt);
  };

  const handleStudyAction = (e: React.MouseEvent, direction: 'PREV' | 'NEXT') => {
    e.stopPropagation();
    setFlipped(false);
    if (direction === 'PREV') onPrevStudy();
    if (direction === 'NEXT') onNextStudy();
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="flashcard-container" onClick={handleFlip}>
        <div className={`flashcard ${flipped ? 'flipped' : ''}`}>
          
          {/* FRONT */}
          <div className="flashcard-face flashcard-front">
            <button 
              className="icon-btn" 
              onClick={(e) => { e.stopPropagation(); toggleFurigana(); }}
              style={{ position: 'absolute', top: '15px', right: '15px' }}
            >
              {showFurigana ? <Eye size={24} /> : <EyeOff size={24} />}
            </button>

            <div className={`furigana ${showFurigana ? 'visible' : ''}`}>
              {word.furigana}
            </div>
            
            <div className="word-original">
              {word.original || '—'}
            </div>
          </div>

          {/* BACK */}
          <div className="flashcard-face flashcard-back">
            <div className="furigana visible">
              {word.furigana}
            </div>
            
            <div className="word-original" style={{ fontSize: '2.5rem', marginBottom: '10px' }}>
              {word.original}
            </div>

            <div className="word-meaning">
              {word.korean}
            </div>

            <div className="word-english">
              {word.english}
            </div>
          </div>

        </div>
      </div>

      {/* Actions */}
      {mode === 'TEST' ? (
        <div className="action-area">
          <button className="btn-action btn-fail" onClick={(e) => handleAction(e, false)}>
            <X size={26} /> 몰라요
          </button>
          <button className="btn-action btn-pass" onClick={(e) => handleAction(e, true)}>
            <Check size={26} /> 알아요
          </button>
        </div>
      ) : (
        <div className="action-area" style={{ paddingBottom: '10px' }}>
          <button 
            className="btn-action" 
            style={{ background: isFirst ? 'var(--card-bg)' : 'rgba(56, 189, 248, 0.2)', color: isFirst ? 'var(--text-secondary)' : 'var(--text-primary)', border: '1px solid var(--card-border)' }} 
            onClick={(e) => handleStudyAction(e, 'PREV')} 
            disabled={isFirst}
          >
            <ChevronLeft size={26} /> 이전 카드
          </button>
          <button 
            className="btn-action" 
            style={{ background: 'rgba(56, 189, 248, 0.2)', border: '1px solid var(--card-border)' }} 
            onClick={(e) => handleStudyAction(e, 'NEXT')}
          >
            다음 카드 <ChevronRight size={26} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Flashcard;
