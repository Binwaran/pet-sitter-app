import provinces from "@/app/data/provinces.json";
import districts from "@/app/data/districts.json";
import subdistricts from "@/app/data/subdistricts.json";

// ฟังก์ชันช่วยหา province code จากชื่อ
export function findProvinceCodeByName(provinceName) {
  if (!provinceName) return null;
  const province = provinces.find(
    (p) =>
      p.provinceNameEn.toLowerCase() === provinceName.toLowerCase() ||
      p.provinceNameTh === provinceName
  );
  return province ? province.provinceCode : null;
}

// ฟังก์ชันช่วยหา district code จากชื่อและ province code
export function findDistrictCodeByName(districtName, provinceCode) {
  if (!districtName) return null;
  const district = districts.find(
    (d) =>
      (d.districtNameEn.toLowerCase() === districtName.toLowerCase() ||
        d.districtNameTh === districtName) &&
      (!provinceCode || d.provinceCode === parseInt(provinceCode))
  );
  return district ? district.districtCode : null;
}

// ฟังก์ชันช่วยหา subdistrict code จากชื่อและ district code
export function findSubDistrictCodeByName(subDistrictName, districtCode) {
  if (!subDistrictName) return null;
  const subdistrict = subdistricts.find(
    (sd) =>
      (sd.subdistrictNameEn.toLowerCase() === subDistrictName.toLowerCase() ||
        sd.subdistrictNameTh === subDistrictName) &&
      (!districtCode || sd.districtCode === parseInt(districtCode))
  );
  return subdistrict ? subdistrict.subdistrictCode : null;
}
