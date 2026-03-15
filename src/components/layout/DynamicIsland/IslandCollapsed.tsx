"use client";

import { NavigationItems } from './NavigationItems';
import styles from './island.module.css';

interface IslandCollapsedProps {
  onExpand: () => void;
  currentSong: { name: string; artist: string; cover: string } | null;
  isPlaying: boolean;
}

export function IslandCollapsed({ 
  onExpand, 
  currentSong, 
  isPlaying
}: IslandCollapsedProps) {
  return (
    <div className={styles.collapsedContent}>
      {/* 左侧：导航 */}
      <div className={styles.collapsedNav}>
        <NavigationItems />
      </div>
      
      {/* 右侧：封面图开关 */}
      <button
        className={`${styles.coverToggle} ${isPlaying ? styles.playing : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onExpand();
        }}
        aria-label={currentSong ? `当前播放: ${currentSong.name} - ${currentSong.artist}` : '展开音乐播放器'}
        title={currentSong ? `${currentSong.name} - ${currentSong.artist}` : '音乐播放器'}
      >
        {currentSong?.cover ? (
          <img 
            src={currentSong.cover} 
            alt={currentSong.name}
            className={styles.coverImage}
          />
        ) : (
          <div className={styles.coverPlaceholder}>
            <span>♪</span>
          </div>
        )}
        
        {/* 播放指示器 */}
        {isPlaying && (
          <div className={styles.playIndicator}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
      </button>
    </div>
  );
}
