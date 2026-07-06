import { useState, useEffect } from "react";
import { DataContext } from "./DataContext";
import socket from "../utils/socket";
import { getCurrentUser } from "../utils/api";

const DataProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);


  useEffect(() => {
    const restorUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setAuthChecked(true);
    };
    restorUser();
  }, []);

  return (
    <DataContext.Provider value={{ user, setUser, socket, authChecked }}>
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;