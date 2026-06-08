const gradeOrder = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F', '-'];

const gradeMetrics = [
  { value: 'ever_drawn_win_rate', label: '在手胜率（起手或抽到）', shortLabel: '在手胜率', isPercent: true },
  { value: 'opening_hand_win_rate', label: '起手胜率', shortLabel: '起手胜率', isPercent: true },
  { value: 'drawn_win_rate', label: '抽到胜率（第一回合或之后）', shortLabel: '抽到胜率', isPercent: true },
  { value: 'drawn_improvement_win_rate', label: '在手胜率提升', shortLabel: '在手胜率提升', isPercent: true },
];

function calculateStats(values) {
  if (!values.length) return { mean: 0, stdDev: 0 };
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return { mean, stdDev: Math.sqrt(variance) };
}

function getGradeFromStdDev(stdDevFromMean, stdDevPerHalfGrade = 0.33) {
  const centerOffset = stdDevPerHalfGrade / 2;
  const thresholds = [
    { grade: 'A+', min: centerOffset + stdDevPerHalfGrade * 6 },
    { grade: 'A', min: centerOffset + stdDevPerHalfGrade * 5 },
    { grade: 'A-', min: centerOffset + stdDevPerHalfGrade * 4 },
    { grade: 'B+', min: centerOffset + stdDevPerHalfGrade * 3 },
    { grade: 'B', min: centerOffset + stdDevPerHalfGrade * 2 },
    { grade: 'B-', min: centerOffset + stdDevPerHalfGrade },
    { grade: 'C+', min: centerOffset },
    { grade: 'C', min: -centerOffset },
    { grade: 'C-', min: -(centerOffset + stdDevPerHalfGrade) },
    { grade: 'D+', min: -(centerOffset + stdDevPerHalfGrade * 2) },
    { grade: 'D', min: -(centerOffset + stdDevPerHalfGrade * 3) },
    { grade: 'D-', min: -(centerOffset + stdDevPerHalfGrade * 4) },
    { grade: 'F', min: -Infinity },
  ];
  const match = thresholds.find((item) => stdDevFromMean >= item.min);
  return match ? match.grade : 'F';
}

function getMetricValue(card, metric) {
  const value = card[metric];
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return value;
}

function formatMetricValue(value, isPercent) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return '-';
  if (isPercent) return `${(Number(value) * 100).toFixed(1)}%`;
  if (Math.abs(Number(value)) >= 100) return Number(value).toFixed(1);
  return Number(value).toFixed(3);
}

function calculateGrades(cards, metric) {
  const option = gradeMetrics.find((item) => item.value === metric) || gradeMetrics[0];
  const validCards = cards.filter((card) => getMetricValue(card, option.value) !== null);
  const values = validCards.map((card) => getMetricValue(card, option.value));
  const stats = calculateStats(values);

  return cards.map((card) => {
    const value = getMetricValue(card, option.value);
    if (value === null) {
      return {
        ...card,
        grade: '-',
        metricValue: 0,
        metricText: '-',
        stdDevText: '-',
        hasGradeData: false,
      };
    }

    if (!stats.stdDev) {
      return {
        ...card,
        grade: 'C',
        metricValue: value,
        metricText: formatMetricValue(value, option.isPercent),
        stdDevText: '0.00',
        hasGradeData: true,
      };
    }

    const stdDevFromMean = (value - stats.mean) / stats.stdDev;
    return {
      ...card,
      grade: getGradeFromStdDev(stdDevFromMean),
      metricValue: value,
      metricText: formatMetricValue(value, option.isPercent),
      stdDevText: stdDevFromMean.toFixed(2),
      hasGradeData: true,
    };
  });
}

function groupCardsByGrade(cards) {
  return gradeOrder.map((grade) => {
    const gradeCards = cards
      .filter((card) => card.grade === grade)
      .sort((a, b) => Number(b.metricValue || 0) - Number(a.metricValue || 0));

    return {
      grade,
      count: gradeCards.length,
      cards: gradeCards,
    };
  }).filter((group) => group.count);
}

module.exports = {
  gradeMetrics,
  calculateGrades,
  groupCardsByGrade,
  formatMetricValue,
};
