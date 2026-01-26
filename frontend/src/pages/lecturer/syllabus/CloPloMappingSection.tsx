import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { CourseOutcomes } from "./types";
import { getCloPloMatrix, type PloDto, type CloDto } from "../../../services/outcomes";
import { useParams } from "react-router-dom";

interface CloPloMappingSectionProps {
  setCourseOutcomes: Dispatch<SetStateAction<CourseOutcomes>>;
  canEdit: boolean;
  availableClos: { code: string; description: string }[];
  initialScopeKey?: string;
}

interface PloData {
  plos: PloDto[];
  clos: CloDto[];
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontWeight: 600,
  marginBottom: 6,
  fontSize: 13,
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  marginBottom: 12,
  fontSize: 12,
  border: "1px solid #ddd",
};

const cellStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  padding: 6,
  textAlign: "center" as const,
};

const headerCellStyle: React.CSSProperties = {
  ...cellStyle,
  backgroundColor: "#f0f0f0",
  fontWeight: 600,
};

export default function CloPloMappingSection({
  setCourseOutcomes,
  canEdit,
  availableClos,
  initialScopeKey,
}: CloPloMappingSectionProps) {
  const { syllabusId } = useParams<{ syllabusId: string }>();
  const id = Number(syllabusId);
  const localScopeStorageKey = Number.isFinite(id) ? `scopeKey:${id}` : `scopeKey`;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ploData, setPloData] = useState<PloData>({
    plos: [],
    clos: [],
  });
  const [scopeKey, setScopeKey] = useState<string>(initialScopeKey || "");
  const [matrixCells, setMatrixCells] = useState<Map<string, number | null>>(new Map());

  // Sync internal scopeKey state when initialScopeKey prop changes (after async load)
  useEffect(() => {
    if (initialScopeKey && initialScopeKey !== scopeKey) {
      setScopeKey(initialScopeKey);
      // also reflect into parent state so it persists on save
      setCourseOutcomes(prev => ({
        ...prev,
        generalInfo: {
          ...prev.generalInfo,
          scopeKey: initialScopeKey,
        },
      }));

      try {
        if (initialScopeKey) {
          localStorage.setItem(localScopeStorageKey, initialScopeKey);
        }
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialScopeKey]);

  // Fallback: if no initialScopeKey yet, try localStorage to auto-fill
  useEffect(() => {
    if (!scopeKey) {
      try {
        const cached = localStorage.getItem(localScopeStorageKey);
        if (cached && cached !== scopeKey) {
          setScopeKey(cached);
          setCourseOutcomes(prev => ({
            ...prev,
            generalInfo: {
              ...prev.generalInfo,
              scopeKey: cached,
            },
          }));
        }
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localScopeStorageKey]);

  // Load PLOs từ backend
  useEffect(() => {
    if (!id || !scopeKey) return;

    const loadPlos = async () => {
      try {
        setLoading(true);
        setError(null);
        const matrix = await getCloPloMatrix(id, scopeKey);
        setPloData({
          plos: matrix.plos,
          clos: matrix.clos,
        });

        // Build cells map for quick access
        const cellsMap = new Map<string, number | null>();
        const cloIdToCode = new Map<number, string>();
        matrix.clos.forEach(c => cloIdToCode.set(c.id, c.code));
        matrix.cells.forEach((cell) => {
          const code = cloIdToCode.get(cell.cloId);
          if (!code) return;
          const key = `${code}_${cell.ploId}`;
          cellsMap.set(key, cell.level ?? null);
        });
        setMatrixCells(cellsMap);
      } catch (err) {
        console.error("Failed to load PLOs:", err);
        setError("Không thể tải danh sách PLOs. Vui lòng kiểm tra Scope Key.");
        setPloData({ plos: [], clos: [] });
      } finally {
        setLoading(false);
      }
    };

    loadPlos();
  }, [id, scopeKey]);

  const handleCellChange = (cloCode: string, ploId: number, level: number | null) => {
    const key = `${cloCode}_${ploId}`;
    const newCells = new Map(matrixCells);

    if (level === null) {
      newCells.delete(key);
    } else {
      newCells.set(key, level);
    }

    setMatrixCells(newCells);

    // Convert cells map to array format and update courseOutcomes
    const mappingsArray = Array.from(newCells.entries()).map(([key, level]) => {
      const [clo, plo] = key.split("_");
      return {
        clo,
        plo,
        level: level ?? null,
      };
    });

    setCourseOutcomes(prev => ({
      ...prev,
      cloMappings: mappingsArray,
    }));
  };



  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ marginTop: 0, marginBottom: 12, color: "#333" }}>
        Liên hệ giữa CĐR học phần (CLOs) và CĐR CTĐT (PLOs)
      </h3>

      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>
          Scope Key (CTĐT): <span style={{ color: "red" }}>*</span>
        </label>
        <input
          type="text"
          style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid #ddd", outline: "none", fontSize: 13 }}
          disabled={!canEdit}
          value={scopeKey}
          onChange={(e) => {
            const val = e.target.value;
            setScopeKey(val);
            try {
              localStorage.setItem(localScopeStorageKey, val);
            } catch {}
            setCourseOutcomes(prev => ({
              ...prev,
              generalInfo: {
                ...prev.generalInfo,
                scopeKey: val,
              }
            }))
          }}
          placeholder="Nhập scope key của CTĐT (VD: KTPM_2025)"
        />
        <small style={{ display: "block", marginTop: 4, opacity: 0.7 }}>
          Nhập scope key của chương trình đào tạo (CTĐT) để lấy danh sách PLOs
        </small>
      </div>

      {loading && ploData.plos.length === 0 ? (
        <div style={{ padding: 12, backgroundColor: "#e3f2fd", border: "1px solid #2196f3", borderRadius: 6 }}>
          ⏳ Đang tải danh sách PLOs...
        </div>
      ) : error ? (
        <div style={{ padding: 12, backgroundColor: "#ffebee", border: "1px solid #f44336", borderRadius: 6, color: "#c62828" }}>
          ❌ {error}
        </div>
      ) : availableClos.length === 0 || ploData.plos.length === 0 ? (
        <div style={{ padding: 12, backgroundColor: "#fff3cd", border: "1px solid #ffc107", borderRadius: 6 }}>
          ⚠️ Không tìm thấy CLOs hoặc PLOs. Vui lòng:
          <ul style={{ margin: "8px 0 0 0" }}>
            <li>Tạo ít nhất một CLO ở mục 4 trước</li>
            <li>Kiểm tra Scope Key có chính xác không</li>
          </ul>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={headerCellStyle}>CLO / PLO</th>
                {ploData.plos.map((plo) => (
                  <th key={plo.id} style={headerCellStyle}>
                    <div>{plo.code}</div>
                    <div style={{ fontSize: 10, marginTop: 2 }}>{plo.description.substring(0, 20)}...</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {availableClos.map((clo) => (
                <tr key={clo.code}>
                  <td style={{ ...cellStyle, fontWeight: 600, backgroundColor: "#f9f9f9" }}>
                    <div>{clo.code}</div>
                    <div style={{ fontSize: 10, marginTop: 2 }}>{clo.description.substring(0, 20)}...</div>
                  </td>
                  {ploData.plos.map((plo) => {
                    const key = `${clo.code}_${plo.id}`;
                    const currentLevel = matrixCells.get(key);

                    return (
                      <td key={`${clo.code}_${plo.id}`} style={cellStyle}>
                        <select
                          disabled={!canEdit}
                          value={currentLevel ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleCellChange(clo.code, plo.id, val ? Number(val) : null);
                          }}
                          style={{
                            width: "100%",
                            padding: "4px",
                            border: "1px solid #ddd",
                            borderRadius: 4,
                            cursor: !canEdit ? "not-allowed" : "pointer",
                          }}
                        >
                          <option value="">—</option>
                          <option value="1">I (Introduced)</option>
                          <option value="2">R (Reinforced)</option>
                          <option value="3">M (Mastered)</option>
                        </select>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>
        <strong>Hướng dẫn:</strong>
        <ul style={{ margin: "6px 0" }}>
          <li><strong>I (Introduced)</strong>: Giới thiệu, sinh viên làm quen với nội dung</li>
          <li><strong>R (Reinforced)</strong>: Củng cố, nâng cao khả năng</li>
          <li><strong>M (Mastered)</strong>: Thành thạo, chuyên sâu, có khả năng áp dụng</li>
        </ul>
      </div>
    </div>
  );
}
