import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Image,
    TextInput,
    ScrollView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

export default function ContinueScreen({ navigation, route }: any) {

    const childName = route?.params?.childName || "friend";

    const [message, setMessage] = useState("");

    return (
        <LinearGradient colors={["#FFB703", "#FB8500"]} style={styles.container}>
            <SafeAreaView style={styles.safe}>

                <ScrollView>

                    {/* BOOK SECTION */}
                    <Text style={styles.sectionTitle}>📚 Continue Reading</Text>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <Pressable style={styles.card}>
                            <Text style={styles.cardTitle}>Magic Forest</Text>
                        </Pressable>

                        <Pressable style={styles.card}>
                            <Text style={styles.cardTitle}>Animal Stories</Text>
                        </Pressable>

                        <Pressable style={styles.card}>
                            <Text style={styles.cardTitle}>Science Fun</Text>
                        </Pressable>
                    </ScrollView>


                    {/* VIDEO SECTION */}
                    <Text style={styles.sectionTitle}>🎬 Continue Watching</Text>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <Pressable style={styles.card}>
                            <Text style={styles.cardTitle}>Tree Life</Text>
                        </Pressable>

                        <Pressable style={styles.card}>
                            <Text style={styles.cardTitle}>Ocean Animals</Text>
                        </Pressable>

                        <Pressable style={styles.card}>
                            <Text style={styles.cardTitle}>Planet Earth</Text>
                        </Pressable>
                    </ScrollView>


                    {/* CHAT SECTION */}
                    <Text style={styles.sectionTitle}>💬 Chat with Lumiee</Text>

                    <View style={styles.chatContainer}>

                        <View style={{ flex: 1 }}>
                            <TextInput
                                value={message}
                                onChangeText={setMessage}
                                placeholder="Ask Lumiee something..."
                                style={styles.chatInput}
                            />

                            <Pressable
                                style={styles.sendBtn}
                                onPress={() =>
                                    navigation.navigate("Chat", {
                                        mode: "chat",
                                        childName,
                                        initialMessage: message,
                                    })
                                }
                            >
                                <Text style={styles.sendText}>Send</Text>
                            </Pressable>
                        </View>

                        {/* Lumiee */}
                        <Image
                            source={require("../assets/images/lumiee2.png")}
                            style={styles.lumiee}
                            resizeMode="contain"
                        />

                    </View>

                </ScrollView>

            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({

    container: { flex: 1 },

    safe: { flex: 1, paddingHorizontal: 16 },

    sectionTitle: {
        fontSize: 20,
        fontWeight: "900",
        color: "#fff",
        marginTop: 20,
        marginBottom: 10
    },

    card: {
        width: 140,
        height: 120,
        borderRadius: 16,
        backgroundColor: "rgba(255,255,255,0.25)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12
    },

    cardTitle: {
        color: "#fff",
        fontWeight: "800",
        textAlign: "center"
    },

    chatContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10
    },

    chatInput: {
        height: 50,
        borderRadius: 14,
        backgroundColor: "rgba(255,255,255,0.25)",
        paddingHorizontal: 12,
        color: "#fff",
        marginBottom: 8
    },

    sendBtn: {
        height: 44,
        borderRadius: 14,
        backgroundColor: "rgba(255,255,255,0.35)",
        alignItems: "center",
        justifyContent: "center"
    },

    sendText: {
        color: "#fff",
        fontWeight: "800"
    },

    lumiee: {
        width: 120,
        height: 120,
        marginLeft: 10
    }

});