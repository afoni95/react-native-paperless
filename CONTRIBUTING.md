# Contributing to React Native Paperless

Thank you for your interest in contributing! This guide will help you get started.

## Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/afoni95/react-native-paperless.git
cd react-native-paperless

# Install dependencies
npm install
```

### 2. Create a Branch

```bash
# Create a new branch for your feature or fix
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 3. Make Changes

Make your changes to the codebase. Ensure you follow the existing code style and conventions.

### 4. Run Checks

Before committing, run the following checks to ensure code quality:

```bash
# Run linter
npm run lint

# Run linter with auto fix
npm run lint:fix

# Type check
npm run ci:typecheck

# Check unused i18n translations
npm run ci:i18n
```

All checks should pass before submitting a pull request.

### 5. Test Your Changes

```bash
# Start Metro bundler
npm run start

# Run on Android to test
npm run android

# Clean and rebuild if needed
npm run android:clean
```

### 6. Commit and Push

```bash
# Stage your changes
git add .

# Commit with a descriptive message
git commit -m "feat: add new feature" 
# or "fix: resolve issue with..."

# Push to your fork
git push origin feature/your-feature-name
```

### 7. Create Pull Request

Open a pull request on GitHub targeting the `staging` branch with a clear description of your changes.

## Commit Message Convention

Use conventional commit messages:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

## Code Style

- Follow TypeScript best practices
- Use existing ESLint configuration
- Write clear, self-documenting code
- Add comments for complex logic

## Questions?

If you have questions or need help, feel free to [open an issue](https://github.com/afoni95/react-native-paperless/issues).
