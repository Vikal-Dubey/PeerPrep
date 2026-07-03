import { useState } from "react";
import { DataContext } from "./DataContext";
import socket from "../utils/socket";

const DataProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  return (
    <DataContext.Provider value={{ user, setUser, socket }}>
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;