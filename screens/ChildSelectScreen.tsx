import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ActivityIndicator,
    Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

type Kid = {
    name: string;
    age: string;
};

const avatarImages = [
    require("../assets/images/avatar1.png"),
    require("../assets/images/avatar2.png"),
    require("../assets/images/avatar3.png"),
    require("../assets/images/avatar4.png"),

];

export default function ChildSelectScreen({ navigation }: any) {
    const [kids, setKids] = useState<Kid[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadKids = async () => {
            try {
                const user = auth.currentUser;

                if (!user) {
                    navigation.replace("Login");
                    return;
                }

                const cacheKey = `kids_profiles_${user.uid}`;

                // 1) Load cached kids first for instant display
                const cached = await AsyncStorage.getItem(cacheKey);
                if (cached) {
                    setKids(JSON.parse(cached));
                    setLoading(false);
                }

                // 2) Refresh from Firebase in background
                const snap = await getDoc(doc(db, "parents", user.uid));

                if (snap.exists()) {
                    const data = snap.data();
                    const firebaseKids = data.kids || [];

                    setKids(firebaseKids);

                    await AsyncStorage.setItem(
                        cacheKey,
                        JSON.stringify(firebaseKids)
                    );
                } else {
                    setKids([]);
                }
            } catch (error) {
                console.log("Error loading kids:", error);
            } finally {
                setLoading(false);
            }
        };

        loadKids();
    }, []);

    const handleSelectKid = (kid: Kid, index: number) => {
        navigation.replace("Home", {
            childName: kid.name,
            childAge: kid.age,
            childIndex: index,
        });
    };

    return (
        <LinearGradient colors={["#090909", "#1a1311"]} style={styles.container}>
            <SafeAreaView style={styles.safe}>
                <Text style={styles.title}>Choose Your Profile</Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#fff" />
                ) : (
                    <View style={styles.grid}>
                        {kids.map((kid, index) => (
                            <Pressable
                                key={index}
                                style={styles.profileCard}
                                onPress={() => handleSelectKid(kid, index)}
                            >
                                <Image
                                    source={avatarImages[index % avatarImages.length]}
                                    style={styles.avatarImage}
                                    resizeMode="cover"
                                />
                                <Text style={styles.profileName}>{kid.name}</Text>
                            </Pressable>
                        ))}
                    </View>
                )}
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safe: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: "500",
        color: "#fff",
        marginBottom: 36,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 28,
    },
    profileCard: {
        alignItems: "center",
        width: 120,
    },
    avatarImage: {
        width: 110,
        height: 110,
        borderRadius: 24,
        marginBottom: 12,
    },
    profileName: {
        color: "#fff",
        fontSize: 17,
        fontWeight: "800",
        textAlign: "center",
    },
});