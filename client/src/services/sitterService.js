import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);


export const fetchSitters = async () => {
  console.log('Fetching sitters from Supabase...'); // LOG 1: จุดเริ่มต้น

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL or Anon Key is missing. Please check your .env.local file.');
    throw new Error('Supabase environment variables not set.');
  }

  // ดึงข้อมูล users มาด้วย (join)
  const { data, error } = await supabase
    .from('pet_sitter')
    .select('*, users(profile_image_url, name)');

  if (error) {
    console.error('Error fetching sitters from Supabase:', error); // LOG 2: หากเกิดข้อผิดพลาดในการดึงข้อมูล
    throw new Error(error.message); 
  }

  if (!data || !Array.isArray(data)) {
    console.warn("Supabase returned no data or data is not an array. Returning empty array."); // LOG 3: หากไม่มีข้อมูลหรือข้อมูลไม่ใช่ Array
    return []; 
  }

  console.log('Fetched raw sitters data (before mapping):', data); // LOG 4: ข้อมูลดิบที่ได้มา

  const mappedData = data.map((pet_sitter, index) => {
    console.log(`--- Processing pet_sitter at index ${index} ---`); // LOG 5: เริ่มประมวลผลแต่ละรายการ
    console.log('Current pet_sitter object:', pet_sitter);
    console.log('Type of Current pet_sitter:', typeof pet_sitter);

    if (!pet_sitter) {
        console.warn(`Skipping null/undefined record at index ${index} within Supabase data array.`);
        return null; 
    }

    console.log('Value of pet_sitter.user_id:', pet_sitter.user_id);
    console.log('Value of pet_sitter.trade_name:', pet_sitter.trade_name);
    console.log('Type of pet_sitter.trade_name:', typeof pet_sitter.trade_name);
    console.log('Value of pet_sitter.lat:', pet_sitter.lat);
    console.log('Value of pet_sitter.lng:', pet_sitter.lng);
    console.log('Value of pet_sitter.gallery_image_url:', pet_sitter.gallery_image_url);
    console.log('Value of pet_sitter.pet_type:', pet_sitter.pet_type);
    console.log('Value of pet_sitter.province:', pet_sitter.province);
    console.log('Value of pet_sitter.district:', pet_sitter.district);


    const transformedSitter = {
      id: pet_sitter?.user_id, 
      name: pet_sitter?.trade_name || `Pet Sitter ${pet_sitter?.user_id?.substring(0, 4) || 'Unknown'}`,
      lat: pet_sitter?.lat, 
      lng: pet_sitter?.lng,
      imageUrl: (Array.isArray(pet_sitter?.gallery_image_url) && pet_sitter.gallery_image_url.length > 0)
                  ? pet_sitter.gallery_image_url[0]
                  : '/images/default-sitter.jpg', 
      petTypes: pet_sitter?.pet_type || [], 
      province: pet_sitter?.province,
      district: pet_sitter?.district,
      rating: pet_sitter?.rating,
      users: pet_sitter?.users, 
    };

    console.log(`Transformed sitter at index ${index}:`, transformedSitter); // LOG 6: ข้อมูลที่แปลงแล้ว
    console.log('--- End processing pet_sitter ---');

    return { ...pet_sitter, ...transformedSitter }; 
  });

  const filteredMappedData = mappedData.filter(sitter => sitter !== null); 
  console.log('Fetched and mapped sitters (filtered):', filteredMappedData); // LOG 7: ข้อมูลสุดท้ายหลังกรอง

  return filteredMappedData; 
};