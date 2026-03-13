import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, SafeAreaView, Pressable, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function WelcomeScreen({ navigation }: any) {
    // Intro sequence animations
    const lumieTranslateY = useRef(new Animated.Value(80)).current; // start lower
    const lumieScale = useRef(new Animated.Value(0.6)).current;     // start smaller
    const bubbleOpacity = useRef(new Animated.Value(0)).current;    // hidden
    const buttonsOpacity = useRef(new Animated.Value(0)).current;   // hidden
    const buttonsTranslateY = useRef(new Animated.Value(30)).current;

    // Cute “alive” movement after intro
    const idleBounce = useRef(new Animated.Value(0)).current;
    const waveAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // 1) Lumiee walks in + grows
        // 2) Show speech bubble
        // 3) Pop buttons
        Animated.sequence([
            Animated.parallel([
                Animated.timing(lumieTranslateY, {
                    toValue: 0,
                    duration: 900,
                    useNativeDriver: true,
                }),
                Animated.timing(lumieScale, {
                    toValue: 1,
                    duration: 900,
                    useNativeDriver: true,
                }),
            ]),
            Animated.timing(bubbleOpacity, {
                toValue: 1,
                duration: 450,
                useNativeDriver: true,
            }),
            Animated.parallel([
                Animated.timing(buttonsOpacity, {
                    toValue: 1,
                    duration: 450,
                    useNativeDriver: true,
                }),
                Animated.timing(buttonsTranslateY, {
                    toValue: 0,
                    duration: 450,
                    useNativeDriver: true,
                }),
            ]),
        ]).start(() => {
            // After intro finishes, start idle animations (gentle bounce + wave)
            Animated.loop(
                Animated.sequence([
                    Animated.timing(idleBounce, { toValue: -6, duration: 350, useNativeDriver: true }),
                    Animated.timing(idleBounce, { toValue: 0, duration: 350, useNativeDriver: true }),
                ])
            ).start();

            Animated.loop(
                Animated.sequence([
                    Animated.timing(waveAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
                    Animated.timing(waveAnim, { toValue: -1, duration: 300, useNativeDriver: true }),
                ])
            ).start();
        });
    }, []);

    const waveRotation = waveAnim.interpolate({
        inputRange: [-1, 1],
        outputRange: ["-8deg", "8deg"],
    });

    return (
        <LinearGradient colors={["#FFB703", "#FB8500"]} style={styles.container}>
            <SafeAreaView style={styles.safe}>
                {/* TOP: Lumiee entrance */}
                <View style={styles.topSection}>
                    <Animated.View
                        style={{
                            transform: [
                                { translateY: lumieTranslateY },
                                { translateY: idleBounce }, // starts after intro
                                { scale: lumieScale },
                            ],
                            alignSelf: "center",
                        }}
                    >
                        <Animated.Image
                            source={require("../assets/images/lumiee.png")}
                            style={[styles.lumiee, { transform: [{ rotate: waveRotation }] }]}
                            resizeMode="contain"
                        />
                    </Animated.View>
                </View>

                {/* MIDDLE: Intro text appears */}
                <View style={styles.middleSection}>
                    <Animated.View style={[styles.speechBubble, { opacity: bubbleOpacity }]}>
                        <Text style={styles.speechText}>
                            Hi! I’m Lumiee ☀️{"\n"}
                            I’m your learning buddy.{"\n"}
                            I help kids discover safe books and videos in a fun and friendly way!
                        </Text>
                    </Animated.View>
                </View>

                {/* BOTTOM: Login/Signup pop up */}
                <View style={styles.bottomSection}>
                    <Animated.View
                        style={{
                            opacity: buttonsOpacity,
                            transform: [{ translateY: buttonsTranslateY }],
                        }}
                    >
                        <View style={styles.buttonRow}>
                            <Pressable style={styles.loginBtn} onPress={() => navigation.navigate("Login")}>
                                <Text style={styles.loginText}>Login</Text>
                            </Pressable>

                            <Pressable style={styles.signupBtn} onPress={() => navigation.navigate("Register")}>
                                <Text style={styles.signupText}>Sign Up</Text>
                            </Pressable>
                        </View>
                    </Animated.View>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safe: { flex: 1, paddingHorizontal: 20 },

    topSection: {
        flex: 5,
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 10,
    },
    lumiee: {
        width: 320,
        height: 320,
    },

    middleSection: {
        flex: 2,
        width: "100%",
        justifyContent: "center",
    },
    speechBubble: {
        backgroundColor: "rgba(255,255,255,0.95)",
        borderRadius: 18,
        padding: 16,
        width: "100%",
    },
    speechText: {
        fontSize: 15,
        color: "#333",
        textAlign: "center",
        lineHeight: 22,
        fontWeight: "600",
    },

    bottomSection: {
        flex: 2,
        width: "100%",
        justifyContent: "flex-end",
        paddingBottom: 18,
    },
    buttonRow: {
        flexDirection: "row",
        gap: 12,
        width: "100%",
    },
    loginBtn: {
        flex: 1,
        height: 52,
        borderRadius: 16,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
    },
    signupBtn: {
        flex: 1,
        height: 52,
        borderRadius: 16,
        backgroundColor: "#FFD166",
        justifyContent: "center",
        alignItems: "center",
    },
    loginText: { fontWeight: "900", fontSize: 16, color: "#222" },
    signupText: { fontWeight: "900", fontSize: 16, color: "#222" },
});