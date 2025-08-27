// controllers/orderController.js
const OrderLocation = require('../models/OrderLocation');
const Order = require('../models/Order');
const User = require('../models/User');
// Add this to OrderController.js
const Review = require('../models/Review');

// Add to orderController.js

// Confirm pickup by captain
// In orderController.js, update the confirmPickup function
exports.confirmPickup = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { captainId } = req.body;

    // Verify the captain is assigned to this order
    const order = await Order.findOne({ _id: orderId, captainId });
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found or captain not assigned'
      });
    }

    // Only allow pickup if status is 'accepted'
    if (order.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        error: 'Order cannot be picked up in its current status'
      });
    }

    // Update order status to 'picked-up'
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        status: 'picked-up',
        updatedAt: new Date()
      },
      { new: true }
    );

    res.json({
      success: true,
      order: updatedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Confirm delivery by captain
// In orderController.js, update the confirmDelivery function
exports.confirmDelivery = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { captainId } = req.body;

    // Verify the captain is assigned to this order
    const order = await Order.findOne({ _id: orderId, captainId });
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found or captain not assigned'
      });
    }

    // Only allow delivery if status is 'picked-up'
    if (order.status !== 'picked-up') {
      return res.status(400).json({
        success: false,
        error: 'Order cannot be delivered in its current status'
      });
    }

    // Update order status to 'delivered'
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        status: 'delivered',
        updatedAt: new Date()
      },
      { new: true }
    ).populate('userId', 'fcmToken');

     if (updatedOrder.userId?.fcmToken) {
          const notificationPayload = {
            notification: {
              title: 'Order Delivered',
              body: 'Your order has been delivered. Please confirm receipt and rate your experience.',
              click_action: 'FLUTTER_NOTIFICATION_CLICK',
            },
            data: {
              orderId: orderId.toString(),
              type: 'order_delivered',
              screen: 'order_details',
            },
            token: updatedOrder.userId.fcmToken
          };

          // Send notification using Firebase Admin SDK
          await admin.messaging().send(notificationPayload);
          console.log('Notification sent to user:', updatedOrder.userId._id);
    }

    res.json({
      success: true,
      order: updatedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Confirm delivery by user
// In orderController.js, update the confirmDeliveryByUser function
exports.confirmDeliveryByUser = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { userId } = req.body;

    // Verify the user owns this order
    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found or user not authorized'
      });
    }

    // Only allow confirmation if status is 'delivered'
    if (order.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        error: 'Order cannot be confirmed in its current status'
      });
    }

    // Update order status to 'completed'
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        status: 'completed',
        updatedAt: new Date()
      },
      { new: true }
    );

    res.json({
      success: true,
      order: updatedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Submit review
exports.submitReview = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { userId, rating, comment } = req.body;

    // First update the order status to completed if not already
    const order = await Order.findOneAndUpdate(
      { _id: orderId, userId, status: 'delivered' },
      {
        status: 'completed',
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found or not eligible for review'
      });
    }

    // Create a new review
    const review = new Review({
      orderId: order._id,
      captainId: order.captainId,
      userId: order.userId,
      rating,
      comment
    });

    await review.save();

    // Also update the order with the review reference
    order.review = {
      rating,
      comment,
      createdAt: new Date()
    };
    await order.save();

    res.json({
      success: true,
      review,
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Add a new endpoint to get captain reviews
exports.getCaptainReviews = async (req, res) => {
  try {
    const { captainId } = req.params;

    const reviews = await Review.find({ captainId })
      .populate('userId', 'name phoneNumber')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const orderData = req.body;

    // Basic validation
    const user = await User.findById(orderData.userId);
     if (!user) {
          return res.status(400).json({
            success: false,
            error: 'User not found'
          });
        }
    if (!orderData.pickupDetails || !orderData.dropDetails || !orderData.packageDetails || !orderData.priceEstimate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required order fields'
      });
    }

    const newOrder = new Order(orderData);
    const savedOrder = await newOrder.save();

    res.status(201).json({
      success: true,
      order: savedOrder
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Add to orderController.js
exports.getUserActiveOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({
      userId,
      status: { $in: ['pending', 'accepted', 'picked-up', 'delivered'] }
    }).sort({ updatedAt: -1 });

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};



exports.acceptOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { captainId } = req.body;

    console.log(`Accepting order ${orderId} by captain ${captainId}`);

    // Validate inputs
    if (!captainId) {
      return res.status(400).json({
        success: false,
        error: 'Captain ID is required'
      });
    }

    // Update only the Order collection
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        $set: {
          status: 'accepted',
          captainId: captainId,
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      order: {
        _id: order._id,
        status: order.status,
        captainId: order.captainId,
        // Include other fields you need in the response
        pickupDetails: order.pickupDetails,
        packageDetails: order.packageDetails
      }
    });

  } catch (error) {
    console.error('Error accepting order:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while accepting order'
    });
  }
};

// Add this to your existing orderController.js
// Update your findNearbyOrders in orderController.js
exports.findNearbyOrders = async (req, res) => {
  try {
    const { latitude, longitude, vehicleTypes } = req.body;

    // First try using OrderLocation collection with geospatial query
    let nearbyOrders = await OrderLocation.find({
      status: 'pending',
      vehicleType: { $in: vehicleTypes },
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude]
          },
          $maxDistance: 50000 // 50km max distance
        }
      }
    }).lean();

    // Lookup order details
    nearbyOrders = await Promise.all(nearbyOrders.map(async (location) => {
      const order = await Order.findById(location.orderId).lean();
      if (!order) return null;

      // Calculate distance
      const distance = calculateDistance(
        latitude,
        longitude,
        order.pickupDetails.location.lat,
        order.pickupDetails.location.lng
      );

      return {
        ...order,
        distance
      };
    }));

    // Filter out nulls
    nearbyOrders = nearbyOrders.filter(order => order !== null);

    // If no results from OrderLocation, fall back to basic query
    if (nearbyOrders.length === 0) {
      nearbyOrders = await Order.find({
        status: 'pending',
        'packageDetails.vehicleType': { $in: vehicleTypes },
        $and: [
          {
            'pickupDetails.location.lat': {
              $gte: latitude - 0.5, // ~55km
              $lte: latitude + 0.5
            }
          },
          {
            'pickupDetails.location.lng': {
              $gte: longitude - 0.5,
              $lte: longitude + 0.5
            }
          }
        ]
      }).lean();

      // Calculate distances for fallback results
      nearbyOrders = nearbyOrders.map(order => {
        const orderLat = order.pickupDetails.location.lat;
        const orderLng = order.pickupDetails.location.lng;
        const distance = calculateDistance(latitude, longitude, orderLat, orderLng);
        return {
          ...order,
          distance
        };
      });
    }

    // Filter by vehicle-specific radii
    const VEHICLE_SEARCH_RADII = {
      'Two-Wheelers': 10,
      'Three-Wheelers (Cargo Autos)': 15,
      'Mini Trucks & Vans': 20,
      'Medium Trucks': 30,
      'Large Trucks': 50,
      'Special Purpose Vehicles': 100
    };

    const filteredOrders = nearbyOrders.filter(order => {
      const maxRadius = VEHICLE_SEARCH_RADII[order.packageDetails.vehicleType] || 10;
      return order.distance <= maxRadius;
    });

    res.json({
      success: true,
      orders: filteredOrders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get captain's accepted orders
exports.getCaptainAcceptedOrders = async (req, res) => {
  try {
    const { captainId } = req.params;

    const orders = await Order.find({
      captainId,
      status: { $in: ['accepted', 'picked-up', 'delivered'] }
    }).sort({ updatedAt: -1 });

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getCaptainVehicles = async (req, res) => {
  try {
    const { captainId } = req.params;

    // Assuming you have a Captain model with vehicles
    const captain = await Captain.findById(captainId)
      .populate('vehicles', 'vehicleType');

    if (!captain) {
      return res.status(404).json({
        success: false,
        error: 'Captain not found'
      });
    }

    // Extract unique vehicle types
    const vehicleTypes = [...new Set(
      captain.vehicles.map(v => v.vehicleType)
    )];

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
// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}