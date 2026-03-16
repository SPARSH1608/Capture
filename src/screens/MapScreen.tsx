import PlayerHUD from "@/components/PlayerHUD"
import { getHexBoundary, getHexIndex, getNeighbours } from "@/services/h3Service"
import { requestLocationPermission, startLocationTracking } from "@/services/locationService"
import { distanceMeters } from "@/utils/distance"
import React, { useEffect, useRef, useState } from "react"
import { StyleSheet, View } from "react-native"
import MapView, { Polygon, Polyline } from "react-native-maps"

const MapScreen = () => {

    const mapRef = useRef<MapView>(null)

    const prevLocationRef = useRef<any>(null)
    const currentHexRef = useRef<string | null>(null)

    const [location, setLocation] = useState<any>(null)
    const [hexes, setHexes] = useState<string[]>([])
    const [currentHex, setCurrentHex] = useState<string | null>(null)
    const [visitedHexes, setVisitedHexes] = useState<Set<string>>(new Set())

    const [distance, setDistance] = useState(0)
    const [timeInHex, setTimeInHex] = useState(0)

    const [trail, setTrail] = useState<
        { latitude: number; longitude: number }[]
    >([])


    useEffect(() => {

        let subscription: any

        async function startTracking() {

            await requestLocationPermission()

            subscription = await startLocationTracking(handleLocationUpdate)

        }

        startTracking()

        return () => subscription?.remove()

    }, [])


    const handleLocationUpdate = (coords: any) => {
        mapRef.current?.animateToRegion({
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.001,
            longitudeDelta: 0.001
        })
        setLocation(coords)

        updateTrail(coords)
        updateDistance(coords)
        updateHexState(coords)

        prevLocationRef.current = coords

        if (!mapRef.current) return

        if (!currentHexRef.current) {
            mapRef.current.animateToRegion({
                latitude: coords.latitude,
                longitude: coords.longitude,
                latitudeDelta: 0.001,
                longitudeDelta: 0.001
            })
        }

    }


    const updateTrail = (coords: any) => {

        setTrail(prev => [
            ...prev,
            {
                latitude: coords.latitude,
                longitude: coords.longitude
            }
        ])

    }


    const updateDistance = (coords: any) => {

        if (!prevLocationRef.current) return

        const dist = distanceMeters(prevLocationRef.current, coords)

        setDistance(prev => prev + dist)

    }


    const updateHexState = (coords: any) => {

        const hex = getHexIndex(coords.latitude, coords.longitude)

        if (hex === currentHexRef.current) return

        console.log("Entered new hex:", hex)

        currentHexRef.current = hex

        setCurrentHex(hex)
        setTimeInHex(0)

        setVisitedHexes(prev => {
            const updated = new Set(prev)
            updated.add(hex)
            return updated
        })

        const neighbours = getNeighbours(hex)

        setHexes(neighbours)

    }


    useEffect(() => {

        const interval = setInterval(() => {
            setTimeInHex(prev => prev + 1)
        }, 1000)

        return () => clearInterval(interval)

    }, [currentHex])

    return (
        <View style={styles.container}>

            <View style={styles.hud}>
                <PlayerHUD
                    currentHex={currentHex}
                    distance={distance}
                    timeInHex={timeInHex}
                    visitedCount={visitedHexes.size}
                />
            </View>

            <MapView
                ref={mapRef}
                showsUserLocation
                style={styles.map}
            >

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

                <Polyline
                    coordinates={trail}
                    strokeWidth={4}
                    strokeColor="#2196F3"
                />

            </MapView>

        </View>
    )
}

export default MapScreen

const styles = StyleSheet.create({

    container: { flex: 1 },

    hud: {
        position: "absolute",
        top: 50,
        width: "100%",
        zIndex: 10
    },

    map: { flex: 1 }

})