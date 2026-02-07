// Audio Visualizer - Interactive Particle Effects
class AudioVisualizer {
  constructor() {
    this.canvas = document.getElementById('visualizer');
    this.ctx = this.canvas.getContext('2d');
    this.audio = document.getElementById('audio');
    this.dropZone = document.getElementById('dropZone');
    
    this.particles = [];
    this.bars = [];
    this.wavePoints = [];
    
    this.isPlaying = false;
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    this.source = null;
    
    this.settings = {
      particleCount: 200,
      sensitivity: 4,
      mode: 'particles',
      theme: 'neon'
    };
    
    this.themes = {
      neon: { primary: '#00f3ff', secondary: '#ff00ff', accent: '#ffd700' },
      sunset: { primary: '#ff6b6b', secondary: '#feca57', accent: '#ff9ff3' },
      ocean: { primary: '#00d2d3', secondary: '#54a0ff', accent: '#5f27cd' },
      forest: { primary: '#26de81', secondary: '#20bf6b', accent: '#0fb9b1' },
      cosmic: { primary: '#a55eea', secondary: '#ff6b81', accent: '#fd9644' }
    };
    
    this.mouseX = window.innerWidth / 2;
    this.mouseY = window.innerHeight / 2;
    
    this.init();
  }
  
  init() {
    this.resize();
    this.setupEventListeners();
    this.animate();
  }
  
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  setupEventListeners() {
    window.addEventListener('resize', () => this.resize());
    
    document.getElementById('audioFile').addEventListener('change', (e) => this.handleFile(e.target.files[0]));
    
    this.dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.dropZone.style.background = 'rgba(0, 243, 255, 0.1)';
    });
    
    this.dropZone.addEventListener('dragleave', () => {
      this.dropZone.style.background = 'rgba(10, 10, 15, 0.95)';
    });
    
    this.dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.handleFile(e.dataTransfer.files[0]);
    });
    
    document.getElementById('playPause').addEventListener('click', () => this.togglePlay());
    document.getElementById('reset').addEventListener('click', () => this.reset());
    
    document.getElementById('particleCount').addEventListener('input', (e) => {
      this.settings.particleCount = parseInt(e.target.value);
      this.initParticles();
    });
    
    document.getElementById('sensitivity').addEventListener('input', (e) => {
      this.settings.sensitivity = parseInt(e.target.value);
    });
    
    document.getElementById('visualMode').addEventListener('change', (e) => {
      this.settings.mode = e.target.value;
      this.initParticles();
    });
    
    document.getElementById('colorTheme').addEventListener('change', (e) => {
      this.settings.theme = e.target.value;
    });
    
    this.canvas.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });
    
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      this.mouseX = e.touches[0].clientX;
      this.mouseY = e.touches[0].clientY;
    });
  }
  
  handleFile(file) {
    if (!file || !file.type.startsWith('audio/')) return;
    
    const url = URL.createObjectURL(file);
    this.audio.src = url;
    
    this.audio.addEventListener('loadeddata', () => {
      this.dropZone.classList.add('hidden');
      this.setupAudio();
      this.play();
    }, { once: true });
  }
  
  setupAudio() {
    if (this.audioContext) return;
    
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.8;
    
    this.source = this.audioContext.createMediaElementSource(this.audio);
    this.source.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);
    
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    
    this.initParticles();
    this.enableControls();
  }
  
  initParticles() {
    this.particles = [];
    this.bars = [];
    this.wavePoints = [];
    
    if (this.settings.mode === 'particles' || this.settings.mode === 'galaxy') {
      for (let i = 0; i < this.settings.particleCount; i++) {
        this.particles.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          size: Math.random() * 4 + 1,
          hue: Math.random() * 60 + (this.getThemeHue()),
          life: 1,
          decay: Math.random() * 0.01 + 0.005
        });
      }
    } else if (this.settings.mode === 'bars') {
      const barCount = 64;
      for (let i = 0; i < barCount; i++) {
        this.bars.push({
          x: (this.canvas.width / barCount) * i,
          height: 0,
          hue: (i / barCount) * 60 + this.getThemeHue()
        });
      }
    } else if (this.settings.mode === 'wave') {
      for (let i = 0; i < 200; i++) {
        this.wavePoints.push({
          x: (this.canvas.width / 200) * i,
          baseY: this.canvas.height / 2,
          y: this.canvas.height / 2
        });
      }
    }
  }
  
  getThemeHue() {
    const theme = this.themes[this.settings.theme];
    const hsl = this.hexToHSL(theme.primary);
    return hsl.h;
  }
  
  hexToHSL(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { h: 0, s: 100, l: 50 };
    
    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;
    
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max !== min) {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    
    return { h: h * 360, s: s * 100, l: l * 100 };
  }
  
  enableControls() {
    document.getElementById('playPause').disabled = false;
    document.getElementById('reset').disabled = false;
  }
  
  play() {
    this.audio.play();
    this.isPlaying = true;
    document.getElementById('playPause').querySelector('.icon').textContent = '⏸';
  }
  
  pause() {
    this.audio.pause();
    this.isPlaying = false;
    document.getElementById('playPause').querySelector('.icon').textContent = '▶';
  }
  
  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }
  
  reset() {
    this.audio.currentTime = 0;
    this.initParticles();
  }
  
  getFrequencyData() {
    if (!this.analyser) return null;
    this.analyser.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }
  
  animate() {
    requestAnimationFrame(() => this.animate());
    
    this.ctx.fillStyle = 'rgba(5, 5, 8, 0.1)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    const freqData = this.getFrequencyData();
    if (freqData) {
      this.updateStats();
    }
    
    if (this.settings.mode === 'particles') {
      this.drawParticles(freqData);
    } else if (this.settings.mode === 'bars') {
      this.drawBars(freqData);
    } else if (this.settings.mode === 'wave') {
      this.drawWave(freqData);
    } else if (this.settings.mode === 'circular') {
      this.drawCircular(freqData);
    } else if (this.settings.mode === 'galaxy') {
      this.drawGalaxy(freqData);
    }
  }
  
  updateStats() {
    const avgFreq = this.getAverageFrequency();
    const bass = this.getBassLevel();
    
    document.getElementById('freqValue').textContent = `${Math.round(avgFreq * 10)} Hz`;
    document.getElementById('bassValue').textContent = `${Math.round(bass / 2.55)}%`;
    document.getElementById('particleStat').textContent = this.particles.filter(p => p.life > 0).length;
  }
  
  getAverageFrequency() {
    if (!this.dataArray) return 0;
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }
    return sum / this.dataArray.length;
  }
  
  getBassLevel() {
    if (!this.dataArray) return 0;
    let sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += this.dataArray[i];
    }
    return sum / 10;
  }
  
  getThemeColor(hueOffset = 0) {
    const theme = this.themes[this.settings.theme];
    const hsl = this.hexToHSL(theme.primary);
    return `hsl(${hsl.h + hueOffset}, ${hsl.s}%, ${hsl.l}%)`;
  }
  
  drawParticles(freqData) {
    const avg = freqData ? this.getAverageFrequency() : 0;
    const multiplier = avg * this.settings.sensitivity / 50;
    
    this.particles.forEach((p, i) => {
      p.life -= p.decay;
      
      if (p.life <= 0) {
        p.x = Math.random() * this.canvas.width;
        p.y = Math.random() * this.canvas.height;
        p.life = 1;
      }
      
      let speed = multiplier * 2 + 1;
      p.x += p.vx * speed;
      p.y += p.vy * speed;
      
      // Mouse attraction
      const dx = this.mouseX - p.x;
      const dy = this.mouseY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 200) {
        p.x += (dx / dist) * multiplier;
        p.y += (dy / dist) * multiplier;
      }
      
      // Wrap around screen
      if (p.x < 0) p.x = this.canvas.width;
      if (p.x > this.canvas.width) p.x = 0;
      if (p.y < 0) p.y = this.canvas.height;
      if (p.y > this.canvas.height) p.y = 0;
      
      const size = p.size * (1 + multiplier / 10);
      const alpha = p.life;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      this.ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${alpha})`;
      this.ctx.fill();
      
      // Glow effect
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, size * 2, 0, Math.PI * 2);
      this.ctx.fillStyle = `hsla(${p.hue}, 80%, 60%, ${alpha * 0.3})`;
      this.ctx.fill();
    });
    
    // Draw connections
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.lineWidth = 0.5;
    
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 100) {
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 * (1 - dist / 100)})`;
          this.ctx.stroke();
        }
      }
    }
  }
  
  drawBars(freqData) {
    if (!freqData) return;
    
    const barWidth = this.canvas.width / this.bars.length;
    const theme = this.themes[this.settings.theme];
    
    this.bars.forEach((bar, i) => {
      const value = freqData[i * 2] || 0;
      const height = (value / 255) * (this.canvas.height / 2) * (this.settings.sensitivity / 4);
      
      bar.height = height;
      
      const gradient = this.ctx.createLinearGradient(bar.x, this.canvas.height - height, bar.x, this.canvas.height);
      gradient.addColorStop(0, theme.primary);
      gradient.addColorStop(0.5, theme.secondary);
      gradient.addColorStop(1, theme.accent);
      
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(bar.x, this.canvas.height - height - 20, barWidth - 2, height + 20);
      
      // Reflection
      this.ctx.fillStyle = `rgba(255, 255, 255, 0.05)`;
      this.ctx.fillRect(bar.x, this.canvas.height + 10, barWidth - 2, height * 0.5);
    });
  }
  
  drawWave(freqData) {
    if (!freqData) return;
    
    const avg = this.getAverageFrequency() / 255;
    
    this.wavePoints.forEach((point, i) => {
      const value = freqData[i] || 0;
      const offset = (value / 255) * 100 * (this.settings.sensitivity / 4);
      point.y = point.baseY + Math.sin(i * 0.05 + Date.now() * 0.002) * offset * avg;
    });
    
    this.ctx.beginPath();
    this.ctx.moveTo(this.wavePoints[0].x, this.wavePoints[0].y);
    
    for (let i = 1; i < this.wavePoints.length - 2; i++) {
      const xc = (this.wavePoints[i].x + this.wavePoints[i + 1].x) / 2;
      const yc = (this.wavePoints[i].y + this.wavePoints[i + 1].y) / 2;
      this.ctx.quadraticCurveTo(this.wavePoints[i].x, this.wavePoints[i].y, xc, yc);
    }
    
    this.ctx.strokeStyle = this.getThemeColor();
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
    
    // Glow
    this.ctx.strokeStyle = `rgba(255, 255, 255, 0.3)`;
    this.ctx.lineWidth = 10;
    this.ctx.stroke();
    
    // Second wave (offset)
    this.ctx.beginPath();
    this.wavePoints.forEach((point, i) => {
      if (i === 0) {
        this.ctx.moveTo(point.x, point.y + 50);
      } else {
        this.ctx.lineTo(point.x, point.y + 50);
      }
    });
    this.ctx.strokeStyle = this.getThemeColor(30);
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }
  
  drawCircular(freqData) {
    if (!freqData) return;
    
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.6;
    const avg = this.getAverageFrequency() / 255;
    
    this.ctx.save();
    this.ctx.translate(centerX, centerY);
    this.ctx.rotate(Date.now() * 0.0005);
    
    const bars = 128;
    for (let i = 0; i < bars; i++) {
      const value = freqData[i] || 0;
      const angle = (i / bars) * Math.PI * 2;
      const height = (value / 255) * radius * (this.settings.sensitivity / 4) + 10;
      
      const x1 = Math.cos(angle) * radius;
      const y1 = Math.sin(angle) * radius;
      const x2 = Math.cos(angle) * (radius + height);
      const y2 = Math.sin(angle) * (radius + height);
      
      const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, this.getThemeColor());
      gradient.addColorStop(1, this.getThemeColor(60));
      
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.strokeStyle = gradient;
      this.ctx.lineWidth = 2 + avg * 3;
      this.ctx.stroke();
    }
    
    // Inner circle glow
    const innerGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 0.3);
    innerGradient.addColorStop(0, this.getThemeColor(0, 0.5));
    innerGradient.addColorStop(1, 'transparent');
    
    this.ctx.fillStyle = innerGradient;
    this.ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
    
    this.ctx.restore();
  }
  
  drawGalaxy(freqData) {
    if (!freqData) return;
    
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const avg = this.getAverageFrequency() / 255;
    
    this.ctx.save();
    this.ctx.translate(centerX, centerY);
    this.ctx.rotate(Date.now() * 0.0002);
    
    // Draw spiral arms
    for (let arm = 0; arm < 3; arm++) {
      this.ctx.rotate((Math.PI * 2) / 3);
      
      for (let i = 0; i < 80; i++) {
        const angle = i * 0.15;
        const distance = i * 3 + avg * 50;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        const size = Math.random() * 3 + 1;
        const alpha = 1 - i / 80;
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.fillStyle = `hsla(${this.getThemeHue() + arm * 40}, 80%, 60%, ${alpha})`;
        this.ctx.fill();
      }
    }
    
    // Center glow
    const centerGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, 100);
    centerGradient.addColorStop(0, this.getThemeColor(0, 0.8));
    centerGradient.addColorStop(0.5, this.getThemeColor(30, 0.3));
    centerGradient.addColorStop(1, 'transparent');
    
    this.ctx.fillStyle = centerGradient;
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 100, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.restore();
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  new AudioVisualizer();
});
