        require('dotenv').config();
        const express = require('express');
        const cors = require('cors');
        const multer = require('multer');
        const { WebSocketServer } = require('ws');
        const connectDB = require('./db');
        const http = require('http');
        const orderRoutes = require('./routes/orderRoutes');
        const app = express();
        const upload = multer();
        const server = http.createServer(app);
        const admin = require('firebase-admin');


        const serviceAccount = require('./config/firebase-service-account.json');

        // Middleware
        app.use(cors({
          origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
          allowedHeaders: ['Content-Type', 'Authorization'],
          credentials: true
        }));

        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        app.use('/api/orders', orderRoutes);
        // Add this with your other route imports
        app.use('/api/pricing', require('./routes/pricingRoutes'));

        // Create WebSocket server
        const wss = new WebSocketServer({ server, path: '/ws' });

        wss.on('connection', (ws, req) => {
          console.log('New WebSocket client connected');

          // Verify origin if needed
          const origin = req.headers.origin;
          if (!['http://localhost:5500', 'http://127.0.0.1:5500'].includes(origin)) {
            console.log('Rejected connection from unauthorized origin:', origin);
            return ws.close();
          }

          // Send initial message to client
          ws.send(JSON.stringify({
            type: 'connection',
            message: 'Successfully connected to WebSocket server',
            timestamp: new Date().toISOString()
          }));

          // Handle messages from client
          ws.on('message', (message) => {
            try {
              const data = JSON.parse(message.toString());
              console.log('Received WebSocket message:', data);

              // Broadcast to all clients (example)
              wss.clients.forEach((client) => {
                if (client !== ws && client.readyState === 1) { // 1 = OPEN
                  client.send(JSON.stringify({
                    type: 'broadcast',
                    from: 'server',
                    message: 'This is a broadcast message',
                    original: data,
                    timestamp: new Date().toISOString()
                  }));
                }
              });
            } catch (error) {
              console.error('Error processing WebSocket message:', error);
            }
          });

          ws.on('close', () => {
            console.log('Client disconnected');
          });

          ws.on('error', (error) => {
            console.error('WebSocket error:', error);
          });
        });

        // Database connection and server start
        async function startServer() {
          try {
            const dbConnection = await connectDB();
            console.log('Database connection established:', dbConnection.name);

            // Routes
            app.use('/api/auth', require('./routes/authRoutes'));
            app.use('/api/vehicles', require('./routes/vehicleRoutes'));
            app.use('/api/orders', require('./routes/orderRoutes'));
            const PORT = process.env.PORT || 3000;
            server.listen(PORT, () => {
              console.log(`Server running on http://localhost:${PORT}`);
              console.log(`WebSocket server running on ws://localhost:${PORT}`);
            });

            // Make wss available to routes if needed
            app.locals.wss = wss;

          } catch (err) {
            console.error('Failed to start server:', err);
            process.exit(1);
          }
        }

        startServer();
        //require('dotenv').config();
        //const express = require('express');
        //const cors = require('cors');
        //const multer = require('multer');
        //const connectDB = require('./db');
        //
        //const app = express();
        //const upload = multer();
        //
        //// Middleware - Only one CORS setup needed
        //app.use(cors({
        //               origin: ['http://localhost:5500', 'http://127.0.0.1:5500'], // Add both common localhost variants
        //               methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        //               allowedHeaders: ['Content-Type', 'Authorization'],
        //               credentials: true
        //             }));
        //
        //app.use(express.json());
        //app.use(express.urlencoded({ extended: true }));
        //
        //// Database connection and server start
        //async function startServer() {
        //  try {
        //    const dbConnection = await connectDB();
        //    console.log('Database connection established:', dbConnection.name);
        //
        //    // Routes
        //    app.use('/api/auth', require('./routes/authRoutes'));
        //    // Add this after your auth routes
        //    app.use('/api/vehicles', require('./routes/vehicleRoutes'));
        //
        //    const PORT = process.env.PORT || 3000;
        //    app.listen(PORT, () => {
        //      console.log(`Server running on http://localhost:${PORT}`);
        //    });
        //  } catch (err) {
        //    console.error('Failed to start server:', err);
        //    process.exit(1); // Exit with failure code
        //  }
        //}
        //
        //// Start the server
        //startServer();
