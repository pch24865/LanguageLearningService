import { useState, useMemo } from 'react';
import { X, CheckCircle, Circle, BookOpen } from 'lucide-react';
import { useStore, type Word } from '../store/useStore';
import vocabDataRaw from '../assets/vocab_data.json';

const vocabData = vocabDataRaw as Record<string, Word[]>;
const ALL_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

export default function WordListModal({ onClose }: { onClose: () => void }) {
  const { knownWords } = useStore();
  const [activeTab, setActiveTab] = useState<'LEARNED' | 'UNLEARNED'>('LEARNED');
  const [activeLevel, setActiveLevel] = useState<string>('N5');

  const { learnedWords, unlearnedWords } = useMemo(() => {
    const levelWords = vocabData[activeLevel] || [];
    const learned = levelWords.filter(w => knownWords.includes(w.original));
    const unlearned = levelWords.filter(w => !knownWords.includes(w.original));
    return { learnedWords: learned, unlearnedWords: unlearned };
  }, [activeLevel, knownWords]);

  const displayedWords = activeTab === 'LEARNED' ? learnedWords : unlearnedWords;

  return (
    <div className="modal-overlay">
      <div className="word-list-modal">
        <header className="wl-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={24} color="var(--accent-color)" />
            <h2>나의 단어장</h2>
          </div>
          <button className="icon-btn" onClick={onClose}><X size={24} /></button>
        </header>

        <div style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="level-pills">
            {ALL_LEVELS.map(lvl => (
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
            <CheckCircle size={18} /> 외운 단어 ({learnedWords.length})
          </button>
          <button
            className={`wl-status-btn ${activeTab === 'UNLEARNED' ? 'active' : ''}`}
            onClick={() => setActiveTab('UNLEARNED')}
          >
            <Circle size={18} /> 못 외운 단어 ({unlearnedWords.length})
          </button>
        </div>

        <div className="wl-content">
          {displayedWords.length === 0 ? (
            <div className="wl-empty">
              {activeTab === 'LEARNED' ? '아직 이 급수에서 외운 단어가 없습니다.' : '이 급수의 단어를 모두 외우셨습니다!'}
            </div>
          ) : (
            <div className="wl-grid">
              {displayedWords.map((word, idx) => (
                <div key={`${word.original}-${idx}`} className="wl-item">
                  <div className="wli-kanji">{word.original}</div>
                  <div className="wli-info">
                    <span className="wli-furi">{word.furigana}</span>
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
