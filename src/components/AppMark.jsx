export function AppMark({ className = '' }) {
  return (
    <svg className={`app-mark ${className}`.trim()} viewBox="0 0 96 96" role="img" aria-label="Minhas Receitas">
      <path className="app-mark-steam" d="M34 26c-5-5-4-12 1-17M48 24c-5-5-4-12 1-17M62 26c-5-5-4-12 1-17" />
      <path className="app-mark-lid" d="M28 36h40c5 0 9 4 9 9H19c0-5 4-9 9-9Z" />
      <circle className="app-mark-knob" cx="58" cy="31" r="6" />
      <path className="app-mark-pot" d="M22 45h52v24a16 16 0 0 1-16 16H38a16 16 0 0 1-16-16V45Z" />
      <path className="app-mark-line" d="M36 64h24" />
    </svg>
  );
}
