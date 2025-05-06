import { useState } from "react";

export default function Checkbox() {
  const [selectedPets, setSelectedPets] = useState([]);
  const [PetQuery, setPetQuery] = useState("");

  function handlePetSelect(event) {
    const { value, checked } = event.target;

    setSelectedPets((prevSelectedPets) => {
      let updatedSelectedPets;
      if (checked) {
        updatedSelectedPets = [...prevSelectedPets, value];
      } else {
        updatedSelectedPets = prevSelectedPets.filter((pet) => pet !== value);
      }
      setPetQuery(updatedSelectedPets.join("&pet="));
      return updatedSelectedPets;
    });
  }

  return (
    <div className="w-full flex flex-col sm:flex-row sm:items-center">
      <span className="w-full max-w-[328px]">
        <div className="cursor-pointer sm:space-x-3">
          <input
            id="dog"
            type="checkbox"
            value="Dog"
            onChange={handlePetSelect}
            className="[--chkfg:white] border border-[var(--primary-gray-color-100)] hover:border-[var(--primary-orange-color-300)] focus:border-[var(--primary-orange-color-300)]"
          />
          <label htmlFor="dog" className="text-[16px] font-medium">
            Dog
          </label>
          <input
            id="cat"
            type="checkbox"
            value="Cat"
            onChange={handlePetSelect}
            className="[--chkfg:white] border border-[var(--primary-gray-color-100)] hover:border-[var(--primary-orange-color-300)] focus:border-[var(--primary-orange-color-300)]"
          />
          <label htmlFor="cat" className="text-[16px] font-medium">
            Cat
          </label>
          <input
            id="bird"
            type="checkbox"
            value="Bird"
            onChange={handlePetSelect}
            className="[--chkfg:white] border border-[var(--primary-gray-color-100)] hover:border-[var(--primary-orange-color-300)] focus:border-[var(--primary-orange-color-300)]"
          />
          <label htmlFor="bird" className="text-[16px] font-medium">
            Bird
          </label>
          <input
            id="rabbit"
            type="checkbox"
            value="Rabbit"
            onChange={handlePetSelect}
            className=" [--chkfg:white] border border-[var(--primary-gray-color-100)] hover:border-[var(--primary-orange-color-300)] focus:border-[var(--primary-orange-color-300)]"
          />
          <label
            htmlFor="rabbit"
            className="text-[16px] font-medium"
          >
            Rabbit
          </label>
        </div>
      </span>
    </div>
  );
}
