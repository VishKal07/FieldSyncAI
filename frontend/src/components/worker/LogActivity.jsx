import React, { useEffect, useMemo, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Save, RefreshCw } from 'lucide-react';

const today = () => new Date().toISOString().split('T')[0];

const buildFieldValues = (definition) => {
  const values = {};
  (definition?.fields || []).forEach((field) => {
    values[field.key] = field.type === 'boolean' ? false : '';
  });
  return values;
};

const createRow = (definition) => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  fieldValues: buildFieldValues(definition)
});

const LogActivity = () => {
  const [definitions, setDefinitions] = useState([]);
  const [selectedActivityType, setSelectedActivityType] = useState('');
  const [sheetDate, setSheetDate] = useState(today());
  const [sheetRegion, setSheetRegion] = useState('');
  const [rows, setRows] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loadingDefinitions, setLoadingDefinitions] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [saving, setSaving] = useState(false);

  const selectedDefinition = useMemo(
    () => definitions.find((item) => item.activityType === selectedActivityType),
    [definitions, selectedActivityType]
  );

  const fetchDefinitions = async () => {
    try {
      const response = await api.get('/activities/definitions');
      const list = response.data || [];
      setDefinitions(list);
      if (!selectedActivityType && list.length > 0) {
        setSelectedActivityType(list[0].activityType);
      }
    } catch (error) {
      toast.error('Failed to load activity templates');
    } finally {
      setLoadingDefinitions(false);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const response = await api.get('/activities/my');
      setRecentActivities(response.data || []);
    } catch (error) {
      setRecentActivities([]);
    } finally {
      setLoadingRecent(false);
    }
  };

  useEffect(() => {
    fetchDefinitions();
    fetchRecentActivities();
  }, []);

  useEffect(() => {
    if (!selectedDefinition) {
      setRows([]);
      return;
    }
    setRows([createRow(selectedDefinition)]);
  }, [selectedDefinition]);

  const addRow = () => {
    if (!selectedDefinition) {
      toast.error('Select an activity first');
      return;
    }
    setRows((currentRows) => [...currentRows, createRow(selectedDefinition)]);
  };

  const removeRow = (id) => {
    setRows((currentRows) => {
      const nextRows = currentRows.filter((row) => row.id !== id);
      return nextRows.length === 0 && selectedDefinition ? [createRow(selectedDefinition)] : nextRows;
    });
  };

  const updateRow = (id, patch) => {
    setRows((currentRows) => currentRows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const updateField = (rowId, key, value) => {
    setRows((currentRows) => currentRows.map((row) => {
      if (row.id !== rowId) return row;
      return {
        ...row,
        fieldValues: {
          ...row.fieldValues,
          [key]: value
        }
      };
    }));
  };

  const validateRows = () => {
    if (!selectedDefinition) return 'Select an activity';
    if (!sheetDate || !sheetRegion) {
      return 'Date and region must be selected once at the top';
    }

    for (const row of rows) {
      for (const field of selectedDefinition.fields || []) {
        const value = row.fieldValues?.[field.key];
        if (field.required && (value === '' || value === null || value === undefined)) {
          return `${field.label} is required`;
        }
      }
    }

    return null;
  };

  const handleSaveSheet = async () => {
    const validationError = validateRows();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const payloadRows = rows.map((row) => ({
      date: sheetDate,
      region: sheetRegion,
      activityType: selectedDefinition.activityType,
      templateId: selectedDefinition._id || undefined,
      fieldValues: row.fieldValues,
      ...row.fieldValues
    }));

    try {
      setSaving(true);
      await api.post('/activities/bulk', { rows: payloadRows });
      toast.success('Activity rows saved');
      setRows([createRow(selectedDefinition)]);
      fetchRecentActivities();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save activity rows');
    } finally {
      setSaving(false);
    }
  };

  const renderFieldCell = (row, field) => {
    const value = row.fieldValues?.[field.key];

    if (field.type === 'select') {
      return (
        <select
          value={value || ''}
          onChange={(event) => updateField(row.id, field.key, event.target.value)}
          className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
        >
          <option value="">Select</option>
          {(field.options || []).map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      );
    }

    if (field.type === 'date') {
      return (
        <input
          type="date"
          value={value || ''}
          onChange={(event) => updateField(row.id, field.key, event.target.value)}
          className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
        />
      );
    }

    if (field.type === 'number') {
      return (
        <input
          type="number"
          value={value}
          onChange={(event) => updateField(row.id, field.key, event.target.value)}
          min="0"
          className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
        />
      );
    }

    if (field.type === 'boolean') {
      return (
        <div className="flex justify-center">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(event) => updateField(row.id, field.key, event.target.checked)}
          />
        </div>
      );
    }

    return (
      <input
        type="text"
        value={value || ''}
        onChange={(event) => updateField(row.id, field.key, event.target.value)}
        placeholder={field.placeholder || ''}
        className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
      />
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[260px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Activity</label>
            <select
              value={selectedActivityType}
              onChange={(event) => setSelectedActivityType(event.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Select activity</option>
              {definitions.map((definition) => (
                <option key={definition._id || definition.activityType} value={definition.activityType}>
                  {definition.activityType}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[180px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={sheetDate}
              onChange={(event) => setSheetDate(event.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div className="min-w-[220px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
            <input
              type="text"
              value={sheetRegion}
              onChange={(event) => setSheetRegion(event.target.value)}
              placeholder="Select region once"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <button
            onClick={addRow}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add row</span>
          </button>

          <button
            onClick={handleSaveSheet}
            disabled={saving || rows.length === 0}
            className="flex items-center space-x-2 px-4 py-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 disabled:opacity-70"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save sheet'}</span>
          </button>
        </div>

        {loadingDefinitions ? (
          <div className="py-8 text-center text-gray-500">Loading activity fields...</div>
        ) : !selectedDefinition ? (
          <div className="py-8 text-center text-gray-500">Select an activity to load its fields.</div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {(selectedDefinition.fields || []).map((field) => (
                    <th key={field.key} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase min-w-[160px]">
                      {field.label}{field.required ? ' *' : ''}
                    </th>
                  ))}
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {rows.map((row) => (
                  <tr key={row.id}>
                    {(selectedDefinition.fields || []).map((field) => (
                      <td key={`${row.id}-${field.key}`} className="px-3 py-2">
                        {renderFieldCell(row, field)}
                      </td>
                    ))}
                    <td className="px-3 py-2">
                      <button
                        onClick={() => removeRow(row.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Remove row"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Recent saved rows</h3>
            <p className="text-sm text-gray-600">Latest entries from backend.</p>
          </div>
          <button
            onClick={fetchRecentActivities}
            className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {loadingRecent ? (
          <div className="text-center text-gray-500 py-8">Loading recent activities...</div>
        ) : recentActivities.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No activity rows saved yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Region</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentActivities.map((activity) => (
                  <tr key={activity._id}>
                    <td className="px-4 py-3 text-gray-700">{new Date(activity.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-gray-900 font-medium">{activity.activityType}</td>
                    <td className="px-4 py-3 text-gray-700">{activity.region}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogActivity;
