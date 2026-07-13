import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { connectDB, Book, User, Order, OrderItem, Address, Preferences } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Serve static frontend files from apps/web
app.use(express.static(path.join(__dirname, '../web')));

// ==========================================
// AUTHENTICATION API ENDPOINTS
// ==========================================

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'กรุณากรอกอีเมลและรหัสผ่าน' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'ไม่พบบัญชีผู้ใช้นี้ในระบบ' });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
    }

    // Convert to object and exclude password
    const userObj = user.toObject();
    delete userObj.password;

    res.json(userObj);
  } catch (error) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ: ' + error.message });
  }
});

// ==========================================
// BOOKS API ENDPOINTS
// ==========================================

// Get all books with optional search query
app.get('/api/books', async (req, res) => {
  try {
    const { search, format } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { serieName: { $regex: search, $options: 'i' } }
      ];
    }

    if (format) {
      query.format = format;
    }

    const books = await Book.find(query);
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch books: ' + error.message });
  }
});

// Get a single book by ID
app.get('/api/books/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch book: ' + error.message });
  }
});

// Add a new book (Admin CRUD)
app.post('/api/books', async (req, res) => {
  try {
    const { _id, title, author, format, synopsis, price, stock, serieName, volume, coverUrl } = req.body;
    
    // Check if book with ID already exists
    const existingBook = await Book.findById(_id);
    if (existingBook) {
      return res.status(400).json({ error: `Book with ID ${_id} already exists.` });
    }

    const newBook = new Book({
      _id,
      title,
      author,
      format,
      synopsis,
      price,
      stock,
      serieName,
      volume,
      coverUrl: coverUrl || '/img/covers/cover_mind.png'
    });

    await newBook.save();
    res.status(201).json(newBook);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create book: ' + error.message });
  }
});

// Update a book (Admin CRUD)
app.put('/api/books/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update book: ' + error.message });
  }
});

// Delete a book (Admin CRUD)
app.delete('/api/books/:id', async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete book: ' + error.message });
  }
});

// ==========================================
// USERS API ENDPOINTS
// ==========================================

// Get all users (useful for client/admin simulation selection)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users: ' + error.message });
  }
});

// Create a new user
app.post('/api/users', async (req, res) => {
  try {
    const { firstName, lastName, tel, email, role } = req.body;
    
    const newUser = new User({
      _id: new mongoose.Types.ObjectId(),
      firstName,
      lastName,
      tel,
      email,
      role: role || 'customer'
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create user: ' + error.message });
  }
});

// ==========================================
// ADDRESSES & PREFERENCES API ENDPOINTS
// ==========================================

// Get all addresses for a specific user (1:N relation lookup)
app.get('/api/users/:userId/addresses', async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.params.userId });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch addresses: ' + error.message });
  }
});

// Get category preferences for a specific user
app.get('/api/users/:userId/preferences', async (req, res) => {
  try {
    const prefs = await Preferences.findOne({ userId: req.params.userId });
    res.json(prefs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch preferences: ' + error.message });
  }
});

// Personalized recommendation engine: finds books that match user preferred categoryNames
app.get('/api/books/recommendations/:userId', async (req, res) => {
  try {
    const userPref = await Preferences.findOne({ userId: req.params.userId });
    if (!userPref || !userPref.categoryName || userPref.categoryName.length === 0) {
      const defaultBooks = await Book.find({ stock: { $gt: 0 } }).limit(3);
      return res.json(defaultBooks);
    }

    const keywords = userPref.categoryName;
    const queryConditions = keywords.map(kw => ({
      $or: [
        { title: { $regex: kw, $options: 'i' } },
        { serieName: { $regex: kw, $options: 'i' } },
        { synopsis: { $regex: kw, $options: 'i' } }
      ]
    }));

    let recommended = await Book.find({
      $and: [
        { stock: { $gt: 0 } },
        { $or: queryConditions }
      ]
    }).limit(4);

    if (recommended.length < 3) {
      const idsToExclude = recommended.map(b => b._id);
      const backfill = await Book.find({
        _id: { $nin: idsToExclude },
        stock: { $gt: 0 }
      }).limit(3 - recommended.length);
      recommended = [...recommended, ...backfill];
    }

    res.json(recommended);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recommendations: ' + error.message });
  }
});

// ==========================================
// ORDERS & CHECKOUT API ENDPOINTS
// ==========================================

// Get all orders (with details loaded via aggregate to match week-02 custom lookup pattern)
app.get('/api/orders', async (req, res) => {
  try {
    // Perform lookup to join Order, OrderItem, Books, and Users
    const orders = await Order.aggregate([
      // Lookup user details
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true }
      },
      // Lookup order items
      {
        $lookup: {
          from: 'order_items', // Updated to match week-02
          localField: '_id',
          foreignField: 'orderId',
          as: 'items'
        }
      },
      // Unwind items to join with books
      {
        $unwind: { path: '$items', preserveNullAndEmptyArrays: true }
      },
      // Lookup book details for each item
      {
        $lookup: {
          from: 'books',
          localField: 'items.bookId',
          foreignField: '_id',
          as: 'items.bookDetails'
        }
      },
      {
        $unwind: { path: '$items.bookDetails', preserveNullAndEmptyArrays: true }
      },
      // Re-group items into their respective orders
      {
        $group: {
          _id: '$_id',
          userId: { $first: '$userId' },
          userDetails: { $first: '$userDetails' },
          orderDate: { $first: '$orderDate' },
          totalAmount: { $first: '$totalAmount' },
          status: { $first: '$status' },
          statusHistory: { $first: '$statusHistory' },
          paymentMethod: { $first: '$paymentMethod' },
          shippingAddress: { $first: '$shippingAddress' },
          createdAt: { $first: '$createdAt' },
          items: {
            $push: {
              $cond: {
                if: { $gt: ['$items._id', null] },
                then: '$items',
                else: '$$REMOVE'
              }
            }
          }
        }
      },
      // Sort orders by newest first
      {
        $sort: { createdAt: -1 }
      }
    ]);

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders: ' + error.message });
  }
});

// Checkout / Place a new order
app.post('/api/orders', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId, paymentMethod, cartItems, shippingAddress } = req.body;

    if (!userId || !cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: 'Invalid order data. User ID and cart items are required.' });
    }

    // Verify user exists
    const user = await User.findById(userId).session(session);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Auto-generate order ID
    const orderId = new mongoose.Types.ObjectId();

    let totalAmount = 0;
    const orderItemDocs = [];
    const booksToUpdate = [];

    // Validate stock and calculate prices
    for (const item of cartItems) {
      const book = await Book.findById(item.bookId).session(session);
      if (!book) {
        throw new Error(`Book with ID ${item.bookId} not found.`);
      }

      if (book.stock < item.quantity) {
        throw new Error(`Insufficient stock for book "${book.title}". Available: ${book.stock}, Requested: ${item.quantity}`);
      }

      const itemCost = book.price * item.quantity;
      totalAmount += itemCost;

      // Add to order items
      const orderItemId = new mongoose.Types.ObjectId();
      orderItemDocs.push({
        _id: orderItemId,
        orderId: orderId,
        bookId: book._id,
        quantity: item.quantity,
        pricePerUnit: book.price
      });

      // Track stock decrement
      booksToUpdate.push({
        bookId: book._id,
        newStock: book.stock - item.quantity
      });
    }

    // Create Order Document
    const newOrder = new Order({
      _id: orderId,
      userId,
      totalAmount,
      status: 'pending',
      statusHistory: [
        {
          status: 'pending',
          changedAt: new Date()
        }
      ],
      paymentMethod: paymentMethod || 'PromptPay',
      shippingAddress: shippingAddress || 'ไม่ได้ระบุที่อยู่'
    });

    // Save Order
    await newOrder.save({ session });

    // Save Order Items
    await OrderItem.insertMany(orderItemDocs, { session });

    // Update Books Stock
    for (const update of booksToUpdate) {
      await Book.findByIdAndUpdate(update.bookId, { stock: update.newStock }, { session });
    }

    await session.commitTransaction();
    session.endSession();

    // Fetch the detailed order to return
    res.status(201).json({
      message: 'Order created successfully',
      orderId: newOrder._id,
      totalAmount: newOrder.totalAmount,
      status: newOrder.status
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ error: error.message });
  }
});

// Update order status (Admin operation)
app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'paid', 'shipped', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update status and push to status history
    order.status = status;
    order.statusHistory.push({
      status: status,
      changedAt: new Date()
    });

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update order status: ' + error.message });
  }
});

// Fallback HTML page for any undefined routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../web/index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
