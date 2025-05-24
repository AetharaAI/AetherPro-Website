// src/components/common/LoginForm.jsx
import React, { useState } from 'react';
import useAuthStore from '@/store/authStore';
import { useNavigate } from 'react-router-dom'; // Ensure you have react-router-dom installed
import { useEffect } from 'react';

const LoginForm = () => { 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);
  const saveAuth = useAuthStore((state) => state.saveAuthToLocalStorage);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // TEMP MOCK: Replace with real API call to your backend
      const mockUser = { id: 1, name: 'Demo User', email, tier: 'free' };
      const mockToken = 'demo-token-12345';

      login(mockUser, mockToken);
      saveAuth();
      navigate('/chat');
    } catch (err) {
      console.error(err);
      setError('Invalid credentials');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-card rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 mb-2 border rounded"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 mb-4 border rounded"
        required
      />
      <button type="submit" className="bg-primary text-white px-4 py-2 rounded w-full">
        Login
      </button>
    </form>
  );
};

export default LoginForm;


