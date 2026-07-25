import styles from './refusal.module.css';

export function Refusal() {
  return (
    <figure className={styles.term}>
      <figcaption className={styles.head}>
        <span className={styles.dots} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className={styles.title}>deploy refused</span>
      </figcaption>

      <pre className={styles.body}>
        <code>
          <span className={styles.ok}>&#10003;</span> cloned
          info-arnav/invoice-parser
          {'\n'}
          <span className={styles.ok}>&#10003;</span> checked out 8f21c04
          {'\n'}
          <span className={styles.bad}>&#10007;</span> refusing to deploy,
          secrets found
          {'\n\n'}
          <span className={styles.file}> .env</span>
          <span className={styles.reason}>
            environment file committed to the repository
          </span>
          {'\n'}
          <span className={styles.file}> src/db.ts</span>
          <span className={styles.reason}>looks like a database password</span>
          {'\n\n'}
          <span className={styles.dim}>
            Remove them, add .env to .gitignore, and pass the values{'\n'}
            through your agent instead. Nothing was published.
          </span>
        </code>
      </pre>
    </figure>
  );
}
