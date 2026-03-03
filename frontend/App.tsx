
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Home, 
  BookOpen, 
  CheckCircle2, 
  BarChart3, 
  ShieldAlert, 
  Plus,
  Zap,
  ChevronLeft,
  Sparkles,
  Gamepad2,
  Lock,
  ArrowRight,
  History,
  PenLine,
  Save,
  Loader2,
  Ghost,
  Play,
  Layout,
  Image as ImageIcon
} from 'lucide-react';
import { View, UserState, Mood, Ability, JournalEntry, ChatMessage, PetStatus, Moodboard } from './types';
import { DAILY_QUESTS, ABILITIES } from './constants';
import PetDisplay from './components/PetDisplay';
import VibeCheck from './components/VibeCheck';
import BrainDump from './components/BrainDump';
import JournalHistory from './components/JournalHistory';
import JournalEntryDetail from './components/JournalEntryDetail';
import SOSModal from './components/SOSModal';
import GroundingQuest from './components/Quests/GroundingQuest';
import GratitudeQuest from './components/Quests/GratitudeQuest';
import FocusQuest from './components/Quests/FocusQuest';
import MovementQuest from './components/Quests/MovementQuest';
import WaterQuest from './components/Quests/WaterQuest';
import SproutChat from './components/SproutChat';
import DinoGame from './components/Games/DinoGame';
import PacmanGame from './components/Games/PacmanGame';
import BreakoutGame from './components/Games/BreakoutGame';
import MoodboardManager from './components/Moodboard/MoodboardManager';
import { analyzeBrainDump } from './services/geminiService';

const EMO_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [activeQuestId, setActiveQuestId] = useState<string | null>(null);
  const [activeGame, setActiveGame] = useState<'dino' | 'pacman' | 'breakout' | null>(null);
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [sproutMessage, setSproutMessage] = useState<string>("I'm Aura. I'm waiting to hatch... will you help me?");
  const [isSproutTyping, setIsSproutTyping] = useState(false);
  const [isSavingChat, setIsSavingChat] = useState(false);
  
  const [journalSubView, setJournalSubView] = useState<'new' | 'history' | 'detail'>('history');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  const [userState, setUserState] = useState<UserState>(() => {
    const saved = localStorage.getItem('soulpet_state');
    const initialState = saved ? JSON.parse(saved) : {
      xp: 0,
      level: 1,
      moodHistory: [],
      lastCheckIn: null,
      lastQuestTimestamp: Date.now(),
      completedQuests: [],
      unlockedAbilities: [],
      journalEntries: [],
      waterLog: { totalMl: 0, lastLogged: 0, history: [] },
      chatHistory: [],
      moodboards: []
    };
    
    const level1Abilities = ABILITIES.filter(a => a.unlockLevel <= initialState.level).map(a => a.id);
    initialState.unlockedAbilities = Array.from(new Set([...initialState.unlockedAbilities, ...level1Abilities]));
    
    const today = new Date().toISOString().split('T')[0];
    const lastLoggedDate = initialState.waterLog.lastLogged ? new Date(initialState.waterLog.lastLogged).toISOString().split('T')[0] : null;
    if (lastLoggedDate !== today) {
      initialState.waterLog = { totalMl: 0, lastLogged: 0, history: [] };
      initialState.completedQuests = initialState.completedQuests.filter((id: string) => id === 'q5');
    }

    return initialState;
  });

  useEffect(() => {
    try {
      localStorage.setItem('soulpet_state', JSON.stringify(userState));
    } catch (e) {
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded.');
      }
    }
  }, [userState]);

  const petStatus = useMemo(() => {
    const timeSinceLastQuest = Date.now() - userState.lastQuestTimestamp;
    if (timeSinceLastQuest > EMO_THRESHOLD_MS) return PetStatus.EMO;
    if (timeSinceLastQuest > EMO_THRESHOLD_MS / 2) return PetStatus.NEUTRAL;
    return PetStatus.HAPPY;
  }, [userState.lastQuestTimestamp]);

  useEffect(() => {
    if (petStatus === PetStatus.EMO) {
      setSproutMessage("I'm feeling a bit wilted... I need some care. 😔");
    }
  }, [petStatus]);

  const triggerSOS = useCallback(() => {
    setIsSOSOpen(true);
    setSproutMessage("I'm here for you. Please reach out to someone who can help right now. ✨");
  }, []);

  const navigateTo = (newView: View) => {
    setView(newView);
    setActiveQuestId(null);
    setActiveGame(null);
    if (newView === 'journal') setJournalSubView('history');
  };

  const getGrowthUpdate = (prev: UserState, amount: number) => {
    const newXP = prev.xp + amount;
    const newLevel = Math.floor(newXP / 100) + 1;
    const newlyUnlocked = ABILITIES
      .filter(a => a.unlockLevel <= newLevel && !prev.unlockedAbilities.includes(a.id))
      .map(a => a.id);

    return {
      xp: newXP,
      level: newLevel,
      unlockedAbilities: Array.from(new Set([...prev.unlockedAbilities, ...newlyUnlocked])),
      newlyUnlockedNames: newlyUnlocked.map(id => ABILITIES.find(a => a.id === id)?.name).filter(Boolean)
    };
  };

  const addXP = (amount: number) => {
    setUserState(prev => {
      const growth = getGrowthUpdate(prev, amount);
      if (growth.newlyUnlockedNames.length > 0) {
        setSproutMessage(`I've unlocked a new power: ${growth.newlyUnlockedNames[0]}! ✨`);
      }
      return { ...prev, ...growth, lastQuestTimestamp: Date.now() };
    });
  };

  const handleMoodSelect = (mood: Mood) => {
    const today = new Date().toISOString().split('T')[0];
    setUserState(prev => {
      const growth = getGrowthUpdate(prev, 15);
      return {
        ...prev,
        ...growth,
        moodHistory: [...prev.moodHistory, { date: today, mood }],
        lastCheckIn: today,
        lastQuestTimestamp: Date.now()
      };
    });
    setSproutMessage("Your feelings are safe with me. Let's grow together. 💫");
  };

  const completeQuest = (id: string) => {
    setUserState(prev => {
      if (prev.completedQuests.includes(id) && id !== 'q5') return prev;
      const quest = DAILY_QUESTS.find(q => q.id === id);
      const growth = getGrowthUpdate(prev, quest?.xpReward || 0);
      const update = { ...prev, ...growth, lastQuestTimestamp: Date.now() };
      if (id !== 'q5') update.completedQuests = [...prev.completedQuests, id];
      return update;
    });
    setActiveQuestId(null);
    setSproutMessage("I feel your strength! We're leveling up! ⚡");
  };

  const handleLogWater = (amount: number) => {
    setUserState(prev => {
      const newTotal = prev.waterLog.totalMl + amount;
      const isGoalMet = newTotal >= 2500;
      const xpReward = (isGoalMet && !prev.completedQuests.includes('q5')) ? 50 : 5;
      const growth = getGrowthUpdate(prev, xpReward);
      if (isGoalMet && !prev.completedQuests.includes('q5')) setSproutMessage("Daily hydration goal met! I feel so refreshed! 🌊");
      else setSproutMessage("Refreshing! Every drop helps us grow. 💧");
      return {
        ...prev,
        ...growth,
        lastQuestTimestamp: Date.now(),
        waterLog: { totalMl: newTotal, lastLogged: Date.now(), history: [...prev.waterLog.history, { timestamp: Date.now(), amount }] },
        completedQuests: isGoalMet ? Array.from(new Set([...prev.completedQuests, 'q5'])) : prev.completedQuests
      };
    });
  };

  const handleJournalComplete = (xp: number, entry: JournalEntry) => {
    setUserState(prev => {
      const growth = getGrowthUpdate(prev, xp);
      return { ...prev, ...growth, lastQuestTimestamp: Date.now(), journalEntries: [entry, ...prev.journalEntries] };
    });
    setJournalSubView('history');
    setSproutMessage("Entry saved to your diary. I'm proud of you for reflecting. 📖");
  };

  const handleSaveChatToJournal = async () => {
    if (userState.chatHistory.length === 0 || isSavingChat) return;
    setIsSavingChat(true);
    try {
      const chatText = userState.chatHistory.map(msg => `${msg.role === 'user' ? 'Me' : 'Aura'}: ${msg.text}`).join('\n');
      const analysis = await analyzeBrainDump(chatText);
      if (analysis.isCrisis) { triggerSOS(); setIsSavingChat(false); return; }
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        text: `Conversation with Aura:\n\n${chatText}`,
        analysis: analysis
      };
      setUserState(prev => ({
        ...prev,
        ...getGrowthUpdate(prev, 30),
        lastQuestTimestamp: Date.now(),
        journalEntries: [newEntry, ...prev.journalEntries],
        chatHistory: []
      }));
      setJournalSubView('history');
      setSproutMessage("I've tucked our conversation safely into your diary. ✨");
    } catch (error) {
      console.error("Failed to save chat:", error);
      setSproutMessage("I had a little trouble saving that... let's try again later.");
    } finally {
      setIsSavingChat(false);
    }
  };

  const handleNewChatMessage = (message: ChatMessage, isCrisis: boolean) => {
    setUserState(prev => ({ ...prev, chatHistory: [...prev.chatHistory, message] }));
    if (message.role === 'model') setSproutMessage(message.text);
    if (isCrisis) triggerSOS();
  };

  const handleSaveMoodboard = (moodboard: Moodboard) => {
    setUserState(prev => ({
      ...prev,
      moodboards: [moodboard, ...prev.moodboards]
    }));
    addXP(40);
    setSproutMessage("That moodboard looks amazing! Visualizing your feelings is a great practice. 🎨");
  };

  const handlePet = () => {
    const messages = petStatus === PetStatus.EMO 
      ? ["I'm feeling a bit low... maybe a quest would help?", "I miss our growth sessions.", "I'm here, just a bit tired."]
      : ["Purrr... I feel your kindness. 💖", "I'm getting stronger every day!", "Did you know you're doing great?", "I'm here to protect your peace.", "Let's do a quest together!"];
    setSproutMessage(messages[Math.floor(Math.random() * messages.length)]);
  };

  const renderQuestInteraction = () => {
    if (!activeQuestId) return null;
    switch (activeQuestId) {
      case 'q1': return <GroundingQuest onComplete={() => completeQuest('q1')} />;
      case 'q2': return <GratitudeQuest onComplete={() => completeQuest('q2')} />;
      case 'q3': return <FocusQuest onComplete={() => completeQuest('q3')} />;
      case 'q4': return <MovementQuest onComplete={() => completeQuest('q4')} onCrisis={triggerSOS} />;
      case 'q5': return <WaterQuest waterLog={userState.waterLog} onLogWater={handleLogWater} />;
      default: return <div className="glass p-8 rounded-3xl text-center">Quest coming soon!</div>;
    }
  };

  const renderContent = () => {
    if (activeQuestId) {
      return (
        <div className="space-y-6 animate-in fade-in">
          <button onClick={() => setActiveQuestId(null)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" /> Back to Quests
          </button>
          {renderQuestInteraction()}
        </div>
      );
    }

    switch (view) {
      case 'home':
        return (
          <div className="space-y-6 animate-in fade-in duration-500 pb-24">
            <PetDisplay xp={userState.xp} status={petStatus} message={sproutMessage} isTyping={isSproutTyping} onPet={handlePet} />
            <div className="space-y-3">
              {userState.unlockedAbilities.includes('chat') ? (
                <SproutChat userContext={userState} history={userState.chatHistory} onNewMessage={handleNewChatMessage} onTyping={setIsSproutTyping} />
              ) : (
                <div className="glass rounded-[2rem] p-4 flex items-center justify-center gap-2 text-slate-500 border-dashed border-2 border-slate-800">
                  <Lock className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">Unlock Mind Link at LVL 1</span>
                </div>
              )}
              {userState.chatHistory.length > 0 && (
                <button onClick={handleSaveChatToJournal} disabled={isSavingChat} className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-widest text-cyan-400/60 hover:text-cyan-400 transition-colors">
                  {isSavingChat ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                  Save Conversation to Diary
                </button>
              )}
            </div>
            {!userState.lastCheckIn || userState.lastCheckIn !== new Date().toISOString().split('T')[0] ? (
              <VibeCheck onMoodSelect={handleMoodSelect} />
            ) : (
              <div className="glass rounded-3xl p-6 flex items-center justify-between border-emerald-500/20">
                <div>
                  <p className="text-emerald-400 font-bold flex items-center gap-2"><Sparkles className="w-4 h-4" /> Daily Check-in Done</p>
                  <p className="text-slate-400 text-xs mt-1">Aura is resting peacefully.</p>
                </div>
                <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center"><CheckCircle2 className="text-emerald-500 w-5 h-5" /></div>
              </div>
            )}
            <div className="grid grid-cols-3 gap-3">
              <HomeActionButton 
                onClick={() => navigateTo('quests')} 
                icon={<CheckCircle2 className="text-cyan-400 w-6 h-6" />} 
                label="Quests" 
                color="border-cyan-500/10"
              />
              <HomeActionButton 
                onClick={() => navigateTo('moodboard')} 
                icon={<ImageIcon className="text-rose-400 w-6 h-6" />} 
                label="Moodboard" 
                color="border-rose-500/10"
              />
              <HomeActionButton 
                onClick={() => navigateTo('games')} 
                icon={userState.unlockedAbilities.includes('games') ? <Gamepad2 className="text-amber-400 w-6 h-6" /> : <Lock className="text-slate-500 w-6 h-6" />} 
                label="Play Zone" 
                color="border-amber-500/10"
                disabled={!userState.unlockedAbilities.includes('games')}
              />
            </div>
          </div>
        );
      case 'journal':
        return (
          <div className="space-y-6 animate-in fade-in duration-500 pb-24">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-black font-outfit text-white">Mind Diary</h2>
              <div className="flex bg-slate-900 p-1 rounded-2xl border border-white/5">
                <button onClick={() => setJournalSubView('history')} className={`p-2 rounded-xl transition-all ${journalSubView === 'history' ? 'bg-slate-800 text-cyan-400 shadow-lg' : 'text-slate-500'}`}><History className="w-5 h-5" /></button>
                <button onClick={() => setJournalSubView('new')} className={`p-2 rounded-xl transition-all ${journalSubView === 'new' ? 'bg-slate-800 text-purple-400 shadow-lg' : 'text-slate-500'}`}><PenLine className="w-5 h-5" /></button>
              </div>
            </div>
            {journalSubView === 'new' ? <BrainDump onComplete={handleJournalComplete} onCrisis={triggerSOS} canUseVoice={userState.unlockedAbilities.includes('voice')} /> : journalSubView === 'history' ? <JournalHistory entries={userState.journalEntries} onSelectEntry={(entry) => { setSelectedEntry(entry); setJournalSubView('detail'); }} /> : selectedEntry ? <JournalEntryDetail entry={selectedEntry} onBack={() => setJournalSubView('history')} /> : null}
          </div>
        );
      case 'quests':
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500 pb-24">
            <h2 className="text-2xl font-bold font-outfit mb-6">Daily Quests</h2>
            {DAILY_QUESTS.map(quest => {
              const isDone = userState.completedQuests.includes(quest.id);
              const isWater = quest.id === 'q5';
              return (
                <div key={quest.id} onClick={() => setActiveQuestId(quest.id)} className={`glass p-5 rounded-3xl flex items-center gap-4 cursor-pointer transition-all ${isDone && !isWater ? 'opacity-60 grayscale' : 'hover:border-cyan-500/50 hover:scale-[1.02]'}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDone && !isWater ? 'bg-slate-800' : 'bg-cyan-500/10'}`}>{isDone && !isWater ? <CheckCircle2 className="text-slate-500" /> : <Zap className="text-cyan-400" />}</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-200">{quest.title}</h4>
                    <p className="text-xs text-slate-400">{quest.description}</p>
                    {isWater && <div className="mt-2 h-1 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-cyan-500" style={{ width: `${Math.min((userState.waterLog.totalMl / 2500) * 100, 100)}%` }} /></div>}
                  </div>
                  <div className="text-right"><span className="text-xs font-bold text-cyan-400">+{quest.xpReward} XP</span></div>
                </div>
              );
            })}
          </div>
        );
      case 'games':
        return (
          <div className="space-y-6 animate-in fade-in duration-500 pb-24">
            <h2 className="text-2xl font-bold font-outfit">Play Zone</h2>
            {userState.unlockedAbilities.includes('games') ? (
              activeGame === null ? (
                <div className="grid gap-4">
                  <GameCard id="dino" title="Aura Runner" desc="Jump over obstacles to earn XP" icon={<Zap className="text-cyan-400 w-8 h-8" />} color="border-cyan-500/10" onClick={() => setActiveGame('dino')} />
                  <GameCard id="pacman" title="Aura Muncher" desc="Collect sparkles, avoid clouds" icon={<Ghost className="text-purple-400 w-8 h-8" />} color="border-purple-500/10" onClick={() => setActiveGame('pacman')} />
                  <GameCard id="breakout" title="Aura Breaker" desc="Bounce the ball to clear bricks" icon={<Layout className="text-emerald-400 w-8 h-8" />} color="border-emerald-500/10" onClick={() => setActiveGame('breakout')} />
                </div>
              ) : activeGame === 'dino' ? (
                <DinoGame level={userState.level} onComplete={addXP} onBack={() => setActiveGame(null)} />
              ) : activeGame === 'pacman' ? (
                <PacmanGame level={userState.level} onComplete={addXP} onBack={() => setActiveGame(null)} />
              ) : (
                <BreakoutGame level={userState.level} onComplete={addXP} onBack={() => setActiveGame(null)} />
              )
            ) : (
              <div className="glass p-12 rounded-3xl text-center">Unlock at Level 2!</div>
            )}
          </div>
        );
      case 'moodboard':
        return (
          <div className="space-y-6 animate-in fade-in duration-500 pb-24">
            <MoodboardManager 
              moodboards={userState.moodboards} 
              onSave={handleSaveMoodboard} 
              onBack={() => navigateTo('home')} 
            />
          </div>
        );
      case 'stats':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-24">
            <h2 className="text-2xl font-bold font-outfit">Evolution Roadmap</h2>
            <div className="space-y-4">
              {ABILITIES.map(ability => {
                const isUnlocked = userState.unlockedAbilities.includes(ability.id);
                return (
                  <div key={ability.id} className={`glass p-5 rounded-2xl flex items-center gap-4 transition-all ${isUnlocked ? 'border-emerald-500/30 bg-emerald-500/5' : 'opacity-50'}`}>
                    <div className={`p-4 rounded-2xl ${isUnlocked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>{isUnlocked ? <Zap className="w-6 h-6" /> : <Lock className="w-6 h-6" />}</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-base text-white">{ability.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">{ability.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Unlock</div>
                      <div className={`text-sm font-black ${isUnlocked ? 'text-emerald-400' : 'text-slate-400'}`}>LVL {ability.unlockLevel}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-slate-950 text-slate-200 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-purple-600/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-emerald-600/10 rounded-full blur-[100px]" />
      <header className="p-6 flex justify-between items-center z-10">
        <div>
          <h1 className="text-2xl font-black font-outfit tracking-tighter text-white flex items-center gap-2">SoulPet <span className="text-cyan-400 text-xs bg-cyan-400/10 px-2 py-0.5 rounded-full">EVO</span></h1>
          <p className="text-slate-500 text-xs font-medium">Level up your mind</p>
        </div>
        <button onClick={() => setIsSOSOpen(true)} className="p-3 bg-rose-500/10 hover:bg-rose-500/20 rounded-2xl transition-colors group"><ShieldAlert className="text-rose-500 w-6 h-6 group-hover:scale-110 transition-transform" /></button>
      </header>
      <main className="flex-1 px-6 z-10 overflow-y-auto">{renderContent()}</main>
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-[calc(448px-3rem)] glass rounded-[2.5rem] p-2 flex justify-between items-center z-20 shadow-2xl border-white/5">
        <NavButton active={view === 'home'} onClick={() => navigateTo('home')} icon={<Home />} label="Home" />
        <NavButton active={view === 'quests'} onClick={() => navigateTo('quests')} icon={<CheckCircle2 />} label="Quests" />
        <div className="relative -top-8">
          <button onClick={() => { setView('quests'); setActiveQuestId(null); setActiveGame(null); }} className="w-16 h-16 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-full flex items-center justify-center shadow-xl shadow-purple-900/40 border-4 border-slate-950 hover:scale-110 transition-transform"><Plus className="text-white w-8 h-8" /></button>
        </div>
        <NavButton active={view === 'stats'} onClick={() => navigateTo('stats')} icon={<BarChart3 />} label="Evo" />
        <NavButton active={view === 'journal'} onClick={() => navigateTo('journal')} icon={<BookOpen />} label="Journal" />
      </nav>
      <SOSModal isOpen={isSOSOpen} onClose={() => setIsSOSOpen(false)} />
    </div>
  );
};

const HomeActionButton: React.FC<{ onClick: () => void; icon: React.ReactNode; label: string; color: string; disabled?: boolean }> = ({ onClick, icon, label, color, disabled }) => (
  <button 
    onClick={onClick} 
    disabled={disabled}
    className={`glass p-4 rounded-3xl flex flex-col items-center gap-2 transition-all group ${color} ${disabled ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:bg-slate-800/80'}`}
  >
    <div className="p-2 bg-white/5 rounded-xl group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <span className="font-bold text-[10px] uppercase tracking-wider">{label}</span>
  </button>
);

const GameCard: React.FC<{ id: string; title: string; desc: string; icon: React.ReactNode; color: string; onClick: () => void }> = ({ title, desc, icon, color, onClick }) => (
  <button onClick={onClick} className={`glass p-6 rounded-[2rem] flex items-center justify-between group hover:bg-slate-800/80 transition-all ${color}`}><div className="flex items-center gap-4"><div className="p-4 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">{icon}</div><div className="text-left"><h4 className="text-lg font-black text-white">{title}</h4><p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{desc}</p></div></div><Play className="text-white/20 group-hover:text-white transition-colors w-5 h-5" /></button>
);

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center w-14 h-14 rounded-3xl transition-all ${active ? 'text-cyan-400 bg-cyan-400/10' : 'text-slate-500 hover:text-slate-300'}`}>{React.cloneElement(icon as React.ReactElement, { size: 20 })}<span className="text-[10px] font-bold mt-1">{label}</span></button>
);

export default App;
