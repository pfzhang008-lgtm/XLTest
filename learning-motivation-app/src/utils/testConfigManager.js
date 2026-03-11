import clinicalNorms from '@/data/clinical_norms.json';

/**
 * Get test configuration based on user age and test type.
 * @param {number|string} age - User's age.
 * @param {string} testType - Type of test ('pvt', 'stroop', 'sart', 'nback', 'schulte').
 * @returns {Object} Configuration object for the specified test.
 */
export function getNormsByAge(age, testType) {
  let ageGroupKey = 'age_16_plus'; // Default fallback

  // Check if age is already a valid key
  if (typeof age === 'string' && age.startsWith('age_')) {
    ageGroupKey = age;
  } else {
    // Legacy numeric handling
    const numericAge = parseInt(age, 10);
    if (!isNaN(numericAge)) {
      if (numericAge <= 9) {
        ageGroupKey = 'age_6_9';
      } else if (numericAge >= 10 && numericAge <= 12) {
        ageGroupKey = 'age_10_12';
      } else if (numericAge >= 13 && numericAge <= 15) {
        ageGroupKey = 'age_13_15';
      } else {
        ageGroupKey = 'age_16_plus';
      }
    }
  }

  const ageGroupData = clinicalNorms.norms[ageGroupKey];
  
  if (!ageGroupData) {
    console.warn(`No norms found for age group key: ${ageGroupKey}, falling back to age_16_plus`);
    return clinicalNorms.norms['age_16_plus'][`${testType}_config`];
  }

  // Handle legacy 'stroop' mapping to 'standard_stroop'
  let targetConfigKey = `${testType}_config`;
  if (testType === 'stroop') {
    targetConfigKey = 'standard_stroop_config';
  }

  const config = ageGroupData[targetConfigKey];

  if (!config) {
    console.error(`Configuration not found for test type: ${testType} (key: ${targetConfigKey}) in age group: ${ageGroupKey}`);
    return {};
  }

  return config;
}
