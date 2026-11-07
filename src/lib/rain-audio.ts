import { fetchPlaylist, type Track } from './meting';

export const RAIN_PLAYLIST_ID = '18284047077';

let tracks: Track[] = [];
let index = 0;
let loading = false;
let loadError = '';
let enabled = false;
let volume = .4;
let audio: HTMLAudioElement | undefined;
let playlistRequest: Promise<void> | undefined;

function player() {
  if (audio) return audio;
  audio = new Audio();
  audio.preload = 'none';
  audio.volume = volume;
  audio.addEventListener('ended', () => { void nextRainTrack(1, true); });
  audio.addEventListener('error', () => {
    if (enabled) { enabled = false; notify('听雨歌单播放失败，请尝试切歌。'); }
  });
  return audio;
}

export function rainAudioState() { return { enabled, volume, loading, loadError, track: tracks[index] }; }
function notify(message = '') { document.dispatchEvent(new CustomEvent('atlas:rain-audio', { detail: { message } })); }

export function prepareRainPlaylist(retry = false): Promise<void> {
  if (playlistRequest && !retry) return playlistRequest;
  loading = true;
  loadError = '';
  notify('正在加载听雨歌单…');
  playlistRequest = fetchPlaylist('netease', RAIN_PLAYLIST_ID, 740)
    .then((result) => { tracks = result; index = 0; })
    .catch((error: unknown) => { tracks = []; loadError = error instanceof Error ? error.message : '歌单加载失败'; })
    .finally(() => { loading = false; notify(loadError ? '听雨歌单加载失败，请重新打开听雨模式。' : '听雨歌单已准备好。'); });
  return playlistRequest;
}

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
  if (!tracks.length) {
    await prepareRainPlaylist(Boolean(loadError));
    if (!tracks.length) throw new Error('听雨歌单暂时不可用');
  }
  const element = player();
  const track = tracks[index];
  if (element.dataset.trackUrl !== track.url) { element.dataset.trackUrl = track.url; element.src = track.url; }
  element.volume = volume;
  await element.play();
  enabled = true;
  notify(`正在播放：${track.name} — ${track.artist}`);
}

export async function nextRainTrack(direction: -1 | 1, autoplay = enabled) {
  if (!tracks.length) return;
  index = (index + direction + tracks.length) % tracks.length;
  const element = player();
  element.dataset.trackUrl = tracks[index].url;
  element.src = tracks[index].url;
  notify(`已切换到：${tracks[index].name} — ${tracks[index].artist}`);
  if (autoplay) {
    try { await element.play(); enabled = true; }
    catch { enabled = false; notify('歌曲无法播放，请再点一次听雨模式。'); }
  }
}

void prepareRainPlaylist();
