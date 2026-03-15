"use client";

import { useState, useCallback } from 'react';
import { IslandCollapsed } from './IslandCollapsed';
import { IslandExpanded } from './IslandExpanded';
import styles from './island.module.css';

export function DynamicIsland() {
  const [isExpanded, setIsExpanded] = useState(false);

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
          <IslandExpanded onCollapse={() => setIsExpanded(false)} />
        ) : (
          <IslandCollapsed onExpand={toggleExpand} />
        )}
      </div>
    </header>
  );
}
