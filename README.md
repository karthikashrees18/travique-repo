TRAVIQUE – Travel Guide Web Application

TRAVIQUE is a modern full-stack travel companion web application designed to help travelers explore destinations, plan itineraries, connect with fellow travelers, and access essential emergency information — even with limited internet connectivity.

The project follows a MERN-style architecture, using React for the frontend and Node.js + Express for the backend, with SQLite as the database.





Features

🗺️ Offline Map Support

Displays the user’s current location using the browser’s Geolocation API

Interactive maps built with OpenStreetMap + Leaflet

Supports zooming, markers, and basic map interactions

Manual offline map support using cached map tiles


👥 Group Travel

Create and join travel groups based on destination, interest, or travel vibe

View group details with a simple join option

Backend APIs handle group creation and user memberships



🧍 Solo Travel Discovery

Detects nearby solo travelers using geolocation

Displays travelers within a 10 km radius

Clickable social media links (e.g., Instagram) for easy connection



🚨 Emergency Information

Provides essential local emergency contacts:

Police

Ambulance

Fire

Includes “Call Now” buttons optimized for mobile devices



🧭 Itinerary Planner

Search nearby places such as restaurants, parks, and temples

Uses OpenStreetMap (Nominatim API) for location search

Displays results on the map with markers and a sidebar list





🛠️ Tech Stack
Frontend

React (Vite)

Tailwind CSS

React Leaflet

OpenStreetMap APIs

Backend

Node.js

Express.js

Prisma ORM

SQLite Database





📁 Project Structure

travel-guide-app/
├── server/
│   ├── index.js
│   ├── routes/
│   │   ├── groups.js
│   │   ├── users.js
│   │   └── emergency.js
│   └── prisma/
│       └── schema.prisma
│
├── client/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   └── package.json
│
├── .env
└── package.json





⚙️ Setup & Installation

Make sure you have Node.js, npm, and VS Code installed.

1️⃣ Clone the repository
git clone https://github.com/your-username/travique-repo.git
cd travel-guide-app

2️⃣ Install dependencies
npm install
cd client
npm install
cd ..

3️⃣ Setup Database (Prisma)
npx prisma generate
npx prisma db push

4️⃣ Run the application
npm run dev
The app will open in your browser and display the TRAVIQUE homepage.





🔑 Environment Variables

Create a .env file in the root directory:

DATABASE_URL="file:./dev.db"
PORT=5000

📌 API Endpoints
Endpoint	Description
/api/groups	Fetch all travel groups
/api/groups/:id/join	Join a travel group
/api/users	Manage users
/api/emergency	Fetch emergency contact information

🎯 Purpose of the Project

This project was developed as an academic and learning project to demonstrate:
Full-stack web development
REST API design
Geolocation and map integration
Offline-friendly travel solutions
Clean UI with responsive design

✨ Author

Karthikashree S
GitHub: https://github.com/your-username
