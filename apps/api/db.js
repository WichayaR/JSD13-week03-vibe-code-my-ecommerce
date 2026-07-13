import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

// Force Node to prefer IPv4 DNS resolution to avoid querySrv ECONNREFUSED on Windows
dns.setDefaultResultOrder('ipv4first');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from apps/api/.env
dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bookstore';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error('Please check your MONGODB_URI in apps/api/.env and make sure your IP is whitelisted in MongoDB Atlas.');
    // Don't exit here, so the server can still run and display a warning page
  }
};

// User Schema
const UserSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  tel: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, default: 'password123' },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' }
}, { timestamps: true });

// Book Schema
const BookSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  format: { type: String, enum: ['Paperback', 'Zine', 'E-Book'], default: 'Paperback' },
  synopsis: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, min: 0 },
  serieName: { type: String },
  volume: { type: String },
  coverUrl: { type: String } // Optional cover image path or URL
}, { timestamps: true });

// Order Schema
const OrderSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderDate: { type: Date, default: Date.now },
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'paid', 'shipping', 'completed', 'shipped', 'cancelled'], 
    default: 'pending' 
  },
  statusHistory: [
    {
      status: { type: String, required: true },
      changedAt: { type: Date, default: Date.now }
    }
  ],
  paymentMethod: { type: String, default: 'PromptPay' },
  shippingAddress: { type: String }
}, { timestamps: true });

// Order Item Schema
const OrderItemSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  quantity: { type: Number, required: true, min: 1 },
  pricePerUnit: { type: Number, required: true }
}, { collection: 'order_items' });

// Address Schema
const AddressSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  houseNo: { type: String, required: true },
  street: { type: String, required: true },
  subDistrict: { type: String, required: true },
  district: { type: String, required: true },
  province: { type: String, required: true },
  zipCode: { type: String, required: true }
}, { collection: 'address', timestamps: true });

// Preferences Schema
const PreferencesSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  categoryName: [{ type: String }]
}, { collection: 'preferences', timestamps: true });

export const User = mongoose.model('User', UserSchema);
export const Book = mongoose.model('Book', BookSchema);
export const Order = mongoose.model('Order', OrderSchema);
export const OrderItem = mongoose.model('OrderItem', OrderItemSchema);
export const Address = mongoose.model('Address', AddressSchema);
export const Preferences = mongoose.model('Preferences', PreferencesSchema);
