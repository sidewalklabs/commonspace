export const peopleMovingDemoStudy = {
  title: 'People Moving Demo',
  type: 'movement',
  map: {},
  authorName: 'CommonSpace',
  description: 'Surveys in demo mode will not save.',
  fields: ['mode', 'gender', 'age', 'posture', 'activities'],
  surveys: [
    {
      locationId: '2',
      survey_location: { type: 'polygon', coordinates: [] },
      method: 'analog',
      representation: 'absolute',
      survey_id: 'DEMO',
      survey_title: 'Demo',
      type: 'peopleMovingCount',
      userId: '123412341234',
      zone: 'Zone 12',
      start_date: '2020-01-12T04:59:58.683Z',
      end_date: '2021-01-12T04:59:58.683Z',
    },
  ],
};
export const stationaryActivityDemoStudy = {
  title: 'Stationary Activity Mapping Demo',
  type: 'stationary',
  map: {},
  authorName: 'CommonSpace',
  description: 'Surveys in demo mode will not save.',
  fields: ['gender', 'age', 'posture', 'activities', 'location'],
  surveys: [
    {
      locationId: '0',
      survey_location: {
        coordinates: [
          [
            [-117.672339677811, 33.5472427639013],
            [-117.666631937027, 33.5459104345793],
            [-117.668541669846, 33.5450520101751],
            [-117.672339677811, 33.5472427639013],
          ],
        ],
        type: 'Polygon',
      },
      method: 'analog',
      representation: 'absolute',
      survey_id: 'DEMO',
      survey_title: 'Demo',
      type: 'peopleMovingCount',
      userId: '123412341234',
      zone: 'Zone 12',
      start_date: '2020-01-12T04:59:58.683Z',
      end_date: '2021-01-12T04:59:58.683Z',
    },
  ],
};
