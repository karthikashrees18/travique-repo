const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { groups: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new user
router.post('/', async (req, res) => {
  try {
    const { name, email, latitude, longitude, socialLink } = req.body;
    const user = await prisma.user.create({
      data: { name, email, latitude, longitude, socialLink }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get nearby users (within 10km)
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: 'Latitude and longitude required' });

    const users = await prisma.user.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null }
      },
      include: { groups: true }
    });

    const nearby = users.filter(user => {
      const distance = getDistance(parseFloat(lat), parseFloat(lng), user.latitude, user.longitude);
      return distance <= 10; // 10km
    });

    res.json(nearby);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to calculate distance in km
function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLng = deg2rad(lng2 - lng1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

module.exports = router;
