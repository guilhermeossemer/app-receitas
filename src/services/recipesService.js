import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebase';

export function normalizeTitle(value) {
  return value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function recipesCollection(uid) {
  return collection(db, 'users', uid, 'recipes');
}

function recipeDocument(uid, recipeId) {
  return doc(db, 'users', uid, 'recipes', recipeId);
}

export function subscribeToRecipes(uid, onRecipes, onError) {
  return onSnapshot(
    recipesCollection(uid),
    (snapshot) => {
      const recipes = snapshot.docs.map((recipeDoc) => ({
        id: recipeDoc.id,
        ...recipeDoc.data()
      }));

      recipes.sort((a, b) => {
        const aTime = a.updatedAt?.toMillis?.() || 0;
        const bTime = b.updatedAt?.toMillis?.() || 0;
        return bTime - aTime;
      });

      onRecipes(recipes);
    },
    onError
  );
}

export async function createRecipe(uid, data) {
  const ref = doc(recipesCollection(uid));
  const now = serverTimestamp();

  await setDoc(ref, {
    id: ref.id,
    title: data.title.trim(),
    titleLower: normalizeTitle(data.title),
    category: data.category?.trim() || '',
    content: data.content.trim(),
    photoUrl: data.photoUrl || '',
    photoPath: data.photoPath || '',
    favorite: Boolean(data.favorite),
    createdAt: now,
    updatedAt: now
  });

  return ref.id;
}

export function updateRecipe(uid, recipeId, data) {
  const nextData = {
    ...data,
    updatedAt: serverTimestamp()
  };

  if (data.title !== undefined) {
    nextData.title = data.title.trim();
    nextData.titleLower = normalizeTitle(data.title);
  }

  if (data.category !== undefined) {
    nextData.category = data.category.trim();
  }

  if (data.content !== undefined) {
    nextData.content = data.content.trim();
  }

  return updateDoc(recipeDocument(uid, recipeId), nextData);
}

export function deleteRecipe(uid, recipeId) {
  return deleteDoc(recipeDocument(uid, recipeId));
}

export function setRecipeFavorite(uid, recipeId, favorite) {
  return updateRecipe(uid, recipeId, { favorite });
}
