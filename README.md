# 🏃‍♀️ Tabata Timer App

A modern, feature-rich Tabata timer application built with React, TypeScript, and Vite. Perfect for high-intensity interval training (HIIT) workouts with customizable routines, audio feedback, and an inspiring blue-themed design.

## 🌐 Live Demo

**Try it now: [https://yellow-smoke-0dac6c003.2.azurestaticapps.net/](https://yellow-smoke-0dac6c003.2.azurestaticapps.net/)**

![Tabata Timer](https://img.shields.io/badge/React-19+-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7+-purple?logo=vite)

## ✨ Features

### 🎯 Core Timer Functionality
- **Visual Circular Timer**: Animated progress circle with countdown display
- **Exercise & Round Tracking**: Clear display of current exercise (1/X) and round (1/X)
- **Pause/Resume**: Full control over workout timing
- **Multiple Timer States**: Ready, Exercise, Rest, Round Rest, Paused, Completed

### 🎵 Audio Feedback System
- **Three-Second Warning Beeps**: Pulse-style beeps (1 per second) before:
  - Workout starts (during "Get Ready!" phase)
  - Each exercise ends
  - Rest periods end (next exercise starting)
  - Round rest ends (next round starting)
- **Inspiring Completion Fanfare**: Triumphant 8-note melody when workout completes

### ⚙️ Workout Management
- **Custom Workouts**: Create, edit, and delete personalized workout routines
- **Flexible Configuration**:
  - Exercise duration: 1-180 seconds
  - Rest between exercises: 0-60 seconds (0 = no rest)
  - Exercises per round: 1-20
  - Number of rounds: 1-25
  - Rest between rounds: 0-180 seconds (0 = no rest)
- **Local Storage**: All workouts automatically saved and persist between sessions
- **Default Workout**: Classic 20s work / 10s rest Tabata included

### 🎨 Design & UX
- **Inspiring Blue Theme**: Beautiful gradient backgrounds and modern UI
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Smooth Animations**: Pulse effects and hover transitions
- **Intuitive Navigation**: Clear workflow from workout selection to completion

## 🚀 Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd tabata-app-nextgen
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5175` (or the port shown in terminal)

### Build for Production
```bash
npm run build
```

The built files will be in the `dist/` directory.

## 📱 How to Use

### 1. Select or Create a Workout
- Choose from existing workouts on the main screen
- Click "⚙️ Manage Workouts" to create new routines or edit existing ones

### 2. Configure Your Workout (Optional)
- Set exercise duration (how long to work)
- Set rest duration (how long to rest between exercises)
- Choose number of exercises per round
- Set number of rounds
- Configure rest time between rounds

### 3. Start Your Timer
- Click on a workout to enter timer mode
- Click "🔊 Test Audio" to verify sound works
- Click "Start Workout" when ready
- Use "⏸️ Pause" and "▶️ Resume" as needed

### 4. Follow the Audio Cues
- Listen for 3 warning beeps before each transition
- Follow the on-screen state indicators (WORK!, Rest, etc.)
- Enjoy the fanfare when you complete your workout!

## 🎵 Audio System

The app provides audio feedback during workouts:
- **Warning Beeps**: 3 beeps (1 per second) before each phase ends
- **Completion Sound**: Celebratory fanfare when workout is complete

*Note: Audio will start automatically when you begin your first workout.*

## 🚀 Getting Started

### Installation
1. Clone the repository and navigate to the project folder
2. Install dependencies: `npm install`
3. Start the app: `npm run dev`
4. Open your browser to the URL shown in terminal

### Build for Production
```bash
npm run build
```

## 📱 How to Use

1. **Select a Workout**: Choose from existing workouts or create a new one
2. **Start Timer**: Click "Start Workout" when ready
3. **Follow Audio Cues**: Listen for beeps and follow on-screen instructions
4. **Use Controls**: Pause/resume as needed during your workout

## 🎯 What is Tabata?

Tabata is a form of high-intensity interval training (HIIT) consisting of:
- **20 seconds** of intense exercise
- **10 seconds** of rest  
- **8 rounds** (4 minutes total)

This app lets you customize these settings for different workout styles.

## 🔧 Configuration

### Timer States
- `stopped`: Initial state, ready to start
- `ready`: 5-second countdown before first exercise
- `exercise`: Active work period
- `rest`: Rest between exercises
- `roundRest`: Rest between rounds
- `paused`: Timer paused by user
- `completed`: All rounds finished

### Workout Schema
```typescript
interface Workout {
  id: string
  name: string
  exerciseDuration: number      // 1-180 seconds
  restDuration: number          // 0-60 seconds
  exerciseCount: number         // 1-20 exercises
  roundCount: number            // 1-25 rounds
  roundRestDuration: number     // 0-180 seconds
}
```

## 🎯 What is Tabata?

Tabata is a form of high-intensity interval training (HIIT) developed by Dr. Izumi Tabata. The classic protocol consists of:
- **20 seconds** of intense exercise
- **10 seconds** of rest
- **8 rounds** (4 minutes total)

This app allows you to customize these parameters for different workout styles and fitness levels.

## 🤝 Contributing

1. Fork the repository
2. Make your changes
3. Run `npm run build` to verify everything works
4. Submit a pull request

## 🙏 Acknowledgments

Thanks to Dr. Izumi Tabata for developing this effective training protocol.

---

**Ready to get fit? Start your Tabata workout today! 💪**
