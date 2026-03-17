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
    Linking
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
    url?: string;
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
    const childName = route?.params?.childName || "friend";

    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [menuOpen, setMenuOpen] = useState(false);

    const tilt = useRef(new Animated.Value(0)).current;
    const menuX = useRef(new Animated.Value(-240)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(tilt, { toValue: 1, duration: 900, useNativeDriver: true }),
                Animated.timing(tilt, { toValue: -1, duration: 900, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    useEffect(() => {
        setMessages([
            {
                id: "1",
                sender: "bot",
                text: `Hi ${childName}! I'm Lumiee ☀️ What would you like to learn today?`
            }
        ]);
    }, [childName]);

    const lumieeSource = useMemo(() => {
        if (mode === "book") {
            return require("../assets/images/lumiee_book.png");
        }
        return require("../assets/images/lumiee_video.png");
    }, [mode]);

    const tiltDeg = tilt.interpolate({
        inputRange: [-1, 1],
        outputRange: ["-5deg", "5deg"]
    });

    const toggleMenu = () => {
        if (menuOpen) {
            Animated.timing(menuX, { toValue: -240, duration: 250, useNativeDriver: true }).start(() => setMenuOpen(false));
        } else {
            setMenuOpen(true);
            Animated.timing(menuX, { toValue: 0, duration: 250, useNativeDriver: true }).start();
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
            Alert.alert("Error", "Could not sign out.");
        }
    };

    const confirmSignOut = () => {
        Alert.alert("Sign Out", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            { text: "Sign Out", onPress: handleSignOut }
        ]);
    };

    const sendMessage = async () => {

        if (!input.trim()) return;

        const userText = input.trim();

        const childMsg: ChatMessage = {
            id: `${Date.now()}-child`,
            sender: "child",
            text: userText
        };

        setMessages(prev => [...prev, childMsg]);
        setInput("");

        try {

            const response = await fetch("http://127.0.0.1:8000/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: userText
                })
            });

            const data = await response.json();

            const cards: ChatCard[] = data.recommendations?.map((item: any) => ({
                id: item.id,
                type: item.type,
                title: item.title,
                subtitle: item.description?.slice(0, 40),
                image: item.thumbnail,
                url: item.url,
                actionLabel: item.type === "video" ? "Watch" : "Read"
            })) || [];

            const botMsg: ChatMessage = {
                id: `${Date.now()}-bot`,
                sender: "bot",
                text: data.reply,
                cards: cards
            };

            setMessages(prev => [...prev, botMsg]);

        } catch (error) {

            const errorMsg: ChatMessage = {
                id: `${Date.now()}-error`,
                sender: "bot",
                text: "Sorry! I couldn't reach the learning server."
            };

            setMessages(prev => [...prev, errorMsg]);

        }

    };

    const handleCardPress = (card: ChatCard) => {
        if (card.url) {
            Linking.openURL(card.url);
        } else {
            Alert.alert(card.title);
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
                    />
                )}

                <View style={[styles.bubble, isBot ? styles.botBubble : styles.childBubble]}>
                    <Text style={[styles.bubbleText, isBot ? styles.botText : styles.childText]}>
                        {item.text}
                    </Text>
                </View>

                {item.cards && (

                    <View style={styles.cardsRow}>

                        {item.cards.map(card => (

                            <Pressable
                                key={card.id}
                                style={styles.card}
                                onPress={() => handleCardPress(card)}
                            >

                                <LinearGradient
                                    colors={card.type === "video" ? ["#ffffff", "#fff1de"] : ["#ffffff", "#efe5ff"]}
                                    style={styles.cardInner}
                                >

                                    <View style={styles.cardThumb}>

                                        {card.image ?
                                            <Image source={{ uri: card.image }} style={{ width: "100%", height: "100%", borderRadius: 12 }} />
                                            :
                                            <Text style={styles.cardThumbEmoji}>{card.type === "video" ? "🎬" : "📚"}</Text>
                                        }

                                    </View>

                                    <Text style={styles.cardTitle}>{card.title}</Text>

                                    {!!card.subtitle && (
                                        <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
                                    )}

                                    <View style={styles.cardButton}>
                                        <Text style={styles.cardButtonText}>{card.actionLabel}</Text>
                                    </View>

                                </LinearGradient>

                            </Pressable>

                        ))}

                    </View>

                )}

            </View>

        );
    };

    return (

        <LinearGradient colors={["#f7dff0", "#d8ecff", "#fff4cb"]} style={{ flex: 1 }}>

            <SafeAreaView style={{ flex: 1 }}>

                <Pressable style={styles.menuBtn} onPress={toggleMenu}>
                    <Text style={styles.menuIcon}>☰</Text>
                </Pressable>

                {menuOpen && (
                    <Pressable style={styles.menuOverlay} onPress={toggleMenu}>
                        <Animated.View style={[styles.sideMenu, { transform: [{ translateX: menuX }] }]}>

                            <Text style={styles.menuTitle}>{childName}</Text>
                            <Text style={styles.menuSub}>Learner</Text>

                            <Pressable style={styles.menuItem} onPress={() => navigation.replace("ChildSelect")}>
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

                <View style={styles.header}>

                    <Text style={styles.headerTitle}>Ask Lumiee!</Text>

                    <Animated.Image
                        source={lumieeSource}
                        style={[styles.headerLumiee, { transform: [{ rotate: tiltDeg }] }]}
                    />

                </View>

                <FlatList
                    data={messages}
                    keyExtractor={item => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.chatList}
                />

                <View style={styles.inputBar}>

                    <TextInput
                        value={input}
                        onChangeText={setInput}
                        placeholder="Type a message..."
                        style={styles.input}
                    />

                    <Pressable style={styles.sendBtn} onPress={sendMessage}>
                        <Text style={{ color: "#fff", fontSize: 20 }}>➤</Text>
                    </Pressable>

                </View>

            </SafeAreaView>

        </LinearGradient>

    );
}

const styles = StyleSheet.create({

    menuBtn: { position: "absolute", top: 54, left: 16, zIndex: 20, width: 42, height: 42, borderRadius: 21, backgroundColor: "rgba(255,255,255,0.65)", alignItems: "center", justifyContent: "center" },
    menuIcon: { fontSize: 22, fontWeight: "900" },

    menuOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 30 },

    sideMenu: { width: 220, height: "100%", backgroundColor: "white", paddingTop: 90, paddingHorizontal: 18 },

    menuTitle: { fontSize: 22, fontWeight: "900" },
    menuSub: { marginBottom: 20 },

    menuItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#eee" },
    menuItemText: { fontWeight: "700" },

    header: { paddingTop: 20, paddingHorizontal: 18, paddingBottom: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    headerTitle: { fontSize: 28, fontWeight: "900", color: "#ffb92f", marginLeft: 58 },
    headerLumiee: { width: 90, height: 90 },

    chatList: { paddingHorizontal: 14, paddingBottom: 16 },

    messageWrap: { marginBottom: 14 },
    leftAlign: { alignItems: "flex-start" },
    rightAlign: { alignItems: "flex-end" },

    smallLumiee: { width: 48, height: 48, marginBottom: 6 },

    bubble: { maxWidth: width * 0.76, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 14 },
    botBubble: { backgroundColor: "#fff3b2", borderBottomLeftRadius: 8 },
    childBubble: { backgroundColor: "#65aaf7", borderBottomRightRadius: 8 },

    bubbleText: { fontSize: 16, fontWeight: "700" },
    botText: { color: "#333" },
    childText: { color: "#fff" },

    cardsRow: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 12, width: "100%" },

    card: { width: (width - 40) / 2 - 8, borderRadius: 20, overflow: "hidden" },

    cardInner: { borderRadius: 20, padding: 10, minHeight: 220, justifyContent: "space-between" },

    cardThumb: { height: 110, borderRadius: 14, backgroundColor: "#dfefff", alignItems: "center", justifyContent: "center", marginBottom: 10 },

    cardThumbEmoji: { fontSize: 42 },

    cardTitle: { fontSize: 16, fontWeight: "900", color: "#39405e" },

    cardSubtitle: { fontSize: 13, color: "#666c8c", fontWeight: "700", marginTop: 4 },

    cardButton: { marginTop: 14, backgroundColor: "#ff9f52", borderRadius: 14, paddingVertical: 12, alignItems: "center" },

    cardButtonText: { color: "#fff", fontWeight: "900", fontSize: 16 },

    inputBar: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingBottom: 14, paddingTop: 8 },

    input: { flex: 1, height: 50, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.88)", paddingHorizontal: 18, fontWeight: "700" },

    sendBtn: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#4da4ff", alignItems: "center", justifyContent: "center" }

});