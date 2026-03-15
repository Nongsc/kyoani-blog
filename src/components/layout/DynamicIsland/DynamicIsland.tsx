"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { IslandCollapsed } from './IslandCollapsed';
import { IslandExpanded } from './IslandExpanded';
import { MusicPlayer } from './MusicPlayer';
import { getMusicConfig } from '@/lib/music';
import type { MusicConfig } from '@/types/music';
import type { MusicPlayerRef } from './MusicPlayer';
import styles from './island.module.css';

export function DynamicIsland() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [musicConfig, setMusicConfig] = useState<MusicConfig | null>(null);
  const [currentSong, setCurrentSong] = useState<{ name: string; artist: string; cover: string } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<MusicPlayerRef | null>(null);

  useEffect(() => {
    getMusicConfig().then(setMusicConfig);
  }, []);

  const toggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const handleSongChange = useCallback((song: { name: string; artist: string; cover: string } | null) => {
    setCurrentSong(song);
  }, []);

  const handlePlayStateChange = useCallback((playing: boolean) => {
    setIsPlaying(playing);
  }, []);

  return (
    <header className={styles.islandContainer} role="banner">
      <div 
        className={`${styles.island} ${isExpanded ? styles.expanded : styles.collapsed}`}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-label={isExpanded ? "收起灵动岛" : "展开灵动岛"}
      >
        {/* 折叠状态 */}
        <div className={isExpanded ? styles.hidden : undefined}>
          <IslandCollapsed 
            onExpand={toggleExpand}
            currentSong={currentSong}
            isPlaying={isPlaying}
          />
        </div>
        
        {/* 展开状态 */}
        <div className={isExpanded ? undefined : styles.hidden}>
          <IslandExpanded 
            onCollapse={() => setIsExpanded(false)} 
          >
            <MusicPlayer 
              ref={playerRef}
              config={musicConfig ?? null} 
              onSongChange={handleSongChange}
              onPlayStateChange={handlePlayStateChange}
            />
          </IslandExpanded>
        </div>
      </div>
    </header>
  );
}
