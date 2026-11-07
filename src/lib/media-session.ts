interface MediaTrack { name: string; artist: string; pic?: string }

/** Keep system media controls attached to the shared audio, not page DOM. */
export function bindMediaSession(audio: HTMLAudioElement, controls: {
  play: () => void; next: () => void; previous: () => void;
}) {
  if (!('mediaSession' in navigator)) return { update: (_track?: MediaTrack) => {} };
  const session = navigator.mediaSession;
  const seek = (position: number) => {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
    audio.currentTime = Math.max(0, Math.min(position, audio.duration));
    sync();
  };
  function sync() {
    session.playbackState = audio.paused ? 'paused' : 'playing';
    if (!session.setPositionState) return;
    try {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        session.setPositionState({ duration: audio.duration, playbackRate: audio.playbackRate,
          position: Math.max(0, Math.min(audio.currentTime, audio.duration)) });
      } else session.setPositionState();
    } catch { /* Some browsers expose the API without all implementations. */ }
  }
  const handlers: Partial<Record<MediaSessionAction, MediaSessionActionHandler>> = {
    play: () => controls.play(), pause: () => audio.pause(),
    nexttrack: () => controls.next(), previoustrack: () => controls.previous(),
    seekto: (event) => { if (event.seekTime !== undefined) seek(event.seekTime); },
    seekbackward: (event) => seek(audio.currentTime - (event.seekOffset ?? 10)),
    seekforward: (event) => seek(audio.currentTime + (event.seekOffset ?? 10)),
    stop: () => { audio.pause(); seek(0); },
  };
  for (const [action, handler] of Object.entries(handlers)) {
    try { session.setActionHandler(action as MediaSessionAction, handler!); } catch { /* Unsupported action. */ }
  }
  for (const event of ['play', 'pause', 'ended', 'loadedmetadata', 'timeupdate', 'durationchange', 'ratechange', 'emptied']) {
    audio.addEventListener(event, sync);
  }
  return { update(track?: MediaTrack) {
    if (track && typeof MediaMetadata !== 'undefined') {
      let artwork: MediaImage[] = [];
      try {
        const src = new URL(track.pic || '/avatar.png', location.origin);
        if (['http:', 'https:'].includes(src.protocol)) artwork = [{ src: src.href }];
      } catch { /* Invalid upstream artwork should not interrupt playback. */ }
      session.metadata = new MediaMetadata({ title: track.name || '未知曲目', artist: track.artist || '未知艺术家', album: 'Eclipsar', artwork });
    }
    sync();
  } };
}
