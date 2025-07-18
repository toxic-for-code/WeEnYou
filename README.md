# VenueVista - Event Venue Booking Platform

VenueVista is a modern, full-stack web application for booking event venues and related services. The platform connects venue owners with customers while also integrating service providers for a complete event planning experience.

## 🌟 Features

### For Users
- Browse and search venues with advanced filters
  - Location-based search with Google Maps integration
  - Capacity requirements (50-1000+ people)
  - Price range filtering (₹10,000 - ₹500,000+)
  - Available amenities (Parking, Catering, Decoration, etc.)
- View venue details with image galleries and 360° views
- Real-time availability checking
- Book venues and add additional services
- Review and rate venues
- View verified venues and services
- Save favorite venues
- Track booking history

### For Venue Owners
- List venues with detailed information
  - Multiple image uploads
  - Amenities and facilities
  - Pricing and capacity details
  - Location and map integration
- Manage venue details and availability
- Track bookings and requests
- Respond to reviews
- Showcase venue amenities
- View booking analytics
- Manage service providers

### For Service Providers
- List services (catering, decoration, etc.)
- Manage service details and pricing
- Connect with venue bookings
- Build verified service profile
- Showcase portfolio
- Manage availability
- Track service requests

### For Admins
- Verify venues and services
- Manage user accounts
- Monitor platform activity
- Handle user reports
- View analytics and insights
- Manage categories and amenities
- Handle verification requests

## 🛠️ Tech Stack

- **Frontend:**
  - Next.js 13 (App Router)
  - TypeScript
  - Tailwind CSS
  - React Google Maps
  - NextAuth.js
  - React Query
  - React Hook Form
  - Zod Validation

- **Backend:**
  - Node.js
  - MongoDB
  - Mongoose
  - Express.js
  - RESTful APIs

- **Authentication:**
  - NextAuth.js
  - JWT
  - OAuth (Google, GitHub)

- **APIs:**
  - Google Maps API
  - (Payment Gateway - Coming Soon)

- **Development Tools:**
  - ESLint
  - Prettier
  - Husky
  - TypeScript
  - Git

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/toxic-for-code/venuevista.git
   ```

2. Install dependencies:
   ```bash
   cd venuevista
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```env
   # Database
   MONGODB_URI=your_mongodb_uri

   # Authentication
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # APIs
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key

   # Optional: For production
   NEXT_PUBLIC_API_URL=your_api_url
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 Upcoming Features

- Payment gateway integration (Razorpay)
- Real-time chat system
- Calendar integration
- Email notifications
- Virtual venue tours
- Mobile app (React Native)
- Multi-language support
- Advanced analytics dashboard
- Social media sharing
- Booking management system
- Review and rating system
- Service provider marketplace

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please read our [Contributing Guidelines](CONTRIBUTING.md) for more details.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

For any queries or suggestions, please reach out to [sohelakhtar2101@gmail.com]

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting
- MongoDB for database
- All contributors and users of the platform
- Open source community

## 🔗 Links

- [Live Demo](https://venuevista.vercel.app)
- [API Documentation](https://venuevista.vercel.app/api-docs)
- [Issue Tracker](https://github.com/toxic-for-code/venuevista/issues)
