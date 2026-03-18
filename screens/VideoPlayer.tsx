import React, { useEffect } from "react";
import { View, StyleSheet, Pressable, Text } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import * as ScreenOrientation from "expo-screen-orientation";

export default function VideoPlayer({ route, navigation }: any) {

    const url = route?.params?.url;

    // 🎬 Create player
    const player = useVideoPlayer(url, (player) => {
        player.play();
    });

    useEffect(() => {
        // 🔄 Allow rotation
        ScreenOrientation.unlockAsync();

        return () => {
            // 🔒 Lock back to portrait
            ScreenOrientation.lockAsync(
                ScreenOrientation.OrientationLock.PORTRAIT
            );
        };
    }, []);

    // ❌ Safety check
    if (!url) {
        return (
            <View style={styles.container}>
                <Text style={{ color: "#fff" }}>No video available</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>

            {/* 🔙 Back Button */}
            <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.backText}>← Back</Text>
            </Pressable>

            {/* 🎬 Video Player */}
            <VideoView
                player={player}
                style={styles.video}
                allowsFullscreen
                allowsPictureInPicture
            />

        </View>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#000"
    },

    video: {
        flex: 1,
        width: "100%"
    },

    backBtn: {
        position: "absolute",
        top: 50,
        left: 20,
        zIndex: 10,
        backgroundColor: "rgba(0,0,0,0.6)",
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