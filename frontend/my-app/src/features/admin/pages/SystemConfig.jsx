import React, { useState } from 'react';
import { FiSave, FiPlus, FiTrash2 } from 'react-icons/fi';

const SystemConfig = () => {
    const [activeTab, setActiveTab] = useState('semesters');

    // Mock Data
    const [semesters, setSemesters] = useState([
        { id: 1, name: 'Học kỳ 1 - 2023/2024', active: false },
        { id: 2, name: 'Học kỳ 2 - 2023/2024', active: true },
        { id: 3, name: 'Học kỳ 1 - 2024/2025', active: false },
    ]);

    const [gradingScales, setGradingScales] = useState([
        { id: 1, name: 'Thang điểm 10', description: 'Thang điểm chuẩn hệ 10' },
        { id: 2, name: 'Thang điểm 4', description: 'Thang điểm tín chỉ hệ 4' },
    ]);

    const toggleSemester = (id) => {
        setSemesters(semesters.map(s => ({
            ...s,
            active: s.id === id
        })));
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Cấu hình hệ thống</h1>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    className={`px-6 py-3 font-medium text-sm focus:outline-none ${activeTab === 'semesters'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    onClick={() => setActiveTab('semesters')}
                >
                    Học kỳ & Năm học
                </button>
                <button
                    className={`px-6 py-3 font-medium text-sm focus:outline-none ${activeTab === 'grading'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    onClick={() => setActiveTab('grading')}
                >
                    Thang điểm
                </button>
                <button
                    className={`px-6 py-3 font-medium text-sm focus:outline-none ${activeTab === 'clo_plo'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                    onClick={() => setActiveTab('clo_plo')}
                >
                    Mẫu CLO/PLO
                </button>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                {activeTab === 'semesters' && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-800">Danh sách Học kỳ</h3>
                            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                                <FiPlus className="mr-2" /> Thêm học kỳ
                            </button>
                        </div>
                        <div className="space-y-3">
                            {semesters.map(sem => (
                                <div key={sem.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <span className="font-medium text-gray-900">{sem.name}</span>
                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={() => toggleSemester(sem.id)}
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${sem.active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                                }`}
                                        >
                                            {sem.active ? 'Đang kích hoạt' : 'Kích hoạt'}
                                        </button>
                                        <button className="text-red-500 hover:text-red-700">
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'grading' && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-800">Quản lý Thang điểm</h3>
                            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                                <FiPlus className="mr-2" /> Thêm thang điểm
                            </button>
                        </div>
                        <div className="space-y-3">
                            {gradingScales.map(scale => (
                                <div key={scale.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-gray-900">{scale.name}</h4>
                                            <p className="text-sm text-gray-600">{scale.description}</p>
                                        </div>
                                        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                            Chỉnh sửa
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'clo_plo' && (
                    <div className="text-center py-12 text-gray-500">
                        <p>Chức năng quản lý mẫu CLO/PLO đang được phát triển.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SystemConfig;
