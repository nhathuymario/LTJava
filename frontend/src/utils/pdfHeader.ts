import type jsPDF from "jspdf";

type HeaderArgs = {
    universityLine1?: string; // VD: "ĐẠI HỌC ĐÀ NẴNG"
    universityLine2?: string; // VD: "TRƯỜNG ĐẠI HỌC SƯ PHẠM KỸ THUẬT"
    nationLine1?: string;     // VD: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM"
    nationLine2?: string;     // VD: "Độc lập - Tự do - Hạnh phúc"
    titleLine1?: string;      // VD: "QUY ĐỊNH VỀ VIỆC ĐO LƯỜNG, ĐÁNH GIÁ MỨC ĐẠT CHUẨN ĐẦU RA"
    titleLine2?: string;      // VD: "CHƯƠNG TRÌNH ĐÀO TẠO CỦA NGƯỜI HỌC"
    decisionLine?: string;    // VD: "(Ban hành kèm theo Quyết định số: ...)"
    majorLine?: string;       // VD: "Ngành: ... - Mã ngành: ..."
};

function centerText(doc: jsPDF, text: string, y: number) {
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.text(text, pageWidth / 2, y, { align: "center" });
}

export function drawSchoolHeader(doc: jsPDF, args: HeaderArgs) {
    const {
        universityLine1 = "ĐẠI HỌC ĐÀ NẴNG",
        universityLine2 = "TRƯỜNG ĐẠI HỌC SƯ PHẠM KỸ THUẬT",
        nationLine1 = "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM",
        nationLine2 = "Độc lập - Tự do - Hạnh phúc",
        titleLine1 = "QUY ĐỊNH VỀ VIỆC ĐO LƯỜNG, ĐÁNH GIÁ MỨC ĐẠT CHUẨN ĐẦU RA",
        titleLine2 = "CHƯƠNG TRÌNH ĐÀO TẠO CỦA NGƯỜI HỌC",
        decisionLine = "(Ban hành kèm theo Quyết định số: 627/QĐ-ĐHSPKT ngày 19 tháng 8 năm 2022 của Hiệu trưởng Trường Đại học Sư phạm Kỹ thuật)",
        majorLine = "Ngành: Công nghệ kỹ thuật giao thông - Mã ngành: 7510104",
    } = args;

    // Font giống văn bản hành chính
    doc.setFont("times", "bold");
    doc.setFontSize(12);

    // 2 cột: trái (trường), phải (quốc hiệu)
    const marginX = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const rightX = pageWidth - marginX;

    // Cột trái
    doc.text(universityLine1, marginX, 40, { align: "left" });
    doc.text(universityLine2, marginX, 58, { align: "left" });

    // Cột phải
    doc.text(nationLine1, rightX, 40, { align: "right" });
    doc.setFont("times", "normal");
    doc.text(nationLine2, rightX, 58, { align: "right" });

    // Kẻ gạch dưới mỗi cột (nhìn giống mẫu)
    doc.setDrawColor(0);
    doc.setLineWidth(0.8);

    // underline trái
    doc.line(marginX, 64, marginX + 230, 64);
    // underline phải
    doc.line(rightX - 250, 64, rightX, 64);

    // Tiêu đề giữa trang
    doc.setFont("times", "bold");
    doc.setFontSize(14);
    centerText(doc, titleLine1, 110);
    centerText(doc, titleLine2, 130);

    // Dòng quyết định
    doc.setFont("times", "normal");
    doc.setFontSize(11);
    centerText(doc, decisionLine, 155);

    // Dòng ngành
    doc.setFont("times", "bold");
    doc.setFontSize(12);
    centerText(doc, majorLine, 185);

    // Trả về vị trí y để phần dưới vẽ tiếp
    return 210;
}
