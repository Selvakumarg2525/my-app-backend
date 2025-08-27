const express = require('express');
const vehicleController = require('../controllers/vehicleController');
const upload = require('../config/multer');

const router = express.Router();

router.post(
  '/generate-id',
  upload.fields([
    { name: 'vehicleImage', maxCount: 1 },
    { name: 'registrationImage', maxCount: 1 }
  ]),
  vehicleController.generateVehicleId
);

router.post(
  '/register',
  upload.fields([
    { name: 'vehicleImage', maxCount: 1 },
    { name: 'registrationImage', maxCount: 1 }
  ]),
  vehicleController.registerVehicle
);

// Add these new routes
router.get('/', vehicleController.getVehicles);

// Get specific vehicle by ID
router.get('/:vehicleId', vehicleController.getVehicleDetails);

// Add these new routes at the bottom of vehicleRoutes.js

// Update Vehicle
router.put('/:vehicleId', async (req, res) => {
  try {
    const { vehicleType, registrationNumber, isActive } = req.body;
    const updatedVehicle = await Vehicle.findOneAndUpdate(
      { vehicleId: req.params.vehicleId },
      { vehicleType, registrationNumber, isActive },
      { new: true }
    ).select('-vehicleImage -registrationImage -__v');

    if (!updatedVehicle) {
      return res.status(404).json({ success: false, error: 'Vehicle not found' });
    }

    res.json({ success: true, vehicle: updatedVehicle });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete Vehicle
router.delete('/:vehicleId', async (req, res) => {
  try {
    const deletedVehicle = await Vehicle.findOneAndDelete({
      vehicleId: req.params.vehicleId
    });

    if (!deletedVehicle) {
      return res.status(404).json({ success: false, error: 'Vehicle not found' });
    }

    res.json({ success: true, message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router.get('/captain/:captainId/types', vehicleController.getCaptainVehicleTypes);


module.exports = router;