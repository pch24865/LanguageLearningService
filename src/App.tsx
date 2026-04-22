import React, { useState, useMemo, useEffect } from 'react';
import { Menu, Flame, ChevronLeft, ChevronRight, XCircle, Play, Undo2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { useStore, type Word } from './store/useStore';
import Flashcard from './components/Flashcard';
import WordListModal from './components/WordListModal';
import vocabDataRaw from './assets/vocab_data.json';

const vocabData = vocabDataRaw as Record<string, Word[]>;
const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

function App() {
  const {
    knownWords,
    sessionDeck,
    currentIndex,
    sessionMode,
    sessionStats,
    isSessionActive,
    currentStreak,
    startSession,
    recordAnswer,
    goNextInStudy,
    goPrevInStudy,
    endSession,
    undoLastAnswer,
  } = useStore();

  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [goalAmount, setGoalAmount] = useState<number>(35);
  const [activeCardIndex, setActiveCardIndex] = useState(3); // default N2 maybe?
  const [isWordListOpen, setIsWordListOpen] = useState(false);

  // Stack swipe logic: Swipe left to next, Swipe right to prev
  const handleDragEnd = (event: any, info: PanInfo) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      if (activeCardIndex < LEVELS.length - 1) setActiveCardIndex(prev => prev + 1);
    } else if (info.offset.x > swipeThreshold) {
      if (activeCardIndex > 0) setActiveCardIndex(prev => prev - 1);
    }
  };

  // Stats computation
  const getLevelStats = (lvl: string) => {
    const list = vocabData[lvl] || [];
    const total = list.length;
    // Count kanji by checking if furigana differs from original AND kanji existed (which means original has kanji)
    // Quick heuristic: length of words with kanji
    const totalKanji = list.filter(w => w.furigana !== '').length;

    const knownInLevel = list.filter(w => knownWords.includes(w.original)).length;
    return { total, totalKanji, known: knownInLevel };
  };

  const handleStartSession = (lvl: string, type: 'ALL' | 'NEW' | 'REVIEW' = 'ALL') => {
    const list = vocabData[lvl] || [];
    let newWords = list.filter(w => !knownWords.includes(w.original));
    let reviewWords = list.filter(w => knownWords.includes(w.original));

    newWords = newWords.sort(() => Math.random() - 0.5);
    reviewWords = reviewWords.sort(() => Math.random() - 0.5);

    let pool: Word[] = [];
    if (type === 'NEW') {
      pool = newWords.slice(0, goalAmount);
      if (pool.length === 0) alert('새로운 단어가 부족합니다. (모두 학습했거나 설정량이 너무 적음)');
    } else if (type === 'REVIEW') {
      pool = reviewWords.slice(0, goalAmount);
      if (pool.length === 0) alert('복습할 단어가 아직 없습니다.');
    } else {
      // ALL: Smart Balanced Mix (70% New, 30% Review)
      const reviewTarget = Math.ceil(goalAmount * 0.3);
      const newTarget = goalAmount - reviewTarget;

      const pickedNew = newWords.slice(0, newTarget);
      const pickedReview = reviewWords.slice(0, reviewTarget);
      
      pool = [...pickedNew, ...pickedReview];

      // Fill remaining spots if one pool was too small
      if (pool.length < goalAmount) {
        const remaining = goalAmount - pool.length;
        if (pickedNew.length < newTarget) {
          // Add more review if new is exhausted
          pool = [...pool, ...reviewWords.slice(reviewTarget, reviewTarget + remaining)];
        } else {
          // Add more new if review is exhausted
          pool = [...pool, ...newWords.slice(newTarget, newTarget + remaining)];
        }
      }
    }

    if (pool.length === 0) {
      if (type === 'ALL') {
        pool = list.slice(0, goalAmount);
        if (pool.length === 0) return;
      } else {
        return;
      }
    }

    // Always start TEST mode (can toggle later if needed)
    startSession(pool, 'TEST');
  };

  // Component: Home Swiper
  const renderHomeView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header className="header-light">
        <button className="icon-btn" style={{ marginLeft: '-10px' }}><Menu size={24} /></button>
        <span className="title-main">JLPT Plus</span>
        <div style={{ width: 24 }} />
      </header>

      <div className="streak-pill">
        <Flame size={18} fill="currentColor" /> {currentStreak}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: '20px',
          perspective: '1200px'
        }}>
          {LEVELS.map((lvl, index) => {
            const stats = getLevelStats(lvl);
            const isSelected = activeCardIndex === index;
            const diff = index - activeCardIndex;

            return (
              <motion.div
                key={lvl}
                drag={isSelected ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                animate={{
                  scale: isSelected ? 1 : (diff > 0 ? 1 - diff * 0.08 : 0.9),
                  x: diff < 0 ? -450 : (diff > 0 ? diff * 10 : 0),
                  y: diff > 0 ? diff * 20 : 0,
                  opacity: diff < 0 ? 0 : (1 - diff * 0.35),
                  rotateY: diff > 0 ? diff * -12 : 0,
                  rotate: diff < 0 ? -15 : 0,
                  zIndex: LEVELS.length - index,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                style={{
                  position: 'absolute',
                  width: '85%',
                  maxWidth: '350px',
                  height: '440px',
                  cursor: isSelected ? 'grab' : 'pointer',
                }}
                onClick={() => isSelected ? setSelectedLevel(lvl) : setActiveCardIndex(index)}
              >
                <div
                  className="level-card"
                  style={{
                    width: '100%',
                    height: '100%',
                    margin: 0,
                    boxShadow: isSelected ? '0 50px 100px rgba(0,0,0,0.12)' : '0 10px 30px rgba(0,0,0,0.06)',
                    background: '#ffffff',
                    border: 'none',
                    borderRadius: '36px'
                  }}
                >
                  {/* Premium Studio Graphics (Simple but Not Boring) */}
                  <div className="poster-bg-decoration">
                    <div className="poster-noise" />
                    <div className="poster-dot-grid" />
                    <div className="poster-glass-shine" />
                  </div>

                <div style={{
                  position: 'relative',
                  zIndex: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <div className="level-title-poster" style={{
                    color: lvl === 'N1' ? '#1e40af' : lvl === 'N5' ? '#0ea5e9' : lvl === 'N4' ? '#d97706' : lvl === 'N3' ? '#db2777' : '#6d28d9'
                  }}>{lvl}</div>
                </div>

                  <div className="poster-footer-stats">
                    <div style={{ flex: 1 }}>
                      <div className="poster-badge-item">VOCABULARY</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="poster-badge-item" style={{ color: '#000', marginBottom: '2px' }}>{stats.total} WORDS</div>
                      <div className="poster-badge-item" style={{ fontSize: '0.6rem', opacity: 0.5 }}>{stats.totalKanji} KANJI</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '60px' }}>
          {LEVELS.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                width: i === activeCardIndex ? 28 : 8,
                backgroundColor: i === activeCardIndex ? 'var(--accent-color)' : 'var(--card-border)',
                opacity: i === activeCardIndex ? 1 : 0.5
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{ height: 8, borderRadius: 4 }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  // Component: Detail View
  const renderDetailView = (lvl: string) => {
    const stats = getLevelStats(lvl);
    const percent = Math.round((stats.known / (stats.total || 1)) * 100);

    // Calculate how many words we can actually study
    const newWordsLeft = stats.total - stats.known;
    const todayNew = Math.min(newWordsLeft, goalAmount);
    
    // Review words available for a standalone review session
    const todayReview = Math.min(stats.known, goalAmount);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
        <div className="detail-bg" />

        <header className="header-light">
          <button className="icon-btn" onClick={() => setSelectedLevel(null)} style={{ marginLeft: '-10px' }}>
            <ChevronLeft size={28} />
          </button>
          <span className="title-main">{lvl} 단어</span>
          <span style={{ fontSize: '0.9rem', color: 'var(--accent-color)', fontWeight: 700, marginRight: '5px' }}>한자</span>
        </header>

        <div className="detail-content">
          <div className="study-card">
            <div className="study-card-title">자동 학습</div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>목표 학습량</span>
                <select
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(Number(e.target.value))}
                  style={{
                    padding: '8px 12px', border: '1px solid var(--card-border)', borderRadius: '12px',
                    fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', outline: 'none', background: 'transparent'
                  }}
                >
                  <option value={10}>10개</option>
                  <option value={20}>20개</option>
                  <option value={35}>35개</option>
                  <option value={50}>50개</option>
                </select>
              </div>

              <div className="progress-circle-wrap">
                <svg viewBox="0 0 36 36" className="circular-chart" style={{ width: '100%', height: '100%' }}>
                  <path className="circle-bg"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path className="circle"
                    strokeDasharray={`${percent}, 100`}
                    stroke="var(--accent-color)"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <text x="18" y="16.5" className="percentage">{percent}%</text>
                  <text x="18" y="24" className="percentage-sub">{stats.known}/{stats.total}</text>
                </svg>
              </div>
            </div>

            <div
              className="row-item"
              style={{ cursor: 'pointer' }}
              onClick={() => handleStartSession(lvl, 'NEW')}
            >
              <span>새 단어 (단독 테스트)</span>
              <span className="val">{todayNew} <ChevronRight size={18} color="var(--text-muted)" /></span>
            </div>
            <div
              className="row-item"
              style={{ border: 'none', cursor: 'pointer' }}
              onClick={() => handleStartSession(lvl, 'REVIEW')}
            >
              <span>복습 단어 (단독 테스트)</span>
              <span className="val">{todayReview} <ChevronRight size={18} color="var(--text-muted)" /></span>
            </div>

            <button className="big-btn-dark" onClick={() => handleStartSession(lvl, 'ALL')}>
              자동 학습 (섞어서 시작)
            </button>
          </div>

          <div className="info-section">
            <div className="info-header" style={{ cursor: 'pointer' }} onClick={() => setIsWordListOpen(true)}>
              <span className="info-title">{lvl} 학습 정보</span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                모든 단어 <ChevronRight size={16} />
              </span>
            </div>

            <div className="mini-row">
              <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>모든 단어 암기율</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{stats.known}/{stats.total}</span>
                <div style={{ width: 40, height: 6, background: 'var(--card-border)', borderRadius: 4 }}>
                  <div style={{ width: `${percent}%`, height: '100%', background: 'var(--accent-color)', borderRadius: 4 }} />
                </div>
              </div>
            </div>
            <div className="mini-row">
              <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>오늘의 학습 진도율 (목표량 대비)</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{todayReview}/{goalAmount}</span>
                <div style={{ width: 40, height: 6, background: 'var(--card-border)', borderRadius: 4 }}>
                  <div style={{ width: `${Math.min(100, Math.round((todayReview / goalAmount) * 100))}%`, height: '100%', background: 'var(--accent-color)', borderRadius: 4 }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSessionSummary = () => (
    <div style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '10px', color: 'var(--text-primary)' }}>학습 완료! 🎉</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>이번 세션의 결과입니다.</p>

      <div className="study-card" style={{ width: '100%' }}>
        <div className="row-item">
          <span>총 학습:</span>
          <span className="val">{sessionDeck.length}개</span>
        </div>
        <div className="row-item">
          <span style={{ color: 'var(--success-color)' }}>알아요:</span>
          <span className="val">{sessionStats.passed.length}개</span>
        </div>
        <div className="row-item" style={{ border: 'none' }}>
          <span style={{ color: 'var(--error-color)' }}>몰라요:</span>
          <span className="val">{sessionStats.failed.length}개</span>
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {sessionStats.failed.length > 0 && (
        <button
          className="big-btn-dark"
          style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', marginBottom: '10px' }}
          onClick={() => startSession(sessionStats.failed, 'TEST')}
        >
          틀린 단어 방금 다시 하기 ({sessionStats.failed.length})
        </button>
      )}
      <button className="big-btn-dark" onClick={endSession}>
        종료
      </button>
    </div>
  );

  const activeWord = sessionDeck[currentIndex];

  return (
    <div className="app-container">
      {/* Active Session Output */}
      {isSessionActive ? (
        currentIndex < sessionDeck.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <header className="header-light">
              <button className="icon-btn" onClick={() => {
                if (window.confirm('세션을 종료하시겠습니까?')) endSession();
              }}>
                <XCircle size={26} color="var(--text-secondary)" />
              </button>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                {currentIndex + 1} / {sessionDeck.length}
              </div>
              <div style={{ width: 26 }} />
            </header>

            <div style={{ flex: 1, padding: '0 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Flashcard
                key={activeWord.original}
                word={activeWord}
                mode={sessionMode}
                isFirst={currentIndex === 0}
                onNextTest={(knew) => recordAnswer(activeWord, knew)}
                onNextStudy={goNextInStudy}
                onPrevStudy={goPrevInStudy}
              />

              {sessionMode === 'TEST' && (
                <button
                  onClick={undoLastAnswer}
                  disabled={currentIndex === 0}
                  style={{
                    marginTop: '30px',
                    background: 'none', border: 'none',
                    color: currentIndex === 0 ? 'transparent' : 'var(--text-secondary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  <Undo2 size={18} /> 이전 취소
                </button>
              )}
            </div>
          </div>
        ) : (
          renderSessionSummary()
        )
      ) : (
        /* Not actively studying */
        selectedLevel ? renderDetailView(selectedLevel) : renderHomeView()
      )}

      {isWordListOpen && <WordListModal onClose={() => setIsWordListOpen(false)} />}
    </div>
  );
}

export default App;
