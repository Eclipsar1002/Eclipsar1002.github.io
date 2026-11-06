type AudioGraph = { context: AudioContext; analyser: AnalyserNode; source: MediaElementAudioSourceNode };
const graphs = new WeakMap<HTMLAudioElement, AudioGraph>();

function getGraph(audio: HTMLAudioElement): AudioGraph | undefined {
  const existing = graphs.get(audio);
  if (existing) return existing;
  if (typeof AudioContext === 'undefined') return;
  try {
    const context = new AudioContext();
    const source = context.createMediaElementSource(audio);
    const analyser = context.createAnalyser();
    analyser.fftSize = 8192;
    analyser.minDecibels = -78;
    analyser.maxDecibels = -16;
    analyser.smoothingTimeConstant = .38;
    source.connect(analyser);
    analyser.connect(context.destination);
    const graph = { context, analyser, source };
    graphs.set(audio, graph);
    return graph;
  } catch { return; }
}

export function unlockMusicVisualizer(audio: HTMLAudioElement): void {
  const graph = getGraph(audio);
  if (graph && graph.context.state !== 'running') void graph.context.resume().catch(() => {});
}

/**
 * Adapted from JIEJOE-WEB-Tutorial/017-audio-wave (MIT).
 * Original: 200 radial lines, mean absolute PCM amplitude per group.
 * Here PCM is read live from the existing player rather than pre-decoding a demo file.
 * Copyright (c) 2026 JIEJOE'S WEB Tutorial. See public/licenses/jiejoe-audio-wave.txt.
 */
export function bindMusicVisualizer(root: HTMLElement, audio: HTMLAudioElement): () => void {
  const lines = [...root.querySelectorAll<SVGLineElement>('[data-wave-line]')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let disposed = false;
  let lastDraw = 0;
  const samples = new Float32Array(8192);
  const lengths = new Float32Array(lines.length).fill(3);

  function reset() {
    cancelAnimationFrame(frame);
    frame = 0;
    lengths.fill(3);
    lines.forEach((line) => line.setAttribute('y2', '38'));
    root.classList.remove('is-playing');
  }

  function draw(now: number) {
    frame = 0;
    if (disposed || audio.paused || audio.ended || document.hidden || !root.isConnected || reducedMotion.matches) {
      reset(); return;
    }
    if (now - lastDraw >= 30) {
      lastDraw = now;
      const graph = graphs.get(audio);
      if (graph) graph.analyser.getFloatTimeDomainData(samples);
      else samples.fill(0);
      const pointSamples = Math.floor(samples.length / lines.length);
      lines.forEach((line, index) => {
        let sum = 0;
        const start = index * pointSamples;
        for (let offset = 0; offset < pointSamples; offset++) sum += Math.abs(samples[start + offset]);
        const amplitude = audio.muted ? 0 : sum / pointSamples;
        // Preserve the tutorial's PCM grouping, with extra gain for a small album-art widget.
        const response = Math.min(1, Math.pow(Math.max(0, amplitude - .008) * 2.6, 1.25));
        const target = 3 + response * 25 * Math.sqrt(audio.volume);
        const smoothing = target > lengths[index] ? .82 : .32;
        lengths[index] += (target - lengths[index]) * smoothing;
        line.setAttribute('y2', String(41 - lengths[index]));
      });
    }
    frame = requestAnimationFrame(draw);
  }

  function start() {
    if (disposed) return;
    if (audio.paused || audio.ended || document.hidden) { reset(); return; }
    root.classList.add('is-playing');
    unlockMusicVisualizer(audio);
    if (reducedMotion.matches) { reset(); return; }
    if (!frame) frame = requestAnimationFrame(draw);
  }

  audio.addEventListener('playing', start);
  audio.addEventListener('pause', reset);
  audio.addEventListener('ended', reset);
  audio.addEventListener('emptied', reset);
  document.addEventListener('visibilitychange', start);
  reducedMotion.addEventListener('change', start);
  start();
  return () => {
    disposed = true;
    reset();
    audio.removeEventListener('playing', start);
    audio.removeEventListener('pause', reset);
    audio.removeEventListener('ended', reset);
    audio.removeEventListener('emptied', reset);
    document.removeEventListener('visibilitychange', start);
    reducedMotion.removeEventListener('change', start);
    // Keep the existing audio graph connected during Astro page navigation.
  };
}
