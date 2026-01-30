'use client';

import { Flame, TrendingUp, Target } from 'lucide-react';
import { useDailyQuest } from '@/hooks/useDailyQuest';

export default function QuestCard() {
  const {
    dailySteps,
    currentStreak,
    weeklyProgress,
    overallProgress,
  } = useDailyQuest();

  const DAILY_STEP_TARGET = 8500;
  const stepProgress = Math.min((dailySteps / DAILY_STEP_TARGET) * 100, 100);

  // Get XP earned today from localStorage
  const getTodayXP = () => {
    const activities = JSON.parse(localStorage.getItem('runera_activities') || '[]');
    const today = new Date().toDateString();
    
    return activities
      .filter((activity: any) => {
        const activityDate = new Date(activity.timestamp).toDateString();
        return activityDate === today;
      })
      .reduce((total: number, activity: any) => total + (activity.xpEarned || 0), 0);
  };

  const todayXP = getTodayXP();

  // Get current week days with completion status
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
  const mondayIndex = today === 0 ? 6 : today - 1; // Convert to Monday-based index

  return (
    <div className="mx-5 mb-5 rounded-2xl bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">Quest</h2>
        <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1">
          <Target className="h-3.5 w-3.5 text-blue-600" />
          <span className="text-[10px] font-semibold text-blue-600">
            {Math.round(overallProgress)}%
          </span>
        </div>
      </div>

      {/* Streak Section */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50">
            <Flame className="h-5 w-5 text-orange-500" fill="currentColor" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Streak</p>
            <p className="text-xl font-bold text-gray-900">
              {String(currentStreak).padStart(2, '0')}{' '}
              <span className="text-sm font-normal text-gray-500">Days</span>
            </p>
          </div>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
          <TrendingUp className="h-5 w-5 text-blue-500" />
        </div>
      </div>

      {/* Weekly Progress */}
      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium text-gray-400">
            {new Date().toLocaleString('default', { month: 'short' })}
          </p>
          <p className="text-xs font-medium text-gray-400">
            {new Date().getFullYear()}
          </p>
        </div>
        <div className="flex justify-between gap-1.5">
          {weekDays.map((day, index) => {
            const isCompleted = index < weeklyProgress.daysCompleted;
            const isToday = index === mondayIndex;
            
            // Calculate date for this day
            const today = new Date();
            const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
            const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // Days to Monday
            const date = new Date(today);
            date.setDate(today.getDate() + mondayOffset + index);
            const dateNum = date.getDate();
            
            return (
              <div key={day} className="flex flex-col items-center gap-1.5">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
                    isCompleted
                      ? 'bg-blue-500 text-white'
                      : isToday
                      ? 'border-2 border-blue-500 bg-blue-50 text-blue-500'
                      : 'border-2 border-gray-200 text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-xs font-semibold">{dateNum}</span>
                  )}
                </div>
                <p className={`text-[10px] ${isCompleted ? 'text-blue-500 font-medium' : 'text-gray-400'}`}>
                  {day}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Steps Progress */}
      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Steps</p>
          <p className="text-xs font-semibold text-gray-500">{Math.round(stepProgress)}%</p>
        </div>
        <div className="mb-2 flex items-baseline gap-2">
          <p className="text-xl font-bold text-gray-900">{dailySteps.toLocaleString()}</p>
          <p className="text-sm text-gray-400">/ {DAILY_STEP_TARGET.toLocaleString()}</p>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-300"
            style={{ width: `${stepProgress}%` }}
          />
        </div>
      </div>

      {/* Daily Quests */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Daily Quests</p>
          <p className="text-[10px] font-medium text-gray-400">3 Active</p>
        </div>
        
        <div className="space-y-2">
          {/* Quest 1: Run 5km */}
          <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gradient-to-r from-blue-50 to-transparent p-3 transition-all hover:border-blue-200">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">Run 5 Kilometers</p>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                  <div className="h-full rounded-full bg-blue-500" style={{ width: '60%' }} />
                </div>
                <span className="text-[10px] font-medium text-gray-500">3.0/5.0 km</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-xs font-bold text-yellow-600">+50 XP</span>
              <span className="text-[10px] text-gray-400">6h left</span>
            </div>
          </div>

          {/* Quest 2: Complete 3 Activities */}
          <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gradient-to-r from-green-50 to-transparent p-3 transition-all hover:border-green-200">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-green-500 text-white">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">Complete 3 Activities</p>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                  <div className="h-full rounded-full bg-green-500" style={{ width: '33%' }} />
                </div>
                <span className="text-[10px] font-medium text-gray-500">1/3 done</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-xs font-bold text-yellow-600">+30 XP</span>
              <span className="text-[10px] text-gray-400">12h left</span>
            </div>
          </div>

          {/* Quest 3: XP Today */}
          <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gradient-to-r from-yellow-50 to-transparent p-3 transition-all hover:border-yellow-200">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-yellow-500 text-white">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">XP Earned Today</p>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                  <div className="h-full rounded-full bg-yellow-500" style={{ width: `${Math.min((todayXP / 100) * 100, 100)}%` }} />
                </div>
                <span className="text-[10px] font-medium text-gray-500">{todayXP}/100 XP</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-xs font-bold text-yellow-600">+{todayXP} XP</span>
              <span className="text-[10px] text-gray-400">Today</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
