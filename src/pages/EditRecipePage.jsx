import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Camera, Save, Trash2, X } from 'lucide-react';
import { createRecipe, updateRecipe } from '../services/recipesService';
import { deleteRecipePhoto, uploadRecipePhoto } from '../services/storageService';

export function EditRecipePage({ user, recipe, onCancel, onSaved }) {
  const isEditing = Boolean(recipe);
  const [title, setTitle] = useState(recipe?.title || '');
  const [category, setCategory] = useState(recipe?.category || '');
  const [content, setContent] = useState(recipe?.content || '');
  const [photoFile, setPhotoFile] = useState(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(recipe?.title || '');
    setCategory(recipe?.category || '');
    setContent(recipe?.content || '');
    setPhotoFile(null);
    setRemovePhoto(false);
  }, [recipe]);

  const selectedPhotoUrl = useMemo(() => {
    if (photoFile) return URL.createObjectURL(photoFile);
    return '';
  }, [photoFile]);

  const previewUrl = useMemo(() => {
    if (selectedPhotoUrl) return selectedPhotoUrl;
    if (!removePhoto && recipe?.photoUrl) return recipe.photoUrl;
    return '';
  }, [recipe?.photoUrl, removePhoto, selectedPhotoUrl]);

  useEffect(() => {
    return () => {
      if (selectedPhotoUrl) {
        URL.revokeObjectURL(selectedPhotoUrl);
      }
    };
  }, [selectedPhotoUrl]);

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
        recipeId = await createRecipe(user.uid, {
          title,
          category,
          content,
          favorite: false
        });
      } else {
        await updateRecipe(user.uid, recipeId, {
          title,
          category,
          content
        });
      }

      if (photoFile) {
        const photo = await uploadRecipePhoto(user.uid, recipeId, photoFile, recipe?.photoPath);
        await updateRecipe(user.uid, recipeId, photo);
      } else if (removePhoto && recipe?.photoPath) {
        await deleteRecipePhoto(recipe.photoPath);
        await updateRecipe(user.uid, recipeId, {
          photoUrl: '',
          photoPath: ''
        });
      }

      onSaved(recipeId);
    } catch (saveError) {
      console.error(saveError);
      setError('Nao foi possivel salvar a receita.');
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

        <div className="photo-editor">
          {previewUrl ? <img src={previewUrl} alt="Foto da receita" /> : <div className="photo-placeholder">Sem foto</div>}
          <div className="photo-actions">
            <label className="secondary-button file-button">
              <Camera size={20} />
              {previewUrl ? 'Trocar foto' : 'Adicionar foto'}
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    setPhotoFile(file);
                    setRemovePhoto(false);
                  }
                }}
              />
            </label>
            {previewUrl ? (
              <button
                className="ghost-button"
                type="button"
                onClick={() => {
                  setPhotoFile(null);
                  setRemovePhoto(true);
                }}
              >
                <Trash2 size={20} />
                Remover foto
              </button>
            ) : null}
          </div>
        </div>

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
