import React, { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Animated,
    Image,
    TextInput,
    Dimensions,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

const { width, height } = Dimensions.get("window");
const STAR_COUNT = 10;

export default function HomeScreen({ navigation, route }: any) {
    const childName = route?.params?.childName || "friend";

    const [menuOpen, setMenuOpen] = useState(false);
    const [showBubble, setShowBubble] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const [message, setMessage] = useState("");

    const lumieY = useRef(new Animated.Value(120)).current;
    const lumieScale = useRef(new Animated.Value(0.7)).current;
    const bubbleOpacity = useRef(new Animated.Value(0)).current;
    const actionsOpacity = useRef(new Animated.Value(0)).current;
    const actionsY = useRef(new Animated.Value(20)).current;
    const waveAnim = useRef(new Animated.Value(0)).current;
    const menuX = useRef(new Animated.Value(-240)).current;

    const starAnimations = useRef(
        Array.from({ length: STAR_COUNT }, () => ({
            y: new Animated.Value(Math.random() * height),
            x: Math.random() * width,
            size: 8 + Math.random() * 10,
            duration: 2500 + Math.random() * 3000,
            delay: Math.random() * 2000,
        }))
    ).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(lumieY, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(lumieScale, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setShowBubble(true);

            Animated.timing(bubbleOpacity, {
                toValue: 1,
                duration: 450,
                useNativeDriver: true,
            }).start(() => {
                setTimeout(() => {
                    setShowActions(true);
                    Animated.parallel([
                        Animated.timing(actionsOpacity, {
                            toValue: 1,
                            duration: 400,
                            useNativeDriver: true,
                        }),
                        Animated.timing(actionsY, {
                            toValue: 0,
                            duration: 400,
                            useNativeDriver: true,
                        }),
                    ]).start();
                }, 500);
            });
        });

        Animated.loop(
            Animated.sequence([
                Animated.timing(waveAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(waveAnim, {
                    toValue: -1,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        starAnimations.forEach((star) => {
            const animateStar = () => {
                star.y.setValue(-20);
                Animated.sequence([
                    Animated.delay(star.delay),
                    Animated.timing(star.y, {
                        toValue: height + 40,
                        duration: star.duration,
                        useNativeDriver: true,
                    }),
                ]).start(() => animateStar());
            };
            animateStar();
        });
    }, []);

    const waveDeg = waveAnim.interpolate({
        inputRange: [-1, 1],
        outputRange: ["-5deg", "5deg"],
    });

    const toggleMenu = () => {
        if (menuOpen) {
            Animated.timing(menuX, {
                toValue: -240,
                duration: 250,
                useNativeDriver: true,
            }).start(() => setMenuOpen(false));
        } else {
            setMenuOpen(true);
            Animated.timing(menuX, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
    };

    const handleSignOut = async () => {
        try {
            const user = auth.currentUser;
            if (user) {
                await AsyncStorage.removeItem(`kids_profiles_${user.uid}`);
            }

            await signOut(auth);
            navigation.replace("Login");
        } catch (error) {
            console.log("Sign out error:", error);
            Alert.alert("Error", "Could not sign out. Please try again.");
        }
    };

    const confirmSignOut = () => {
        Alert.alert("Sign Out", "Are you sure you want to sign out?", [
            { text: "Cancel", style: "cancel" },
            { text: "Sign Out", onPress: handleSignOut },
        ]);
    };

    return (
        <LinearGradient colors={["#FFB703", "#FB8500"]} style={styles.container}>
            <SafeAreaView style={styles.safe}>
                {/* Stars */}
                <View style={styles.starsLayer} pointerEvents="none">
                    {starAnimations.map((star, index) => (
                        <Animated.Text
                            key={index}
                            style={[
                                styles.star,
                                {
                                    left: star.x,
                                    fontSize: star.size,
                                    transform: [{ translateY: star.y }],
                                },
                            ]}
                        >
                            ✦
                        </Animated.Text>
                    ))}
                </View>

                {/* Menu button */}
                <Pressable style={styles.menuBtn} onPress={toggleMenu}>
                    <Text style={styles.menuIcon}>☰</Text>
                </Pressable>

                {/* Side menu */}
                {menuOpen && (
                    <Pressable style={styles.menuOverlay} onPress={toggleMenu}>
                        <Animated.View
                            style={[styles.sideMenu, { transform: [{ translateX: menuX }] }]}
                        >
                            <Text style={styles.menuTitle}>{childName}</Text>
                            <Text style={styles.menuSub}>Learner</Text>

                            <Pressable style={styles.menuItem}>
                                <Text style={styles.menuItemText}>Parent Area</Text>
                            </Pressable>
                            <Pressable
                                style={styles.menuItem}
                                onPress={() => navigation.replace("ChildSelect")}
                            >
                                <Text style={styles.menuItemText}>Switch User</Text>
                            </Pressable>

                            <Pressable style={styles.menuItem}>
                                <Text style={styles.menuItemText}>Downloads</Text>
                            </Pressable>

                            <Pressable style={styles.menuItem} onPress={confirmSignOut}>
                                <Text style={styles.menuItemText}>Sign Out</Text>
                            </Pressable>
                        </Animated.View>
                    </Pressable>
                )}

                {/* Main content */}
                <View style={styles.content}>
                    <Animated.View
                        style={{
                            transform: [
                                { translateY: lumieY },
                                { scale: lumieScale },
                                { rotate: waveDeg },
                            ],
                            alignItems: "center",
                        }}
                    >
                        <Image
                            source={require("../assets/images/lumiee4.png")}
                            style={styles.lumiee}
                            resizeMode="contain"
                        />
                    </Animated.View>

                    {showBubble && (
                        <Animated.View style={[styles.bubble, { opacity: bubbleOpacity }]}>
                            <Text style={styles.bubbleText}>
                                Hi, {childName}!{"\n"}
                                I’m Lumiee ☀️{"\n"}
                                I’m here to help you learn, explore books, and watch fun videos.
                            </Text>
                        </Animated.View>
                    )}

                    {showActions && (
                        <Animated.View
                            style={{
                                width: "100%",
                                opacity: actionsOpacity,
                                transform: [{ translateY: actionsY }],
                            }}
                        >
                            <Text style={styles.sectionTitle}>
                                What would you like to explore today?
                            </Text>

                            <Pressable
                                style={styles.actionCard}
                                onPress={() => navigation.navigate("Videos")}
                            >
                                <Text style={styles.actionEmoji}>🎬</Text>
                                <Text style={styles.actionText}>Watch Videos</Text>
                            </Pressable>

                            <Pressable
                                style={styles.actionCard}
                                onPress={() => navigation.navigate("Books")}
                            >
                                <Text style={styles.actionEmoji}>📚</Text>
                                <Text style={styles.actionText}>Find a Book</Text>
                            </Pressable>

                            <Pressable
                                style={styles.actionCard}
                                onPress={() => navigation.navigate("ContinueLearning")}
                            >
                                <Text style={styles.actionEmoji}>🧠</Text>
                                <Text style={styles.actionText}>Continue Where You Left Off</Text>
                            </Pressable>
                        </Animated.View>
                    )}
                </View>

                {/* Chat bar */}
                <View style={styles.chatBar}>
                    <TextInput
                        value={message}
                        onChangeText={setMessage}
                        placeholder="Chat with Lumiee..."
                        placeholderTextColor="rgba(255,255,255,0.8)"
                        style={styles.chatInput}
                    />
                    <Pressable
                        style={styles.sendBtn}
                        onPress={() => navigation.navigate("Chat", { message })}
                    >
                        <Text style={styles.sendText}>Send</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safe: { flex: 1 },

    starsLayer: {
        ...StyleSheet.absoluteFillObject,
    },
    star: {
        position: "absolute",
        color: "rgba(255,255,255,0.55)",
    },

    menuBtn: {
        position: "absolute",
        top: 56,
        left: 18,
        zIndex: 20,
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: "rgba(255,255,255,0.22)",
        alignItems: "center",
        justifyContent: "center",
    },
    menuIcon: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "900",
    },

    menuOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 30,
    },
    sideMenu: {
        width: 220,
        height: "100%",
        backgroundColor: "rgba(255,255,255,0.92)",
        paddingTop: 90,
        paddingHorizontal: 18,
    },
    menuTitle: {
        fontSize: 22,
        fontWeight: "900",
        color: "#222",
    },
    menuSub: {
        color: "#666",
        marginBottom: 18,
    },
    menuItem: {
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    menuItemText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#333",
    },

    content: {
        flex: 1,
        paddingTop: 70,
        paddingHorizontal: 20,
        alignItems: "center",
    },
    lumiee: {
        width: 220,
        height: 220,
        marginBottom: 10,
    },

    bubble: {
        width: "100%",
        backgroundColor: "rgba(255,255,255,0.92)",
        borderRadius: 20,
        padding: 16,
        marginBottom: 18,
    },
    bubbleText: {
        textAlign: "center",
        color: "#333",
        fontSize: 15,
        lineHeight: 22,
        fontWeight: "700",
    },

    sectionTitle: {
        textAlign: "center",
        color: "#fff",
        fontWeight: "900",
        fontSize: 18,
        marginBottom: 14,
    },

    actionCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        backgroundColor: "rgba(255,255,255,0.22)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.35)",
        borderRadius: 18,
        paddingVertical: 15,
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    actionEmoji: {
        fontSize: 24,
    },
    actionText: {
        color: "#fff",
        fontWeight: "800",
        fontSize: 16,
    },

    chatBar: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 10,
    },
    chatInput: {
        flex: 1,
        height: 52,
        borderRadius: 18,
        backgroundColor: "rgba(255,255,255,0.20)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.35)",
        paddingHorizontal: 16,
        color: "#fff",
        fontWeight: "700",
    },
    sendBtn: {
        height: 52,
        paddingHorizontal: 18,
        borderRadius: 18,
        backgroundColor: "rgba(255,255,255,0.28)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.40)",
        alignItems: "center",
        justifyContent: "center",
    },
    sendText: {
        color: "#fff",
        fontWeight: "900",
    },
});