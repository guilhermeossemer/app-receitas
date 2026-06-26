export function AppMark({ animated = false, className = '' }) {
  return (
    <svg
      className={`app-mark ${animated ? 'is-animated' : ''} ${className}`.trim()}
      viewBox="0 0 96 96"
      role="img"
      aria-label="Minhas Receitas"
    >
      <path className="app-mark-steam steam-one" d="M33 26c-5-5-4-12 1-17" />
      <path className="app-mark-steam steam-two" d="M48 24c-5-5-4-12 1-17" />
      <path className="app-mark-steam steam-three" d="M63 26c-5-5-4-12 1-17" />
      <path className="app-mark-handle" d="M22 53H14a7 7 0 0 0 0 14h8M74 53h8a7 7 0 0 1 0 14h-8" />
      <path className="app-mark-pot" d="M22 45h52v24a16 16 0 0 1-16 16H38a16 16 0 0 1-16-16V45Z" />
      <g className="app-mark-lid">
        <path className="app-mark-lid-shape" d="M29 35h41a8 8 0 0 1 8 8H22a8 8 0 0 1 7-8Z" />
        <circle className="app-mark-knob" cx="61" cy="32" r="6" />
        <path className="app-mark-knob-line" d="M58.5 32h5" />
      </g>
      <path className="app-mark-line" d="M36 63h24" />
    </svg>
  );
}
