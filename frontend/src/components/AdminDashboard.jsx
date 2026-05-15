import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BarChart3, Brain, Users, CheckSquare, LogOut, Menu, X } from 'lucide-react';
import Overview from './admin/Overview';
import AIInsights from './admin/AIInsights';
import WorkersList from './admin/WorkersList';
import AssignTask from './admin/AssignTask';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'ai-insights', label: 'AI Insights', icon: Brain },
    { id: 'workers', label: 'Workers', icon: Users },
    { id: 'assign-tasks', label: 'Assign Tasks', icon: CheckSquare },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview />;
      case 'ai-insights':
        return <AIInsights />;
      case 'workers':
        return <WorkersList />;
      case 'assign-tasks':
        return <AssignTask />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-2 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">FieldSync AI — Admin</h1>
                <p className="text-sm text-gray-600">{user?.name} · Platform Administrator</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
              
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-3 px-1 border-b-2 transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-purple-600 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;