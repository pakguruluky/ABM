import {
  APTITUDE_DIMENSIONS,
  APTITUDE_QUESTIONS,
  INTEREST_DIMENSIONS,
  INTEREST_STATEMENTS,
  MAJOR_BLUEPRINTS,
} from '../data/abmCatalog';
import {
  AptitudeCategory,
  AptitudeInterestMatch,
  AptitudeKey,
  InterestKey,
  MajorAlignmentResult,
  MajorEvaluationItem,
} from '../types/abm';

export function getAptitudeCategory(score: number): AptitudeCategory {
  if (score >= 70) return 'Tinggi';
  if (score >= 40) return 'Sedang';
  return 'Rendah';
}

export function getEmptyAptitudeScores(): Record<AptitudeKey, number> {
  return {
    spasial: 0,
    verbal: 0,
    penalaran: 0,
    klerikal: 0,
    mekanik: 0,
    kuantitatif: 0,
    bahasa: 0,
  };
}

export function getEmptyInterestScores(): Record<InterestKey, number> {
  return {
    kesenian: 0,
    menolong: 0,
    keteknikan: 0,
    pengelolaan_data: 0,
    fasilitasi_sosial: 0,
    pengelolaan: 0,
    kerja_lapangan: 0,
    detail_bisnis: 0,
    kerja_ilmiah: 0,
    sains_sosial: 0,
    analisis_finansial: 0,
    pengaruh: 0,
    sistem_bisnis: 0,
    kerja_manual: 0,
    kendali_kualitas: 0,
    keteknisian: 0,
    pelayanan_pribadi: 0,
    layanan_dasar: 0,
  };
}

export function getEmptyMajorAlignment(): MajorAlignmentResult {
  return {
    choice1: {
      majorName: '',
      alignmentScore: 0,
      status: 'Perlu Penguatan',
      notes: '',
    },
    choice2: {
      majorName: '',
      alignmentScore: 0,
      status: 'Perlu Penguatan',
      notes: '',
    },
    matches: [],
    recommendedClusters: [],
    dominantMethodicalPractical: [],
    dominantBasicFallback: [],
  };
}

function evaluateSingleMajor(
  majorInput: string,
  aptitudeScores: Record<AptitudeKey, number>,
  interestScores: Record<InterestKey, number>
): MajorEvaluationItem {
  const normalized = majorInput.trim().toLowerCase();
  const matchedBlueprint = MAJOR_BLUEPRINTS.find((bp) =>
    bp.keywords.some((kw) => normalized.includes(kw))
  );

  if (!matchedBlueprint) {
    const sortedApts = (Object.entries(aptitudeScores) as [AptitudeKey, number][]).sort(
      (a, b) => b[1] - a[1]
    );
    const sortedInts = (Object.entries(interestScores) as [InterestKey, number][]).sort(
      (a, b) => b[1] - a[1]
    );

    const avgTopApt = Math.round(
      sortedApts.slice(0, 3).reduce((acc, [, v]) => acc + v, 0) / 3
    );
    const avgTopInt = Math.round(
      sortedInts.slice(0, 3).reduce((acc, [, v]) => acc + v, 0) / 3
    );
    const alignmentScore = Math.round(avgTopApt * 0.5 + avgTopInt * 0.5);
    const status =
      alignmentScore >= 72
        ? 'Sangat Selaras'
        : alignmentScore >= 52
          ? 'Cukup Selaras'
          : 'Perlu Penguatan';

    const topAptName =
      APTITUDE_DIMENSIONS.find((d) => d.key === sortedApts[0][0])?.name || '';
    const topIntName =
      INTEREST_DIMENSIONS.find((d) => d.key === sortedInts[0][0])?.name || '';

    return {
      majorName: majorInput,
      alignmentScore,
      status,
      notes: `Berdasarkan profil umum, kekuatan bakat utama Anda berada pada ${topAptName} (${sortedApts[0][1]}) dengan minat tertinggi di bidang ${topIntName} (${sortedInts[0][1]}). Konsultasikan silabus mata kuliah "${majorInput}" bersama Guru BK untuk memetakan kesesuaian spesifiknya.`,
    };
  }

  const reqApts = matchedBlueprint.requiredAptitudes;
  const relInts = matchedBlueprint.relatedInterests;

  const avgApt =
    reqApts.reduce((sum, key) => sum + (aptitudeScores[key] ?? 0), 0) / reqApts.length;
  const avgInt =
    relInts.reduce((sum, key) => sum + (interestScores[key] ?? 0), 0) / relInts.length;

  const alignmentScore = Math.round(avgApt * 0.55 + avgInt * 0.45);
  const status: MajorEvaluationItem['status'] =
    alignmentScore >= 70
      ? 'Sangat Selaras'
      : alignmentScore >= 50
        ? 'Cukup Selaras'
        : 'Perlu Penguatan';

  const aptLabels = reqApts
    .map((k) => {
      const dim = APTITUDE_DIMENSIONS.find((d) => d.key === k);
      return `${dim?.name ?? k} (${aptitudeScores[k] ?? 0})`;
    })
    .join(', ');

  const weakestAptKey = [...reqApts].sort(
    (a, b) => (aptitudeScores[a] ?? 0) - (aptitudeScores[b] ?? 0)
  )[0];
  const weakestAptName =
    APTITUDE_DIMENSIONS.find((d) => d.key === weakestAptKey)?.name ?? weakestAptKey;

  let notes = '';
  if (status === 'Sangat Selaras') {
    notes = `Profil bakat pendukung (${aptLabels}) dan minat Anda sangat mendukung bidang ${matchedBlueprint.cluster}. Pilihan ini memiliki prospek kesiapan akademik yang tinggi.`;
  } else if (status === 'Cukup Selaras') {
    notes = `Kombinasi bakat dan minat Anda cukup memadai untuk rumpun ${matchedBlueprint.cluster}. Penguatan terarah pada ${weakestAptName} akan semakin memantapkan performa studi Anda.`;
  } else {
    notes = `Skor bakat prasyarat (${aptLabels}) atau minat terkait masih perlu ditingkatkan untuk rumpun ${matchedBlueprint.cluster}. Disarankan pendalaman intensif pada ${weakestAptName} atau mempertimbangkan alternatif rumpun yang lebih selaras.`;
  }

  return {
    majorName: majorInput,
    alignmentScore,
    status,
    notes,
  };
}

export function computeAssessmentResults(
  aptitudeAnswers: Record<string, number>,
  interestAnswers: Record<string, number>,
  majorChoice1: string,
  majorChoice2: string
): {
  aptitudeScores: Record<AptitudeKey, number>;
  interestScores: Record<InterestKey, number>;
  dominantInterests: InterestKey[];
  majorAlignment: MajorAlignmentResult;
} {
  const aptitudeScores = getEmptyAptitudeScores();
  for (const dim of APTITUDE_DIMENSIONS) {
    const dimQuestions = APTITUDE_QUESTIONS.filter((q) => q.dimension === dim.key);
    const correctCount = dimQuestions.reduce((sum, q) => {
      return sum + (aptitudeAnswers[q.id] === q.correctIndex ? 1 : 0);
    }, 0);
    aptitudeScores[dim.key] = Math.round((correctCount / dimQuestions.length) * 100);
  }

  const interestScores = getEmptyInterestScores();
  for (const dim of INTEREST_DIMENSIONS) {
    const dimStatements = INTEREST_STATEMENTS.filter((s) => s.dimension === dim.key);
    const sum = dimStatements.reduce((acc, s) => {
      const val = interestAnswers[s.id] ?? 3;
      return acc + Math.min(5, Math.max(1, val));
    }, 0);
    const minSum = dimStatements.length * 1;
    const maxSum = dimStatements.length * 5;
    interestScores[dim.key] = Math.round(((sum - minSum) / (maxSum - minSum)) * 100);
  }

  // Minat dominan (skor > 50), plus aturan BP3: prioritaskan Minat Metodis & Praktis > 50,
  // atau jika tidak ada, gunakan Minat Dasar > 50
  const allAbove50 = (Object.entries(interestScores) as [InterestKey, number][])
    .filter(([, score]) => score > 50)
    .sort((a, b) => b[1] - a[1]);

  const dominantMethodicalPractical = allAbove50
    .filter(([key]) => {
      const meta = INTEREST_DIMENSIONS.find((d) => d.key === key);
      return meta?.interestType === 'Minat Metodis' || meta?.interestType === 'Minat Praktis';
    })
    .map(([key]) => key);

  const dominantBasicFallback = allAbove50
    .filter(([key]) => {
      const meta = INTEREST_DIMENSIONS.find((d) => d.key === key);
      return meta?.interestType === 'Minat Dasar';
    })
    .map(([key]) => key);

  const dominantInterests = allAbove50.map(([key]) => key);

  // Target untuk Matriks Kesesuaian: ikuti prioritas BP3 (Metodis+Praktis > 50 jika ada,
  // ditambah Minat Dasar > 50 sebagai pelengkap, atau top 5 jika semuanya <= 50)
  const targetInterestKeys: InterestKey[] =
    dominantInterests.length > 0
      ? dominantInterests
      : (Object.entries(interestScores) as [InterestKey, number][])
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([k]) => k);

  const matches: AptitudeInterestMatch[] = targetInterestKeys.map((key) => {
    const meta = INTEREST_DIMENSIONS.find((d) => d.key === key)!;
    const avgSupportingAptitude = Math.round(
      meta.supportingAptitudes.reduce((sum, aptKey) => sum + aptitudeScores[aptKey], 0) /
        meta.supportingAptitudes.length
    );
    const supportingAptitudes = meta.supportingAptitudes.map((aptKey) => {
      const aptMeta = APTITUDE_DIMENSIONS.find((a) => a.key === aptKey)!;
      return `${aptMeta.name} (${aptitudeScores[aptKey]})`;
    });

    const compatibilityLabel: AptitudeInterestMatch['compatibilityLabel'] =
      avgSupportingAptitude >= 65
        ? 'Sangat Selaras'
        : avgSupportingAptitude >= 40
          ? 'Cukup Selaras'
          : 'Perlu Penguatan';

    return {
      interestKey: key,
      interestName: meta.name,
      interestType: meta.interestType,
      interestScore: interestScores[key],
      supportingAptitudes,
      avgSupportingAptitude,
      compatibilityLabel,
    };
  });

  const clusterScores = MAJOR_BLUEPRINTS.map((bp) => {
    const aptAvg =
      bp.requiredAptitudes.reduce((s, k) => s + aptitudeScores[k], 0) /
      bp.requiredAptitudes.length;
    const intAvg =
      bp.relatedInterests.reduce((s, k) => s + interestScores[k], 0) /
      bp.relatedInterests.length;
    return {
      name: `${bp.name}`,
      score: aptAvg * 0.5 + intAvg * 0.5,
    };
  })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((c) => c.name);

  const majorAlignment: MajorAlignmentResult = {
    choice1: evaluateSingleMajor(majorChoice1, aptitudeScores, interestScores),
    choice2: evaluateSingleMajor(majorChoice2, aptitudeScores, interestScores),
    matches,
    recommendedClusters: clusterScores,
    dominantMethodicalPractical,
    dominantBasicFallback,
  };

  return {
    aptitudeScores,
    interestScores,
    dominantInterests,
    majorAlignment,
  };
}
