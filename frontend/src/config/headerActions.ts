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
        key: 'lecturer-create-syllabus',
        label: 'Tạo giáo trình',
        to: '/lecturer/syllabus/new',
        roles: ['LECTURER'],
        icon: '📚',
    },
    // ✅ AA
    { key:"aa-create-course", label:"Tạo môn học", to:"/aa/courses/new", roles:["AA"], icon:"➕" },
    { key:"aa-set-relations", label:"Set tiên quyết", to:"/aa/courses/relations", roles:["AA"], icon:"🧩" },

    // ✅ STUDENT
    {
        key: 'student-register-course',
        label: 'Đăng ký môn học',
        to: '/student/courses/register',
        roles: ['STUDENT'],
        icon: '📝',
    },

    {
        key: "my_reviews",
        label: "My Reviews",
        to: "/reviews",
        roles: ["LECTURER", "AA", "HOD"],
        icon: "📌",
    },
    // {
    //     key: "assign_review",
    //     label: "Assign Review",
    //     to: "/hod/collab",
    //     roles: ["HOD"],
    //     icon: "🧩",
    // },
    {
        key: "aa-plos",
        label: "Quản lý PLO",
        to: "/aa/plos",
        roles: ["AA"],
        icon: "🎯",
    },


    // Ví dụ sau này thêm:
    // { key:'admin-users', label:'Quản lý user', to:'/admin/users', roles:['ADMIN'], icon:'🛠️' },
];
