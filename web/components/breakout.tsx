'use client';

import { motion, useReducedMotion } from 'motion/react';
import styles from './breakout.module.css';

export function Breakout() {
  const reduced = useReducedMotion();
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <div className={styles.frame}>
      <span className={styles.frameLabel}>your machine</span>

      <div className={styles.inner}>
        <motion.p
          className={styles.prompt}
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <span className={styles.dim}>$</span> npm run dev
        </motion.p>
        <motion.p
          className={styles.local}
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          ready on <b>localhost:3000</b>
        </motion.p>
        <motion.p
          className={styles.said}
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.9 }}
        >
          <span className={styles.dim}>you</span> deploy this and let
          sarah@gmail.com in
        </motion.p>
      </div>

      <motion.a
        className={styles.escaped}
        href="#how"
        initial={reduced ? false : { opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: 1.3, ease }}
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
      </motion.a>
    </div>
  );
}
