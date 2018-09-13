export default [
  {
    questionKey: 'gender',
    questionLabel: 'Gender',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'unknown', label: 'Other/ Unsure' },
    ],
  },
  {
    questionKey: 'age',
    questionLabel: 'Age',
    options: [
      { value: 'child', label: '0-14' },
      { value: 'young', label: '15-24' },
      { value: 'adult', label: '25-64' },
      { value: 'elderly', label: '65+' },
    ],
  },
  {
    questionKey: 'posture',
    questionLabel: 'Posture',
    options: [
      { value: 'standing', label: 'Standing' },
      { value: 'sittingInformal', label: 'Sitting (informal)' },
      { value: 'sittingFormal', label: 'Sitting (formal)' },
      { value: 'lying', label: 'Lying' },
      { value: 'multiple', label: 'Multiple' },
    ],
  },
  {
    questionKey: 'activity',
    questionLabel: 'Activity',
    options: [
      { value: 'commercial', label: 'Commercial' },
      { value: 'consuming', label: 'Consuming' },
      { value: 'conversing', label: 'Conversing' },
      { value: 'cultural', label: 'Cultural' },
      { value: 'electronicEngagement', label: 'Electronic Engagement' },
      { value: 'recreationActive', label: 'Recreation (active)' },
      { value: 'recreationPassive', label: 'Recreation (passive)' },
      { value: 'workingCivic', label: 'Working (civic)' },
    ],
  },
];
