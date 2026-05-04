const calculateDistances = async (originPlaceId, destinations) => {
  const newDest = destinations
    .map(
      (dest) =>
        `${dest.streetaddress},${dest.city},${dest.state},${dest.zipcode}`,
    )
    .join("|");

  // Build the URL for the Distance Matrix API request
  const url = new URL(
    "https://maps.googleapis.com/maps/api/distancematrix/json",
  );
  url.searchParams.append("origins", `place_id:${originPlaceId}`);
  url.searchParams.append("destinations", newDest);
  url.searchParams.append("key", process.env.GOOGLE_CLOUD_APIKEY);

  try {
    // Make the HTTP request to the Distance Matrix API
    const response = await fetch(url.toString());
    const data = await response.json();

    // Check for errors in the response
    if (response.status !== 200 || data.status !== "OK") {
      console.error("Error with Distance Matrix API:", data);
      return [];
    }

    const distances = data.rows[0].elements.map((element, index) => ({
      distance: element.distance.value, // distance in meters
      job: destinations[index],
    }));

    return distances;
  } catch (error) {
    console.error("Error calculating distances:", error);
    return [];
  }
};

module.exports = calculateDistances;
