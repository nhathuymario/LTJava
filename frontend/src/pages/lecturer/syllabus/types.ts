export type AssessmentMethod = {
    component: string;
    method: string;
    clos: string;
    criteria: string;
    // weight: string;  // ❌ bỏ
};

export type CourseOutcomes = {
    generalInfo: {
        nameVi: string;
        nameEn: string;
        codeId: string;
        credits: string;
        theory: string;
        practice: string;
        project: string;
        total: string;
        selfStudy: string;
        prerequisiteId: string;
        corequisiteId: string;
        courseType: string;
        component: string;
        scopeKey?: string;
    };
    description: string;
    courseObjectives: string[];
    courseLearningOutcomes: Array<{ code: string; description: string }>;
    assessmentMethods: AssessmentMethod[];
    studentDuties: string;
    teachingPlan: Array<{
        week: string;
        chapter: string;
        content: string;
        clos: string;
        teaching: string;
        assessment: string;
    }>;
    cloMappings: Array<{ clo: string; plo: string; level: number | null }>;
};
