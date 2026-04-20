import { useState } from 'react';
import { Settings, RefreshCw, XCircle, Play, Undo2, Flame } from 'lucide-react';
import { useStore, type Word } from './store/useStore';
import Flashcard from './components/Flashcard';
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
    setDailyGoal
  } = useStore();

  // Local Form State
  const [selectedLevels, setSelectedLevels] = useState<string[]>(['N5']);
  const [batchSize, setBatchSize] = useState<number | 'ALL'>(20);
  const [includeKnown, setIncludeKnown] = useState<boolean>(false);
  const [shuffle, setShuffle] = useState<boolean>(true);
  const [modeSelect, setModeSelect] = useState<'STUDY' | 'TEST'>('STUDY');

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
    <div className="dashboard-card">
      <div className="dashboard-header">
        <span>내 학습 진도</span>
        {currentStreak > 0 && (
          <div className="streak-badge">
            <Flame size={18} /> {currentStreak}일 연속!
          </div>
        )}
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '5px' }}>
          <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>
            {todayLearned} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>/ {dailyGoal} 단어</span>
          </span>
          <button className="icon-btn" onClick={handleEditGoal} style={{ padding: '4px' }}>
            <Settings size={18} />
          </button>
        </div>
        
        <div className="progress-container">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
        
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px', textAlign: 'right' }}>
          오늘 복습한 단어: {dailyStats[todayStr]?.reviewed || 0}개
        </div>
      </div>
    </div>
  );

  const renderHomeForm = () => (
    <div className="config-scroll-area">
      
      {renderDashboard()}

      <div className="config-group">
        <div className="config-title">출제 급수 (다중 선택 가능)</div>
        <div className="grid-select">
          {ALL_LEVELS.map(lvl => (
            <button
              key={lvl}
              onClick={() => toggleLevel(lvl)}
              className={`btn-select ${selectedLevels.includes(lvl) ? 'active' : ''}`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      <div className="config-group">
        <div className="config-title">학습 모드 선택</div>
        <div className="grid-select" style={{ display: 'flex', gap: '10px' }}>
          <button 
            style={{ flex: 1, padding: '15px' }} 
            onClick={() => setModeSelect('STUDY')} 
            className={`btn-select ${modeSelect === 'STUDY' ? 'active' : ''}`}
          >
            📖 편하게 쭉 훑어보기
          </button>
          <button 
            style={{ flex: 1, padding: '15px' }} 
            onClick={() => setModeSelect('TEST')} 
            className={`btn-select ${modeSelect === 'TEST' ? 'active' : ''}`}
          >
            📝 실전 암기 테스트
          </button>
        </div>
      </div>

      <div className="config-group">
        <div className="config-title">가져올 단어수</div>
        <div className="grid-select">
          {[20, 50, 100, 'ALL'].map(size => (
            <button
              key={size}
              onClick={() => setBatchSize(size as number | 'ALL')}
              className={`btn-select ${batchSize === size ? 'active' : ''}`}
            >
              {size === 'ALL' ? '전체' : `${size}개`}
            </button>
          ))}
        </div>
      </div>

      <div className="config-group" style={{ display: 'flex', gap: '15px' }}>
        <div style={{ flex: 1 }}>
          <div className="config-title">단어 섞기</div>
          <div className="grid-select">
            <button onClick={() => setShuffle(false)} className={`btn-select ${!shuffle ? 'active' : ''}`}>기본</button>
            <button onClick={() => setShuffle(true)} className={`btn-select ${shuffle ? 'active' : ''}`}>랜덤</button>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div className="config-title">오답노트 모드</div>
          <div className="grid-select">
            <button onClick={() => setIncludeKnown(false)} className={`btn-select ${!includeKnown ? 'active' : ''}`}>적용</button>
            <button onClick={() => setIncludeKnown(true)} className={`btn-select ${includeKnown ? 'active' : ''}`}>미적용</button>
          </div>
        </div>
      </div>

      <button className="btn-primary" onClick={handleStartSession} disabled={selectedLevels.length === 0}>
        <Play size={20} style={{ verticalAlign: 'middle', marginRight: '5px' }} /> 
        {modeSelect === 'STUDY' ? '열람 시작' : '테스트 시작'}
      </button>

      {/* Global Reset */}
      {knownWords.length > 0 && (
        <button 
          className="icon-btn" 
          onClick={() => {
            if(window.confirm('모든 누적 학습 기록과 일일 통계를 초기화하시겠습니까?')) {
              resetKnownData();
            }
          }}
          style={{ marginTop: '30px', marginLeft: 'auto', marginRight: 'auto', color: 'var(--error-color)', display: 'flex', gap: '8px' }}
        >
          <RefreshCw size={18} /> 전체 누적기록 초기화 ({knownWords.length}단어)
        </button>
      )}
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
        <div className="stat-card">
          <div className="stat-row" style={{ justifyContent: 'center' }}>
            🎉 단어를 모두 한 번씩 훑어보셨군요!
          </div>
        </div>
      )}

      <button className="btn-primary" onClick={endSession}>
        홈으로 돌아가기
      </button>
    </div>
  );

  const activeWord = sessionDeck[currentIndex];
  
  return (
    <div className="app-container">
      {/* Header during Session */}
      {isSessionActive && currentIndex < sessionDeck.length && (
        <header className="header">
          <button className="icon-btn" onClick={() => {
            if(window.confirm('현재 세션을 닫고 홈으로 가시겠습니까?')) endSession();
          }}>
            <XCircle size={24} />
          </button>
          
          <div className="header-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {sessionMode === 'STUDY' ? '📖 열람 모드' : '📝 테스트 모드'}
          </div>
          
          <div className="word-counter">
            {currentIndex + 1} / {sessionDeck.length}
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
    </div>
  );
}

export default App;
