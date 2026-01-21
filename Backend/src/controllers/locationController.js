import { saveLocation } from "../services/locationService.js";
import { io } from "../server.js";

export const requestLocationUpdate = async (req, res) => {
  try {
    const { driverId, coordinates } = req.body;
    await saveLocation(driverId, coordinates);

 io.emit('location-received', {
    driverId,
    coordinates: {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude
    },
    timestamp: new Date()
});

    res.status(200).json({ message: "Location updated successfully." });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
