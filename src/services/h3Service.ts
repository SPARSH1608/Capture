
import * as h3 from "h3-js"
const RESOLUTION = 9
export function getHexIndex(latitude: number, longitude: number) {
    return h3.latLngToCell(latitude, longitude, RESOLUTION)
}
export function getNeighbours(hexIndex: string) {
    return h3.gridDisk(hexIndex, 3)
    //2 gives 19 hexes
    //3 radius gives 37 hexes
}
export function getHexBoundary(hexIndex: string) {
    const boundary = h3.cellToBoundary(hexIndex)
    // console.log('boundar', boundary)
    return boundary.map(([lat, lng]) => ({
        latitude: lat,
        longitude: lng
    }))
}