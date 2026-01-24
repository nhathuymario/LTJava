//PLO

export interface PLO {
    id: number;
    code: string;
    description: string;
    program?: string | null;
}

//CLO
export interface CLO {
    id: number;
    code: string;
    description: string;
    syllabus: {
        id: number;
        code: string;
        name?: string;
    };
}

//CLOPLO
export interface CLOPLO { id: number; clo: CLO; plo: PLO; }

export type MappingStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface CLOPLO {
    id: number;
    CLO: { id: number; code: string; description?: string };
    PLO: { id: number; code: string; description?: string };
    status?: MappingStatus;
    note?: string | null;
}


