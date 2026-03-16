export function distanceMeters(a: any, b: any) {
    const R = 6371000

    const lat1 = (a.latitude * Math.PI) / 180
    const lat2 = (b.latitude * Math.PI) / 180

    const dLat = lat2 - lat1
    const dLon = ((b.longitude - a.longitude) * Math.PI) / 180

    const x =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))

    return R * c
}