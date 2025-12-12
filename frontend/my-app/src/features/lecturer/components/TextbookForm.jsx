import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TextbookService } from '../../../services/textbookService';
import { FiSave, FiArrowLeft, FiUpload } from 'react-icons/fi';

const TextbookForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        title: '',
        subject: '',
        description: '',
        file: null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEditMode) {
            loadTextbook();
        }
    }, [id]);

    const loadTextbook = async () => {
        try {
            setLoading(true);
            const data = await TextbookService.getById(id);
            setFormData({
                title: data.title,
                subject: data.subject,
                description: data.description,
                file: null // File input can't be pre-filled securely
            });
        } catch (err) {
            setError("Failed to load textbook details");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, file: e.target.files[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isEditMode) {
                await TextbookService.update(id, formData);
            } else {
                await TextbookService.create(formData);
            }
            navigate('/lecturer/textbooks');
        } catch (err) {
            setError("Failed to save textbook");
            setLoading(false);
        }
    };

    if (loading && isEditMode && !formData.title) return <div className="p-6">Đang tải...</div>;

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <button
                onClick={() => navigate('/lecturer/textbooks')}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
                <FiArrowLeft className="mr-2" />
                Quay lại danh sách
            </button>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">
                    {isEditMode ? 'Chỉnh sửa giáo trình' : 'Thêm mới giáo trình'}
                </h1>

                {error && (
                    <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tên giáo trình <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            required
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Nhập tên giáo trình"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Môn học <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="subject"
                            required
                            value={formData.subject}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Nhập tên môn học"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mô tả
                        </label>
                        <textarea
                            name="description"
                            rows="4"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Mô tả nội dung giáo trình..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            File giáo trình (PDF/Word)
                        </label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 transition-colors">
                            <div className="space-y-1 text-center">
                                <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600">
                                    <label
                                        htmlFor="file-upload"
                                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                                    >
                                        <span>Tải lên tệp</span>
                                        <input
                                            id="file-upload"
                                            name="file-upload"
                                            type="file"
                                            className="sr-only"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                    <p className="pl-1">hoặc kéo thả vào đây</p>
                                </div>
                                <p className="text-xs text-gray-500">
                                    PDF, DOC tối đa 10MB
                                </p>
                                {formData.file && (
                                    <p className="text-sm text-green-600 font-medium mt-2">
                                        Đã chọn: {formData.file.name}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/lecturer/textbooks')}
                            className="mr-4 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            <FiSave className="mr-2" />
                            {loading ? 'Đang lưu...' : 'Lưu giáo trình'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TextbookForm;
