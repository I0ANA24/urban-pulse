"use client";

import React, { createContext, useContext, useState } from "react";

interface CrisisModeContextType {
  isCrisisActive: boolean;
  setIsCrisisActive: (active: boolean) => void;
}

const CrisisModeContext = createContext<CrisisModeContextType>({
  isCrisisActive: false,
  setIsCrisisActive: () => {},
});

export const CrisisModeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isCrisisActive, setIsCrisisActive] = useState(false);

  return (
    <CrisisModeContext.Provider value={{ isCrisisActive, setIsCrisisActive }}>
      {children}
    </CrisisModeContext.Provider>
  );
};

export const useCrisisMode = () => useContext(CrisisModeContext);
