<div align="center">

# SkySearch ✈️

A modern, high-performance flight search engine built with **Next.js 16**, **React 19**, and **Tailwind CSS**. 

SkySearch provides real-time flight data, interactive price visualization, and a premium, responsive user experience optimized for speed and accessibility.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8)

</div>

## ✨ Features

- **Real-Time Search**: Seamless integration with the **Amadeus API** for live flight availability and pricing.
- **Smart Sorting**: "Best", "Cheapest", and "Fastest" algorithms to help users find the perfect flight.
- **Interactive Price Graph**: Progressive data visualization offering price insights for surrounding dates.
- **Rich Flight Details**: Estimated amenities (Wi-Fi, Power, Entertainment) and aircraft information.
- **URL Synchronization**: Shareable search URLs that persist state across sessions.
- **Recent Searches**: Local history of previous searches for quick access.
- **Dark Mode**: Fully responsive theme with automatic system preference detection.
- **Performance Optimized**: 
  - **Vercel Analytics** & **Speed Insights** integration.
  - Server-side rendering (SSR) for fast initial loads.
  - Optimized font loading (Geist) and image handling.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Visualization**: [Recharts](https://recharts.org/)
- **State Management**: React Hooks & URL Search Params
- **API**: [Amadeus Self-Service API](https://developers.amadeus.com/)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ekam-Bitt/skysearch.git
   cd skysearch
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory and add your Amadeus API credentials:
   ```env
   AMADEUS_CLIENT_ID=your_client_id
   AMADEUS_CLIENT_SECRET=your_client_secret
   # Optional: For production API
   # AMADEUS_BASE_URL=api.amadeus.com
   ```
   > You can get free test keys from the [Amadeus for Developers](https://developers.amadeus.com/register) portal.

4. **Run the development server**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📦 Deployment

The application is optimized for deployment on **Vercel**.

1. Push your code to a Git repository.
2. Import the project into Vercel.
3. Add your environment variables (`AMADEUS_CLIENT_ID`, `AMADEUS_CLIENT_SECRET`) in the Vercel dashboard.
4. Deploy!

### Production Build
To create a production build locally:

```bash
npm run build
npm start
```

## 📈 Performance & SEO

- **Metadata**: Comprehensive Open Graph and Twitter cards configurations.
- **Robots & Sitemap**: Automated generation for search engine indexing.
- **Dynamic Imports**: Lazy loading for heavy interactive components.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by [Ekam Bitt](https://github.com/Ekam-Bitt)