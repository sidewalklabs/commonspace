export type ActivityCountField = 'gender' | 'age' | 'mode' | 'posture' | 'activities' | 'groups' | 'object' | 'location' | 'note' | 'creation_date' | 'last_updated';

export function studyIdToTablename(studyId: string) {
    return 'data_collection.study_'.concat(studyId.replace(/-/g, ''));
}
