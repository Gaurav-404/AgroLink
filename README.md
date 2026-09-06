# 🌾 AgroLink – Farmer's Hub

AgroLink is a full-stack web application designed to connect farmers and agricultural product sellers on a single platform.

The application allows farmers to manage their crops, request agricultural chemicals, provide feedback, and interact with sellers. Sellers can manage agrochemicals and respond to farmer requests.

---

## 🚀 Features

### 👨‍🌾 Farmer

- User registration and login
- JWT-based authentication
- Add and manage crops
- View personal crops
- Edit and delete crop details
- View available agrochemicals
- Send requests for agrochemicals
- View submitted requests
- Provide feedback
- View feedback
- Access farmer dashboard
- Chat functionality

### 🧑‍💼 Seller

- Seller registration and login
- JWT-based authentication
- Add agrochemical products
- Edit agrochemical details
- Delete agrochemical products
- View agrochemicals
- View farmer requests
- Manage farmer requests
- View feedback
- Access seller dashboard

---

## 🏗️ Project Architecture

The project follows a full-stack architecture:

```text
AgroLink
│
├── angularapp/              # Angular Frontend
│
├── dotnetapp/               # ASP.NET Core Web API
│
├── TestProject/             # Unit Tests
│
├── .github/
│   └── workflows/
│       └── build.yml        # GitHub Actions
│
├── .config/
│   └── dotnet-tools.json
│
├── .gitignore
├── README.md
└── package-lock.json
