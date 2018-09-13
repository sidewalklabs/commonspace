export default [
  {
    questionKey: 'gender',
    questionLabel: 'Gender',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'unknown', label: 'Unknown' },
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
    questionKey: 'mode',
    questionLabel: 'Mode',
    options: [
      { value: 'pedestrian', label: 'Pedestrian' },
      { value: 'bicyclist', label: 'Bicyclist' },
    ],
  },
  {
    questionKey: 'groupSize',
    questionLabel: 'Group Size',
    options: [
      { value: 'pair', label: 'pair' },
      { value: 'group', label: 'group' },
      { value: 'crowd', label: 'crowd' },
    ],
  },
  {
    questionKey: 'posture',
    questionLabel: 'Posture',
    options: [
      { value: 'leaning', label: 'Leaning' },
      { value: 'lying', label: 'Lying' },
      { value: 'sitting', label: 'Sitting' },
      { value: 'groundSitting', label: 'Sitting on the Ground' },
      { value: 'standing', label: 'Standing' },
    ],
  },
  {
    questionKey: 'activity',
    questionLabel: 'Activity',
    options: [
      { value: 'commercial', label: 'Commercial' },
      { value: 'consuming', label: 'Consuming' },
      { value: 'conversing', label: 'Conversing' },
      { value: 'electronics', label: 'Electronics' },
      { value: 'pets', label: 'Pets' },
      { value: 'idle', label: 'Idle' },
      { value: 'running', label: 'Running' },
    ],
  },
  {
    questionKey: 'object',
    questionLabel: 'Object',
    options: [
      { value: 'luggage', label: 'luggage' },
      { value: 'pushcart', label: 'Push Cart' },
      { value: 'stroller', label: 'Stroller' },
    ],
  },
];
