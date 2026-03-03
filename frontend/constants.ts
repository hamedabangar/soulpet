
import { Quest, Mood, Ability } from './types';

export const ABILITIES: Ability[] = [
  { id: 'chat', name: 'Mind Link', description: 'Chat with your pet about your day.', unlockLevel: 1, icon: 'MessageCircle' },
  { id: 'voice', name: 'Echo Voice', description: 'Speak your thoughts directly to the journal.', unlockLevel: 1, icon: 'Mic' },
  { id: 'games', name: 'Play Zone', description: 'Unlock simple games to de-stress.', unlockLevel: 2, icon: 'Gamepad2' },
  { id: 'evolution', name: 'Final Form', description: 'Your pet reaches its ultimate guardian state.', unlockLevel: 4, icon: 'Zap' }
];

export const DAILY_QUESTS: Quest[] = [
  {
    id: 'q1',
    title: 'The Grounding Quest',
    description: 'Take 5 deep breaths with your Pet.',
    xpReward: 20,
    type: 'grounding'
  },
  {
    id: 'q2',
    title: 'The Gratitude Quest',
    description: 'Write one thing that went okay today.',
    xpReward: 15,
    type: 'gratitude'
  },
  {
    id: 'q3',
    title: 'The Focus Quest',
    description: 'Stay in the app for 1 minute of quiet time.',
    xpReward: 30,
    type: 'focus'
  },
  {
    id: 'q4',
    title: 'The Movement Quest',
    description: 'Stand up and stretch for 30 seconds.',
    xpReward: 25,
    type: 'movement'
  },
  {
    id: 'q5',
    title: 'Hydration Quest',
    description: 'Drink 2.5L of water today (250ml per hour).',
    xpReward: 5, // Reward per cup
    type: 'water'
  }
];

export const MOOD_CONFIG = {
  [Mood.GREAT]: { emoji: '✨', color: 'bg-emerald-400', label: 'Amazing' },
  [Mood.GOOD]: { emoji: '🙂', color: 'bg-cyan-400', label: 'Good' },
  [Mood.OKAY]: { emoji: '😐', color: 'bg-slate-400', label: 'Okay' },
  [Mood.MEH]: { emoji: '😕', color: 'bg-orange-400', label: 'Meh' },
  [Mood.BAD]: { emoji: '😔', color: 'bg-rose-400', label: 'Rough' },
};

export const CRISIS_RESOURCES = [
  { name: 'Crisis Text Line', contact: 'Text HOME to 741741', link: 'sms:741741' },
  { name: '988 Suicide & Crisis Lifeline', contact: 'Call or Text 988', link: 'tel:988' },
  { name: 'The Trevor Project (LGBTQ+)', contact: '1-866-488-7386', link: 'tel:18664887386' }
];
