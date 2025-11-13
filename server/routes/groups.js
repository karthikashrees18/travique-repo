const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// Get all groups
router.get('/', async (req, res) => {
  try {
    const groups = await prisma.group.findMany({
      include: { members: true }
    });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new group
router.post('/', async (req, res) => {
  try {
    const { name, description, type } = req.body;
    const group = await prisma.group.create({
      data: { name, description, type }
    });
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Join a group
router.post('/:id/join', async (req, res) => {
  try {
    const { userId } = req.body;
    const group = await prisma.group.update({
      where: { id: parseInt(req.params.id) },
      data: {
        members: {
          connect: { id: userId }
        }
      },
      include: { members: true }
    });
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
