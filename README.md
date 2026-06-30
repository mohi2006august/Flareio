<div align="center">
  <h1>☀️ FlareSense</h1>
  <p><b>Advanced Solar Flare Forecasting & Space Weather Dashboard</b></p>
  <p><i>Simulated interface for the ISRO Aditya-L1 Mission telemetry and predictive modeling.</i></p>
</div>

---

## 🛰️ Overview

**FlareSense** is a state-of-the-art, web-based dashboard designed to visualize, predict, and monitor solar flare activity. Built with a premium, cybernetic aesthetic, it simulates real-time data ingestion from the **Aditya-L1** space observatory (specifically the SoLEXS and HEL1OS instruments).

The platform features a fully interactive 3D environment, smooth cinematic transitions, and a built-in voice assistant to query real-time space weather conditions.

## ✨ Features

- **Cinematic Boot Sequence**: A high-fidelity animated preloader that simulates establishing a downlink with the Aditya-L1 satellite, complete with web-audio synthesized telemetry pings.
- **Interactive 3D Environment**: Powered by Three.js and React Three Fiber, featuring a rotating sun, particle-based starfields, and real-time orbital rendering.
- **Predictive Analytics Engine (Simulated)**: Processes historical light curves and multi-instrument data to calculate real-time flare probabilities and confidence intervals.
- **Voice Assistant**: Integrated Web Speech API. Click "Ask" to query the system with natural language (e.g., *"What is the current probability?"* or *"What is the alert level?"*), and the system will respond via text-to-speech.
- **Live Telemetry & Logs**: A real-time data stream console displaying instrument status, flux readings, and system state.

## 🛠️ Technology Stack

- **Framework**: [React.js](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **3D Rendering**: [Three.js](https://threejs.org/) + [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber/) + [@react-three/drei](https://github.com/pmndrs/drei)
- **Styling**: Vanilla CSS (Custom Keyframe Animations, Glassmorphism, Dynamic Gradients)
- **Voice/Audio**: Web Audio API (Synthesizer), Web Speech API (Recognition & Synthesis)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mohi2006august/Flareio.git
   cd Flareio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## 🎙️ Voice Assistant Commands

Once the dashboard is loaded, click the **Ask** button (make sure to grant microphone permissions). You can ask:
- *"What is the current probability?"*
- *"What is the alert level?"*
- *"When was the last X-class flare?"*
- *"What is the model confidence?"*
- *"What is the current flux?"*

*Note: For the voice assistant to work correctly, browser autoplay policies require an initial click on the "INITIALIZE SYSTEM" boot screen before the application loads.*

## 📄 License

This project was developed as a simulated interface for educational and demonstration purposes. Data displayed is simulated and should not be used for actual space weather planning.
