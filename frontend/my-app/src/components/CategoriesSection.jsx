import React from 'react';
import { FiCode, FiTrendingUp, FiCpu, FiGlobe, FiDatabase } from 'react-icons/fi';

const CategoriesSection = () => {
  const categories = [
    {
      title: "Công nghệ thông tin",
      count: "120+ Giáo trình",
      icon: FiCode,
      color: "text-blue-600 bg-blue-100"
    },
    {
      title: "Kinh tế & QTKD",
      count: "85+ Giáo trình",
      icon: FiTrendingUp,
      color: "text-green-600 bg-green-100"
    },
    {
      title: "Điện - Điện tử",
      count: "60+ Giáo trình",
      icon: FiCpu,
      color: "text-orange-600 bg-orange-100"
    },
    {
      title: "Ngôn ngữ Anh",
      count: "45+ Giáo trình",
      icon: FiGlobe,
      color: "text-purple-600 bg-purple-100"
    },
    {
      title: "Khoa học cơ bản",
      count: "90+ Giáo trình",
      icon: FiDatabase,
      color: "text-red-600 bg-red-100"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">
          Lĩnh vực đào tạo
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Khám phá tài liệu học tập đa dạng thuộc nhiều chuyên ngành khác nhau
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
          {categories.map((category, index) => (
            <div key={index} className="group bg-gray-50 p-6 rounded-xl text-center hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-200 cursor-pointer">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${category.color}`}>
                <category.icon className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{category.title}</h3>
              <p className="text-gray-500 text-sm">{category.count}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;