export function AppMark({ className = '' }) {
  return <img className={`app-mark ${className}`.trim()} src={`${import.meta.env.BASE_URL}icons/icon-512.png`} alt="" />;
}
