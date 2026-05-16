import React, { useEffect, useMemo, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Save, RefreshCw } from 'lucide-react';

const emptyField = () => ({
  key: '',
  label: '',
  type: 'text',
  required: false,
  optionsText: '',
  placeholder: ''
});

const emptyDefinition = () => ({
  activityType: '',
  description: '',
  fields: [emptyField()]
});

const fieldTypeOptions = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'select', label: 'Select' },
  { value: 'boolean', label: 'Boolean' }
];

const ActivityDefinitions = () => {
  const [definitions, setDefinitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyDefinition());

  const fetchDefinitions = async () => {
    try {
      const response = await api.get('/activities/definitions');
      setDefinitions(response.data || []);
    } catch (error) {
      toast.error('Failed to load activity templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDefinitions();
  }, []);

  const normalizedFields = useMemo(() => {
    return form.fields.map((field) => ({
      ...field,
      options: field.type === 'select'
        ? field.optionsText.split(',').map((item) => item.trim()).filter(Boolean)
        : []
    }));
  }, [form.fields]);

  const updateField = (index, patch) => {
    setForm((current) => ({
      ...current,
      fields: current.fields.map((field, fieldIndex) => fieldIndex === index ? { ...field, ...patch } : field)
    }));
  };

  const addField = () => {
    setForm((current) => ({
      ...current,
      fields: [...current.fields, emptyField()]
    }));
  };

  const removeField = (index) => {
    setForm((current) => ({
      ...current,
      fields: current.fields.filter((_, fieldIndex) => fieldIndex !== index)
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.activityType.trim()) {
      toast.error('Activity name is required');
      return;
    }

    const fields = normalizedFields.map((field) => ({
      key: field.key.trim(),
      label: field.label.trim(),
      type: field.type,
      required: field.required,
      options: field.options,
      placeholder: field.placeholder
    })).filter((field) => field.key && field.label);

    if (fields.length === 0) {
      toast.error('Add at least one valid field');
      return;
    }

    try {
      setSaving(true);
      await api.post('/activities/definitions', {
        activityType: form.activityType.trim(),
        description: form.description.trim(),
        fields
      });
      toast.success('Activity template created');
      setForm(emptyDefinition());
      fetchDefinitions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save activity template');
    } finally {
      setSaving(false);
    }
  };

  const deleteDefinition = async (id) => {
    try {
      await api.delete(`/activities/definitions/${id}`);
      toast.success('Activity template deleted');
      fetchDefinitions();
    } catch (error) {
      toast.error('Failed to delete activity template');
    }
  };

  const isBuiltin = (definition) => !definition._id;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Activity Setup</h2>
            <p className="text-gray-600 mt-1">Create activity types and define the sheet columns workers should fill out.</p>
          </div>
          <button
            onClick={fetchDefinitions}
            className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Activity Name</label>
              <input
                type="text"
                value={form.activityType}
                onChange={(event) => setForm({ ...form, activityType: event.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                placeholder="e.g. Household Visit"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                placeholder="Short description of the activity"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Fields / Attributes</h3>
              <button
                type="button"
                onClick={addField}
                className="flex items-center space-x-2 px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add field</span>
              </button>
            </div>

            {form.fields.map((field, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 border border-gray-200 rounded-xl bg-gray-50">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Key</label>
                  <input
                    type="text"
                    value={field.key}
                    onChange={(event) => updateField(index, { key: event.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="beneficiaryCount"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
                  <input
                    type="text"
                    value={field.label}
                    onChange={(event) => updateField(index, { label: event.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Beneficiary Count"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                  <select
                    value={field.type}
                    onChange={(event) => updateField(index, { type: event.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {fieldTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Placeholder</label>
                  <input
                    type="text"
                    value={field.placeholder}
                    onChange={(event) => updateField(index, { placeholder: event.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Optional hint"
                  />
                </div>
                <div className="md:col-span-2 flex items-end gap-3">
                  {field.type === 'select' && (
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Options</label>
                      <input
                        type="text"
                        value={field.optionsText || ''}
                        onChange={(event) => updateField(index, { optionsText: event.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="High, Medium, Low"
                      />
                    </div>
                  )}
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(event) => updateField(index, { required: event.target.checked })}
                    />
                    Required
                  </label>
                  <button
                    type="button"
                    onClick={() => removeField(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Remove field"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-70"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save activity template'}</span>
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-6 text-gray-500">Loading templates...</div>
        ) : (
          definitions.map((definition) => (
            <div key={definition._id || definition.activityType} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{definition.activityType}</h3>
                  <p className="text-sm text-gray-600">{definition.description || 'No description'}</p>
                </div>
                <div className="flex items-center gap-2">
                  {isBuiltin(definition) ? (
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">Default</span>
                  ) : (
                    <button
                      onClick={() => deleteDefinition(definition._id)}
                      className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 hover:bg-red-200"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                {definition.fields.map((field) => (
                  <div key={field.key} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                    <div>
                      <span className="font-medium text-gray-900">{field.label}</span>
                      <span className="ml-2 text-gray-500">({field.key})</span>
                    </div>
                    <span className="text-gray-500">{field.type}{field.required ? ' · required' : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityDefinitions;