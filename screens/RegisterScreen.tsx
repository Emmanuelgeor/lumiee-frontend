import React, { useEffect, useMemo, useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TextInput,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type Kid = { name: string; age: string };
type Plan = "trial_then_monthly" | "yearly";

export default function RegisterScreen({ navigation }: any) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [kidsCountText, setKidsCountText] = useState("1");
    const kidsCount = useMemo(() => {
        const n = parseInt(kidsCountText || "0", 10);
        if (Number.isNaN(n)) return 0;
        return Math.max(0, Math.min(6, n));
    }, [kidsCountText]);

    const [kids, setKids] = useState<Kid[]>([{ name: "", age: "" }]);
    const [plan, setPlan] = useState<Plan>("trial_then_monthly");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setKids((prev) => {
            const next = [...prev];
            if (next.length < kidsCount) {
                while (next.length < kidsCount) next.push({ name: "", age: "" });
            } else if (next.length > kidsCount) {
                next.length = kidsCount;
            }
            return next;
        });
    }, [kidsCount]);

    const updateKid = (index: number, patch: Partial<Kid>) => {
        setKids((prev) => prev.map((k, i) => (i === index ? { ...k, ...patch } : k)));
    };

    const proceed = async () => {
        try {

            setLoading(true);

            if (!email.trim() || !password.trim()) {
                alert("Please enter email and password");
                setLoading(false);
                return;
            }

            if (kids.some(k => !k.name || !k.age)) {
                alert("Please fill all kids details");
                setLoading(false);
                return;
            }

            // Create account in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email.trim(),
                password
            );

            const uid = userCredential.user.uid;

            // Save parent profile in Firestore
            await setDoc(doc(db, "parents", uid), {
                email: email.trim(),
                plan: plan,
                kidsCount: kidsCount,
                kids: kids,
                createdAt: serverTimestamp()
            });

            alert("Account created successfully!");

            // Go to Login Screen
            navigation.replace("Login");

        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient colors={["#FFB703", "#FB8500"]} style={styles.container}>
            <SafeAreaView style={styles.safe}>
                {/* ✅ FIXED WATERMARK LUMIEE (always visible) */}
                <View pointerEvents="none" style={styles.watermarkWrap}>
                    <Image
                        source={require("../assets/images/lumiee3.png")}
                        style={styles.lumieeWatermark}
                        resizeMode="contain"
                    />
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    style={{ flex: 1 }}
                >
                    {/* ✅ SCROLL ENABLED */}
                    <ScrollView
                        style={{ flex: 1 }}                         // ✅ MUST
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        contentInsetAdjustmentBehavior="automatic"  // ✅ helps on iOS
                        bounces
                        alwaysBounceVertical={true}
                    >
                        <View style={styles.card}>
                            <Text style={styles.title}>Create Parent Account</Text>
                            <Text style={styles.subtitle}>
                                Create your account and add your kids to get safe recommendations.
                            </Text>

                            {/* Email */}
                            <Text style={styles.label}>Email ID</Text>
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                placeholder="parent@email.com"
                                placeholderTextColor="rgba(255,255,255,0.75)"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                style={styles.input}
                            />

                            {/* Password */}
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                value={password}
                                onChangeText={setPassword}
                                placeholder="Create a strong password"
                                placeholderTextColor="rgba(255,255,255,0.75)"
                                secureTextEntry
                                autoCapitalize="none"
                                style={styles.input}
                            />

                            {/* Kids count */}
                            <Text style={styles.label}>Number of Kids</Text>
                            <TextInput
                                value={kidsCountText}
                                onChangeText={(t) => setKidsCountText(t.replace(/[^0-9]/g, ""))}
                                placeholder="e.g. 2"
                                placeholderTextColor="rgba(255,255,255,0.75)"
                                keyboardType="number-pad"
                                style={styles.input}
                            />

                            {/* Dynamic Kids Fields */}
                            {kidsCount > 0 && (
                                <View style={styles.kidsBlock}>
                                    <Text style={styles.sectionTitle}>Kids Details</Text>

                                    {kids.map((kid, idx) => (
                                        <View key={idx} style={styles.kidRow}>
                                            <Text style={styles.kidTitle}>Kid {idx + 1}</Text>

                                            <TextInput
                                                value={kid.name}
                                                onChangeText={(t) => updateKid(idx, { name: t })}
                                                placeholder="Name"
                                                placeholderTextColor="rgba(255,255,255,0.75)"
                                                style={styles.inputSmall}
                                            />

                                            <TextInput
                                                value={kid.age}
                                                onChangeText={(t) => updateKid(idx, { age: t.replace(/[^0-9]/g, "") })}
                                                placeholder="Age"
                                                placeholderTextColor="rgba(255,255,255,0.75)"
                                                keyboardType="number-pad"
                                                style={styles.inputSmall}
                                            />
                                        </View>
                                    ))}
                                </View>
                            )}

                            {/* Plan options */}
                            <Text style={styles.sectionTitle}>Choose a Plan</Text>

                            <Pressable
                                style={[styles.planCard, plan === "trial_then_monthly" && styles.planCardSelected]}
                                onPress={() => setPlan("trial_then_monthly")}
                            >
                                <View style={styles.planRow}>
                                    <View style={[styles.radio, plan === "trial_then_monthly" && styles.radioOn]} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.planTitle}>7-Day Free Trial</Text>
                                        <Text style={styles.planDesc}>After trial: $15 / month</Text>
                                    </View>
                                </View>
                            </Pressable>

                            <Pressable
                                style={[styles.planCard, plan === "yearly" && styles.planCardSelected]}
                                onPress={() => setPlan("yearly")}
                            >
                                <View style={styles.planRow}>
                                    <View style={[styles.radio, plan === "yearly" && styles.radioOn]} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.planTitle}>$120 / Year</Text>
                                        <Text style={styles.planDesc}>Best value for families</Text>
                                    </View>
                                </View>
                            </Pressable>

                            {/* Proceed */}
                            <Pressable
                                style={styles.proceedBtn}
                                onPress={proceed}
                                disabled={loading}
                            >
                                <Text style={styles.proceedText}>
                                    {loading ? "Creating account..." :
                                        plan === "yearly"
                                            ? "Proceed (Yearly Plan)"
                                            : "Proceed (Start Free Trial)"}
                                </Text>
                            </Pressable>

                            {/* Login link */}
                            <View style={styles.footerRow}>
                                <Text style={styles.footerText}>Already have an account?</Text>
                                <Pressable onPress={() => navigation.navigate("Login")}>
                                    <Text style={styles.footerLink}> Login</Text>
                                </Pressable>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safe: { flex: 1, paddingHorizontal: 18 },

    scrollContent: {
        paddingTop: 30,
        paddingBottom: 260, // ✅ bigger so Proceed is reachable
    },

    watermarkWrap: {
        position: "absolute",
        right: -10,
        bottom: -8,
        zIndex: -1, // stays behind everything
    },

    lumieeWatermark: {
        width: 160,
        height: 160,
        opacity: 0.28, // watermark feel
    },
    card: {
        borderRadius: 26,
        minHeight: 900,
        padding: 18,
        paddingTop: 22,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.35)",
        backgroundColor: "rgba(255,255,255,0.18)",
        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 10 },
        elevation: 6,
        zIndex: 1, // keep card above watermark
    },

    title: { fontSize: 24, fontWeight: "900", color: "#fff", textAlign: "center" },
    subtitle: {
        fontSize: 13,
        color: "rgba(255,255,255,0.85)",
        textAlign: "center",
        marginTop: 6,
        marginBottom: 18,
        lineHeight: 18,
    },

    label: {
        color: "rgba(255,255,255,0.92)",
        fontWeight: "800",
        fontSize: 13,
        marginBottom: 6,
        marginTop: 8,
    },

    input: {
        height: 52,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.45)",
        backgroundColor: "rgba(0,0,0,0.12)",
        paddingHorizontal: 14,
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
    },

    kidsBlock: {
        marginTop: 14,
        marginBottom: 10,
        padding: 12,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.25)",
        backgroundColor: "rgba(255,255,255,0.10)",
    },

    sectionTitle: {
        color: "#fff",
        fontWeight: "900",
        fontSize: 16,
        marginBottom: 10,
        marginTop: 8,
    },

    kidRow: { marginBottom: 12 },
    kidTitle: {
        color: "rgba(255,255,255,0.92)",
        fontWeight: "800",
        marginBottom: 8,
    },

    inputSmall: {
        height: 48,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.45)",
        backgroundColor: "rgba(0,0,0,0.12)",
        paddingHorizontal: 14,
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 10,
    },

    planCard: {
        borderRadius: 18,
        padding: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.35)",
        backgroundColor: "rgba(0,0,0,0.10)",
        marginBottom: 10,
    },
    planCardSelected: {
        backgroundColor: "rgba(255,255,255,0.20)",
        borderColor: "rgba(255,255,255,0.55)",
    },
    planRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    radio: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: "rgba(255,255,255,0.75)",
    },
    radioOn: { backgroundColor: "#FFD166", borderColor: "#FFD166" },
    planTitle: { color: "#fff", fontWeight: "900", fontSize: 15 },
    planDesc: { color: "rgba(255,255,255,0.85)", fontWeight: "700", fontSize: 12, marginTop: 2 },

    proceedBtn: {
        height: 54,
        borderRadius: 18,
        backgroundColor: "rgba(255,255,255,0.25)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.55)",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
    },
    proceedText: { color: "#fff", fontWeight: "900", fontSize: 16 },

    footerRow: { flexDirection: "row", justifyContent: "center", marginTop: 14 },
    footerText: { color: "rgba(255,255,255,0.85)", fontWeight: "700", fontSize: 13 },
    footerLink: { color: "#fff", fontWeight: "900", fontSize: 13, textDecorationLine: "underline" },
});