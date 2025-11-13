const express = require('express');
const router = express.Router();

// Hard-coded emergency contacts (can be expanded)
const emergencyContacts = {
  police: "100",
  ambulance: "108",
  fire: "101"
};

// Get emergency contacts
router.get('/', (req, res) => {
  res.json(emergencyContacts);
});

module.exports = router;
