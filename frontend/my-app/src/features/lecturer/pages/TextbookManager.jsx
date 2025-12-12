import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TextbookService } from '../../../services/textbookService';
import { FiPlus, FiEdit, FiEye } from 'react-icons/fi';

const TextbookManager = () => {
    const [textbooks, setTextbooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTextbooks();
    }, []);

    const loadTextbooks = async () => {
        try {
            const data = await TextbookService.getMyTextbooks();
            setTextbooks(data);
        } catch (error) {
            console.error("Failed to load textbooks", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-100 text-green-800';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'REJECTED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) return <div className="p-6">Đang tải...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Quản lý giáo trình</h1>
                <Link
                    to="/lecturer/textbooks/new"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <FiPlus className="mr-2" />
                    Thêm mới
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên giáo trình</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Môn học</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày cập nhật</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {textbooks.map((book) => (
                            <tr key={book.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{book.title}</div>
                                    <div className="text-sm text-gray-500">{book.author}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {book.subject}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(book.status)}`}>
                                        {book.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {book.updatedAt}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link to={`/lecturer/textbooks/${book.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                                        <FiEdit className="w-5 h-5 inline" />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {textbooks.length === 0 && (
                    <div className="p-6 text-center text-gray-500">
                        Chưa có giáo trình nào.
                    </div>
                )}
            </div>
        </div>
    );
};

export default TextbookManager;
