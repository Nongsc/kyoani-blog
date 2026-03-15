"use client";

import { NavigationItems } from './NavigationItems';
import { MusicPlayer } from './MusicPlayer';
import type { MusicConfig } from '@/types/music';
import styles from './island.module.css';

interface IslandExpandedProps {
  onCollapse: () => void;
  musicConfig?: MusicConfig | null;
}

export function IslandExpanded({ onCollapse, musicConfig }: IslandExpandedProps) {
  return (
    <div className={styles.expandedContent}>
      <button 
        onClick={onCollapse}
        className={styles.closeButton}
        aria-label="收起灵动岛"
      >
        ✕
      </button>
      
      <MusicPlayer config={musicConfig} />
      
      <div className={styles.expandedNav}>
        <NavigationItems />
      </div>
    </div>
  );
}
