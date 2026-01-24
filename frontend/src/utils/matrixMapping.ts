import { matrixApi } from "../services/matrix";
import type { CLO } from "../services/outcome";

export type MatrixMapping = Record<number, Record<number, string>>;
// mapping[cloId][piId] = "I" | "R" | "M" | "A"

export async function buildMapping(clos: CLO[]): Promise<MatrixMapping> {
    const mapping: MatrixMapping = {};

    for (const clo of clos) {
        const rows = await matrixApi.getByClo(clo.id);
        mapping[clo.id] = {};

        rows.forEach((m: any) => {
            mapping[clo.id][m.pi.id] = m.level;
        });
    }

    return mapping;
}
