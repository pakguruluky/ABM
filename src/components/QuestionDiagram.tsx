import React from 'react';
import { AptitudeQuestion } from '../types/abm';

interface QuestionDiagramProps {
  diagramId: NonNullable<AptitudeQuestion['diagramId']>;
}

export const QuestionDiagram: React.FC<QuestionDiagramProps> = ({ diagramId }) => {
  return (
    <div className="my-4 rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-center">
      {diagramId === 'spasial_cube_1' && (
        <svg viewBox="0 0 320 200" className="w-full max-w-xs h-44 text-slate-800" aria-label="Jaring-jaring kubus A B C D E F">
          {/* Jaring-jaring kubus salib: B atas, A-C-D-E baris tengah, F bawah */}
          <g fill="#ffffff" stroke="#3730a3" strokeWidth="2">
            {/* B */}
            <rect x="95" y="18" width="46" height="46" />
            {/* A */}
            <rect x="49" y="64" width="46" height="46" />
            {/* C (Alas) */}
            <rect x="95" y="64" width="46" height="46" fill="#e0e7ff" />
            {/* D */}
            <rect x="141" y="64" width="46" height="46" />
            {/* E */}
            <rect x="187" y="64" width="46" height="46" />
            {/* F */}
            <rect x="95" y="110" width="46" height="46" />
          </g>
          <g fill="#1e293b" fontSize="15" fontWeight="700" textAnchor="middle" dominantBaseline="central">
            <text x="118" y="41">B</text>
            <text x="72" y="87">A</text>
            <text x="118" y="87" fill="#312e81">C</text>
            <text x="164" y="87">D</text>
            <text x="210" y="87">E</text>
            <text x="118" y="133">F</text>
          </g>
          <text x="160" y="182" fontSize="11" fill="#64748b" textAnchor="middle">
            Keterangan: Sisi C (arsir) berperan sebagai alas kubus
          </text>
        </svg>
      )}

      {diagramId === 'spasial_rotate_2' && (
        <svg viewBox="0 0 320 170" className="w-full max-w-xs h-40" aria-label="Rotasi bentuk L asimetris">
          <rect x="24" y="20" width="120" height="120" rx="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
          <path d="M 64 42 L 82 42 L 82 100 L 116 100 L 116 118 L 64 118 Z" fill="#4338ca" />
          <text x="84" y="156" fontSize="11" fill="#475569" textAnchor="middle">Posisi Awal</text>

          <path d="M 162 80 L 204 80" stroke="#059669" strokeWidth="2.5" markerEnd="url(#arrow)" />
          <path d="M 183 62 A 22 22 0 0 1 200 76" fill="none" stroke="#059669" strokeWidth="2" />
          <text x="183" y="54" fontSize="11" fontWeight="600" fill="#047857" textAnchor="middle">+180° Searah Jarum Jam</text>

          <rect x="220" y="20" width="80" height="120" rx="8" fill="#ffffff" stroke="#cbd5e1" strokeDasharray="4 4" strokeWidth="1.5" />
          <text x="260" y="85" fontSize="22" fontWeight="700" fill="#94a3b8" textAnchor="middle">?</text>
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="#059669" />
            </marker>
          </defs>
        </svg>
      )}

      {diagramId === 'spasial_mirror_3' && (
        <svg viewBox="0 0 320 170" className="w-full max-w-xs h-40" aria-label="Pencerminan jam analog pukul 03.00">
          <circle cx="95" cy="85" r="54" fill="#ffffff" stroke="#334155" strokeWidth="2.5" />
          <circle cx="95" cy="85" r="3" fill="#334155" />
          <text x="95" y="42" fontSize="11" fontWeight="700" fill="#475569" textAnchor="middle">12</text>
          <text x="137" y="89" fontSize="11" fontWeight="700" fill="#475569" textAnchor="middle">3</text>
          <text x="95" y="133" fontSize="11" fontWeight="700" fill="#475569" textAnchor="middle">6</text>
          <text x="53" y="89" fontSize="11" fontWeight="700" fill="#475569" textAnchor="middle">9</text>
          {/* Jarum panjang 12, pendek 3 */}
          <line x1="95" y1="85" x2="95" y2="48" stroke="#4338ca" strokeWidth="3" strokeLinecap="round" />
          <line x1="95" y1="85" x2="124" y2="85" stroke="#0f172a" strokeWidth="4" strokeLinecap="round" />

          {/* Cermin Datar */}
          <line x1="176" y1="22" x2="176" y2="148" stroke="#0284c7" strokeWidth="3" />
          <line x1="181" y1="26" x2="188" y2="33" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="181" y1="46" x2="188" y2="53" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="181" y1="66" x2="188" y2="73" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="181" y1="86" x2="188" y2="93" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="181" y1="106" x2="188" y2="113" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="181" y1="126" x2="188" y2="133" stroke="#94a3b8" strokeWidth="1.5" />
          <text x="176" y="162" fontSize="10" fontWeight="600" fill="#0369a1" textAnchor="middle">Cermin Datar</text>

          {/* Bayangan */}
          <circle cx="255" cy="85" r="54" fill="#f8fafc" stroke="#94a3b8" strokeDasharray="5 4" strokeWidth="2" />
          <text x="255" y="92" fontSize="22" fontWeight="700" fill="#94a3b8" textAnchor="middle">?</text>
        </svg>
      )}

      {diagramId === 'spasial_blocks_4' && (
        <svg viewBox="0 0 320 185" className="w-full max-w-xs h-44" aria-label="Susunan kubus satuan tiga lapis">
          {/* Lapisan Bawah 3x2 + Lapis 2 (2x2) + Lapis 3 (1) dalam proyeksi isometrik sederhana */}
          <g stroke="#1e293b" strokeWidth="1.4" strokeLinejoin="round">
            {/* Base back-left (col 0, row 0) height 3 */}
            <polygon points="90,52 118,38 146,52 118,66" fill="#e0e7ff" />
            <polygon points="90,52 118,66 118,128 90,114" fill="#c7d2fe" />
            <polygon points="118,66 146,52 146,114 118,128" fill="#818cf8" />

            {/* Back-mid (col 1, row 0) height 2 */}
            <polygon points="146,52 174,66 146,80 118,66" fill="#f1f5f9" />
            <polygon points="146,80 174,66 174,108 146,122" fill="#94a3b8" />

            {/* Back-right (col 2, row 0) height 1 */}
            <polygon points="174,87 202,73 230,87 202,101" fill="#f8fafc" />
            <polygon points="174,87 202,101 202,122 174,108" fill="#cbd5e1" />
            <polygon points="202,101 230,87 230,108 202,122" fill="#94a3b8" />

            {/* Front-left (col 0, row 1) height 2 */}
            <polygon points="62,66 90,52 118,66 90,80" fill="#f1f5f9" />
            <polygon points="62,66 90,80 90,122 62,108" fill="#cbd5e1" />
            <polygon points="90,80 118,66 118,108 90,122" fill="#94a3b8" />

            {/* Front-mid (col 1, row 1) height 2 */}
            <polygon points="90,80 118,66 146,80 118,94" fill="#f1f5f9" />
            <polygon points="90,80 118,94 118,136 90,122" fill="#cbd5e1" />
            <polygon points="118,94 146,80 146,122 118,136" fill="#94a3b8" />

            {/* Front-right (col 2, row 1) height 1 */}
            <polygon points="146,101 174,87 202,101 174,115" fill="#f8fafc" />
            <polygon points="146,101 174,115 174,136 146,122" fill="#cbd5e1" />
            <polygon points="174,115 202,101 202,122 174,136" fill="#94a3b8" />
          </g>
          <text x="160" y="168" fontSize="11" fill="#475569" textAnchor="middle">
            Alas 3×2 penuh · Lapis ke-2 (2×2) · Lapis ke-3 (1 kubus)
          </text>
        </svg>
      )}

      {diagramId === 'spasial_fold_5' && (
        <svg viewBox="0 0 320 155" className="w-full max-w-xs h-36" aria-label="Lipatan kertas persegi dengan potongan segitiga di pusat">
          {/* Langkah 1 */}
          <rect x="18" y="25" width="76" height="76" fill="#ffffff" stroke="#334155" strokeWidth="1.8" />
          <line x1="56" y1="25" x2="56" y2="101" stroke="#4338ca" strokeDasharray="3 3" strokeWidth="1.5" />
          <line x1="18" y1="63" x2="94" y2="63" stroke="#4338ca" strokeDasharray="3 3" strokeWidth="1.5" />
          <text x="56" y="120" fontSize="10" fill="#475569" textAnchor="middle">1. Kertas Utuh</text>

          {/* Langkah 2 */}
          <rect x="122" y="25" width="76" height="76" fill="#e2e8f0" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth="1" />
          <rect x="160" y="25" width="38" height="38" fill="#ffffff" stroke="#334155" strokeWidth="1.8" />
          <polygon points="160,63 176,63 160,47" fill="#059669" />
          <text x="160" y="120" fontSize="10" fill="#475569" textAnchor="middle">2. Dilipat 2× + Potong Sudut Pusat</text>

          {/* Langkah 3 */}
          <rect x="226" y="25" width="76" height="76" fill="#ffffff" stroke="#cbd5e1" strokeDasharray="4 3" strokeWidth="1.5" />
          <text x="264" y="69" fontSize="20" fontWeight="700" fill="#94a3b8" textAnchor="middle">?</text>
          <text x="264" y="120" fontSize="10" fill="#475569" textAnchor="middle">3. Dibuka Penuh</text>
        </svg>
      )}

      {diagramId === 'mekanik_pulley_1' && (
        <svg viewBox="0 0 320 175" className="w-full max-w-xs h-44" aria-label="Perbandingan sistem katrol A dan katrol B">
          {/* Langit-langit */}
          <line x1="25" y1="18" x2="295" y2="18" stroke="#334155" strokeWidth="3" />
          {/* Sistem A: 1 katrol tetap */}
          <line x1="78" y1="18" x2="78" y2="42" stroke="#475569" strokeWidth="2" />
          <circle cx="78" cy="52" r="14" fill="#ffffff" stroke="#3730a3" strokeWidth="2.5" />
          <line x1="64" y1="52" x2="64" y2="108" stroke="#0f172a" strokeWidth="2" />
          <line x1="92" y1="52" x2="92" y2="115" stroke="#059669" strokeWidth="2" />
          <rect x="49" y="108" width="30" height="24" rx="2" fill="#cbd5e1" stroke="#334155" strokeWidth="1.5" />
          <text x="64" y="124" fontSize="9" fontWeight="700" fill="#0f172a" textAnchor="middle">100kg</text>
          <text x="78" y="156" fontSize="11" fontWeight="700" fill="#1e293b" textAnchor="middle">Sistem A (Katrol Tetap)</text>

          {/* Sistem B: Katrol tetap + katrol bebas */}
          <line x1="215" y1="18" x2="215" y2="42" stroke="#475569" strokeWidth="2" />
          <circle cx="215" cy="52" r="12" fill="#ffffff" stroke="#3730a3" strokeWidth="2.5" />
          <circle cx="240" cy="92" r="12" fill="#e0e7ff" stroke="#3730a3" strokeWidth="2.5" />
          <line x1="240" y1="18" x2="252" y2="92" stroke="#0f172a" strokeWidth="2" />
          <line x1="228" y1="92" x2="227" y2="52" stroke="#0f172a" strokeWidth="2" />
          <line x1="203" y1="52" x2="203" y2="112" stroke="#059669" strokeWidth="2" />
          <rect x="225" y="108" width="30" height="24" rx="2" fill="#cbd5e1" stroke="#334155" strokeWidth="1.5" />
          <text x="240" y="124" fontSize="9" fontWeight="700" fill="#0f172a" textAnchor="middle">100kg</text>
          <text x="232" y="156" fontSize="11" fontWeight="700" fill="#1e293b" textAnchor="middle">Sistem B (Kombinasi)</text>
        </svg>
      )}

      {diagramId === 'mekanik_gear_2' && (
        <svg viewBox="0 0 320 160" className="w-full max-w-xs h-40" aria-label="Tiga roda gigi bersinggungan A B C">
          <circle cx="72" cy="80" r="24" fill="#e0e7ff" stroke="#3730a3" strokeWidth="3" strokeDasharray="6 3" />
          <text x="72" y="84" fontSize="12" fontWeight="700" fill="#1e1b4b" textAnchor="middle">A (20)</text>
          <path d="M 60 48 A 30 30 0 0 1 88 50" fill="none" stroke="#059669" strokeWidth="2.2" />
          <polygon points="88,46 93,53 84,53" fill="#059669" />

          <circle cx="136" cy="80" r="32" fill="#f1f5f9" stroke="#475569" strokeWidth="3" strokeDasharray="6 3" />
          <text x="136" y="84" fontSize="12" fontWeight="700" fill="#334155" textAnchor="middle">B (30)</text>

          <circle cx="218" cy="80" r="42" fill="#ecfdf5" stroke="#059669" strokeWidth="3" strokeDasharray="6 3" />
          <text x="218" y="84" fontSize="12" fontWeight="700" fill="#065f46" textAnchor="middle">C (40)</text>
          <text x="160" y="146" fontSize="11" fill="#475569" textAnchor="middle">Roda A diputar searah jarum jam</text>
        </svg>
      )}

      {diagramId === 'mekanik_lever_3' && (
        <svg viewBox="0 0 320 155" className="w-full max-w-xs h-36" aria-label="Diagram tuas keseimbangan 60kg dan 30kg">
          {/* Penumpu segitiga */}
          <polygon points="130,122 145,94 160,122" fill="#3730a3" />
          {/* Batang tuas */}
          <line x1="40" y1="92" x2="270" y2="92" stroke="#0f172a" strokeWidth="4" />
          {/* Beban kiri 60kg */}
          <rect x="65" y="64" width="34" height="26" fill="#cbd5e1" stroke="#334155" strokeWidth="1.5" />
          <text x="82" y="81" fontSize="10" fontWeight="700" fill="#0f172a" textAnchor="middle">60 kg</text>
          <text x="114" y="109" fontSize="10" fill="#4338ca" textAnchor="middle">1 m</text>
          {/* Beban kanan 30kg */}
          <rect x="225" y="68" width="30" height="22" fill="#d1fae5" stroke="#059669" strokeWidth="1.5" />
          <text x="240" y="83" fontSize="10" fontWeight="700" fill="#065f46" textAnchor="middle">30 kg</text>
          <text x="195" y="109" fontSize="11" fontWeight="700" fill="#059669" textAnchor="middle">? meter</text>
        </svg>
      )}

      {diagramId === 'mekanik_balance_4' && (
        <svg viewBox="0 0 320 165" className="w-full max-w-xs h-40" aria-label="Perbandingan pegas tunggal dan pegas paralel">
          <line x1="35" y1="20" x2="285" y2="20" stroke="#334155" strokeWidth="3" />
          {/* 1 pegas */}
          <path d="M 85 20 L 85 32 L 77 38 L 93 46 L 77 54 L 93 62 L 77 70 L 85 76 L 85 90" fill="none" stroke="#4338ca" strokeWidth="2.5" />
          <rect x="69" y="90" width="32" height="24" fill="#cbd5e1" stroke="#334155" strokeWidth="1.5" />
          <text x="85" y="106" fontSize="9" fontWeight="700" fill="#0f172a" textAnchor="middle">10 kg</text>
          <text x="85" y="138" fontSize="11" fill="#334155" textAnchor="middle">1 Pegas</text>

          {/* 2 pegas paralel */}
          <path d="M 205 20 L 205 30 L 197 35 L 213 41 L 197 47 L 213 53 L 205 58 L 205 70" fill="none" stroke="#059669" strokeWidth="2.5" />
          <path d="M 245 20 L 245 30 L 237 35 L 253 41 L 237 47 L 253 53 L 245 58 L 245 70" fill="none" stroke="#059669" strokeWidth="2.5" />
          <line x1="195" y1="70" x2="255" y2="70" stroke="#334155" strokeWidth="3" />
          <rect x="209" y="72" width="32" height="24" fill="#d1fae5" stroke="#059669" strokeWidth="1.5" />
          <text x="225" y="88" fontSize="9" fontWeight="700" fill="#065f46" textAnchor="middle">10 kg</text>
          <text x="225" y="138" fontSize="11" fill="#334155" textAnchor="middle">2 Pegas Paralel</text>
        </svg>
      )}

      {diagramId === 'mekanik_water_5' && (
        <svg viewBox="0 0 320 170" className="w-full max-w-xs h-40" aria-label="Tangki air dengan lubang atas tengah dan bawah">
          <rect x="56" y="25" width="76" height="115" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2.5" />
          <rect x="56" y="20" width="76" height="10" fill="#f8fafc" />
          <circle cx="132" cy="50" r="3" fill="#0f172a" />
          <circle cx="132" cy="85" r="3" fill="#0f172a" />
          <circle cx="132" cy="120" r="3" fill="#0f172a" />
          <text x="102" y="53" fontSize="9" fontWeight="600" fill="#0369a1">Atas</text>
          <text x="93" y="88" fontSize="9" fontWeight="600" fill="#0369a1">Tengah</text>
          <text x="95" y="123" fontSize="9" fontWeight="600" fill="#0369a1">Bawah</text>
          <line x1="40" y1="142" x2="280" y2="142" stroke="#334155" strokeWidth="2" />
          <path d="M 135 50 Q 175 60 190 142" fill="none" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth="1.5" />
          <path d="M 135 85 Q 195 95 225 142" fill="none" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth="1.5" />
          <path d="M 135 120 Q 210 125 258 142" fill="none" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth="1.5" />
        </svg>
      )}
    </div>
  );
};
