import React from 'react';
import { Link } from 'react-router-dom';
import { FiBook, FiShield, FiMonitor } from 'react-icons/fi';

const HeroSection = () => {
  return (
    <section className="bg-blue-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Hệ thống Quản lý và Số hóa Giáo trình Đại học
          </h1>
          <p className="text-xl text-gray-600 mb-10">
            Nền tảng cung cấp tài liệu học tập chính thống, chất lượng cao dành cho giảng viên và sinh viên.
          </p>

          <div className="flex justify-center space-x-4 mb-16">
            <Link
              to="/library"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
            >
              Khám phá Thư viện
            </Link>
            <Link
              to="/login"
              className="bg-white hover:bg-gray-50 text-blue-600 border border-blue-600 px-8 py-3 rounded-lg text-lg font-medium transition-colors"
            >
              Đăng nhập
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FiBook className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Kho tài liệu số</h3>
              <p className="text-gray-600 text-sm">
                Truy cập không giới hạn hàng ngàn giáo trình và tài liệu tham khảo.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FiShield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Kiểm duyệt chặt chẽ</h3>
              <p className="text-gray-600 text-sm">
                Nội dung được thẩm định bởi hội đồng chuyên môn uy tín.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FiMonitor className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Hỗ trợ đa nền tảng</h3>
              <p className="text-gray-600 text-sm">
                Học tập mọi lúc mọi nơi trên máy tính, máy tính bảng và điện thoại.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;