// Audio Visualizer - Main JavaScript
class AudioVisualizer {
  constructor() {
    this.canvas = document.getElementById('visualizer');
    this.ctx = this.canvas.getContext('2d');
    this.audio = document.getElementById('audio');
    this.dropZone = document.getElementById('dropZone');
    
    // Audio context and analyser
    this.audioContext = null;
    this.analyser = null;
    this.source = null;
    this.dataArray = null;
    this.bufferLength = 0;
    
    // Visual settings
    this.particles = [];
    this.particleCount = 200;
    this.sensitivity = 4;
    this.visualMode = 'particles';
    this.colorTheme = 'neon';
    
    // Animation
    this.animationId = null;
    this.time = 0;
    this.lastFrameTime = 0;
    
    // Stats
    this.frequency = 0;
    this.bass = 0;
    
    // Colors for themes
    this.themes = {
      neon: { primary: '#00f3ff', secondary: '#ff00ff', accent: '#00ff88' },
      sunset: { primary: '#ff6b6b', secondary: '#feca57', accent: '#ff9ff3' },
      ocean: { primary: '#0abdc6', secondary: '#4834d4', accent: '#22a6b3' },
      forest: { primary: '#26de81', secondary: '#20bf6b', accent: '#0fb9b1' },
      cosmic: { primary: '#a55eea', secondary: '#8854d0', accent: '#4b6584' }
    };
    
    this.init();
  }
  
  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.setupEventListeners();
    
    // Hide drop zone by default so upload button works immediately
    this.dropZone.classList.add('hidden');
    
    this.render();
  }
  
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  setupEventListeners() {
    // File upload - Enable upload button immediately
    document.getElementById('audioFile').addEventListener('change', (e) => {
      if (e.target.files[0]) {
        this.loadAudio(e.target.files[0]);
      }
    });
    
    // Drag and drop
    this.dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
    });
    
    this.dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      if (e.dataTransfer.files[0]) {
        this.loadAudio(e.dataTransfer.files[0]);
      }
    });
    
    // Enable upload button immediately on page load
    document.querySelector('.upload-btn').style.pointerEvents = 'auto';
    document.querySelector('.upload-btn').style.opacity = '1';
    
    // Controls
    document.getElementById('playPause').addEventListener('click', () => this.togglePlay());
    document.getElementById('reset').addEventListener('click', () => this.reset());
    
    document.getElementById('particleCount').addEventListener('input', (e) => {
      this.particleCount = parseInt(e.target.value);
      this.updateParticleCount();
    });
    
    document.getElementById('sensitivity').addEventListener('input', (e) => {
      this.sensitivity = parseInt(e.target.value);
    });
    
    document.getElementById('visualMode').addEventListener('change', (e) => {
      this.visualMode = e.target.value;
    });
    
    document.getElementById('colorTheme').addEventListener('change', (e) => {
      this.colorTheme = e.target.value;
      document.body.className = `theme-${this.colorTheme}`;
    });
  }
  
  async loadAudio(file) {
    try {
      const url = URL.createObjectURL(file);
      this.audio.src = url;
      
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 1024;
      this.bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(this.bufferLength);
      
      this.source = this.audioContext.createMediaElementSource(this.audio);
      this.source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
      
      this.audio.addEventListener('ended', () => {
        document.getElementById('playPause').querySelector('.icon').textContent = '▶';
      });
      
      // Initialize particles
      this.initParticles();
      
      // Hide drop zone (if it's still visible)
      this.dropZone.classList.add('hidden');
      
      // Enable controls
      document.getElementById('playPause').disabled = false;
      document.getElementById('reset').disabled = false;
      
      // Play audio
      await this.audioContext.resume();
      this.audio.play();
      document.getElementById('playPause').querySelector('.icon').textContent = '⏸';
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  }
  
  togglePlay() {
    if (this.audio.paused) {
      this.audio.play();
      document.getElementById('playPause').querySelector('.icon').textContent = '⏸';
    } else {
      this.audio.pause();
      document.getElementById('playPause').querySelector('.icon').textContent = '▶';
    }
  }
  
  reset() {
    this.audio.currentTime = 0;
    this.time = 0;
  }
  
  initParticles() {
    this.particles = [];
    const theme = this.themes[this.colorTheme];
    
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 3 + 1,
        baseX: Math.random() * this.canvas.width,
        baseY: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        angle: Math.random() * Math.PI * 2,
        radius: Math.random() * 80 + 40,
        color: Math.random() > 0.5 ? theme.primary : theme.secondary
      });
    }
  }
  
  updateParticleCount() {
    const theme = this.themes[this.colorTheme];
    while (this.particles.length < this.particleCount) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 3 + 1,
        baseX: Math.random() * this.canvas.width,
        baseY: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        angle: Math.random() * Math.PI * 2,
        radius: Math.random() * 80 + 40,
        color: Math.random() > 0.5 ? theme.primary : theme.secondary
      });
    }
    while (this.particles.length > this.particleCount) {
      this.particles.pop();
    }
  }
  
  getFrequencyData() {
    if (!this.analyser) return { bass: 0, mid: 0, high: 0, avg: 0 };
    
    this.analyser.getByteFrequencyData(this.dataArray);
    
    // Calculate frequency bands
    const bass = this.dataArray.slice(0, 8).reduce((a, b) => a + b, 0) / 8;
    const mid = this.dataArray.slice(16, 80).reduce((a, b) => a + b, 0) / 64;
    const high = this.dataArray.slice(80, 160).reduce((a, b) => a + b, 0) / 80;
    const avg = this.dataArray.slice(0, 400).reduce((a, b) => a + b, 0) / 400;
    
    this.frequency = Math.round(avg * 5);
    this.bass = Math.round((bass / 255) * 100);
    
    return { bass, mid, high, avg };
  }
  
  render(timestamp = 0) {
    this.animationId = requestAnimationFrame((t) => this.render(t));
    
    // Throttle to ~60fps
    if (timestamp - this.lastFrameTime < 16) return;
    this.lastFrameTime = timestamp;
    
    this.time += 0.016;
    
    // Clear canvas
    this.ctx.fillStyle = 'rgba(10, 10, 15, 0.2)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    const freq = this.getFrequencyData();
    const theme = this.themes[this.colorTheme];
    
    // Update stats
    document.getElementById('freqValue').textContent = `${this.frequency} Hz`;
    document.getElementById('bassValue').textContent = `${this.bass}%`;
    document.getElementById('particleStat').textContent = this.particles.length;
    
    // Render based on mode
    switch (this.visualMode) {
      case 'particles':
        this.renderParticles(freq, theme);
        break;
      case 'bars':
        this.renderBars(freq, theme);
        break;
      case 'wave':
        this.renderWave(freq, theme);
        break;
      case 'circular':
        this.renderCircular(freq, theme);
        break;
      case 'galaxy':
        this.renderGalaxy(freq, theme);
        break;
    }
  }
  
  renderParticles(freq, theme) {
    const scale = (freq.bass / 255) * this.sensitivity;
    
    this.particles.forEach((p) => {
      // Move particle
      p.x += p.vx;
      p.y += p.vy;
      
      // Bounce off edges
      if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;
      
      // Audio reactive size
      const size = p.size * (1 + scale * 0.5);
      
      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.shadowBlur = 10 * scale;
      this.ctx.shadowColor = p.color;
      this.ctx.fill();
      
      // Draw connections
      this.particles.forEach((p2, j) => {
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 80) {
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          const opacity = (1 - dist / 80) * 0.2;
          this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      });
    });
    
    this.ctx.shadowBlur = 0;
  }
  
  renderBars(freq, theme) {
    const barCount = 48;
    const barWidth = this.canvas.width / barCount;
    const scale = (freq.avg / 255) * this.sensitivity * 2;
    
    for (let i = 0; i < barCount; i++) {
      const dataIndex = Math.floor(i * (this.bufferLength / barCount));
      const value = this.dataArray[dataIndex] || 0;
      const barHeight = Math.min(value * scale, this.canvas.height * 0.8);
      
      const hue = (i / barCount) * 60 + 180;
      this.ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;
      this.ctx.shadowBlur = 5;
      this.ctx.shadowColor = this.ctx.fillStyle;
      
      this.ctx.fillRect(
        i * barWidth,
        this.canvas.height - barHeight,
        barWidth - 2,
        barHeight
      );
    }
    
    this.ctx.shadowBlur = 0;
  }
  
  renderWave(freq, theme) {
    const scale = (freq.avg / 255) * this.sensitivity * 30;
    
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.canvas.height / 2);
    
    for (let i = 0; i < this.canvas.width; i += 4) {
      const dataIndex = Math.floor(i / this.canvas.width * 200);
      const value = (this.dataArray[dataIndex] || 0) / 255;
      
      const y = this.canvas.height / 2 + 
                Math.sin(i * 0.02 + this.time * 2) * 30 * value +
                Math.cos(i * 0.01 + this.time) * 20 * (freq.bass / 255);
      
      this.ctx.lineTo(i, y);
    }
    
    this.ctx.strokeStyle = theme.primary;
    this.ctx.lineWidth = 2;
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = theme.primary;
    this.ctx.stroke();
    
    // Second wave
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.canvas.height / 2);
    
    for (let i = 0; i < this.canvas.width; i += 4) {
      const dataIndex = Math.floor(i / this.canvas.width * 200);
      const value = (this.dataArray[dataIndex] || 0) / 255;
      
      const y = this.canvas.height / 2 + 
                Math.sin(i * 0.015 - this.time * 1.5) * 25 * value +
                Math.cos(i * 0.02 + this.time * 0.8) * 15;
      
      this.ctx.lineTo(i, y);
    }
    
    this.ctx.strokeStyle = theme.secondary;
    this.ctx.lineWidth = 1.5;
    this.ctx.shadowColor = theme.secondary;
    this.ctx.stroke();
    
    this.ctx.shadowBlur = 0;
  }
  
  renderCircular(freq, theme) {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const scale = (freq.avg / 255) * this.sensitivity;
    const radius = 80 + scale * 80;
    
    // Outer ring
    this.ctx.beginPath();
    for (let i = 0; i <= 360; i += 3) {
      const rad = (i * Math.PI) / 180;
      const dataIndex = Math.floor(i / 360 * 100);
      const value = (this.dataArray[dataIndex] || 0) / 255;
      
      const x = centerX + Math.cos(rad) * (radius + value * 40);
      const y = centerY + Math.sin(rad) * (radius + value * 40);
      
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    
    this.ctx.closePath();
    this.ctx.strokeStyle = theme.primary;
    this.ctx.lineWidth = 2;
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = theme.primary;
    this.ctx.stroke();
    
    // Inner ring
    this.ctx.beginPath();
    for (let i = 0; i <= 360; i += 5) {
      const rad = (i * Math.PI) / 180;
      const x = centerX + Math.cos(rad) * (radius * 0.55);
      const y = centerY + Math.sin(rad) * (radius * 0.55);
      
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    
    this.ctx.closePath();
    this.ctx.strokeStyle = theme.secondary;
    this.ctx.lineWidth = 1.5;
    this.ctx.shadowColor = theme.secondary;
    this.ctx.stroke();
    
    // Center circle
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, 15 + scale * 20, 0, Math.PI * 2);
    this.ctx.fillStyle = theme.accent;
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor = theme.accent;
    this.ctx.fill();
    
    this.ctx.shadowBlur = 0;
  }
  
  renderGalaxy(freq, theme) {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const scale = (freq.bass / 255) * this.sensitivity;
    
    // Draw galaxy arms
    for (let arm = 0; arm < 3; arm++) {
      this.ctx.beginPath();
      for (let i = 0; i < 150; i++) {
        const angle = (i / 150) * Math.PI * 4 + arm * (Math.PI * 2 / 3) + this.time * 0.3;
        const dist = 20 + i * 1.2;
        const x = centerX + Math.cos(angle) * dist;
        const y = centerY + Math.sin(angle) * dist;
        
        const size = Math.max(0.3, 3 - i * 0.015) * (1 + scale * 0.5);
        const opacity = 1 - i / 150;
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.fillStyle = arm === 0 ? theme.primary : arm === 1 ? theme.secondary : theme.accent;
        this.ctx.globalAlpha = opacity;
        this.ctx.shadowBlur = 8 * scale;
        this.ctx.shadowColor = this.ctx.fillStyle;
        this.ctx.fill();
      }
      this.ctx.globalAlpha = 1;
    }
    
    // Center glow
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, 10 + scale * 15, 0, Math.PI * 2);
    const gradient = this.ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, 25 + scale * 20
    );
    gradient.addColorStop(0, theme.primary);
    gradient.addColorStop(0.5, theme.secondary);
    gradient.addColorStop(1, 'transparent');
    this.ctx.fillStyle = gradient;
    this.ctx.shadowBlur = 30;
    this.ctx.shadowColor = theme.primary;
    this.ctx.fill();
    
    this.ctx.shadowBlur = 0;
  }
}

// Initialize visualizer
const visualizer = new AudioVisualizer();
