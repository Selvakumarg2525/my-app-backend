// Updated pricingController.js with new calculation logic
const GoodsType = require('../models/GoodsType');

// Updated rates in INR
const PETROL_RATE = 100; // INR per liter
const DRIVER_RATE_PER_KM = 10; // INR per km for driver
const CO_DRIVER_RATE_PER_KM = 8; // INR per km for co-driver

// Vehicle mileage (km per liter)
const VEHICLE_MILEAGE = {
  'Two-Wheelers': 40,
  'Three-Wheelers (Cargo Autos)': 30,
  'Mini Trucks & Vans': 20,
  'Medium Trucks': 20,
  'Large Trucks': 15,
  'Special Purpose Vehicles': 10
};

// Vehicle base distance rates (INR per km)
const VEHICLE_DISTANCE_RATES = {
  'Two-Wheelers': 5,
  'Three-Wheelers (Cargo Autos)': 10,
  'Mini Trucks & Vans': 15,
  'Medium Trucks': 20,
  'Large Trucks': 25,
  'Special Purpose Vehicles': 30
};

// Weight limits for vehicle suggestions (kg)
const VEHICLE_WEIGHT_LIMITS = {
  'Two-Wheelers': 50,
  'Three-Wheelers (Cargo Autos)': 200,
  'Mini Trucks & Vans': 1000,
  'Medium Trucks': 300,
  'Large Trucks': 1000,
  'Special Purpose Vehicles': 3000
};

exports.getGoodsTypes = async (req, res) => {
  try {
    const goodsTypes = await GoodsType.find();
    res.json({ success: true, goodsTypes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.calculatePrice = async (req, res) => {
  try {
    const {
      distance,
      vehicleType,
      goodsTypeId,
      weight,
      hasCoDriver
    } = req.body;

    // Validate inputs
    if (distance == null || isNaN(distance) || distance <= 0) {
          return res.status(400).json({
            success: false,
            error: 'Distance is required and must be a positive number'
          });
        }
    if (!vehicleType) {
      return res.status(400).json({
        success: false,
        error: 'Vehicle type is required'
      });
    }

    if (!goodsTypeId) {
      return res.status(400).json({
        success: false,
        error: 'Goods type is required'
      });
    }

    if (weight == null || isNaN(weight) || weight <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Weight is required and must be a positive number'
      });
    }
    // Get goods type details
    const goodsType = await GoodsType.findById(goodsTypeId);
    if (!goodsType) {
      return res.status(404).json({
        success: false,
        error: 'Goods type not found'
      });
    }

    // Validate vehicle type
    if (!VEHICLE_MILEAGE[vehicleType]) {
      return res.status(400).json({
        success: false,
        error: 'Invalid vehicle type'
      });
    }

    // Calculate base cost based on goods type and weight

    console.log('GoodsType:', goodsType);
    console.log('Weight:', weight);


    const baseCost = goodsType.baseRate * weight;
    console.log('Base cost calculation:', `${goodsType.baseRate} * ${weight} = ${baseCost}`);

    // Calculate distance cost based on vehicle type
    const distanceCost = VEHICLE_DISTANCE_RATES[vehicleType] * distance;

    // Calculate fuel cost based on vehicle mileage
    const fuelCost = (distance / VEHICLE_MILEAGE[vehicleType]) * PETROL_RATE;

    // Calculate labor cost (per km basis)
    const laborCost = hasCoDriver
      ? (DRIVER_RATE_PER_KM + CO_DRIVER_RATE_PER_KM) * distance
      : DRIVER_RATE_PER_KM * distance;

    // Calculate total cost
    const totalCost = baseCost + distanceCost + fuelCost + laborCost;

    // Determine suggested vehicles based on weight
    const suggestedVehicles = Object.entries(VEHICLE_WEIGHT_LIMITS)
      .filter(([_, limit]) => weight <= limit)
      .map(([type]) => type);

    res.json({
      success: true,
      estimate: {
        baseCost: Math.round(baseCost * 100) / 100,
        distanceCost: Math.round(distanceCost * 100) / 100,
        fuelCost: Math.round(fuelCost * 100) / 100,
        laborCost: Math.round(laborCost * 100) / 100,
        totalCost: Math.round(totalCost * 100) / 100
      },
      breakdown: {
        goodsType: goodsType.name,
        vehicleType,
        distance,
        weight,
        hasCoDriver
      },
      suggestions: {
        suitableVehicles: suggestedVehicles
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};