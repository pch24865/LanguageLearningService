import { useState, useMemo } from 'react';
import { X, CheckCircle, Circle, BookOpen } from 'lucide-react';
import { useStore, type Word } from '../store/useStore';
export default function WordListModal({ 
  onClose,
  appMode,
  currentData,
  currentLevels,
  initialLevel
}: { 
  onClose: () => void;
  appMode: 'JLPT' | 'KANA' | 'KANJI';
  currentData: Record<string, Word[]>;
  currentLevels: string[];
  initialLevel?: string;
}) {
  const { knownWords } = useStore();
  const [activeTab, setActiveTab] = useState<'LEARNED' | 'UNLEARNED'>('LEARNED');
  const [activeLevel, setActiveLevel] = useState<string>(initialLevel || currentLevels[0]);

  const { learnedWords, unlearnedWords } = useMemo(() => {
    const levelWords = currentData[activeLevel] || [];
    const learned = levelWords.filter(w => knownWords.includes(w.original));
    const unlearned = levelWords.filter(w => !knownWords.includes(w.original));
    return { learnedWords: learned, unlearnedWords: unlearned };
  }, [activeLevel, knownWords, currentData]);

  const displayedWords = activeTab === 'LEARNED' ? learnedWords : unlearnedWords;

  const itemLabel = appMode === 'KANJI' ? '한자' : appMode === 'KANA' ? '글자' : '단어';
  const itemLabelObj = appMode === 'KANJI' ? '한자를' : appMode === 'KANA' ? '글자를' : '단어를';
  const itemLabelSubj = appMode === 'KANJI' ? '한자가' : appMode === 'KANA' ? '글자가' : '단어가';

  return (
    <div className="modal-overlay">
      <div className="word-list-modal">
        <header className="wl-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={24} color="var(--accent-color)" />
            <h2>
              {appMode === 'JLPT' ? '나의 단어장' : appMode === 'KANA' ? '가나 목록' : '나의 한자장'}
            </h2>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={24} /></button>
        </header>

        <div style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="level-pills">
            {currentLevels.map(lvl => (
              <button
                key={lvl}
                className={`level-pill ${activeLevel === lvl ? 'active' : ''}`}
                onClick={() => setActiveLevel(lvl)}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <div className="wl-status-tabs">
          <button
            className={`wl-status-btn ${activeTab === 'LEARNED' ? 'active' : ''}`}
            onClick={() => setActiveTab('LEARNED')}
          >
            <CheckCircle size={18} /> 외운 {itemLabel} ({learnedWords.length})
          </button>
          <button
            className={`wl-status-btn ${activeTab === 'UNLEARNED' ? 'active' : ''}`}
            onClick={() => setActiveTab('UNLEARNED')}
          >
            <Circle size={18} /> 못 외운 {itemLabel} ({unlearnedWords.length})
          </button>
        </div>

        <div className="wl-content">
          {displayedWords.length === 0 ? (
            <div className="wl-empty">
              {activeTab === 'LEARNED' 
                ? `아직 이 급수에서 외운 ${itemLabelSubj} 없습니다.` 
                : `이 급수의 ${itemLabelObj} 모두 외우셨습니다!`}
            </div>
          ) : (
            <div className="wl-grid">
              {displayedWords.map((word, idx) => (
                <div key={`${word.original}-${idx}`} className="wl-item">
                  <div className="wli-kanji">{word.original}</div>
                  <div className="wli-info">
                    {appMode === 'KANJI' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignSelf: 'flex-start' }}>
                        <span className="wli-furi" style={{ fontSize: '0.85rem' }}>훈: {word.kunyomi || '-'}</span>
                        <span className="wli-furi" style={{ fontSize: '0.85rem' }}>음: {word.onyomi || '-'}</span>
                      </div>
                    ) : (
                      <span className="wli-furi">{word.furigana}</span>
                    )}
                    <span className="wli-mean">{word.korean}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
