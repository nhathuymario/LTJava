export type HeaderAction = {
    key: string
    label: string
    to: string
    roles?: string[] // không có => ai cũng thấy
    icon?: string
}

export const HEADER_ACTIONS: HeaderAction[] = [
    // ✅ Lecturer
    {
        key: 'lecturer-create-course',
        label: 'Tạo môn học',
        to: '/lecturer/courses',
        roles: ['LECTURER'],
        icon: '➕',
    },
    {
        key: 'lecturer-create-syllabus',
        label: 'Tạo giáo trình',
        to: './syllabus/index.tsx',
        roles: ['LECTURER'],
        icon: '📚',
    },

    // Ví dụ sau này thêm:
    // { key:'admin-users', label:'Quản lý user', to:'/admin/users', roles:['ADMIN'], icon:'🛠️' },
]
