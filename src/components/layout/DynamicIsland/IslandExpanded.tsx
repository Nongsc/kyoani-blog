"use client";

import styles from './island.module.css';

interface IslandExpandedProps {
  onCollapse: () => void;
  children: React.ReactNode;
}

export function IslandExpanded({ onCollapse, children }: IslandExpandedProps) {
  return (
    <div className={styles.expandedContent}>
      <button 
        onClick={onCollapse}
        className={styles.closeButton}
        aria-label="收起灵动岛"
      >
        ✕
      </button>
      
      {children}
    </div>
  );
}
