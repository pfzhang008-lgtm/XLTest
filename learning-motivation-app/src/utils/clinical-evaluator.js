import clinicalNorms from '@/data/clinical_norms.json';

// Helper to determine age group key
export const getAgeGroupKey = (age) => {
  if (!age) return 'age_13_15'; // Default
  age = parseInt(age);
  if (age <= 9) return 'age_6_9';
  if (age <= 12) return 'age_10_12';
  if (age <= 15) return 'age_13_15';
  return 'age_16_plus';
};

// Helper to get norms for specific test and age
export const getTestNorms = (testType, age) => {
  const ageKey = getAgeGroupKey(age);
  const norms = clinicalNorms.norms[ageKey];
  if (!norms) return null;

  switch (testType) {
    case 'PVT': return norms.pvt_config;
    case 'SART': return norms.sart_config;
    case 'Stroop': return norms.stroop_config;
    case 'Schulte': return norms.schulte_config;
    case 'NBack': return norms.nback_config;
    case 'EmotionalStroop': return null; // No norms for emotional stroop in this context
    default: return null;
  }
};

/**
 * Calculate percentile based on score and norms.
 * @param {string} testType - 'PVT', 'SART', 'Stroop'
 * @param {number} score - The score to evaluate (ms for PVT, errors for others)
 * @param {number} age - User age
 * @returns {object} { percentile: number, text: string, color: string }
 */
export const evaluateScore = (testType, score, age) => {
  if (testType === 'EmotionalStroop') {
    return {
      percentile: 0,
      text: '已完成',
      color: '#F59E0B' // Neutral/Completed color
    };
  }

  const norms = getTestNorms(testType, age);
  if (!norms) {
    return { percentile: 50, text: '击败了 50% 同龄人', color: '#F59E0B' };
  }

  let excellent, risk, isLowerBetter;

  if (testType === 'PVT') {
    excellent = norms.excellentMs;
    risk = norms.riskMs;
    isLowerBetter = true;
  } else if (testType === 'Schulte') {
    excellent = norms.excellentSec;
    risk = norms.riskSec;
    isLowerBetter = true;
  } else if (testType === 'NBack') {
    excellent = norms.excellentAccuracy;
    risk = norms.riskAccuracy;
    isLowerBetter = false; // Higher accuracy is better
  } else if (testType === 'SART' || testType === 'Stroop') {
    excellent = norms.excellentErrors;
    risk = norms.riskErrors;
    isLowerBetter = true; // Fewer errors is better
  }

  // Calculate Percentile
  // Map Excellent -> 95%, Risk -> 15%
  // Linear interpolation
  let percentile = 50;
  
  if (isLowerBetter) {
    // Score <= Excellent -> >95%
    // Score >= Risk -> <15%
    if (score <= excellent) {
        // 95-99 range
        percentile = 95 + Math.random() * 4; 
    } else if (score >= risk) {
        // 1-15 range
        percentile = Math.max(1, 15 - ((score - risk) / risk * 10));
    } else {
        // Linear between 15 and 95
        const range = risk - excellent;
        const progress = (risk - score) / range; // 0 (at risk) to 1 (at excellent)
        percentile = 15 + (progress * 80);
    }
  } else {
    // Higher is Better (e.g. N-Back Accuracy)
    // Score >= Excellent -> >95%
    // Score <= Risk -> <15%
    if (score >= excellent) {
        percentile = 95 + Math.random() * 4;
    } else if (score <= risk) {
        percentile = Math.max(1, 15 - ((risk - score) / risk * 10));
    } else {
        const range = excellent - risk;
        const progress = (score - risk) / range; // 0 (at risk) to 1 (at excellent)
        percentile = 15 + (progress * 80);
    }
  }

  percentile = Math.round(percentile);

  // Determine Text and Color
  let text = `击败了 ${percentile}% 同龄人`;
  let color = '#F59E0B'; // Default Yellow

  if (percentile >= 80) {
    color = '#00E5FF'; // Cyan (High)
  } else if (percentile <= 20) {
    color = '#FF3B30'; // Red (Low)
  }

  return {
    percentile,
    text,
    color
  };
};
