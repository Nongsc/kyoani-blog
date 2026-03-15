"use client";

import { useEffect, useRef, useState } from 'react';
import type { MusicConfig } from '@/types/music';
import styles from './island.module.css';

declare global {
  interface Window {
    APlayer: any;
    Meting: any;
  }
}

interface MusicPlayerProps {
  config: MusicConfig | null;
}

export function MusicPlayer({ config }: MusicPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 检查playlistId是否存在且非空（去除空白字符）
    const trimmedPlaylistId = config?.playlistId?.trim();
    if (!trimmedPlaylistId || !containerRef.current) return;

    // 动态加载 APlayer CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/aplayer/dist/APlayer.min.css';
    document.head.appendChild(link);

    // 动态加载 APlayer JS
    const aplayerScript = document.createElement('script');
    aplayerScript.src = 'https://cdn.jsdelivr.net/npm/aplayer/dist/APlayer.min.js';
    aplayerScript.async = true;

    aplayerScript.onload = () => {
      // 动态加载 MetingJS
      const metingScript = document.createElement('script');
      metingScript.src = 'https://cdn.jsdelivr.net/npm/meting@2.0.1/dist/Meting.min.js';
      metingScript.async = true;

      metingScript.onload = () => {
        // 初始化播放器
        playerRef.current = new window.Meting({
          container: containerRef.current,
          server: config.platform,
          type: 'playlist',
          id: trimmedPlaylistId,
          fixed: false,
          mini: true,
          autoplay: config.autoPlay,
          volume: config.volume,
          theme: '#89CFF0',
        });

        setIsLoading(false);
      };

      document.body.appendChild(metingScript);
    };

    document.body.appendChild(aplayerScript);

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [config]);

  if (!config?.playlistId?.trim()) {
    return (
      <div className={styles.playerPlaceholder}>
        请在后台配置音乐歌单
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
