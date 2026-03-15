"use client";

import { useState, useCallback, useEffect } from 'react';
import { IslandCollapsed } from './IslandCollapsed';
import { IslandExpanded } from './IslandExpanded';
import { getMusicConfig } from '@/lib/music';
import type { MusicConfig } from '@/types/music';
import styles from './island.module.css';

export function DynamicIsland() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [musicConfig, setMusicConfig] = useState<MusicConfig | null>(null);

  useEffect(() => {
    getMusicConfig().then(setMusicConfig);
  }, []);

  const toggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  return (
    <header className={styles.islandContainer}>
      <div 
        className={`${styles.island} ${isExpanded ? styles.expanded : styles.collapsed}`}
        onClick={!isExpanded ? toggleExpand : undefined}
      >
        {isExpanded ? (
          <IslandExpanded 
            onCollapse={() => setIsExpanded(false)} 
            musicConfig={musicConfig}
          />
        ) : (
          <IslandCollapsed onExpand={toggleExpand} />
        )}
      </div>
    </header>
  );
}
