import React, { useState } from 'react';
import useAuthStore from '@/store/authStore';
import { useNavigate } from 'react-router-dom';

const SignupForm = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const login = useAuthStore((state) => state.login);
  const saveAuth = useAuthStore((state) => state.saveAuthToLocalStorage);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // TEMP MOCK: Replace this with a POST /register API call later
      const newUser = {
        id: Date.now(),
        name,
        email,
        tier: 'free',
      };
      const token = 'mock-signup-token';

      login(newUser, token);
      saveAuth();
      navigate('/chat'); // Redirect to the chat page after signup
    } catch (err) {
      setError('Something went wrong.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 bg-card rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <input
        type="text"
        placeholder="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-2 mb-2 border rounded"
        required
      />
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
        Create Account
      </button>
    </form>
  );
};

export default SignupForm;