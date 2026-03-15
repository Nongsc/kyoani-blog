"use client";

import styles from './island.module.css';

interface IslandExpandedProps {
  onCollapse: () => void;
}

export function IslandExpanded({ onCollapse }: IslandExpandedProps) {
  return (
    <div className={styles.expandedContent}>
      <button 
        onClick={onCollapse}
        className={styles.closeButton}
        aria-label="收起灵动岛"
      >
        ✕
      </button>
      <span className={styles.placeholder}>音乐播放器区域</span>
    </div>
  );
}
