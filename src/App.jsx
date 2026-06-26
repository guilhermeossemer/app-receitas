import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './auth/AuthProvider';
import { LoadingScreen } from './components/LoadingScreen';
import { firebaseProjectId } from './firebase';
import { EditRecipePage } from './pages/EditRecipePage';
import { LoginPage } from './pages/LoginPage';
import { RecipesPage } from './pages/RecipesPage';
import { ViewRecipePage } from './pages/ViewRecipePage';
import { loadRecipes } from './services/recipesService';

function initialRoute() {
  return { name: 'recipes', recipeId: null };
}

function getRecipesErrorMessage(error) {
  if (error?.code === 'permission-denied') {
    return 'Sem permissao para ler suas receitas. Confira as regras do Firestore.';
  }

  if (error?.code === 'unauthenticated') {
    return 'Sua sessao expirou. Saia e entre novamente.';
  }

  if (error?.code === 'unavailable' || error?.code === 'deadline-exceeded') {
    return 'O Firestore nao respondeu. Confira sua conexao e tente novamente.';
  }

  if (error?.code === 'failed-precondition') {
    return 'O Firestore ainda nao esta pronto neste projeto.';
  }

  return 'Nao foi possivel carregar suas receitas.';
}

export default function App() {
  const { user, initializing, logout } = useAuth();
  const [route, setRoute] = useState(initialRoute);
  const [recipes, setRecipes] = useState([]);
  const [recipesLoading, setRecipesLoading] = useState(false);
  const [recipesError, setRecipesError] = useState('');
  const [search, setSearch] = useState('');

  const refreshRecipes = useCallback(async () => {
    if (!user) return;

    setRecipesLoading(true);
    setRecipesError('');

    const loadingTimer = window.setTimeout(() => {
      setRecipesLoading(false);
      setRecipesError(
        `O Firestore demorou demais para responder no projeto ${firebaseProjectId}. Confira se o banco foi criado e se as regras foram publicadas.`
      );
    }, 15000);

    try {
      const nextRecipes = await loadRecipes(user.uid);
      window.clearTimeout(loadingTimer);
      setRecipes(nextRecipes);
      setRecipesError('');
      setRecipesLoading(false);
    } catch (error) {
      window.clearTimeout(loadingTimer);
      console.error(error);
      setRecipesError(getRecipesErrorMessage(error));
      setRecipesLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setRecipes([]);
      setRoute(initialRoute());
      return undefined;
    }

    refreshRecipes();
    return undefined;
  }, [user, refreshRecipes]);

  if (initializing) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoginPage />;
  }

  const selectedRecipe = recipes.find((recipe) => recipe.id === route.recipeId) || null;

  if (route.name === 'new') {
    return (
      <EditRecipePage
        user={user}
        onCancel={() => setRoute(initialRoute())}
        onSaved={async (recipeId) => {
          await refreshRecipes();
          setRoute({ name: 'view', recipeId });
        }}
      />
    );
  }

  if (route.name === 'edit') {
    return (
      <EditRecipePage
        user={user}
        recipe={selectedRecipe}
        onCancel={() => setRoute({ name: 'view', recipeId: route.recipeId })}
        onSaved={async (recipeId) => {
          await refreshRecipes();
          setRoute({ name: 'view', recipeId });
        }}
      />
    );
  }

  if (route.name === 'view') {
    return (
      <ViewRecipePage
        user={user}
        recipe={selectedRecipe}
        onBack={() => setRoute(initialRoute())}
        onEdit={() => setRoute({ name: 'edit', recipeId: route.recipeId })}
        onDeleted={async () => {
          await refreshRecipes();
          setRoute(initialRoute());
        }}
      />
    );
  }

  return (
    <RecipesPage
      user={user}
      recipes={recipes}
      loading={recipesLoading}
      error={recipesError}
      search={search}
      setSearch={setSearch}
      onNew={() => setRoute({ name: 'new', recipeId: null })}
      onOpen={(recipeId) => setRoute({ name: 'view', recipeId })}
      onLogout={logout}
      onReload={refreshRecipes}
      onRecipesChanged={refreshRecipes}
    />
  );
}
