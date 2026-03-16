import PlayerHUD from '@/components/PlayerHUD';
import { getHexBoundary, getHexIndex, getNeighbours } from '@/services/h3Service';
import { requestLocationPermission, startLocationTracking } from '@/services/locationService';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Polygon } from 'react-native-maps';
const MapScreen = () => {
    const [location, setLocation] = useState<any>(null)
    const mapRef = useRef<MapView>(null)
    const [currentHex, setCurrentHex] = useState(null)
    const [visitedHexes, setVisitedHexes] = useState<Set<string>>(new Set())
    const [hexes, setHexes] = useState<any>([])
    useEffect(() => {

        let subscription: any;

        async function startTracking() {
            await requestLocationPermission()
            subscription = await startLocationTracking((coords) => {
                setLocation(coords)

                const hex = getHexIndex(coords.latitude, coords.longitude)
                if (hex != currentHex) {
                    console.log("Entered new hex:", hex)
                    setCurrentHex(hex)
                    setVisitedHexes(prev => {
                        const updated = new Set(prev)
                        updated.add(hex)
                        return updated
                    })
                    const neighbours = getNeighbours(hex)
                    setHexes(neighbours)
                }
                console.log('hex', hex)
                // const neighbours = getNeighbours(hex)
                // setHexes(neighbours)
                console.log('hexes', hexes)
                mapRef.current?.animateToRegion({
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    latitudeDelta: 0.00001,
                    longitudeDelta: 0.00001
                })
            })

        }
        startTracking()

        return () => {
            subscription?.remove()
        }
        // async function initLocation() {
        //     try {
        //         await requestLocationPermission()
        //         const coords = await getCurrentLocation()
        //         console.log('cords', coords)
        //         setLocation(coords)
        //         mapRef.current?.animateToRegion({
        //             latitude: coords.latitude,
        //             longitude: coords.longitude,
        //             latitudeDelta: 0.01,
        //             longitudeDelta: 0.01
        //         })
        //     } catch (error) {
        //         console.log('error')
        //     }
        // }
    }, [])
    return (
        <View style={styles.container}>
            <View style={styles.hud}>
                <PlayerHUD />
            </View>
            {/* <MapView style={styles.map}
                showsUserLocation
                // showsMyLocationButton
                ref={mapRef}
            // initialRegion={{
            //     latitude: location?.latitude || 28.6139,
            //     longitude: location?.longitude || 77.2090,
            //     latitudeDelta: 0.01,
            //     longitudeDelta: 0.01
            // }}
            /> */}
            <MapView
                ref={mapRef}
                showsUserLocation
                style={styles.map}
            >

                {/* {location && (
                    <Marker coordinate={{
                        latitude: location.latitude,
                        longitude: location.longitude
                    }}
                        title='You are here'
                    />
                )} */}
                {hexes.map((hex) => {

                    const isPlayerHex = hex === currentHex
                    const isVisited = visitedHexes.has(hex)

                    return (
                        <Polygon
                            key={hex}
                            coordinates={getHexBoundary(hex)}
                            strokeColor={isPlayerHex ? "#2196F3" : "#4CAF50"}
                            fillColor={
                                isPlayerHex
                                    ? "rgba(33,150,243,0.4)"
                                    : isVisited
                                        ? "rgba(255,193,7,0.3)"
                                        : "rgba(76,175,80,0.15)"
                            }
                            strokeWidth={2}
                        />
                    )

                })}
            </MapView>


        </View>

    )
}

export default MapScreen

const styles = StyleSheet.create({
    container: {
        flex: 1
    },

    hud: {
        position: "absolute",
        top: 50,
        width: "100%",
        zIndex: 10
    },

    map: {
        flex: 1
    }
});