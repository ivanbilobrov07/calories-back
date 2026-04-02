const calculateMacroTotals = (food, quantityG) => {
  const ratio = quantityG / 100;

  return {
    totalKcal: Number((food.kcalPer100g * ratio).toFixed(2)),
    totalProtein: Number((food.proteinPer100g * ratio).toFixed(2)),
    totalFat: Number((food.fatPer100g * ratio).toFixed(2)),
    totalCarbs: Number((food.carbsPer100g * ratio).toFixed(2))
  };
};

module.exports = {
  calculateMacroTotals
};
