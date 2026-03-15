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
    <header className={styles.islandContainer} role="banner">
      <div 
        className={`${styles.island} ${isExpanded ? styles.expanded : styles.collapsed}`}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-label={isExpanded ? "收起灵动岛" : "展开灵动岛"}
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
