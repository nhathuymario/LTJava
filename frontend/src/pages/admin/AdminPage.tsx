import { useEffect, useState } from 'react'
import {
    getAllUsers, createUser,
    lockUser, unlockUser, changeUserRole, deleteUser, type User,
    importUsersExcel,
} from '../../services/admin'
import { hasRole } from '../../services/auth'
import '../../assets/css/admin.css'

const ROLE_OPTIONS = ['SYSTEM_ADMIN', 'LECTURER', 'AA', 'STUDENT', 'PRINCIPAL'] as const

function toDDMMYYYY(value: string) {
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (!m) return value
    const [, y, mm, d] = m
    return `${d}/${mm}/${y}`
}

export default function AdminPage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [fullName, setFullName] = useState('')
    const [cccd, setCccd] = useState('')
    const [dob, setDob] = useState('')
    const [newRole, setNewRole] = useState<'SYSTEM_ADMIN' | 'LECTURER' | 'AA' | 'STUDENT'|'PRINCIPAL'>('STUDENT')
    const [excelFile, setExcelFile] = useState<File | null>(null)
    const [importResult, setImportResult] = useState<any>(null) // hoặc type ImportUsersResult nếu bạn export type


    const isSystemAdmin = hasRole('SYSTEM_ADMIN')

    const fetchUsers = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await getAllUsers()
            setUsers(data)
        } catch (err: any) {
            const status = err?.response?.status
            const resp = err?.response?.data
            console.error('GET /admin/users failed:', status, resp)
            const msg = resp?.message || resp || err?.message || 'Không tải được danh sách người dùng'
            setError(typeof msg === 'string' ? msg : 'Không tải được danh sách người dùng')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!isSystemAdmin) {
            setError('Bạn không có quyền quản trị (SYSTEM_ADMIN)')
            setLoading(false)
            return
        }
        fetchUsers()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSystemAdmin])

    const onCreateUser = async () => {
        if (!isSystemAdmin) { alert('Chỉ SYSTEM_ADMIN'); return }
        const body = {
            fullName: fullName.trim(),
            cccd: cccd.trim(),
            dateOfBirth: toDDMMYYYY(dob),
            roleName: newRole,
        }
        try {
            await createUser(body)
            setFullName(''); setCccd(''); setDob(''); setNewRole('STUDENT')
            await fetchUsers()
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.response?.data || err?.message
            alert(msg || 'Tạo tài khoản thất bại')
        }
    }

    const onImportExcel = async () => {
        if (!isSystemAdmin) { alert('Chỉ SYSTEM_ADMIN'); return }
        if (!excelFile) { alert('Chọn file .xlsx trước'); return }

        try {
            const res = await importUsersExcel(excelFile)
            setImportResult(res)
            setExcelFile(null)

            // refresh list
            await fetchUsers()

            // thông báo nhanh
            alert(`Import xong: thành công ${res.successCount}, lỗi ${res.failedCount}`)
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.response?.data || err?.message
            alert(msg || 'Import Excel thất bại')
        }
    }


    // const parsedBulk = useMemo(() => {
    //     const lines = bulkText.split('\n').map(l => l.trim()).filter(Boolean)
    //     const items: Array<{ fullName: string; cccd: string; dateOfBirth: string; roleName: string }> = []
    //     for (const line of lines) {
    //         const [fullName, cccd, dateOfBirth, roleName = 'STUDENT'] = line.split(',').map(p => p.trim())
    //         if (fullName && cccd && dateOfBirth) items.push({ fullName, cccd, dateOfBirth, roleName })
    //     }
    //     return items
    // }, [bulkText])

    // const onBulkCreate = async () => {
    //     if (!isSystemAdmin) { alert('Chỉ SYSTEM_ADMIN'); return }
    //     if (parsedBulk.length === 0) { alert('Không có dòng hợp lệ'); return }
    //     try {
    //         // @ts-ignore
    //         await bulkCreateUsers(parsedBulk)
    //         setBulkText('')
    //         await fetchUsers()
    //     } catch (err: any) {
    //         const msg = err?.response?.data?.message || err?.response?.data || err?.message
    //         alert(msg || 'Tạo nhiều tài khoản thất bại')
    //     }
    // }

    const onLock = async (u: User) => { try { await lockUser(u.id); await fetchUsers() } catch (err: any) { alert(err?.response?.data || 'Khoá thất bại') } }
    const onUnlock = async (u: User) => { try { await unlockUser(u.id); await fetchUsers() } catch (err: any) { alert(err?.response?.data || 'Mở khoá thất bại') } }
    const onChangeRole = async (u: User, roleName: string) => { try { /* @ts-ignore */ // @ts-ignore
        await changeUserRole(u.id, roleName); await fetchUsers() } catch (err: any) { alert(err?.response?.data || 'Đổi role thất bại') } }
    const onDelete = async (u: User) => {
        if (!confirm(`Xoá user ${u.username || u.fullName || ''}?`)) return
        try { await deleteUser(u.id); await fetchUsers() } catch (err: any) { alert(err?.response?.data || 'Xoá user thất bại') }
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
                        <input className="admin-input" placeholder="Họ và tên" value={fullName} onChange={e => setFullName(e.target.value)} />
                        <input className="admin-input" placeholder="CCCD" value={cccd} onChange={e => setCccd(e.target.value)} />
                        <input className="admin-input" type="date" value={dob} onChange={e => setDob(e.target.value)} />
                        <select className="admin-select" value={newRole} onChange={e => setNewRole(e.target.value as typeof newRole)}>
                            {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <button className="admin-btn" onClick={onCreateUser}>Tạo</button>
                    </div>
                    <p style={{ color: '#6b7280', marginTop: 4 }}>Ngày sinh sẽ gửi dạng dd/MM/yyyy.</p>
                </div>


                {/* Import Excel */}
                <div className="admin-section">
                    <h3>Import tài khoản từ Excel (.xlsx)</h3>
                    <p style={{ color: '#6b7280' }}>
                        File mẫu: fullName | cccd | dateOfBirth | roleName
                    </p>

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
                            <div style={{ color: '#6b7280' }}>
                                Tổng dòng: {importResult.totalRows ?? '-'} | Thành công: {importResult.successCount ?? 0} | Lỗi: {importResult.failedCount ?? 0}
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
                                    {importResult.errors.length > 20 && (
                                        <div style={{ color: '#6b7280' }}>Chỉ hiển thị 20 lỗi đầu.</div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>


                {/*/!* Tạo nhiều *!/*/}
                {/*<div className="admin-section">*/}
                {/*    <h3>Tạo nhiều tài khoản (CSV)</h3>*/}
                {/*    <p style={{ color: '#6b7280' }}>Mỗi dòng: fullName,cccd,dateOfBirth(dd/MM/yyyy),roleName</p>*/}
                {/*    <textarea*/}
                {/*        className="admin-textarea"*/}
                {/*        rows={5}*/}
                {/*        placeholder={`vd:\nNguyen Van A,012345678901,01/01/2004,STUDENT\nLe Thi B,098765432109,31/12/1999,LECTURER`}*/}
                {/*        value={bulkText}*/}
                {/*        onChange={e => setBulkText(e.target.value)}*/}
                {/*    />*/}
                {/*    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>*/}
                {/*        <button className="admin-btn" onClick={onBulkCreate}>Tạo nhiều</button>*/}
                {/*        <span style={{ color: '#6b7280' }}>Sẽ tạo: {parsedBulk.length} tài khoản</span>*/}
                {/*    </div>*/}
                {/*</div>*/}

                {/* Bảng */}
                {!loading && !error && (
                    <div className="admin-section">
                        <table className="admin-table">
                            <thead>
                            <tr>
                                <th>ID</th><th>Username</th><th>Họ tên</th><th>CCCD</th><th>Ngày sinh</th><th>Roles</th><th>Trạng thái</th><th>Đổi role</th><th>Thao tác</th>
                            </tr>
                            </thead>
                            <tbody>
                            {users.map(u => {
                                const isLocked = u.locked ?? (u.enabled === false)
                                const currentRole = u.roles?.[0]?.name || ''
                                return (
                                    <tr key={u.id}>
                                        <td>{u.id}</td>
                                        <td>{u.username}</td>
                                        <td>{u.fullName || '-'}</td>
                                        <td>{u.cccd || '-'}</td>
                                        <td>{u.dateOfBirth || '-'}</td>
                                        <td>
                                            {u.roles?.map(r => <span key={r.name} className="admin-badge">{r.name}</span>) || '-'}
                                        </td>
                                        <td>{isLocked ? 'Khoá' : 'Mở'}</td>
                                        <td>
                                            <select
                                                className="admin-select"
                                                value={currentRole}
                                                onChange={e => onChangeRole(u, e.target.value)}
                                            >
                                                {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                        </td>
                                        <td>
                                            {isLocked
                                                ? <button className="admin-btn secondary" onClick={() => onUnlock(u)}>Mở khoá</button>
                                                : <button className="admin-btn secondary" onClick={() => onLock(u)}>Khoá</button>}
                                            <button className="admin-btn danger" style={{ marginLeft: 6 }} onClick={() => onDelete(u)}>Xoá</button>
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