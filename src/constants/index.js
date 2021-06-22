// eslint-disable-next-line import/prefer-default-export
export const ERROR_MESSAGE_SERVER = 'Lỗi hệ thống!';

export const diseaseTypes = {
  other: 0,
  type1: 1,
  type2: 2,
  gestational: 3,
}

export const roles = {
  admin: 0,
  doctor: 1,
  patient: 2
}

export const relationalStatus = {
  pending: 0,
  accepted: 1,
  declined: 2,
  blocked: 3
}

export const dataTypes = {
  all: 'ALL',
  index: 'INDEX',
  meal: 'MEAL',
  steps: 'STEPS',
  heartRate: 'HEART_RATE',
  weight: 'WEIGHT',
  symptoms: 'SYMPTOMS',
}

export const followTypes = {
  doctor: 'DOCTOR',
  patient: 'PATIENT',
  relative: 'RELATIVE',
}

export const indexThreshold = {
  high: 181.8,
  low: 68.4
}

export const reportTypes = {
  lineChart: 'LINE_CHART',
  pieChart: 'PIE_CHART',
  comparisonChart: 'COMPARISON_CHART'
}

export const paperTypes =   {
  DIET: 'Chế độ ăn uống',
  DIABETES: 'Bệnh tiểu đường',
  OTHER: 'Khác'
};

export const notifyTypes = {
  index: 'INDEX',
  follow: 'FOLLOW'
}
