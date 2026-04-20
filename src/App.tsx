import { useState } from 'react';
import { Settings, RefreshCw, XCircle, Play, Undo2, Flame, BookOpen, Plus, Minus, Shuffle } from 'lucide-react';
import { useStore, type Word } from './store/useStore';
import Flashcard from './components/Flashcard';
import WordListModal from './components/WordListModal';
import vocabDataRaw from './assets/vocab_data.json';

const vocabData = vocabDataRaw as Record<string, Word[]>;
const ALL_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

function App() {
  const {
    knownWords,
    sessionDeck,
    currentIndex,
    sessionMode,
    sessionStats,
    isSessionActive,
    dailyGoal,
    currentStreak,
    dailyStats,
    startSession,
    recordAnswer,
    goNextInStudy,
    goPrevInStudy,
    endSession,
    resetKnownData,
    undoLastAnswer,
    setDailyGoal,
    shuffleSessionDeck
  } = useStore();

  // Local Form State
  const [selectedLevels, setSelectedLevels] = useState<string[]>(['N5']);
  const [batchSize, setBatchSize] = useState<number | 'ALL'>(20);
  const [includeKnown, setIncludeKnown] = useState<boolean>(false);
  const [shuffle, setShuffle] = useState<boolean>(true);
  const [modeSelect, setModeSelect] = useState<'STUDY' | 'TEST'>('STUDY');
  const [isWordListOpen, setIsWordListOpen] = useState<boolean>(false);

  const todayStr = new Date().toLocaleDateString('en-CA');
  const todayLearned = dailyStats[todayStr]?.learned || 0;
  const progressPercent = Math.min((todayLearned / dailyGoal) * 100, 100);

  // Handlers for Form
  const toggleLevel = (level: string) => {
    setSelectedLevels(prev => 
      prev.includes(level) 
        ? prev.filter(l => l !== level) 
        : [...prev, level]
    );
  };

  const handleStartSession = () => {
    if (selectedLevels.length === 0) {
      alert('최소 1개 이상의 급수를 선택해주세요.');
      return;
    }

    let pool: Word[] = [];
    selectedLevels.forEach(lvl => {
      let words = vocabData[lvl] || [];
      if (!includeKnown) {
        words = words.filter(w => !knownWords.includes(w.original));
      }
      pool = [...pool, ...words];
    });

    if (pool.length === 0) {
      alert('조건에 맞는 단어가 없습니다! (모두 외운 단어일 수도 있습니다.)');
      return;
    }

    if (shuffle) pool = [...pool].sort(() => Math.random() - 0.5);
    if (batchSize !== 'ALL') pool = pool.slice(0, batchSize as number);

    startSession(pool, modeSelect);
  };

  const handleNextTest = (knewIt: boolean) => recordAnswer(sessionDeck[currentIndex], knewIt);
  
  const handleEditGoal = () => {
    const res = prompt('하루 목표 단어 수를 입력하세요:', dailyGoal.toString());
    if (res && !isNaN(Number(res))) setDailyGoal(Number(res));
  };

  const renderDashboard = () => (
    <div className="compact-dashboard">
      <div className="dashboard-header-compact">
        <span style={{ color: 'var(--text-primary)' }}>오늘의 학습 🎯</span>
        {currentStreak > 0 && (
          <div className="streak-badge">
            <Flame size={14} /> {currentStreak}일째
          </div>
        )}
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '5px' }}>
          <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>
            {todayLearned} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>/ {dailyGoal} 단어</span>
          </span>
          <button className="icon-btn" onClick={handleEditGoal} style={{ padding: '0px' }}>
            <Settings size={16} />
          </button>
        </div>
        
        <div className="progress-container">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        
        <div className="dashboard-stats" style={{ marginTop: '6px' }}>
          <span>누적 {knownWords.length}단어</span>
          <span>복습 {dailyStats[todayStr]?.reviewed || 0}단어</span>
        </div>
      </div>
    </div>
  );

  const renderHomeForm = () => (
    <div className="home-layout">
      
      <div className="home-top-bar">
        <button className="icon-btn" onClick={() => setIsWordListOpen(true)} title="나의 단어장">
          <BookOpen size={20} color="var(--accent-color)" />
        </button>
        {knownWords.length > 0 && (
          <button 
            className="icon-btn" 
            onClick={() => {
              if(window.confirm('모든 누적 학습 기록과 일일 통계를 초기화하시겠습니까?')) {
                resetKnownData();
              }
            }}
            title="초기화"
          >
            <RefreshCw size={18} color="var(--error-color)" />
          </button>
        )}
      </div>

      {renderDashboard()}

      <div className="settings-list">
        {/* 출제 급수 (다중선택) */}
        <div style={{ padding: '0 5px', marginBottom: '8px' }}>
          <div className="setting-title" style={{ paddingLeft: '5px', marginBottom: '10px' }}>출제 급수</div>
          <div className="level-pills">
            {ALL_LEVELS.map(lvl => (
              <button
                key={lvl}
                onClick={() => toggleLevel(lvl)}
                className={`level-pill ${selectedLevels.includes(lvl) ? 'active' : ''}`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* 가져올 개수 */}
        <div className="setting-row">
          <div className="setting-title">가져올 개수</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', overflow: 'hidden' }}>
              <button 
                className="icon-btn"
                style={{ padding: '6px 10px', borderRadius: 0, borderRight: '1px solid rgba(255,255,255,0.05)' }}
                onClick={() => batchSize !== 'ALL' && setBatchSize(Math.max(5, batchSize - 5))}
                disabled={batchSize === 'ALL'}
              >
                <Minus size={14} />
              </button>
              <input 
                type="text" 
                inputMode="numeric"
                value={batchSize === 'ALL' ? '' : batchSize}
                onChange={(e) => {
                  if (e.target.value === '') return;
                  const val = parseInt(e.target.value);
                  if (!isNaN(val)) setBatchSize(val);
                }}
                disabled={batchSize === 'ALL'}
                style={{ width: '45px', textAlign: 'center', background: 'transparent', border: 'none', color: batchSize === 'ALL' ? 'var(--text-secondary)' : 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 600, outline: 'none' }}
                placeholder={batchSize === 'ALL' ? 'ALL' : ''}
              />
              <button 
                className="icon-btn"
                style={{ padding: '6px 10px', borderRadius: 0, borderLeft: '1px solid rgba(255,255,255,0.05)' }}
                onClick={() => batchSize !== 'ALL' && setBatchSize(batchSize + 5)}
                disabled={batchSize === 'ALL'}
              >
                <Plus size={14} />
              </button>
            </div>
            <button 
              style={{ 
                padding: '6px 10px', 
                fontSize: '0.85rem', 
                fontWeight: 600,
                borderRadius: '10px',
                background: batchSize === 'ALL' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(0,0,0,0.3)',
                color: batchSize === 'ALL' ? 'var(--accent-color)' : 'var(--text-secondary)',
                border: `1px solid ${batchSize === 'ALL' ? 'var(--accent-color)' : 'transparent'}`,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => setBatchSize(batchSize === 'ALL' ? 20 : 'ALL')}
            >
              전체
            </button>
          </div>
        </div>

        {/* 순서 섞기 */}
        <div className="setting-row">
          <div className="setting-title">순서 섞기 (랜덤)</div>
          <div className={`toggle-switch ${shuffle ? 'on' : ''}`} onClick={() => setShuffle(!shuffle)}>
            <div className="toggle-nob" />
          </div>
        </div>

        {/* 출제 대상 */}
        <div className="setting-row">
          <div className="setting-title">이미 외운 단어 포함</div>
          <div className={`toggle-switch ${includeKnown ? 'on' : ''}`} onClick={() => setIncludeKnown(!includeKnown)}>
            <div className="toggle-nob" />
          </div>
        </div>

        {/* 학습 모드 */}
        <div className="setting-row" style={{ marginBottom: '10px' }}>
          <div className="setting-title">학습 모드</div>
          <div className="segment-control">
            <button onClick={() => setModeSelect('STUDY')} className={`segment-btn ${modeSelect === 'STUDY' ? 'active' : ''}`}>열람</button>
            <button onClick={() => setModeSelect('TEST')} className={`segment-btn ${modeSelect === 'TEST' ? 'active' : ''}`}>테스트</button>
          </div>
        </div>
      </div>

      <div className="main-action-area">
        <button className="btn-start-hero" onClick={handleStartSession} disabled={selectedLevels.length === 0}>
          <Play size={20} /> 
          {modeSelect === 'STUDY' ? '단어 열람 시작' : '실전 테스트 시작'}
        </button>
      </div>
    </div>
  );

  const renderSessionSummary = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>학습 완료! 🎉</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>이번 세션의 결과입니다.</p>
      
      {sessionMode === 'TEST' && (
        <div className="stat-card">
          <div className="stat-row">
            <span>총 학습:</span>
            <span style={{ fontWeight: 800 }}>{sessionDeck.length}개</span>
          </div>
          <div className="stat-row" style={{ color: 'var(--success-color)' }}>
            <span>알아요:</span>
            <span style={{ fontWeight: 800 }}>{sessionStats.passed.length}개</span>
          </div>
          <div className="stat-row" style={{ color: 'var(--error-color)' }}>
            <span>몰라요:</span>
            <span style={{ fontWeight: 800 }}>{sessionStats.failed.length}개</span>
          </div>
          
          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--card-border)', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            정답률: {Math.round((sessionStats.passed.length / sessionDeck.length) * 100)}%
          </div>
        </div>
      )}

      {sessionMode === 'STUDY' && (
        <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
            🎉 단어를 모두 훑어보셨군요!
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            방금 열람한 단어들을 그대로 넘겨받아 실력을 확인해볼 수 있습니다.
          </div>
          
          <button 
            className="btn-start-hero" 
            style={{ 
              background: 'rgba(56, 189, 248, 0.1)', 
              color: 'var(--accent-color)',
              boxShadow: 'none',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              padding: '16px',
              marginTop: '5px'
            }} 
            onClick={() => {
              // 동일한 덱(sessionDeck)을 가져오되, 열람 순서와 테스트 순서가 똑같으면 너무 쉬우므로 다시 섞어서(Shuffle) 테스트 시작
              const testDeck = [...sessionDeck].sort(() => Math.random() - 0.5);
              startSession(testDeck, 'TEST');
            }}
          >
            <Play size={20} /> 방금 본 {sessionDeck.length} 단어로 테스트하기
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', maxWidth: '320px', marginTop: '10px' }}>
        {sessionMode === 'TEST' && sessionStats.failed.length > 0 && (
          <button 
            className="btn-start-hero" 
            style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              color: 'var(--error-color)',
              boxShadow: 'none',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '18px'
            }} 
            onClick={() => {
              // startSession resets state and starts a new session with the failed words array
              startSession(sessionStats.failed, 'TEST');
            }}
          >
            <XCircle size={20} /> 틀린 단어 방금 다시 하기 ({sessionStats.failed.length})
          </button>
        )}
        <button className="btn-start-hero" onClick={endSession}>
          홈으로 돌아가기
        </button>
      </div>
    </div>
  );

  const activeWord = sessionDeck[currentIndex];
  
  return (
    <div className="app-container">
      {/* Header during Session */}
      {isSessionActive && currentIndex < sessionDeck.length && (
        <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button className="icon-btn" onClick={() => {
            if(window.confirm('현재 세션을 닫고 홈으로 가시겠습니까?')) endSession();
          }}>
            <XCircle size={24} />
          </button>
          
          <div className="header-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {sessionMode === 'STUDY' ? '📖 열람 모드' : '📝 테스트 모드'}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="icon-btn" onClick={shuffleSessionDeck} title="남은 단어 무작위로 섞기" style={{ padding: '4px' }}>
              <Shuffle size={20} color="var(--accent-color)" />
            </button>
            <div className="word-counter" style={{ margin: 0 }}>
              {currentIndex + 1} / {sessionDeck.length}
            </div>
          </div>
        </header>
      )}

      <main className="content-area">
        {!isSessionActive ? (
           renderHomeForm()
        ) : (
          currentIndex < sessionDeck.length ? (
             <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '5px' }}>
               <Flashcard 
                 key={activeWord.original} 
                 word={activeWord} 
                 mode={sessionMode}
                 isFirst={currentIndex === 0}
                 onNextTest={handleNextTest} 
                 onNextStudy={goNextInStudy}
                 onPrevStudy={goPrevInStudy}
               />
               
               {sessionMode === 'TEST' && (
                 <button 
                   className="icon-btn" 
                   onClick={undoLastAnswer}
                   disabled={currentIndex === 0}
                   style={{ 
                     opacity: currentIndex === 0 ? 0 : 1,
                     pointerEvents: currentIndex === 0 ? 'none' : 'auto',
                     margin: '10px auto 0', 
                     display: 'flex', 
                     alignItems: 'center', 
                     gap: '8px', 
                     color: 'var(--text-secondary)' 
                   }}
                 >
                   <Undo2 size={20} /> 이전 카드 채점 취소하기
                 </button>
               )}
             </div>
          ) : (
             renderSessionSummary()
          )
        )}
      </main>

      {isWordListOpen && <WordListModal onClose={() => setIsWordListOpen(false)} />}
    </div>
  );
}

export default App;
