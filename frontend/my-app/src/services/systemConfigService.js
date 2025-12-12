export const SystemConfigService = {
    // Mock semesters data
    getSemesters: async () => {
        return [
            { id: 1, name: 'Học kỳ 1 - 2023/2024', active: false },
            { id: 2, name: 'Học kỳ 2 - 2023/2024', active: true },
            { id: 3, name: 'Học kỳ 1 - 2024/2025', active: false },
        ];
    },
    updateSemester: async (id, data) => {
        // In a real implementation, send update request. Here we just log.
        console.log('Updating semester', id, data);
        return { success: true };
    },
    // Mock grading scales data
    getGradingScales: async () => {
        return [
            { id: 1, name: 'Thang điểm 10', description: 'Thang điểm chuẩn hệ 10' },
            { id: 2, name: 'Thang điểm 4', description: 'Thang điểm tín chỉ hệ 4' },
        ];
    },
    updateGradingScale: async (id, data) => {
        console.log('Updating grading scale', id, data);
        return { success: true };
    },
};
