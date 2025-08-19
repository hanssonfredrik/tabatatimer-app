import { useState, useEffect } from 'react'
import type { Workout } from '../types'
import { useSwipeBack } from '../hooks/useSwipeBack'
import './Settings.css'

interface SettingsProps {
  onBack: () => void
}

const Settings = ({ onBack }: SettingsProps) => {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  
  // Add swipe back gesture support
  const swipeContainerRef = useSwipeBack({ onSwipeBack: onBack })

  useEffect(() => {
    const savedWorkouts = localStorage.getItem('tabata-workouts')
    if (savedWorkouts) {
      setWorkouts(JSON.parse(savedWorkouts))
    }
  }, [])

  const saveWorkouts = (newWorkouts: Workout[]) => {
    setWorkouts(newWorkouts)
    localStorage.setItem('tabata-workouts', JSON.stringify(newWorkouts))
  }

  const createNewWorkout = () => {
    const newWorkout: Workout = {
      id: Date.now().toString(),
      name: 'New Workout',
      exerciseDuration: 20,
      restDuration: 10,
      exerciseCount: 8,
      roundCount: 1,
      roundRestDuration: 60
    }
    setEditingWorkout(newWorkout)
    setIsCreating(true)
  }

  const editWorkout = (workout: Workout) => {
    setEditingWorkout(workout)
    setIsCreating(false)
  }

  const deleteWorkout = (id: string) => {
    if (workouts.length <= 1) {
      alert('You must have at least one workout!')
      return
    }
    
    if (confirm('Are you sure you want to delete the selected workout?')) {
      const newWorkouts = workouts.filter(w => w.id !== id)
      saveWorkouts(newWorkouts)
    }
  }

  const saveWorkout = (workout: Workout) => {
    if (isCreating) {
      saveWorkouts([...workouts, workout])
    } else {
      const newWorkouts = workouts.map(w => w.id === workout.id ? workout : w)
      saveWorkouts(newWorkouts)
    }
    setEditingWorkout(null)
    setIsCreating(false)
  }

  const cancelEdit = () => {
    setEditingWorkout(null)
    setIsCreating(false)
  }

  if (editingWorkout) {
    return (
      <WorkoutEditor
        workout={editingWorkout}
        isCreating={isCreating}
        onSave={saveWorkout}
        onCancel={cancelEdit}
      />
    )
  }

  return (
    <div className="settings" ref={swipeContainerRef}>
      <div className="settings-header">
        <button className="back-button" onClick={onBack}>
          ‹ Back
        </button>
        <h2>Manage Workouts</h2>
      </div>

      <div className="workout-list">
        {workouts.map(workout => (
          <div key={workout.id} className="workout-item">
            <div className="workout-details">
              <h3>{workout.name}</h3>
              <div className="details-grid">
                <span>Work: {workout.exerciseDuration}s</span>
                <span>Rest: {workout.restDuration}s</span>
                <span>Exercises: {workout.exerciseCount}</span>
                <span>Rounds: {workout.roundCount}</span>
                <span>Round Rest: {workout.roundRestDuration}s</span>
              </div>
            </div>
            <div className="workout-actions">
              <button onClick={() => editWorkout(workout)}>Edit</button>
              <button onClick={() => deleteWorkout(workout.id)} disabled={workouts.length <= 1}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="add-workout-button" onClick={createNewWorkout}>
        + Add New Workout
      </button>
    </div>
  )
}

interface WorkoutEditorProps {
  workout: Workout
  isCreating: boolean
  onSave: (workout: Workout) => void
  onCancel: () => void
}

const WorkoutEditor = ({ workout, isCreating, onSave, onCancel }: WorkoutEditorProps) => {
  const [formData, setFormData] = useState(workout)
  
  // Add swipe back gesture support
  const swipeContainerRef = useSwipeBack({ onSwipeBack: onCancel })

  const handleChange = (field: keyof Workout, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNumberChange = (field: keyof Workout, value: string) => {
    if (value === '') {
      // Allow empty string temporarily for editing
      setFormData(prev => ({
        ...prev,
        [field]: '' as any
      }))
    } else {
      const num = parseInt(value)
      if (!isNaN(num)) {
        setFormData(prev => ({
          ...prev,
          [field]: num
        }))
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert('Please enter a workout name')
      return
    }
    
    // Ensure all numeric fields have valid values
    const validatedData: Workout = {
      ...formData,
      exerciseDuration: formData.exerciseDuration || 20,
      restDuration: formData.restDuration || 10,
      exerciseCount: formData.exerciseCount || 8,
      roundCount: formData.roundCount || 1,
      roundRestDuration: formData.roundRestDuration || 60
    }
    
    onSave(validatedData)
  }

  return (
    <div className="workout-editor" ref={swipeContainerRef}>
      <div className="editor-header">
        <h2>{isCreating ? 'Create' : 'Edit'} Workout</h2>
      </div>

      <form onSubmit={handleSubmit} className="editor-form">
        <div className="form-group">
          <label htmlFor="name">Workout Name</label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter workout name"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="exerciseDuration">Exercise Duration (1-180s)</label>
            <input
              id="exerciseDuration"
              type="number"
              min="1"
              max="180"
              value={formData.exerciseDuration}
              onChange={(e) => handleNumberChange('exerciseDuration', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="restDuration">Rest Duration (0-60s)</label>
            <input
              id="restDuration"
              type="number"
              min="0"
              max="60"
              value={formData.restDuration}
              onChange={(e) => handleNumberChange('restDuration', e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="exerciseCount">Exercises per Round (1-20)</label>
            <input
              id="exerciseCount"
              type="number"
              min="1"
              max="20"
              value={formData.exerciseCount}
              onChange={(e) => handleNumberChange('exerciseCount', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="roundCount">Number of Rounds (1-25)</label>
            <input
              id="roundCount"
              type="number"
              min="1"
              max="25"
              value={formData.roundCount}
              onChange={(e) => handleNumberChange('roundCount', e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="roundRestDuration">Rest Between Rounds (0-180s)</label>
          <input
            id="roundRestDuration"
            type="number"
            min="0"
            max="180"
            value={formData.roundRestDuration}
            onChange={(e) => handleNumberChange('roundRestDuration', e.target.value)}
          />
        </div>

        <div className="editor-actions">
          <button type="button" onClick={onCancel} className="cancel-button">
            Cancel
          </button>
          <button type="submit" className="save-button">
            {isCreating ? 'Create' : 'Save'} Workout
          </button>
        </div>
      </form>
    </div>
  )
}

export default Settings
