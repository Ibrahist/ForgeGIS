import React, { useEffect, useState } from 'react';
import { timeSliderManager, TimeSliderState } from './timeSliderPlugin';
import { Play, Pause, RotateCcw, FastForward, Clock } from 'lucide-react';

export interface TimeSliderWidgetProps {
  className?: string;
}

export const TimeSliderWidget: React.FC<TimeSliderWidgetProps> = ({ className = '' }) => {
  const [state, setState] = useState<TimeSliderState>(timeSliderManager.getState());

  useEffect(() => {
    return timeSliderManager.subscribe(setState);
  }, []);

  if (!state.enabled) {
    return null;
  }

  const cycleSpeed = () => {
    const nextSpeed = state.speed === 1 ? 2 : state.speed === 2 ? 5 : state.speed === 5 ? 10 : 1;
    timeSliderManager.setSpeed(nextSpeed);
  };

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 p-3.5 rounded-2xl bg-[#121217]/90 backdrop-blur-xl border border-white/10 shadow-2xl text-[#f5f5f7] select-none min-w-[420px] max-w-[540px] animate-fadeIn ${className}`}
      data-testid="time-slider-widget"
    >
      {/* Top Row: Timestamp & Status */}
      <div className="flex items-center justify-between w-full text-xs">
        <div className="flex items-center gap-2">
          <Clock size={13} className="text-[#e3b450]" />
          <span className="font-mono text-[11px] text-[#e3b450] font-semibold">
            {state.currentTimeFormatted}
          </span>
        </div>
        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[#9d9da8]">
          {state.isPlaying ? 'Live Telemetry' : 'Paused'}
        </span>
      </div>

      {/* Center Row: Scrubber Range Slider */}
      <div className="w-full flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={100}
          value={state.progress}
          onChange={(e) => timeSliderManager.setProgress(Number(e.target.value))}
          className="w-full h-1.5 bg-[#1f1f28] rounded-lg appearance-none cursor-pointer accent-[#e3b450]"
          data-testid="time-slider-scrubber"
        />
        <span className="font-mono text-[10px] text-[#9d9da8] w-8 text-right">
          {Math.round(state.progress)}%
        </span>
      </div>

      {/* Bottom Controls Row */}
      <div className="flex items-center justify-between w-full pt-1 border-t border-white/5">
        <button
          onClick={() => timeSliderManager.setProgress(0)}
          className="p-1 text-[#9d9da8] hover:text-[#f5f5f7] hover:bg-white/5 rounded-lg transition-colors"
          title="Reset to 00:00"
        >
          <RotateCcw size={13} />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => timeSliderManager.togglePlay()}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e3b450] text-[#0a0a0c] font-semibold text-xs hover:bg-[#ebd27a] transition-all shadow-md active:scale-95"
            data-testid="time-slider-play-btn"
          >
            {state.isPlaying ? (
              <>
                <Pause size={12} className="fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play size={12} className="fill-current" />
                <span>Play</span>
              </>
            )}
          </button>
        </div>

        <button
          onClick={cycleSpeed}
          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-mono text-[#9d9da8] hover:text-[#f5f5f7] transition-colors"
          title="Change playback speed"
        >
          <FastForward size={11} />
          <span>{state.speed}x</span>
        </button>
      </div>
    </div>
  );
};
