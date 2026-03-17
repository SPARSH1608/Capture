# Territory Game (React Native + H3)

This project is a real-world, location-based territory game where players move physically and capture regions on a map. The map is divided into hexagonal cells using H3 indexing, and each cell behaves like a small unit of territory that can be captured, owned, and eventually lost over time.

The goal of the system so far has been to build a **strong core engine** before adding multiplayer or backend complexity. Everything implemented until now runs locally on the device but follows patterns that can scale later.

---

# What the Project Does Right Now

At its current stage, the application already behaves like a simple single-player territory system. It continuously tracks the user’s real-world movement and maps it into a structured grid.

The system currently supports:

* tracking the player’s GPS location in real time
* converting GPS coordinates into H3 hex indexes
* rendering a grid of hexagons around the player
* tracking how the player moves (trail, distance, time)
* calculating capture progress inside a hex
* assigning ownership to hexes when fully captured
* maintaining ownership for a fixed duration
* gradually reducing ownership over time (decay)
* displaying all of this data in the UI

---

# Core System Overview

The application is built as a pipeline where each layer transforms raw data into more meaningful game state.

```text
GPS → Movement → Hex Mapping → Capture Logic → Territory State → UI
```

Each step has a clear responsibility.

---

# 1. Location Tracking

The app uses the Expo Location API to continuously receive the user’s position.

* The function `watchPositionAsync` subscribes to location updates
* Updates are triggered based on time and distance thresholds
* Each update gives a coordinate: latitude and longitude

This is the raw input of the system. Everything else builds on top of it.

---

# 2. Movement Tracking

Once we receive coordinates, we do not use them directly. Instead, we build a movement model.

There are three parts here:

### Path Trail

* We store every coordinate in an array
* This array represents the player’s path over time
* It is rendered as a polyline on the map

What it does:

* gives visual feedback of movement
* becomes the base for distance calculation
* can later be used for analytics or anti-cheat

---

### Distance Tracking

* We calculate distance between consecutive coordinates
* This uses the Haversine formula (accounts for Earth’s curvature)
* Each small movement adds to a running total

What it does:

* measures actual movement
* ensures gameplay is based on walking, not just presence

---

### Time Tracking

* A timer increments every second while the player stays in a hex
* This is reset when entering a new hex

What it does:

* allows slow progress even without movement
* balances gameplay between active and passive players

---

# 3. H3 Hex System

Instead of using raw coordinates, we convert the world into discrete cells.

* `latLngToCell` converts GPS → hex index
* `gridDisk` generates nearby hexes
* `cellToBoundary` converts hex → polygon

We use resolution 9, which gives hexes roughly 100–150 meters wide.

What this achieves:

* converts continuous space into manageable units
* allows us to define “territory”
* simplifies spatial logic

---

# 4. Hex Entry Detection

This condition is central:

```ts
if (newHex !== currentHex)
```

What it means:

* the player has crossed a boundary
* the game should react

When this happens:

* time is reset
* distance is reset
* capture starts again
* grid is recalculated

This is effectively the **event trigger of the game engine**.

---

# 5. Capture System

Capture is how a player takes control of a hex.

We combine movement signals into a score:

* distance contributes 70%
* time contributes 30%

```text
captureScore = distance * 0.7 + time * 0.3
```

Then we convert it into percentage:

```text
capturePercent = min(100, score / 100)
```

What this does:

* rewards movement more than inactivity
* still allows progress when stationary
* creates a smooth progression system

---

# 6. Territory State

Once a hex is captured, we store it as a structured object.

Instead of just storing hex IDs, we store:

```ts
type Territory = {
  owner: "player" | "neutral"
  capturePercent: number
  capturedAt: number
}
```

All territories are stored in:

```ts
Record<string, Territory>
```

What this enables:

* tracking ownership
* tracking strength of control
* enabling time-based systems

---

# 7. Ownership Logic

When capture reaches 100%:

* the hex becomes owned by the player
* capturePercent is set to 100
* capturedAt stores the timestamp

This converts temporary progress into persistent game state.

---

# 8. Lock Period (Safe Ownership)

After a hex is captured, it enters a protected state.

* duration: 24 hours
* no decay happens during this period

This is checked using:

```text
currentTime - capturedAt < lockDuration
```

What this achieves:

* gives players a sense of reward
* prevents immediate loss
* creates a stable ownership window

---

# 9. Decay System

After the lock period expires:

* capturePercent starts decreasing gradually
* this runs on a timer (every few seconds)

If capturePercent reaches 0:

* the hex is removed from state
* it becomes neutral again

Important detail:

* removing the hex from state means neutral
* we do not store neutral explicitly

What this achieves:

* keeps the map dynamic
* encourages players to revisit areas
* prevents permanent dominance

---

# 10. Rendering System

The map reflects the state of each hex.

Each hex is rendered as a polygon.

The color depends on its state:

* current hex → blue
* owned hex → green (intensity based on strength)
* visited hex → yellow
* neutral hex → light gray

The opacity of owned hexes is tied to capturePercent:

* higher percent → stronger color
* lower percent → faded color

This gives a visual representation of decay.

---

# 11. HUD System

The HUD displays real-time information to the player.

It receives data from MapScreen via props.

Displayed values include:

* current hex
* distance walked
* time spent in hex
* capture percentage
* visited hex count

Important design principle:

* HUD does not compute anything
* it only displays state

---

# Key Design Decisions

The system is designed around a few core ideas:

* use discrete hexes instead of raw coordinates
* separate movement tracking from game logic
* avoid mutating state directly (immutability)
* represent absence of data as neutral state
* use time-based systems for dynamic gameplay

---

# What Has Been Achieved

At this stage, the project includes:

* a real-time movement engine
* a spatial grid system
* a capture mechanism
* a territory ownership model
* a decay system

This is essentially the core of a location-based strategy game.

---

# What Comes Next

The next major system is player vs player interaction.

The idea is:

* a player enters a hex owned by someone else
* their movement reduces the current owner’s control
* at the same time, their own control increases
* ownership flips when control reaches a threshold

This introduces:

* competition
* strategy
* real multiplayer gameplay

---

# Summary

The project has moved from:

* displaying a map

to:

* building a structured, state-driven game world

The current system is already capable of:

* mapping real-world movement into territory control
* evolving territory over time
* representing game state visually

The next step is to introduce **conflict between players**, which will turn this into a complete game loop.
