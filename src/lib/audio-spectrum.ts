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

export function bindMusicVisualizer(root: HTMLElement, audio: HTMLAudioElement): () => void {
  const ring = root.querySelector<SVGPathElement>('[data-spectrum-ring]');
  if (!ring) return () => {};
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let disposed = false;
  let lastDraw = 0;
  const frequencies = new Uint8Array(1024);
  const pointCount = 96;
  const energies = new Float32Array(pointCount);
  const radii = new Float32Array(pointCount).fill(104);

  function renderRing() {
    const points = Array.from(radii, (radius, index) => {
      const angle = index * Math.PI * 2 / pointCount - Math.PI / 2;
      return { x: 140 + Math.cos(angle) * radius, y: 140 + Math.sin(angle) * radius };
    });
    const f = (n: number) => n.toFixed(2);
    let path = `M ${f(points[0].x)} ${f(points[0].y)}`;
    // A closed cubic curve keeps the entire frequency contour connected, including its seam.
    for (let index = 0; index < pointCount; index++) {
      const p0 = points[(index - 1 + pointCount) % pointCount];
      const p1 = points[index];
      const p2 = points[(index + 1) % pointCount];
      const p3 = points[(index + 2) % pointCount];
      const c1x = p1.x + (p2.x - p0.x) / 6;
      const c1y = p1.y + (p2.y - p0.y) / 6;
      const c2x = p2.x - (p3.x - p1.x) / 6;
      const c2y = p2.y - (p3.y - p1.y) / 6;
      path += ` C ${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(p2.x)} ${f(p2.y)}`;
    }
    path += ' Z M 238 140 A 98 98 0 1 0 42 140 A 98 98 0 1 0 238 140 Z';
    ring!.setAttribute('d', path);
  }

  function reset() {
    cancelAnimationFrame(frame);
    frame = 0;
    radii.fill(104);
    renderRing();
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
      energies.forEach((_, index) => {
        const lowHz = 45 * Math.pow(14000 / 45, index / pointCount);
        const highHz = 45 * Math.pow(14000 / 45, (index + 1) / pointCount);
        const low = Math.min(frequencies.length - 1, Math.floor(lowHz / nyquist * frequencies.length));
        const high = Math.min(frequencies.length, Math.max(low + 1, Math.ceil(highHz / nyquist * frequencies.length)));
        let peak = 0;
        for (let bin = low; bin < high; bin++) peak = Math.max(peak, frequencies[bin]);
        energies[index] = audio.muted ? 0 : Math.max(0, (peak / 255 - .16) / .7);
      });
      radii.forEach((radius, index) => {
        let energy = energies[index];
        // Spread each real frequency peak across neighboring points for a rounded, solid wave.
        for (let offset = -3; offset <= 3; offset++) {
          const neighbor = energies[(index + offset + pointCount) % pointCount];
          energy = Math.max(energy, neighbor * (1 - Math.abs(offset) / 4));
        }
        // Quiet bands stay near the disc; strong transients form deep, pronounced peaks.
        const response = Math.min(1, Math.pow(energy, 1.65));
        const target = 104 + response * 34 * Math.sqrt(audio.volume);
        const smoothing = target > radius ? .88 : .25;
        radii[index] += (target - radius) * smoothing;
      });
      renderRing();
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
