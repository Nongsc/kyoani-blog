"use client";

import { NavigationItems } from './NavigationItems';
import styles from './island.module.css';

interface IslandCollapsedProps {
  onExpand: () => void;
}

export function IslandCollapsed({ onExpand }: IslandCollapsedProps) {
  return (
    <div 
      className={styles.collapsedContent}
      onClick={onExpand}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onExpand();
        }
      }}
    >
      <NavigationItems />
    </div>
  );
}
