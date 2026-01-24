import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { CLO, PI, PLO } from "../services/outcome";
import { buildMapping } from "./matrixMapping";
import { drawSchoolHeader } from "./pdfHeader";

type ExportArgs = {
    plo: PLO;
    clos: CLO[];
    pis: PI[];
};

export async function exportMatrixPdf({ plo, clos, pis }: ExportArgs) {
    const mapping = await buildMapping(clos);

    const doc = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: "a4",
    });
    const startY = drawSchoolHeader(doc, {});


    const title = "PLO – PI – CLO Matrix (Chuẩn kiểm định)";
    const sub = `PLO: ${plo.code} | Program: ${plo.program ?? ""}`;

    doc.setFont("times", "bold");
    doc.setFontSize(14);
    doc.text(title, 40, 30);

    doc.setFont("times", "normal");
    doc.setFontSize(11);
    doc.text(sub, 40, 48);

    const head = [["CLO \\ PI", ...pis.map((pi) => pi.code)]];
    const body = clos.map((clo) => [
        clo.code,
        ...pis.map((pi) => mapping[clo.id]?.[pi.id] || ""),
    ]);

    autoTable(doc, {
        head,
        body,
        startY,
        theme: "grid",
        styles: {
            font: "times",
            fontSize: 10,
            cellPadding: 4,
            halign: "center",
            valign: "middle",
            lineWidth: 0.6,
            lineColor: [0, 0, 0],
            textColor: [0, 0, 0],
            overflow: 'linebreak',
        },
        headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            lineWidth: 0.8,
            lineColor: [0, 0, 0],
            fontStyle: "bold",
        },
        columnStyles: {
            0: { halign: "left", cellWidth: 120 },
        },
        didDrawPage: () => {
            const pageCount = doc.getNumberOfPages();
            const pageNumber = doc.getCurrentPageInfo().pageNumber;
            doc.setFont("times", "normal");
            doc.setFontSize(9);
            doc.text(`Page ${pageNumber} / ${pageCount}`, doc.internal.pageSize.getWidth() - 80, doc.internal.pageSize.getHeight() - 20);
        },
    });

    doc.save(`matrix_${plo.code}.pdf`);
}
