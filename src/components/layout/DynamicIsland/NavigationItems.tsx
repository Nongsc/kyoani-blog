"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User } from 'lucide-react';
import styles from './island.module.css';

const NAV_ITEMS = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/about', icon: User, label: 'About' },
] as const;

export function NavigationItems() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="主导航">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navItem} ${isActive ? styles.active : ''}`}
            aria-current={isActive ? 'page' : undefined}
            onClick={(e) => e.stopPropagation()}
          >
            <Icon className={styles.navIcon} aria-hidden="true" />
            <span className={styles.navLabel}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
