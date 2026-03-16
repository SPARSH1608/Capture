import React from "react"
import { StyleSheet, Text, View } from "react-native"

type Props = {
    currentHex: string | null
    distance: number
    timeInHex: number
    visitedCount: number
}

export default function PlayerHUD({
    currentHex,
    distance,
    timeInHex,
    visitedCount
}: Props) {

    return (
        <View style={styles.container}>

            <Text style={styles.text}>
                Hex: {currentHex?.slice(0, 8) || "Loading"}
            </Text>

            <Text style={styles.text}>
                Distance: {distance.toFixed(1)} m
            </Text>

            <Text style={styles.text}>
                Time: {timeInHex}s
            </Text>

            <Text style={styles.text}>
                Visited: {visitedCount}
            </Text>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "rgba(0,0,0,0.6)",
        padding: 12,
        borderRadius: 10,
        marginHorizontal: 20
    },

    text: {
        color: "white",
        fontSize: 14,
        marginBottom: 4
    }
})