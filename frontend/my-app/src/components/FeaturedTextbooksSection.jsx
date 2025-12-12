import React from 'react';
import { Link } from 'react-router-dom';
import { FiBook, FiUser, FiStar } from 'react-icons/fi';

const FeaturedTextbooksSection = () => {
    const textbooks = [
        {
            id: 1,
            title: "Lập trình Java căn bản",
            author: "TS. Nguyễn Văn A",
            subject: "Công nghệ thông tin",
            rating: 4.8,
            reviews: 120
        },
        {
            id: 2,
            title: "Kinh tế vi mô",
            author: "PGS.TS. Trần Thị B",
            subject: "Kinh tế",
            rating: 4.9,
            reviews: 85
        },
        {
            id: 3,
            title: "Toán cao cấp A1",
            author: "ThS. Lê Văn C",
            subject: "Khoa học cơ bản",
            rating: 4.7,
            reviews: 200
        },
        {
            id: 4,
            title: "Tiếng Anh chuyên ngành CNTT",
            author: "TS. Phạm Thị D",
            subject: "Ngôn ngữ Anh",
            rating: 4.6,
            reviews: 95
        }
    ];

    return (
        <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Giáo trình nổi bật</h2>
                        <p className="text-gray-600">Được đánh giá cao bởi giảng viên và sinh viên</p>
                    </div>
                    <Link to="/library" className="text-blue-600 font-medium hover:text-blue-700 hidden md:block">
                        Xem tất cả &rarr;
                    </Link>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {textbooks.map((book) => (
                        <div key={book.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="h-40 bg-blue-50 rounded-lg mb-4 flex items-center justify-center">
                                <FiBook className="w-12 h-12 text-blue-300" />
                            </div>
                            <div className="text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wide">
                                {book.subject}
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 h-14">
                                {book.title}
                            </h3>
                            <div className="flex items-center text-gray-500 text-sm mb-4">
                                <FiUser className="mr-2" />
                                <span className="truncate">{book.author}</span>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                <div className="flex items-center">
                                    <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                                    <span className="ml-1 font-medium text-gray-900">{book.rating}</span>
                                    <span className="ml-1 text-gray-400 text-xs">({book.reviews})</span>
                                </div>
                                <Link to={`/library/${book.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-700">
                                    Chi tiết
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 text-center md:hidden">
                    <Link to="/library" className="text-blue-600 font-medium hover:text-blue-700">
                        Xem tất cả &rarr;
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default FeaturedTextbooksSection;
