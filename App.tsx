import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "./firebase/firebaseConfig";
import AppNavigator from "./navigation/AppNavigator";

export default function App() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setInitialRoute("ChildSelect");
      } else {
        setInitialRoute("Welcome");
      }
    });

    return unsubscribe;
  }, []);

  if (!initialRoute) return null;

  return (
    <NavigationContainer>
      <AppNavigator initialRoute={initialRoute} />
    </NavigationContainer>
  );
}