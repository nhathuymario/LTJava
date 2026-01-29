import type { CourseOutcomes } from "./types";

export function createEmptyCourseOutcomes(): CourseOutcomes {
    return {
        generalInfo: {
            nameVi: "",
            nameEn: "",
            codeId: "",
            credits: "",
            theory: "",
            practice: "",
            project: "",
            total: "",
            selfStudy: "",
            prerequisiteId: "",
            corequisiteId: "",
            // parallerId: "",
            courseType: "",
            component: "",
            scopeKey: "",
        },
        description: "",
        courseObjectives: [],
        courseLearningOutcomes: [],
        assessmentMethods: [],
        studentDuties: "",
        teachingPlan: [],
        cloMappings: [],
    };
}
