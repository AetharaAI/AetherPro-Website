import { useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

const LogoutButton = () => {
  const logout = useAuthStore((state) => state.logout);
  const saveAuth = useAuthStore((state) => state.saveAuthToLocalStorage);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    saveAuth();
    navigate('/'); // Redirect to landing or login page
  };

  return (
    <button onClick={handleLogout} className="text-sm text-red-500 hover:underline">
      Logout
    </button>
  );
};

export default LogoutButton;