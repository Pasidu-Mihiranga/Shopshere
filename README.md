# ShopSphere - E-Commerce Platform

## Project Overview
ShopSphere is a collaborative e-commerce platform designed and developed by a dedicated team. This project features a React-based frontend (client) and a Node.js/Express backend (server) with MongoDB as the database.

*Note: While this project was collaboratively developed by the entire team, GitHub repository maintenance and version control were managed by Ilamperuma P.M. and W M C S Wijekoon.*

Getting Started

 Prerequisites
- Node.js (v14 or higher recommended)
- npm (comes with Node.js)
- MongoDB (local instance required)

 Installation
1. Clone or download the project**
   - If using GitHub: `git clone [repository-url]`
   - If using ZIP file: Extract the contents

2. Open the project in your code editor
   cd ShopSphere
   

 Setting Up the Backend (Server)
1. Navigate to the server folder:
  
   cd server
   
2. Install dependencies:
  
   npm install
  
3. Start the server (runs on port 5000):
  
   node server.js
 

Setting Up the Frontend (Client)
1. Navigate to the client folder:
   
   cd client
  
2. Install dependencies:
   
   npm install
  
3. Start the React application (runs on port 3000):
  
   npm start
   

 Starting MongoDB
- Windows:
  on bash - 
  mongod

  
- Mac (using Homebrew):
  
  brew services start mongodb-community@8.0
 
  or use the default MongoDB command if you installed it differently.

 Running the Application
1. Open two separate terminals in your code editor
2. In one terminal:
   - Navigate to `ShopSphere/server`
   - Run `node server.js`
3. In the other terminal:
   - Navigate to `ShopSphere/client`
   - Run `npm start`

 Accessing the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
<img width="441" alt="Screenshot 2025-06-08 at 23 26 52" src="https://github.com/user-attachments/assets/5fbe7a25-74fe-491b-85f5-df4baec7b23b" />


Troubleshooting
- If you encounter port conflicts, ensure no other applications are using ports 3000 or 5000
- Make sure MongoDB is running before starting the server
- If dependencies fail to install, try deleting `node_modules` and `package-lock.json` and run `npm install` again

A Video file of this site has been uploaded you can go through the zip file for it 



