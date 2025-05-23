import { createContext, useContext, useState } from "react";

const PetIdContext = createContext();

export function PetIdProvider({ children }) {
  const [petId, setPetId] = useState(null);
  return (
    <PetIdContext.Provider value={{ petId, setPetId }}>
      {children}
    </PetIdContext.Provider>
  );
}

export function usePetId() {
  return useContext(PetIdContext);
}