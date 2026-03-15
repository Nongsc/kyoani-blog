"use client";

import styles from './island.module.css';

interface IslandCollapsedProps {
  onExpand: () => void;
}

export function IslandCollapsed({ onExpand }: IslandCollapsedProps) {
  return (
    <div className={styles.collapsedContent}>
      <span className={styles.placeholder}>灵动岛</span>
    </div>
  );
}
