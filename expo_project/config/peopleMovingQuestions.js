export default [
  {
    questionKey: 'mode',
    questionLabel: 'Mode',
    questionType: 'select',
    options: [
      { value: 'Bicycle', label: 'Bicycle' },
      { value: 'Pedestrian', label: 'Pedestrian' },
      { value: 'Other', label: 'Other' },
    ],
  },
  {
    questionKey: 'gender',
    questionLabel: 'Gender',
    questionType: 'select',
    options: [
      { value: 'Male', label: 'Male' },
      { value: 'Female', label: 'Female' },
      { value: 'Unknown', label: 'Other/ Unsure' },
    ],
  },
  {
    questionKey: 'age',
    questionLabel: 'Age',
    questionType: 'select',
    options: [
      { value: '0-14', label: '0-14' },
      { value: '15-24', label: '15-24' },
      { value: '25-64', label: '25-64' },
      { value: '65+', label: '65+' },
    ],
  },
];
