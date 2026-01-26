export interface CourseOutcomes {
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
    parallerId: string;
    courseType: string;
    component: string;
    scopeKey?: string;
  };
  description: string;
  courseObjectives: string[];
  courseLearningOutcomes: { code: string; description: string }[];
  cloMappings: { clo: string; plo: string; level: number | null }[];
  studentDuties: string;
  assessmentMethods: { component: string; method: string; clos: string; criteria: string; weight: string }[];
  teachingPlan: { week: string; chapter: string; content: string; clos: string; teaching: string; assessment: string }[];
}
