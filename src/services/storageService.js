import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../firebase';

function recipeCoverPath(uid, recipeId) {
  return `users/${uid}/recipes/${recipeId}/cover`;
}

export async function uploadRecipePhoto(uid, recipeId, file, previousPath = '') {
  if (!file) return null;

  const photoPath = recipeCoverPath(uid, recipeId);
  const photoRef = ref(storage, photoPath);

  await uploadBytes(photoRef, file, {
    contentType: file.type || 'image/jpeg'
  });

  if (previousPath && previousPath !== photoPath) {
    await deleteRecipePhoto(previousPath);
  }

  return {
    photoPath,
    photoUrl: await getDownloadURL(photoRef)
  };
}

export async function deleteRecipePhoto(photoPath) {
  if (!photoPath) return;

  try {
    await deleteObject(ref(storage, photoPath));
  } catch (error) {
    if (error?.code !== 'storage/object-not-found') {
      console.error('Delete photo failed:', error);
      throw error;
    }
  }
}
