function combinations(n, k) {
  if (k > n || k < 0) return 0;
  if (k === 0 || k === n) return 1;
  let result = 1;
  for (let i = 1; i <= k; i += 1) {
    result *= (n - i + 1) / i;
  }
  return result;
}

function hypergeometric(populationSize, successCount, sampleSize, targetSuccesses) {
  if (
    populationSize < 0 ||
    successCount < 0 ||
    sampleSize < 0 ||
    targetSuccesses < 0 ||
    sampleSize > populationSize ||
    successCount > populationSize ||
    targetSuccesses > successCount ||
    targetSuccesses > sampleSize
  ) {
    return 0;
  }
  return (
    combinations(successCount, targetSuccesses) *
    combinations(populationSize - successCount, sampleSize - targetSuccesses)
  ) / combinations(populationSize, sampleSize);
}

function calculateSingle(input) {
  const exact = hypergeometric(
    input.populationSize,
    input.successesInPopulation,
    input.sampleSize,
    input.successesInSample,
  );

  let orMore = 0;
  const maxSuccess = Math.min(input.successesInPopulation, input.sampleSize);
  for (let i = input.successesInSample; i <= maxSuccess; i += 1) {
    orMore += hypergeometric(input.populationSize, input.successesInPopulation, input.sampleSize, i);
  }

  let orLess = 0;
  for (let i = 0; i <= input.successesInSample; i += 1) {
    orLess += hypergeometric(input.populationSize, input.successesInPopulation, input.sampleSize, i);
  }

  return {
    exact,
    orMore,
    orLess,
    zero: hypergeometric(input.populationSize, input.successesInPopulation, input.sampleSize, 0),
  };
}

function calculateBo1(deckSize, landCount) {
  const sampleSize = 7;
  const targetRatio = landCount / deckSize;
  const normal = [];
  for (let i = 0; i <= sampleSize; i += 1) {
    normal.push({
      lands: i,
      probability: hypergeometric(deckSize, landCount, sampleSize, i),
    });
  }

  const distribution = new Array(sampleSize + 1).fill(0);
  let totalLands = 0;
  let totalHands = 0;

  for (let hand1 = 0; hand1 <= sampleSize; hand1 += 1) {
    const prob1 = hypergeometric(deckSize, landCount, sampleSize, hand1);
    for (let hand2 = 0; hand2 <= sampleSize; hand2 += 1) {
      const prob2 = hypergeometric(deckSize, landCount, sampleSize, hand2);
      for (let hand3 = 0; hand3 <= sampleSize; hand3 += 1) {
        const prob3 = hypergeometric(deckSize, landCount, sampleSize, hand3);
        const hands = [hand1, hand2, hand3];
        const selected = hands.reduce((best, current) => {
          const bestDiff = Math.abs(best / sampleSize - targetRatio);
          const currentDiff = Math.abs(current / sampleSize - targetRatio);
          return currentDiff < bestDiff ? current : best;
        }, hand1);
        const probability = prob1 * prob2 * prob3;
        distribution[selected] += probability;
        totalLands += selected * probability;
        totalHands += probability;
      }
    }
  }

  return {
    distribution: distribution.map((probability, lands) => ({ lands, probability })),
    normal,
    averageLands: totalHands ? totalLands / totalHands : 0,
  };
}

function calculateMulti(input) {
  const populationSize = Number(input.populationSize || 0);
  const sampleSize = Number(input.sampleSize || 0);
  const targetCards = (input.targetCards || [])
    .map((card, index) => ({
      id: card.id || String(index + 1),
      name: card.name || `目标牌${index + 1}`,
      count: Number(card.count || 0),
      expected: Number(card.expected || 0),
    }))
    .filter((card) => card.count > 0 && card.expected > 0);

  if (!populationSize || sampleSize < 0 || sampleSize > populationSize || !targetCards.length) {
    return {
      all: 0,
      atLeastOne: 0,
      individual: [],
      error: '请检查牌库、抽牌数量和目标牌设置',
    };
  }

  const totalTargetCount = targetCards.reduce((sum, card) => sum + card.count, 0);
  const otherCards = populationSize - totalTargetCount;
  if (otherCards < 0) {
    return {
      all: 0,
      atLeastOne: 0,
      individual: [],
      error: '目标牌总数不能超过牌库总数',
    };
  }

  const denominator = combinations(populationSize, sampleSize);
  if (!denominator) {
    return {
      all: 0,
      atLeastOne: 0,
      individual: [],
      error: '当前参数无法计算组合数',
    };
  }

  const individual = targetCards.map((card) => {
    let probability = 0;
    const maxHit = Math.min(card.count, sampleSize);
    for (let count = card.expected; count <= maxHit; count += 1) {
      probability += hypergeometric(populationSize, card.count, sampleSize, count);
    }
    return {
      id: card.id,
      name: card.name,
      probability,
    };
  });

  let all = 0;
  let atLeastOne = 0;
  const counts = new Array(targetCards.length).fill(0);

  function enumerate(depth, remainingSample) {
    if (depth === targetCards.length) {
      if (remainingSample < 0 || remainingSample > otherCards) return;

      let numerator = combinations(otherCards, remainingSample);
      if (!numerator) return;

      for (let index = 0; index < targetCards.length; index += 1) {
        numerator *= combinations(targetCards[index].count, counts[index]);
      }

      const probability = numerator / denominator;
      const meetsAll = counts.every((count, index) => count >= targetCards[index].expected);
      const meetsOne = counts.some((count, index) => count >= targetCards[index].expected);
      if (meetsAll) all += probability;
      if (meetsOne) atLeastOne += probability;
      return;
    }

    const card = targetCards[depth];
    const maxHit = Math.min(card.count, remainingSample);
    for (let count = 0; count <= maxHit; count += 1) {
      counts[depth] = count;
      enumerate(depth + 1, remainingSample - count);
    }
  }

  enumerate(0, sampleSize);

  return {
    all,
    atLeastOne,
    individual,
    error: '',
  };
}

module.exports = {
  combinations,
  hypergeometric,
  calculateSingle,
  calculateMulti,
  calculateBo1,
};
