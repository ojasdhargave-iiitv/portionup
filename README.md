# PortionUp

PortionUp is a comprehensive application designed for food detection and portion tracking. It features a robust backend, an interactive frontend, and dedicated food detection machine learning components.

## Features
- **Food Detection**: Identify food items using AI models.
- **Frontend**: A user-friendly interface to track and manage meals.
- **Backend**: Secure, scalable API to serve the web/mobile app.

## Project Structure
- `/frontend`: Contains the user interface source code (e.g. React/React Native apps).
- `/backend`: The Node.js application powering the core logic, relying on Express/Mongoose.
- `/foodDetection`: Python-based components for food identification and data processing.

## Installation & Setup

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   cd ../foodDetection && pip install -r requirements.txt
   ```
3. Set up environment variables locally for both frontend and backend by creating `.env` files.

## License
This project is licensed under the MIT License - see the `LICENSE` file for details.

## Code of Conduct
Please review our `CODE_OF_CONDUCT.md` to ensure a welcoming and safe environment for all contributors.

## Security
Reporting security vulnerabilities and our policies are documented in `SECURITY.md`.
