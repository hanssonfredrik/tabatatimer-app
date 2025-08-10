export interface Workout {
  id: string
  name: string
  exerciseDuration: number // 1-180 seconds
  restDuration: number // 0-60 seconds
  exerciseCount: number // 1-20 exercises per round
  roundCount: number // 1-25 rounds
  roundRestDuration: number // 0-180 seconds between rounds
}

export type TimerState = 'stopped' | 'ready' | 'exercise' | 'rest' | 'roundRest' | 'paused' | 'completed'

export interface TimerProgress {
  currentRound: number
  currentExercise: number
  currentTime: number
  state: TimerState
}
