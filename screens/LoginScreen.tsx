import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TextInput,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

export default function LoginScreen({ navigation }: any) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [remember, setRemember] = useState(true);
    const [loading, setLoading] = useState(false);

    // Cute head-tilt animation for Lumiee
    const tilt = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(tilt, { toValue: 1, duration: 900, useNativeDriver: true }),
                Animated.timing(tilt, { toValue: -1, duration: 900, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    const tiltDeg = tilt.interpolate({
        inputRange: [-1, 1],
        outputRange: ["-6deg", "6deg"],
    });

    const onLogin = async () => {
        try {
            setLoading(true);

            if (!email.trim() || !password.trim()) {
                alert("Please enter email and password.");
                return;
            }

            await signInWithEmailAndPassword(
                auth,
                email.trim(),
                password
            );

            alert("Login successful!");
            navigation.replace("ChildSelect");

        } catch (error: any) {
            alert("Invalid email or password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient colors={["#FFB703", "#FB8500"]} style={styles.container}>
            <View style={styles.doodles}>
                <Text style={[styles.doodle, { top: 70, left: 18 }]}>📚</Text>
                <Text style={[styles.doodle, { top: 140, right: 22 }]}>🎬</Text>
                <Text style={[styles.doodle, { top: 260, left: 26 }]}>🧩</Text>
                <Text style={[styles.doodle, { bottom: 180, right: 28 }]}>🖍️</Text>
                <Text style={[styles.doodle, { bottom: 90, left: 20 }]}>⭐</Text>
            </View>

            <SafeAreaView style={styles.safe}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    style={{ flex: 1, justifyContent: "center" }}
                >
                    <View style={styles.card}>
                        <Animated.Image
                            source={require("../assets/images/lumiee2.png")}
                            style={[styles.lumiee, { transform: [{ rotate: tiltDeg }] }]}
                            resizeMode="contain"
                        />

                        <Text style={styles.title}>Parent Login</Text>
                        <Text style={styles.subtitle}>
                            Welcome back! Please login to continue.
                        </Text>

                        <View style={styles.inputWrap}>
                            <Ionicons name="mail-outline" size={18} color="#fff" />
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Email"
                                placeholderTextColor="rgba(255,255,255,0.75)"
                                autoCapitalize="none"
                                keyboardType="email-address"
                                style={styles.input}
                            />
                        </View>

                        <View style={styles.inputWrap}>
                            <Ionicons name="lock-closed-outline" size={18} color="#fff" />
                            <TextInput
                                value={password}
                                onChangeText={setPassword}
                                placeholder="Password"
                                placeholderTextColor="rgba(255,255,255,0.75)"
                                secureTextEntry={!showPass}
                                autoCapitalize="none"
                                style={styles.input}
                            />
                            <Pressable onPress={() => setShowPass((s) => !s)} hitSlop={10}>
                                <Ionicons
                                    name={showPass ? "eye-off-outline" : "eye-outline"}
                                    size={18}
                                    color="#fff"
                                />
                            </Pressable>
                        </View>

                        <Pressable
                            style={styles.rememberRow}
                            onPress={() => setRemember((r) => !r)}
                            hitSlop={8}
                        >
                            <View style={[styles.checkbox, remember && styles.checkboxOn]}>
                                {remember ? <Ionicons name="checkmark" size={14} color="#222" /> : null}
                            </View>
                            <Text style={styles.rememberText}>Remember me</Text>
                        </Pressable>

                        <Pressable style={styles.loginBtn} onPress={onLogin} disabled={loading}>
                            <Text style={styles.loginBtnText}>
                                {loading ? "Logging in..." : "Login"}
                            </Text>
                        </Pressable>

                        <View style={styles.footerRow}>
                            <Text style={styles.footerText}>Don’t have an account?</Text>
                            <Pressable onPress={() => navigation.navigate("Register")}>
                                <Text style={styles.footerLink}> Sign Up</Text>
                            </Pressable>
                        </View>
                    </View>

                    <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back" size={22} color="#fff" />
                        <Text style={styles.backText}>Back</Text>
                    </Pressable>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safe: { flex: 1, paddingHorizontal: 18 },

    doodles: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.22,
    },
    doodle: {
        position: "absolute",
        fontSize: 36,
    },

    card: {
        borderRadius: 26,
        padding: 18,
        paddingTop: 26,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.35)",
        backgroundColor: "rgba(255,255,255,0.18)",
        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 10 },
        elevation: 6,
    },

    lumiee: {
        width: 220,
        height: 220,
        alignSelf: "center",
        marginBottom: 10,
    },

    title: {
        fontSize: 24,
        fontWeight: "900",
        color: "#fff",
        textAlign: "center",
        marginTop: 4,
    },
    subtitle: {
        fontSize: 13,
        color: "rgba(255,255,255,0.85)",
        textAlign: "center",
        marginBottom: 16,
        marginTop: 4,
    },

    inputWrap: {
        height: 52,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.45)",
        backgroundColor: "rgba(0,0,0,0.12)",
        paddingHorizontal: 12,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 12,
    },
    input: {
        flex: 1,
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
    },

    rememberRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 14,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.7)",
        backgroundColor: "transparent",
        alignItems: "center",
        justifyContent: "center",
    },
    checkboxOn: {
        backgroundColor: "#FFD166",
        borderColor: "#FFD166",
    },
    rememberText: {
        color: "rgba(255,255,255,0.92)",
        fontSize: 13,
        fontWeight: "700",
    },

    loginBtn: {
        height: 54,
        borderRadius: 18,
        backgroundColor: "rgba(255,255,255,0.25)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.55)",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 2,
    },
    loginBtnText: {
        color: "#fff",
        fontWeight: "900",
        fontSize: 18,
        letterSpacing: 0.2,
    },

    footerRow: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 14,
    },
    footerText: {
        color: "rgba(255,255,255,0.85)",
        fontWeight: "700",
        fontSize: 13,
    },
    footerLink: {
        color: "#fff",
        fontWeight: "900",
        fontSize: 13,
        textDecorationLine: "underline",
    },

    backBtn: {
        alignSelf: "center",
        marginTop: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        opacity: 0.9,
    },
    backText: { color: "#fff", fontWeight: "800" },
});