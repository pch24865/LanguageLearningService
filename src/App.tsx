import { useState } from 'react';
import { Menu, Flame, ChevronLeft, ChevronRight, XCircle, Undo2, X, Check } from 'lucide-react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { useStore, type Word } from './store/useStore';
import Flashcard from './components/Flashcard';
import WordListModal from './components/WordListModal';
import vocabDataRaw from './assets/vocab_data.json';
import { kanaGroups, KANA_LEVELS } from './assets/kana';

import kanjiN5Raw from './assets/kanjikana_n5.json';
import kanjiN4Raw from './assets/kanjikana_n4.json';
import kanjiN3Raw from './assets/kanjikana_n3.json';
import kanjiN2Raw from './assets/kanjikana_n2.json';
import kanjiN1Raw from './assets/kanjikana_n1.json';

const vocabData = vocabDataRaw as Record<string, Word[]>;
const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

const formatKanji = (raw: any): Word[] => {
  return raw.map((k: any) => ({
    original: k.kanji,
    furigana: '',
    korean: k.meaning,
    type: 'KANJI',
    kunyomi: k.kunyomi,
    onyomi: k.onyomi,
    examples: k.examples
  }));
};

const kanjiData: Record<string, Word[]> = {
  N5: formatKanji(kanjiN5Raw),
  N4: formatKanji(kanjiN4Raw),
  N3: formatKanji(kanjiN3Raw),
  N2: formatKanji(kanjiN2Raw),
  N1: formatKanji(kanjiN1Raw),
};

const ModeSelectionSidebar = ({ onClose, currentMode, onSelectMode }: { onClose: () => void, currentMode: string, onSelectMode: (m: 'JLPT' | 'KANA' | 'KANJI') => void }) => {
  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ zIndex: 998, position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, width: '280px',
          background: 'var(--bg-color)', zIndex: 999,
          boxShadow: '4px 0 24px rgba(0,0,0,0.1)',
          padding: '40px 20px',
          display: 'flex', flexDirection: 'column'
        }}
      >
        <button className="icon-btn" style={{ alignSelf: 'flex-end', marginBottom: '20px' }} onClick={onClose}><X size={26} color="var(--text-primary)" /></button>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '30px', fontWeight: 700 }}>어떤 학습을 할까요?</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            className="big-btn-dark"
            style={{
              background: currentMode === 'JLPT' ? 'var(--accent-color)' : 'var(--card-bg)',
              color: currentMode === 'JLPT' ? '#fff' : 'var(--text-primary)',
              border: currentMode === 'JLPT' ? 'none' : '2px solid var(--card-border)',
              display: 'flex', justifyContent: 'flex-start', paddingLeft: '20px', gap: '15px'
            }}
            onClick={() => { onSelectMode('JLPT'); onClose(); }}
          >
            <span>🇯🇵</span> JLPT 단어
          </button>
          <button
            className="big-btn-dark"
            style={{
              background: currentMode === 'KANA' ? 'var(--accent-color)' : 'var(--card-bg)',
              color: currentMode === 'KANA' ? '#fff' : 'var(--text-primary)',
              border: currentMode === 'KANA' ? 'none' : '2px solid var(--card-border)',
              display: 'flex', justifyContent: 'flex-start', paddingLeft: '20px', gap: '15px'
            }}
            onClick={() => { onSelectMode('KANA'); onClose(); }}
          >
            <span style={{ fontWeight: 800 }}>あ</span> 히라가나•가타카나
          </button>
          <button
            className="big-btn-dark"
            style={{
              background: currentMode === 'KANJI' ? 'var(--accent-color)' : 'var(--card-bg)',
              color: currentMode === 'KANJI' ? '#fff' : 'var(--text-primary)',
              border: currentMode === 'KANJI' ? 'none' : '2px solid var(--card-border)',
              display: 'flex', justifyContent: 'flex-start', paddingLeft: '20px', gap: '15px'
            }}
            onClick={() => { onSelectMode('KANJI'); onClose(); }}
          >
            <span style={{ fontWeight: 800 }}>日</span> 한자
          </button>
        </div>
      </motion.div>
    </>
  );
};

const DeckCard = ({ word, mode, isTopCard, relIndex, recordAnswer, isKanaMode }: any) => {
  const x = useMotionValue(0);
  const colorOverlay = useTransform(
    x,
    [-120, 0, 120],
    ['rgba(239, 68, 68, 0.4)', 'rgba(0, 0, 0, 0)', 'rgba(34, 197, 94, 0.4)']
  );

  return (
    <motion.div
      style={{ position: 'absolute', width: '100%', top: 0, left: 0, x }}
      animate={{
        scale: 1 - relIndex * 0.05,
        y: relIndex * 20,
        zIndex: 3 - relIndex,
        opacity: 1 - relIndex * 0.3
      }}
      drag={isTopCard && mode === 'TEST' ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(_, info) => {
        if (!isTopCard || mode !== 'TEST') return;
        const threshold = 80;
        if (info.offset.x > threshold) {
          recordAnswer(word, true);
        } else if (info.offset.x < -threshold) {
          recordAnswer(word, false);
        }
      }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <div style={{ position: 'relative', width: '100%' }}>
        <Flashcard
          word={word}
          overlayColor={colorOverlay}
          isKanaMode={isKanaMode}
        />
      </div>
    </motion.div>
  );
};

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
  const [mixRatio, setMixRatio] = useState<number>(70);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isWordListOpen, setIsWordListOpen] = useState(false);
  const [isModeSelectorOpen, setIsModeSelectorOpen] = useState(false);
  const [appMode, setAppMode] = useState<'JLPT' | 'KANA' | 'KANJI'>('JLPT');

  const currentLevels = appMode === 'KANA' ? KANA_LEVELS : LEVELS;
  const currentData = appMode === 'JLPT' ? vocabData : appMode === 'KANA' ? (kanaGroups as Record<string, Word[]>) : kanjiData;

  // Stack swipe logic: Swipe left to next, Swipe right to prev
  const handleDragEnd = (_: any, info: PanInfo) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      if (activeCardIndex < currentLevels.length - 1) setActiveCardIndex(prev => prev + 1);
    } else if (info.offset.x > swipeThreshold) {
      if (activeCardIndex > 0) setActiveCardIndex(prev => prev - 1);
    }
  };

  // Stats computation
  const getLevelStats = (lvl: string) => {
    const list = currentData[lvl] || [];
    const total = list.length;
    // Count kanji by checking if furigana differs from original AND kanji existed (which means original has kanji)
    // Quick heuristic: length of words with kanji
    const totalKanji = list.filter(w => w.furigana !== '').length;

    const knownInLevel = list.filter(w => knownWords.includes(w.original)).length;
    return { total, totalKanji, known: knownInLevel };
  };

  const handleStartSession = (lvl: string) => {
    const list = currentData[lvl] || [];

    if (appMode === 'KANA') {
      const pool = [...list].sort(() => Math.random() - 0.5);
      if (pool.length === 0) {
        alert('학습할 글자가 없습니다.');
        return;
      }
      startSession(pool, 'TEST');
      return;
    }

    let newWords = list.filter(w => !knownWords.includes(w.original));
    let reviewWords = list.filter(w => knownWords.includes(w.original));

    newWords = newWords.sort(() => Math.random() - 0.5);
    reviewWords = reviewWords.sort(() => Math.random() - 0.5);

    let pool: Word[] = [];

    // Smart Balanced Mix based on mixRatio
    const newTarget = Math.round(goalAmount * (mixRatio / 100));
    const reviewTarget = goalAmount - newTarget;

    const pickedNew = newWords.slice(0, newTarget);
    const pickedReview = reviewWords.slice(0, reviewTarget);

    pool = [...pickedNew, ...pickedReview];

    // Fill remaining spots if one pool was too small
    if (pool.length < goalAmount) {
      const remaining = goalAmount - pool.length;
      if (pickedNew.length < newTarget) {
        // Add more review if new is exhausted, UNLESS strictly 100% New
        if (mixRatio < 100) {
          pool = [...pool, ...reviewWords.slice(reviewTarget, reviewTarget + remaining)];
        }
      } else {
        // Add more new if review is exhausted, UNLESS strictly 100% Review
        if (mixRatio > 0) {
          pool = [...pool, ...newWords.slice(newTarget, newTarget + remaining)];
        }
      }
    }

    if (pool.length === 0) {
      alert('테스트할 단어가 없습니다.');
      return;
    }

    startSession(pool, 'TEST');
  };

  // Component: Home Swiper
  const renderHomeView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header className="header-light">
        <button
          className="icon-btn"
          style={{ marginLeft: '-10px', background: 'var(--card-bg)', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}
          onClick={() => setIsModeSelectorOpen(true)}
        >
          <Menu size={24} color="currentColor" />
        </button>
        <span className="title-main">{appMode === 'JLPT' ? 'JLPT Plus' : appMode === 'KANA' ? 'Kana Practice' : 'Kanji Practice'}</span>
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
          {currentLevels.map((lvl, index) => {
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
                  zIndex: currentLevels.length - index,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                style={{
                  position: 'absolute',
                  width: '85%',
                  maxWidth: '350px',
                  height: '440px',
                  cursor: isSelected ? 'grab' : 'pointer',
                }}
                onClick={() => {
                  if (isSelected) {
                    if (appMode === 'KANA') {
                      handleStartSession(lvl);
                    } else {
                      setSelectedLevel(lvl);
                    }
                  } else {
                    setActiveCardIndex(index);
                  }
                }}
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
                      color: lvl.includes('N1') ? '#1e40af' : lvl.includes('N5') ? '#0ea5e9' : lvl.includes('N4') ? '#d97706' : lvl.includes('N3') ? '#db2777' : '#6d28d9',
                      fontSize: appMode === 'KANA' ? '3rem' : '8rem',
                      letterSpacing: appMode === 'KANA' ? '-2px' : '-6px'
                    }}>{lvl}</div>
                  </div>

                  <div className="poster-footer-stats">
                    <div style={{ flex: 1 }}>
                      <div className="poster-badge-item">{appMode === 'JLPT' ? 'VOCABULARY' : appMode === 'KANA' ? 'ALPHABET' : 'KANJI'}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="poster-badge-item" style={{ color: '#000', marginBottom: '2px' }}>{stats.total} {appMode === 'JLPT' ? 'WORDS' : 'CHARS'}</div>
                      {appMode === 'JLPT' && <div className="poster-badge-item" style={{ fontSize: '0.6rem', opacity: 0.5 }}>{stats.totalKanji} KANJI</div>}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '60px' }}>
          {currentLevels.map((_, i) => (
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
    const todayReview = Math.min(stats.known, goalAmount);

    const newTarget = Math.round(goalAmount * (mixRatio / 100));
    const reviewTarget = goalAmount - newTarget;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
        <div className="detail-bg" />

        <header className="header-light">
          <button className="icon-btn" onClick={() => setSelectedLevel(null)} style={{ marginLeft: '-10px' }}>
            <ChevronLeft size={28} />
          </button>
          <span className="title-main">{lvl} {appMode === 'JLPT' ? '단어' : appMode === 'KANA' ? '글자' : '한자'}</span>
          <span style={{ fontSize: '0.9rem', color: 'var(--accent-color)', fontWeight: 700, marginRight: '5px' }}>
            플래시 카드
          </span>
        </header>

        <div className="detail-content">
          <div className="study-card">
            <div className="study-card-title">자동 학습 스케줄러</div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>하루 목표 학습량</span>
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
                  <option value={100}>100개</option>
                  <option value={150}>150개</option>
                  <option value={200}>200개</option>
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

            <div style={{ padding: '0 5px', marginTop: '25px', marginBottom: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>복습 {100 - mixRatio}% <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>({reviewTarget}개)</span></span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>새 단어 {mixRatio}% <span style={{ color: 'var(--accent-color)', fontSize: '0.8rem' }}>({newTarget}개)</span></span>
              </div>
              <input
                type="range"
                min="0" max="100" step="5"
                value={mixRatio}
                onChange={(e) => setMixRatio(Number(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: 'var(--accent-color)',
                  cursor: 'pointer',
                  height: '6px',
                  borderRadius: '10px',
                  background: 'var(--card-border)',
                  appearance: 'none',
                  outline: 'none'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, position: 'relative' }}>
                <span>복습 위주</span>
                <span style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>균형</span>
                <span>새 단어 위주</span>
              </div>
            </div>

            <button className="big-btn-dark" style={{ marginTop: '10px' }} onClick={() => handleStartSession(lvl)}>
              이 설정으로 학습 시작
            </button>
          </div>

          <div className="info-section">
            <div className="info-header" style={{ cursor: 'pointer' }} onClick={() => setIsWordListOpen(true)}>
              <span className="info-title">{lvl} 학습 정보</span>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                전체 보기 <ChevronRight size={16} />
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

            <div style={{ flex: 1, padding: '0 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'relative', width: '100%', height: '480px', perspective: '1200px' }}>
                {sessionDeck.slice(currentIndex, currentIndex + 3).reverse().map((word, revIndex, arr) => {
                  const relIndex = arr.length - 1 - revIndex;
                  const isTopCard = relIndex === 0;

                  return (
                    <DeckCard
                      key={word.original}
                      word={word}
                      mode={sessionMode}
                      isTopCard={isTopCard}
                      relIndex={relIndex}
                      recordAnswer={recordAnswer}
                      isKanaMode={appMode === 'KANA'}
                    />
                  );
                })}
              </div>

              {/* ACTION AREA (STATIC) */}
              {sessionMode === 'TEST' ? (
                <div className="action-area" style={{ width: '100%', paddingLeft: 0, paddingRight: 0, paddingTop: '10px', paddingBottom: 0 }}>
                  <button className="btn-action btn-fail" onClick={() => recordAnswer(sessionDeck[currentIndex], false)}>
                    <X size={32} />
                  </button>
                  <button className="btn-action btn-pass" onClick={() => recordAnswer(sessionDeck[currentIndex], true)}>
                    <Check size={32} />
                  </button>
                </div>
              ) : (
                <div className="action-area" style={{ width: '100%', paddingLeft: 0, paddingRight: 0, paddingTop: '10px', paddingBottom: 0 }}>
                  <button
                    className="btn-action"
                    style={{ background: currentIndex === 0 ? 'var(--card-bg)' : 'rgba(56, 189, 248, 0.2)', color: currentIndex === 0 ? 'var(--text-secondary)' : 'var(--text-primary)', border: '1px solid var(--card-border)' }}
                    onClick={goPrevInStudy}
                    disabled={currentIndex === 0}
                  >
                    <ChevronLeft size={26} /> 이전
                  </button>
                  <button
                    className="btn-action"
                    style={{ background: 'rgba(56, 189, 248, 0.2)', border: '1px solid var(--card-border)' }}
                    onClick={goNextInStudy}
                  >
                    다음 <ChevronRight size={26} />
                  </button>
                </div>
              )}

              {sessionMode === 'TEST' && (
                <button
                  onClick={undoLastAnswer}
                  disabled={currentIndex === 0}
                  style={{
                    marginTop: '20px',
                    background: 'none', border: 'none',
                    color: currentIndex === 0 ? 'transparent' : 'var(--text-secondary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  <Undo2 size={20} /> 이전 취소
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

      {isWordListOpen && (
        <WordListModal
          onClose={() => setIsWordListOpen(false)}
          appMode={appMode}
          currentData={currentData}
          currentLevels={currentLevels}
          initialLevel={selectedLevel || undefined}
        />
      )}
      <AnimatePresence>
        {isModeSelectorOpen && (
          <ModeSelectionSidebar
            onClose={() => setIsModeSelectorOpen(false)}
            currentMode={appMode}
            onSelectMode={(mode) => {
              setAppMode(mode);
              setActiveCardIndex(0);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
