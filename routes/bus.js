const express = require('express');
const router = express.Router();
const BusData = require('../models/BusData');

router.get('/search', async (req, res) => {
  const { source, destination, date } = req.query;
  
  if (!source || !destination || !date) {
    return res.status(400).json({
      success: false,
      error: 'Missing required query parameters: source, destination, or date',
    });
  }

  try {
    const buses = await BusData.find({ date });
    const results = [];

    for (const bus of buses) {
      const route = bus.route;

      const sourceIndex = route.findIndex(
        stop => stop.stopName.toLowerCase() === source.toLowerCase()
      );
      const destIndex = route.findIndex(
        stop => stop.stopName.toLowerCase() === destination.toLowerCase()
      );

      if (sourceIndex !== -1 && destIndex !== -1 && sourceIndex < destIndex) {
        let totalFare = 0;
        for (let i = sourceIndex; i < destIndex; i++) {
          totalFare += route[i].fareToNext || 0;
        }

        // ✅ Logging to confirm values
        console.log("STOP NAMES:", route.map(stop => stop.stopName));

        results.push({
          busId: bus._id,
          busNumber: bus.busNumber,
          busName: bus.busName,
          totalFare,
          departureTime: route[sourceIndex].departureTime || '',
          arrivalTime: route[destIndex].arrivalTime || '',
          from: source,
          to: destination,
          stopNames: route.map(stop => stop.stopName), // ✅ MUST be here
        });
      }
    }

    return res.status(200).json({
      success: true,
      buses: results,
    });

  } catch (err) {
    console.error('Error searching buses:', err);
    return res.status(500).json({
      success: false,
      error: 'Server error while searching buses',
    });
  }
});

module.exports = router;
