import { useEffect, useMemo, useState } from "react"
import {
    getAllUsers,
    createUser,
    lockUser,
    unlockUser,
    changeUserRole,
    deleteUser,
    importUsersExcel,
    type User,
    type RoleName,
} from "../../services/admin"
import { hasRole } from "../../services/auth"
import "../../assets/css/pages/admin.css"

const ROLE_OPTIONS = ["SYSTEM_ADMIN", "LECTURER", "AA", "STUDENT", "PRINCIPAL", "HOD"] as const
type RoleOption = (typeof ROLE_OPTIONS)[number]

function toDDMMYYYY(value: string) {
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (!m) return value
    const [, y, mm, d] = m
    return `${d}/${mm}/${y}`
}

// ✅ Chuẩn hoá trạng thái: ưu tiên active (BE của bạn đang dùng active)
function isUserLocked(u: any): boolean {
    // BE: active=true/false
    if (typeof u?.active === "boolean") return !u.active

    // fallback nếu BE trả enabled/locked theo kiểu khác
    if (typeof u?.locked === "boolean") return u.locked
    if (typeof u?.enabled === "boolean") return !u.enabled

    return false
}

function getCurrentRoleName(u: any): string {
    const r = u?.roles?.[0]
    if (!r) return ""
    return typeof r === "string" ? r : (r?.name ?? "")
}

export default function AdminPage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [busyId, setBusyId] = useState<number | null>(null)
    const [error, setError] = useState<string | null>(null)

    // create user
    const [fullName, setFullName] = useState("")
    const [cccd, setCccd] = useState("")
    const [dob, setDob] = useState("")
    const [newRole, setNewRole] = useState<RoleOption>("STUDENT")

    // import excel
    const [excelFile, setExcelFile] = useState<File | null>(null)
    const [importResult, setImportResult] = useState<any>(null)

    const isSystemAdmin = useMemo(() => hasRole("SYSTEM_ADMIN"), [])

    const fetchUsers = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await getAllUsers()
            setUsers(data)
        } catch (err: any) {
            const status = err?.response?.status
            const resp = err?.response?.data
            console.error("GET /admin/users failed:", status, resp)
            const msg = resp?.message || resp || err?.message || "Không tải được danh sách người dùng"
            setError(typeof msg === "string" ? msg : "Không tải được danh sách người dùng")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!isSystemAdmin) {
            setError("Bạn không có quyền quản trị (SYSTEM_ADMIN)")
            setLoading(false)
            return
        }
        fetchUsers()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const onCreateUser = async () => {
        if (!isSystemAdmin) {
            alert("Chỉ SYSTEM_ADMIN")
            return
        }

        const body = {
            fullName: fullName.trim(),
            cccd: cccd.trim(),
            dateOfBirth: toDDMMYYYY(dob),
            roleName: newRole,
        }

        try {
            await createUser(body as any)
            setFullName("")
            setCccd("")
            setDob("")
            setNewRole("STUDENT")
            await fetchUsers()
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.response?.data || err?.message
            alert(msg || "Tạo tài khoản thất bại")
        }
    }

    const onImportExcel = async () => {
        if (!isSystemAdmin) {
            alert("Chỉ SYSTEM_ADMIN")
            return
        }
        if (!excelFile) {
            alert("Chọn file .xlsx trước")
            return
        }

        try {
            const res = await importUsersExcel(excelFile)
            setImportResult(res)
            setExcelFile(null)
            await fetchUsers()
            alert(`Import xong: thành công ${res.successCount}, lỗi ${res.failedCount}`)
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.response?.data || err?.message
            alert(msg || "Import Excel thất bại")
        }
    }

    const onLock = async (u: User) => {
        try {
            setBusyId(u.id)
            await lockUser(u.id)

            // ✅ optimistic update: set active=false
            setUsers((prev: any) =>
                prev.map((x: any) => (x.id === u.id ? { ...x, active: false, enabled: false, locked: true } : x))
            )

            await fetchUsers()
        } catch (err: any) {
            alert(err?.response?.data?.message || err?.response?.data || "Khoá thất bại")
        } finally {
            setBusyId(null)
        }
    }

    const onUnlock = async (u: User) => {
        try {
            setBusyId(u.id)
            await unlockUser(u.id)

            // ✅ optimistic update: set active=true
            setUsers((prev: any) =>
                prev.map((x: any) => (x.id === u.id ? { ...x, active: true, enabled: true, locked: false } : x))
            )

            await fetchUsers()
        } catch (err: any) {
            alert(err?.response?.data?.message || err?.response?.data || "Mở khoá thất bại")
        } finally {
            setBusyId(null)
        }
    }

    const onChangeRole = async (u: User, roleName: string) => {
        try {
            setBusyId(u.id)
            await changeUserRole(u.id, roleName as RoleName)

            // optimistic: set role UI luôn (nếu roles là array object)
            setUsers((prev: any) =>
                prev.map((x: any) =>
                    x.id === u.id ? { ...x, roles: [{ name: roleName }] } : x
                )
            )

            await fetchUsers()
        } catch (err: any) {
            alert(err?.response?.data?.message || err?.response?.data || "Đổi role thất bại")
        } finally {
            setBusyId(null)
        }
    }

    const onDelete = async (u: User) => {
        if (!confirm(`Xoá user ${u.username || u.fullName || ""}?`)) return
        try {
            setBusyId(u.id)
            await deleteUser(u.id)
            await fetchUsers()
        } catch (err: any) {
            alert(err?.response?.data?.message || err?.response?.data || "Xoá user thất bại")
        } finally {
            setBusyId(null)
        }
    }

    return (
        <div className="admin-wrapper">
            <div className="admin-card">
                <h1 className="admin-title">Quản trị người dùng</h1>

                {error && <div className="admin-alert">{error}</div>}
                {loading && <p>Đang tải...</p>}

                {/* Tạo đơn */}
                <div className="admin-section">
                    <h3>Tạo tài khoản đơn</h3>
                    <div className="admin-row">
                        <input
                            className="admin-input"
                            placeholder="Họ và tên"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
                        <input
                            className="admin-input"
                            placeholder="CCCD"
                            value={cccd}
                            onChange={(e) => setCccd(e.target.value)}
                        />
                        <input className="admin-input" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
                        <select className="admin-select" value={newRole} onChange={(e) => setNewRole(e.target.value as RoleOption)}>
                            {ROLE_OPTIONS.map((r) => (
                                <option key={r} value={r}>
                                    {r}
                                </option>
                            ))}
                        </select>
                        <button className="admin-btn" onClick={onCreateUser}>
                            Tạo
                        </button>
                    </div>
                    <p style={{ color: "#6b7280", marginTop: 4 }}>Ngày sinh sẽ gửi dạng dd/MM/yyyy.</p>
                </div>

                {/* Import Excel */}
                <div className="admin-section">
                    <h3>Import tài khoản từ Excel (.xlsx)</h3>
                    <p style={{ color: "#6b7280" }}>File mẫu: fullName | cccd | dateOfBirth | roleName</p>

                    <div className="admin-row">
                        <input
                            className="admin-input"
                            type="file"
                            accept=".xlsx"
                            onChange={(e) => setExcelFile(e.target.files?.[0] ?? null)}
                        />
                        <button className="admin-btn" onClick={onImportExcel}>
                            Import Excel
                        </button>
                    </div>

                    {importResult && (
                        <div style={{ marginTop: 10 }}>
                            <div style={{ color: "#6b7280" }}>
                                Tổng dòng: {importResult.totalRows ?? "-"} | Thành công: {importResult.successCount ?? 0} | Lỗi:{" "}
                                {importResult.failedCount ?? 0}
                            </div>

                            {Array.isArray(importResult.errors) && importResult.errors.length > 0 && (
                                <div style={{ marginTop: 8 }}>
                                    <b>Danh sách lỗi:</b>
                                    <ul style={{ marginTop: 6 }}>
                                        {importResult.errors.slice(0, 20).map((e: any, idx: number) => (
                                            <li key={idx}>
                                                Dòng {e.excelRowNumber}: {e.message}
                                            </li>
                                        ))}
                                    </ul>
                                    {importResult.errors.length > 20 && <div style={{ color: "#6b7280" }}>Chỉ hiển thị 20 lỗi đầu.</div>}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Bảng */}
                {!loading && !error && (
                    <div className="admin-section">
                        <table className="admin-table">
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Username</th>
                                <th>Họ tên</th>
                                <th>CCCD</th>
                                <th>Ngày sinh</th>
                                <th>Roles</th>
                                <th>Trạng thái</th>
                                <th>Đổi role</th>
                                <th>Thao tác</th>
                            </tr>
                            </thead>

                            <tbody>
                            {users.map((u: any) => {
                                const locked = isUserLocked(u)
                                const currentRole = getCurrentRoleName(u)
                                const isBusy = busyId === u.id

                                return (
                                    <tr key={u.id}>
                                        <td>{u.id}</td>
                                        <td>{u.username}</td>
                                        <td>{u.fullName || "-"}</td>
                                        <td>{u.cccd || "-"}</td>
                                        <td>{u.dateOfBirth || "-"}</td>
                                        <td>
                                            {Array.isArray(u.roles) && u.roles.length > 0
                                                ? u.roles.map((r: any) => (
                                                    <span key={typeof r === "string" ? r : r?.name} className="admin-badge">
                                {typeof r === "string" ? r : r?.name}
                              </span>
                                                ))
                                                : "-"}
                                        </td>

                                        <td>{locked ? "Khoá" : "Mở"}</td>

                                        <td>
                                            <select
                                                className="admin-select"
                                                value={currentRole}
                                                disabled={isBusy}
                                                onChange={(e) => onChangeRole(u, e.target.value)}
                                            >
                                                {ROLE_OPTIONS.map((r) => (
                                                    <option key={r} value={r}>
                                                        {r}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>

                                        <td>
                                            {locked ? (
                                                <button className="admin-btn secondary" disabled={isBusy} onClick={() => onUnlock(u)}>
                                                    {isBusy ? "..." : "Mở khoá"}
                                                </button>
                                            ) : (
                                                <button className="admin-btn secondary" disabled={isBusy} onClick={() => onLock(u)}>
                                                    {isBusy ? "..." : "Khoá"}
                                                </button>
                                            )}

                                            <button
                                                className="admin-btn danger"
                                                style={{ marginLeft: 6 }}
                                                disabled={isBusy}
                                                onClick={() => onDelete(u)}
                                            >
                                                {isBusy ? "..." : "Xoá"}
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
