# ReapplyMe - AI-Powered Job Application Platform

ReapplyMe is a modern web application designed to streamline the job application process by providing intelligent tools for managing job applications, generating personalized emails, and tracking career progress.

## Features

### 1. Email Template Generator
- Multiple professional email templates for different scenarios
- Dynamic template customization
- Smart variable substitution
- Templates for:
  - Introduction
  - Follow-up
  - Thank You
  - Networking
  - Standard Application
  - Event Follow-up
  - Casual Inquiry
  - Problem Solver
  - And more!

### 2. Profile Management
- Comprehensive user profile system
- Skills and experience tracking
- Education history
- Professional achievements

### 3. Job Search and Tracking
- Organized job application management
- Application status tracking
- Company information storage
- Interview scheduling

## Tech Stack

- Frontend: React + Vite
- UI Framework: Tailwind CSS
- Backend: Supabase
- AI Integration: Google Gemini
- Email Service: SendGrid

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ReapplyMe.git
cd ReapplyMe
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
- Copy `.env.example` to `.env`
- Fill in your API keys and credentials:
  ```
  VITE_SUPABASE_URL=Your_Supabase_URL
  VITE_SUPABASE_ANON_KEY=Your_Supabase_Anonymous_Key
  VITE_GEMINI_API_KEY=Your_Gemini_API_Key
  VITE_SENDGRID_API_KEY=Your_Sendgrid_API_Key
  ```

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

### Setting up Supabase

1. Create a new project on [Supabase](https://supabase.com)
2. Set up the following tables:
   - profiles
   - applications
   - companies
3. Copy your project URL and anon key to your `.env` file

## Development

### Project Structure

```
ReapplyMe/
├── src/
│   ├── components/     # React components
│   ├── data/           # Static data and templates
│   ├── lib/            # Utility functions and API clients
│   ├── pages/          # Page components
│   └── styles/         # CSS and Tailwind styles
├── public/             # Static assets
└── ...config files
```

### Key Components

- `EmailTemplate.jsx`: Email template generator
- `Dashboard.jsx`: User dashboard and profile management
- `JobSearch.jsx`: Job search and tracking interface
- `Profile.jsx`: User profile management
- `ApplicationTracker.jsx`: Application tracking and status
- `Login.jsx`: User login and authentication
- `Home.jsx`: Home page with introduction and features

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Security

- Never commit sensitive information or API keys
- Always use environment variables for secrets
- Keep dependencies updated
- Follow security best practices

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.

---

Built with ❤️ using React + Vite
