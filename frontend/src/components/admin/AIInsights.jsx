import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Brain, Lightbulb, TrendingUp, AlertTriangle, Award, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const AIInsights = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    generateInsights();
  }, []);

  const generateInsights = async () => {
    setGenerating(true);
    try {
      const response = await api.post('/ai/insights');
      setInsights(response.data.insights);
      toast.success('AI insights generated successfully!');
    } catch (error) {
      console.error('Failed to generate insights:', error);
      // Mock insights for demo
      setInsights([
        { text: 'Region East: 32% lower engagement compared to last week. Recommend assigning an awareness campaign.' },
        { text: 'Water shortage is the top issue in 4 regions. Flagged by 11 field workers this week. Consider escalating to program team.' },
        { text: 'Arjun Kumar has a 3-week consistent streak. All tasks completed on time. Top performer this month.' },
        { text: 'Campaigns outperform surveys by 2.4×. Awareness campaigns show higher beneficiary participation across all regions.' }
      ]);
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  };

  const getIcon = (index) => {
    const icons = [TrendingUp, AlertTriangle, Award, Zap];
    const Icon = icons[index % icons.length];
    return <Icon className="w-6 h-6" />;
  };

  const getColor = (index) => {
    const colors = ['bg-blue-500', 'bg-yellow-500', 'bg-green-500', 'bg-purple-500'];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="w-6 h-6" />
              <h2 className="text-xl font-semibold">AI-GENERATED INSIGHTS · TODAY</h2>
            </div>
            <p className="text-white/80">Powered by Claude AI - Real-time analytics and recommendations</p>
          </div>
          <button
            onClick={generateInsights}
            disabled={generating}
            className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Refresh Insights'}
          </button>
        </div>
      </div>

      {/* Insights Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading AI insights...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insights.map((insight, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all">
              <div className="flex items-start space-x-4">
                <div className={`${getColor(index)} p-3 rounded-full text-white flex-shrink-0`}>
                  {getIcon(index)}
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 leading-relaxed">{insight.text}</p>
                  {insight.text.includes('recommend') && (
                    <button className="mt-3 text-purple-600 text-sm font-medium hover:text-purple-700">
                      Take Action →
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Zap className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="text-left px-4 py-3 bg-white rounded-lg hover:shadow-md transition-all">
            <p className="font-medium text-gray-900">Assign Campaign to East Region</p>
            <p className="text-sm text-gray-600">Improve engagement by 32%</p>
          </button>
          <button className="text-left px-4 py-3 bg-white rounded-lg hover:shadow-md transition-all">
            <p className="font-medium text-gray-900">Escalate Water Shortage Issues</p>
            <p className="text-sm text-gray-600">4 regions affected</p>
          </button>
          <button className="text-left px-4 py-3 bg-white rounded-lg hover:shadow-md transition-all">
            <p className="font-medium text-gray-900">Recognize Top Performer</p>
            <p className="text-sm text-gray-600">Arjun Kumar - 3 week streak</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;