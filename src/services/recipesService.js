import { firebaseProjectId } from '../firebase';

const firestoreBaseUrl = `https://firestore.googleapis.com/v1/projects/${firebaseProjectId}/databases/(default)/documents`;

function createRecipeId() {
  if (crypto?.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '');
  }

  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
}

function recipeCollectionPath(uid) {
  return `users/${encodeURIComponent(uid)}/recipes`;
}

function recipeDocumentPath(uid, recipeId) {
  return `${recipeCollectionPath(uid)}/${encodeURIComponent(recipeId)}`;
}

function encodeValue(value) {
  if (value instanceof Date) {
    return { timestampValue: value.toISOString() };
  }

  if (typeof value === 'boolean') {
    return { booleanValue: value };
  }

  if (typeof value === 'number') {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }

  return { stringValue: String(value ?? '') };
}

function encodeFields(data) {
  return Object.fromEntries(Object.entries(data).map(([key, value]) => [key, encodeValue(value)]));
}

function decodeValue(value) {
  if ('stringValue' in value) return value.stringValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('timestampValue' in value) return new Date(value.timestampValue);
  return '';
}

function decodeDocument(document) {
  const documentId = document.name.split('/').pop();
  const fields = Object.fromEntries(
    Object.entries(document.fields || {}).map(([key, value]) => [key, decodeValue(value)])
  );

  return {
    ...fields,
    id: fields.id || documentId
  };
}

function getTimestampMillis(value) {
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'string') return Date.parse(value) || 0;
  return 0;
}

function getFirestoreErrorCode(status) {
  switch (status) {
    case 'PERMISSION_DENIED':
      return 'permission-denied';
    case 'UNAUTHENTICATED':
      return 'unauthenticated';
    case 'UNAVAILABLE':
      return 'unavailable';
    case 'DEADLINE_EXCEEDED':
      return 'deadline-exceeded';
    case 'FAILED_PRECONDITION':
      return 'failed-precondition';
    default:
      return status?.toLowerCase?.() || 'unknown';
  }
}

async function requestFirestore(user, path, options = {}) {
  const token = await user.getIdToken();
  const response = await fetch(`${firestoreBaseUrl}/${path}${options.query || ''}`, {
    method: options.method || 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const error = new Error(payload.error?.message || 'Firestore request failed');
    error.code = getFirestoreErrorCode(payload.error?.status);
    throw error;
  }

  if (response.status === 204) return null;

  return response.json();
}

export function normalizeTitle(value) {
  return value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export async function loadRecipes(user) {
  const snapshot = await requestFirestore(user, recipeCollectionPath(user.uid));
  const recipes = (snapshot.documents || []).map(decodeDocument);

  recipes.sort((a, b) => {
    const aTime = getTimestampMillis(a.updatedAt);
    const bTime = getTimestampMillis(b.updatedAt);
    return bTime - aTime;
  });

  return recipes;
}

export async function createRecipe(user, data) {
  const recipeId = createRecipeId();
  const now = new Date();

  await requestFirestore(user, recipeDocumentPath(user.uid, recipeId), {
    method: 'PATCH',
    body: {
      fields: encodeFields({
        id: recipeId,
        title: data.title.trim(),
        titleLower: normalizeTitle(data.title),
        category: data.category?.trim() || '',
        content: data.content.trim(),
        photoUrl: data.photoUrl || '',
        photoPath: data.photoPath || '',
        favorite: Boolean(data.favorite),
        createdAt: now,
        updatedAt: now
      })
    }
  });

  return recipeId;
}

export function updateRecipe(user, recipeId, data) {
  const nextData = {
    ...data,
    updatedAt: new Date()
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

  const params = new URLSearchParams();
  Object.keys(nextData).forEach((key) => params.append('updateMask.fieldPaths', key));

  return requestFirestore(user, recipeDocumentPath(user.uid, recipeId), {
    method: 'PATCH',
    query: `?${params.toString()}`,
    body: {
      fields: encodeFields(nextData)
    }
  });
}

export function deleteRecipe(user, recipeId) {
  return requestFirestore(user, recipeDocumentPath(user.uid, recipeId), {
    method: 'DELETE'
  });
}

export function setRecipeFavorite(user, recipeId, favorite) {
  return updateRecipe(user, recipeId, { favorite });
}
