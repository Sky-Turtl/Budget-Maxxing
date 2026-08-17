import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { UserProfileProvider } from './contexts/UserProfileContext';
import { router } from './router';

function App() {
  return (
    <AuthProvider>
      <UserProfileProvider>
        <RouterProvider router={router} />
      </UserProfileProvider>
    </AuthProvider>
  );
}

export default App;
