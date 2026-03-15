export interface MusicConfig {
  id: string;
  platform: 'tencent' | 'netease' | 'kugou';
  playlistId: string;
  autoPlay: boolean;
  volume: number;
  createdAt: string;
  updatedAt: string;
}

export interface Song {
  name: string;
  artist: string;
  url: string;
  cover: string;
  lrc?: string;
}

export interface PlayerState {
  isPlaying: boolean;
  currentSong: Song | null;
  progress: number;
  duration: number;
}
