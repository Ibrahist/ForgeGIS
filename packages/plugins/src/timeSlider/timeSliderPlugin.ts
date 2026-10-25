import { ForgePlugin, PluginContext } from '@forgegis/core';

export interface TimeSliderState {
  enabled: boolean;
  isPlaying: boolean;
  progress: number; // 0 to 100
  speed: number; // 1, 2, 5, 10
  currentTimeFormatted: string;
  startDate: Date;
  endDate: Date;
}

class TimeSliderManager {
  private state: TimeSliderState = {
    enabled: false,
    isPlaying: false,
    progress: 25,
    speed: 1,
    currentTimeFormatted: '2026-10-25 06:00 UTC (Low Tide)',
    startDate: new Date('2026-10-25T00:00:00Z'),
    endDate: new Date('2026-10-25T24:00:00Z'),
  };

  private timer: any = null;
  private listeners = new Set<(state: TimeSliderState) => void>();
  private ctx: PluginContext | null = null;

  public init(ctx: PluginContext) {
    this.ctx = ctx;
    this.state.enabled = true;
    this.updateFormattedTime();
    this.notify();
  }

  public destroy() {
    this.pause();
    this.state.enabled = false;
    this.ctx = null;
    this.notify();
  }

  public getState(): TimeSliderState {
    return { ...this.state };
  }

  public subscribe(listener: (state: TimeSliderState) => void): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  public play() {
    if (this.state.isPlaying) return;
    this.state.isPlaying = true;
    this.notify();

    this.timer = setInterval(() => {
      this.step();
    }, 150 / this.state.speed);
  }

  public pause() {
    if (!this.state.isPlaying) return;
    this.state.isPlaying = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.notify();
  }

  public togglePlay() {
    if (this.state.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public setProgress(pct: number) {
    this.state.progress = Math.max(0, Math.min(100, pct));
    this.updateFormattedTime();
    this.notify();
  }

  public setSpeed(speed: number) {
    this.state.speed = speed;
    if (this.state.isPlaying) {
      this.pause();
      this.play();
    } else {
      this.notify();
    }
  }

  private step() {
    let next = this.state.progress + 1;
    if (next > 100) next = 0;
    this.state.progress = next;
    this.updateFormattedTime();
    this.notify();
  }

  private updateFormattedTime() {
    const totalMs = this.state.endDate.getTime() - this.state.startDate.getTime();
    const currentMs = this.state.startDate.getTime() + (totalMs * (this.state.progress / 100));
    const d = new Date(currentMs);

    const hours = String(d.getUTCHours()).padStart(2, '0');
    const mins = String(d.getUTCMinutes()).padStart(2, '0');
    
    // Coastal tidal phase simulation
    let tidePhase = 'Slack Water';
    if (d.getUTCHours() >= 4 && d.getUTCHours() < 9) tidePhase = 'Low Tide - Sensor Runoff';
    else if (d.getUTCHours() >= 9 && d.getUTCHours() < 16) tidePhase = 'Flood Tide - Inundation Risk';
    else if (d.getUTCHours() >= 16 && d.getUTCHours() < 21) tidePhase = 'High Tide - Max Water Level';

    this.state.currentTimeFormatted = `2026-10-25 ${hours}:${mins} UTC (${tidePhase})`;
  }

  private notify() {
    const s = this.getState();
    this.listeners.forEach((l) => l(s));
  }
}

export const timeSliderManager = new TimeSliderManager();

export const timeSliderPlugin: ForgePlugin = {
  manifest: {
    id: 'time-slider',
    name: 'Time Series Temporal Slider',
    version: '1.0.0',
    description: 'Dynamic time-series playback, coastal tidal simulation, and temporal layer filtering',
    author: 'ForgeGIS Core Team',
    permissions: ['layers:read', 'layers:write', 'map:view', 'ui:panel'],
  },
  initialize: (ctx) => {
    timeSliderManager.init(ctx);
  },
  destroy: () => {
    timeSliderManager.destroy();
  },
};
