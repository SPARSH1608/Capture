
import * as h3 from "h3-js"
const RESOLUTION = 9
export function getHexIndex(latitude: number, longitude: number) {
    return h3.latLngToCell(latitude, longitude, RESOLUTION)
}