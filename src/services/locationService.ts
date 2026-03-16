import * as Location from "expo-location";
export async function requestLocationPermission() {
    const { status } = await Location.requestForegroundPermissionsAsync()
    console.log('status', status)
    if (status !== "granted") {
        throw new Error('Location Permission not granted')
    }

}

export async function getCurrentLocation() {
    const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
    });
    return location.coords
}

export async function startLocationTracking(callback: (coords: any) => void) {
    const subscription = await Location.watchPositionAsync(
        {
            accuracy: Location.Accuracy.High,
            timeInterval: 3000,
            distanceInterval: 1
        },
        (location) => {
            callback(location.coords)
        }
    )
    return subscription
}