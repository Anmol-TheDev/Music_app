# Music App

![image](https://github.com/user-attachments/assets/4f6d2d67-ca6f-4d53-9331-2c511ef44d8e)
![image](https://github.com/user-attachments/assets/77b41f3b-c0f1-4608-99d2-d49b176c231d)
![image](https://github.com/user-attachments/assets/451b4b45-47a7-466e-9792-f9056c12f990)
![image](https://github.com/user-attachments/assets/99db05d9-274c-4034-8304-2714d8efc000)

A modern music application built with React, Vite, and Tailwind CSS. This project is open source and we welcome contributions from the community.

## Features

- **Browse and play music:** Search for your favorite songs, artists, and albums.
- **Create and manage playlists:** Organize your music into custom playlists.
- **User authentication:** Sign up and log in to save your playlists and preferences.
- **Responsive design:** Enjoy a seamless experience on both desktop and mobile devices.
- **Keyword Shortcuts:** Shortcuts to next, previous,pause,stop,shuffle,mute .

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v14 or later)
- pnpm

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/Anmol-TheDev/Music_app
   ```
2. Install NPM packages
   ```sh
   pnpm install
   ```

### Configuration

1. Create a `.env` file in the root of the project.
2. Copy the contents of `.env.example` to your new `.env` file.
   ```sh
   cp .env.example .env
   ```
3. Update the `.env` file with your Firebase project credentials.

4. Start the development server
   ```sh
   pnpm run dev
   ```

## TypeScript Migration

This project has been migrated to TypeScript with Vite.

- File naming: use `.ts` for non-React modules, `.tsx` for React components.
- Path alias: import via `@/` for anything under `src`.
- Strict mode: enabled; add explicit types for props, hooks, and utilities.

### Adding New Components

Create components with `.tsx` and define props via interfaces:

```tsx
type MyComponentProps = { title: string; count?: number };
export function MyComponent({ title, count = 0 }: MyComponentProps) {
  return (
    <h2>
      {title} ({count})
    </h2>
  );
}
```

### Linting & Formatting

ESLint is configured for TypeScript using `@typescript-eslint` and React hooks rules. Prettier formats `ts/tsx` via lint-staged.

### Build Tooling

Vite is configured to resolve `@` to `src`. TypeScript config lives in `tsconfig.json` and `tsconfig.app.json`.

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.
