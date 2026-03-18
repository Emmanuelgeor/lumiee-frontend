import React from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";
import { WebView } from "react-native-webview";

export default function BookViewer({ route, navigation }: any) {

    const { url } = route.params;

    return (
        <View style={styles.container}>

            {/* 🔙 Back Button */}
            <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.backText}>← Back</Text>
            </Pressable>

            {/* 📄 PDF Viewer */}
            <WebView
                source={{ uri: url }}
                style={styles.webview}
                startInLoadingState
            />

        </View>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#fff"
    },

    webview: {
        flex: 1,
        marginTop: 80
    },

    backBtn: {
        position: "absolute",
        top: 40,
        left: 20,
        zIndex: 10,
        backgroundColor: "#000",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10
    },

    backText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700"
    }

});