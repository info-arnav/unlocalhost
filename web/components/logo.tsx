export function Logo({ size = 26 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle
        cx="46"
        cy="54"
        r="34"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray="10 11"
        opacity="0.9"
      />
      <circle cx="38" cy="62" r="9" stroke="currentColor" strokeWidth="7" />
      <path
        d="M44 56C56 44 66 40 76 30"
        stroke="var(--accent)"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <circle cx="79" cy="24" r="9" stroke="var(--accent)" strokeWidth="7" />
    </svg>
  );
}
