import { ChefHat } from 'lucide-react';

export function LoadingScreen() {
  return (
    <main className="center-screen">
      <div className="loading-mark" aria-hidden="true">
        <ChefHat size={28} />
      </div>
      <p>Carregando...</p>
    </main>
  );
}
