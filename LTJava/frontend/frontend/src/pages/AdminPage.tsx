import { useEffect, useMemo, useState } from 'react'
import {
    getAllUsers,
    createUser,
    bulkCreateUsers,
    lockUser,
    unlockUser,
    changeUserRole,
    deleteUser,
    type User,
} from '../services/admin'

const ROLE_OPTIONS = ['SYSTEM_ADMIN', 'LECTURER', 'AA', 'STUDENT']

// yyyy-MM-dd -> dd/MM/yyyy
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

    // Form tạo đơn (theo Postman)
    const [fullName, setFullName] = useState('')
    const [cccd, setCccd] = useState('')
    const [dob, setDob] = useState('') // yyyy-MM-dd từ input type="date"
    const [newRole, setNewRole] = useState('STUDENT')

    // Tạo nhiều (CSV): fullName,cccd,dateOfBirth(dd/MM/yyyy),roleName
    const [bulkText, setBulkText] = useState('')

    const fetchUsers = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await getAllUsers()
            setUsers(data)
        } catch (err: any) {
            console.error('GET /admin/users error =>', err?.message, err?.response?.status, err?.response?.data)
            const msg = err?.response?.data || 'Không tải được danh sách người dùng'
            setError(typeof msg === 'string' ? msg : 'Không tải được danh sách người dùng')
        }

        useEffect(() => {
            fetchUsers()
        }, [])

        // ...
        const onCreateUser = async () => {
            // yyyy-MM-dd -> dd/MM/yyyy
            const dateOfBirth = toDDMMYYYY(dob)
            const body = {fullName: fullName.trim(), cccd: cccd.trim(), dateOfBirth, roleName: newRole}
            console.log('POST /api/admin/users/create body:', body)

            try {
                const body = {
                    fullName: fullName.trim(),
                    cccd: cccd.trim(),
                    dateOfBirth: toDDMMYYYY(dob),
                    roleName: newRole
                }
                console.log('POST body:', body)
                await createUser(body)
                await fetchUsers()
            } catch (err: any) {
                console.error('POST /admin/users/create error =>', err?.message, err?.response?.status, err?.response?.data)
                alert(err?.response?.data || 'Tạo tài khoản thất bại')
            }
        }
        const parsedBulk = useMemo(() => {
            // Mỗi dòng: fullName,cccd,dateOfBirth(dd/MM/yyyy),roleName
            const lines = bulkText.split('\n').map(l => l.trim()).filter(Boolean)
            const items: Array<{ fullName: string; cccd: string; dateOfBirth: string; roleName: string }> = []
            for (const line of lines) {
                const [fullName, cccd, dateOfBirth, roleName = 'STUDENT'] = line.split(',').map(p => p.trim())
                if (fullName && cccd && dateOfBirth) {
                    items.push({fullName, cccd, dateOfBirth, roleName})
                }
            }
            return items
        }, [bulkText])

        const onBulkCreate = async () => {
            if (parsedBulk.length === 0) {
                alert('Không có dòng hợp lệ. Định dạng: fullName,cccd,dateOfBirth(dd/MM/yyyy),roleName')
                return
            }
            try {
                await bulkCreateUsers(parsedBulk)
                setBulkText('')
                await fetchUsers()
            } catch (err: any) {
                alert(err?.response?.data || 'Tạo nhiều tài khoản thất bại')
            }
        }

        const onLock = async (u: User) => {
            try {
                await lockUser(u.id);
                await fetchUsers()
            } catch (err: any) {
                alert(err?.response?.data || 'Khoá tài khoản thất bại')
            }
        }
        const onUnlock = async (u: User) => {
            try {
                await unlockUser(u.id);
                await fetchUsers()
            } catch (err: any) {
                alert(err?.response?.data || 'Mở khoá tài khoản thất bại')
            }
        }
        const onChangeRole = async (u: User, roleName: string) => {
            try {
                await changeUserRole(u.id, roleName);
                await fetchUsers()
            } catch (err: any) {
                alert(err?.response?.data || 'Đổi role thất bại')
            }
        }
        const onDelete = async (u: User) => {
            if (!confirm(`Xoá user ${u.username || u.fullName || ''}?`)) return;
            try {
                await deleteUser(u.id);
                await fetchUsers()
            } catch (err: any) {
                alert(err?.response?.data || 'Xoá user thất bại')
            }
        }

        return (
            <div style={{padding: 24}}>
                <h1>Quản trị người dùng</h1>

                {error && <p style={{color: 'red'}}>{error}</p>}
                {loading && <p>Đang tải...</p>}

                {/* Tạo tài khoản đơn theo Postman */}
                <section style={{marginTop: 16, marginBottom: 24}}>
                    <h3>Tạo tài khoản đơn</h3>
                    <div style={{display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center'}}>
                        <input
                            placeholder="Họ và tên"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            style={{padding: 8, border: '1px solid #ddd', borderRadius: 6, minWidth: 220}}
                        />
                        <input
                            placeholder="CCCD"
                            value={cccd}
                            onChange={(e) => setCccd(e.target.value)}
                            style={{padding: 8, border: '1px solid #ddd', borderRadius: 6, minWidth: 160}}
                        />
                        <input
                            type="date"
                            placeholder="Ngày sinh"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            style={{padding: 8, border: '1px solid #ddd', borderRadius: 6}}
                        />
                        <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            style={{padding: 8, border: '1px solid #ddd', borderRadius: 6}}
                        >
                            {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <button onClick={onCreateUser} style={{padding: '8px 12px'}}>Tạo</button>
                    </div>
                    <p style={{color: '#666', marginTop: 8}}>
                        Ngày sinh sẽ gửi dạng dd/MM/yyyy (ví dụ: 2004-01-01 → 01/01/2004) theo đúng Postman.
                    </p>
                </section>

                {/* Tạo nhiều tài khoản */}
                <section style={{marginBottom: 24}}>
                    <h3>Tạo nhiều tài khoản (CSV)</h3>
                    <p style={{color: '#555'}}>
                        Mỗi dòng: fullName,cccd,dateOfBirth(dd/MM/yyyy),roleName (roleName tuỳ chọn, mặc định STUDENT)
                    </p>
                    <textarea
                        placeholder={`vd:\nNguyen Van A,012345678901,01/01/2004,STUDENT\nLe Thi B,098765432109,31/12/1999,LECTURER`}
                        value={bulkText}
                        onChange={(e) => setBulkText(e.target.value)}
                        rows={6}
                        style={{width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6}}
                    />
                    <div style={{marginTop: 8, display: 'flex', gap: 8}}>
                        <button onClick={onBulkCreate} style={{padding: '8px 12px'}}>Tạo nhiều</button>
                        <span style={{color: '#666'}}>Sẽ tạo: {parsedBulk.length} tài khoản</span>
                    </div>
                </section>

                {/* Bảng người dùng */}
                {!loading && !error && (
                    <section>
                        <table style={{width: '100%', borderCollapse: 'collapse'}}>
                            <thead>
                            <tr>
                                <th style={th}>ID</th>
                                <th style={th}>Username</th>
                                <th style={th}>Họ tên</th>
                                <th style={th}>CCCD</th>
                                <th style={th}>Ngày sinh</th>
                                <th style={th}>Roles</th>
                                <th style={th}>Trạng thái</th>
                                <th style={th}>Đổi role</th>
                                <th style={th}>Thao tác</th>
                            </tr>
                            </thead>
                            <tbody>
                            {users.map((u) => {
                                const isLocked = u.locked ?? (u.enabled === false)
                                const currentRole = u.roles?.[0]?.name || ''
                                return (
                                    <tr key={u.id}>
                                        <td style={td}>{u.id}</td>
                                        <td style={td}>{u.username}</td>
                                        <td style={td}>{u.fullName || '-'}</td>
                                        <td style={td}>{u.cccd || '-'}</td>
                                        <td style={td}>{u.dateOfBirth || '-'}</td>
                                        <td style={td}>{u.roles?.map((r) => r.name).join(', ') || '-'}</td>
                                        <td style={td}>{isLocked ? 'Khoá' : 'Mở'}</td>
                                        <td style={td}>
                                            <select
                                                value={currentRole}
                                                onChange={(e) => onChangeRole(u, e.target.value)}
                                                style={{padding: 6, border: '1px solid #ddd', borderRadius: 6}}
                                            >
                                                {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                        </td>
                                        <td style={td}>
                                            {isLocked ? (
                                                <button onClick={() => onUnlock(u)} style={btn}>Mở khoá</button>
                                            ) : (
                                                <button onClick={() => onLock(u)} style={btn}>Khoá</button>
                                            )}
                                            <button onClick={() => onDelete(u)} style={{
                                                ...btn,
                                                marginLeft: 8,
                                                background: '#ef4444',
                                                color: '#fff'
                                            }}>Xoá
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                            </tbody>
                        </table>
                    </section>
                )}
            </div>
        )
    }

    const th = {textAlign: 'left' as const, borderBottom: '1px solid #ddd', padding: '8px'}
    const td = {borderBottom: '1px solid #eee', padding: '8px'}
    const btn = {
        padding: '6px 10px',
        borderRadius: 6,
        border: '1px solid #ddd',
        background: '#f8f8f8',
        cursor: 'pointer'
    }
}