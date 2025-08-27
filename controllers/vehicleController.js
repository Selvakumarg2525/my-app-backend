    const Vehicle = require('../models/Vehicle');
    const mongoose = require('mongoose');


    // Prefixes for different vehicle types
    const VEHICLE_PREFIXES = {
      'Two-Wheelers': 'BK',
      'Three-Wheelers (Cargo Autos)': 'AUT',
      'Mini Trucks & Vans': 'MTV',
      'Medium Trucks': 'MED',
      'Large Trucks': 'LRG',
      'Special Purpose Vehicles': 'SPV'
    };

    // Electric vehicle suffix
    const ELECTRIC_SUFFIX = 'E';

    exports.generateVehicleId = async (req, res) => {
      try {
        const { captainId, vehicleType, registrationNumber } = req.body;

        if (!req.files || !req.files['vehicleImage'] || !req.files['registrationImage']) {
          return res.status(400).json({
            success: false,
            error: 'Both vehicle image and registration image are required'
          });
        }

        // Check if registration number already exists
        const existingReg = await Vehicle.findOne({ registrationNumber });
        if (existingReg) {
          return res.status(400).json({
            success: false,
            error: 'This registration number is already in use'
          });
        }

        // Generate vehicle ID based on type
        let prefix = VEHICLE_PREFIXES[vehicleType];
        if (!prefix) {
          return res.status(400).json({
            success: false,
            error: 'Invalid vehicle type'
          });
        }

        // Check if electric (based on registration number - simple check)
        const isElectric = registrationNumber.toUpperCase().includes('E');
        if (isElectric) {
          prefix = `E${prefix}`;
        }

        // Get count of existing vehicles of this type to generate sequential number
        const count = await Vehicle.countDocuments({ vehicleType });
        const sequentialNumber = (count + 1).toString().padStart(3, '0');

        const vehicleId = `${prefix}${sequentialNumber}`;

        res.status(200).json({
          success: true,
          vehicleId,
          vehicleType,
          isElectric
        });

      } catch (error) {
        console.error('Error generating vehicle ID:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    };

    exports.registerVehicle = async (req, res) => {
      try {
        const { captainId, vehicleType, vehicleId, registrationNumber } = req.body;

        if (!req.files || !req.files['vehicleImage'] || !req.files['registrationImage']) {
          return res.status(400).json({
            success: false,
            error: 'Both vehicle image and registration image are required'
          });
        }

        // Check if vehicle ID already exists
        const existingVehicle = await Vehicle.findOne({ vehicleId });
        if (existingVehicle) {
          return res.status(400).json({
            success: false,
            error: 'This vehicle ID is already in use'
          });
        }

        // Create new vehicle
        const vehicle = new Vehicle({
          captainId,
          vehicleType,
          vehicleId,
          registrationNumber,
          vehicleImage: {
            data: req.files['vehicleImage'][0].buffer,
            contentType: req.files['vehicleImage'][0].mimetype
          },
          registrationImage: {
            data: req.files['registrationImage'][0].buffer,
            contentType: req.files['registrationImage'][0].mimetype
          }
        });

        await vehicle.save();

        res.status(201).json({
          success: true,
          vehicle: {
            vehicleId: vehicle.vehicleId,
            vehicleType: vehicle.vehicleType,
            registrationNumber: vehicle.registrationNumber,
            createdAt: vehicle.createdAt
          }
        });

      } catch (error) {
        console.error('Error registering vehicle:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    };
    // Add these new methods to your vehicleController

    exports.getVehicles = async (req, res) => {
      try {
        const { captainId, vehicleType } = req.query;
        const query = {};

        // If captainId is provided, filter by captain
        if (captainId) {
          query.captainId = captainId;
        }

        // If vehicleType is provided, filter by type
        if (vehicleType) {
          if (![
            'Two-Wheelers',
            'Three-Wheelers (Cargo Autos)',
            'Mini Trucks & Vans',
            'Medium Trucks',
            'Large Trucks',
            'Special Purpose Vehicles'
          ].includes(vehicleType)) {
            return res.status(400).json({
              success: false,
              error: 'Invalid vehicle type'
            });
          }
          query.vehicleType = vehicleType;
        }

        const vehicles = await Vehicle.find(query)
          .select('-vehicleImage -registrationImage -__v')
          .sort({ createdAt: -1 });

        res.status(200).json({
          success: true,
          count: vehicles.length,
          vehicles
        });
      } catch (error) {
        console.error('Error getting vehicles:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    };

    exports.getVehicleDetails = async (req, res) => {
      try {
        const { vehicleId } = req.params;

        if (!vehicleId) {
          return res.status(400).json({
            success: false,
            error: 'Vehicle ID is required'
          });
        }

        let vehicle = await Vehicle.findOne({ vehicleId });

        // Also check by _id if vehicleId doesn't match directly
        if (!vehicle && mongoose.Types.ObjectId.isValid(vehicleId)) {
          vehicle = await Vehicle.findById(vehicleId);
        }

        if (!vehicle) {
          return res.status(404).json({
            success: false,
            error: 'Vehicle not found'
          });
        }

        // Convert binary data to Base64
        const vehicleResponse = vehicle.toObject();
        vehicleResponse.vehicleImage = {
          data: vehicleResponse.vehicleImage.data.toString('base64'),
          contentType: vehicleResponse.vehicleImage.contentType
        };
        vehicleResponse.registrationImage = {
          data: vehicleResponse.registrationImage.data.toString('base64'),
          contentType: vehicleResponse.registrationImage.contentType
        };
        delete vehicleResponse.__v;

        res.status(200).json({
          success: true,
          vehicle: vehicleResponse
        });
      } catch (error) {
        console.error('Error getting vehicle details:', error);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    };
    exports.getCaptainVehicleTypes = async (req, res) => {
      try {
        const { captainId } = req.params;

        // Find all vehicles for this captain
        const vehicles = await Vehicle.find({ captainId }).select('vehicleType -_id');

        // Get unique vehicle types
        const vehicleTypes = [...new Set(vehicles.map(v => v.vehicleType))];

        res.json({
          success: true,
          vehicleTypes
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    };