# 🚀 MongoDB Setup Guide for Safe Examiner

This guide will help you set up MongoDB for your Safe Examiner project.

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB installed locally or MongoDB Atlas account

## 🛠️ Installation Steps

### 1. Install Dependencies

```bash
npm install mongodb mongoose dotenv bcryptjs @types/bcryptjs
```

### 2. MongoDB Installation Options

#### Option A: Local MongoDB Installation

**Windows:**
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Install with default settings
3. MongoDB will run as a Windows service automatically

**macOS:**
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

**Linux (Ubuntu):**
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### Option B: MongoDB Atlas (Cloud)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster
4. Get your connection string
5. Update `.env` file with your Atlas connection string

### 3. Environment Configuration

Create a `.env` file in your project root:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/safe_examiner

# Alternative: MongoDB Atlas (Cloud)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/safe_examiner

# Environment
NODE_ENV=development

# Server Configuration
PORT=3000

# Security
JWT_SECRET=your-super-secret-jwt-key-here
BCRYPT_ROUNDS=10

# File Upload
MAX_FILE_SIZE=100MB
UPLOAD_PATH=./uploads

# Logging
LOG_LEVEL=info
```

### 4. Database Initialization

Run the database initialization script to create sample data:

```bash
# Compile TypeScript first
npx tsc src/scripts/initDB.ts --outDir dist --target es2020 --module commonjs

# Run the script
node dist/scripts/initDB.js
```

Or run directly with ts-node:

```bash
npx ts-node src/scripts/initDB.ts
```

## 🗄️ Database Schema

### Collections Created:

1. **students** - Student profiles and authentication
2. **exams** - Exam sessions and results
3. **student_activities** - Real-time activity logging
4. **recordings** - Exam video/audio metadata

### Sample Data:

- 3 sample students with credentials
- 2 completed exams with sample answers
- 3 login activities
- 2 sample recordings

## 🔧 Configuration

### Connection Settings

The database connection is configured in `src/config/database.ts`:

```typescript
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/safe_examiner';
```

### Database Options

- **Database Name**: `safe_examiner`
- **Port**: `27017` (default)
- **Authentication**: None for local development
- **SSL**: Required for MongoDB Atlas

## 🚦 Usage

### 1. Start MongoDB Service

**Local Installation:**
```bash
# Windows (automatic with installation)
# macOS
brew services start mongodb/brew/mongodb-community

# Linux
sudo systemctl start mongod
```

### 2. Verify Connection

Check if MongoDB is running:

```bash
# Connect to MongoDB shell
mongosh

# Or check status
# Windows: Check Services app
# macOS: brew services list
# Linux: sudo systemctl status mongod
```

### 3. Run Your Application

```bash
npm run dev
# or
npm start
```

## 📊 MongoDB Compass (GUI)

For better database management, install MongoDB Compass:

1. Download from [mongodb.com/try/download/compass](https://www.mongodb.com/try/download/compass)
2. Install and connect to your database
3. Browse collections, documents, and run queries

## 🔍 Database Queries

### View All Students
```javascript
db.students.find().pretty()
```

### View Completed Exams
```javascript
db.exams.find({status: "completed"}).pretty()
```

### View Recent Activities
```javascript
db.student_activities.find().sort({timestamp: -1}).limit(10).pretty()
```

### View Recordings
```javascript
db.recordings.find({status: {$ne: "deleted"}}).pretty()
```

## 🚨 Troubleshooting

### Common Issues:

1. **Connection Refused**
   - Check if MongoDB service is running
   - Verify port 27017 is not blocked
   - Check firewall settings

2. **Authentication Failed**
   - Verify connection string format
   - Check username/password for Atlas
   - Ensure database user has proper permissions

3. **Port Already in Use**
   - Check if another MongoDB instance is running
   - Change port in configuration
   - Kill existing processes

### Debug Mode:

Enable debug logging by setting environment variable:

```bash
DEBUG=mongoose:* npm start
```

## 📈 Performance Tips

1. **Indexes**: Already configured for common queries
2. **Connection Pooling**: Configured for optimal performance
3. **Data Validation**: Schema validation enabled
4. **Error Handling**: Comprehensive error handling implemented

## 🔐 Security Considerations

1. **Password Hashing**: Using bcrypt with 10 salt rounds
2. **Input Validation**: Mongoose schema validation
3. **Connection Security**: Environment variable configuration
4. **Data Sanitization**: Automatic sanitization of user inputs

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Atlas](https://www.mongodb.com/atlas)
- [MongoDB Compass](https://www.mongodb.com/try/download/compass)

## 🎯 Next Steps

After setting up MongoDB:

1. Test the connection
2. Run the initialization script
3. Verify sample data creation
4. Start your application
5. Test student login and admin features

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section
2. Verify MongoDB service status
3. Check connection string format
4. Review error logs
5. Ensure all dependencies are installed

---

**Happy Coding! 🚀**
