"use client";

import React, { createContext, useContext, useState } from "react";

interface EventContextType {
  event: string | undefined;
  setEvent: (event: string) => void;
  clearEvent: () => void;
}

const EventContext = createContext<EventContextType>({
  event: undefined,
  setEvent: () => {},
  clearEvent: () => {},
});

export const EventProvider = ({ children }: { children: React.ReactNode }) => {
  const [event, setEventState] = useState<string | undefined>(undefined);

  const setEvent = (text: string) => setEventState(text);
  const clearEvent = () => setEventState(undefined);

  return (
    <EventContext.Provider value={{ event, setEvent, clearEvent }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = () => useContext(EventContext);
