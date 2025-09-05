# JobPulse - Modern Job Board Platform

A complete, fully functional job board web application built with Next.js, Express.js, MongoDB, and Tailwind CSS. Features a modern black and orange theme with comprehensive job search, application management, and user role-based access control.

## 🚀 Features

### For Job Seekers
- **Advanced Job Search**: Search by title, location, company, and job type
- **Easy Application Process**: One-click applications with resume upload
- **Profile Management**: Complete profile with education, experience, and skills
- **Application Tracking**: Monitor application status and history
- **Resume Upload**: Upload and manage resumes

### For Employers
- **Job Posting**: Create and manage job listings
- **Applicant Management**: View and manage applications
- **Company Profile**: Manage company information and branding
- **Application Review**: Review applications with detailed candidate profiles

### For Admins
- **User Management**: Manage all users and employers
- **Job Moderation**: Review and manage job postings
- **Analytics Dashboard**: View platform statistics and insights
- **System Administration**: Full platform control

### Platform Features
- **Modern UI/UX**: Responsive design with dark/light mode
- **Real-time Notifications**: Email notifications for applications
- **Advanced Filtering**: Multiple filter options for job search
- **Pagination**: Efficient data loading
- **Security**: JWT authentication, password hashing, rate limiting
- **File Upload**: Resume and company logo upload support

## 🛠️ Tech Stack

### Frontend
- **Next.js 14**: React framework with SSR
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library
- **React Hook Form**: Form handling
- **React Query**: Data fetching and caching
- **React Icons**: Icon library

### Backend
- **Express.js**: Node.js web framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB ODM
- **JWT**: Authentication
- **Bcrypt**: Password hashing
- **Nodemailer**: Email sending
- **Multer**: File upload handling

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Nodemon**: Development server
- **Concurrently**: Run multiple commands

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd jobpulse
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Setup

#### Backend Environment
Create `backend/.env` file:
```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/jobpulse

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Application Configuration
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
PORT=5000

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend Environment
Create `frontend/.env.local` file:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

### 4. Database Setup
1. Start MongoDB service
2. The application will automatically create collections on first run

### 5. Start Development Servers

#### Option 1: Run Both Servers (Recommended)
```bash
# From root directory
npm run dev
```

#### Option 2: Run Separately
```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd frontend
npm run dev
```

### 6. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 📁 Project Structure

```
jobpulse/
├── backend/                 # Express.js API server
│   ├── controllers/        # Route controllers
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── config/           # Configuration files
│   └── uploads/          # File uploads
├── frontend/              # Next.js frontend
│   ├── components/        # React components
│   ├── contexts/          # React contexts
│   ├── pages/            # Next.js pages
│   ├── styles/           # CSS styles
│   └── utils/            # Utility functions
├── package.json           # Root package.json
└── README.md             # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register-user` - Register job seeker
- `POST /api/auth/register-employer` - Register employer
- `POST /api/auth/login-user` - Login job seeker
- `POST /api/auth/login-employer` - Login employer
- `POST /api/auth/login-admin` - Login admin
- `POST /api/auth/verify-email` - Verify email
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password

### Jobs
- `GET /api/jobs` - Get all jobs with filters
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs` - Create job (employer/admin)
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job
- `GET /api/jobs/featured` - Get featured jobs
- `GET /api/jobs/search` - Search jobs

### Applications
- `POST /api/applications` - Submit application
- `GET /api/applications/user` - Get user applications
- `GET /api/applications/job/:jobId` - Get job applications
- `PUT /api/applications/:id/status` - Update application status

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/upload-resume` - Upload resume
- `GET /api/users/applications` - Get user applications

### Admin
- `GET /api/admin/dashboard` - Admin dashboard stats
- `GET /api/admin/users` - Get all users
- `GET /api/admin/employers` - Get all employers
- `GET /api/admin/jobs` - Get all jobs
- `GET /api/admin/applications` - Get all applications

## 🎨 Customization

### Theme Colors
The application uses a black and orange theme. To customize colors, edit:
- `frontend/tailwind.config.js` - Color palette
- `frontend/styles/globals.css` - Custom CSS classes

### Styling
- All styling is done with Tailwind CSS
- Custom components are defined in `globals.css`
- Responsive design is built-in
- Dark mode support included

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB (Atlas recommended for production)
2. Configure environment variables
3. Deploy to platforms like:
   - Heroku
   - DigitalOcean
   - AWS
   - Vercel (serverless)

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy to platforms like:
   - Vercel (recommended for Next.js)
   - Netlify
   - AWS S3 + CloudFront

### Environment Variables for Production
```env
# Production settings
NODE_ENV=production
MONGO_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
FRONTEND_URL=https://your-domain.com
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for password security
- **Rate Limiting**: Prevent abuse
- **Input Validation**: Server-side validation
- **CORS Configuration**: Secure cross-origin requests
- **Helmet**: Security headers
- **File Upload Security**: Type and size validation

## 📧 Email Configuration

The application uses Nodemailer for email notifications. Configure your email service:

### Gmail Example
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Other Providers
- SendGrid
- Mailgun
- AWS SES
- SMTP servers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🎯 Roadmap

- [ ] Real-time chat between employers and candidates
- [ ] Advanced analytics dashboard
- [ ] Mobile app development
- [ ] AI-powered job matching
- [ ] Video interview integration
- [ ] Background check integration
- [ ] Multi-language support
- [ ] Advanced reporting features

---
