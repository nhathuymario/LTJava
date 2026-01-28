import { useEffect, useMemo, useState } from "react";
import { getCloPloMatrix, type CloPloMatrixRes } from "../../services/outcomes";

type Props = {
    syllabusId: number;
    scopeKey?: string;
};

export default function CloPloMatrixView({ syllabusId, scopeKey }: Props) {
    const sk = (scopeKey ?? "").trim();
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [matrix, setMatrix] = useState<CloPloMatrixRes | null>(null);

    const cellMap = useMemo(() => {
        const m = new Map<string, number | null>();
        if (!matrix) return m;
        for (const c of matrix.cells ?? []) {
            m.set(`${c.cloId}_${c.ploId}`, c.level ?? null);
        }
        return m;
    }, [matrix]);

    useEffect(() => {
        if (!sk) {
            setMatrix(null);
            return;
        }

        let cancelled = false;

        (async () => {
            setLoading(true);
            setErr(null);
            try {
                const res = await getCloPloMatrix(syllabusId, sk);
                if (!cancelled) setMatrix(res);
            } catch (e: any) {
                if (!cancelled) setErr(e?.response?.data?.message || e?.message || "Không tải được bảng CLO–PLO");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [syllabusId, sk]);

    return (
        <div className="lec-card" style={{ marginTop: 12 }}>
            <h3 className="lec-section-title">4.1. Liên hệ giữa CLOs và PLOs</h3>

            {!sk && (
                <div className="lec-empty">
                    Chưa có <b>scopeKey</b> trong content. Vào tab Outcomes để nhập scopeKey.
                </div>
            )}

            {sk && loading && <div className="lec-empty">Đang tải bảng CLO–PLO…</div>}
            {sk && err && <div className="lec-empty">❌ {err}</div>}

            {sk && !loading && !err && matrix && (
                <div style={{ overflowX: "auto" }}>
                    <table className="lec-table" style={{ minWidth: 720 }}>
                        <thead>
                        <tr>
                            <th style={{ whiteSpace: "nowrap" }}>PLO / CLO</th>
                            {matrix.plos.map((plo) => (
                                <th key={plo.id} style={{ whiteSpace: "nowrap" }}>{plo.code}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {matrix.clos.map((clo) => (
                            <tr key={clo.id}>
                                <td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{clo.code}</td>
                                {matrix.plos.map((plo) => {
                                    const lv = cellMap.get(`${clo.id}_${plo.id}`) ?? null;
                                    const text = lv === 1 ? "I" : lv === 2 ? "R" : lv === 3 ? "M" : "";
                                    return (
                                        <td key={plo.id} style={{ textAlign: "center", fontWeight: 600 }}>
                                            {text}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <div style={{ fontSize: 12, opacity: 0.75, marginTop: 8 }}>
                        I: Introduced · R: Reinforced · M: Mastered
                    </div>
                </div>
            )}
        </div>
    );
}
