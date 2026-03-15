"use client";

import { NavigationItems } from './NavigationItems';
import styles from './island.module.css';

interface IslandCollapsedProps {
  onExpand: () => void;
}

export function IslandCollapsed({ onExpand }: IslandCollapsedProps) {
  return (
    <div className={styles.collapsedContent}>
      <NavigationItems />
    </div>
  );
}
