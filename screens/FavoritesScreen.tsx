import React, { useEffect, useState } from "react";
import { deleteDoc, doc } from "firebase/firestore";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";
import {
    View,
    Text,
    FlatList,
    Pressable,
    Image,
    StyleSheet,
    Alert
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

export default function FavoritesScreen({ navigation }: any) {
    const [favorites, setFavorites] = useState<any[]>([]);

    useEffect(() => {
        loadFavorites();
    }, []);

    const loadFavorites = async () => {
        try {
            const user = auth.currentUser;
            if (!user) return;

            // 🔹 STEP 1: LOAD LOCAL FIRST (FAST)
            const local = await AsyncStorage.getItem("favorites");
            if (local) {
                setFavorites(JSON.parse(local));
            }

            // 🔹 STEP 2: LOAD FROM FIRESTORE (LATEST)
            const snapshot = await getDocs(
                collection(db, "users", user.uid, "favorites")
            );

            const cloudFavs = snapshot.docs.map(doc => doc.data());

            // 🔹 UPDATE UI + LOCAL
            setFavorites(cloudFavs);
            await AsyncStorage.setItem("favorites", JSON.stringify(cloudFavs));

        } catch (err) {
            console.log(err);
        }
    };

    const removeFavorite = async (id: string) => {
        try {
            const user = auth.currentUser;
            if (!user) return;

            // 🔹 LOCAL REMOVE
            const updated = favorites.filter(item => item.id !== id);
            setFavorites(updated);
            await AsyncStorage.setItem("favorites", JSON.stringify(updated));

            // 🔹 FIRESTORE REMOVE
            await deleteDoc(doc(db, "users", user.uid, "favorites", id));

        } catch (err) {
            console.log(err);
        }
    };

    const handleOpen = (item: any) => {
        if (!item.url) {
            Alert.alert("No file found");
            return;
        }

        if (item.type === "video") {
            navigation.navigate("VideoPlayer", { url: item.url });
        } else {
            navigation.navigate("BookViewer", { url: item.url });
        }
    };

    const renderItem = ({ item }: any) => {
        return (
            <View style={styles.card}>
                <LinearGradient
                    colors={item.type === "video" ? ["#ffffff", "#fff1de"] : ["#ffffff", "#efe5ff"]}
                    style={styles.cardInner}
                >
                    <View style={styles.thumb}>
                        {item.image ? (
                            <Image source={{ uri: item.image }} style={styles.image} />
                        ) : (
                            <Text style={styles.emoji}>
                                {item.type === "video" ? "🎬" : "📚"}
                            </Text>
                        )}
                    </View>

                    <Text style={styles.title}>{item.title}</Text>

                    {!!item.subtitle && (
                        <Text style={styles.subtitle}>{item.subtitle}</Text>
                    )}

                    <Pressable
                        style={styles.mainBtn}
                        onPress={() => handleOpen(item)}
                    >
                        <Text style={styles.mainBtnText}>
                            {item.type === "video" ? "Watch ▶️" : "Read 📖"}
                        </Text>
                    </Pressable>

                    <Pressable
                        style={styles.removeBtn}
                        onPress={() => removeFavorite(item.id)}
                    >
                        <Text style={styles.removeText}>❌ Remove</Text>
                    </Pressable>
                </LinearGradient>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.container}>
                <Text style={styles.header}>⭐ My Favorites</Text>

                <FlatList
                    data={favorites}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    numColumns={2}
                    columnWrapperStyle={favorites.length > 1 ? styles.row : undefined}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No favorites yet.</Text>
                    }
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#fff"
    },

    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 8
    },

    header: {
        fontSize: 24,
        fontWeight: "900",
        marginBottom: 16,
        color: "#333"
    },

    listContent: {
        paddingBottom: 24
    },

    row: {
        gap: 12
    },

    emptyText: {
        textAlign: "center",
        marginTop: 40,
        fontSize: 16,
        color: "#666"
    },

    card: {
        flex: 1,
        borderRadius: 18,
        overflow: "hidden",
        marginBottom: 12
    },

    cardInner: {
        padding: 10,
        minHeight: 240,
        justifyContent: "space-between",
        borderRadius: 18
    },

    thumb: {
        height: 100,
        borderRadius: 12,
        backgroundColor: "#dfefff",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 10
    },

    image: {
        width: "100%",
        height: "100%",
        borderRadius: 12
    },

    emoji: {
        fontSize: 40
    },

    title: {
        fontWeight: "900",
        fontSize: 15,
        color: "#333"
    },

    subtitle: {
        fontSize: 12,
        color: "#666",
        marginTop: 4
    },

    mainBtn: {
        marginTop: 10,
        backgroundColor: "#ff9f52",
        borderRadius: 12,
        paddingVertical: 10,
        alignItems: "center"
    },

    mainBtnText: {
        color: "#fff",
        fontWeight: "900"
    },

    removeBtn: {
        marginTop: 6,
        backgroundColor: "#eee",
        borderRadius: 10,
        paddingVertical: 8,
        alignItems: "center"
    },

    removeText: {
        fontWeight: "800",
        color: "#444"
    }
});