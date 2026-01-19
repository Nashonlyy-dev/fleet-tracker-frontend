import Location from "../models/Locations.js";

export const saveLocation = async (driverId, coordinates) => {
    const location = new Location({
        driverId,
        location: {
            type: "Point",
            coordinates: [coordinates.longitude, coordinates.latitude]
        }
    });
    await location.save();
};

