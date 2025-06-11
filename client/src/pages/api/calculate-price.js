// pages/api/calculate-price.js
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed, use POST' });
  }

  const basePrices = {
    dog: [
      { maxWeight: 5, pricePerDay: 300 },
      { maxWeight: 10, pricePerDay: 400 },
      { maxWeight: Infinity, pricePerDay: 500 },
    ],
    cat: [
      { maxWeight: 3, pricePerDay: 200 },
      { maxWeight: Infinity, pricePerDay: 300 },
    ],
    rabbit: [
      { maxWeight: Infinity, pricePerDay: 150 },
    ],
  };

  const specialDays = {
    weekend: 0.2,
    festival: 0.5,
  };

  function getSpecialDayMultiplier(date, specialDayFlags) {
    let multiplier = 0;
    if (specialDayFlags.includes('weekend')) {
      const day = date.getDay();
      if (day === 0 || day === 6) {
        multiplier += specialDays.weekend;
      }
    }
    if (specialDayFlags.includes('festival')) {
      if (date.getMonth() === 0 && date.getDate() === 1) {
        multiplier += specialDays.festival;
      }
    }
    return multiplier;
  }

  function getPricePerDay(type, weight) {
    const priceList = basePrices[type];
    if (!priceList) throw new Error('Unknown pet type');
    for (const tier of priceList) {
      if (weight <= tier.maxWeight) {
        return tier.pricePerDay;
      }
    }
    return 0;
  }

  function calculateTotalPrice(type, weight, startDate, endDate, specialDayFlags = []) {
    let totalPrice = 0;
    let currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      const basePrice = getPricePerDay(type, weight);
      const multiplier = getSpecialDayMultiplier(currentDate, specialDayFlags);
      const priceForDay = basePrice * (1 + multiplier);
      totalPrice += priceForDay;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return totalPrice;
  }

  try {
    const { type, weight, startDate, endDate, specialDayFlags = [] } = req.body;

    if (!type || !weight || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required fields: type, weight, startDate, endDate' });
    }

    const totalPrice = calculateTotalPrice(type, weight, startDate, endDate, specialDayFlags);

    res.status(200).json({
      totalPrice,
      currency: 'THB',
      details: { type, weight, startDate, endDate, specialDayFlags },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
