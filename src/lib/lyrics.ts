export function parseLyrics(text: string) {
  const offset = Number(text.match(/\[offset:([+-]?\d+)\]/i)?.[1] || 0) / 1000;
  return text.split(/\r?\n/).flatMap((line) => {
    const value = line.replace(/\[[^\]]*\]/g, '').trim();
    if (!value) return [];
    return [...line.matchAll(/\[(\d+):(\d+(?:\.\d+)?)\]/g)].map((match) => ({
      time: Number(match[1]) * 60 + Number(match[2]) + offset, text: value,
    }));
  }).sort((a, b) => a.time - b.time);
}

export function createLyrics() {
  let key = '';
  let controller: AbortController | undefined;
  let lines: ReturnType<typeof parseLyrics> = [];
  let status = '播放音乐时显示歌词';
  let rendered: HTMLElement | null = null;
  let active = -2;
  function render(time: number) {
    const root = document.querySelector<HTMLElement>('[data-lyrics]');
    if (!root) return;
    if (rendered !== root) {
      root.replaceChildren();
      if (lines.length) lines.forEach((line) => {
        const element = document.createElement('p');
        element.textContent = line.text;
        root.append(element);
      });
      else { const element = document.createElement('p'); element.textContent = status; root.append(element); }
      rendered = root;
      active = -2;
    }
    let index = -1;
    for (let i = 0; i < lines.length && lines[i].time <= time; i++) index = i;
    if (index === active) return;
    active = index;
    [...root.children].forEach((element, i) => element.classList.toggle('is-current', i === index));
    const current = root.children[Math.max(index, 0)] as HTMLElement | undefined;
    if (current) root.scrollTo({ top: current.offsetTop - root.offsetTop - (root.clientHeight - current.offsetHeight) / 2,
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
  async function update(track: { url?: string; lrc?: string } | undefined, time: () => number) {
    const next = `${track?.url || ''}|${track?.lrc || ''}`;
    if (next === key) { render(time()); return; }
    key = next;
    controller?.abort();
    const request = new AbortController(); controller = request;
    lines = []; rendered = null;
    status = track?.lrc ? '正在加载歌词…' : '暂无歌词';
    render(time());
    if (!track?.lrc) return;
    const timer = setTimeout(() => request.abort(), 12000);
    try {
      let text = track.lrc;
      if (!text.includes('[00:') && !/\[\d+:\d+/.test(text)) {
        const url = new URL(text, location.origin);
        if (url.protocol !== 'https:' && url.origin !== location.origin) throw new Error('Invalid lyric URL');
        const response = await fetch(url, { signal: request.signal });
        if (!response.ok) throw new Error('Lyrics unavailable');
        text = await response.text();
        try { const data = JSON.parse(text); text = data.lrc?.lyric || data.lyric || ''; } catch { /* Plain LRC. */ }
      }
      if (controller !== request) return;
      lines = parseLyrics(text);
      status = lines.length ? '' : '暂无同步歌词';
    } catch { if (controller !== request) return; status = '歌词暂时无法加载'; }
    finally { clearTimeout(timer); }
    rendered = null; render(time());
  }
  return { update, render };
}
