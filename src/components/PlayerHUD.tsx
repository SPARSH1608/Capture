import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const PlayerHUD = () => {
    return (
        <View style={styles.container}>
            <Text>Level. 1</Text>
            <Text>XP:200</Text>
            <Text>Hexes :3</Text>

        </View>
    )
}

export default PlayerHUD

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-around",
        padding: 10
    }
});