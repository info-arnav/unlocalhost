'use client';

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from 'motion/react';
import Link from 'next/link';
import { useState } from 'react';
import { Logo } from '@/components/logo';
import { site } from '@/lib/site';
import styles from './floating-nav.module.css';

const links = [
  { href: '/#how', label: 'How it works' },
  { href: '/#security', label: 'Security' },
  { href: '/docs', label: 'Docs' },
];

export function FloatingNav() {
  const { scrollY } = useScroll();
  const [lifted, setLifted] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, 'change', (value) => {
    setLifted(value > 24);
  });

  return (
    <motion.header
      className={styles.shell}
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.nav
        className={styles.island}
        data-lifted={lifted}
        animate={{
          paddingLeft: lifted ? 12 : 16,
          paddingRight: lifted ? 12 : 16,
        }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        aria-label="Main"
      >
        <Link href="/" className={styles.brand}>
          <Logo size={24} />
          <span>unlocalhost</span>
        </Link>

        <ul className={styles.links}>
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>

        <div className={styles.actions}>
          <a
            className={styles.ghost}
            href={site.repo}
            target="_blank"
            rel="noreferrer noopener"
          >
            GitHub
          </a>
          <Link className={styles.cta} href="/docs">
            Get started
          </Link>
        </div>

        <button
          type="button"
          className={styles.burger}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((value) => !value)}
        >
          <span data-open={open} />
          <span data-open={open} />
        </button>
      </motion.nav>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-menu"
            className={styles.sheet}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <a href={site.repo} target="_blank" rel="noreferrer noopener">
              GitHub
            </a>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}
