import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TextbookService } from '../../../services/textbookService';
import { FiArrowLeft, FiDownload, FiFileText, FiUser, FiCalendar, FiBook } from 'react-icons/fi';

const TextbookDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [textbook, setTextbook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadTextbook();
    }, [id]);

    const loadTextbook = async () => {
        try {
            const data = await TextbookService.getById(id);
            setTextbook(data);
        } catch (err) {
            setError("Failed to load textbook details");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-6">Đang tải...</div>;
    if (error) return <div className="p-6 text-red-600">{error}</div>;
    if (!textbook) return <div className="p-6">Không tìm thấy giáo trình</div>;

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <button
                onClick={() => navigate('/library')}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
                <FiArrowLeft className="mr-2" />
                Quay lại thư viện
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Cover & Key Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-8 flex items-center justify-center bg-gray-50">
                        <FiBook className="w-32 h-32 text-blue-600" />
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                        <h3 className="font-bold text-gray-900">Thông tin chung</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center text-gray-600">
                                <FiUser className="w-4 h-4 mr-3" />
                                <span>Tác giả: <span className="font-medium text-gray-900">{textbook.author}</span></span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <FiBook className="w-4 h-4 mr-3" />
                                <span>Môn học: <span className="font-medium text-gray-900">{textbook.subject}</span></span>
                            </div>
                            <div className="flex items-center text-gray-600">
                                <FiCalendar className="w-4 h-4 mr-3" />
                                <span>Cập nhật: <span className="font-medium text-gray-900">{textbook.updatedAt}</span></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Details & Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">{textbook.title}</h1>

                        <div className="prose max-w-none text-gray-600 mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Giới thiệu</h3>
                            <p>{textbook.description}</p>
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tài liệu học tập</h3>
                            <div className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <FiFileText className="w-8 h-8 text-blue-600 mr-4" />
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">Nội dung giáo trình.pdf</p>
                                    <p className="text-sm text-gray-500">Phiên bản mới nhất</p>
                                </div>
                                <button className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                                    <FiDownload className="mr-2" />
                                    Tải xuống
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TextbookDetail;
