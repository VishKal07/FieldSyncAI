const getFieldValue = (activity, key) => {
  if (!activity) return undefined;

  if (activity.fieldValues) {
    if (typeof activity.fieldValues.get === 'function') {
      const mapValue = activity.fieldValues.get(key);
      if (mapValue !== undefined) return mapValue;
    } else if (activity.fieldValues[key] !== undefined) {
      return activity.fieldValues[key];
    }
  }

  if (activity[key] !== undefined) {
    return activity[key];
  }

  return undefined;
};

const buildLegacyActivityFields = (payload = {}) => ({
  beneficiaryCount: payload.beneficiaryCount,
  issueNoted: payload.issueNoted,
  engagement: payload.engagement,
  notes: payload.notes
});

module.exports = {
  getFieldValue,
  buildLegacyActivityFields
};