import { BookOpen, Heart } from 'lucide-react';

export function RecipeCard({ recipe, onOpen, onToggleFavorite }) {
  return (
    <article className="recipe-card" onClick={onOpen}>
      <div className="recipe-thumb" aria-hidden="true">
        {recipe.photoUrl ? <img src={recipe.photoUrl} alt="" /> : <BookOpen size={24} />}
      </div>
      <div className="recipe-card-body">
        <h2>{recipe.title}</h2>
        {recipe.category ? <p>{recipe.category}</p> : null}
      </div>
      <button
        className={`icon-button favorite-button ${recipe.favorite ? 'is-active' : ''}`}
        type="button"
        title={recipe.favorite ? 'Remover dos favoritos' : 'Marcar como favorito'}
        aria-label={recipe.favorite ? 'Remover dos favoritos' : 'Marcar como favorito'}
        onClick={(event) => {
          event.stopPropagation();
          onToggleFavorite();
        }}
      >
        <Heart size={22} fill={recipe.favorite ? 'currentColor' : 'none'} />
      </button>
    </article>
  );
}
