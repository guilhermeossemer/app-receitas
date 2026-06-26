import { useState } from 'react';
import { ArrowLeft, BookOpenCheck, Edit3, Heart, Share2, Trash2 } from 'lucide-react';
import { useWakeLock } from '../hooks/useWakeLock';
import { deleteRecipe, setRecipeFavorite } from '../services/recipesService';

export function ViewRecipePage({ user, recipe, onBack, onEdit, onDeleted }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
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
      await deleteRecipe(user, recipe.id);
      await onDeleted();
    } catch (error) {
      console.error('Delete recipe failed:', error);
      setDeleting(false);
    }
  }

  function buildShareText() {
    return [
      recipe.title,
      recipe.category ? `Categoria: ${recipe.category}` : '',
      recipe.content,
      'Compartilhado pelo app Minhas Receitas'
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  async function copyShareText(text) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }

  async function handleShare() {
    const shareText = buildShareText();

    try {
      if (navigator.share) {
        await navigator.share({
          title: recipe.title,
          text: shareText
        });
        return;
      }

      await copyShareText(shareText);
      setShareMessage('Receita copiada para compartilhar');
      window.setTimeout(() => setShareMessage(''), 3000);
    } catch (error) {
      if (error?.name !== 'AbortError') {
        console.error('Share recipe failed:', error);
        setShareMessage('Nao foi possivel compartilhar agora');
        window.setTimeout(() => setShareMessage(''), 3000);
      }
    }
  }

  return (
    <main className="recipe-view">
      <header className={`recipe-view-header ${recipe.photoUrl ? 'has-photo' : 'no-photo'}`}>
        <button className="icon-button floating" type="button" title="Voltar" aria-label="Voltar" onClick={onBack}>
          <ArrowLeft size={22} />
        </button>
        {recipe.photoUrl ? (
          <img src={recipe.photoUrl} alt={`Foto de ${recipe.title}`} />
        ) : (
          <div className="recipe-hero-placeholder" aria-hidden="true">
            <BookOpenCheck size={42} />
          </div>
        )}
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
            onClick={() => setRecipeFavorite(user, recipe.id, !recipe.favorite)}
          >
            <Heart size={22} fill={recipe.favorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        {shareMessage ? <p className="toast-message">{shareMessage}</p> : null}

        <p className="recipe-text">{recipe.content}</p>

        <div className="recipe-actions sticky-actions">
          <button className="secondary-button" type="button" onClick={handleShare}>
            <Share2 size={20} />
            Compartilhar
          </button>
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
