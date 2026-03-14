import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Animated,
    Image,
    TextInput,
    FlatList,
    Dimensions,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

type ChatCard = {
    id: string;
    type: "video" | "book";
    title: string;
    subtitle?: string;
    image?: string;
    actionLabel: string;
};

type ChatMessage = {
    id: string;
    sender: "bot" | "child";
    text: string;
    cards?: ChatCard[];
};

export default function ChatScreen({ navigation, route }: any) {
    const mode: "video" | "book" | "chat" = route?.params?.mode || "chat";
    const initialMessage = route?.params?.initialMessage || "";
    const childName = route?.params?.childName || "friend";

    const [menuOpen, setMenuOpen] = useState(false);
    const [input, setInput] = useState(initialMessage);
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    const tilt = useRef(new Animated.Value(0)).current;
    const menuX = useRef(new Animated.Value(-240)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(tilt, {
                    toValue: 1,
                    duration: 900,
                    useNativeDriver: true,
                }),
                Animated.timing(tilt, {
                    toValue: -1,
                    duration: 900,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    useEffect(() => {
        if (mode === "video") {
            setMessages([
                {
                    id: "1",
                    sender: "bot",
                    text: `Hi ${childName}! What kind of video would you like to watch today?`,
                    cards: [
                        {
                            id: "v1",
                            type: "video",
                            title: "Animals",
                            subtitle: "Fun learning videos",
                            actionLabel: "Choose",
                        },
                        {
                            id: "v2",
                            type: "video",
                            title: "Science",
                            subtitle: "Simple experiments",
                            actionLabel: "Choose",
                        },
                    ],
                },
            ]);
        } else if (mode === "book") {
            setMessages([
                {
                    id: "1",
                    sender: "bot",
                    text: `Hi ${childName}! What kind of book would you like to read?`,
                    cards: [
                        {
                            id: "b1",
                            type: "book",
                            title: "Story Books",
                            subtitle: "Fun bedtime stories",
                            actionLabel: "Choose",
                        },
                        {
                            id: "b2",
                            type: "book",
                            title: "Learning Books",
                            subtitle: "Science, nature and more",
                            actionLabel: "Choose",
                        },
                    ],
                },
            ]);
        } else {
            setMessages([
                {
                    id: "1",
                    sender: "bot",
                    text: `Hi ${childName}! I’m Lumiee ☀️ What would you like to learn today?`,
                },
            ]);
        }
    }, [mode, childName]);

    const tiltDeg = tilt.interpolate({
        inputRange: [-1, 1],
        outputRange: ["-5deg", "5deg"],
    });

    const lumieeSource = useMemo(() => {
        if (mode === "book") {
            return require("../assets/images/lumiee_book.png");
        }
        return require("../assets/images/lumiee_video.png");
    }, [mode]);

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

    const openQuickMode = (nextMode: "video" | "book" | "chat") => {
        navigation.replace("Chat", {
            mode: nextMode,
            childName,
        });
    };

    const sendMessage = () => {
        if (!input.trim()) return;

        const childMsg: ChatMessage = {
            id: `${Date.now()}-child`,
            sender: "child",
            text: input.trim(),
        };

        const lower = input.trim().toLowerCase();

        let botReply: ChatMessage = {
            id: `${Date.now()}-bot`,
            sender: "bot",
            text: "That sounds fun! Here are some things you might like.",
        };

        if (lower.includes("tree") || lower.includes("plant")) {
            if (mode === "book") {
                botReply = {
                    id: `${Date.now()}-bot`,
                    sender: "bot",
                    text: "Great choice! Here are some tree books for you.",
                    cards: [
                        {
                            id: "book-tree-1",
                            type: "book",
                            title: "All About Trees",
                            subtitle: "Ages 6-9",
                            actionLabel: "Read",
                        },
                        {
                            id: "book-tree-2",
                            type: "book",
                            title: "The Magic Forest",
                            subtitle: "Story book",
                            actionLabel: "Read",
                        },
                    ],
                };
            } else {
                botReply = {
                    id: `${Date.now()}-bot`,
                    sender: "bot",
                    text: "Yay! Here are some tree videos for you.",
                    cards: [
                        {
                            id: "video-tree-1",
                            type: "video",
                            title: "Trees for Kids",
                            subtitle: "Nature learning",
                            actionLabel: "Watch",
                        },
                        {
                            id: "video-tree-2",
                            type: "video",
                            title: "How Trees Grow",
                            subtitle: "Simple science",
                            actionLabel: "Watch",
                        },
                    ],
                };
            }
        } else if (lower.includes("animal")) {
            botReply = {
                id: `${Date.now()}-bot`,
                sender: "bot",
                text: "Here are some fun animal picks!",
                cards: [
                    {
                        id: "animal-1",
                        type: mode === "book" ? "book" : "video",
                        title: mode === "book" ? "Animal Stories" : "Animals for Kids",
                        subtitle: "Ages 5-8",
                        actionLabel: mode === "book" ? "Read" : "Watch",
                    },
                    {
                        id: "animal-2",
                        type: mode === "book" ? "book" : "video",
                        title: mode === "book" ? "Jungle Adventure" : "Wild Animal World",
                        subtitle: "Fun learning",
                        actionLabel: mode === "book" ? "Read" : "Watch",
                    },
                ],
            };
        } else if (lower.includes("video")) {
            botReply = {
                id: `${Date.now()}-bot`,
                sender: "bot",
                text: "Sure! What kind of video would you like?",
            };
        } else if (lower.includes("book") || lower.includes("story")) {
            botReply = {
                id: `${Date.now()}-bot`,
                sender: "bot",
                text: "Lovely! What kind of book would you like to read?",
            };
        }

        setMessages((prev) => [...prev, childMsg, botReply]);
        setInput("");
    };

    const handleCardPress = (card: ChatCard) => {
        if (card.type === "video") {
            Alert.alert("Video", `Open video: ${card.title}`);
        } else {
            Alert.alert("Book", `Open book: ${card.title}`);
        }
    };

    const renderMessage = ({ item }: { item: ChatMessage }) => {
        const isBot = item.sender === "bot";

        return (
            <View style={[styles.messageWrap, isBot ? styles.leftAlign : styles.rightAlign]}>
                {isBot && (
                    <Image
                        source={lumieeSource}
                        style={styles.smallLumiee}
                        resizeMode="contain"
                    />
                )}

                <View style={[styles.bubble, isBot ? styles.botBubble : styles.childBubble]}>
                    <Text style={[styles.bubbleText, isBot ? styles.botText : styles.childText]}>
                        {item.text}
                    </Text>
                </View>

                {item.cards && item.cards.length > 0 && (
                    <View style={styles.cardsRow}>
                        {item.cards.map((card) => (
                            <Pressable
                                key={card.id}
                                style={styles.card}
                                onPress={() => handleCardPress(card)}
                            >
                                <LinearGradient
                                    colors={
                                        card.type === "video"
                                            ? ["#ffffff", "#fff1de"]
                                            : ["#ffffff", "#efe5ff"]
                                    }
                                    style={styles.cardInner}
                                >
                                    <View style={styles.cardThumb}>
                                        <Text style={styles.cardThumbEmoji}>
                                            {card.type === "video" ? "🎬" : "📚"}
                                        </Text>
                                    </View>

                                    <Text style={styles.cardTitle}>{card.title}</Text>
                                    {!!card.subtitle && <Text style={styles.cardSubtitle}>{card.subtitle}</Text>}

                                    <Pressable style={styles.cardButton}>
                                        <Text style={styles.cardButtonText}>{card.actionLabel}</Text>
                                    </Pressable>
                                </LinearGradient>
                            </Pressable>
                        ))}
                    </View>
                )}
            </View>
        );
    };

    return (
        <LinearGradient colors={["#f7dff0", "#d8ecff", "#fff4cb"]} style={styles.container}>
            <SafeAreaView style={styles.safe}>
                <Pressable style={styles.menuBtn} onPress={toggleMenu}>
                    <Text style={styles.menuIcon}>☰</Text>
                </Pressable>

                {menuOpen && (
                    <Pressable style={styles.menuOverlay} onPress={toggleMenu}>
                        <Animated.View
                            style={[styles.sideMenu, { transform: [{ translateX: menuX }] }]}
                        >
                            <Text style={styles.menuTitle}>{childName}</Text>
                            <Text style={styles.menuSub}>Learner</Text>

                            <Pressable style={styles.menuItem} onPress={() => navigation.replace("ChildSelect")}>
                                <Text style={styles.menuItemText}>Switch User</Text>
                            </Pressable>

                            <Pressable style={styles.menuItem}>
                                <Text style={styles.menuItemText}>My Family</Text>
                            </Pressable>

                            <Pressable style={styles.menuItem}>
                                <Text style={styles.menuItemText}>Parent Area</Text>
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

                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Ask Lumiee!</Text>

                    <Animated.Image
                        source={lumieeSource}
                        style={[styles.headerLumiee, { transform: [{ rotate: tiltDeg }] }]}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.quickRow}>
                    <Pressable
                        style={[styles.quickBtn, mode === "video" && styles.quickBtnActive]}
                        onPress={() => openQuickMode("video")}
                    >
                        <Text style={styles.quickBtnText}>🎬 Video</Text>
                    </Pressable>

                    <Pressable
                        style={[styles.quickBtn, mode === "book" && styles.quickBtnActive]}
                        onPress={() => openQuickMode("book")}
                    >
                        <Text style={styles.quickBtnText}>📚 Book</Text>
                    </Pressable>

                    <Pressable
                        style={[styles.quickBtn, mode === "chat" && styles.quickBtnActive]}
                        onPress={() => openQuickMode("chat")}
                    >
                        <Text style={styles.quickBtnText}>💬 Chat</Text>
                    </Pressable>
                </View>

                <FlatList
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.chatList}
                    showsVerticalScrollIndicator={false}
                />

                <View style={styles.inputBar}>
                    <Pressable style={styles.emojiBtn}>
                        <Text style={styles.emojiText}>😊</Text>
                    </Pressable>

                    <TextInput
                        value={input}
                        onChangeText={setInput}
                        placeholder="Type a message..."
                        placeholderTextColor="#8b93b9"
                        style={styles.input}
                    />

                    <Pressable style={styles.micBtn} onPress={sendMessage}>
                        <Text style={styles.micText}>➤</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safe: { flex: 1 },

    menuBtn: {
        position: "absolute",
        top: 54,
        left: 16,
        zIndex: 20,
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: "rgba(255,255,255,0.65)",
        alignItems: "center",
        justifyContent: "center",
    },
    menuIcon: {
        color: "#445",
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
        backgroundColor: "rgba(255,255,255,0.96)",
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

    header: {
        paddingTop: 18,
        paddingHorizontal: 18,
        paddingBottom: 10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: "900",
        color: "#ffb92f",
        marginLeft: 58,
    },
    headerLumiee: {
        width: 90,
        height: 90,
    },

    quickRow: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 10,
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    quickBtn: {
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 18,
        backgroundColor: "rgba(255,255,255,0.70)",
    },
    quickBtnActive: {
        backgroundColor: "#8dc6ff",
    },
    quickBtnText: {
        color: "#324",
        fontWeight: "800",
        fontSize: 14,
    },

    chatList: {
        paddingHorizontal: 14,
        paddingBottom: 16,
    },

    messageWrap: {
        marginBottom: 14,
    },
    leftAlign: {
        alignItems: "flex-start",
    },
    rightAlign: {
        alignItems: "flex-end",
    },

    smallLumiee: {
        width: 48,
        height: 48,
        marginBottom: 6,
    },

    bubble: {
        maxWidth: width * 0.76,
        borderRadius: 22,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    botBubble: {
        backgroundColor: "#fff3b2",
        borderBottomLeftRadius: 8,
    },
    childBubble: {
        backgroundColor: "#65aaf7",
        borderBottomRightRadius: 8,
    },
    bubbleText: {
        fontSize: 16,
        lineHeight: 24,
        fontWeight: "700",
    },
    botText: {
        color: "#333",
    },
    childText: {
        color: "#fff",
    },

    cardsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        marginTop: 12,
        width: "100%",
    },
    card: {
        width: (width - 40) / 2 - 8,
        borderRadius: 20,
        overflow: "hidden",
    },
    cardInner: {
        borderRadius: 20,
        padding: 10,
        minHeight: 220,
        justifyContent: "space-between",
    },
    cardThumb: {
        height: 110,
        borderRadius: 14,
        backgroundColor: "#dfefff",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10,
    },
    cardThumbEmoji: {
        fontSize: 42,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "900",
        color: "#39405e",
    },
    cardSubtitle: {
        fontSize: 13,
        color: "#666c8c",
        fontWeight: "700",
        marginTop: 4,
    },
    cardButton: {
        marginTop: 14,
        backgroundColor: "#ff9f52",
        borderRadius: 14,
        paddingVertical: 12,
        alignItems: "center",
    },
    cardButtonText: {
        color: "#fff",
        fontWeight: "900",
        fontSize: 16,
    },

    inputBar: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        paddingHorizontal: 14,
        paddingBottom: 14,
        paddingTop: 8,
    },
    emojiBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#ffd95c",
        alignItems: "center",
        justifyContent: "center",
    },
    emojiText: {
        fontSize: 20,
    },
    input: {
        flex: 1,
        height: 50,
        borderRadius: 24,
        backgroundColor: "rgba(255,255,255,0.88)",
        paddingHorizontal: 18,
        color: "#333",
        fontWeight: "700",
        fontSize: 16,
    },
    micBtn: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: "#4da4ff",
        alignItems: "center",
        justifyContent: "center",
    },
    micText: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "900",
        marginLeft: 2,
    },
});