import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TextbookService } from '../../../services/textbookService';
import { FiArrowLeft, FiCheck, FiX, FiDownload, FiFileText } from 'react-icons/fi';

const ReviewDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [textbook, setTextbook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);

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

    const handleApprove = async () => {
        if (!window.confirm("Bạn có chắc chắn muốn duyệt giáo trình này?")) return;

        try {
            setProcessing(true);
            await TextbookService.approve(id);
            alert("Đã duyệt giáo trình thành công!");
            navigate('/review/dashboard');
        } catch (err) {
            alert("Có lỗi xảy ra khi duyệt.");
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        const reason = window.prompt("Nhập lý do từ chối:");
        if (reason === null) return; // Cancelled
        if (!reason.trim()) {
            alert("Vui lòng nhập lý do từ chối.");
            return;
        }

        try {
            setProcessing(true);
            await TextbookService.reject(id, reason);
            alert("Đã từ chối giáo trình.");
            navigate('/review/dashboard');
        } catch (err) {
            alert("Có lỗi xảy ra khi từ chối.");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="p-6">Loading...</div>;
    if (error) return <div className="p-6 text-red-600">{error}</div>;
    if (!textbook) return <div className="p-6">Textbook not found</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <button
                onClick={() => navigate('/review/dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
                <FiArrowLeft className="mr-2" />
                Quay lại danh sách
            </button>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-8 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{textbook.title}</h1>
                            <p className="text-lg text-gray-600 mb-4">Môn học: <span className="font-medium text-gray-900">{textbook.subject}</span></p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>Tác giả: {textbook.author}</span>
                                <span>•</span>
                                <span>Ngày gửi: {textbook.updatedAt}</span>
                                <span>•</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${textbook.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                        textbook.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                            'bg-red-100 text-red-800'
                                    }`}>
                                    {textbook.status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Mô tả</h3>
                        <div className="prose max-w-none text-gray-600">
                            <p>{textbook.description}</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Tài liệu đính kèm</h3>
                        <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <FiFileText className="w-8 h-8 text-blue-500 mr-4" />
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">File giáo trình.pdf</p>
                                <p className="text-sm text-gray-500">2.5 MB</p>
                            </div>
                            <button className="flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                <FiDownload className="mr-2" />
                                Tải xuống
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {textbook.status === 'PENDING' && (
                        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                            <button
                                onClick={handleReject}
                                disabled={processing}
                                className="flex items-center px-6 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
                            >
                                <FiX className="mr-2" />
                                Từ chối
                            </button>
                            <button
                                onClick={handleApprove}
                                disabled={processing}
                                className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm"
                            >
                                <FiCheck className="mr-2" />
                                Phê duyệt
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewDetail;
