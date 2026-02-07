# Interactive Audio Visualizer

A stunning real-time audio visualization experience with multiple visualization modes, particle effects, and customizable themes.

![Audio Visualizer](https://via.placeholder.com/800x400/0a0a0f/00f3ff?text=Audio+Visualizer)

## ✨ Features

- **Real-time Audio Analysis** - Visualize any audio file with smooth, responsive animations
- **5 Visualization Modes**
  - **Particles** - Audio-reactive particles with connection lines
  - **Bars** - Classic frequency bar display
  - **Wave** - Smooth oscillating wave patterns
  - **Circular** - Radial frequency visualization
  - **Galaxy** - Spiral galaxy with rotating arms

- **5 Color Themes**
  - Neon (cyan/magenta)
  - Sunset (warm orange/pink)
  - Ocean (teal/blue)
  - Forest (green)
  - Cosmic (purple/violet)

- **Interactive Controls**
  - Upload any audio file
  - Adjust particle count (50-500)
  - Control sensitivity
  - Switch visualization modes
  - Change color themes

- **Smooth Animations** - 60fps fluid animations
- **Drag & Drop** - Easy file upload
- **Responsive Design** - Works on all screen sizes

## 🚀 Getting Started

### Run Locally

1. Clone the repository:
```bash
git clone https://github.com/jarvis-clawdbot/audio-visualizer.git
cd audio-visualizer
```

2. Open `index.html` in your browser (or use a local server):
```bash
# Using Python
python -m http.server 8000

# Using Node.js (with serve)
npx serve .
```

3. Open `http://localhost:8000` in your browser

4. Upload an audio file or drag & drop to start visualizing!

### Live Demo

Visit: https://jarvis-clawdbot.github.io/audio-visualizer/

## 🎨 Usage

1. **Upload Audio** - Click "Upload Audio" or drag a file onto the page
2. **Controls** - Use the control panel to:
   - Play/Pause: ▶/⏸
   - Reset: ↺
   - Adjust particle count
   - Change sensitivity
   - Switch visualization mode
   - Choose a color theme

3. **Stats Panel** - View real-time frequency data

## 🛠️ Technologies

- **HTML5 Canvas** - High-performance rendering
- **Web Audio API** - Real-time audio analysis
- **CSS3** - Modern styling with animations
- **Vanilla JavaScript** - No dependencies

## 📁 Project Structure

```
audio-visualizer/
├── index.html      # Main HTML file
├── css/
│   └── style.css   # Styling
└── js/
    └── visualizer.js  # Main visualizer logic
```

## 🤝 Contributing

Contributions welcome! Feel free to fork and submit PRs.

## 📝 License

MIT License - Feel free to use and modify!

## 👨‍💻 Built By

Jarvis AI Assistant for Shubham Sharma

---

Made with 💙 and lots of coffee ☕
