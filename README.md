<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# GeoAstro Compute

> **Know Your Real Birthday** - Discover your true place in the cosmos by calculating astronomical solar time, planetary alignment, and your exact solar return using geospatial temporal analytics.

[![Version](https://img.shields.io/badge/version-1.1.012-blue.svg)](https://github.com/NetoRibeiro/GeoAstro-Compute)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Powered by Gemini](https://img.shields.io/badge/Powered%20by-Gemini%202.5%20Flash-orange.svg)](https://ai.google.dev/)

## 🌟 Overview

GeoAstro Compute is a sophisticated web application that calculates astronomical data based on geographical location and time. Civil time is a construct - this application helps you discover your true astronomical birthday by computing:

- **True Solar Time** vs Civil Time differences
- **Planetary Positions** at birth and current location
- **Solar Return** calculations for your next astronomical birthday
- **Perfect Alignment Location** - where to be to see the sky exactly as it was when you were born
- **Arroyo Element Analysis** - astrological element distribution analysis

## ✨ Features

- 🌍 **Geolocation Support** - Automatically detect your current location
- 🔭 **Precision Astronomy** - Uses DE421 Ephemeris for accurate planetary calculations
- 🗺️ **Interactive Maps** - Visualize perfect alignment locations on an interactive map
- 📊 **Comprehensive Analysis** - Birth chart, current sky, and alignment data
- 🎨 **Beautiful UI** - Modern, responsive design with dark mode
- 🤖 **AI-Powered** - Enhanced with Gemini 2.5 Flash API

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **Gemini API Key** (optional, for AI features)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/NetoRibeiro/GeoAstro-Compute.git
   cd GeoAstro-Compute
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Set up Python virtual environment:**
   ```bash
   python -m venv venv
   ```

4. **Activate virtual environment:**
   - **Windows:**
     ```bash
     .\venv\Scripts\Activate.ps1
     ```
   - **macOS/Linux:**
     ```bash
     source venv/bin/activate
     ```

5. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

6. **(Optional) Configure Gemini API:**
   - Create a `.env.local` file in the root directory
   - Add your Gemini API key:
     ```
     GEMINI_API_KEY=your_api_key_here
     ```

### Running the Application

You need to run both the backend and frontend servers:

1. **Start the backend server** (in terminal 1):
   ```bash
   # Make sure virtual environment is activated
   .\venv\Scripts\Activate.ps1  # Windows
   # or: source venv/bin/activate  # macOS/Linux
   
   python backend/main.py
   ```
   Backend will run on `http://localhost:8000`

2. **Start the frontend server** (in terminal 2):
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:3000`

3. **Open your browser** and navigate to `http://localhost:3000`

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 19 with TypeScript
- Vite for build tooling
- Astronomy Engine for client-side calculations
- Lucide React for icons
- TailwindCSS for styling

**Backend:**
- FastAPI (Python web framework)
- Skyfield for astronomical calculations
- Geopy for geocoding
- Uvicorn as ASGI server

### Project Structure

```
GeoAstro-Compute/
├── backend/              # Python FastAPI backend
│   ├── main.py          # API endpoints
│   ├── astro_service.py # Astronomical calculations
│   └── world_cities.py  # City database and geocoding
├── components/          # React components
│   ├── AstroCard.tsx
│   ├── AlignmentCard.tsx
│   ├── ArroyoCard.tsx
│   ├── AstrologicalChartCard.tsx
│   ├── InputForm.tsx
│   └── StarBackground.tsx
├── services/            # Frontend services
│   └── apiService.ts    # API communication
├── utils/               # Utility functions
├── App.tsx              # Main React application
├── types.ts             # TypeScript type definitions
├── index.html           # HTML entry point
├── vite.config.ts       # Vite configuration
├── package.json         # Node dependencies
└── requirements.txt     # Python dependencies
```

## 📖 Usage

1. **Enter Birth Information:**
   - Select your birth country
   - Enter your birth city
   - Select state/province (if applicable)
   - Enter birth date and time

2. **Enter Current Observer Information:**
   - Use "Get Current Location" button for automatic detection
   - Or manually enter location and current date/time

3. **Click "Initialize Computation"** to calculate:
   - Birth astronomical data
   - Current sky positions
   - Solar return date
   - Perfect alignment location
   - Arroyo element analysis

4. **View Results:**
   - Explore interactive cards with detailed astronomical data
   - View the astrological chart (toggle on/off)
   - Check the perfect alignment map

## 🔧 API Endpoints

The backend provides the following REST API endpoints:

- `GET /` - Health check
- `POST /analyze` - Analyze astronomical data for a location and time
- `POST /solar-return` - Calculate solar return date
- `POST /perfect-alignment` - Find perfect alignment location
- `POST /arroyo-analysis` - Perform Arroyo element analysis

## 🎯 Credits

Based on the article **"Know Your Real Birthday: Astronomical Computation and Geospatial-Temporal Analytics"** by [kcpub21](https://towardsdatascience.com/author/kcpub21/) on Towards Data Science.

Arroyo Element Analysis based on the work of **Stephen Arroyo**, renowned astrologer and author.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Repository:** [github.com/NetoRibeiro/GeoAstro-Compute](https://github.com/NetoRibeiro/GeoAstro-Compute)
- **AI Studio App:** [View in AI Studio](https://ai.studio/apps/drive/1HW8ivs3YJJj48xRbHQiy1chfzwQtHji5)
- **Author:** [NetoRibeiro](https://github.com/NetoRibeiro/)

## 🐛 Troubleshooting

### Common Issues

**Port already in use:**
- Backend: Change port in `backend/main.py` (default: 8000)
- Frontend: Vite will automatically use next available port

**Virtual environment activation fails:**
- Windows: Run `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
- Ensure Python is properly installed

**Module not found errors:**
- Ensure virtual environment is activated
- Run `pip install -r requirements.txt` again

**Frontend can't connect to backend:**
- Verify backend is running on port 8000
- Check browser console for CORS errors
- Ensure both servers are running

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/NetoRibeiro/">NetoRibeiro</a></p>
  <p>Powered by Gemini 2.5 Flash API • Precision Standard: DE421 Ephemeris</p>
</div>
