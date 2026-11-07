export const RAIN_AUDIO_URL = 'https://media.rainymood.com/0.mp3';

let enabled = false;
let volume = .4;
let audio: HTMLAudioElement | undefined;

function player() {
  if (audio) return audio;
  audio = new Audio();
  audio.loop = true;
  audio.preload = 'none';
  audio.volume = volume;
  audio.addEventListener('error', () => {
    if (enabled) { enabled = false; notify('雨声音频暂时无法播放，请稍后重试。'); }
  });
  return audio;
}

export function rainAudioState() { return { enabled, volume }; }
function notify(message = '') { document.dispatchEvent(new CustomEvent('atlas:rain-audio', { detail: { message } })); }

export function setRainVolume(value: number) {
  volume = Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : .4;
  if (audio) audio.volume = volume;
  notify();
}

export async function setRainAudio(next: boolean) {
  if (!next) {
    enabled = false;
    player().pause();
    notify('听雨模式已关闭。');
    return;
  }
  const element = player();
  if (element.src !== RAIN_AUDIO_URL) element.src = RAIN_AUDIO_URL;
  element.volume = volume;
  await element.play();
  enabled = true;
  notify('正在播放循环雨声。主页音乐播放器保持不变。');
}
