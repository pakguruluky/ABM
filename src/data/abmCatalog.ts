import {
  AptitudeDimensionMeta,
  AptitudeKey,
  AptitudeQuestion,
  InterestDimensionMeta,
  InterestKey,
  InterestStatement,
  InterestType,
} from '../types/abm';

export const ASSESSMENT_PREAMBLE =
  'Asesmen Bakat dan Minat mengukur potensi individu pada 7 aspek yang meliputi kemampuan verbal, kuantitatif, penalaran, spasial, mekanik, penggunaan bahasa, dan klerikal, serta minat pada aktivitas atau pekerjaan tertentu. Hasil tes ini hendaknya dipahami sebagai sarana pendukung untuk mengetahui bakat dan minat siswa, namun bukan merupakan sesuatu yang mutlak. Hasil tes ini sebaiknya dikonsultasikan dengan guru Bimbingan dan Konseling di sekolah.';

export const INTEREST_TYPE_META: Record<
  InterestType,
  { title: InterestType; description: string; badgeClass: string; hex: string }
> = {
  'Minat Dasar': {
    title: 'Minat Dasar',
    description:
      'Ketertarikan yang bersifat unik dan relatif menetap yang dimiliki oleh individu terhadap aktivitas/pekerjaan tertentu.',
    badgeClass: 'text-indigo-800 bg-indigo-50 border-indigo-200',
    hex: '#3730a3',
  },
  'Minat Metodis': {
    title: 'Minat Metodis',
    description:
      'Ketertarikan pada berbagai aktivitas/pekerjaan yang terarah dan memerlukan sistematika serta membutuhkan pengetahuan dan keahlian untuk menjalankannya.',
    badgeClass: 'text-amber-800 bg-amber-50 border-amber-200',
    hex: '#d97706',
  },
  'Minat Praktis': {
    title: 'Minat Praktis',
    description:
      'Ketertarikan pada berbagai aktivitas/pekerjaan yang membutuhkan keterampilan dan pengalaman teknis yang bersifat mudah dipelajari atau tanpa pelatihan khusus.',
    badgeClass: 'text-emerald-800 bg-emerald-50 border-emerald-200',
    hex: '#059669',
  },
};

export const DOMINANT_INTEREST_RULE_NOTE =
  'Area minat metodis dan praktis yang dominan adalah dengan skor > 50. Apabila tidak ada skor metodis dan praktis di atas 50, maka area minat yang dominan dapat dilihat dari minat dasar.';

export const PEDOMAN_PEMAHAMAN = {
  bakat: [
    {
      title: '1. Lihat Skor pada Setiap Dimensi Bakat',
      body: 'Awalilah dengan memeriksa skor yang Anda peroleh pada masing-masing dimensi bakat. Dimensi ini menunjukkan area-area di mana Anda memiliki kekuatan khusus atau yang memerlukan pengembangan.',
    },
    {
      title: '2. Pahami Arti Skor Anda',
      items: [
        'Skor Tinggi (≥ 70): Menunjukkan bahwa Anda memiliki kemampuan yang baik atau lebih tinggi dalam area bakat tersebut dibandingkan rata-rata sebaya. Ini adalah kekuatan utama Anda.',
        'Skor Sedang (40–69): Menunjukkan bahwa kemampuan Anda setara dengan teman sebaya. Area ini sudah memadai dan masih dapat terus dikembangkan lebih lanjut.',
        'Skor Rendah (< 40): Menunjukkan bahwa Anda masih memerlukan penguatan pada area tersebut, dan menjadi peluang untuk belajar serta berlatih lebih terarah.',
      ],
    },
  ],
  minat: [
    {
      title: '1. Lihat Skor pada Setiap Dimensi Minat',
      body: 'Identifikasi aktivitas yang paling Anda minati berdasarkan skor yang diperoleh. Skor di atas 50 pada Minat Metodis dan Praktis (atau Minat Dasar sebagai rujukan pendukung) menunjukkan ketertarikan yang menonjol.',
    },
    {
      title: '2. Pahami Arti dari Skor Minat Anda',
      items: [
        'Skor Tinggi (> 50): Menunjukkan bahwa Anda sangat menikmati kegiatan atau subjek terkait. Area ini berpotensi besar menjadi bagian dari jurusan dan karier masa depan Anda.',
        'Skor Rendah (≤ 50): Menunjukkan bahwa Anda cenderung kurang menyukai aktivitas tersebut, sehingga membantu Anda menghindari jalur studi yang kurang sesuai.',
      ],
    },
  ],
  gabungan: [
    {
      title: '1. Cari Keseimbangan Bakat dan Minat',
      body: 'Lihatlah di mana bakat dan minat Anda sejalan. Menemukan titik temu antara kapasitas kognitif dan ketertarikan aktivitas adalah kunci memilih jurusan yang memuaskan dan sukses.',
    },
    {
      title: '2. Gunakan Matriks Kesesuaian Bakat dan Minat',
      body: 'Gunakan tabel matriks 18×7 sebagai referensi untuk melihat keterkaitan antara minat dominan Anda dengan bakat pendukungnya. Contoh: jika memiliki bakat Verbal & Bahasa yang kuat serta minat Fasilitasi Sosial yang tinggi, bidang Komunikasi, Pendidikan, atau Hukum sangat cocok untuk dieksplorasi.',
    },
  ],
  saran: [
    'Diskusikan hasil asesmen Anda dengan Guru BK atau orang tua untuk mendapatkan saran jalur pendidikan lanjutan maupun karier yang selaras dengan kombinasi unik bakat dan minat Anda.',
    'Tinjau kembali mata pelajaran di sekolah di mana Anda secara konsisten memperoleh nilai baik. Keberhasilan berkelanjutan pada mata pelajaran tertentu merupakan indikator kuat bakat alami Anda.',
    'Pertimbangkan pula prestasi kompetisi, lomba, atau proyek karya ilmiah yang pernah Anda ikuti sebagai bukti kecakapan praktis, inovasi, dan kerja tim.',
  ],
};

export const APTITUDE_DIMENSIONS: AptitudeDimensionMeta[] = [
  {
    key: 'spasial',
    code: 'SPA',
    name: 'Kemampuan Spasial',
    shortDesc: 'Visualisasi bentuk 2D/3D, rotasi objek, dan pemahaman relasi ruang.',
    detailDesc:
      'Mengukur kecermatan membayangkan perubahan posisi, lipatan, sudut pandang, serta komposisi geometris dalam ruang tiga dimensi.',
    interpretations: {
      Tinggi:
        'Siswa menguasai pemrosesan informasi spasial secara sangat baik dalam membayangkan, memutar, dan merekonstruksi objek tiga dimensi. Performa siswa sangat optimal untuk aktivitas seperti mengamati peta teknik, menelaah bangun ruang kompleks, membuat sketsa arsitektural, dan merancang desain visual.',
      Sedang:
        'Siswa mampu memahami konsep dasar dari informasi berbentuk gambar dengan mengenali keunikan karakteristiknya melalui pembayangan dan perekaman perubahan bentuk. Secara umum, performa siswa cukup memadai ketika mengamati peta, menelaah bangun ruang dari berbagai perspektif, menentukan titik koordinat, atau membuat sketsa 3 dimensi.',
      Rendah:
        'Siswa masih memerlukan latihan bertahap dalam membayangkan transformasi atau rotasi bangun ruang secara mental. Disarankan memperbanyak latihan visualisasi diagram, sketsa perspektif, atau pemodelan ruang apabila membidik bidang teknik maupun desain.',
    },
  },
  {
    key: 'verbal',
    code: 'VER',
    name: 'Kemampuan Verbal',
    shortDesc: 'Pemahaman kosakata, analogi konsep, dan ketajaman makna kata.',
    detailDesc:
      'Mengukur keluasan perbendaharaan kata, kemampuan menangkap hubungan makna antar-istilah, serta pemahaman wacana konseptual.',
    interpretations: {
      Tinggi:
        'Siswa memiliki penguasaan kosakata yang sangat luas serta ketajaman dalam memahami analogi dan hubungan makna konseptual yang kompleks. Performa siswa sangat unggul dalam menganalisis wacana akademik, menyusun argumentasi hukum/sosial, serta mengomunikasikan gagasan secara efektif.',
      Sedang:
        'Siswa mampu memahami konsep-konsep berbentuk verbal atau teks pada situasi umum, konkret, dan sederhana. Performa siswa sudah cukup memadai dalam menghadapi aktivitas yang berhubungan dengan informasi verbal, misalnya memahami konsep gagasan, menjabarkannya secara operasional, serta mengategorikan kata berdasarkan persamaan dan perbedaannya.',
      Rendah:
        'Siswa masih perlu memperluas perbendaharaan kosakata konseptual dan melatih pemahaman bacaan analitis. Membiasakan diri membaca artikel ilmiah populer, merangkum teks, serta berlatih padanan makna kata akan membantu peningkatan kemampuan verbal.',
    },
  },
  {
    key: 'penalaran',
    code: 'PEN',
    name: 'Kemampuan Penalaran',
    shortDesc: 'Logika deduktif-induktif, pengenalan pola, dan penarikan kesimpulan.',
    detailDesc:
      'Mengukur kemampuan berpikir sistematis untuk memecahkan masalah baru, menguji validitas silogisme, dan menemukan aturan pola.',
    interpretations: {
      Tinggi:
        'Siswa memiliki kemampuan berpikir logis, analitis, dan sistematis yang menonjol dalam memecahkan persoalan abstrak maupun pola berjenjang. Performa siswa sangat optimal dalam mengambil keputusan berbasis bukti, riset ilmiah, pemrograman komputasi, serta analisis kasus kompleks.',
      Sedang:
        'Siswa mampu menemukan prinsip yang melandasi hubungan antar konsep atau informasi yang bersifat sederhana dan menerapkannya untuk mengatasi masalah lain. Performa siswa cukup memadai dalam berpikir logis, mengambil keputusan yang tepat, serta membuat pertimbangan menggunakan informasi yang terstruktur.',
      Rendah:
        'Siswa perlu membiasakan diri memecahkan masalah secara bertahap dengan memetakan hubungan sebab-akibat. Latihan soal silogisme, deret pola, dan studi kasus terstruktur sangat dianjurkan sebelum memasuki jurusan berbasis analisis tinggi.',
    },
  },
  {
    key: 'klerikal',
    code: 'KLE',
    name: 'Kemampuan Klerikal',
    shortDesc: 'Ketelitian persepsi, kecepatan verifikasi kode, angka, dan arsip.',
    detailDesc:
      'Mengukur ketepatan dan kecepatan dalam membandingkan deretan simbol, kode administratif, serta mendeteksi ketidaksesuaian detail.',
    interpretations: {
      Tinggi:
        'Siswa memiliki ketelitian persepsi, kecepatan verifikasi simbol, dan akurasi kerja administratif yang sangat tinggi. Performa siswa sangat optimal pada tugas-tugas yang menuntut ketepatan detail tinggi seperti akuntansi, audit keuangan, farmasi, manajemen basis data, dan kendali mutu.',
      Sedang:
        'Siswa mampu menyelesaikan tugas-tugas sederhana dan berulang yang membutuhkan kecepatan, ketelitian, konsistensi, dan daya ingat. Performa siswa cukup terampil ketika melakukan tugas terstruktur seperti menyortir data, memeriksa dokumen, dan mengompilasi arsip secara teliti.',
      Rendah:
        'Siswa cenderung lebih nyaman pada tugas konseptual dibanding pengecekan detail kode atau angka berulang di bawah tekanan waktu. Disarankan menerapkan teknik pemeriksaan silang (cross-check) dan daftar periksa saat menangani data presisi.',
    },
  },
  {
    key: 'mekanik',
    code: 'MEK',
    name: 'Kemampuan Mekanik',
    shortDesc: 'Pemahaman prinsip fisika terapan, gaya, katrol, tuas, dan mesin.',
    detailDesc:
      'Mengukur intuisi dan pemahaman praktis terhadap cara kerja peralatan, keseimbangan gaya, transmisi gerak, serta sistem mekanis.',
    interpretations: {
      Tinggi:
        'Siswa menguasai proses penalaran pada prinsip kerja mekanika dasar hingga mampu memahami cara kerja peralatan yang kompleks. Performa siswa sudah optimal ketika dihadapkan pada tugas peralatan seperti mesin atau perkakas, perakitan komponen, bongkar pasang perangkat, serta perancangan teknis yang efisien.',
      Sedang:
        'Siswa memahami prinsip dasar gaya, keseimbangan, dan gerak dalam sistem mekanis sederhana sehari-hari. Kemampuan ini cukup memadai untuk memahami aplikasi teknologi umum dan dapat diperdalam melalui kegiatan praktikum maupun bengkel kerja.',
      Rendah:
        'Siswa cenderung lebih berminat pada bidang konseptual non-fisik (sosial, bahasa, atau administrasi). Apabila tertarik pada jurusan keteknikan, diperlukan penguatan pemahaman fisika terapan dan praktik langsung cara kerja komponen mesin.',
    },
  },
  {
    key: 'kuantitatif',
    code: 'KUA',
    name: 'Kemampuan Kuantitatif',
    shortDesc: 'Pengolahan angka, proporsi, aljabar praktis, dan analisis numerik.',
    detailDesc:
      'Mengukur kelancaran dalam melakukan kalkulasi matematis, membaca perbandingan rasio, persentase, serta menafsirkan data angka.',
    interpretations: {
      Tinggi:
        'Siswa memiliki kecakapan numerik dan kalkulasi matematis yang sangat kuat dalam mengolah rasio, persamaan, dan interpretasi data angka kompleks. Performa siswa sangat mendukung bidang statistika, aktuaria, teknik, ilmu komputer, ekonomi, dan analisis finansial.',
      Sedang:
        'Siswa mampu menyelesaikan masalah yang melibatkan informasi numerik atau kuantitatif sederhana, namun masih perlu berhati-hati pada soal kontekstual yang lebih kompleks. Performa siswa cukup memadai dalam menggunakan operasi bilangan, mengestimasi, memprediksi, dan menentukan hubungan angka.',
      Rendah:
        'Siswa masih perlu memperkuat fondasi aritmatika praktis, perbandingan rasio, dan aljabar dasar. Latihan pemecahan soal numerik bertahap sangat membantu apabila berencana memilih program studi berbasis hitungan.',
    },
  },
  {
    key: 'bahasa',
    code: 'BHS',
    name: 'Penggunaan Bahasa',
    shortDesc: 'Ketepatan tata bahasa, ejaan baku, kalimat efektif, dan penyuntingan.',
    detailDesc:
      'Mengukur kemampuan menyusun dan menyunting kalimat sesuai kaidah bahasa Indonesia baku (EYD V) agar komunikatif dan bebas ambiguitas.',
    interpretations: {
      Tinggi:
        'Siswa sangat terampil menyusun gagasan tertulis secara baku, jernih, terstruktur, dan komunikatif sesuai kaidah kebahasaan. Performa siswa sangat unggul dalam penulisan laporan ilmiah, penyuntingan naskah, jurnalisme, pendidikan, hukum, dan komunikasi publik.',
      Sedang:
        'Siswa mampu menangkap gagasan dari suatu kalimat atau bacaan serta mengomunikasikannya menggunakan bahasa baku yang cukup baik. Performa siswa cukup memadai dalam mengerjakan tugas terkait teks seperti membuat laporan, menyunting tulisan, dan menyusun karangan terstruktur.',
      Rendah:
        'Siswa perlu membiasakan penyuntingan kalimat efektif dan mempelajari kaidah ejaan baku (EYD V). Latihan menulis esai terstruktur serta menelaah teks resmi akan membantu kesiapan penyusunan karya tulis akademik.',
    },
  },
];

// 18 Aspek Minat disinkronkan 100% dengan klasifikasi Minat Dasar / Metodis / Praktis
// dan Matrik Kesesuaian Bakat dan Minat (18x7) dari dokumen BP3 Kemdikbudristek
export const INTEREST_DIMENSIONS: InterestDimensionMeta[] = [
  // MINAT DASAR (8 Aspek)
  {
    key: 'kesenian',
    name: 'Kesenian',
    englishName: 'Artistic',
    interestType: 'Minat Dasar',
    cluster: 'Kreatif & Lapangan',
    shortDesc:
      'Minat untuk mengelola cipta karsa kreatif dalam mengekspresikan diri pada konteks budaya dan estetika.',
    careers: ['Desainer Grafis (DKV)', 'Arsitek', 'Ilustrator', 'Produksi Seni & Pertunjukan'],
    supportingAptitudes: ['spasial', 'bahasa'],
  },
  {
    key: 'menolong',
    name: 'Menolong',
    englishName: 'Helping',
    interestType: 'Minat Dasar',
    cluster: 'Sosial & Layanan',
    shortDesc:
      'Minat untuk membantu orang lain dengan cara melayani, mendampingi, atau memberikan dukungan kesejahteraan.',
    careers: ['Dokter / Tenaga Medis', 'Konseling', 'Pemberdayaan Masyarakat', 'Pekerja Sosial'],
    supportingAptitudes: ['verbal', 'penalaran', 'bahasa'],
  },
  {
    key: 'keteknikan',
    name: 'Keteknikan',
    englishName: 'Mechanical',
    interestType: 'Minat Dasar',
    cluster: 'Sains & Teknik',
    shortDesc:
      'Minat terhadap aktivitas yang melibatkan perangkat teknis seperti merancang, memasang, merakit, dan memelihara mesin atau elektronika.',
    careers: ['Insinyur Rekayasa', 'Teknik Sipil / Mesin', 'Konstruksi & Fabrikasi', 'Elektro'],
    supportingAptitudes: ['spasial', 'penalaran', 'mekanik'],
  },
  {
    key: 'pengelolaan_data',
    name: 'Pengelolaan Data',
    englishName: 'Data Processing',
    interestType: 'Minat Dasar',
    cluster: 'Bisnis & Data',
    shortDesc:
      'Minat pada pengelolaan informasi baik angka, teks, gambar, maupun data statistik untuk membaca tren dan memprediksi kejadian.',
    careers: ['Pemrograman & Sains Data', 'Database Administrator', 'Statistisi', 'Aktuaris'],
    supportingAptitudes: ['penalaran', 'kuantitatif'],
  },
  {
    key: 'fasilitasi_sosial',
    name: 'Fasilitasi Sosial',
    englishName: 'Social Facilitating',
    interestType: 'Minat Dasar',
    cluster: 'Sosial & Layanan',
    shortDesc:
      'Minat terhadap aktivitas yang banyak melibatkan orang lain secara individual maupun kelompok melalui interaksi sosial.',
    careers: ['Hubungan Masyarakat', 'Pendidikan & Pelatihan', 'Guru / Dosen', 'Pemasaran Jasa'],
    supportingAptitudes: ['verbal', 'bahasa'],
  },
  {
    key: 'pengelolaan',
    name: 'Pengelolaan',
    englishName: 'Managing',
    interestType: 'Minat Dasar',
    cluster: 'Bisnis & Data',
    shortDesc:
      'Minat terhadap aktivitas dalam mengelola sebuah usaha atau organisasi, merencanakan, mengorganisasikan, dan memimpin tim.',
    careers: ['Manajer Proyek', 'Eksekutif Bisnis', 'Wirausaha', 'Kepala Operasional'],
    supportingAptitudes: ['penalaran', 'klerikal'],
  },
  {
    key: 'kerja_lapangan',
    name: 'Kerja Lapangan',
    englishName: 'Natural / Outdoor',
    interestType: 'Minat Dasar',
    cluster: 'Kreatif & Lapangan',
    shortDesc:
      'Minat untuk bekerja di luar ruangan atau alam bebas seperti hutan, lahan pertanian, atau laut untuk eksplorasi dan penelitian.',
    careers: ['Konservasi Alam', 'Ahli Geologi & Pertambangan', 'Agronomi', 'Pengendalian Lingkungan'],
    supportingAptitudes: ['penalaran', 'klerikal'],
  },
  {
    key: 'detail_bisnis',
    name: 'Detail Bisnis',
    englishName: 'Business Detail',
    interestType: 'Minat Dasar',
    cluster: 'Bisnis & Data',
    shortDesc:
      'Minat terhadap aktivitas bisnis secara teknis dan detail seperti penganggaran, pembukuan transaksi, dan kontrol arus kas.',
    careers: ['Akuntan Publik', 'Auditor Internal', 'Perencanaan Anggaran', 'Administrasi Keuangan'],
    supportingAptitudes: ['klerikal', 'bahasa'],
  },

  // MINAT METODIS (5 Aspek)
  {
    key: 'kerja_ilmiah',
    name: 'Kerja Ilmiah',
    englishName: 'Science',
    interestType: 'Minat Metodis',
    cluster: 'Sains & Teknik',
    shortDesc:
      'Minat untuk melakukan aktivitas ilmiah seperti menelaah permasalahan, mempelajari teori, eksperimentasi, dan menganalisis data riset.',
    careers: ['Peneliti Sains / R&D', 'Farmakolog', 'Bioteknologi', 'Pendidikan & Asesmen'],
    supportingAptitudes: ['spasial', 'verbal', 'penalaran', 'mekanik', 'kuantitatif'],
  },
  {
    key: 'sains_sosial',
    name: 'Sains Sosial',
    englishName: 'Social Science',
    interestType: 'Minat Metodis',
    cluster: 'Sosial & Layanan',
    shortDesc:
      'Minat untuk terlibat dalam kajian perilaku manusia, penanganan masalah sosial, serta peningkatan kesejahteraan psikologis dan kemasyarakatan.',
    careers: ['Psikologi & Konseling', 'Sosiolog / Antropolog', 'Medis & Psikiatri', 'Kebijakan Publik'],
    supportingAptitudes: ['verbal', 'penalaran', 'bahasa'],
  },
  {
    key: 'analisis_finansial',
    name: 'Analisis Finansial',
    englishName: 'Financial Analysis',
    interestType: 'Minat Metodis',
    cluster: 'Bisnis & Data',
    shortDesc:
      'Minat untuk melakukan pekerjaan dalam urusan analisis keuangan, permodalan, perpajakan, akuntansi, dan konsultasi finansial.',
    careers: ['Analis Keuangan', 'Perpajakan & Akuntansi', 'Bankir Investasi', 'Ekonom'],
    supportingAptitudes: ['penalaran', 'klerikal', 'kuantitatif'],
  },
  {
    key: 'pengaruh',
    name: 'Pengaruh',
    englishName: 'Influence',
    interestType: 'Minat Metodis',
    cluster: 'Sosial & Layanan',
    shortDesc:
      'Minat untuk memimpin, berargumentasi, dan mengarahkan orang lain melalui penguasaan ilmu pengetahuan, komunikasi publik, atau kewenangan.',
    careers: ['Hukum & Advokasi', 'Politik & Diplomasi', 'Jurnalisme Strategis', 'Keamanan & Kebijakan'],
    supportingAptitudes: ['verbal', 'penalaran', 'bahasa'],
  },
  {
    key: 'sistem_bisnis',
    name: 'Sistem Bisnis',
    englishName: 'Business System',
    interestType: 'Minat Metodis',
    cluster: 'Sains & Teknik',
    shortDesc:
      'Minat untuk merancang sistem bisnis secara praktis dan menerapkannya pada berbagai bidang seperti keuangan, operasional, dan teknologi informasi.',
    careers: ['System Analyst', 'Pengembangan Aplikasi', 'Product Manager', 'Teknik Industri'],
    supportingAptitudes: ['penalaran', 'klerikal', 'kuantitatif'],
  },

  // MINAT PRAKTIS (5 Aspek)
  {
    key: 'kerja_manual',
    name: 'Kerja Manual',
    englishName: 'Manual Work',
    interestType: 'Minat Praktis',
    cluster: 'Kreatif & Lapangan',
    shortDesc:
      'Minat terhadap pekerjaan yang membutuhkan ketangkasan keterampilan tangan atau mengoperasikan perangkat teknis secara langsung.',
    careers: ['Konstruksi & Kriya Presisi', 'Transportasi & Operator Alat', 'Restorasi', 'Tata Boga'],
    supportingAptitudes: ['spasial', 'klerikal', 'mekanik'],
  },
  {
    key: 'kendali_kualitas',
    name: 'Kendali Kualitas',
    englishName: 'Quality Control',
    interestType: 'Minat Praktis',
    cluster: 'Sains & Teknik',
    shortDesc:
      'Minat dalam melakukan pengecekan kesesuaian suatu proses atau hasil kerja terhadap standar mutu, inspeksi, dan sertifikasi.',
    careers: ['Quality Assurance (QA)', 'Monitoring & Evaluasi', 'Inspektur Mutu', 'Pengawas Sertifikasi'],
    supportingAptitudes: ['penalaran', 'klerikal'],
  },
  {
    key: 'keteknisian',
    name: 'Keteknisian',
    englishName: 'Construction and Repair',
    interestType: 'Minat Praktis',
    cluster: 'Sains & Teknik',
    shortDesc:
      'Minat dalam melakukan pekerjaan teknis lapangan seperti merakit, merawat, mendiagnosis, dan memperbaiki mesin atau barang elektronik.',
    careers: ['Instalasi & Perbaikan', 'Teknisi Jaringan / Avionik', 'Otomotif', 'Teknisi Medis'],
    supportingAptitudes: ['penalaran', 'mekanik'],
  },
  {
    key: 'pelayanan_pribadi',
    name: 'Pelayanan Pribadi',
    englishName: 'Personal Service',
    interestType: 'Minat Praktis',
    cluster: 'Sosial & Layanan',
    shortDesc:
      'Minat dalam melakukan pelayanan terhadap pribadi maupun publik, seperti melengkapi kebutuhan tamu dan mengakomodasi layanan prima.',
    careers: ['Wisata & Perhotelan', 'Pramugari / Hospitality', 'Kesekretariatan', 'Asistensi Eksekutif'],
    supportingAptitudes: ['verbal', 'penalaran', 'bahasa'],
  },
  {
    key: 'layanan_dasar',
    name: 'Layanan Dasar',
    englishName: 'Basic Service',
    interestType: 'Minat Praktis',
    cluster: 'Bisnis & Data',
    shortDesc:
      'Minat dalam melakukan pelayanan awal atau operasional rutin seperti penyambutan, pemesanan, pencatatan kebutuhan, dan distribusi.',
    careers: ['Administrasi Publik', 'Pusat Layanan (Call Center)', 'Promosi & Pemasaran', 'Distribusi'],
    supportingAptitudes: ['klerikal', 'bahasa'],
  },
];

// Urutan baris resmi sesuai Matrik Kesesuaian Bakat dan Minat (Page 4 PDF BP3)
export const MATRIX_ROW_ORDER = [
  'fasilitasi_sosial',
  'pengelolaan',
  'detail_bisnis',
  'pengelolaan_data',
  'keteknikan',
  'kerja_lapangan',
  'kesenian',
  'menolong',
  'sains_sosial',
  'pengaruh',
  'sistem_bisnis',
  'analisis_finansial',
  'kerja_ilmiah',
  'kendali_kualitas',
  'kerja_manual',
  'pelayanan_pribadi',
  'keteknisian',
  'layanan_dasar',
] as const;

export const APTITUDE_QUESTIONS: AptitudeQuestion[] = [
  // 1. SPASIAL (5 Soal)
  {
    id: 'spa_1',
    dimension: 'spasial',
    diagramId: 'spasial_cube_1',
    prompt:
      'Perhatikan jaring-jaring kubus pada gambar di atas (bertanda A, B, C, D, E, F). Jika sisi C menjadi alas kubus dan dilipat ke atas membentuk kubus tertutup, sisi manakah yang menjadi tutup atas kubus?',
    options: ['Sisi A', 'Sisi E', 'Sisi F', 'Sisi B'],
    correctIndex: 1,
  },
  {
    id: 'spa_2',
    dimension: 'spasial',
    diagramId: 'spasial_rotate_2',
    prompt:
      'Bentuk L asimetris pada gambar diputar searah jarum jam sebesar 90 derajat, lalu diputar lagi searah jarum jam sebesar 90 derajat (total 180 derajat). Manakah deskripsi posisi akhir yang tepat?',
    options: [
      'Kaki panjang vertikal di sisi kanan menghadap ke atas, kaki pendek mengarah ke kiri atas',
      'Kaki panjang horizontal di bagian atas, kaki pendek mengarah ke bawah di kanan',
      'Kaki panjang vertikal di sisi kanan, kaki pendek mengarah ke kiri di bagian atas',
      'Kaki panjang horizontal di bagian bawah, kaki pendek mengarah ke atas di kiri',
    ],
    correctIndex: 2,
  },
  {
    id: 'spa_3',
    dimension: 'spasial',
    diagramId: 'spasial_mirror_3',
    prompt:
      'Sebuah jam dinding analog menunjukkan pukul 03.00 tepat. Jika dilihat melalui cermin datar yang diletakkan tepat di sebelah kanan jam, pukul berapakah yang tampak pada bayangan cermin?',
    options: ['Pukul 06.00', 'Pukul 09.00', 'Pukul 03.00', 'Pukul 12.15'],
    correctIndex: 1,
  },
  {
    id: 'spa_4',
    dimension: 'spasial',
    diagramId: 'spasial_blocks_4',
    prompt:
      'Perhatikan tumpukan balok kubus satuan pada ilustrasi isometrik (alas 3×2 penuh, lapis kedua 2×2 di sudut belakang kiri, lapis ketiga 1 balok di sudut paling belakang kiri). Berapa total jumlah kubus satuan pada susunan tersebut?',
    options: ['9 kubus', '10 kubus', '11 kubus', '12 kubus'],
    correctIndex: 2,
  },
  {
    id: 'spa_5',
    dimension: 'spasial',
    diagramId: 'spasial_fold_5',
    prompt:
      'Selembar kertas persegi dilipat dua dari kiri ke kanan, kemudian dilipat dua lagi dari atas ke bawah. Sebuah lubang berbentuk segitiga dipotong tepat di sudut lipatan bagian tengah kertas. Saat kertas dibuka penuh, berapa banyak lubang segitiga yang terbentuk?',
    options: ['1 lubang di tengah kertas', '2 lubang simetris', '4 lubang terpisah di sudut', '4 lubang membentuk pola belah ketupat di pusat'],
    correctIndex: 0,
  },

  // 2. VERBAL (5 Soal)
  {
    id: 'ver_1',
    dimension: 'verbal',
    prompt: 'TELESKOP : BINTANG = MIKROSKOP : ...',
    options: ['Laboratorium', 'Bakteri', 'Lensa', 'Ilmuwan'],
    correctIndex: 1,
  },
  {
    id: 'ver_2',
    dimension: 'verbal',
    prompt: 'Manakah kata yang memiliki makna PALING BERLAWANAN (antonim) dengan kata "PRAGMATIS"?',
    options: ['Praktis', 'Idealistis', 'Efisien', 'Fungsional'],
    correctIndex: 1,
  },
  {
    id: 'ver_3',
    dimension: 'verbal',
    prompt: 'KOMPONIS : SIMFONI = ARSITEK : ...',
    options: ['Semen', 'Gedung', 'Cetak Biru', 'Kontraktor'],
    correctIndex: 2,
  },
  {
    id: 'ver_4',
    dimension: 'verbal',
    prompt: 'Pilihlah kata yang paling tepat bersinonim dengan "ELABORASI":',
    options: ['Penyederhanaan', 'Penguraian secara cermat dan rinci', 'Penolakan terhadap argumen', 'Penggabungan singkat'],
    correctIndex: 1,
  },
  {
    id: 'ver_5',
    dimension: 'verbal',
    prompt:
      'Dalam kelompok kata berikut: [Induksi, Deduksi, Hipotesis, Observasi, Apresiasi]. Manakah kata yang TIDAK termasuk dalam rumpun proses metode ilmiah?',
    options: ['Induksi', 'Hipotesis', 'Observasi', 'Apresiasi'],
    correctIndex: 3,
  },

  // 3. PENALARAN (5 Soal)
  {
    id: 'pen_1',
    dimension: 'penalaran',
    prompt:
      'Semua mahasiswa jurusan Arsitektur wajib menguasai gambar teknik. Sebagian anggota klub fotografi adalah mahasiswa jurusan Arsitektur. Simpulan yang PASTI BENAR adalah:',
    options: [
      'Semua anggota klub fotografi menguasai gambar teknik',
      'Sebagian anggota klub fotografi menguasai gambar teknik',
      'Tidak ada anggota klub fotografi yang menguasai gambar teknik',
      'Semua yang menguasai gambar teknik adalah anggota klub fotografi',
    ],
    correctIndex: 1,
  },
  {
    id: 'pen_2',
    dimension: 'penalaran',
    prompt: 'Tentukan angka selanjutnya pada deret pola berikut: 3, 6, 11, 18, 27, ...',
    options: ['36', '38', '40', '42'],
    correctIndex: 1,
  },
  {
    id: 'pen_3',
    dimension: 'penalaran',
    prompt:
      'Lima peserta (Rina, Budi, Tari, Dimas, Sinta) duduk berurutan. Budi duduk tepat di sebelah kanan Rina. Dimas duduk di ujung paling kiri. Sinta tidak bersebelahan dengan Budi maupun Dimas. Siapakah yang duduk di posisi tengah (kursi ke-3)?',
    options: ['Rina', 'Budi', 'Tari', 'Sinta'],
    correctIndex: 1,
  },
  {
    id: 'pen_4',
    dimension: 'penalaran',
    prompt:
      'Jika hujan deras turun terus-menerus, debit air sungai meningkat. Jika debit air sungai meningkat, pintu air bendungan dibuka. Hari ini pintu air bendungan TIDAK dibuka. Kesimpulan yang valid adalah:',
    options: [
      'Debit air sungai meningkat namun pintu tidak perlu dibuka',
      'Hujan deras tidak turun terus-menerus',
      'Pintu air mengalami kerusakan teknis',
      'Sebagian sungai meluap ke pemukiman',
    ],
    correctIndex: 1,
  },
  {
    id: 'pen_5',
    dimension: 'penalaran',
    prompt: 'Perhatikan pola huruf dan angka: A2, C6, F12, J20, ... Pasangan berikutnya adalah:',
    options: ['N28', 'O30', 'M26', 'P32'],
    correctIndex: 1,
  },

  // 4. KLERIKAL (5 Soal)
  {
    id: 'kle_1',
    dimension: 'klerikal',
    prompt:
      'Bandingkan kedua deret kode arsip berikut:\nKode A: IDN-2026-88492-XJK\nKode B: IDN-2026-88429-XJK\nPernyataan manakah yang tepat?',
    options: [
      'Kedua kode identik sama persis',
      'Berbeda pada segmen ketiga (digit 9 dan 2 tertukar)',
      'Berbeda pada segmen kedua (tahun)',
      'Berbeda pada segmen keempat (kode huruf)',
    ],
    correctIndex: 1,
  },
  {
    id: 'kle_2',
    dimension: 'klerikal',
    prompt:
      'Manakah di antara empat pasangan nomor faktur di bawah ini yang SAMA PERSIS antara kolom kiri dan kolom kanan?',
    options: [
      'INV/0942/BKM/771  —  INV/0942/BMK/771',
      'INV/0924/BKM/717  —  INV/0924/BKM/771',
      'INV/0492/BKM/771  —  INV/0492/BKM/771',
      'INV/0942/BKM/177  —  INV/0942/BKM/171',
    ],
    correctIndex: 2,
  },
  {
    id: 'kle_3',
    dimension: 'klerikal',
    prompt:
      'Jika daftar nama peserta diurutkan secara alfabetis (A ke Z) berdasarkan nama belakang: (1) Budi Santoso, (2) Andi Pratama, (3) Citra Wijaya, (4) Dinda Kusuma. Urutan nomor yang benar adalah:',
    options: ['4 - 2 - 1 - 3', '2 - 4 - 1 - 3', '4 - 1 - 2 - 3', '2 - 1 - 4 - 3'],
    correctIndex: 0,
  },
  {
    id: 'kle_4',
    dimension: 'klerikal',
    prompt:
      'Pada deret karakter berikut: "7G9K2M7G9L2M7G9K2N7G9K2M", berapakah frekuensi kemunculan pola utuh "7G9K2M"?',
    options: ['1 kali', '2 kali', '3 kali', '4 kali'],
    correctIndex: 1,
  },
  {
    id: 'kle_5',
    dimension: 'klerikal',
    prompt:
      'Data nomor telepon siswa tercatat: 0812-7745-9031. Petugas mengetik ulang menjadi: 0812-7754-9031. Jenis kesalahan input yang terjadi adalah:',
    options: [
      'Kelebihan satu digit angka',
      'Transposisi (tertukarnya posisi dua digit berurutan)',
      'Kesalahan kode operator awal',
      'Kekurangan satu digit angka di akhir',
    ],
    correctIndex: 1,
  },

  // 5. MEKANIK (5 Soal)
  {
    id: 'mek_1',
    dimension: 'mekanik',
    diagramId: 'mekanik_pulley_1',
    prompt:
      'Perhatikan sistem katrol pada gambar: Sistem A menggunakan 1 katrol tetap, sedangkan Sistem B menggunakan kombinasi 1 katrol tetap dan 1 katrol bergerak (bebas). Jika beban sama-sama 100 kg (abaikan gesekan dan massa tali), gaya tarik manakah yang lebih ringan?',
    options: [
      'Sistem A membutuhkan gaya setengah lebih kecil',
      'Sistem B membutuhkan gaya setengah lebih kecil dari berat beban',
      'Keduanya membutuhkan gaya tarik yang sama persis',
      'Sistem B membutuhkan gaya dua kali lebih besar',
    ],
    correctIndex: 1,
  },
  {
    id: 'mek_2',
    dimension: 'mekanik',
    diagramId: 'mekanik_gear_2',
    prompt:
      'Tiga buah roda gigi (A, B, dan C) saling bersinggungan secara berurutan. Roda A (20 gigi) diputar searah jarum jam. Ke arah manakah roda C (40 gigi) berputar, dan bagaimana kecepatannya dibanding roda A?',
    options: [
      'Berlawanan arah jarum jam dengan kecepatan 2 kali lebih cepat',
      'Searah jarum jam dengan kecepatan setengah kali roda A',
      'Berlawanan arah jarum jam dengan kecepatan setengah kali roda A',
      'Searah jarum jam dengan kecepatan sama dengan roda A',
    ],
    correctIndex: 1,
  },
  {
    id: 'mek_3',
    dimension: 'mekanik',
    diagramId: 'mekanik_lever_3',
    prompt:
      'Pada jungkat-jungkit (tuas), beban 60 kg diletakkan 1 meter di sebelah kiri titik tumpu. Di sebelah kanan titik tumpu, beban 30 kg harus diletakkan pada jarak berapa meter agar jungkat-jungkit seimbang mendatar?',
    options: ['0,5 meter', '1,5 meter', '2,0 meter', '3,0 meter'],
    correctIndex: 2,
  },
  {
    id: 'mek_4',
    dimension: 'mekanik',
    diagramId: 'mekanik_balance_4',
    prompt:
      'Dua buah pegas identik dipasang secara PARALEL untuk menahan beban 10 kg. Dibandingkan dengan menggunakan hanya 1 pegas untuk beban yang sama, bagaimanakah pertambahan panjang sistem pegas paralel tersebut?',
    options: [
      'Dua kali lebih panjang',
      'Sama panjang dengan 1 pegas',
      'Setengah kali pertambahan panjang 1 pegas',
      'Empat kali lebih pendek',
    ],
    correctIndex: 2,
  },
  {
    id: 'mek_5',
    dimension: 'mekanik',
    diagramId: 'mekanik_water_5',
    prompt:
      'Sebuah tangki air silinder tinggi memiliki tiga lubang kecil identik pada ketinggian berbeda: lubang Atas, Tengah, dan Bawah. Ketika tangki terisi penuh air, lubang manakah yang memancarkan air paling jauh secara horizontal?',
    options: [
      'Lubang Atas karena dekat permukaan udara',
      'Lubang Tengah karena sudut parabolanya ideal',
      'Lubang Bawah karena tekanan hidrostatis paling besar',
      'Ketiga lubang memancarkan air pada jarak yang sama',
    ],
    correctIndex: 2,
  },

  // 6. KUANTITATIF (5 Soal)
  {
    id: 'kua_1',
    dimension: 'kuantitatif',
    prompt:
      'Harga awal sebuah kalkulator ilmiah adalah Rp250.000. Toko memberikan diskon 20%, kemudian pada saat pembayaran kasir memberikan potongan tambahan 10% dari harga setelah diskon pertama. Berapakah harga akhir yang harus dibayar?',
    options: ['Rp175.000', 'Rp180.000', 'Rp185.000', 'Rp200.000'],
    correctIndex: 1,
  },
  {
    id: 'kua_2',
    dimension: 'kuantitatif',
    prompt:
      'Perbandingan jumlah siswa peminat IPA dan IPS di sebuah sekolah adalah 5 : 3. Jika selisih jumlah siswa kedua peminatan tersebut adalah 48 orang, berapakah total jumlah siswa keduanya?',
    options: ['144 siswa', '168 siswa', '192 siswa', '216 siswa'],
    correctIndex: 2,
  },
  {
    id: 'kua_3',
    dimension: 'kuantitatif',
    prompt:
      'Sebuah proyek renovasi laboratorium dapat diselesaikan oleh 12 pekerja dalam 15 hari. Jika pengelola ingin proyek selesai lebih cepat menjadi 10 hari, berapa pekerja TAMBAHAN yang harus direkrut?',
    options: ['4 pekerja', '6 pekerja', '8 pekerja', '18 pekerja'],
    correctIndex: 1,
  },
  {
    id: 'kua_4',
    dimension: 'kuantitatif',
    prompt:
      'Nilai rata-rata ujian matematika dari 9 siswa adalah 78. Ketika nilai 1 siswa susulan dimasukkan, rata-rata kelas menjadi 80. Berapakah nilai siswa susulan tersebut?',
    options: ['88', '92', '96', '98'],
    correctIndex: 3,
  },
  {
    id: 'kua_5',
    dimension: 'kuantitatif',
    prompt: 'Jika 3x + 7 = 22 dan 2y - 3 = 11, maka nilai dari (x² - y) adalah:',
    options: ['16', '18', '20', '22'],
    correctIndex: 1,
  },

  // 7. PENGGUNAAN BAHASA (5 Soal)
  {
    id: 'bhs_1',
    dimension: 'bahasa',
    prompt: 'Manakah kalimat berikut yang penulisannya SESUAI dengan kaidah EYD V dan kalimat efektif?',
    options: [
      'Bagi para peserta ujian diharapkan segera memasuki ruangan tes.',
      'Para peserta ujian diharapkan segera memasuki ruang tes.',
      'Kepada seluruh peserta ujian di harapkan segera masuk ke dalam ruangan.',
      'Seluruh peserta-peserta ujian diharapkan masuk ruangan dengan tertib.',
    ],
    correctIndex: 1,
  },
  {
    id: 'bhs_2',
    dimension: 'bahasa',
    prompt: 'Manakah kelompok kata berikut yang seluruhnya merupakan KATA BAKU menurut KBBI?',
    options: [
      'Apotek, analisis, risiko, ijazah',
      'Apotik, analisa, resiko, ijasah',
      'Apotek, analisa, risiko, ijazah',
      'Apotek, analisis, resiko, ijazah',
    ],
    correctIndex: 0,
  },
  {
    id: 'bhs_3',
    dimension: 'bahasa',
    prompt: 'Penggunaan tanda baca koma (,) yang paling tepat terdapat pada kalimat:',
    options: [
      'Meskipun hujan turun deras namun ia tetap berangkat ke sekolah.',
      'Saya ingin membeli buku, pensil, dan penggaris di koperasi.',
      'Ia tidak hadir karena, sedang mengikuti lomba karya ilmiah.',
      'Menurut kepala sekolah bahwa, disiplin adalah kunci keberhasilan.',
    ],
    correctIndex: 1,
  },
  {
    id: 'bhs_4',
    dimension: 'bahasa',
    prompt: 'Penulisan kata depan dan imbuhan "di" yang BENAR seluruhnya adalah:',
    options: [
      'disana, ditulis, di perpustakaan, di bawa',
      'di sana, ditulis, di perpustakaan, dibawa',
      'disana, di tulis, diperpustakaan, dibawa',
      'di sana, di tulis, di perpustakaan, di bawa',
    ],
    correctIndex: 1,
  },
  {
    id: 'bhs_5',
    dimension: 'bahasa',
    prompt: 'Manakah kalimat berikut yang mengandung makna jelas tanpa kelewahan (pleonasme)?',
    options: [
      'Semua dokumen-dokumen penting telah diarsipkan sejak pagi.',
      'Dia naik ke atas panggung untuk menerima penghargaan.',
      'Tim peneliti memaparkan temuan utama mereka dalam seminar nasional.',
      'Agar supaya hasil maksimal, peserta harus berlatih rutin.',
    ],
    correctIndex: 2,
  },
];

export const INTEREST_STATEMENTS: InterestStatement[] = [
  // 1. Kesenian
  { id: 'int_kesenian_1', dimension: 'kesenian', statement: 'Merancang tata letak poster, ilustrasi visual, atau desain arsitektur yang estetis.' },
  { id: 'int_kesenian_2', dimension: 'kesenian', statement: 'Menciptakan karya seni seperti menggambar, fotografi artistik, musik, atau penyuntingan video kreatif.' },
  // 2. Menolong
  { id: 'int_menolong_1', dimension: 'menolong', statement: 'Merawat, mendengarkan keluhan, dan membantu pemulihan kesehatan fisik atau mental seseorang.' },
  { id: 'int_menolong_2', dimension: 'menolong', statement: 'Terlibat dalam kegiatan sosial kemanusiaan atau pendampingan psikologis bagi masyarakat yang membutuhkan.' },
  // 3. Keteknikan
  { id: 'int_keteknikan_1', dimension: 'keteknikan', statement: 'Merancang cetak biru bangunan, jembatan, sistem mesin, atau rangkaian elektronika terapan.' },
  { id: 'int_keteknikan_2', dimension: 'keteknikan', statement: 'Memecahkan persoalan rekayasa teknis untuk membangun prototipe produk atau teknologi baru.' },
  // 4. Pengelolaan Data
  { id: 'int_pengelolaan_data_1', dimension: 'pengelolaan_data', statement: 'Mengumpulkan, membersihkan, dan mengolah kumpulan data angka menjadi tabel statistik atau grafik bermakna.' },
  { id: 'int_pengelolaan_data_2', dimension: 'pengelolaan_data', statement: 'Mencari pola tersembunyi dalam basis data besar untuk membuat prediksi atau laporan analitis.' },
  // 5. Fasilitasi Sosial
  { id: 'int_fasilitasi_sosial_1', dimension: 'fasilitasi_sosial', statement: 'Menjelaskan materi pelajaran yang rumit agar mudah dipahami oleh siswa atau rekan belajar.' },
  { id: 'int_fasilitasi_sosial_2', dimension: 'fasilitasi_sosial', statement: 'Memandu diskusi kelompok, pelatihan keterampilan, atau sesi konseling pengembangan diri.' },
  // 6. Pengelolaan
  { id: 'int_pengelolaan_1', dimension: 'pengelolaan', statement: 'Memimpin tim kerja, membagi tugas anggota, dan memastikan target proyek tercapai tepat waktu.' },
  { id: 'int_pengelolaan_2', dimension: 'pengelolaan', statement: 'Merencanakan strategi usaha, mengoordinasikan sumber daya, dan mengambil keputusan manajerial.' },
  // 7. Kerja Lapangan
  { id: 'int_kerja_lapangan_1', dimension: 'kerja_lapangan', statement: 'Melakukan survei langsung di alam terbuka, pegunungan, kawasan pertanian, atau lokasi pertambangan.' },
  { id: 'int_kerja_lapangan_2', dimension: 'kerja_lapangan', statement: 'Bekerja di luar ruangan untuk mengamati kondisi lingkungan, batuan geologi, atau ekosistem hayati.' },
  // 8. Detail Bisnis
  { id: 'int_detail_bisnis_1', dimension: 'detail_bisnis', statement: 'Memeriksa ketepatan bukti transaksi, laporan pembukuan akuntansi, dan arsip administrasi perusahaan.' },
  { id: 'int_detail_bisnis_2', dimension: 'detail_bisnis', statement: 'Menyusun dokumen kontrak, jadwal operasional, serta mengaudit kepatuhan prosedur keuangan secara teliti.' },
  // 9. Kerja Ilmiah
  { id: 'int_kerja_ilmiah_1', dimension: 'kerja_ilmiah', statement: 'Melakukan eksperimen laboratorium di bidang biologi, kimia, fisika, atau farmasi untuk menguji hipotesis.' },
  { id: 'int_kerja_ilmiah_2', dimension: 'kerja_ilmiah', statement: 'Menelaah jurnal ilmiah guna menemukan formula, metode riset, atau inovasi sains terbaru.' },
  // 10. Sains Sosial
  { id: 'int_sains_sosial_1', dimension: 'sains_sosial', statement: 'Mengkaji fenomena sosial, budaya masyarakat, perubahan perilaku publik, dan isu kebijakan negara.' },
  { id: 'int_sains_sosial_2', dimension: 'sains_sosial', statement: 'Melakukan wawancara atau studi literatur tentang sejarah, hukum sosial, dan dinamika kelompok manusia.' },
  // 11. Analisis Finansial
  { id: 'int_analisis_finansial_1', dimension: 'analisis_finansial', statement: 'Menganalisis pergerakan investasi, saham, rasio profitabilitas, serta proyeksi anggaran keuangan.' },
  { id: 'int_analisis_finansial_2', dimension: 'analisis_finansial', statement: 'Menilai kelayakan ekonomi suatu rencana bisnis dan merancang strategi pengelolaan risiko finansial.' },
  // 12. Pengaruh
  { id: 'int_pengaruh_1', dimension: 'pengaruh', statement: 'Berdebat secara argumentatif, bernegosiasi, atau meyakinkan orang lain dalam forum resmi.' },
  { id: 'int_pengaruh_2', dimension: 'pengaruh', statement: 'Menyusun kampanye komunikasi publik, strategi pemasaran merek, atau menulis opini persuasif di media.' },
  // 13. Sistem Bisnis
  { id: 'int_sistem_bisnis_1', dimension: 'sistem_bisnis', statement: 'Menganalisis alur kerja organisasi dan merancang sistem informasi atau perangkat lunak agar lebih efisien.' },
  { id: 'int_sistem_bisnis_2', dimension: 'sistem_bisnis', statement: 'Memetakan proses produksi industri dari hulu ke hilir untuk menghilangkan hambatan operasional.' },
  // 14. Kerja Manual
  { id: 'int_kerja_manual_1', dimension: 'kerja_manual', statement: 'Membuat kerajinan presisi, merakit model fisik, mengolah kuliner, atau membentuk material dengan tangan.' },
  { id: 'int_kerja_manual_2', dimension: 'kerja_manual', statement: 'Menikmati pekerjaan yang menuntut ketangkasan tangan dan ketelitian fisik menghasilkan karya nyata.' },
  // 15. Kendali Kualitas
  { id: 'int_kendali_kualitas_1', dimension: 'kendali_kualitas', statement: 'Menguji sampel produk atau perangkat lunak untuk memastikan seluruh standar mutu dan keamanan terpenuhi.' },
  { id: 'int_kendali_kualitas_2', dimension: 'kendali_kualitas', statement: 'Melakukan inspeksi berkala, kalibrasi alat ukur, dan mencatat penyimpangan kualitas produksi.' },
  // 16. Keteknisian
  { id: 'int_keteknisian_1', dimension: 'keteknisian', statement: 'Merakit, memelihara, dan memperbaiki perangkat keras komputer, jaringan, mesin otomotif, atau alat medis.' },
  { id: 'int_keteknisian_2', dimension: 'keteknisian', statement: 'Mendiagnosis gangguan teknis pada peralatan operasional dan melakukan penyetelan ulang agar berfungsi optimal.' },
  // 17. Pelayanan Pribadi
  { id: 'int_pelayanan_pribadi_1', dimension: 'pelayanan_pribadi', statement: 'Menyambut tamu dengan ramah, mengatur kebutuhan akomodasi perjalanan, dan menjaga kenyamanan klien secara personal.' },
  { id: 'int_pelayanan_pribadi_2', dimension: 'pelayanan_pribadi', statement: 'Bekerja di industri perhotelan, pariwisata, atau layanan personal yang mengutamakan etiket dan keramahtamahan.' },
  // 18. Layanan Dasar
  { id: 'int_layanan_dasar_1', dimension: 'layanan_dasar', statement: 'Melayani permintaan informasi masyarakat di loket pelayanan publik maupun pusat bantuan pelanggan secara teratur.' },
  { id: 'int_layanan_dasar_2', dimension: 'layanan_dasar', statement: 'Mengelola rutinitas pencatatan surat masuk-keluar, distribusi logistik harian, dan tata usaha operasional.' },
];

export interface MajorBlueprint {
  name: string;
  keywords: string[];
  requiredAptitudes: AptitudeKey[];
  relatedInterests: InterestKey[];
  cluster: string;
}

export const MAJOR_BLUEPRINTS: MajorBlueprint[] = [
  {
    name: 'Kedokteran / Pendidikan Dokter',
    keywords: ['kedokteran', 'dokter', 'medis', 'kesehatan masyarakat', 'kedokteran gigi'],
    requiredAptitudes: ['penalaran', 'verbal', 'spasial'],
    relatedInterests: ['menolong', 'kerja_ilmiah', 'sains_sosial'],
    cluster: 'Ilmu Kesehatan & Kedokteran',
  },
  {
    name: 'Keperawatan / Kebidanan',
    keywords: ['keperawatan', 'perawat', 'ners', 'kebidanan', 'bidan', 'fisioterapi'],
    requiredAptitudes: ['verbal', 'klerikal', 'penalaran'],
    relatedInterests: ['menolong', 'pelayanan_pribadi'],
    cluster: 'Ilmu Kesehatan & Keperawatan',
  },
  {
    name: 'Farmasi',
    keywords: ['farmasi', 'apoteker', 'kimia medis'],
    requiredAptitudes: ['klerikal', 'kuantitatif', 'penalaran'],
    relatedInterests: ['kerja_ilmiah', 'kendali_kualitas', 'menolong'],
    cluster: 'Sains Farmasi & Kesehatan',
  },
  {
    name: 'Teknik Informatika / Ilmu Komputer',
    keywords: ['informatika', 'ilmu komputer', 'sistem informasi', 'rekayasa perangkat lunak', 'rpl', 'cyber', 'ai', 'teknologi informasi'],
    requiredAptitudes: ['penalaran', 'kuantitatif', 'spasial'],
    relatedInterests: ['sistem_bisnis', 'pengelolaan_data', 'keteknikan'],
    cluster: 'Teknologi Informasi & Komputasi',
  },
  {
    name: 'Statistika / Sains Data / Aktuaria',
    keywords: ['statistika', 'sains data', 'data science', 'aktuaria', 'matematika'],
    requiredAptitudes: ['kuantitatif', 'penalaran', 'klerikal'],
    relatedInterests: ['pengelolaan_data', 'analisis_finansial', 'kerja_ilmiah'],
    cluster: 'Matematika, Statistika & Data',
  },
  {
    name: 'Arsitektur / Desain Interior',
    keywords: ['arsitektur', 'desain interior', 'perencanaan wilayah', 'pwk', 'planologi'],
    requiredAptitudes: ['spasial', 'mekanik', 'kuantitatif'],
    relatedInterests: ['kesenian', 'keteknikan'],
    cluster: 'Arsitektur & Perencanaan Ruang',
  },
  {
    name: 'Teknik Sipil / Mesin / Elektro / Industri',
    keywords: ['teknik sipil', 'teknik mesin', 'teknik elektro', 'teknik industri', 'teknik kimia', 'teknik', 'otomotif', 'robotika'],
    requiredAptitudes: ['mekanik', 'kuantitatif', 'spasial'],
    relatedInterests: ['keteknikan', 'keteknisian', 'sistem_bisnis'],
    cluster: 'Rekayasa & Keteknikan',
  },
  {
    name: 'Desain Komunikasi Visual (DKV) / Seni Rupa',
    keywords: ['dkv', 'desain', 'seni', 'animasi', 'film', 'musik', 'kriya', 'desain grafis'],
    requiredAptitudes: ['spasial', 'bahasa', 'verbal'],
    relatedInterests: ['kesenian', 'kerja_manual', 'pengaruh'],
    cluster: 'Seni, Desain & Industri Kreatif',
  },
  {
    name: 'Psikologi',
    keywords: ['psikologi', 'bimbingan konseling', 'bk'],
    requiredAptitudes: ['verbal', 'penalaran', 'bahasa'],
    relatedInterests: ['menolong', 'sains_sosial', 'fasilitasi_sosial'],
    cluster: 'Ilmu Psikologi & Konseling',
  },
  {
    name: 'Ilmu Hukum / Kedinasan / Poltekim',
    keywords: ['hukum', 'ilmu hukum', 'kenotariatan', 'poltekim', 'kedinasan', 'imigrasi', 'ipdn', 'kriminologi'],
    requiredAptitudes: ['verbal', 'penalaran', 'bahasa'],
    relatedInterests: ['pengaruh', 'sains_sosial', 'detail_bisnis', 'kendali_kualitas'],
    cluster: 'Hukum, Kedinasan & Kebijakan Publik',
  },
  {
    name: 'Akuntansi / Perpajakan',
    keywords: ['akuntansi', 'perpajakan', 'pajak', 'audit', 'keuangan'],
    requiredAptitudes: ['klerikal', 'kuantitatif', 'penalaran'],
    relatedInterests: ['detail_bisnis', 'analisis_finansial', 'pengelolaan_data'],
    cluster: 'Akuntansi & Keuangan',
  },
  {
    name: 'Manajemen / Bisnis / Kewirausahaan',
    keywords: ['manajemen', 'bisnis', 'kewirausahaan', 'administrasi bisnis', 'ekonomi'],
    requiredAptitudes: ['kuantitatif', 'verbal', 'penalaran'],
    relatedInterests: ['pengelolaan', 'analisis_finansial', 'pengaruh', 'sistem_bisnis'],
    cluster: 'Bisnis, Manajemen & Ekonomi',
  },
  {
    name: 'Ilmu Komunikasi / Hubungan Internasional / Sastra',
    keywords: ['komunikasi', 'hubungan internasional', 'hi', 'sastra', 'bahasa', 'jurnalistik', 'humas', 'ilmu politik'],
    requiredAptitudes: ['bahasa', 'verbal', 'penalaran'],
    relatedInterests: ['pengaruh', 'sains_sosial', 'kesenian', 'fasilitasi_sosial'],
    cluster: 'Komunikasi, Bahasa & Hubungan Global',
  },
  {
    name: 'Pendidikan / Keguruan',
    keywords: ['pendidikan', 'pgsd', 'keguruan', 'guru', 'tarbiyah'],
    requiredAptitudes: ['verbal', 'bahasa', 'penalaran'],
    relatedInterests: ['fasilitasi_sosial', 'menolong', 'sains_sosial'],
    cluster: 'Ilmu Pendidikan & Pengajaran',
  },
  {
    name: 'Pertanian / Geologi / Kehutanan / Pertambangan',
    keywords: ['pertanian', 'agroteknologi', 'agribisnis', 'geologi', 'kehutanan', 'pertambangan', 'kelautan', 'perikanan', 'geografi'],
    requiredAptitudes: ['spasial', 'mekanik', 'penalaran'],
    relatedInterests: ['kerja_lapangan', 'kerja_ilmiah', 'kendali_kualitas'],
    cluster: 'Ilmu Kebumian, Hayati & Lapangan',
  },
  {
    name: 'Pariwisata / Perhotelan',
    keywords: ['pariwisata', 'perhotelan', 'hospitality', 'tata boga', 'kuliner'],
    requiredAptitudes: ['verbal', 'bahasa', 'klerikal'],
    relatedInterests: ['pelayanan_pribadi', 'pengelolaan', 'layanan_dasar'],
    cluster: 'Hospitality, Pariwisata & Jasa',
  },
];

export const POPULAR_MAJOR_SUGGESTIONS = [
  'Kedokteran',
  'Teknik Informatika',
  'Sistem Informasi',
  'Arsitektur',
  'Teknik Sipil',
  'Teknik Industri',
  'Teknik Mesin',
  'Statistika & Sains Data',
  'Farmasi',
  'Keperawatan',
  'Psikologi',
  'Ilmu Hukum',
  'Sekolah Kedinasan / Poltekim',
  'Akuntansi',
  'Manajemen Bisnis',
  'Ekonomi Pembangunan',
  'Ilmu Komunikasi',
  'Hubungan Internasional',
  'Desain Komunikasi Visual (DKV)',
  'Desain Grafis',
  'Pendidikan / Keguruan',
  'Agroteknologi / Pertanian',
  'Teknik Geologi',
  'Manajemen Perhotelan & Pariwisata',
];

export const APTITUDE_SCORE_MAX_PER_DIM = 5;
export const TEST_DURATION_SECONDS = 25 * 60;
