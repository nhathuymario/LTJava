import { api } from "./api";

export interface MapCloPiRequest {
    cloId: number;
    piId: number;
    level: string; // I | R | M | A
}

export const matrixApi = {
    mapCloPi: (payload: MapCloPiRequest) =>
        api.post("/aa/matrix", payload).then((r) => r.data),

    getByClo: (cloId: number) =>
        api.get(`/aa/matrix/clo/${cloId}`).then((r) => r.data),
};
