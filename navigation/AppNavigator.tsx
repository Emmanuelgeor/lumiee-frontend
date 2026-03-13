import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import WelcomeScreen from "../screens/WelcomeScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import ChildSelectScreen from "../screens/ChildSelectScreen";

// temporary placeholders
import VideosScreen from "../screens/VideosScreen";
import BooksScreen from "../screens/BooksScreen";
import ContinueScreen from "../screens/ContinueScreen";
import ChatScreen from "../screens/ChatScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator({ initialRoute }: any) {
    return (
        <Stack.Navigator
            initialRouteName={initialRoute}
            screenOptions={{ headerShown: false }}
        >

            <Stack.Screen name="Welcome" component={WelcomeScreen} />

            <Stack.Screen name="Login" component={LoginScreen} />

            <Stack.Screen name="Register" component={RegisterScreen} />

            <Stack.Screen name="Home" component={HomeScreen} />

            {/* Screens used inside Home */}
            <Stack.Screen name="Videos" component={VideosScreen} />
            <Stack.Screen name="Books" component={BooksScreen} />
            <Stack.Screen name="ContinueLearning" component={ContinueScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="ChildSelect" component={ChildSelectScreen} />

        </Stack.Navigator>
    );
}