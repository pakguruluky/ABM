import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  APTITUDE_DIMENSIONS,
  ASSESSMENT_PREAMBLE,
  DOMINANT_INTEREST_RULE_NOTE,
  INTEREST_DIMENSIONS,
  MATRIX_ROW_ORDER,
  PEDOMAN_PEMAHAMAN,
} from '../data/abmCatalog';
import { InstitutionSettings, InterestKey, StudentRecord } from '../types/abm';
import { getAptitudeCategory } from './scoring';

export function formatIndonesianDate(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getLastAutoTableY(doc: jsPDF): number {
  const docWithTable = doc as jsPDF & { lastAutoTable?: { finalY: number } };
  return docWithTable.lastAutoTable?.finalY ?? 40;
}

function detectImageFormat(dataUrl: string): 'PNG' | 'JPEG' | 'WEBP' {
  if (dataUrl.startsWith('data:image/png')) return 'PNG';
  if (dataUrl.startsWith('data:image/webp')) return 'WEBP';
  return 'JPEG';
}

function drawKopSurat(
  doc: jsPDF,
  institution: InstitutionSettings,
  pageWidth: number,
  marginX: number
): number {
  const startY = 12;
  const hasLogo = Boolean(
    institution.logoBase64 && institution.logoBase64.startsWith('data:image/')
  );

  if (hasLogo) {
    try {
      const fmt = detectImageFormat(institution.logoBase64);
      doc.addImage(institution.logoBase64, fmt, marginX, startY, 18, 18);
    } catch {
      // Abaikan jika format logo tidak didukung jsPDF
    }
  }

  const textCenterX = hasLogo ? (pageWidth + marginX + 18) / 2 - 4 : pageWidth / 2;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    (institution.subtitle || 'UNIT BIMBINGAN DAN KONSELING').toUpperCase(),
    textCenterX,
    startY + 4,
    { align: 'center' }
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(
    (institution.name || 'LEMBAGA PENDIDIKAN').toUpperCase(),
    textCenterX,
    startY + 10,
    { align: 'center' }
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const addressLine = [
    institution.address,
    institution.city,
    institution.npsn ? `NPSN/Kode: ${institution.npsn}` : '',
  ]
    .filter(Boolean)
    .join(' · ');
  doc.text(addressLine, textCenterX, startY + 15, { align: 'center' });

  const contactLine = [
    institution.phone ? `Telp: ${institution.phone}` : '',
    institution.email ? `Email: ${institution.email}` : '',
    institution.website ? `Web: ${institution.website}` : '',
  ]
    .filter(Boolean)
    .join('  |  ');
  doc.text(contactLine, textCenterX, startY + 19.5, { align: 'center' });

  const lineY = startY + 23;
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.9);
  doc.line(marginX, lineY, pageWidth - marginX, lineY);
  doc.setLineWidth(0.3);
  doc.line(marginX, lineY + 1.2, pageWidth - marginX, lineY + 1.2);

  return lineY + 6;
}

function drawSignatureBlock(
  doc: jsPDF,
  institution: InstitutionSettings,
  pageWidth: number,
  pageHeight: number,
  marginX: number,
  currentY: number
): void {
  const requiredHeight = 36;
  let sigY = currentY + 8;

  if (sigY + requiredHeight > pageHeight - 12) {
    doc.addPage();
    sigY = 20;
  }

  const blockX = pageWidth - marginX - 72;
  const city = institution.city || 'Indonesia';
  const todayStr = formatIndonesianDate(new Date());

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text(`${city}, ${todayStr}`, blockX, sigY);
  doc.text('Kepala Lembaga / Koordinator BK,', blockX, sigY + 5);

  doc.setFont('helvetica', 'bold');
  doc.text(institution.principalName || 'Koordinator BK', blockX, sigY + 24);

  const nameWidth = doc.getTextWidth(institution.principalName || 'Koordinator BK');
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.3);
  doc.line(blockX, sigY + 25, blockX + Math.max(nameWidth, 45), sigY + 25);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`NIP. ${institution.principalNip || '-'}`, blockX, sigY + 29.5);
}

export function exportIndividualStudentPdf(
  student: StudentRecord,
  institution: InstitutionSettings
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 14;

  let cursorY = drawKopSurat(doc, institution, pageWidth, marginX);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.setTextColor(49, 46, 129);
  doc.text('LAPORAN HASIL ASESMEN BAKAT DAN MINAT (ABM)', pageWidth / 2, cursorY + 2, {
    align: 'center',
  });
  cursorY += 7;

  // Identitas Lengkap Siswa
  autoTable(doc, {
    startY: cursorY,
    margin: { left: marginX, right: marginX },
    theme: 'grid',
    styles: {
      fontSize: 8.2,
      cellPadding: 2,
      textColor: [30, 41, 59],
      lineColor: [203, 213, 225],
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 34, fillColor: [248, 250, 252] },
      1: { cellWidth: 57 },
      2: { fontStyle: 'bold', cellWidth: 34, fillColor: [248, 250, 252] },
      3: { cellWidth: 57 },
    },
    body: [
      ['Nama Lengkap', student.fullName, 'Kelas / Jurusan', student.classMajor],
      [
        'Tempat, Tgl Lahir',
        `${student.birthPlace}, ${formatIndonesianDate(student.birthDate)}`,
        'Asal Sekolah',
        student.schoolOrigin,
      ],
      ['No. HP Siswa', student.studentPhone, 'No. HP Ortu/Wali', student.parentPhone],
      ['Pilihan Jurusan 1', student.majorChoice1, 'Pilihan Jurusan 2', student.majorChoice2],
      [
        'Alamat',
        student.address,
        'Tanggal Selesai',
        student.completedAt ? formatIndonesianDate(student.completedAt) : 'Belum selesai',
      ],
    ],
  });

  cursorY = getLastAutoTableY(doc) + 4;

  // Pengantar resmi ABM
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.6);
  doc.setTextColor(71, 85, 105);
  const preambleLines = doc.splitTextToSize(ASSESSMENT_PREAMBLE, pageWidth - marginX * 2);
  doc.text(preambleLines, marginX, cursorY + 2);
  cursorY += preambleLines.length * 3.4 + 4;

  // Bagian 1: Tabel Skor & Interpretasi 7 Bakat
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('I. HASIL ASESMEN BAKAT (7 DIMENSI KOGNITIF)', marginX, cursorY);
  cursorY += 2.5;

  const aptitudeRows = APTITUDE_DIMENSIONS.map((dim, idx) => {
    const score = student.aptitudeScores?.[dim.key] ?? 0;
    const category = getAptitudeCategory(score);
    return [
      String(idx + 1),
      `${dim.name}\n(${dim.code})`,
      `${score}`,
      category.toUpperCase(),
      dim.interpretations[category],
    ];
  });

  autoTable(doc, {
    startY: cursorY,
    margin: { left: marginX, right: marginX },
    head: [['No', 'Aspek Bakat', 'Skor', 'Kategori', 'Interpretasi Hasil']],
    body: aptitudeRows,
    theme: 'striped',
    headStyles: {
      fillColor: [55, 48, 163],
      textColor: [255, 255, 255],
      fontSize: 8.2,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [30, 41, 59],
      valign: 'top',
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 34, fontStyle: 'bold' },
      2: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
      3: { cellWidth: 19, halign: 'center', fontStyle: 'bold' },
      4: { cellWidth: 'auto' },
    },
    didParseCell: (hookData) => {
      if (hookData.section === 'body' && hookData.column.index === 3) {
        const val = String(hookData.cell.raw);
        if (val === 'TINGGI') hookData.cell.styles.textColor = [5, 150, 105];
        else if (val === 'SEDANG') hookData.cell.styles.textColor = [55, 48, 163];
        else hookData.cell.styles.textColor = [180, 83, 9];
      }
    },
  });

  // Bagian 2: Hasil Asesmen Minat (Halaman Baru agar rapi seperti BP3 Page 2)
  doc.addPage();
  cursorY = 16;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('II. HASIL ASESMEN MINAT (18 ASPEK KARIER)', marginX, cursorY);
  cursorY += 3;

  const interestRows = INTEREST_DIMENSIONS.map((dim, idx) => {
    const score = student.interestScores?.[dim.key] ?? 0;
    return [
      String(idx + 1),
      `${dim.name}\n(${dim.englishName})`,
      dim.interestType,
      `${score}`,
      score > 50 ? 'Dominan (>50)' : 'Pendukung',
      `${dim.shortDesc}\nContoh karier: ${dim.careers.join(', ')}`,
    ];
  });

  autoTable(doc, {
    startY: cursorY,
    margin: { left: marginX, right: marginX },
    head: [['No', 'Aspek Minat', 'Tipe Minat', 'Skor', 'Status', 'Deskripsi & Contoh Karier']],
    body: interestRows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 7.2,
      cellPadding: 1.8,
      textColor: [30, 41, 59],
      valign: 'top',
      lineColor: [203, 213, 225],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 29, fontStyle: 'bold' },
      2: { cellWidth: 23, fontStyle: 'bold' },
      3: { cellWidth: 11, halign: 'center', fontStyle: 'bold' },
      4: { cellWidth: 23, halign: 'center' },
      5: { cellWidth: 'auto' },
    },
    didParseCell: (hookData) => {
      if (hookData.section === 'body' && hookData.column.index === 2) {
        const val = String(hookData.cell.raw);
        if (val === 'Minat Dasar') hookData.cell.styles.textColor = [55, 48, 163];
        else if (val === 'Minat Metodis') hookData.cell.styles.textColor = [180, 83, 9];
        else hookData.cell.styles.textColor = [5, 150, 105];
      }
      if (hookData.section === 'body' && hookData.column.index === 4) {
        const val = String(hookData.cell.raw);
        if (val.includes('Dominan')) {
          hookData.cell.styles.textColor = [5, 150, 105];
          hookData.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  cursorY = getLastAutoTableY(doc) + 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.6);
  doc.setTextColor(71, 85, 105);
  const ruleLines = doc.splitTextToSize(
    `Catatan Klasifikasi: Minat Dasar (unik & menetap) · Minat Metodis (terarah & memerlukan keahlian sistematis) · Minat Praktis (keterampilan teknis langsung). ${DOMINANT_INTEREST_RULE_NOTE}`,
    pageWidth - marginX * 2
  );
  doc.text(ruleLines, marginX, cursorY + 2);

  // Bagian 3: Matriks Kesesuaian Bakat dan Minat (18x7) & Evaluasi Jurusan
  doc.addPage();
  cursorY = 16;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('III. MATRIKS KESESUAIAN BAKAT DAN MINAT (18 × 7)', marginX, cursorY);
  cursorY += 3;

  const matrixHeader = [
    'No',
    'Aspek Minat',
    'Skor',
    ...APTITUDE_DIMENSIONS.map(
      (a) => `${a.name.replace('Kemampuan ', '')}\n(${student.aptitudeScores?.[a.key] ?? 0})`
    ),
  ];

  type MatrixCellState = 'na' | 'matched_strong' | 'matched_adequate' | 'unmet_aptitude' | 'non_dominant';

  const getMatrixCellState = (rowIndex: number, aptIndex: number): MatrixCellState => {
    const key = MATRIX_ROW_ORDER[rowIndex];
    const dim = INTEREST_DIMENSIONS.find((d) => d.key === key);
    const apt = APTITUDE_DIMENSIONS[aptIndex];
    if (!dim || !apt || !dim.supportingAptitudes.includes(apt.key)) {
      return 'na';
    }
    const interestScore = student.interestScores?.[key] ?? 0;
    const aptScore = student.aptitudeScores?.[apt.key] ?? 0;
    if (interestScore <= 50) {
      return 'non_dominant';
    }
    if (aptScore >= 70) {
      return 'matched_strong';
    }
    if (aptScore >= 40) {
      return 'matched_adequate';
    }
    return 'unmet_aptitude';
  };

  const matrixBody = MATRIX_ROW_ORDER.map((key, idx) => {
    const dim = INTEREST_DIMENSIONS.find((d) => d.key === key)!;
    const score = student.interestScores?.[key] ?? 0;
    return [
      String(idx + 1),
      `${dim.name} (${dim.englishName})`,
      String(score),
      ...APTITUDE_DIMENSIONS.map((_, aptIdx) => {
        const state = getMatrixCellState(idx, aptIdx);
        return state === 'na' ? '-' : '';
      }),
    ];
  });

  autoTable(doc, {
    startY: cursorY,
    margin: { left: marginX, right: marginX },
    head: [matrixHeader],
    body: matrixBody,
    theme: 'grid',
    headStyles: {
      fillColor: [49, 46, 129],
      textColor: [255, 255, 255],
      fontSize: 7.3,
      fontStyle: 'bold',
      halign: 'center',
    },
    styles: {
      fontSize: 7.2,
      cellPadding: 1.6,
      textColor: [30, 41, 59],
      halign: 'center',
      valign: 'middle',
      lineColor: [203, 213, 225],
    },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 50, halign: 'left', fontStyle: 'bold' },
      2: { cellWidth: 11, fontStyle: 'bold' },
    },
    didParseCell: (hookData) => {
      if (hookData.section === 'body') {
        const rowScore = Number(hookData.row.cells[2]?.raw ?? 0);
        if (rowScore > 50) {
          hookData.cell.styles.fillColor = [236, 253, 245];
        }
        if (hookData.column.index >= 3) {
          const state = getMatrixCellState(hookData.row.index, hookData.column.index - 3);
          if (state === 'na') {
            hookData.cell.styles.textColor = [148, 163, 184];
          }
        }
      }
    },
    didDrawCell: (hookData) => {
      if (hookData.section === 'body' && hookData.column.index >= 3) {
        const state = getMatrixCellState(hookData.row.index, hookData.column.index - 3);
        const cx = hookData.cell.x + hookData.cell.width / 2;
        const cy = hookData.cell.y + hookData.cell.height / 2;

        if (state === 'matched_strong' || state === 'matched_adequate') {
          doc.setDrawColor(state === 'matched_strong' ? 4 : 5, state === 'matched_strong' ? 120 : 150, state === 'matched_strong' ? 87 : 105);
          doc.setLineWidth(state === 'matched_strong' ? 0.65 : 0.5);
          doc.line(cx - 1.4, cy + 0.05, cx - 0.35, cy + 1.15);
          doc.line(cx - 0.35, cy + 1.15, cx + 1.65, cy - 1.15);
        } else if (state === 'unmet_aptitude') {
          doc.setDrawColor(217, 119, 6);
          doc.setLineWidth(0.4);
          doc.line(cx - 0.9, cy - 0.9, cx + 0.9, cy + 0.9);
          doc.line(cx - 0.9, cy + 0.9, cx + 0.9, cy - 0.9);
        } else if (state === 'non_dominant') {
          doc.setDrawColor(148, 163, 184);
          doc.setLineWidth(0.3);
          doc.circle(cx, cy, 0.85, 'S');
        }
      }
    },
  });

  // Legenda simbol matriks di PDF
  cursorY = getLastAutoTableY(doc) + 4;
  doc.setFontSize(7.3);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  let lx = marginX;
  const ly = cursorY;
  // Simbol Centang
  doc.setDrawColor(5, 150, 105);
  doc.setLineWidth(0.55);
  doc.line(lx, ly - 0.7, lx + 0.9, ly + 0.3);
  doc.line(lx + 0.9, ly + 0.3, lx + 2.6, ly - 1.7);
  doc.text(': Sesuai Profil Siswa (Minat >50 & Bakat >=40)', lx + 4, ly);
  lx += 63;

  // Simbol X
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.4);
  doc.line(lx, ly - 1.4, lx + 1.6, ly + 0.2);
  doc.line(lx, ly + 0.2, lx + 1.6, ly - 1.4);
  doc.text(': Bakat Prasyarat Perlu Penguatan (<40)', lx + 3.5, ly);
  lx += 57;

  // Simbol Lingkaran
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.3);
  doc.circle(lx + 0.8, ly - 0.6, 0.85, 'S');
  doc.text(': Referensi Umum (Minat <=50)   |   - : Tidak Dipersyaratkan', lx + 3.2, ly);

  cursorY += 6;
  if (cursorY > pageHeight - 70) {
    doc.addPage();
    cursorY = 18;
  }

  // Evaluasi Pilihan Jurusan 1 & 2
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('IV. EVALUASI KESELARASAN PILIHAN JURUSAN & REKOMENDASI', marginX, cursorY);
  cursorY += 2.5;

  const align = student.majorAlignment;
  const evalRows = [
    [
      'Pilihan Jurusan 1',
      align?.choice1?.majorName || student.majorChoice1,
      `${align?.choice1?.alignmentScore ?? 0}%`,
      align?.choice1?.status || '-',
      align?.choice1?.notes || '-',
    ],
    [
      'Pilihan Jurusan 2',
      align?.choice2?.majorName || student.majorChoice2,
      `${align?.choice2?.alignmentScore ?? 0}%`,
      align?.choice2?.status || '-',
      align?.choice2?.notes || '-',
    ],
    [
      'Rumpun Rekomendasi',
      (align?.recommendedClusters || []).join(' · ') || '-',
      '-',
      'Rekomendasi Sistem',
      'Rumpun program studi dengan sinergi bakat dan minat tertinggi berdasarkan profil asesmen.',
    ],
  ];

  autoTable(doc, {
    startY: cursorY,
    margin: { left: marginX, right: marginX },
    head: [['Kategori', 'Program Studi', 'Skor', 'Keselarasan', 'Analisis & Catatan Konseling']],
    body: evalRows,
    theme: 'grid',
    headStyles: {
      fillColor: [5, 150, 105],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 7.7,
      cellPadding: 2.1,
      textColor: [30, 41, 59],
      valign: 'top',
    },
    columnStyles: {
      0: { cellWidth: 28, fontStyle: 'bold' },
      1: { cellWidth: 36, fontStyle: 'bold' },
      2: { cellWidth: 12, halign: 'center' },
      3: { cellWidth: 25, halign: 'center', fontStyle: 'bold' },
      4: { cellWidth: 'auto' },
    },
  });

  cursorY = getLastAutoTableY(doc) + 6;
  if (cursorY > pageHeight - 75) {
    doc.addPage();
    cursorY = 18;
  }

  // Petunjuk Cara Membaca Laporan & Saran Tindak Lanjut
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('V. PETUNJUK CARA MEMBACA LAPORAN & SARAN TINDAK LANJUT', marginX, cursorY);
  cursorY += 3;

  const sanitizePdfText = (txt: string) =>
    txt.replace(/≥/g, '>=').replace(/≤/g, '<=').replace(/–/g, '-');

  const readingGuideRows = [
    [
      '1. Membaca Hasil Tes Bakat (7 Dimensi)',
      (PEDOMAN_PEMAHAMAN.bakat[1]?.items ?? [])
        .map((item) => `- ${sanitizePdfText(item)}`)
        .join('\n'),
    ],
    [
      '2. Membaca Hasil Tes Minat (18 Aspek)',
      `- Prioritas Minat Dominan: Fokuskan pada Minat Metodis & Minat Praktis dengan skor > 50. Jika belum ada yang > 50, jadikan Minat Dasar (> 50) sebagai acuan utama.\n- Skor > 50: Menunjukkan aktivitas yang sangat diminati dan potensial menjadi arah jurusan/karier.\n- Skor <= 50: Aktivitas kurang diminati sehingga membantu menyaring bidang yang kurang cocok.`,
    ],
    [
      '3. Membaca Matriks Kesesuaian (18 x 7)',
      `- Baris berwarna hijau menandai aspek minat dominan siswa (skor > 50).\n- Centang Hijau: Minat dominan (> 50) sudah didukung oleh bakat kognitif memadai (>= 40 / Sedang-Tinggi).\n- Silang Oranye (x): Minat tinggi (> 50), namun skor bakat prasyarat masih < 40 (perlu penguatan terarah).\n- Lingkaran (o): Aspek minat belum dominan (<= 50) pada profil siswa (referensi matriks umum).\n- Tanda (-): Aspek bakat tidak menjadi prasyarat utama pada aspek minat tersebut.`,
    ],
    [
      '4. Evaluasi Pilihan Jurusan & Saran Konseling',
      PEDOMAN_PEMAHAMAN.saran.map((s, idx) => `${idx + 1}. ${sanitizePdfText(s)}`).join('\n'),
    ],
  ];

  autoTable(doc, {
    startY: cursorY,
    margin: { left: marginX, right: marginX },
    head: [['Panduan Bagian Laporan', 'Cara Memahami & Tindak Lanjut']],
    body: readingGuideRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 7.4,
      cellPadding: 2.2,
      textColor: [51, 65, 85],
      valign: 'top',
      lineColor: [203, 213, 225],
    },
    columnStyles: {
      0: { cellWidth: 46, fontStyle: 'bold', textColor: [30, 41, 59], fillColor: [248, 250, 252] },
      1: { cellWidth: 'auto' },
    },
  });

  cursorY = getLastAutoTableY(doc) + 4;
  drawSignatureBlock(doc, institution, pageWidth, pageHeight, marginX, cursorY);

  const safeFileName = student.fullName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
  doc.save(`Laporan_ABM_${safeFileName || student.username}.pdf`);
}

export function exportRecapStudentsPdf(
  students: StudentRecord[],
  institution: InstitutionSettings
): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 12;

  let cursorY = drawKopSurat(doc, institution, pageWidth, marginX);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(49, 46, 129);
  doc.text('REKAPITULASI HASIL ASESMEN BAKAT DAN MINAT PESERTA DIDIK', pageWidth / 2, cursorY + 1, {
    align: 'center',
  });
  cursorY += 5.5;

  const completedCount = students.filter((s) => s.testStatus === 'completed').length;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Total Peserta: ${students.length} siswa  ·  Selesai Tes: ${completedCount} siswa  ·  Tanggal Cetak: ${formatIndonesianDate(new Date())}`,
    pageWidth / 2,
    cursorY,
    { align: 'center' }
  );
  cursorY += 4;

  const getInterestName = (key: InterestKey) =>
    INTEREST_DIMENSIONS.find((d) => d.key === key)?.name ?? key;

  const rows = students.map((student, index) => {
    const top3Interests = (Object.entries(student.interestScores || {}) as [InterestKey, number][])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([k, v]) => `${getInterestName(k)} (${v})`)
      .join(', ');

    const statusLabel =
      student.testStatus !== 'completed'
        ? 'Belum Selesai'
        : student.reviewStatus === 'approved'
          ? 'Dirilis'
          : 'Menunggu Review';

    return [
      String(index + 1),
      student.fullName,
      student.classMajor,
      student.schoolOrigin,
      student.testStatus === 'completed' ? String(student.aptitudeScores?.spasial ?? 0) : '-',
      student.testStatus === 'completed' ? String(student.aptitudeScores?.verbal ?? 0) : '-',
      student.testStatus === 'completed' ? String(student.aptitudeScores?.penalaran ?? 0) : '-',
      student.testStatus === 'completed' ? String(student.aptitudeScores?.klerikal ?? 0) : '-',
      student.testStatus === 'completed' ? String(student.aptitudeScores?.mekanik ?? 0) : '-',
      student.testStatus === 'completed' ? String(student.aptitudeScores?.kuantitatif ?? 0) : '-',
      student.testStatus === 'completed' ? String(student.aptitudeScores?.bahasa ?? 0) : '-',
      student.testStatus === 'completed' ? top3Interests : 'Belum ada skor',
      `1. ${student.majorChoice1}\n2. ${student.majorChoice2}`,
      statusLabel,
    ];
  });

  autoTable(doc, {
    startY: cursorY,
    margin: { left: marginX, right: marginX },
    head: [
      [
        'No',
        'Nama Siswa',
        'Kelas',
        'Asal Sekolah',
        'SPA',
        'VER',
        'PEN',
        'KLE',
        'MEK',
        'KUA',
        'BHS',
        '3 Minat Tertinggi',
        'Pilihan Jurusan 1 & 2',
        'Status',
      ],
    ],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: [55, 48, 163],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
    },
    styles: {
      fontSize: 7.3,
      cellPadding: 1.8,
      textColor: [30, 41, 59],
      valign: 'middle',
      lineColor: [203, 213, 225],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 34, fontStyle: 'bold' },
      2: { cellWidth: 18 },
      3: { cellWidth: 30 },
      4: { cellWidth: 9.5, halign: 'center' },
      5: { cellWidth: 9.5, halign: 'center' },
      6: { cellWidth: 9.5, halign: 'center' },
      7: { cellWidth: 9.5, halign: 'center' },
      8: { cellWidth: 9.5, halign: 'center' },
      9: { cellWidth: 9.5, halign: 'center' },
      10: { cellWidth: 9.5, halign: 'center' },
      11: { cellWidth: 48 },
      12: { cellWidth: 46 },
      13: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
    },
    didParseCell: (hookData) => {
      if (hookData.section === 'body' && hookData.column.index === 13) {
        const val = String(hookData.cell.raw);
        if (val === 'Dirilis') hookData.cell.styles.textColor = [5, 150, 105];
        else if (val === 'Menunggu Review') hookData.cell.styles.textColor = [180, 83, 9];
        else hookData.cell.styles.textColor = [100, 116, 139];
      }
    },
  });

  cursorY = getLastAutoTableY(doc);
  drawSignatureBlock(doc, institution, pageWidth, pageHeight, marginX, cursorY);

  doc.save(`Rekapitulasi_ABM_${new Date().toISOString().slice(0, 10)}.pdf`);
}
