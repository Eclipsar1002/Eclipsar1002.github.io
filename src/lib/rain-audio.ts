// A shared ambience engine survives Astro navigation. Rain is synthesized locally.
let context: AudioContext | undefined;
let buffer: AudioBuffer | undefined;
let source: AudioBufferSourceNode | undefined;
let gain: GainNode | undefined;
let revision = 0;
let enabled = false;
let volume = .4;

export function rainAudioState() { return { enabled, volume }; }
function notify() { document.dispatchEvent(new Event('atlas:rain-audio')); }

export function setRainVolume(value: number) {
  volume = Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : .4;
  if (context && gain) gain.gain.setTargetAtTime(volume * .5, context.currentTime, .08);
  notify();
}

export async function setRainAudio(next: boolean) {
  const current = ++revision;
  if (!next) {
    enabled = false;
    if (source && context && gain) {
      gain.gain.cancelScheduledValues(context.currentTime);
      gain.gain.setTargetAtTime(0, context.currentTime, .025);
      source.stop(context.currentTime + .15);
      source = undefined;
      gain = undefined;
    }
    notify();
    return;
  }
  try {
    const AudioEngine = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioEngine) throw new Error('Audio unavailable');
    context ??= new AudioEngine();
    await context.resume();
    if (current !== revision) return;
    if (!source) {
      if (!buffer) {
        buffer = context.createBuffer(2, context.sampleRate * 12, context.sampleRate);
        for (let channel = 0; channel < 2; channel++) {
          const samples = buffer.getChannelData(channel);
          let brown = 0;
          for (let i = 0; i < samples.length; i++) {
            const white = Math.random() * 2 - 1;
            brown = (brown + .02 * white) / 1.02;
            samples[i] = white * .35 + brown * 2.8;
          }
        }
      }
      source = context.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const lowpass = context.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 4200;
      lowpass.Q.value = .5;
      gain = context.createGain();
      gain.gain.value = 0;
      gain.gain.setTargetAtTime(volume * .5, context.currentTime, .3);
      source.connect(lowpass).connect(gain).connect(context.destination);
      // Disconnect this source's graph when it stops, including a quick restart.
      const currentGain = gain;
      const currentSource = source;
      source.onended = () => { currentSource.disconnect(); lowpass.disconnect(); currentGain.disconnect(); };
      source.start();
    }
    enabled = true;
    notify();
  } catch (error) {
    if (current === revision) { enabled = false; notify(); }
    throw error;
  }
}
