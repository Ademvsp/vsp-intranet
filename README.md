<p align="center">
 <img width=200px src="https://user-images.githubusercontent.com/48583281/99490473-050a0580-29be-11eb-8c45-7d8183533526.png" alt="Project Logo">
</p>

<h3 align="center">vsp-intranet</h3>

<div align="center">

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![GitHub Issues](https://img.shields.io/github/issues/andrewvo89/vsp-intranet)](https://github.com/andrewvo89/vsp-intranet/issues)
[![GitHub Stars](https://img.shields.io/github/stars/andrewvo89/vsp-intranet)](https://github.com/andrewvo89/vsp-intranet/stargazers)

</div>

---

<p align="center">
    VSP Intranet is an internal small business communication system designed to unify common business processes and to solve common business problems.
</p>

## 📝 Table of Contents

- [📝 Table of Contents](#-table-of-contents)
- [About](#about)
- [Screenshots](#screenshots)
  - [Dashboard](#dashboard)
  - [News Feed](#news-feed)
  - [Staff Calendar](#staff-calendar)
  - [Projects](#projects)
  - [Dark Mode](#dark-mode)
- [Functions](#functions)
- [Features](#features)
- [🏁 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [🎈 Usage](#-usage)
- [🚀 Deployment](#-deployment)
- [⛏️ Built Using](#️-built-using)
- [✍️ Authors](#️-authors)

## About

VSP Intranet was created for VSP Solutions to solve common communication and business problems internally. Their internal systems were scattered across many different platforms and a lot of information was duplicated as a result.

VSP Solutions is a video surveillance software and hardware wholesale distributor based in Australia with 5 offices nationwide. They are a small business that employs over 30 staff members with various roles such as Sales, Engineers, Technicians, Warehousing, Finance and Marketing.

The Intranet was designed for staff members to log in, share information, synchonrize information and perform business tasks such as registering projects, applying for leave and claiming expenses. The project has over 30 active users.

As a result of the positive impact on VSP Solutions, I have decided to open soure the project so that other organizations can benefit from the Intranet. If you have any enquiries or require customizations, please email me at hello@andrewvo.co.

## Screenshots
### Dashboard
<p align="center">  
 <img src="https://user-images.githubusercontent.com/48583281/99489885-d5a6c900-29bc-11eb-875f-d510fc569d4f.png" alt="Dashboard">
</p>

### News Feed
<p align="center">  
 <img src="https://user-images.githubusercontent.com/48583281/99489823-adb76580-29bc-11eb-95e5-e6e52732e1ce.png" alt="News Feed">
</p>

### Staff Calendar
<p align="center">  
 <img src="https://user-images.githubusercontent.com/48583281/99489922-ec4d2000-29bc-11eb-9d3c-62abd5f4b9f1.png" alt="Staff Calendar">
</p>

### Projects
<p align="center">  
 <img src="https://user-images.githubusercontent.com/48583281/99489958-fe2ec300-29bc-11eb-9ec2-77b3a35d5c01.png" alt="Projects">
</p>

### Dark Mode
<p align="center">  
 <img src="https://user-images.githubusercontent.com/48583281/99489982-0850c180-29bd-11eb-83cf-4047052fc1bc.png" alt="Dark Mode">
</p>


## Functions

- News Feed - Share internal information and engage in conversations.
- Staff Calendar - See all staff member movements and events.
- Staff Directory - Displays staff information including their role, email, extension number and phone number.
- Projects - Register and track projects. Schedule reminders to follow up projects.
- Promotions - See current sales promotions and their expiry dates.
- Job Documents - Upload job document checklists once a job is completed for future reference.
- Firmware & Software - Upload and download firmrware and software packages.
- Resources - A collection of useful web links.
- Product Request Form - For staff members to fill out to get a new part number entered into the inventory system.
- Leave Request Form - Apply for leave (annual leave, sick leave, maternity leave etc.).
- Expense Claim Form - Submit receipts for the finance department to repay company expenses.
- Pricing Calculator - Assists sales staff to calculate gross profit and margin.
- Storage Calculator - Assists the engineers with determining storage and bandwidth requirements for CCTV projects.
- Motion Calculator - Assists the engineers with determining how much motion is present on certain CCTV scenes.
- RAID Calculator - Assists the engineers to caculate the correct usable storage of servers after RAID overheads.
- Account - Update user profile settings including updating profile pictures.
- Admin Panel - Add/edit/delete users, permissions and upload app data such as customers and vendors.

## Features

- Completely serverless
- Mobile friendly
- Dark mode support
- Email and in app notification support
- Authentication using SMS Verifications codes

## 🏁 Getting Started 

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See [deployment](#-deployment) for notes on how to deploy the project on a live system.

### Prerequisites

1. A Firebase Account (https://firebase.google.com/)
2. ReactJS knowledge including Hooks (https://reactjs.org/)

### Installation

Create a .env file for "Create React App" in the root folder:

```
REACT_APP_FIREBASE_API_KEY=xxxxxxxxxxxxxx
REACT_APP_FIREBASE_AUTH_DOMAIN=xxxxxxxxxxxxxx.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://xxxxxxxxxxxxxx.firebaseio.com
REACT_APP_FIREBASE_PROJECT_ID=xxxxxxxxxxxxxx
REACT_APP_FIREBASE_STORAGE_BUCKET=xxxxxxxxxxxxxx.appspot.com
REACT_APP_FIREBASE_FUNCTIONS_REGION=australia-southeast1
REACT_APP_BASE_URL=http://localhost:3000
```

For a full list of Firebase Functions regions, visit here:
https://firebase.google.com/docs/functions/locations

Create a .env file for Firebase Functions in the ./functions/ folder:

```
APP_NAME=xxxxxxxxxxxxxx
SMTP_HOST=xxxxxxxxxxxxxx
SMTP_PORT=xxxxxxxxxxxxxx
SMTP_USER=xxxxxxxxxxxxxx
SMTP_PASS=xxxxxxxxxxxxxx
BASE_URL=http://localhost:3000
ADMIN_FROM=xxxxxxxxxxxxxx
ADMIN_BCC=xxxxxxxxxxxxxx
DEFAULT_SIGNATURE=xxxxxxxxxxxxxx
EMAIL_FONT_URL=https://fonts.googleapis.com/css2?family=Roboto:ital@1&display=swap
EMAIL_FONT_NAME=Roboto
```

## 🎈 Usage

1. Create a Firebase project from your Firebase console.
2. Clone the repository.
3. Make sure the Firebase CLI is installed on your local machine.
   ```default
   npm install -g firebase-tools
   ```
4. Initialize your Firebase project from the root folder
   ```
   firebase init
   ```
5. Install the front end dependencies from the root folder.
   ```default
   npm install
   ```
   Or
   ```default
   yarn install
   ```
6. Navigate to the Firebase Functions folder ./functions/
7. Install the back end dependencies.
   ```default
   npm install
   ```
   Or
   ```default
   yarn install
   ```
8. Create an admin Firebase Auth User from the Firebase Console. (https://console.firebase.google.com/)
9. Use a Firebase Function to create a custom user token where admin = true. (https://firebase.google.com/docs/auth/admin/custom-claims)

   ```javascript
   // Set admin privilege on the user corresponding to uid.

   admin
     .auth()
     .setCustomUserClaims(uid, { admin: true })
     .then(() => {
       // The new custom claims will propagate to the user's ID token the
       // next time a new one is issued.
     });
   ```

10. Initially deploy Firebase rules, storage and functions.
    ```default
    firebase deploy --only firestore
    ```
    ```default
    firebase deploy --only storage
    ```
    ```default
    firebase deploy --only functions
    ```
11. Run the app from the root folder.
    ```default
    npm start
    ```
    Or
    ```default
    yarn start
    ```

## 🚀 Deployment

1. Update both the front end and back end .env files to production ready values (i.e. BASE_URL).
2. From the root directory, create a static build.
   ```default
   npm run build
   ```
   Or
   ```default
   yarn run build
   ```
3. Deploy the app, firestore rules, storage rules and functions.
   ```default
   firebase deploy
   ```

## ⛏️ Built Using

- [ReactJS](https://reactjs.org//) - Web Framework
- [Firebase](https://firebase.google.com/) - Backend as a Service
- [Material-UI](https://material-ui.com/) - UI Design System

## ✍️ Authors

- [@andrewvo89](https://github.com/andrewvo89) - Founder and developer
