import { useState, useEffect } from 'react'
import type { Workout } from '../types'
import './WorkoutSelector.css'

interface WorkoutSelectorProps {
  onStartWorkout: (workout: Workout) => void
  onShowSettings: () => void
}

const WorkoutSelector = ({ onStartWorkout, onShowSettings }: WorkoutSelectorProps) => {
  const [workouts, setWorkouts] = useState<Workout[]>([])

  useEffect(() => {
    const savedWorkouts = localStorage.getItem('tabata-workouts')
    if (savedWorkouts) {
      setWorkouts(JSON.parse(savedWorkouts))
    } else {
      // Create default workout
      const defaultWorkout: Workout = {
        id: 'default',
        name: 'Classic Tabata',
        exerciseDuration: 20,
        restDuration: 10,
        exerciseCount: 8,
        roundCount: 1,
        roundRestDuration: 60
      }
      setWorkouts([defaultWorkout])
      localStorage.setItem('tabata-workouts', JSON.stringify([defaultWorkout]))
    }
  }, [])

  return (
    <div className="workout-selector">
      <div className="header">
        <h1>Tabata Timer</h1>
        <p>Select a workout to begin</p>
      </div>
      
      <div className="workout-list">
        {workouts.map(workout => (
          <div key={workout.id} className="workout-card" onClick={() => onStartWorkout(workout)}>
            <h3>{workout.name}</h3>
            <div className="workout-details">
              <span>{workout.exerciseDuration}s work / {workout.restDuration}s rest</span>
              <span>{workout.exerciseCount} exercises × {workout.roundCount} rounds</span>
            </div>
          </div>
        ))}
      </div>
      
      <button className="settings-button" onClick={onShowSettings}>
        ⚙️ Manage Workouts
      </button>
    </div>
  )
}

export default WorkoutSelector
