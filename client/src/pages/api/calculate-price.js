export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed, use POST' });
  }

  // กำหนดราคาแบบ tier ตามน้ำหนักสัตว์ (ไม่สนใจประเภท)
  const basePricesByWeight = [
    { maxWeight: 5, pricePerDay: 300 },
    { maxWeight: 10, pricePerDay: 400 },
    { maxWeight: Infinity, pricePerDay: 500 },
  ];

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

  // หา pricePerDay ตาม weight เท่านั้น
  function getPricePerDay(weight) {
    for (const tier of basePricesByWeight) {
      if (weight <= tier.maxWeight) {
        return tier.pricePerDay;
      }
    }
    return 0;
  }

  function calculateTotalPrice(weight, startDate, endDate, duration_hour = null, specialDayFlags = []) {
    let totalPrice = 0;
    const basePrice = getPricePerDay(weight);
    const pricePerHour = basePrice / 24;

    if (duration_hour !== null && !isNaN(duration_hour)) {
      const start = new Date(startDate);
      for (let i = 0; i < duration_hour; i++) {
        const hourDate = new Date(start.getTime() + i * 60 * 60 * 1000);
        const multiplier = getSpecialDayMultiplier(hourDate, specialDayFlags);
        totalPrice += pricePerHour * (1 + multiplier);
      }
    } else {
      let currentDate = new Date(startDate);
      const end = new Date(endDate);
      const diffMs = end - currentDate;
      const hours = Math.ceil(diffMs / (1000 * 60 * 60)) + 1;

      for (let i = 0; i < hours; i++) {
        const hourDate = new Date(currentDate.getTime() + i * 60 * 60 * 1000);
        const multiplier = getSpecialDayMultiplier(hourDate, specialDayFlags);
        totalPrice += pricePerHour * (1 + multiplier);
      }
    }

    totalPrice = totalPrice * 2; // เพิ่มราคาอีก 1 เท่าตัว
    return Math.round(totalPrice);
  }

  try {
    let totalPrice = 0;
    let details = {};

    if (Array.isArray(req.body.pets)) {
      const { pets, startDate, endDate, duration_hour = null, specialDayFlags = [] } = req.body;

      if (!pets || !startDate) {
        return res.status(400).json({ error: 'Missing required fields: pets[], startDate' });
      }

      for (const pet of pets) {
        if (!pet.weight) continue;
        totalPrice += calculateTotalPrice(pet.weight, startDate, endDate, duration_hour, specialDayFlags);
      }

      details = { pets, startDate, endDate, duration_hour, specialDayFlags };
    } else {
      const { weight, startDate, endDate, duration_hour = null, specialDayFlags = [] } = req.body;

      if (!weight || !startDate) {
        return res.status(400).json({ error: 'Missing required fields: weight, startDate' });
      }

      totalPrice = calculateTotalPrice(weight, startDate, endDate, duration_hour, specialDayFlags);
      details = { weight, startDate, endDate, duration_hour, specialDayFlags };
    }

    res.status(200).json({
      totalPrice,
      currency: 'THB',
      details,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
