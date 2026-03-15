"use client";

import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import type { MusicConfig } from '@/types/music';
import styles from './island.module.css';

declare global {
  interface Window {
    APlayer: any;
  }
}

export interface MusicPlayerRef {
  getCurrentSong: () => { name: string; artist: string; cover: string } | null;
  togglePlay: () => void;
  isPlaying: () => boolean;
  prev: () => void;
  next: () => void;
}

interface MusicPlayerProps {
  config: MusicConfig | null;
  onSongChange?: (song: { name: string; artist: string; cover: string } | null) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
  showLyrics?: boolean;
}

export const MusicPlayer = forwardRef<MusicPlayerRef, MusicPlayerProps>(
  function MusicPlayer({ config, onSongChange, onPlayStateChange, showLyrics = true }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentSong, setCurrentSong] = useState<{ name: string; artist: string; cover: string } | null>(null);
    const audioListRef = useRef<any[]>([]);

    // 暴露方法给父组件
    useImperativeHandle(ref, () => ({
      getCurrentSong: () => currentSong,
      togglePlay: () => {
        if (playerRef.current) {
          playerRef.current.toggle();
        }
      },
      isPlaying: () => {
        if (playerRef.current) {
          return !playerRef.current.audio.paused;
        }
        return false;
      },
      prev: () => {
        if (playerRef.current) {
          playerRef.current.skipBack();
        }
      },
      next: () => {
        if (playerRef.current) {
          playerRef.current.skipForward();
        }
      }
    }), [currentSong]);

    const initPlayer = useCallback(async () => {
      const trimmedPlaylistId = config?.playlistId?.trim();
      if (!trimmedPlaylistId || !containerRef.current) return;

      try {
        // 动态加载 APlayer CSS（非阻塞）
        if (!document.querySelector('link[href*="APlayer.min.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://cdn.jsdelivr.net/npm/aplayer/dist/APlayer.min.css';
          document.head.appendChild(link);
        }

        // 动态加载 APlayer JS
        if (typeof window.APlayer === 'undefined') {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/aplayer/dist/APlayer.min.js';
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load APlayer'));
            document.body.appendChild(script);
          });
        }

        // 从 Meting API 获取歌单数据
        const apiUrl = `https://api.injahow.cn/meting/?type=playlist&id=${trimmedPlaylistId}&server=${config.platform}`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error('Failed to fetch playlist');
        }
        
        const songs = await response.json();
        
        if (!Array.isArray(songs) || songs.length === 0) {
          throw new Error('Playlist is empty');
        }

        // 转换为 APlayer 格式
        const audio = songs.map((song: any) => ({
          name: song.name || song.title,
          artist: song.artist || song.author,
          url: song.url,
          cover: song.pic || song.cover,
          lrc: song.lrc,
        }));

        // 保存音频列表引用
        audioListRef.current = audio;

        // 设置初始歌曲信息
        if (audio.length > 0) {
          const firstSong = audio[0];
          const songInfo = {
            name: firstSong.name,
            artist: firstSong.artist,
            cover: firstSong.cover,
          };
          setCurrentSong(songInfo);
          onSongChange?.(songInfo);
        }

        // 初始化 APlayer
        if (containerRef.current && config) {
          playerRef.current = new window.APlayer({
            container: containerRef.current,
            mini: !showLyrics, // 如果显示歌词则使用完整模式
            autoplay: config.autoPlay,
            theme: '#89CFF0',
            loop: 'all',
            order: 'list',
            preload: 'auto',
            volume: config.volume,
            mutex: true,
            listFolded: true,
            lrcType: showLyrics ? 3 : 0, // 3 表示解析 lrc 歌词字符串
            audio: audio,
          });

          // 监听播放事件
          playerRef.current.on('play', () => {
            onPlayStateChange?.(true);
            // 更新当前歌曲信息
            const index = playerRef.current.list.index;
            if (audioListRef.current[index]) {
              const songInfo = {
                name: audioListRef.current[index].name,
                artist: audioListRef.current[index].artist,
                cover: audioListRef.current[index].cover,
              };
              setCurrentSong(songInfo);
              onSongChange?.(songInfo);
            }
          });

          // 监听暂停事件
          playerRef.current.on('pause', () => {
            onPlayStateChange?.(false);
          });

          setIsLoading(false);
        }
      } catch (err) {
        console.error('MusicPlayer initialization error:', err);
        setError('音乐加载失败，请检查歌单配置');
        setIsLoading(false);
        onSongChange?.(null);
      }
    }, [config, onSongChange, onPlayStateChange, showLyrics]);

    useEffect(() => {
      initPlayer();

      return () => {
        if (playerRef.current) {
          try {
            playerRef.current.destroy();
          } catch (e) {
            // 忽略销毁错误
          }
          playerRef.current = null;
        }
      };
    }, [initPlayer]);

    if (!config?.playlistId?.trim()) {
      return (
        <div className={styles.playerPlaceholder}>
          请在后台配置音乐歌单
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.playerPlaceholder}>
          {error}
        </div>
      );
    }

    return (
      <div className={styles.playerContainer}>
        {isLoading && <div className={styles.loading}>加载中...</div>}
        <div ref={containerRef} className={styles.player} />
      </div>
    );
  }
);
