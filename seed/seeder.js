const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Provider = require('../models/Provider');
const Category = require('../models/Category');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const Address = require('../models/Address');
const Favorite = require('../models/Favorite');
const PaymentMethod = require('../models/PaymentMethod');
const Transaction = require('../models/Transaction');

dotenv.config();

// Helper to hash password
const hashPassword = (pwd) => {
  return bcrypt.hashSync(pwd, 10);
};

const seedData = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/homehive');
    console.log('Database connected.');

    // Clear existing data
    console.log('Cleaning database...');
    await User.deleteMany();
    await Provider.deleteMany();
    await Category.deleteMany();
    await Service.deleteMany();
    await Booking.deleteMany();
    await Review.deleteMany();
    await Notification.deleteMany();
    await Address.deleteMany();
    await Favorite.deleteMany();
    await PaymentMethod.deleteMany();
    await Transaction.deleteMany();
    console.log('Database cleaned.');

    // 1. Create Default Admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@homehive.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123';
    console.log(`Seeding Admin: ${adminEmail}`);
    const admin = await User.create({
      name: 'HomeHive Admin',
      email: adminEmail,
      phone: '9988776655',
      password: adminPassword, // will be hashed by pre-save hook
      role: 'admin',
      profileImage: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin',
    });

    // 2. Create Customers
    console.log('Seeding Customers...');
    const customersData = [
      {
        name: 'Priya Sharma',
        email: 'priya@example.com',
        phone: '9876543210',
        password: 'Password123',
        role: 'customer',
        profileImage: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Priya',
      },
      {
        name: 'Amit Patel',
        email: 'amit@example.com',
        phone: '9123456789',
        password: 'Password123',
        role: 'customer',
        profileImage: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Amit',
      },
      {
        name: 'Rohan Sen',
        email: 'rohan@example.com',
        phone: '8765432109',
        password: 'Password123',
        role: 'customer',
        profileImage: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Rohan',
      },
    ];

    const customers = await User.create(customersData);

    // Create Addresses for Priya
    const priyaAddresses = await Address.create([
      {
        user: customers[0]._id,
        label: 'Home',
        house: 'Flat 405, Block B',
        street: 'Palm Meadows, Varthur Road',
        area: 'Whitefield',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560066',
        landmark: 'Near Shell Petrol Pump',
        isDefault: true,
      },
      {
        user: customers[0]._id,
        label: 'Work',
        house: 'Tower C, 8th Floor',
        street: 'Manyata Tech Park',
        area: 'Hebbal',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560045',
        landmark: 'Opposite Elements Mall',
        isDefault: false,
      },
    ]);

    // Create Payment Methods for Priya
    await PaymentMethod.create([
      {
        user: customers[0]._id,
        type: 'upi',
        provider: 'Paytm',
        maskedIdentifier: 'priya@paytm',
        tokenReference: 'tok_upi_paytm_priya',
        isDefault: true,
      },
      {
        user: customers[0]._id,
        type: 'card',
        provider: 'HDFC Bank',
        last4: '4829',
        maskedIdentifier: '•••• 4829',
        tokenReference: 'tok_card_hdfc_4829',
        isDefault: false,
      },
    ]);

    // 3. Create Categories
    console.log('Seeding Categories...');
    const categoriesData = [
      {
        name: 'Plumbing',
        description: 'Leakage repairs, tap fittings, pipe blockages, and sanitary installations.',
        icon: 'Wrench',
        image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&auto=format&fit=crop&q=60',
        status: 'active',
      },
      {
        name: 'Electrical',
        description: 'Ceiling fans, switches, wiring fixes, smart appliances, and power issues.',
        icon: 'Zap',
        image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&auto=format&fit=crop&q=60',
        status: 'active',
      },
      {
        name: 'Cleaning',
        description: 'Full home deep cleaning, kitchen cleaning, sofa, and bathroom sanitization.',
        icon: 'Sparkles',
        image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&auto=format&fit=crop&q=60',
        status: 'active',
      },
      {
        name: 'Carpentry',
        description: 'Furniture repairs, door fittings, custom shelves, and woodwork fixing.',
        icon: 'Hammer',
        image: 'https://images.unsplash.com/photo-1534224039826-c7a0eda0e6b3?w=400&auto=format&fit=crop&q=60',
        status: 'active',
      },
      {
        name: 'Painting',
        description: 'Interior and exterior wall painting, waterproof coats, and wall putty.',
        icon: 'Paintbrush',
        image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&auto=format&fit=crop&q=60',
        status: 'active',
      },
      {
        name: 'AC Repair',
        description: 'AC servicing, gas refills, cooling troubleshooting, and installation.',
        icon: 'Wind',
        image: 'https://images.unsplash.com/photo-1621905252507-b354bc25edac?w=400&auto=format&fit=crop&q=60',
        status: 'active',
      },
      {
        name: 'Gardening',
        description: 'Lawn trimming, plant trimming, organic soil preparation, and layout designs.',
        icon: 'Flower2',
        image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&auto=format&fit=crop&q=60',
        status: 'active',
      },
    ];

    const categories = await Category.create(categoriesData);

    // 4. Create Providers Users & Profiles
    console.log('Seeding Providers...');

    const providerUsersData = [
      {
        name: 'Rajesh Kumar',
        email: 'rajesh@example.com',
        phone: '9888877777',
        password: 'Password123',
        role: 'provider',
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh',
      },
      {
        name: 'Aarti Verma',
        email: 'aarti@example.com',
        phone: '9777766666',
        password: 'Password123',
        role: 'provider',
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aarti',
      },
      {
        name: 'Prakash Nayak',
        email: 'prakash@example.com',
        phone: '9666655555',
        password: 'Password123',
        role: 'provider',
        profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Prakash',
      },
    ];

    const providerUsers = await User.create(providerUsersData);

    const providersData = [
      {
        user: providerUsers[0]._id,
        businessName: 'Rajesh Plumbers & Sanitary Works',
        category: 'Plumbing',
        description: 'Master plumber with 8+ years of experience in fixing complex piping issues, bathroom remodeling, kitchen leaks, and high-pressure pumps. Verified, punctual, and reliable.',
        experience: 8,
        phone: '9888877777',
        email: 'rajesh@example.com',
        profileImage: providerUsers[0].profileImage,
        serviceArea: 'Whitefield, Varthur, HSR Layout, Koramangala',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560066',
        rating: 4.9,
        totalReviews: 2,
        totalJobs: 18,
        isApproved: true,
        approvalStatus: 'approved',
        isAvailable: true,
        availability: {
          monday: { isAvailable: true, startTime: '09:00', endTime: '19:00' },
          tuesday: { isAvailable: true, startTime: '09:00', endTime: '19:00' },
          wednesday: { isAvailable: true, startTime: '09:00', endTime: '19:00' },
          thursday: { isAvailable: true, startTime: '09:00', endTime: '19:00' },
          friday: { isAvailable: true, startTime: '09:00', endTime: '19:00' },
          saturday: { isAvailable: true, startTime: '09:00', endTime: '18:00' },
          sunday: { isAvailable: false },
        },
      },
      {
        user: providerUsers[1]._id,
        businessName: 'Verma Deep Cleaners & Sanitation',
        category: 'Cleaning',
        description: 'We offer professional eco-friendly deep cleaning solutions for residential houses, flats, kitchens, sofas, and washrooms. Fully equipped with modern machines and sanitizers.',
        experience: 5,
        phone: '9777766666',
        email: 'aarti@example.com',
        profileImage: providerUsers[1].profileImage,
        serviceArea: 'Indiranagar, Koramangala, Whitefield, Electronic City',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560034',
        rating: 4.8,
        totalReviews: 1,
        totalJobs: 32,
        isApproved: true,
        approvalStatus: 'approved',
        isAvailable: true,
        availability: {
          monday: { isAvailable: true, startTime: '08:00', endTime: '20:00' },
          tuesday: { isAvailable: true, startTime: '08:00', endTime: '20:00' },
          wednesday: { isAvailable: true, startTime: '08:00', endTime: '20:00' },
          thursday: { isAvailable: true, startTime: '08:00', endTime: '20:00' },
          friday: { isAvailable: true, startTime: '08:00', endTime: '20:00' },
          saturday: { isAvailable: true, startTime: '08:00', endTime: '20:00' },
          sunday: { isAvailable: true, startTime: '09:00', endTime: '15:00' },
        },
      },
      {
        user: providerUsers[2]._id,
        businessName: 'Prakash Electrical Services',
        category: 'Electrical',
        description: 'Government licensed electrician specializing in smart home panels, safety switches, emergency power failure repair, lighting wiring, and ceiling fan maintenance.',
        experience: 6,
        phone: '9666655555',
        email: 'prakash@example.com',
        profileImage: providerUsers[2].profileImage,
        serviceArea: 'Whitefield, HSR Layout, Koramangala, Bellandur',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560102',
        rating: 4.5,
        totalReviews: 0,
        totalJobs: 12,
        isApproved: false, // Testing verification queue
        approvalStatus: 'pending',
        isAvailable: true,
      },
    ];

    const providers = await Provider.create(providersData);

    // Priya favorites Rajesh
    await Favorite.create({
      customer: customers[0]._id,
      provider: providers[0]._id,
    });

    // 5. Create Services for Providers
    console.log('Seeding Services...');
    const servicesData = [
      // Rajesh Services (Plumbing)
      {
        provider: providers[0]._id,
        category: 'Plumbing',
        title: 'Leaking Tap & Pipe Repair',
        description: 'Complete inspection and immediate leakage resolution for taps, mixers, washbasins, and toilet flushes. Includes basic spare washers.',
        price: 299,
        priceType: 'fixed',
        duration: '1 hr',
        image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&auto=format&fit=crop&q=60',
        isActive: true,
      },
      {
        provider: providers[0]._id,
        category: 'Plumbing',
        title: 'Bathroom Blockage Clearance',
        description: 'Clearing tough clogs in kitchen sinks, bathroom floor drains, and bathtubs. High pressure machinery cleaning if needed.',
        price: 499,
        priceType: 'starting',
        duration: '2 hrs',
        image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=60',
        isActive: true,
      },
      // Aarti Services (Cleaning)
      {
        provider: providers[1]._id,
        category: 'Cleaning',
        title: 'Full Home Deep Cleaning',
        description: 'Dusting, scrubbing, vacuuming, window pane cleaning, floor sanitization, and washroom tiles acid washing for 1BHK/2BHK flats.',
        price: 1999,
        priceType: 'fixed',
        duration: '5 hrs',
        image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=60',
        isActive: true,
      },
      {
        provider: providers[1]._id,
        category: 'Cleaning',
        title: 'Kitchen Deep Cleaning',
        description: 'Soot removal, chimney exterior cleaning, cabinet interior/exterior scrubbing, sink polish, and heavy stain removal on tiles.',
        price: 899,
        priceType: 'fixed',
        duration: '3 hrs',
        image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=60',
        isActive: true,
      },
      // Prakash Services (Electrical) - Pending approval provider but has services
      {
        provider: providers[2]._id,
        category: 'Electrical',
        title: 'Ceiling Fan Installation & Fix',
        description: 'Fast ceiling fan installation, regulator replacement, or weird noise troubleshooting.',
        price: 199,
        priceType: 'fixed',
        duration: '1 hr',
        image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=60',
        isActive: true,
      },
    ];

    const services = await Service.create(servicesData);

    // 6. Create Bookings (Historic & Active)
    console.log('Seeding Bookings...');
    const bookingDates = [
      new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days in future
    ];

    // Historical Completed Booking: Priya -> Rajesh
    const booking1 = await Booking.create({
      customer: customers[0]._id,
      provider: providers[0]._id,
      service: services[0]._id,
      category: 'Plumbing',
      bookingDate: bookingDates[0],
      bookingTime: '10:00 - 11:00',
      address: priyaAddresses[0].house + ', ' + priyaAddresses[0].street,
      city: priyaAddresses[0].city,
      state: priyaAddresses[0].state,
      pincode: priyaAddresses[0].pincode,
      notes: 'Please come on time, tap is dripping heavily',
      price: services[0].price,
      paymentStatus: 'paid',
      bookingStatus: 'completed',
    });

    // Create Transaction for Booking 1
    const trans1 = await Transaction.create({
      booking: booking1._id,
      customer: customers[0]._id,
      provider: providers[0]._id,
      amount: booking1.price,
      currency: 'INR',
      paymentMethod: 'Paytm UPI (priya@paytm)',
      gateway: 'Razorpay (Mock)',
      gatewayTransactionId: 'pay_MOCK123456789',
      status: 'paid',
    });
    booking1.transaction = trans1._id;
    await booking1.save();

    // Create Review for Booking 1 (Only completed can be reviewed)
    const review1 = await Review.create({
      customer: customers[0]._id,
      provider: providers[0]._id,
      booking: booking1._id,
      service: services[0]._id,
      rating: 5,
      comment: 'Super fast service. Rajesh arrived within 10 minutes and resolved the drip issues in a jiffy. Clean work!',
      tags: ['On Time', 'Clean Work', 'Professional', 'Good Quality'],
    });

    // Booking 2: Historic Completed Deep Cleaning: Priya -> Aarti
    const booking2 = await Booking.create({
      customer: customers[0]._id,
      provider: providers[1]._id,
      service: services[3]._id,
      category: 'Cleaning',
      bookingDate: bookingDates[1],
      bookingTime: '09:00 - 12:00',
      address: priyaAddresses[0].house + ', ' + priyaAddresses[0].street,
      city: priyaAddresses[0].city,
      state: priyaAddresses[0].state,
      pincode: priyaAddresses[0].pincode,
      notes: 'Soot removal in chimney',
      price: services[3].price,
      paymentStatus: 'paid',
      bookingStatus: 'completed',
    });

    const trans2 = await Transaction.create({
      booking: booking2._id,
      customer: customers[0]._id,
      provider: providers[1]._id,
      amount: booking2.price,
      currency: 'INR',
      paymentMethod: 'HDFC Card (•••• 4829)',
      gateway: 'Razorpay (Mock)',
      gatewayTransactionId: 'pay_MOCK987654321',
      status: 'paid',
    });
    booking2.transaction = trans2._id;
    await booking2.save();

    await Review.create({
      customer: customers[0]._id,
      provider: providers[1]._id,
      booking: booking2._id,
      service: services[3]._id,
      rating: 4.8,
      comment: 'Aarti and team cleaned the chimney very well. Some heavy soot stains on cabinets are also gone.',
      tags: ['Clean Work', 'Professional'],
    });

    // Booking 3: Future Upcoming Active Booking: Priya -> Rajesh
    const booking3 = await Booking.create({
      customer: customers[0]._id,
      provider: providers[0]._id,
      service: services[1]._id,
      category: 'Plumbing',
      bookingDate: bookingDates[2],
      bookingTime: '11:00 - 13:00',
      address: priyaAddresses[0].house + ', ' + priyaAddresses[0].street,
      city: priyaAddresses[0].city,
      state: priyaAddresses[0].state,
      pincode: priyaAddresses[0].pincode,
      notes: 'Shower drainage block is very bad.',
      price: services[1].price,
      paymentStatus: 'paid',
      bookingStatus: 'confirmed',
    });

    const trans3 = await Transaction.create({
      booking: booking3._id,
      customer: customers[0]._id,
      provider: providers[0]._id,
      amount: booking3.price,
      currency: 'INR',
      paymentMethod: 'Paytm UPI (priya@paytm)',
      gateway: 'Razorpay (Mock)',
      gatewayTransactionId: 'pay_MOCK456789012',
      status: 'paid',
    });
    booking3.transaction = trans3._id;
    await booking3.save();

    // Trigger averages
    await Review.getAverageRating(providers[0]._id);
    await Review.getAverageRating(providers[1]._id);

    // 7. Seed Initial Notifications
    console.log('Seeding Notifications...');
    await Notification.create([
      {
        user: customers[0]._id,
        type: 'BookingConfirmed',
        title: 'Booking Confirmed',
        message: 'Your booking for Blockage Clearance on ' + bookingDates[2].toDateString() + ' is confirmed.',
        booking: booking3._id,
        isRead: false,
      },
      {
        user: customers[0]._id,
        type: 'ServiceCompleted',
        title: 'Service Completed',
        message: 'Your home service with Aarti Verma was completed. Please leave your review.',
        booking: booking2._id,
        isRead: true,
      },
      {
        user: providerUsers[0]._id,
        type: 'NewBookingRequest',
        title: 'New Service Booking',
        message: 'You have a confirmed booking from Priya Sharma on ' + bookingDates[2].toDateString(),
        booking: booking3._id,
        isRead: false,
      },
    ]);

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
