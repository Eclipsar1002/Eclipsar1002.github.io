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
    analyser.fftSize = 2048;
    analyser.minDecibels = -85;
    analyser.maxDecibels = -20;
    analyser.smoothingTimeConstant = .5;
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

export function bindMusicVisualizer(root: HTMLElement, audio: HTMLAudioElement): () => void {
  const bars = [...root.querySelectorAll<SVGLineElement>('[data-spectrum-bar]')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let disposed = false;
  let lastDraw = 0;
  const frequencies = new Uint8Array(1024);
  const heights = new Float32Array(bars.length).fill(5);

  function reset() {
    cancelAnimationFrame(frame);
    frame = 0;
    heights.fill(5);
    bars.forEach((bar) => bar.setAttribute('y2', '28'));
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
      if (graph) graph.analyser.getByteFrequencyData(frequencies);
      else frequencies.fill(0);
      const nyquist = (graph?.context.sampleRate || 44100) / 2;
      bars.forEach((bar, index) => {
        const lowHz = 45 * Math.pow(14000 / 45, index / bars.length);
        const highHz = 45 * Math.pow(14000 / 45, (index + 1) / bars.length);
        const low = Math.min(frequencies.length - 1, Math.floor(lowHz / nyquist * frequencies.length));
        const high = Math.min(frequencies.length, Math.max(low + 1, Math.ceil(highHz / nyquist * frequencies.length)));
        let peak = 0;
        for (let bin = low; bin < high; bin++) peak = Math.max(peak, frequencies[bin]);
        const energy = audio.muted ? 0 : Math.max(0, peak / 255 - .025);
        // Lift quieter details and keep transients visible without fabricating any movement.
        const response = Math.min(1, Math.pow(energy, .65) * 1.45);
        const target = 5 + response * 30 * Math.sqrt(audio.volume);
        const smoothing = target > heights[index] ? .78 : .28;
        heights[index] += (target - heights[index]) * smoothing;
        bar.setAttribute('y2', String(33 - heights[index]));
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
    // The graph stays connected because the Audio element survives Astro navigation.
  };
}
