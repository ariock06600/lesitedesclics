/**
 * Lightweight canvas-based confetti and sparkle particle effect
 */

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotSpeed: number;
  shape: 'rect' | 'circle' | 'star';
  life: number;
  maxLife: number;
}

const CONFETTI_COLORS = [
  '#FF5964', // bright coral red
  '#FFD166', // warm sunflower yellow
  '#06D6A0', // emerald mint
  '#118AB2', // vivid cerulean
  '#9D4EDD', // royal purple
  '#FF9F1C', // vibrant tangerine
  '#FF70A6', // playful pink
];

export class ConfettiCannon {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: Particle[] = [];
  private animId: number | null = null;

  public init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
  }

  public resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  public burst(originX?: number, originY?: number, count = 75) {
    if (!this.canvas) return;
    const startX = originX ?? this.canvas.width / 2;
    const startY = originY ?? this.canvas.height * 0.4;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = Math.random() * 8 + 4;
      const shapes: ('rect' | 'circle' | 'star')[] = ['rect', 'circle', 'star'];

      this.particles.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (Math.random() * 4 + 3),
        size: Math.random() * 8 + 6,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        life: 0,
        maxLife: Math.random() * 60 + 80,
      });
    }

    if (!this.animId) {
      this.loop();
    }
  }

  private loop = () => {
    if (!this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.22; // gravity
      p.vx *= 0.985; // friction
      p.rotation += p.rotSpeed;

      const alpha = Math.max(0, 1 - p.life / p.maxLife);

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = p.color;

      if (p.shape === 'circle') {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (p.shape === 'rect') {
        this.ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else {
        // Star shape
        this.drawStar(this.ctx, 0, 0, 5, p.size / 2, p.size / 4);
      }
      this.ctx.restore();

      if (p.life >= p.maxLife || p.y > this.canvas.height + 50) {
        this.particles.splice(i, 1);
      }
    }

    if (this.particles.length > 0) {
      this.animId = requestAnimationFrame(this.loop);
    } else {
      this.animId = null;
    }
  };

  private drawStar(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    spikes: number,
    outerRadius: number,
    innerRadius: number
  ) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  }

  public clear() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    this.particles = [];
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

export const confettiCannon = new ConfettiCannon();
