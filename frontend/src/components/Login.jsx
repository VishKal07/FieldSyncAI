import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Users, Shield, Activity } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      if (result.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/worker-dashboard');
      }
    }
  };

  const demoLogin = (role) => {
    if (role === 'admin') {
      setEmail('admin@fieldsync.com');
      setPassword('admin123');
    } else {
      setEmail('arjun@fieldsync.com');
      setPassword('worker123');
    }
    setSelectedRole(role);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-full p-4">
              <Activity className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-2">FieldSync AI</h2>
          <p className="text-white/80 text-lg">NGO Operations Management Platform</p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => demoLogin('admin')}
            className={`p-6 rounded-xl backdrop-blur-lg transition-all ${
              selectedRole === 'admin'
                ? 'bg-white/20 border-2 border-white'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            <Shield className="w-12 h-12 text-white mx-auto mb-3" />
            <div className="text-white font-semibold text-lg">Admin</div>
            <p className="text-white/70 text-sm mt-2">Control Centre</p>
          </button>

          <button
            onClick={() => demoLogin('worker')}
            className={`p-6 rounded-xl backdrop-blur-lg transition-all ${
              selectedRole === 'worker'
                ? 'bg-white/20 border-2 border-white'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            <Users className="w-12 h-12 text-white mx-auto mb-3" />
            <div className="text-white font-semibold text-lg">Field Worker</div>
            <p className="text-white/70 text-sm mt-2">Log Activities</p>
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="backdrop-blur-lg bg-white/10 rounded-xl p-6 space-y-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:border-white"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 focus:outline-none focus:border-white"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-white text-purple-600 py-2 rounded-lg font-semibold hover:bg-white/90 transition-all"
            >
              Sign In
            </button>
          </div>

          <p className="text-center text-white/70 text-sm">
            Click a role above to enter demo
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;