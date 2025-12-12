import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TextbookService } from '../../../services/textbookService';
import { FiSearch, FiBook, FiUser, FiCalendar } from 'react-icons/fi';

const Library = () => {
    const [textbooks, setTextbooks] = useState([]);
    const [filteredTextbooks, setFilteredTextbooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');

    useEffect(() => {
        loadTextbooks();
    }, []);

    useEffect(() => {
        filterTextbooks();
    }, [searchTerm, selectedSubject, textbooks]);

    const loadTextbooks = async () => {
        try {
            const data = await TextbookService.getAll();
            // Only show approved textbooks
            const approvedBooks = data.filter(book => book.status === 'APPROVED');
            setTextbooks(approvedBooks);
            setFilteredTextbooks(approvedBooks);
        } catch (error) {
            console.error("Failed to load textbooks", error);
        } finally {
            setLoading(false);
        }
    };

    const filterTextbooks = () => {
        let result = textbooks;

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(book =>
                book.title.toLowerCase().includes(lowerTerm) ||
                book.author.toLowerCase().includes(lowerTerm)
            );
        }

        if (selectedSubject) {
            result = result.filter(book => book.subject === selectedSubject);
        }

        setFilteredTextbooks(result);
    };

    // Get unique subjects for filter
    const subjects = [...new Set(textbooks.map(book => book.subject))];

    if (loading) return <div className="p-6">Đang tải...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Thư viện Giáo trình Số</h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Truy cập hàng ngàn giáo trình, tài liệu học tập chất lượng cao được biên soạn bởi đội ngũ giảng viên uy tín.
                </p>
            </div>

            {/* Search and Filter */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên giáo trình, tác giả..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-64">
                    <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                    >
                        <option value="">Tất cả môn học</option>
                        {subjects.map(subject => (
                            <option key={subject} value={subject}>{subject}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTextbooks.map((book) => (
                    <Link key={book.id} to={`/library/${book.id}`} className="group">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
                            <div className="h-48 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                                <FiBook className="w-16 h-16 text-gray-300 group-hover:scale-110 transition-transform duration-300" />
                                <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
                                    {book.subject}
                                </div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                                    {book.title}
                                </h3>
                                <p className="text-gray-500 text-sm mb-4 line-clamp-3 flex-1">
                                    {book.description}
                                </p>
                                <div className="flex items-center justify-between text-sm text-gray-500 mt-auto pt-4 border-t border-gray-100">
                                    <div className="flex items-center">
                                        <FiUser className="mr-2" />
                                        {book.author}
                                    </div>
                                    <div className="flex items-center">
                                        <FiCalendar className="mr-2" />
                                        {book.updatedAt}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {filteredTextbooks.length === 0 && (
                <div className="text-center py-12">
                    <FiBook className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Không tìm thấy giáo trình nào</h3>
                    <p className="text-gray-500">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.</p>
                </div>
            )}
        </div>
    );
};

export default Library;
