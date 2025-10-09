# Contributing to Music App 🎵

Thank you for your interest in contributing to **Music App**! This guide will help you set up the project, follow our conventions, and submit high-quality contributions.

## Table of Contents

- [ How to Contribute](#how-to-contribute)
- [ Branch Naming Conventions](#branch-naming-conventions)
- [ Commit Message Format](#commit-message-format)
- [ Submitting Pull Requests](#submitting-pull-requests)
- [ Reporting Issues](#reporting-issues)
- [ Code Style, Docs & Testing](#code-style-docs--testing)
- [ General Guidelines](#general-guidelines)
- [ Communication](#communication)

##  How to Contribute

1. **Follow the setup guide**  
   Before you start, please follow the [Project Setup Guide](SETUP.md) for detailed instructions on getting your local environment ready.

2. **Fork the repository**  
   Click the **Fork** button at the top of this repository.

3. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Music_app.git
   cd Music_app
   ```

4. **Install dependencies**
   ```bash
   pnpm install
   ```

5. **Configure environment variables**
   - Copy the example file:
     ```bash
     cp .env.example .env
     ```
   - Update `.env` with your **Firebase project credentials**.

6. **Run the development server**
   ```bash
   pnpm run dev
   ```

##  Branch Naming Conventions

Use descriptive branch names for clarity:

- `feature/<feature-name>` → new features
- `fix/<bug-name>` → bug fixes
- `docs/<update>` → documentation updates
- `chore/<task>` → configs or maintenance

**Examples:**
```
feature/playlist-management
fix/auth-token-refresh
docs/update-readme
```

##  Commit Message Format

Follow the **Conventional Commits** style:

```
<type>: <short description>
```

**Allowed types:**

- `feat:` → new feature
- `fix:` → bug fix
- `docs:` → documentation change
- `style:` → formatting (no logic changes)
- `refactor:` → code restructuring (no features/bugs)
- `test:` → add/modify tests
- `chore:` → tooling/config changes

 **Examples:**
```
feat: add playlist creation page
fix: resolve audio playback bug on mobile
docs: update contributing guidelines
```

##  Submitting Pull Requests

1. Ensure your branch is **up to date** with `main`.

2. Push your changes:
   ```bash
   git push origin your-branch-name
   ```

3. Open a **Pull Request** on GitHub.

4. Include in the PR description:
   - What the change does and why
   - Screenshots, GIFs, or a short video if UI-related
   - Giving a demo is necessary for every PR raised.

5. Keep PRs small and focused for easier review.

##  Reporting Issues

When opening an issue, please:

- Check for existing issues first.
- Provide a **clear description** of the problem.
- Include **steps to reproduce**, expected vs actual behavior.
- Add screenshots/logs if helpful.
- Tag appropriately (`bug`, `enhancement`, `question`).

##  Code Style, Docs & Testing

- **Frontend:** React + Vite + Tailwind CSS
- **State Management:** React hooks/context (or Zustand if added later)
- **Linting/Formatting:** Prettier + ESLint

**Before committing:**
```bash
pnpm run lint
pnpm run format
```

##  General Guidelines

- Keep components small and reusable.
- Follow **Tailwind CSS best practices** for styling.
- Document complex logic with comments.
- Update **README.md** or inline docs if adding new features.
- Make sure UI is responsive and accessible.

## Tech Stack

Our music app is built using modern web technologies to ensure optimal performance and user experience:

### Frontend
- **[React 19.0.0](https://reactjs.org/)** - Latest React with concurrent features
- **[Vite 6.3.6](https://vitejs.dev/)** - Lightning-fast build tool and dev server
- **[Tailwind CSS 3.4.17](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Unstyled, accessible UI components

### State Management & Routing
- **[Zustand 5.0.2](https://github.com/pmndrs/zustand)** - Lightweight state management
- **[React Router DOM 7.1.1](https://reactrouter.com/)** - Declarative routing

### Authentication & Backend
- **[Firebase 11.10.0](https://firebase.google.com/)** - Authentication and real-time database
- **[Saavn.dev API](https://saavn.dev)** - Music streaming API

### Audio & Visualization
- **[React Player 2.16.0](https://github.com/cookpete/react-player)** - Media player component
- **[React Audio Visualize 1.2.0](https://github.com/bouzidanas/react-audio-visualize)** - Audio visualization

### Development Tools
- **[ESLint 9.17.0](https://eslint.org/)** - Code linting and formatting
- **[Prettier 3.6.2](https://prettier.io/)** - Code formatter
- **[Husky 9.1.7](https://typicode.github.io/husky/)** - Git hooks

##  Communication

- Use GitHub Issues for discussions before starting large changes.
- Be clear, respectful, and collaborative in reviews.
- Remember: contributors may have different levels of experience.

---

✨ **Thanks for helping make Music App better!**  
Whether it's a small bug fix or a big new feature, your contributions are valued. 
