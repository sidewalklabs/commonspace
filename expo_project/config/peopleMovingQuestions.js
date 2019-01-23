export default [
  {
    questionKey: 'mode',
    questionLabel: 'Mode',
    questionType: 'select',
    options: [
      { value: 'bicyclist', label: 'Bicycle' },
      { value: 'pedestrian', label: 'Pedestrian' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    questionKey: 'gender',
    questionLabel: 'Gender',
    questionType: 'select',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'unknown', label: 'Other/ Unsure' },
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
