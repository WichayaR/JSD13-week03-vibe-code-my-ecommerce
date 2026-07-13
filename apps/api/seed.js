import mongoose from 'mongoose';
import { connectDB, User, Book, Order, OrderItem, Address, Preferences } from './db.js';

const seedData = async () => {
  console.log('Connecting to database for seeding...');
  await connectDB();

  try {
    console.log('Clearing existing collections...');
    await User.deleteMany({});
    await Book.deleteMany({});
    await Order.deleteMany({});
    await OrderItem.deleteMany({});
    await Address.deleteMany({});
    await Preferences.deleteMany({});

    // 1. Seed Users (10 users from week-02)
    const users = [
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000001"),
        firstName: "สมชาย",
        lastName: "รักการอ่าน",
        tel: "0811234567",
        email: "somchai@fakemail.com",
        password: "password123",
        role: "customer"
      },
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000002"),
        firstName: "วันดี",
        lastName: "เรียนรู้ดี",
        tel: "0822234567",
        email: "wandee@fakemail.com",
        password: "password123",
        role: "customer"
      },
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000003"),
        firstName: "สมบัติ",
        lastName: "สร้างสรรค์",
        tel: "0833345678",
        email: "sombat@fakemail.com",
        password: "password123",
        role: "customer"
      },
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000004"),
        firstName: "นารี",
        lastName: "ใจดี",
        tel: "0844455667",
        email: "naree@fakemail.com",
        password: "password123",
        role: "customer"
      },
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000005"),
        firstName: "ปรีชา",
        lastName: "รักเรียน",
        tel: "0855566778",
        email: "preecha@fakemail.com",
        password: "password123",
        role: "customer"
      },
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000006"),
        firstName: "วิภาวรรณ",
        lastName: "รวยรื่น",
        tel: "0866677889",
        email: "wipawan@fakemail.com",
        password: "password123",
        role: "customer"
      },
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000007"),
        firstName: "อภิสิทธิ์",
        lastName: "ก้าวไกล",
        tel: "0877788990",
        email: "aphisit@fakemail.com",
        password: "password123",
        role: "customer"
      },
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000008"),
        firstName: "สุรศักดิ์",
        lastName: "สู้ชีวิต",
        tel: "0888899001",
        email: "surasak@fakemail.com",
        password: "password123",
        role: "customer"
      },
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000009"),
        firstName: "ณัฐพล",
        lastName: "สายเทค",
        tel: "0899900112",
        email: "nattaphol@fakemail.com",
        password: "password123",
        role: "customer"
      },
      {
        _id: new mongoose.Types.ObjectId("65f40000000000000000000a"),
        firstName: "สมหญิง",
        lastName: "ชอบสะสม",
        tel: "0999999999",
        email: "somying@fakemail.com",
        password: "password123",
        role: "admin"
      }
    ];

    console.log('Inserting Users...');
    await User.insertMany(users);

    // 2. Seed Addresses (10 addresses from week-02)
    const addresses = [
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000101"),
        userId: new mongoose.Types.ObjectId("65f400000000000000000001"),
        houseNo: "99/99",
        street: "ถนนรัชดาภิเษก",
        subDistrict: "แขวงห้วยขวาง",
        district: "เขตห้วยขวาง",
        province: "จังหวัดกรุงเทพมหานคร",
        zipCode: "10310"
      },
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000102"),
        userId: new mongoose.Types.ObjectId("65f400000000000000000002"),
        houseNo: "123/45",
        street: "ถนนสุขุมวิท",
        subDistrict: "แขวงคลองเตย",
        district: "เขตคลองเตย",
        province: "จังหวัดกรุงเทพมหานคร",
        zipCode: "10110"
      },
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000103"),
        userId: new mongoose.Types.ObjectId("65f400000000000000000003"),
        houseNo: "88/1",
        street: "ถนนนิมมานเหมินท์",
        subDistrict: "ตำบลสุเทพ",
        district: "อำเภอเมืองเชียงใหม่",
        province: "จังหวัดเชียงใหม่",
        zipCode: "50200"
      },
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000104"),
        userId: new mongoose.Types.ObjectId("65f400000000000000000004"),
        houseNo: "55/12",
        street: "ถนนลาดพร้าว",
        subDistrict: "แขวงจอมพล",
        district: "เขตจตุจักร",
        province: "จังหวัดกรุงเทพมหานคร",
        zipCode: "10900"
      },
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000105"),
        userId: new mongoose.Types.ObjectId("65f400000000000000000005"),
        houseNo: "777/8",
        street: "ถนนพหลโยธิน",
        subDistrict: "ตำบลคลองหนึ่ง",
        district: "อำเภอคลองหลวง",
        province: "จังหวัดปทุมธานี",
        zipCode: "12120"
      },
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000106"),
        userId: new mongoose.Types.ObjectId("65f400000000000000000006"),
        houseNo: "10/3",
        street: "ถนนรามคำแหง",
        subDistrict: "แขวงหัวหมาก",
        district: "เขตบางกะปิ",
        province: "จังหวัดกรุงเทพมหานคร",
        zipCode: "10240"
      },
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000107"),
        userId: new mongoose.Types.ObjectId("65f400000000000000000007"),
        houseNo: "200/15",
        street: "ถนนพะเนียง",
        subDistrict: "ตำบลตลาดใหญ่",
        district: "อำเภอเมืองภูเก็ต",
        province: "จังหวัดภูเก็ต",
        zipCode: "83000"
      },
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000108"),
        userId: new mongoose.Types.ObjectId("65f400000000000000000008"),
        houseNo: "15/9",
        street: "ถนนมิตรภาพ",
        subDistrict: "ตำบลในเมือง",
        district: "อำเภอเมืองนครราชสีมา",
        province: "จังหวัดนครราชสีมา",
        zipCode: "30000"
      },
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000109"),
        userId: new mongoose.Types.ObjectId("65f400000000000000000009"),
        houseNo: "44",
        street: "ถนนเจริญกรุง",
        subDistrict: "แขวงบางคอแหลม",
        district: "เขตบางคอแหลม",
        province: "จังหวัดกรุงเทพมหานคร",
        zipCode: "10120"
      },
      {
        _id: new mongoose.Types.ObjectId("65f40000000000000000010a"),
        userId: new mongoose.Types.ObjectId("65f400000000000000000001"),
        houseNo: "50/2",
        street: "ถนนเพชรบุรี",
        subDistrict: "แขวงพญาไท",
        district: "เขตราชเทวี",
        province: "จังหวัดกรุงเทพมหานคร",
        zipCode: "10400"
      }
    ];

    console.log('Inserting Addresses...');
    await Address.insertMany(addresses);

    // 3. Seed Preferences (10 records from week-02)
    const preferences = [
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000201"),
        userId: new mongoose.Types.ObjectId("65f400000000000000000001"),
        categoryName: ["พัฒนาตัวเอง", "วรรณกรรมแปล", "ฮีลใจ"]
      },
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000202"),
        userId: new mongoose.Types.ObjectId("65f400000000000000000002"),
        categoryName: ["ธุรกิจและการลงทุน", "เทคโนโลยีและวิทยาศาสตร์"]
      },
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000203"),
        userId: new mongoose.Types.ObjectId("65f400000000000000000003"),
        categoryName: ["ศิลปะและการออกแบบ", "วรรณกรรมไทย", "ฮีลใจ"]
      },
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000204"),
        userId: new mongoose.Types.ObjectId("65f400000000000000000004"),
        categoryName: ["นวนิยายสืบสวน", "วรรณกรรมแปล"]
      },
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000205"),
        userId: new mongoose.Types.ObjectId("65f400000000000000000005"),
        categoryName: ["ประวัติศาสตร์", "ปรัชญา", "พัฒนาตัวเอง"]
      },
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000206"),
        userId: new mongoose.Types.ObjectId("65f400000000000000000006"),
        categoryName: ["สุขภาพและอาหาร", "การท่องเที่ยว"]
      },
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000207"),
        userId: new mongoose.Types.ObjectId("65f400000000000000000007"),
        categoryName: ["การเงินส่วนบุคคล", "การตลาดและการขาย"]
      },
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000208"),
        userId: new mongoose.Types.ObjectId("65f400000000000000000008"),
        categoryName: ["วรรณกรรมเยาวชน", "แฟนตาซี"]
      },
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000209"),
        userId: new mongoose.Types.ObjectId("65f400000000000000000009"),
        categoryName: ["คอมพิวเตอร์และโปรแกรมมิ่ง", "วิทยาศาสตร์"]
      },
      {
        _id: new mongoose.Types.ObjectId("65f40000000000000000020a"),
        userId: new mongoose.Types.ObjectId("65f40000000000000000000a"),
        categoryName: ["ประวัติศาสตร์การพิมพ์", "หนังสือหายาก"]
      }
    ];

    console.log('Inserting Preferences...');
    await Preferences.insertMany(preferences);

    // 4. Seed Books (10 books from week-02 with matching high-quality generated covers)
    const books = [
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000301"),
        title: "คิดแบบย้อนกลับ (Thinking Backward)",
        author: "นาโอกิ ยามาดะ",
        format: "Paperback",
        synopsis: "เรื่องราวที่จะเปลี่ยนวิธีคิดและพาคุณหลุดพ้นจากกรอบความคิดเดิมๆ เพื่อพบกับความสำเร็จในแบบที่คุณไม่เคยคาดคิดมาก่อน...",
        price: 250,
        stock: 50,
        serieName: "ชุดพัฒนาตนเองแบบก้าวกระโดด",
        volume: "เล่ม 1",
        coverUrl: "/img/covers/cover_thinking_backward.jpg"
      },
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000302"),
        title: "ความฝันในร้านหนังสือฤดูร้อน",
        author: "มิซึกิ ทากาฮาชิ",
        format: "Zine",
        synopsis: "บันทึกความทรงจำและเรื่องสั้นแสนอบอุ่นในร้านหนังสือเล็กๆ ณ เมืองชายทะเลแห่งหนึ่ง ในช่วงฤดูร้อนปีสุดท้ายของชีวิตวัยรุ่น",
        price: 120,
        stock: 20,
        serieName: "เรื่องเล่าริมหาด",
        volume: "ตอนพิเศษ",
        coverUrl: "/img/covers/cover_summer_bookstore.jpg"
      },
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000303"),
        title: "ออกแบบชีวิตด้วยดีไซน์ทิงกิ้ง (Design Your Life)",
        author: "บิล เบอร์เน็ต",
        format: "Paperback",
        synopsis: "คู่มือการนำกระบวนการคิดเชิงออกแบบ (Design Thinking) มาปรับใช้กับการสร้างชีวิตที่มีความสุขและมีคุณค่า",
        price: 290,
        stock: 35,
        serieName: "คู่มือการใช้ชีวิต",
        volume: "เล่มเดียวจบ",
        coverUrl: "/img/covers/cover_design_your_life.jpg"
      },
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000304"),
        title: "ศิลปะของการปล่อยวาง (The Art of Letting Go)",
        author: "แคทเธอรีน มอร์แกน",
        format: "Paperback",
        synopsis: "แนวคิดและแบบฝึกหัดที่จะช่วยให้คุณปล่อยวางความเครียด ความกังวล และสิ่งที่ไม่จำเป็น เพื่อค้นพบความสงบในใจ",
        price: 220,
        stock: 40,
        serieName: "ชุดจิตวิทยาพัฒนาตนเอง",
        volume: "เล่มเดียวจบ",
        coverUrl: "/img/covers/cover_art_of_letting_go.jpg"
      },
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000305"),
        title: "ร้านกาแฟสำหรับคนหลงทาง (The Why Cafe)",
        author: "จอห์น สเตรเลกกี",
        format: "Paperback",
        synopsis: "เรื่องราวของชายผู้หลงทางไปพบร้านกาแฟเล็กๆ ที่ตั้งอยู่กลางป่า และได้รับคำถามที่จะเปลี่ยนทิศทางชีวิตของเขาไปตลอดกาล",
        price: 195,
        stock: 60,
        serieName: "เรื่องเล่าเปลี่ยนชีวิต",
        volume: "เล่มเดียวจบ",
        coverUrl: "/img/covers/cover_why_cafe.jpg"
      },
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000306"),
        title: "สัปดาห์นี้ขอเงียบๆ สักหน่อย (Quiet: The Power of Introverts)",
        author: "ซูซาน เคน",
        format: "Paperback",
        synopsis: "การนำเสนอพลังที่ซ่อนอยู่ของคนเก็บตัว (Introverts) ในโลกที่หยุดพูดไม่ได้ และความสำคัญของพวกเขาในสังคม",
        price: 265,
        stock: 45,
        serieName: "ชุดพลังบวกพัฒนาตนเอง",
        volume: "เล่มเดียวจบ",
        coverUrl: "/img/covers/cover_quiet_introverts.jpg"
      },
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000307"),
        title: "กาแฟดี อารมณ์ดี (Happy Coffee, Happy Life)",
        author: "พงศกร สุวรรณ",
        format: "Zine",
        synopsis: "บันทึกและคู่มือแนะนำการดริปกาแฟในบ้าน พร้อมสูตรและวิธีการเลือกเมล็ดกาแฟที่เปลี่ยนวันน่าเบื่อให้กลายเป็นวันแสนสุข",
        price: 150,
        stock: 15,
        serieName: "บันทึกเรื่องกาแฟ",
        volume: "เล่ม 1",
        coverUrl: "/img/covers/cover_happy_coffee.jpg"
      },
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000308"),
        title: "คู่มือนักเขียนอิสระ (Self-Publishing Guide)",
        author: "เกียรติศักดิ์ พาสุข",
        format: "Paperback",
        synopsis: "แนะนำขั้นตอนการเขียน จัดทำรูปเล่ม และการจัดจำหน่ายหนังสือด้วยตัวเองสำหรับนักเขียนอิสระรุ่นใหม่",
        price: 180,
        stock: 25,
        serieName: "คู่มือนักสร้างสรรค์",
        volume: "เล่มเดียวจบ",
        coverUrl: "/img/covers/cover_self_publishing.jpg"
      },
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000309"),
        title: "กวีริมระเบียง (Balcony Poetry)",
        author: "ธนพล พริ้งแก้ว",
        format: "Zine",
        synopsis: "รวมบทกวีสั้นๆ เกี่ยวกับการใช้ชีวิต ความรัก และความคิดคำนึงยามค่ำคืนที่ริมระเบียงในห้องเช่าเล็กๆ",
        price: 95,
        stock: 30,
        serieName: "บทกวีร่วมสมัย",
        volume: "เล่มเดียวจบ",
        coverUrl: "/img/covers/cover_balcony_poetry.jpg"
      },
      {
        _id: new mongoose.Types.ObjectId("65f40000000000000000030a"),
        title: "จิตวิทยาการเงิน (The Psychology of Money)",
        author: "มอร์แกน เฮาเซล",
        format: "Paperback",
        synopsis: "การทำความเข้าใจพฤติกรรมและการตัดสินใจเกี่ยวกับเงินทองผ่านมุมมองทางจิตวิทยาและประวัติศาสตร์",
        price: 290,
        stock: 50,
        serieName: "ชุดการเงินและการลงทุน",
        volume: "เล่มเดียวจบ",
        coverUrl: "/img/covers/cover_psychology_of_money.jpg"
      }
    ];

    console.log('Inserting Books...');
    await Book.insertMany(books);

    // 5. Seed Orders (10 orders from week-02)
    const orders = [
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000401"),
        userId: new mongoose.Types.ObjectId("65f400000000000000000001"),
        orderDate: new Date("2026-07-13T10:00:00Z"),
        totalAmount: 370,
        status: "paid",
        statusHistory: [
          { status: "pending", changedAt: new Date("2026-07-13T09:55:00Z") },
          { status: "paid", changedAt: new Date("2026-07-13T10:00:00Z") }
        ],
        paymentMethod: "PromptPay",
        shippingAddress: "บ้านเลขที่ 99/99 ถนนรัชดาภิเษก แขวงห้วยขวาง เขตห้วยขวาง จังหวัดกรุงเทพมหานคร 10310"
      },
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000402"),
        userId: new mongoose.Types.ObjectId("65f400000000000000000002"),
        orderDate: new Date("2026-07-13T11:30:00Z"),
        totalAmount: 510,
        status: "shipping",
        statusHistory: [
          { status: "pending", changedAt: new Date("2026-07-13T11:20:00Z") },
          { status: "paid", changedAt: new Date("2026-07-13T11:30:00Z") },
          { status: "shipping", changedAt: new Date("2026-07-13T14:00:00Z") }
        ],
        paymentMethod: "PromptPay",
        shippingAddress: "บ้านเลขที่ 123/45 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย จังหวัดกรุงเทพมหานคร 10110"
      },
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000403"),
        userId: new mongoose.Types.ObjectId("65f400000000000000000003"),
        orderDate: new Date("2026-07-13T15:15:00Z"),
        totalAmount: 195,
        status: "pending",
        statusHistory: [
          { status: "pending", changedAt: new Date("2026-07-13T15:15:00Z") }
        ],
        paymentMethod: "PromptPay",
        shippingAddress: "บ้านเลขที่ 88/1 ถนนนิมมานเหมินท์ ตำบลสุเทพ อำเภอเมืองเชียงใหม่ จังหวัดเชียงใหม่ 50200"
      },
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000404"),
        userId: new mongoose.Types.ObjectId("65f400000000000000000004"),
        orderDate: new Date("2026-07-14T09:00:00Z"),
        totalAmount: 265,
        status: "paid",
        statusHistory: [
          { status: "pending", changedAt: new Date("2026-07-14T08:50:00Z") },
          { status: "paid", changedAt: new Date("2026-07-14T09:00:00Z") }
        ],
        paymentMethod: "PromptPay",
        shippingAddress: "บ้านเลขที่ 55/12 ถนนลาดพร้าว แขวงจอมพล เขตจตุจักร จังหวัดกรุงเทพมหานคร 10900"
      },
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000405"),
        userId: new mongoose.Types.ObjectId("65f400000000000000000005"),
        orderDate: new Date("2026-07-14T10:30:00Z"),
        totalAmount: 430,
        status: "paid",
        statusHistory: [
          { status: "pending", changedAt: new Date("2026-07-14T10:20:00Z") },
          { status: "paid", changedAt: new Date("2026-07-14T10:30:00Z") }
        ],
        paymentMethod: "PromptPay",
        shippingAddress: "บ้านเลขที่ 777/8 ถนนพหลโยธิน ตำบลคลองหนึ่ง อำเภอคลองหลวง จังหวัดปทุมธานี 12120"
      },
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000406"),
        userId: new mongoose.Types.ObjectId("65f400000000000000000006"),
        orderDate: new Date("2026-07-14T12:00:00Z"),
        totalAmount: 150,
        status: "completed",
        statusHistory: [
          { status: "pending", changedAt: new Date("2026-07-14T11:55:00Z") },
          { status: "paid", changedAt: new Date("2026-07-14T12:00:00Z") },
          { status: "shipping", changedAt: new Date("2026-07-14T14:30:00Z") },
          { status: "completed", changedAt: new Date("2026-07-15T10:00:00Z") }
        ],
        paymentMethod: "PromptPay",
        shippingAddress: "บ้านเลขที่ 10/3 ถนนรามคำแหง แขวงหัวหมาก เขตบางกะปิ จังหวัดกรุงเทพมหานคร 10240"
      },
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000407"),
        userId: new mongoose.Types.ObjectId("65f400000000000000000007"),
        orderDate: new Date("2026-07-14T14:45:00Z"),
        totalAmount: 470,
        status: "paid",
        statusHistory: [
          { status: "pending", changedAt: new Date("2026-07-14T14:40:00Z") },
          { status: "paid", changedAt: new Date("2026-07-14T14:45:00Z") }
        ],
        paymentMethod: "PromptPay",
        shippingAddress: "บ้านเลขที่ 200/15 ถนนพะเนียง ตำบลตลาดใหญ่ อำเภอเมืองภูเก็ต จังหวัดภูเก็ต 83000"
      },
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000408"),
        userId: new mongoose.Types.ObjectId("65f400000000000000000008"),
        orderDate: new Date("2026-07-15T08:30:00Z"),
        totalAmount: 180,
        status: "pending",
        statusHistory: [
          { status: "pending", changedAt: new Date("2026-07-15T08:30:00Z") }
        ],
        paymentMethod: "PromptPay",
        shippingAddress: "บ้านเลขที่ 15/9 ถนนมิตรภาพ ตำบลในเมือง อำเภอเมืองนครราชสีมา จังหวัดนครราชสีมา 30000"
      },
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000409"),
        userId: new mongoose.Types.ObjectId("65f400000000000000000009"),
        orderDate: new Date("2026-07-15T11:00:00Z"),
        totalAmount: 385,
        status: "paid",
        statusHistory: [
          { status: "pending", changedAt: new Date("2026-07-15T10:50:00Z") },
          { status: "paid", changedAt: new Date("2026-07-15T11:00:00Z") }
        ],
        paymentMethod: "PromptPay",
        shippingAddress: "บ้านเลขที่ 44 ถนนเจริญกรุง แขวงบางคอแหลม เขตบางคอแหลม จังหวัดกรุงเทพมหานคร 10120"
      },
      {
        _id: new mongoose.Types.ObjectId("65f40000000000000000040a"),
        userId: new mongoose.Types.ObjectId("65f400000000000000000001"),
        orderDate: new Date("2026-07-15T16:00:00Z"),
        totalAmount: 290,
        status: "paid",
        statusHistory: [
          { status: "pending", changedAt: new Date("2026-07-15T15:55:00Z") },
          { status: "paid", changedAt: new Date("2026-07-15T16:00:00Z") }
        ],
        paymentMethod: "PromptPay",
        shippingAddress: "บ้านเลขที่ 50/2 ถนนเพชรบุรี แขวงพญาไท เขตราชเทวี จังหวัดกรุงเทพมหานคร 10400"
      }
    ];

    console.log('Inserting Orders...');
    await Order.insertMany(orders);

    // 6. Seed Order Items (15 order items from week-02)
    const orderItems = [
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000501"),
        orderId: new mongoose.Types.ObjectId("65f400000000000000000401"),
        bookId: new mongoose.Types.ObjectId("65f400000000000000000301"),
        quantity: 1,
        pricePerUnit: 250
      },
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000502"),
        orderId: new mongoose.Types.ObjectId("65f400000000000000000401"),
        bookId: new mongoose.Types.ObjectId("65f400000000000000000302"),
        quantity: 1,
        pricePerUnit: 120
      },
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000503"),
        orderId: new mongoose.Types.ObjectId("65f400000000000000000402"),
        bookId: new mongoose.Types.ObjectId("65f400000000000000000303"),
        quantity: 1,
        pricePerUnit: 290
      },
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000504"),
        orderId: new mongoose.Types.ObjectId("65f400000000000000000402"),
        bookId: new mongoose.Types.ObjectId("65f400000000000000000304"),
        quantity: 1,
        pricePerUnit: 220
      },
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000505"),
        orderId: new mongoose.Types.ObjectId("65f400000000000000000403"),
        bookId: new mongoose.Types.ObjectId("65f400000000000000000305"),
        quantity: 1,
        pricePerUnit: 195
      },
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000506"),
        orderId: new mongoose.Types.ObjectId("65f400000000000000000404"),
        bookId: new mongoose.Types.ObjectId("65f400000000000000000306"),
        quantity: 1,
        pricePerUnit: 265
      },
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000507"),
        orderId: new mongoose.Types.ObjectId("65f400000000000000000405"),
        bookId: new mongoose.Types.ObjectId("65f400000000000000000301"),
        quantity: 1,
        pricePerUnit: 250
      },
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000508"),
        orderId: new mongoose.Types.ObjectId("65f400000000000000000405"),
        bookId: new mongoose.Types.ObjectId("65f400000000000000000308"),
        quantity: 1,
        pricePerUnit: 180
      },
      {
        _id: new mongoose.Types.ObjectId("65f400000000000000000509"),
        orderId: new mongoose.Types.ObjectId("65f400000000000000000406"),
        bookId: new mongoose.Types.ObjectId("65f400000000000000000307"),
        quantity: 1,
        pricePerUnit: 150
      },
      {
        _id: new mongoose.Types.ObjectId("65f40000000000000000050a"),
        orderId: new mongoose.Types.ObjectId("65f400000000000000000407"),
        bookId: new mongoose.Types.ObjectId("65f400000000000000000303"),
        quantity: 1,
        pricePerUnit: 290
      },
      {
        _id: new mongoose.Types.ObjectId("65f40000000000000000050b"),
        orderId: new mongoose.Types.ObjectId("65f400000000000000000407"),
        bookId: new mongoose.Types.ObjectId("65f400000000000000000308"),
        quantity: 1,
        pricePerUnit: 180
      },
      {
        _id: new mongoose.Types.ObjectId("65f40000000000000000050c"),
        orderId: new mongoose.Types.ObjectId("65f400000000000000000408"),
        bookId: new mongoose.Types.ObjectId("65f400000000000000000308"),
        quantity: 1,
        pricePerUnit: 180
      },
      {
        _id: new mongoose.Types.ObjectId("65f40000000000000000050d"),
        orderId: new mongoose.Types.ObjectId("65f400000000000000000409"),
        bookId: new mongoose.Types.ObjectId("65f400000000000000000309"),
        quantity: 1,
        pricePerUnit: 95
      },
      {
        _id: new mongoose.Types.ObjectId("65f40000000000000000050e"),
        orderId: new mongoose.Types.ObjectId("65f400000000000000000409"),
        bookId: new mongoose.Types.ObjectId("65f40000000000000000030a"),
        quantity: 1,
        pricePerUnit: 290
      },
      {
        _id: new mongoose.Types.ObjectId("65f40000000000000000050f"),
        orderId: new mongoose.Types.ObjectId("65f40000000000000000040a"),
        bookId: new mongoose.Types.ObjectId("65f40000000000000000030a"),
        quantity: 1,
        pricePerUnit: 290
      }
    ];

    console.log('Inserting Order Items...');
    await OrderItem.insertMany(orderItems);

    console.log('Seeding Database successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

seedData();
