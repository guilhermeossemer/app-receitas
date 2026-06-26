import { useState } from 'react';
import { ArrowLeft, Edit3, Heart, Trash2 } from 'lucide-react';
import { useWakeLock } from '../hooks/useWakeLock';
import { deleteRecipe, setRecipeFavorite } from '../services/recipesService';

export function ViewRecipePage({ user, recipe, onBack, onEdit, onDeleted }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  useWakeLock(Boolean(recipe));

  if (!recipe) {
    return (
      <main className="app-shell">
        <header className="topbar">
          <button className="icon-button" type="button" title="Voltar" aria-label="Voltar" onClick={onBack}>
            <ArrowLeft size={22} />
          </button>
          <h1>Receita</h1>
        </header>
        <section className="empty-state">
          <h2>Receita nao encontrada</h2>
          <p>Ela pode ter sido removida.</p>
        </section>
      </main>
    );
  }

  async function handleDelete() {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }

    setDeleting(true);

    try {
      await deleteRecipe(user.uid, recipe.id);
      await onDeleted();
    } catch (error) {
      console.error('Delete recipe failed:', error);
      setDeleting(false);
    }
  }

  return (
    <main className="recipe-view">
      <header className="recipe-view-header">
        <button className="icon-button floating" type="button" title="Voltar" aria-label="Voltar" onClick={onBack}>
          <ArrowLeft size={22} />
        </button>
        {recipe.photoUrl ? <img src={recipe.photoUrl} alt={`Foto de ${recipe.title}`} /> : null}
      </header>

      <section className="recipe-content">
        <div className="recipe-title-row">
          <div>
            {recipe.category ? <p className="eyebrow">{recipe.category}</p> : null}
            <h1>{recipe.title}</h1>
          </div>
          <button
            className={`icon-button favorite-button ${recipe.favorite ? 'is-active' : ''}`}
            type="button"
            title={recipe.favorite ? 'Remover dos favoritos' : 'Marcar como favorito'}
            aria-label={recipe.favorite ? 'Remover dos favoritos' : 'Marcar como favorito'}
            onClick={() => setRecipeFavorite(user.uid, recipe.id, !recipe.favorite)}
          >
            <Heart size={22} fill={recipe.favorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        <p className="recipe-text">{recipe.content}</p>

        <div className="form-actions sticky-actions">
          <button className="secondary-button" type="button" onClick={onEdit}>
            <Edit3 size={20} />
            Editar
          </button>
          <button className="danger-button" type="button" disabled={deleting} onClick={handleDelete}>
            <Trash2 size={20} />
            {deleting ? 'Excluindo...' : confirmingDelete ? 'Confirmar exclusao' : 'Excluir'}
          </button>
        </div>
      </section>
    </main>
  );
}
