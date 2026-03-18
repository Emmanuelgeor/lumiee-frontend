import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import WelcomeScreen from "../screens/WelcomeScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import ChildSelectScreen from "../screens/ChildSelectScreen";
import ContinueScreen from "../screens/ContinueScreen";
import ChatScreen from "../screens/ChatScreen";
import FavoritesScreen from "../screens/FavoritesScreen";
import VideoPlayer from "../screens/VideoPlayer";
import BookViewer from "../screens/BookViewer";

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
            <Stack.Screen name="ChildSelect" component={ChildSelectScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="ContinueLearning" component={ContinueScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="Favorites" component={FavoritesScreen} />
            <Stack.Screen name="VideoPlayer" component={VideoPlayer} />
            <Stack.Screen name="BookViewer" component={BookViewer} />
        </Stack.Navigator>
    );
}