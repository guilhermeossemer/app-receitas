import { AppMark } from './AppMark';

export function LoadingScreen() {
  return (
    <main className="center-screen">
      <div className="splash-card">
        <div className="loading-mark" aria-hidden="true">
          <AppMark animated />
        </div>
        <div className="splash-copy">
          <p className="eyebrow">Minhas Receitas</p>
          <h1>Minhas Receitas</h1>
          <p>Seu caderno digital de receitas</p>
        </div>
        <span className="loading-line" aria-hidden="true" />
        <p className="loading-text">Carregando...</p>
      </div>
    </main>
  );
}
