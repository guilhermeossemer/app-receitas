import { LogOut, Plus, Search } from 'lucide-react';
import { RecipeCard } from '../components/RecipeCard';
import { normalizeTitle, setRecipeFavorite } from '../services/recipesService';

export function RecipesPage({
  user,
  recipes,
  loading,
  error,
  search,
  setSearch,
  onNew,
  onOpen,
  onLogout,
  onReload,
  onRecipesChanged
}) {
  const filteredRecipes = recipes.filter((recipe) =>
    normalizeTitle(recipe.title || '').includes(normalizeTitle(search || ''))
  );

  async function handleToggleFavorite(recipe) {
    await setRecipeFavorite(user, recipe.id, !recipe.favorite);
    onRecipesChanged();
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Minhas Receitas</p>
          <h1>Receitas</h1>
          <p className="signed-user">{user.email}</p>
        </div>
        <button className="icon-button" type="button" title="Sair" aria-label="Sair" onClick={onLogout}>
          <LogOut size={22} />
        </button>
      </header>

      <section className="list-tools">
        <label className="search-field">
          <Search size={20} aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar pelo nome"
          />
        </label>
        <button className="primary-button" type="button" onClick={onNew}>
          <Plus size={20} />
          Nova receita
        </button>
      </section>

      {error ? (
        <div className="form-message error message-with-action">
          <p>{error}</p>
          <button className="secondary-button" type="button" onClick={onReload}>
            Tentar de novo
          </button>
        </div>
      ) : null}

      {loading ? (
        <p className="empty-state">Carregando receitas...</p>
      ) : filteredRecipes.length ? (
        <section className="recipe-list" aria-label="Lista de receitas">
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onOpen={() => onOpen(recipe.id)}
              onToggleFavorite={() => handleToggleFavorite(recipe)}
            />
          ))}
        </section>
      ) : (
        <section className="empty-state">
          <h2>{search ? 'Nenhuma receita encontrada' : 'Nenhuma receita salva'}</h2>
          <p>{search ? 'Tente buscar por outro nome.' : 'Cadastre sua primeira receita para ela aparecer aqui.'}</p>
        </section>
      )}
    </main>
  );
}
