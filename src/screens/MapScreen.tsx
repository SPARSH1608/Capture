import PlayerHUD from '@/components/PlayerHUD';
import { getHexIndex } from '@/services/h3Service';
import { requestLocationPermission, startLocationTracking } from '@/services/locationService';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
const MapScreen = () => {
    const [location, setLocation] = useState<any>(null)
    const mapRef = useRef<MapView>(null)
    useEffect(() => {

        let subscription: any;

        async function startTracking() {
            await requestLocationPermission()
            subscription = await startLocationTracking((coords) => {
                setLocation(coords)
                const hex = getHexIndex(coords.latitude, coords.longitude)
                console.log('hex', hex)
                mapRef.current?.animateToRegion({
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01
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

                {location && (
                    <Marker coordinate={{
                        latitude: location.latitude,
                        longitude: location.longitude
                    }}
                        title='You are here'
                    />
                )}
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