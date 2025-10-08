<div align="center">

# Music App

[![Node.js](https://img.shields.io/badge/Node.js-v14+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PNPM](https://img.shields.io/badge/PNPM-Fast%20Package%20Manager-f69220?style=for-the-badge&logo=pnpm&logoColor=white)](https://pnpm.io/)
[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.3.6-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Authentication%20%26%20Database-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](https://opensource.org/licenses/MIT)

**A modern, feature-rich music streaming application built with cutting-edge web technologies**

[🎵 Live Demo](https://music.anmol.pro/) • [Documentation](#getting-started) • [Report Bug](https://github.com/Anmol-TheDev/Music_app/issues) • [Request Feature](https://github.com/Anmol-TheDev/Music_app/issues)

</div>

---

## Application Preview

<div align="center">

![Music App Screenshot 1](https://github.com/user-attachments/assets/4f6d2d67-ca6f-4d53-9331-2c511ef44d8e)
*Main Dashboard - Browse and discover music*

![Music App Screenshot 2](https://github.com/user-attachments/assets/77b41f3b-c0f1-4608-99d2-d49b176c231d)
*Music Player Interface*

![Music App Screenshot 3](https://github.com/user-attachments/assets/451b4b45-47a7-466e-9792-f9056c12f990)
*Artist and Album Views*

![Music App Screenshot 4](https://github.com/user-attachments/assets/99db05d9-274c-4034-8304-2714d8efc000)
*Responsive Mobile Design*

</div>

---

## 🛠️ Tech Stack

Our music app is built using modern web technologies to ensure optimal performance and user experience:

### **Frontend**
- **[React 19.0.0](https://reactjs.org/)** - Latest React with concurrent features
- **[Vite 6.3.6](https://vitejs.dev/)** - Lightning-fast build tool and dev server
- **[Tailwind CSS 3.4.17](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Unstyled, accessible UI components

### **State Management & Routing**
- **[Zustand 5.0.2](https://github.com/pmndrs/zustand)** - Lightweight state management
- **[React Router DOM 7.1.1](https://reactrouter.com/)** - Declarative routing

### **Authentication & Backend**
- **[Firebase 11.10.0](https://firebase.google.com/)** - Authentication and real-time database
- **[Saavn.dev API](https://saavn.dev)** - Music streaming API

### **Audio & Visualization**
- **[React Player 2.16.0](https://github.com/cookpete/react-player)** - Media player component
- **[React Audio Visualize 1.2.0](https://github.com/bouzidanas/react-audio-visualize)** - Audio visualization

### **Development Tools**
- **[ESLint 9.17.0](https://eslint.org/)** - Code linting and formatting
- **[Prettier 3.6.2](https://prettier.io/)** - Code formatter
- **[Husky 9.1.7](https://typicode.github.io/husky/)** - Git hooks

---

## ✨ Features

### **Core Music Features**
- **Advanced Search** - Find songs, artists, and albums instantly
- **High-Quality Streaming** - Crystal clear audio playback
- **Playlist Management** - Create, edit, and organize custom playlists
- **Favorites System** - Save and manage your liked songs
- **Smart Controls** - Shuffle, repeat, and queue management

### **User Experience**
- **Secure Authentication** - Firebase-powered user accounts
- **Fully Responsive** - Seamless experience across all devices
- **Theme Customization** - Light/dark mode with custom themes
- **Keyboard Shortcuts** - Efficient navigation and control
  - `Space` - Play/Pause
  - `→/←` - Next/Previous track
  - `↑/↓` - Volume control
  - `M` - Mute/Unmute
  - `S` - Shuffle toggle

### **Performance & Accessibility**
- **Lightning Fast** - Optimized with Vite and React 19
- **Accessible Design** - WCAG compliant with Radix UI
- **Real-time Sync** - Cross-device playlist synchronization

---

## 🚀 Getting Started

Follow these steps to set up the Music App locally on your machine.

### 📋 Prerequisites

Ensure you have the following installed:

- **Node.js** (v14 or later) - [Download here](https://nodejs.org/)
- **PNPM** - Fast, disk space efficient package manager
  ```bash
  npm install -g pnpm
  ```
- **Firebase Account** - [Create one here](https://console.firebase.google.com/)

### ⚙️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Anmol-TheDev/Music_app.git
   cd Music_app
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   ```
   
   Add your Firebase configuration to `.env`:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Configure Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable **Authentication** with Email/Password
   - Create a **Firestore Database** in test mode
   - Copy your config values to the `.env` file

5. **Start the development server**
   ```bash
   pnpm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173` to see the app in action!

### Build for Production

```bash
# Create production build
pnpm run build

# Preview production build locally
pnpm run preview
```

---

## 📁 Project Structure

```
Music_app/
├── public/              # Static assets
├── src/
│   ├── Auth/            # Authentication components
│   ├── components/      # Reusable UI components
│   │   ├── Album/       # Album-related components
│   │   ├── Artist/      # Artist-related components
│   │   ├── music/       # Music player components
│   │   ├── playlist/    # Playlist management
│   │   ├── search/      # Search functionality
│   │   └── ui/          # Base UI components (Radix)
│   ├── context/         # React context providers
│   ├── lib/             # Utility functions
│   └── zustand/         # State management store
├── package.json         # Dependencies and scripts
├── tailwind.config.js   # Tailwind CSS configuration
├── vite.config.js       # Vite configuration
└── firebase.js          # Firebase configuration
```

---

## 🤝 Contributing

We welcome contributions from the community! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### 🚀 How to Contribute

1. **Star the repository** (it really helps!)
2. **Fork the project**
3. **Create your feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
4. **Make your changes** and commit them
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
5. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
6. **Open a Pull Request**

### 📋 Development Guidelines

- Follow the existing code style and conventions
- Write clear, descriptive commit messages
- Add tests for new features when applicable
- Update documentation as needed
- Ensure all checks pass before submitting PR

For detailed contributing guidelines, please see [CONTRIBUTING.md](CONTRIBUTING.md).

---

## 📚 API Documentation

This application uses the **[Saavn.dev API](https://saavn.dev/docs)** for music data and streaming. The API provides:

- Song search and metadata
- Artist information and discography
- Album details and track listings
- Playlist creation and management
- Music categories and genres

Base URL: `https://saavn.dev`

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact & Support

### 🆘 Get Help

- **Bug Reports**: [Create an Issue](https://github.com/Anmol-TheDev/Music_app/issues/new)
- **Feature Requests**: [Request a Feature](https://github.com/Anmol-TheDev/Music_app/issues/new)
- **Questions**: [Discussions](https://github.com/Anmol-TheDev/Music_app/discussions)

### 🌐 Community

- **Star us on GitHub** - Show your support!
- **Follow for updates** - Stay informed about new releases
- **Join discussions** - Connect with other users and contributors

---

<div align="center">

**Made with ❤️ by the Music App community**

[![GitHub stars](https://img.shields.io/github/stars/Anmol-TheDev/Music_app?style=social)](https://github.com/Anmol-TheDev/Music_app/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Anmol-TheDev/Music_app?style=social)](https://github.com/Anmol-TheDev/Music_app/network/members)

[Back to Top](#music-app)

</div>