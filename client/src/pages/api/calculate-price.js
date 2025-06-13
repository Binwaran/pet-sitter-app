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

    // คำนวณจำนวนชั่วโมงทั้งหมด
    const diffMs = end - currentDate;
    const hours = Math.ceil(diffMs / (1000 * 60 * 60)) + 1; // +1 เพื่อรวมชั่วโมงเริ่มต้น
    const basePrice = getPricePerDay(type, weight);
    // สมมติ 1 วัน = 24 ชม. คิดราคาต่อชั่วโมง
    const pricePerHour = basePrice / 24;

    for (let i = 0; i < hours; i++) {
      const hourDate = new Date(currentDate.getTime() + i * 60 * 60 * 1000);
      const multiplier = getSpecialDayMultiplier(hourDate, specialDayFlags);
      const priceForHour = pricePerHour * (1 + multiplier);
      totalPrice += priceForHour;
    }
    // เพิ่มราคาอีก 1 เท่าตัว
    totalPrice = totalPrice * 2;
    return Math.round(totalPrice);
  }

  try {
    let totalPrice = 0;
    let details = {};
    if (Array.isArray(req.body.pets)) {
      // กรณีส่ง pets: [{type, weight, ...}, ...], startDate, endDate, specialDayFlags
      const { pets, startDate, endDate, specialDayFlags = [] } = req.body;
      if (!pets || !startDate || !endDate) {
        return res.status(400).json({ error: 'Missing required fields: pets[], startDate, endDate' });
      }
      for (const pet of pets) {
        if (!pet.type || !pet.weight) continue;
        totalPrice += calculateTotalPrice(pet.type, pet.weight, startDate, endDate, specialDayFlags);
      }
      details = { pets, startDate, endDate, specialDayFlags };
    } else {
      // กรณีส่ง type, weight, startDate, endDate, specialDayFlags แบบเดี่ยว
      const { type, weight, startDate, endDate, specialDayFlags = [] } = req.body;
      if (!type || !weight || !startDate || !endDate) {
        return res.status(400).json({ error: 'Missing required fields: type, weight, startDate, endDate' });
      }
      totalPrice = calculateTotalPrice(type, weight, startDate, endDate, specialDayFlags);
      details = { type, weight, startDate, endDate, specialDayFlags };
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
