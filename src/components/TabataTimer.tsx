import { useState, useEffect, useRef } from 'react'
import type { Workout, TimerState } from '../types'
import './TabataTimer.css'

interface TabataTimerProps {
  workout: Workout
  onBack: () => void
  timerState: TimerState
  setTimerState: (state: TimerState) => void
}

const TabataTimer = ({ workout, onBack, timerState, setTimerState }: TabataTimerProps) => {
  const [currentRound, setCurrentRound] = useState(1)
  const [currentExercise, setCurrentExercise] = useState(1)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [totalTime, setTotalTime] = useState(0)
  const [previousState, setPreviousState] = useState<TimerState>('exercise') // Track state before pausing
  const [pausedTimeRemaining, setPausedTimeRemaining] = useState<number | null>(null) // Store time when paused
  const intervalRef = useRef<number | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  // Initialize audio context
  useEffect(() => {
    // Don't create AudioContext until user interaction
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
      // Release wake lock when component unmounts
      if (wakeLockRef.current) {
        wakeLockRef.current.release()
      }
    }
  }, [])

  // Initialize audio context on first user interaction
  const initializeAudio = () => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        console.log('AudioContext created:', audioContextRef.current.state)
        
        // Resume the audio context if it's suspended
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume().then(() => {
            console.log('AudioContext resumed')
          })
        }
      } catch (error) {
        console.warn('Audio not supported:', error)
      }
    }
  }

  // Request wake lock to prevent screen from sleeping during workout
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen')
        console.log('Wake lock acquired - screen will stay on during workout')
        
        wakeLockRef.current.addEventListener('release', () => {
          console.log('Wake lock released')
        })
      } else {
        console.log('Wake Lock API not supported')
      }
    } catch (error) {
      console.warn('Failed to request wake lock:', error)
    }
  }

  // Release wake lock
  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release()
      wakeLockRef.current = null
    }
  }

  // Play beep sound with pulse-like characteristics
  const playBeep = (frequency: number = 800, duration: number = 100) => {
    if (!audioContextRef.current) {
      initializeAudio()
    }
    
    if (!audioContextRef.current || audioContextRef.current.state !== 'running') {
      console.warn('AudioContext not ready:', audioContextRef.current?.state)
      return
    }
    
    try {
      const oscillator = audioContextRef.current.createOscillator()
      const gainNode = audioContextRef.current.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContextRef.current.destination)
      
      oscillator.frequency.value = frequency
      oscillator.type = 'sine'
      
      // Create a pulse-like envelope: quick attack, sustain, quick decay
      const currentTime = audioContextRef.current.currentTime
      const attackTime = 0.01 // 10ms attack
      const sustainTime = duration / 1000 - 0.02 // Sustain for most of duration
      const releaseTime = 0.01 // 10ms release
      
      gainNode.gain.setValueAtTime(0, currentTime)
      gainNode.gain.linearRampToValueAtTime(0.4, currentTime + attackTime) // Quick attack to medium volume
      gainNode.gain.setValueAtTime(0.4, currentTime + attackTime + sustainTime) // Sustain
      gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + attackTime + sustainTime + releaseTime) // Quick decay
      
      oscillator.start(currentTime)
      oscillator.stop(currentTime + duration / 1000)
      
      console.log(`Playing pulse beep: ${frequency}Hz for ${duration}ms`)
    } catch (error) {
      console.warn('Audio playback failed:', error)
    }
  }

  // Play countdown beeps (1 beep per second for 3 seconds)
  const playCountdownBeeps = () => {
    // First beep immediately
    playBeep(600, 100)
    // Second beep after 1 second
    setTimeout(() => playBeep(600, 100), 1000)
    // Third beep after 2 seconds
    setTimeout(() => playBeep(600, 100), 2000)
  }

  // Play completion sound (inspiring fanfare)
  const playCompletionSound = () => {
    // Play an ascending fanfare with harmonies
    const melody = [
      { freq: 440, delay: 0 },     // A
      { freq: 554, delay: 200 },   // C#
      { freq: 659, delay: 400 },   // E
      { freq: 880, delay: 600 },   // A (octave)
      { freq: 1047, delay: 800 },  // C (octave)
      // Add some harmony notes
      { freq: 659, delay: 600 },   // E harmony with A
      { freq: 880, delay: 800 },   // A harmony with C
      { freq: 1319, delay: 1000 }, // E (high) - triumphant ending
    ]
    
    melody.forEach(({ freq, delay }) => {
      setTimeout(() => playBeep(freq, 400), delay)
    })
    
    console.log('Playing inspiring completion fanfare')
  }

  // Initialize timer based on current state
  const initializeTimer = () => {
    // If we're resuming from a pause, use the stored time
    if (pausedTimeRemaining !== null) {
      setTimeRemaining(pausedTimeRemaining)
      setPausedTimeRemaining(null) // Clear the stored time
      return
    }
    
    switch (timerState) {
      case 'exercise':
        setTimeRemaining(workout.exerciseDuration)
        setTotalTime(workout.exerciseDuration)
        break
      case 'rest':
        setTimeRemaining(workout.restDuration)
        setTotalTime(workout.restDuration)
        break
      case 'roundRest':
        setTimeRemaining(workout.roundRestDuration)
        setTotalTime(workout.roundRestDuration)
        break
      case 'ready':
        setTimeRemaining(5) // 5 second countdown to start
        setTotalTime(5)
        break
    }
  }

  // Start timer
  const startTimer = () => {
    // Initialize audio on first user interaction
    initializeAudio()
    
    // Request wake lock to keep screen on during workout
    requestWakeLock()
    
    if (timerState === 'stopped') {
      setTimerState('ready')
      setCurrentRound(1)
      setCurrentExercise(1)
    } else if (timerState === 'ready') {
      setTimerState('exercise')
    }
  }

  // Pause/Resume timer
  const pauseTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setPreviousState(timerState)
    setPausedTimeRemaining(timeRemaining) // Store the remaining time
    setTimerState('paused')
  }

  const resumeTimer = () => {
    if (timerState === 'paused') {
      // Resume to the previous state
      setTimerState(previousState)
      // Don't clear pausedTimeRemaining here - let the useEffect handle it
    }
  }

  // Stop/Pause timer
  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    
    // Release wake lock when stopping
    releaseWakeLock()
    
    // Clear any paused time
    setPausedTimeRemaining(null)
    
    setTimerState('stopped')
    setCurrentRound(1)
    setCurrentExercise(1)
  }

  // Timer logic
  useEffect(() => {
    if (timerState !== 'stopped' && timerState !== 'completed' && timerState !== 'paused') {
      initializeTimer()
      
      intervalRef.current = window.setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Time's up, move to next phase
            if (timerState === 'ready') {
              console.log('Ready period complete, starting exercise')
              setTimerState('exercise')
              return workout.exerciseDuration
            } else if (timerState === 'exercise') {
              // Exercise complete
              if (currentExercise < workout.exerciseCount) {
                // More exercises in this round
                if (workout.restDuration > 0) {
                  console.log('Exercise complete, starting rest')
                  setTimerState('rest')
                  return workout.restDuration
                } else {
                  // No rest, go directly to next exercise
                  console.log('Exercise complete, starting next exercise (no rest)')
                  setTimerState('exercise')
                  setCurrentExercise(prev => prev + 1)
                  return workout.exerciseDuration
                }
              } else {
                // Round complete
                if (currentRound < workout.roundCount) {
                  // More rounds to go
                  console.log('Round complete, starting round rest or next round')
                  setCurrentRound(prev => prev + 1)
                  setCurrentExercise(1)
                  if (workout.roundRestDuration > 0) {
                    setTimerState('roundRest')
                    return workout.roundRestDuration
                  } else {
                    // No round rest, start next round
                    setTimerState('exercise')
                    return workout.exerciseDuration
                  }
                } else {
                  // All rounds complete
                  console.log('All rounds complete!')
                  setTimerState('completed')
                  playCompletionSound()
                  releaseWakeLock() // Release wake lock when workout completes
                  return 0
                }
              }
            } else if (timerState === 'rest') {
              // Rest complete, next exercise
              console.log('Rest complete, starting next exercise')
              setCurrentExercise(prev => prev + 1)
              setTimerState('exercise')
              return workout.exerciseDuration
            } else if (timerState === 'roundRest') {
              // Round rest complete, start next round
              console.log('Round rest complete, starting next round')
              setTimerState('exercise')
              return workout.exerciseDuration
            }
            return prev - 1
          }
          
          // Play warning beeps - start 3 seconds before end
          if (prev === 4) {
            if (timerState === 'ready') {
              console.log('Starting countdown beeps before workout begins')
              playCountdownBeeps()
            } else if (timerState === 'exercise') {
              console.log('Starting countdown beeps before exercise ends')
              playCountdownBeeps()
            } else if (timerState === 'rest') {
              console.log('Starting countdown beeps before rest ends (next exercise starting)')
              playCountdownBeeps()
            } else if (timerState === 'roundRest') {
              console.log('Starting countdown beeps before round rest ends (next round starting)')
              playCountdownBeeps()
            }
          }
          
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [timerState, currentExercise, currentRound, workout])

  // Calculate progress for animation
  const progress = totalTime > 0 ? (totalTime - timeRemaining) / totalTime : 0
  const circumference = 2 * Math.PI * 90 // radius = 90
  const strokeDashoffset = circumference - (progress * circumference)

  const getStateText = () => {
    switch (timerState) {
      case 'ready': return 'Get Ready!'
      case 'exercise': return 'WORK!'
      case 'rest': return 'Rest'
      case 'roundRest': return 'Round Rest'
      case 'paused': return 'Paused'
      case 'completed': return 'Complete!'
      default: return 'Ready'
    }
  }

  const getStateColor = () => {
    switch (timerState) {
      case 'exercise': return '#ef4444'
      case 'rest': return '#22c55e'
      case 'roundRest': return '#3b82f6'
      case 'ready': return '#f59e0b'
      case 'paused': return '#6b7280'
      case 'completed': return '#8b5cf6'
      default: return '#6b7280'
    }
  }

  return (
    <div className="tabata-timer">
      <div className="timer-header">
        <button className="back-button" onClick={onBack}>
          ‹ Back
        </button>
        <div className="workout-info">
          <h2>{workout.name}</h2>
          <div className="counters">
            <span>Exercise: {currentExercise}/{workout.exerciseCount}</span>
            <span>Round: {currentRound}/{workout.roundCount}</span>
          </div>
        </div>
      </div>

      <div className="timer-display">
        <div className="circular-timer">
          <svg viewBox="0 0 200 200" className="timer-svg">
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke={getStateColor()}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 100 100)"
              className="progress-circle"
            />
          </svg>
          <div className={`timer-content ${timerState === 'exercise' ? 'pulse-animation' : ''}`}>
            <div className="state-text" style={{ color: getStateColor() }}>
              {getStateText()}
            </div>
            <div className="time-text">
              {timeRemaining}
            </div>
          </div>
        </div>
      </div>

      <div className="timer-controls">
        {timerState === 'stopped' || timerState === 'ready' ? (
          <button className="control-button start" onClick={startTimer}>
            {timerState === 'ready' ? 'Start Exercise' : 'Start Workout'}
          </button>
        ) : timerState === 'paused' ? (
          <div className="control-buttons-group">
            <button className="control-button resume" onClick={resumeTimer}>
              Resume
            </button>
            <button className="control-button stop" onClick={stopTimer}>
              Stop
            </button>
          </div>
        ) : timerState === 'completed' ? (
          <button className="control-button restart" onClick={() => {
            setTimerState('stopped')
            setCurrentRound(1)
            setCurrentExercise(1)
          }}>
            Restart Workout
          </button>
        ) : (
          <div className="control-buttons-group">
            <button className="control-button pause" onClick={pauseTimer}>
              Pause
            </button>
            <button className="control-button stop" onClick={stopTimer}>
              Stop
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default TabataTimer
