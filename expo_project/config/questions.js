export default [
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
  {
    questionKey: 'mode',
    questionLabel: 'Mode',
    questionType: 'select',
    options: [
      { value: 'pedestrian', label: 'Pedestrian' },
      { value: 'bicycle', label: 'Bicycle' },
    ]
  },
  {
    questionKey: 'posture',
    questionLabel: 'Posture',
    questionType: 'select',
    options: [
      { value: 'standing', label: 'Standing' },
      { value: 'sitting_informal', label: 'Sitting (informal)' },
      { value: 'sitting_formal', label: 'Sitting (formal)' },
      { value: 'lying', label: 'Lying' },
      { value: 'multiple', label: 'Multiple' },
    ],
  },
  {
    questionKey: 'activities',
    questionLabel: 'Activity',
    questionType: 'multiselect',
    options: [
      { value: 'commercial', label: 'Commercial' },
      { value: 'consuming', label: 'Consuming' },
      { value: 'conversing', label: 'Conversing' },
      { value: 'cultural', label: 'Cultural' },
      { value: 'electronic_engagement', label: 'Electronic Engagement' },
      { value: 'recreation_active', label: 'Recreation (active)' },
      { value: 'recreation_passive', label: 'Recreation (passive)' },
      { value: 'working_civic', label: 'Working (civic)' },
    ],
  },
  {
    questionKey: 'groups',
    questionLabel: 'Groups',
    questionType: 'select',
    options: [
      {value: 'group_1', label: '1 Person'},
      {value: 'group_2', label: '2 People'},
      {value: 'group_3-7', label: '3-7 People'},
      {value: 'group_8+', label: '8+'},
    ]
  },
  {
    questionKey: 'object',
    questionLabel: 'Object',
    questionType: 'multiselect',
    options: [
      { value: 'animal', label: 'Animal'},
      { value: 'bag_carried', label: 'Carrying Bag'},
      { value: 'clothing_cultural', label: 'Clothing (cultural)' },
      { value: 'clothing_activity', label: 'Clothing (activity)'},
      { value: 'goods_carried', label: 'Carried Goods'},
      { value: 'equipment_construction', label: 'Equipment (construction)'},
      { value: 'equipment_receational', label: 'Equipment (recreational)'},
      { value: 'equipment_sport', label: 'Equipment (sport)'},
      { value: 'protection_safety', label: 'Protection (safety)'},
      { value: 'protection_weather', label: 'Protection (weather)'},
      { value: 'furniture_carried', label: 'Carrying Furniture'},
      { value: 'transportation_carried', label: 'Carrying Transportation'},
      { value: 'transportation_stationary', label: 'Stationary Transportation'},
      { value: 'pushcart', label: 'Pushcart'},
      { value: 'stroller', label: 'Stroller'},
      { value: 'luggage', label: 'Luggage'}
    ]
  }
];
