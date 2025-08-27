        const Otp = require('../models/Otp');
        const otpGenerator = require('otp-generator');
        const User = require('../models/User');
        const fs = require('fs');
        const path = require('path');


        // Generate and store OTP
        exports.sendOtp = async (req, res) => {
          try {
            const { phoneNumber } = req.body;

            // Generate 6-digit OTP
            const otp = otpGenerator.generate(6, {
              digits: true,
              lowerCaseAlphabets: false,
              upperCaseAlphabets: false,
              specialChars: false
            });

            // Set expiration to 5 minutes from now
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

            // Save OTP to database
            const otpRecord = new Otp({
              phoneNumber,
              otp,
              expiresAt
            });

            await otpRecord.save();

            // In production, you would send the OTP via SMS service here
            console.log(`OTP for ${phoneNumber}: ${otp}`); // For development only

            res.json({
              success: true,
              message: 'OTP sent successfully',
              otp: otp // Only for development - remove in production
            });
          } catch (error) {
            res.status(500).json({ success: false, error: error.message });
          }
        };

        // Verify OTP
        exports.verifyOtp = async (req, res) => {
          try {
            const { phoneNumber, otp } = req.body;

            // Find the most recent OTP for this phone number
            const otpRecord = await Otp.findOne({
              phoneNumber,
              otp
            }).sort({ createdAt: -1 });

            if (!otpRecord) {
              return res.status(400).json({
                success: false,
                error: 'Invalid OTP or OTP expired'
              });
            }

            // If we get here, OTP is valid
            res.json({
              success: true,
              message: 'OTP verified successfully'
            });
          } catch (error) {
            res.status(500).json({ success: false, error: error.message });
          }
        };

    //      try {
    //        const { userType, phoneNumber, name, shortName, passkey  } = req.body;
    //
    //         let captainId;
    //             if (userType === 'captain') {
    //               const namePrefix = name
    //                 .replace(/[^a-zA-Z]/g, '')
    //                 .substring(0, 3)
    //                 .toUpperCase();
    //               const randomDigits = Math.floor(100 + Math.random() * 9000);
    //               captainId = `${namePrefix}${randomDigits}`.substring(0, 7);
    //             }
    //        const userData = {
    //          userType,
    //          phoneNumber,
    //          name,
    //          shortName,
    //          passkey,
    //          verified: true,
    //        };
    //
    //        if (userType === 'captain') {
    //              userData.captainId = captainId;
    //            }
    //        else {
    //              // Explicitly set to null for users
    //              userData.captainId = null;
    //            }
    //
    //        if (userType === 'captain'&&req.file) {
    //              userData.verificationId = {
    //                data: req.file.buffer,
    //                contentType: req.file.mimetype
    //              };
    //            }
    //        const user = new User(userData);
    //        await user.save();
    //
    //        // Return response without sensitive data
    //            const userResponse = user.toObject();
    //            delete userResponse.passkey;
    //
    //            res.status(201).json({
    //              success: true,
    //              user: userResponse,
    //              captainId: userResponse.captainId // Include this explicitly
    //            });
    //
    //      } catch (error) {
    //        console.error('Registration error:', error);
    //            res.status(400).json({
    //              success: false,
    //              error: error.message
    //            });
    //      }
    //    };
    exports.registerUser = async (req, res) => {
      try {
        const { userType, phoneNumber, name, shortName, passkey, captainId  } = req.body;

         let finalCaptainId = captainId;
             if (userType === 'captain' && !finalCaptainId) {
               const namePrefix = name
                 .replace(/[^a-zA-Z]/g, '')
                 .substring(0, 3)
                 .toUpperCase();

               const randomDigits = Math.floor(100 + Math.random() * 9000);
               finalCaptainId = `${namePrefix}${randomDigits}`.substring(0, 7);
             }
        const userData = {
          userType,
          phoneNumber,
          name,
          shortName,
          passkey,
          verified: true,
          ...(userType === 'captain' && { captainId:finalCaptainId }) // Only add for captains
        };

        if (req.file) {
              userData.verificationId = {
                data: req.file.buffer,
                contentType: req.file.mimetype
              };
            }
        const user = new User(userData);
        await user.save();

        // Return response without sensitive data
            const userResponse = user.toObject();
            delete userResponse.passkey;

            res.status(201).json({
              success: true,
              user: userResponse,
              captainId: userResponse.captainId // Include this explicitly
            });

      } catch (error) {
        console.error('Registration error:', error);
            res.status(400).json({
              success: false,
              error: error.message
            });
      }
    };
    exports.registerBasicUser = async (req, res) => {
      try {
        const { phoneNumber, name, shortName, passkey } = req.body;

        // Basic validation
        if (!phoneNumber || !name || !passkey) {
          return res.status(400).json({
            success: false,
            error: 'Phone number, name and passkey are required'
          });
        }

        const userData = {
          userType: 'user',
          phoneNumber,
          name,
          shortName,
          passkey,
          verified: true
        };

        const user = new User(userData);
        await user.save();

        // Return response without sensitive data
        const userResponse = user.toObject();
        delete userResponse.passkey;

        res.status(201).json({
          success: true,
          user: userResponse
        });

      } catch (error) {
        console.error('User registration error:', error);
        res.status(400).json({
          success: false,
          error: error.message
        });
      }
    };

    exports.updateFcmToken = async (req, res) => {
      try {
        const { userId, fcmToken } = req.body;

        await User.findByIdAndUpdate(userId, { fcmToken });

        res.json({
          success: true,
          message: 'FCM token updated'
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    };

// Add to authController.js
// In authController.js
exports.getCaptainDetails = async (req, res) => {
  try {
    const captain = await User.findOne({
      captainId: req.params.captainId,
      userType: 'captain'
    }).select('-passkey -verificationId -__v');

    if (!captain) {
      return res.status(404).json({
        success: false,
        error: 'Captain not found'
      });
    }

    res.json({
      success: true,
      captain: {
      _id: captain._id,
        name: captain.name,
        captainId: captain.captainId,
        phoneNumber: captain.phoneNumber,
        // Add other fields as needed
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
        exports.generateCaptainId = async (req, res) => {
          try {
            const { userType, phoneNumber, name, shortName } = req.body;

            if (userType !== 'captain') {
              return res.status(400).json({
                success: false,
                error: 'Captain ID can only be generated for captains'
              });
            }

             const namePrefix = name
                  .replace(/[^a-zA-Z]/g, '') // Remove non-alphabetic characters
                  .substring(0, 3)
                  .toUpperCase();
            // Generate unique Captain ID
            let captainId;
            let isUnique = false;
             let attempts = 0;
                const maxAttempts = 10;

            while (!isUnique && attempts < maxAttempts) {
            attempts++;

               // Generate 3-4 random digits (adjust as needed for total length)
               const randomDigits = Math.floor(100 + Math.random() * 9000); // 3-4 digits

               // Combine to form ID (e.g., "SEL1234")
               captainId = `${namePrefix}${randomDigits}`;

               // Ensure total length is 6-7 characters
               if (captainId.length > 7) {
                 captainId = captainId.substring(0, 7);
               }

               // Check uniqueness
               const exists = await User.findOne({ captainId });
               isUnique = !exists;
             }

             if (!isUnique) {
               throw new Error(`Failed to generate unique Captain ID after ${maxAttempts} attempts`);
             }


            // Return just the ID (don't save to DB yet)
            res.status(200).json({
              success: true,
              captainId: captainId
            });

          } catch (error) {
            console.error('Error generating Captain ID:', error);
            res.status(500).json({
              success: false,
              error: error.message
            });
          }
        };

        //exports.loginUser = async (req, res) => {
        //  try {
        //    const { captainId, passkey } = req.body;
        //
        //    const user = await User.findOne({ captainId });
        //    if (!user) {
        //      return res.status(404).json({ success: false, error: 'User not found' });
        //    }
        //
        //    if (user.passkey !== passkey) {
        //      return res.status(401).json({ success: false, error: 'Invalid passkey' });
        //    }
        //
        //    res.json({ success: true, user });
        //  } catch (error) {
        //    res.status(500).json({ success: false, error: error.message });
        //  }
        //};

        exports.loginCaptain = async (req, res) => {
          try {
            const { captainId, passkey } = req.body;

            const user = await User.findOne({ captainId });

            if (!user) {
              return res.status(404).json({
                success: false,
                error: 'Captain not found'
              });
            }

            if (user.passkey !== passkey) {
              return res.status(401).json({
                success: false,
                error: 'Invalid passkey'
              });
            }

            // Return user data without sensitive information
            const userResponse = user.toObject();
            delete userResponse.passkey;

            res.json({
              success: true,
              user: userResponse
            });

          } catch (error) {
            res.status(500).json({
              success: false,
              error: error.message
            });
          }
        };
        exports.loginUser = async (req, res) => {
          try {
            const { phoneNumber, passkey } = req.body;
            const user = await User.findOne({ phoneNumber });

            if (!user) {
              return res.status(404).json({
                success: false,
                error: 'User not found'
              });
            }

            if (user.passkey !== passkey) {
              return res.status(401).json({
                success: false,
                error: 'Invalid passkey'
              });
            }

          console.log('User logged in with ID:', user._id.toString());


            // Return user data with MongoDB _id
            const userResponse = user.toObject();
            delete userResponse.passkey;

            res.json({
              success: true,
              user: userResponse,
              userId: user._id.toString() // Explicitly include the MongoDB _id
            });

          } catch (error) {
            res.status(500).json({
              success: false,
              error: error.message
            });
          }
        };