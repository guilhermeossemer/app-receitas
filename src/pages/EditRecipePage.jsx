import { useEffect, useState } from 'react';
import { ArrowLeft, Save, X } from 'lucide-react';
import { createRecipe, updateRecipe } from '../services/recipesService';

const SAVE_TIMEOUT_MS = 30000;

function withTimeout(promise, label) {
  let timeoutId;

  const timeout = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => {
      reject(new Error(`${label} demorou demais para responder.`));
    }, SAVE_TIMEOUT_MS);
  });

  return Promise.race([promise, timeout]).finally(() => {
    window.clearTimeout(timeoutId);
  });
}

function getSaveErrorMessage(error) {
  if (error?.code === 'permission-denied') {
    return 'Sem permissao para salvar. Confira as regras do Firestore.';
  }

  if (error?.code === 'unauthenticated') {
    return 'Sua sessao expirou. Saia e entre novamente.';
  }

  if (error?.code === 'unavailable' || error?.code === 'deadline-exceeded') {
    return 'O Firestore nao respondeu. Confira sua conexao e tente novamente.';
  }

  if (error?.message?.includes('demorou demais')) {
    return 'O Firestore demorou demais para responder. Confira se o banco foi criado e se as regras foram publicadas.';
  }

  return 'Nao foi possivel salvar a receita.';
}

export function EditRecipePage({ user, recipe, onCancel, onSaved }) {
  const isEditing = Boolean(recipe);
  const [title, setTitle] = useState(recipe?.title || '');
  const [category, setCategory] = useState(recipe?.category || '');
  const [content, setContent] = useState(recipe?.content || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(recipe?.title || '');
    setCategory(recipe?.category || '');
    setContent(recipe?.content || '');
  }, [recipe]);

  async function handleSave(event) {
    event.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Informe o nome da receita.');
      return;
    }

    if (!content.trim()) {
      setError('Cole ou escreva o texto da receita.');
      return;
    }

    setSaving(true);

    try {
      let recipeId = recipe?.id;

      if (!recipeId) {
        recipeId = await withTimeout(
          createRecipe(user.uid, {
            title,
            category,
            content,
            favorite: false
          }),
          'Salvar receita'
        );
      } else {
        await withTimeout(
          updateRecipe(user.uid, recipeId, {
            title,
            category,
            content
          }),
          'Atualizar receita'
        );
      }

      onSaved(recipeId);
    } catch (saveError) {
      console.error(saveError);
      setError(getSaveErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="icon-button" type="button" title="Voltar" aria-label="Voltar" onClick={onCancel}>
          <ArrowLeft size={22} />
        </button>
        <div>
          <p className="eyebrow">Receita</p>
          <h1>{isEditing ? 'Editar' : 'Nova receita'}</h1>
        </div>
      </header>

      <form className="editor-form" onSubmit={handleSave}>
        <label>
          Nome da receita
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Bolo de cenoura" />
        </label>

        <label>
          Categoria
          <input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Opcional" />
        </label>

        <label>
          Cole a receita aqui
          <textarea value={content} onChange={(event) => setContent(event.target.value)} rows={12} />
        </label>

        {error ? <p className="form-message error">{error}</p> : null}

        <div className="form-actions">
          <button className="secondary-button" type="button" onClick={onCancel}>
            <X size={20} />
            Cancelar
          </button>
          <button className="primary-button" type="submit" disabled={saving}>
            <Save size={20} />
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </main>
  );
}
