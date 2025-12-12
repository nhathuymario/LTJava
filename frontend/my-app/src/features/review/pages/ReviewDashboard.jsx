import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TextbookService } from '../../../services/textbookService';
import { FiEye, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const ReviewDashboard = () => {
    const [textbooks, setTextbooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTextbooks();
    }, []);

    const loadTextbooks = async () => {
        try {
            const data = await TextbookService.getAll();
            // Filter only pending textbooks for review
            const pendingBooks = data.filter(book => book.status === 'PENDING');
            setTextbooks(pendingBooks);
        } catch (error) {
            console.error("Failed to load textbooks", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-6">Đang tải...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Duyệt giáo trình</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên giáo trình</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tác giả</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Môn học</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày gửi</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {textbooks.map((book) => (
                            <tr key={book.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{book.title}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {book.author}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {book.subject}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {book.updatedAt}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link
                                        to={`/review/dashboard/${book.id}`}
                                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <FiEye className="mr-2" />
                                        Xem chi tiết
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {textbooks.length === 0 && (
                    <div className="p-6 text-center text-gray-500">
                        Không có giáo trình nào cần duyệt.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewDashboard;
