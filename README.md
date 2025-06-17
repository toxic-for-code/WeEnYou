# VenueVista - Event Venue Booking Platform

VenueVista is a modern, full-stack web application for booking event venues and related services. The platform connects venue owners with customers while also integrating service providers for a complete event planning experience.

## 🌟 Features

### For Users
- Browse and search venues with advanced filters
  - Location-based search
  - Capacity requirements
  - Price range
  - Available amenities
- View venue details with image galleries
- Real-time Google Maps integration
- Book venues and add additional services
- Review and rate venues
- View verified venues and services

### For Venue Owners
- List venues with detailed information
- Manage venue details and availability
- Track bookings and requests
- Respond to reviews
- Showcase venue amenities

### For Service Providers
- List services (catering, decoration, etc.)
- Manage service details and pricing
- Connect with venue bookings
- Build verified service profile

### For Admins
- Verify venues and services
- Manage user accounts
- Monitor platform activity
- Handle user reports
- View analytics and insights

## 🛠️ Tech Stack

- **Frontend:**
  - Next.js 13 (App Router)
  - TypeScript
  - Tailwind CSS
  - React Google Maps
  - NextAuth.js

- **Backend:**
  - Node.js
  - MongoDB
  - Mongoose

- **Authentication:**
  - NextAuth.js
  - JWT

- **APIs:**
  - Google Maps API
  - (Payment Gateway - Coming Soon)

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/venuevista.git
   ```

2. Install dependencies:
   ```bash
   cd venuevista
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```env
   MONGODB_URI=your_mongodb_uri
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 Upcoming Features

- Payment gateway integration
- Real-time chat system
- Calendar integration
- Email notifications
- Virtual venue tours
- Mobile app
- Multi-language support
- Advanced analytics dashboard

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

For any queries or suggestions, please reach out to [your-email@example.com]

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting
- MongoDB for database
- All contributors and users of the platform 