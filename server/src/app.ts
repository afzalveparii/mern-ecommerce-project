import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import cookieParser from 'cookie-parser';
import path from 'path';
import { productController } from './Controllers/Product';
import dbConnection from './db/conn';
import { router as productsRouter } from './Routes/Products';
import { router as categoriesRouter } from './Routes/Categories';
import { router as brandsRouter } from './Routes/Brands';
import { router as usersRouter } from './Routes/Users';
import { router as authRouter } from './Routes/Auth';
import { router as cartRouter } from './Routes/Cart';
import { router as ordersRouter } from './Routes/Order';
import { User, IUser } from './models/User';
import { commonService } from './services/common';
import { Order } from './models/Order';
import Stripe from 'stripe';
import { createProxyMiddleware } from 'http-proxy-middleware';

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_API_KEY!, { apiVersion: '2022-11-15' });

// Webhook
const endpointSecret = process.env.ENDPOINT_SECRET!;

app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (request: Request, response: Response) => {
    const sig = request.headers['stripe-signature'] as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err: any) {
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntentSucceeded = event.data.object as Stripe.PaymentIntent;

        const order = await Order.findById(
          paymentIntentSucceeded.metadata.orderId
        );
        if (order) {
          order.paymentStatus = 'received';
          await order.save();
        }

        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
  }
);

// Increase the limit to 10MB (adjust as needed)
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// JWT options
const opts = {
  jwtFromRequest: commonService.cookieExtractor,
  secretOrKey: process.env.JWT_SECRET_KEY!
};

// Middlewares
app.use(express.static(path.resolve(__dirname, 'build')));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_KEY!,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.authenticate('session'));

app.use(
  cors({
    exposedHeaders: ['X-Total-Count'],
    origin: ['http://localhost:3000', 'http://localhost:5173', 'https://stapi.co'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  })
);
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads' , 'userProfilePics')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads' , 'productImages'))); 

app.use('/products', commonService.isAuth, productsRouter);
app.use('/categories', commonService.isAuth, categoriesRouter);
app.use('/brands', commonService.isAuth, brandsRouter);
app.use('/users', commonService.isAuth, usersRouter);
app.use('/auth', authRouter);
app.use('/cart', commonService.isAuth, cartRouter);
app.use('/orders', commonService.isAuth, ordersRouter);

app.get('*', (req: Request, res: Response) =>
  res.sendFile(path.join(__dirname, 'build', 'index.html'))
);
// Proxy middleware for frontend development

const isDevelopment = process.env.NODE_ENV === 'development';
if (isDevelopment) {
  app.use('/', createProxyMiddleware({ 
    target: 'http://localhost:3000', // Assuming your frontend runs on port 3000
    changeOrigin: true,
    ws: true, // Enable WebSocket proxying
    pathRewrite: (path) => {
      // Don't proxy API routes
      if (path.startsWith('/products') || 
          path.startsWith('/categories') || 
          path.startsWith('/brands') || 
          path.startsWith('/users') || 
          path.startsWith('/auth') || 
          path.startsWith('/cart') || 
          path.startsWith('/orders')) {
        return path;
      }
      // Proxy all other routes to the frontend
      return path;
    },
  }));
}

// Passport Strategies
passport.use(
  'local',
  new LocalStrategy({ usernameField: 'email' }, async function (
    email: string,
    password: string,
    done: (error: any, user?: any, options?: { message: string }) => void
  ) {
    try {
      const user = await User.findOne({ email: email });
      if (!user) {
        return done(null, false, { message: 'invalid credentials' });
      }
      crypto.pbkdf2(
        password,
        user.salt,
        310000,
        32,
        'sha256',
        async function (err, hashedPassword) {
          if (!crypto.timingSafeEqual(user.password, hashedPassword)) {
            return done(null, false, { message: 'invalid credentials' });
          }
          const token = jwt.sign(
            commonService.sanitizeUser(user),
            process.env.JWT_SECRET_KEY!
          );
          done(null, { id: user.id, role: user.role, token });
        }
      );
    } catch (err) {
      done(err);
    }
  })
);

passport.use(
  'jwt',
  new JwtStrategy(opts, async function (jwt_payload: any, done: (error: any, user?: any) => void) {
    try {
      const user = await User.findById(jwt_payload.id);
      if (user) {
        return done(null, commonService.sanitizeUser(user));
      } else {
        return done(null, false);
      }
    } catch (err) {
      return done(err, false);
    }
  })
);

passport.serializeUser(function (user: Express.User, cb: (err: any, id?: any) => void) {
  process.nextTick(function () {
    return cb(null, { id: (user as IUser).id, role: (user as IUser).role });
  });
});

passport.deserializeUser(function (user: Express.User, cb: (err: any, user?: Express.User) => void) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

// Payments
app.post('/create-payment-intent', async (req: Request, res: Response) => {
  const { totalAmount, orderId } = req.body;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalAmount * 100,
    currency: 'inr',
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: {
      orderId,
    },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

dbConnection.once('open', () => {
  console.log("🚀 DaaBase Connected");
});

dbConnection.on('error', (err) => {
  console.log("❌ DataBase Connection Error:", err);
  process.exit(1);
});


app.listen(process.env.PORT, () => {
  console.log(`server is listening on Port ${process.env.PORT}`);
});