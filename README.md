# Territory Game (React Native + H3)

A real-world multiplayer territory capture game inspired by **Strava heatmaps, Pokémon Go, and Ingress**, where players **walk in the real world to capture hexagonal regions** on a map.

This project is being built step-by-step using **React Native (Expo) + TypeScript + H3 geospatial indexing**.

The current version implements:

* Real-time GPS tracking
* Player marker on map
* H3 hex indexing
* Dynamic hex grid around the player

Future updates will add **territory ownership, multiplayer battles, clans, and progression systems**.

---

# Tech Stack

Frontend

* React Native
* Expo
* TypeScript
* React Native Maps

Geospatial System

* Uber H3 (`h3-js`)

Location

* Expo Location API

Architecture

* Modular service-based architecture

```
GPS → H3 Index → Hex Grid → Map Rendering
```

---

# Project Structure

```
app
 └ index.tsx

src
 ├ components
 │   └ PlayerHUD.tsx
 │
 ├ screens
 │   └ MapScreen.tsx
 │
 ├ services
 │   ├ locationService.ts
 │   └ h3Service.ts
 │
 ├ hooks
 ├ store
 ├ types
 └ utils

learning
 └ exercises
```

**Important**

`src/` contains production game code.
`learning/` contains practice experiments and exercises.

---

# Setup Instructions

## 1 Install dependencies

```
npm install
```

Install map library

```
npx expo install react-native-maps
```

Install location services

```
npx expo install expo-location
```

Install H3 geospatial library

```
npm install h3-js
```

Start the development server

```
npx expo start
```

---

# Core Systems Implemented

## 1 Map Rendering

The app renders a native map using **react-native-maps**.

```
<MapView />
```

The map fills the entire screen and serves as the main gameplay layer.

The player HUD floats above the map using absolute positioning.

---

## 2 Real-Time GPS Tracking

Location tracking uses the Expo Location API.

```
watchPositionAsync()
```

The system listens for location updates and updates the player's position in real time.

Configuration:

* High accuracy GPS
* Updates every few seconds
* Movement threshold to prevent excessive updates

Pipeline:

```
Phone GPS
↓
Expo Location
↓
Location Service
↓
React State
↓
Map Marker
```

---

## 3 Player Marker

The player's real location is rendered on the map.

```
<MapView>
   <Marker />
</MapView>
```

The map camera follows the player using:

```
animateToRegion()
```

---

# 4 H3 Geospatial Indexing

The world is divided into **hexagonal cells using Uber H3**.

Each GPS coordinate converts to a **hex index**.

Example:

```
28.6139 , 77.2090
↓
8928308280fffff
```

Resolution used:

```
Resolution = 9
```

This produces hexes approximately **100–150 meters wide**, ideal for walking-based gameplay.

Conversion function:

```
latLngToCell(latitude, longitude, resolution)
```

---

# 5 Hex Grid Generation

Once the player hex is determined, surrounding hexes are generated using:

```
gridDisk()
```

Example:

```
radius = 2
```

This produces **19 hexes around the player**.

Grid layout:

```
⬡ ⬡ ⬡
⬡ 🧍 ⬡
⬡ ⬡ ⬡
```

---

# 6 Rendering Hexagons

Each hex index is converted to map coordinates using:

```
cellToBoundary()
```

This returns the 6 corner points of the hexagon.

These coordinates are rendered on the map using:

```
<MapView.Polygon />
```

Example:

```
hex index
↓
6 coordinates
↓
polygon overlay
```

---

# Gameplay Model (Planned)

The long-term gameplay loop:

```
player walks
↓
GPS updates
↓
convert to H3 hex
↓
detect hex change
↓
start territory capture
↓
update ownership
↓
sync with server
```

Ownership example:

```
Player A: 60%
Player B: 40%
```

When a player crosses **50% ownership**, the hex becomes theirs.

---

# Current Features

Implemented:

* Map rendering
* Player GPS tracking
* Player marker
* H3 hex indexing
* Dynamic hex grid rendering

Not implemented yet:

* Territory capture logic
* Multiplayer synchronization
* Leaderboards
* Teams or clans
* Anti-cheat systems

---

# Next Development Milestones

## Hex Detection

Detect when the player **enters a new hex cell**.

```
previousHex !== currentHex
```

Trigger capture logic.

---

## Territory Capture

Players capture hexes by walking inside them.

Example:

```
distance walked inside hex
↓
capture percentage increases
```

---

## Multiplayer Territory System

Hex ownership stored on a server.

```
player → server → map update
```

Possible ownership states:

```
Neutral
Owned by player
Owned by enemy
```

---

## Real-Time Updates

Using sockets or streaming APIs to update territory state instantly.

---

## Anti-Cheat System

Prevent GPS spoofing using:

* speed limits
* movement validation
* sensor fusion

---

# Future Features

* Player leveling
* Skill trees
* Clan systems
* Territory wars
* Seasonal map resets
* Event zones
* Resource generation from owned hexes

---

# Inspiration

Games and systems that inspired this project:

* Pokémon Go
* Ingress
* Strava Heatmaps
* Uber H3 geospatial system

---

# Development Philosophy

The project focuses on:

* clean architecture
* scalable systems
* real-world geospatial computation
* multiplayer territory mechanics

The goal is to build a **production-quality geospatial game engine** step by step.

---

# Author

Sparsh Goel
