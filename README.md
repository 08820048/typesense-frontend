# TypeSense Frontend

A Vue 3 application for tracking and visualizing typing rhythm patterns. This project is part of the TypeSense system, which uses typing behavior as a biometric authentication factor.

## Features

- Real-time typing rhythm tracking
- Visual representation of typing intervals
- Detection of rhythm anomalies
- Detailed metrics (average interval, duration, backspace usage)
- JSON export of typing data
- Responsive design with glassmorphism UI

## Technologies Used

- Vue 3 (Composition API)
- Chart.js for data visualization
- CSS with glassmorphism effects
- Vite for fast development

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## How It Works

The application tracks the timing between keystrokes as you type, creating a unique "fingerprint" of your typing rhythm. Anomalies in typing patterns are automatically detected and highlighted in the visualization.

## Future Development

- Integration with backend authentication systems
- Machine learning for pattern recognition
- Multi-user comparison
- Export/import of typing profiles
