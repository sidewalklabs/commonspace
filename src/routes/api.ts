import camelcaseKeys from "camelcase-keys";
import cookieParser from 'cookie-parser';
import express from "express";
import fetch from "node-fetch";
import passport from "passport";
import { NOT_NULL_VIOLATION, UNIQUE_VIOLATION } from "pg-error-constants";
import uuid from "uuid";

import { return500OnError } from './utils';

import {
  addDataPointToSurveyNoStudyId,
  deleteDataPoint,
  retrieveDataPointsForSurvey
} from "../datastore/datapoint";
import { StudyField } from "../datastore/utils";
import {
  checkUserIdIsSurveyor,
  createStudy,
  deleteStudy,
  giveUserStudyAccess,
  returnStudiesForAdmin,
  returnStudiesUserIsAssignedTo,
  surveysForStudy,
    StudyType,
    updateStudy
} from "../datastore/study";
import { createNewSurveyForStudy, updateSurvey } from "../datastore/survey";
import { userIsAdminOfStudy } from "../datastore/user";
import { createLocation } from "../datastore/location";
import DbPool from "../database";
import { Feature, FeatureCollection, Point } from "geojson";
import { snakecasePayload } from "../utils";

const NOMINATIM_BASE_URL =
  "https://nominatim.openstreetmap.org/reverse?format=json";

export interface DataPoint {
  data_point_id: string; // UUID
  gender?: string;
  age?: number;
  mode?: string;
  posture?: string;
  activities?: string[];
  groups?: string;
  object?: string;
  date: string;
  location: Point;
}

export interface Study {
    study_id: string;
    title: string;
    protocol_version: string;
    surveyors: string[];
    type: StudyType;
    map?: FeatureCollection;
    surveys?: Survey[];
    fields: StudyField[];
    location: string;
}

export interface Survey {
  survey_id: string;
  title?: string;
  location?: Feature;
  location_id: string;
  start_date: string;
  end_date: string;
  surveyor_email: string;
  representation: string;
  microclimate?: string;
  temperature_celcius?: string;
  method: string;
  notes?: string;
}

const STUDY_FIELDS: StudyField[] = [
  "gender",
  "age",
  "mode",
  "posture",
  "activities",
  "groups",
  "object",
  "location",
  "note"
];



const router = express.Router();

router.use(cookieParser());

router.use(passport.authenticate("jwt", { session: false }));

router.get(
  "/studies",
  return500OnError(async (req, res) => {
    const { type = "all" } = req.query;
    const { user_id: userId } = req.user;
    let responseBody: Study[];
    if (type === "admin") {
      responseBody = await returnStudiesForAdmin(DbPool, userId);
    } else if (type === "surveyor") {
      responseBody = await returnStudiesUserIsAssignedTo(
        DbPool,
        userId
      ) as Study[];
    } else if (type === 'all') {
      const adminStudies = await returnStudiesForAdmin(DbPool, userId);
      const suveyorStudies = await returnStudiesUserIsAssignedTo(
        DbPool,
        userId
      ) as Study[];
      // @ts-ignore
      responseBody = adminStudies.concat(suveyorStudies);
    } else {
        res.status(400).send();
        return;
    }
    res.send(responseBody);
  })
);

router.post(
  "/studies",
  return500OnError(async (req, res) => {
    const { user_id: userId } = req.user;
    const {
        protocol_version: protocolVersion,
        study_id: studyId,
        title,
        location,
        type,
        surveyors,
        surveys = [],
        map,
        fields
    } = req.body as Study;
    try {
      await createStudy(DbPool, {
          studyId,
          title,
          protocolVersion,
          userId,
          type,
          map,
          location,
          fields
      });
    } catch (error) {
      const { code, detail } = error;
      if (code === UNIQUE_VIOLATION) {
        res.statusMessage = "survey_id not valid";
        res.status(409).send();
      }
      throw error;
    }
    const newUserIds = await Promise.all(
      surveyors.map(async email => {
        const [_, newUserId] = await giveUserStudyAccess(
          DbPool,
          email,
          studyId
        );
        return newUserId;
      })
    );
    if (map) {
      const surveyZoneIds = await Promise.all(
        map.features.map(saveGeoJsonFeatureAsLocation)
      );
    }
    try {
      await Promise.all(
        surveys.map(async survey => {
          return createNewSurveyForStudy(
            DbPool,
            camelcaseKeys({
              studyId,
              ...survey,
              userEmail: survey.surveyor_email
            })
          );
        })
      );
    } catch (error) {
      console.error(error);

      if (error.code === NOT_NULL_VIOLATION) {
        res.status(400).send();
        return;
      }
    }
    res.send(req.body);
  })
);

router.delete(
    "/studies/:studyId",
    return500OnError(async (req, res) => {
        const { user_id: userId } = req.user;
        const { studyId } = req.params;
        if (!userIsAdminOfStudy(DbPool, studyId, userId)) {
            res.status(409).send();
        }
        await deleteStudy(DbPool, studyId);
        res.status(200).send();
    })
);

async function saveGeoJsonFeatureAsLocation(x: Feature | FeatureCollection) {
  if (x.type === "Feature" && x.geometry.type === "Polygon") {
    const { geometry, properties } = x;
    const { location_id: locationId, name: namePrimary } = properties;
    const { coordinates } = geometry;
    const [lngs, lats] = geometry.coordinates[0].reduce(
      ([lngs, lats], [lng, lat]) => {
        return [lngs + lng, lats + lat];
      },
      [0, 0]
    );
    const lngCenterApprox = lngs / geometry.coordinates[0].length;
    const latCenterApprox = lats / geometry.coordinates[0].length;
    const url =
      NOMINATIM_BASE_URL + `&lat=${latCenterApprox}&lon=${lngCenterApprox}`;
    const response = await fetch(url);
    const body = await response.json();
    const {
      county = "",
      city = "",
      country = "",
      county: subdivision = ""
    } = body;
    return createLocation(DbPool, {
      locationId,
      namePrimary,
      city,
      country,
      subdivision,
      geometry
    });
  }
}

async function saveDataPoint(req, res) {
  const { user_id: userId } = req.user;
  const { surveyId, dataPointId } = req.params;
  const userCanAccessSurvey = await checkUserIdIsSurveyor(
    DbPool,
    userId,
    surveyId
  );
  if (!userCanAccessSurvey) {
    res.status(401).send();
    return;
  }
  const dataPointFromBody = req.body as DataPoint;
  if (
    dataPointFromBody.data_point_id &&
    dataPointFromBody.data_point_id !== dataPointId
  ) {
    res.status(400).send();
  }
  const dataPoint = { ...dataPointFromBody, data_point_id: dataPointId };

  await addDataPointToSurveyNoStudyId(DbPool, surveyId, {
    ...dataPoint,
    data_point_id: dataPointId
  });
  res.status(200).send();
}

router.get(
  "/surveys/:surveyId/datapoints",
  return500OnError(async (req, res) => {
    const { user_id: userId } = req.user;
    const { surveyId } = req.params;
    const userCanAccessSurvey = await checkUserIdIsSurveyor(
      DbPool,
      userId,
      surveyId
    );
    if (!userCanAccessSurvey) {
      res.statusMessage("not allowed to access survey");
      res.status(401).send();
      return;
    }
    const databaseDataPoints = await retrieveDataPointsForSurvey(
      DbPool,
      surveyId
    );
    res.send(databaseDataPoints);
  })
);

router.post(
  "/surveys/:surveyId/datapoints/:dataPointId",
  return500OnError((req, res) => {
    const datapoint = req.body as DataPoint;
    req.body.creation_date = datapoint.date;
    req.body.last_updated = datapoint.date;
    return saveDataPoint(req, res);
  })
);

router.put(
  "/surveys/:surveyId/datapoints/:dataPointId",
  return500OnError((req, res) => {
    const datapoint = req.body as DataPoint;
    req.body.last_updated = datapoint.date;
    return saveDataPoint(req, res);
  })
);

router.delete(
  "/surveys/:surveyId/datapoints/:dataPointId",
  return500OnError(async (req, res) => {
    const { surveyId, dataPointId } = req.params;
    await deleteDataPoint(DbPool, surveyId, dataPointId);
    res.status(200).send();
  })
);

router.get(
  "/studies/:studyId/surveys",
  return500OnError(async (req, res) => {
    // TODO only return studies where the user is verfied
    const { user_id: userId } = req.user;
    const { studyId } = req.params;
    const pgRes = await surveysForStudy(DbPool, studyId);
    const surveys: Survey[] = pgRes.rows.map(
      ({
        survey_id,
        title,
        time_start,
        time_stop,
        location_id,
        email,
        representation,
        microclimate,
        temperature_celsius,
        method,
        notes
      }) => {
        return {
          survey_id,
          title,
          location_id,
          start_date: time_start,
          end_date: time_stop,
          surveyor_email: email,
          representation,
          microclimate,
          temperature_celsius,
          method,
          notes
        };
      }
    );
    res.send(surveys);
  })
);

router.put(
  "/studies/:studyId",
  return500OnError(async (req, res) => {
      const { user_id: userId } = req.user;
      const study  = camelcaseKeys(req.body as Study);
      const  { surveys, studyId } = study;
      await updateStudy(DbPool, {userId, ...study});
      const pgQueries = await Promise.all(
          surveys.map(s =>
                  updateSurvey(
                      DbPool,
                      camelcaseKeys({ studyId, ...s, userEmail: s.surveyor_email })
                  )
                     )
      );
      res.sendStatus(200);
  })
);

router.post(
  "/studies/:studyId/surveyors",
  return500OnError(async (req, res) => {
    const { studyId } = req.params;
    const { email } = req.body;
    const [_, newUserId] = await giveUserStudyAccess(DbPool, email, studyId);
    res.send({ email, studyId, newUserId });
  })
);

export default router;
