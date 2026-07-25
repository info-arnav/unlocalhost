'use client';

import { motion, useReducedMotion } from 'motion/react';
import styles from './breakout.module.css';

export function Breakout() {
  const reduced = useReducedMotion();
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <div className={styles.wrapper}>
      <div className={styles.frame}>
        <span className={styles.frameLabel}>your machine</span>

        <div className={styles.inner}>
          <motion.p
            className={styles.prompt}
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <span className={styles.dim}>$</span>npm run dev
          </motion.p>
          <motion.p
            className={styles.local}
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.45 }}
          >
            ready on <b>localhost:3000</b>
          </motion.p>
          <motion.p
            className={styles.said}
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.85 }}
          >
            <span className={styles.dim}>you</span>deploy this and let
            sarah@gmail.com in
          </motion.p>
        </div>
      </div>

      <motion.span
        className={styles.thread}
        initial={reduced ? false : { scaleY: 0 }}
        animate={{ scaleY: 1 }}
        style={{ originY: 0 }}
        transition={{ duration: 0.35, delay: 1.15, ease }}
        aria-hidden="true"
      />

      <motion.span
        className={styles.escaped}
        initial={reduced ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.4, ease }}
      >
        <span className={styles.lock} aria-hidden="true">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <rect
              x="4"
              y="10"
              width="16"
              height="11"
              rx="2.5"
              stroke="currentColor"
              strokeWidth="2.2"
            />
            <path
              d="M8 10V7a4 4 0 0 1 8 0v3"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <span className={styles.escapedText}>sarahs-todo.unlocalhost.tech</span>
      </motion.span>
    </div>
  );
}
