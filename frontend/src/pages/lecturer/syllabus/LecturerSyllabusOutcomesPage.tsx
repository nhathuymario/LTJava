import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CourseOutcomesForm from "./CourseOutcomesForm";
import type { CourseOutcomes } from "./types";
import { createEmptyCourseOutcomes } from "./defaults";
import { lecturerApi } from "../../../services/lecturer";
import { getToken, hasRole } from "../../../services/auth";

function normalizeCourseOutcomes(raw: any): CourseOutcomes {
    const empty = createEmptyCourseOutcomes();

    const generalInfo = {
        ...empty.generalInfo,
        ...(raw?.generalInfo ?? {}),
    };

    const courseObjectives = Array.isArray(raw?.courseObjectives)
        ? raw.courseObjectives.map((x: any) => (x ?? ""))
        : empty.courseObjectives;

    const courseLearningOutcomes = Array.isArray(raw?.courseLearningOutcomes)
        ? raw.courseLearningOutcomes.map((c: any) => ({
            code: c?.code ?? "",
            description: c?.description ?? "",
        }))
        : empty.courseLearningOutcomes;

    // ⚠️ BE đã bỏ weight/domain thì ở đây không set weight nữa (tránh gửi thừa field)
    const assessmentMethods = Array.isArray(raw?.assessmentMethods)
        ? raw.assessmentMethods.map((m: any) => ({
            component: m?.component ?? "",
            method: m?.method ?? "",
            clos: m?.clos ?? "",
            criteria: m?.criteria ?? "",
        }))
        : (empty.assessmentMethods as any);

    const teachingPlan = Array.isArray(raw?.teachingPlan)
        ? raw.teachingPlan.map((p: any) => ({
            week: p?.week ?? "",
            chapter: p?.chapter ?? "",
            content: p?.content ?? "",
            clos: p?.clos ?? "",
            teaching: p?.teaching ?? "",
            assessment: p?.assessment ?? "",
        }))
        : empty.teachingPlan;

    const cloMappings = Array.isArray(raw?.cloMappings)
        ? raw.cloMappings.map((x: any) => ({
            clo: x?.clo ?? "",
            plo: x?.plo ?? "",
            level: x?.level ?? null,
        }))
        : empty.cloMappings;

    return {
        ...empty,
        generalInfo,
        description: raw?.description ?? empty.description,
        courseObjectives,
        courseLearningOutcomes,
        assessmentMethods,
        studentDuties: raw?.studentDuties ?? empty.studentDuties,
        teachingPlan,
        cloMappings,
    } as CourseOutcomes;
}

function toSavePayload(co: CourseOutcomes) {
    // Payload sạch (không gửi field lạ)
    return {
        generalInfo: co.generalInfo ?? {},
        description: co.description ?? "",
        courseObjectives: Array.isArray(co.courseObjectives) ? co.courseObjectives : [],
        courseLearningOutcomes: Array.isArray(co.courseLearningOutcomes) ? co.courseLearningOutcomes : [],
        assessmentMethods: Array.isArray(co.assessmentMethods)
            ? co.assessmentMethods.map((m: any) => ({
                component: m?.component ?? "",
                method: m?.method ?? "",
                clos: m?.clos ?? "",
                criteria: m?.criteria ?? "",
            }))
            : [],
        studentDuties: co.studentDuties ?? "",
        teachingPlan: Array.isArray(co.teachingPlan) ? co.teachingPlan : [],
        cloMappings: Array.isArray(co.cloMappings) ? co.cloMappings : [],
    };
}

export default function LecturerSyllabusOutcomesPage() {
    const nav = useNavigate();
    const { syllabusId } = useParams<{ syllabusId: string }>();

    const sid = useMemo(() => {
        const n = Number(syllabusId);
        return Number.isFinite(n) ? n : null;
    }, [syllabusId]);

    const [authChecked, setAuthChecked] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const [courseOutcomes, setCourseOutcomes] = useState<CourseOutcomes>(() =>
        createEmptyCourseOutcomes()
    );

    const token = getToken();
    const isLecturer = hasRole("LECTURER") || hasRole("ROLE_LECTURER");
    const canEdit = isLecturer;

    /* ================= AUTH GUARD ================= */
    useEffect(() => {
        if (!token) {
            setAuthChecked(true);
            nav("/login", { replace: true });
            return;
        }
        setAuthChecked(true);
    }, [token, nav]);

    /* ================= LOAD DATA ================= */
    useEffect(() => {
        if (!authChecked) return;
        if (!token) return;

        if (!isLecturer) {
            setLoading(false);
            return;
        }

        if (sid === null) {
            setErr("Invalid syllabusId");
            setLoading(false);
            return;
        }

        let cancelled = false;

        (async () => {
            setLoading(true);
            setErr(null);
            try {
                const data = await lecturerApi.getCourseOutcomes(sid);
                if (cancelled) return;
                setCourseOutcomes(normalizeCourseOutcomes(data));
            } catch (e: any) {
                if (cancelled) return;
                // BE chưa có content → vẫn cho nhập bằng default (đã safe)
                setCourseOutcomes(createEmptyCourseOutcomes());
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [authChecked, token, isLecturer, sid]);

    /* ================= SAVE ================= */
    async function onSave() {
        if (sid === null) return;

        if (!canEdit) {
            setErr("You don't have permission to edit this page.");
            return;
        }

        setSaving(true);
        setErr(null);
        try {
            const payload = toSavePayload(courseOutcomes);
            await lecturerApi.saveCourseOutcomes(sid, payload as any);

            const data = await lecturerApi.getCourseOutcomes(sid);
            setCourseOutcomes(normalizeCourseOutcomes(data));

            alert("Saved successfully!");
        } catch (e: any) {
            setErr(e?.response?.data?.message || e?.message || "Save failed");
        } finally {
            setSaving(false);
        }
    }

    /* ================= UI STATES ================= */
    if (!authChecked) {
        return (
            <div className="lec-page">
                <div className="lec-container">
                    <div className="lec-card">Checking session...</div>
                </div>
            </div>
        );
    }

    if (!token) {
        return (
            <div className="lec-page">
                <div className="lec-container">
                    <div className="lec-card">Redirecting to login...</div>
                </div>
            </div>
        );
    }

    if (!isLecturer) {
        return (
            <div className="lec-page">
                <div className="lec-container">
                    <div className="manage-toolbar">
                        <button className="lec-btn" onClick={() => nav("/", { replace: true })}>
                            ← Go home
                        </button>
                    </div>
                    <div className="lec-card">
                        <h2 style={{ marginTop: 0 }}>403 - Forbidden</h2>
                        <div>Bạn không có quyền (LECTURER) để truy cập trang này.</div>
                    </div>
                </div>
            </div>
        );
    }

    if (sid === null) {
        return (
            <div className="lec-page">
                <div className="lec-container">
                    <div className="lec-card">Invalid syllabusId</div>
                </div>
            </div>
        );
    }

    /* ================= UI ================= */
    return (
        <div className="lec-page">
            <div className="lec-container">
                <div className="manage-toolbar">
                    <button className="lec-btn" onClick={() => nav(`/lecturer/syllabus/${sid}`)}>
                        ← Back
                    </button>

                    <div style={{ flex: 1 }} />

                    <button className="lec-btn" disabled={saving || loading || !canEdit} onClick={onSave}>
                        {saving ? "Saving..." : "Save"}
                    </button>
                </div>

                {err && <div className="lec-alert">{err}</div>}

                {loading ? (
                    <div className="lec-card">Loading...</div>
                ) : (
                    <div className="lec-card">
                        <CourseOutcomesForm
                            courseOutcomes={courseOutcomes}
                            setCourseOutcomes={setCourseOutcomes}
                            canEdit={canEdit}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
