import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Word {
  original: string;
  furigana: string;
  english: string;
  korean: string;
}

export interface SessionStats {
  passed: Word[];
  failed: Word[];
}

export interface DailyStat {
  learned: number; // Newly marked known today
  reviewed: number; // Re-marked known or practiced today
}

type StoreState = {
  // Global Persistent Data
  showFurigana: boolean;
  knownWords: string[];
  
  // Dashboard & Tracking
  dailyGoal: number;
  currentStreak: number;
  lastStudyDate: string; // "YYYY-MM-DD"
  dailyStats: Record<string, DailyStat>;

  // Active Session State
  sessionDeck: Word[];
  currentIndex: number;
  sessionMode: 'STUDY' | 'TEST';
  sessionStats: SessionStats;
  isSessionActive: boolean;

  // Global Actions
  toggleFurigana: () => void;
  markKnown: (wordOriginal: string) => void;
  resetKnownData: () => void;
  setDailyGoal: (goal: number) => void;
  
  // Session Actions
  startSession: (deck: Word[], mode: 'STUDY' | 'TEST') => void;
  recordAnswer: (word: Word, knewIt: boolean) => void;
  goNextInStudy: () => void;
  goPrevInStudy: () => void;
  undoLastAnswer: () => void;
  endSession: () => void;
  shuffleSessionDeck: () => void;
};

// Helper for pure YYYY-MM-DD
const getTodayStr = () => new Date().toLocaleDateString('en-CA'); 

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      showFurigana: false,
      knownWords: [],
      
      dailyGoal: 50,
      currentStreak: 0,
      lastStudyDate: '',
      dailyStats: {},

      sessionDeck: [],
      currentIndex: 0,
      sessionMode: 'TEST',
      sessionStats: { passed: [], failed: [] },
      isSessionActive: false,
      
      toggleFurigana: () => set((state) => ({ showFurigana: !state.showFurigana })),
      
      setDailyGoal: (goal) => set({ dailyGoal: goal }),

      markKnown: (wordOriginal) => set((state) => {
        if (!state.knownWords.includes(wordOriginal)) {
          return { knownWords: [...state.knownWords, wordOriginal] };
        }
        return state;
      }),
      
      resetKnownData: () => set({ 
        knownWords: [], 
        dailyStats: {}, 
        currentStreak: 0, 
        lastStudyDate: '' 
      }),
      
      startSession: (deck, mode) => set((state) => {
        // Handle streak logic on session start (or should we do it on recordAnswer? On recordAnswer is safer so dropping instantly doesn't count).
        // Let's just track streak here simply if they actually start a session.
        const today = getTodayStr();
        let newStreak = state.currentStreak;
        let pDate = state.lastStudyDate;

        if (pDate !== today) {
          // Check if yesterday
          const yesterdayRaw = new Date();
          yesterdayRaw.setDate(yesterdayRaw.getDate() - 1);
          const yesterday = yesterdayRaw.toLocaleDateString('en-CA');
          
          if (pDate === yesterday) {
            newStreak += 1;
          } else if (pDate !== '') {
            newStreak = 1; // broken streak
          } else {
            newStreak = 1; // first time
          }
        }

        // Make sure today's stat object exists
        const newDailyStats = { ...state.dailyStats };
        if (!newDailyStats[today]) {
          newDailyStats[today] = { learned: 0, reviewed: 0 };
        }

        return {
          sessionDeck: deck,
          currentIndex: 0,
          sessionMode: mode,
          sessionStats: { passed: [], failed: [] },
          isSessionActive: true,
          lastStudyDate: today,
          currentStreak: newStreak,
          dailyStats: newDailyStats
        };
      }),
      
      recordAnswer: (word, knewIt) => set((state) => {
        const stats = { ...state.sessionStats };
        const today = getTodayStr();
        const daily = state.dailyStats[today] ? { ...state.dailyStats[today] } : { learned: 0, reviewed: 0 };
        let newKnown = [...state.knownWords];

        if (knewIt) {
          stats.passed = [...stats.passed, word];
          if (!state.knownWords.includes(word.original)) {
            newKnown.push(word.original);
            daily.learned += 1;
          } else {
            daily.reviewed += 1;
          }
        } else {
          stats.failed = [...stats.failed, word];
          daily.reviewed += 1; // They reviewed it even if they failed
        }

        return {
          sessionStats: stats,
          currentIndex: state.currentIndex + 1,
          knownWords: newKnown,
          dailyStats: { ...state.dailyStats, [today]: daily }
        };
      }),

      shuffleSessionDeck: () => set((state) => {
        const past = state.sessionDeck.slice(0, state.currentIndex);
        const future = [...state.sessionDeck.slice(state.currentIndex)].sort(() => Math.random() - 0.5);
        return { sessionDeck: [...past, ...future] };
      }),

      goNextInStudy: () => set((state) => ({
        currentIndex: Math.min(state.currentIndex + 1, state.sessionDeck.length)
      })),

      goPrevInStudy: () => set((state) => ({
        currentIndex: Math.max(state.currentIndex - 1, 0)
      })),

      undoLastAnswer: () => set((state) => {
        if (state.currentIndex === 0 || state.sessionMode === 'STUDY') return state;
        const prevIndex = state.currentIndex - 1;
        const prevWord = state.sessionDeck[prevIndex];
        
        const newStats = { passed: [...state.sessionStats.passed], failed: [...state.sessionStats.failed] };
        
        const passedIdx = newStats.passed.findIndex(w => w.original === prevWord.original);
        if (passedIdx > -1) newStats.passed.splice(passedIdx, 1);
        
        const failedIdx = newStats.failed.findIndex(w => w.original === prevWord.original);
        if (failedIdx > -1) newStats.failed.splice(failedIdx, 1);

        // Note: For simplicity, we don't rollback the dailyStats/knownWords count on undo realistically.
        // It's a minor edge case.

        return {
          sessionStats: newStats,
          currentIndex: prevIndex
        };
      }),
      
      endSession: () => set({
        isSessionActive: false,
        sessionDeck: [],
        currentIndex: 0,
        sessionStats: { passed: [], failed: [] }
      })
    }),
    {
      name: 'jlpt-storage', // same key
    }
  )
);
