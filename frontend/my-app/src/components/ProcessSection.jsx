import React from 'react';
import { FiEdit3, FiSend, FiCheckSquare, FiBookOpen } from 'react-icons/fi';

const ProcessSection = () => {
  const steps = [
    {
      title: "Biên soạn",
      description: "Giảng viên biên soạn giáo trình theo quy chuẩn chất lượng của nhà trường.",
      icon: FiEdit3
    },
    {
      title: "Gửi duyệt",
      description: "Tác giả gửi bản thảo lên hệ thống để hội đồng chuyên môn xem xét.",
      icon: FiSend
    },
    {
      title: "Thẩm định",
      description: "Hội đồng đánh giá nội dung, góp ý chỉnh sửa và phê duyệt xuất bản.",
      icon: FiCheckSquare
    },
    {
      title: "Xuất bản & Số hóa",
      description: "Giáo trình được cấp mã số, số hóa và phát hành trên thư viện điện tử.",
      icon: FiBookOpen
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">
          Quy trình Xuất bản & Số hóa
        </h2>
        <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
          Đảm bảo chất lượng và tính chính thống của tài liệu học tập
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-8 left-0 w-full h-0.5 bg-gray-100 -z-10 transform translate-y-4"></div>

          {steps.map((step, index) => (
            <div key={index} className="text-center relative bg-white p-4">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <step.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-3 text-gray-900">{step.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>

              {/* Step Number */}
              <div className="absolute top-0 right-1/4 -mt-2 -mr-2 w-6 h-6 bg-gray-900 text-white rounded-full text-xs flex items-center justify-center font-bold border-2 border-white">
                {index + 1}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 bg-blue-900 rounded-2xl p-8 md:p-12 text-center text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Bạn là giảng viên?</h3>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              Đăng ký tham gia biên soạn giáo trình ngay hôm nay để đóng góp vào kho tri thức chung của nhà trường.
            </p>
            <button className="bg-white text-blue-900 px-8 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors">
              Đăng ký biên soạn
            </button>
          </div>

          {/* Decorative circles */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-800 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-700 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-x-1/2 translate-y-1/2"></div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;