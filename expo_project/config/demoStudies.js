import urls from './urls';

export const peopleMovingDemoStudy = {
  title: 'People Moving Count',
  type: 'movement',
  map: {},
  author: 'CommonSpace',
  authorUrl: urls.homepage,
  description:
    'This is a sample study to show the functionality of the people moving count study type in CommonSpace. Demo studies will not save.',
  fields: ['mode', 'gender', 'age', 'posture', 'activities'],
  isDemo: true,
  surveys: [
    {
      locationId: '2',
      surveyLocation: { type: 'polygon', coordinates: [] },
      method: 'analog',
      representation: 'absolute',
      surveyId: 'DEMO',
      surveyTitle: 'Demo',
      type: 'peopleMovingCount',
      userId: '123412341234',
      zone: 'Zone 12',
      startDate: '2020-01-12T04:59:58.683Z',
      endDate: '2021-01-12T04:59:58.683Z',
    },
  ],
};
export const stationaryActivityDemoStudy = {
  title: 'Stationary Activity Map',
  type: 'stationary',
  map: {},
  author: 'CommonSpace',
  authorUrl: urls.homepage,
  description:
    'This is a sample study to show the functionality of the stationary activity mapping study type in CommonSpace. Demo studies will not save.',
  fields: ['gender', 'age', 'posture', 'activities', 'location'],
  isDemo: true,
  surveys: [
    {
      locationId: '0',
      surveyLocation: {
        coordinates: [
          [
            [-73.988167, 40.743407],
            [-73.986651, 40.742775],
            [-73.988006, 40.74094],
            [-73.989079, 40.741397],
            [-73.988926, 40.741919],
            [-73.988923, 40.742206],
            [-73.988902, 40.742383],
            [-73.988167, 40.743407],
          ],
        ],
        type: 'Polygon',
      },
      method: 'analog',
      representation: 'absolute',
      surveyId: 'DEMO',
      surveyTitle: 'Demo',
      type: 'peopleMovingCount',
      userId: '123412341234',
      zone: 'Zone 12',
      startDate: '2020-01-12T04:59:58.683Z',
      endDate: '2021-01-12T04:59:58.683Z',
    },
  ],
};
