import { useState } from 'react'
import './App.css'
import TabataTimer from './components/TabataTimer.tsx'
import Settings from './components/Settings.tsx'
import WorkoutSelector from './components/WorkoutSelector.tsx'
import type { Workout, TimerState } from './types.ts'

function App() {
  const [currentView, setCurrentView] = useState<'selector' | 'timer' | 'settings'>('selector')
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)
  const [timerState, setTimerState] = useState<TimerState>('stopped')

  const handleStartWorkout = (workout: Workout) => {
    setSelectedWorkout(workout)
    setCurrentView('timer')
    setTimerState('stopped')
  }

  const handleBackToSelector = () => {
    setCurrentView('selector')
    setTimerState('stopped')
    setSelectedWorkout(null)
  }

  const handleShowSettings = () => {
    setCurrentView('settings')
  }

  const handleBackFromSettings = () => {
    setCurrentView('selector')
  }

  return (
    <div className="app">
      <div className="container">
        {currentView === 'selector' && (
          <WorkoutSelector 
            onStartWorkout={handleStartWorkout}
            onShowSettings={handleShowSettings}
          />
        )}
        
        {currentView === 'timer' && selectedWorkout && (
          <TabataTimer 
            workout={selectedWorkout}
            onBack={handleBackToSelector}
            timerState={timerState}
            setTimerState={setTimerState}
          />
        )}
        
        {currentView === 'settings' && (
          <Settings onBack={handleBackFromSettings} />
        )}
      </div>
    </div>
  )
}

export default App
