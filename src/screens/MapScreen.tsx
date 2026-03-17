import PlayerHUD from "@/components/PlayerHUD"
import { getHexBoundary, getHexIndex, getNeighbours } from "@/services/h3Service"
import { requestLocationPermission, startLocationTracking } from "@/services/locationService"
import { distanceMeters } from "@/utils/distance"
import React, { useEffect, useRef, useState } from "react"
import { StyleSheet, View } from "react-native"
import MapView, { Polygon, Polyline } from "react-native-maps"
type Territory = {
    owner: "player" | "neutral",
    capturePercent: number
    capturedAt: number
}
const LOCK_DURATION = 24 * 60 * 60 * 1000
const MapScreen = () => {

    const mapRef = useRef<MapView>(null)
    const [territories, setTerritories] = useState<Record<string, Territory>>({})
    const prevLocationRef = useRef<any>(null)
    const currentHexRef = useRef<string | null>(null)

    const [location, setLocation] = useState<any>(null)
    const [hexes, setHexes] = useState<string[]>([])
    const [currentHex, setCurrentHex] = useState<string | null>(null)
    const [visitedHexes, setVisitedHexes] = useState<Set<string>>(new Set())
    const [capturePercent, setCapturePercent] = useState(0)
    const [distance, setDistance] = useState(0)
    const [timeInHex, setTimeInHex] = useState(0)
    const [ownedHexes, setOwnedHexes] = useState<Set<string>>(new Set())
    const [trail, setTrail] = useState<
        { latitude: number; longitude: number }[]
    >([])

    useEffect(() => {
        const interval = setInterval(() => {
            setTerritories(prev => {
                const updated: Record<string, Territory> = {}
                Object.keys(prev).forEach(hex => {
                    const t: Territory = prev[hex]
                    if (t.owner !== "player") {
                        updated[hex] = t
                        return
                    }
                    const age = Date.now() - t.capturedAt
                    if (age < LOCK_DURATION) {
                        updated[hex] = t
                        return
                    }
                    const newPercent = t.capturePercent - 1
                    if (newPercent > 0) {
                        updated[hex] = {
                            ...t,
                            capturePercent: newPercent
                        }
                    }
                })
                return updated
            })
        }, 5000)
        return () => clearInterval(interval)

    }, [])
    useEffect(() => {
        const score = distance * 0.7 + timeInHex * 0.3

        const percent = Math.min(100, score / 100)
        setCapturePercent(percent)
    }, [distance, timeInHex])

    useEffect(() => {

        if (!currentHex) return

        if (capturePercent >= 100) {

            setTerritories(prev => ({
                ...prev,
                [currentHex]: {
                    owner: "player",
                    capturePercent: 100,
                    capturedAt: Date.now()
                }
            }))
            // Set(prev => {
            //     const updated = new Set(prev)
            //     updated.add(currentHex)
            //     return updated
            // })

        }

    }, [capturePercent])
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

        // console.log("Entered new hex:", hex)

        currentHexRef.current = hex

        setCurrentHex(hex)
        setTimeInHex(0)
        setDistance(0)
        setCapturePercent(0)

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
                    capturePercent={capturePercent}
                />
            </View>

            <MapView
                ref={mapRef}
                showsUserLocation
                style={styles.map}
            >
                {/* green strong → fully owned
                green faded → decaying
                blue → current hex
                gray → neutral */}
                {hexes.map((hex) => {

                    const isPlayerHex = hex === currentHex
                    const territory = territories[hex]

                    let fill = "rgba(76,175,80,0.15)"

                    if (territory?.owner === "player") {
                        fill = `rgba(0,200,83,${territory.capturePercent / 100})`
                    }

                    if (isPlayerHex) {
                        fill = "rgba(33,150,243,0.45)"
                    }

                    return (
                        <Polygon
                            key={hex}
                            coordinates={getHexBoundary(hex)}
                            // strokeColor="#444"
                            fillColor={fill}
                            strokeWidth={0.1}
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