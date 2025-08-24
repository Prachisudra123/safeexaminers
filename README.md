# Safe Examiner - Online Examination System with Admin Monitoring

A comprehensive online examination platform with real-time student monitoring capabilities for administrators.

## Features

### Student Features
- Secure login system with real-time admin visibility
- Interactive exam interface with real-time progress tracking
- Real-time camera monitoring
- Question bank with multiple categories (70 questions)
- **Real-time Exam Progress**: Track questions answered, skipped, and attempted
- **Category-based Performance**: See performance breakdown by subject area
- **Time Tracking**: Monitor time spent on each question and total exam time
- **Skip Questions**: Ability to skip questions and mark for review
- Automatic submission and scoring with detailed analytics

### Admin Features
- **Live Student Monitoring**: View all students who login in real-time
- **Real-time Student Tracking**: See actual student logins, not mock data
- **Last Student Alert**: Get notified when new students login with a prominent alert
- **Audio Monitoring**: Hear what students are speaking during exams
- **Real-time Audio Listening**: Listen to individual student audio streams in real-time
- **Activity Detection**: Get notified when students:
  - Login/logout
  - Switch tabs
  - Turn off camera
  - Turn off microphone
  - Start/stop speaking
  - Disconnect from exam
- **Recording System**: Record live exam sessions with video and audio
- **Warning System**: Send warnings to students for violations
- **Download Recordings**: Save and download exam recordings for review
- **Live Statistics**: Real-time counts of total students, online students, students in exam, and warnings

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Modern web browser with camera and microphone support
- HTTPS connection (required for camera/microphone access)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd safeeexaminnner
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### Student Login
1. Navigate to the student login page
2. Enter your enrollment number, full name, and password
3. Click "Sign In" to access the exam dashboard
4. **Note**: Your login will immediately appear on the admin dashboard

### Admin Access
1. Click "Access Admin Panel" on the student login page
2. Enter your administrator credentials
3. Click "Access Admin Panel" to enter the monitoring dashboard
4. **Note**: You'll see real students as they login, not mock data

## Admin Dashboard Features

### Real-time Statistics
- **Total Students**: Count of all students who have logged in
- **Online Students**: Currently active students
- **Students in Exam**: Students currently taking exams
- **Warnings**: Total students with violations

### Last Student Alert
- **Prominent Notification**: Blue alert banner shows when new students login
- **Student Details**: Displays name, enrollment number, and login time
- **Dismissible**: Click × to close the alert
- **Real-time Updates**: Appears immediately when students login

### Student List
- View all students who login in real-time
- See connection quality indicators
- Monitor camera and microphone status
- Track warning counts
- View login times and exam status

### Live Monitoring
- Select any student to monitor individually
- View real-time status updates
- Monitor audio levels
- Check current tab activity
- Track exam duration and login time

### Audio Listening System
- **Listen Button**: Blue button to start listening to student audio
- **Real-time Audio**: Hear what students are speaking during exams
- **Stop Button**: Red button to stop listening
- **Audio Quality**: High-quality audio with noise suppression disabled
- **Activity Logging**: All listening sessions are logged for audit

### Recording System
- Start/stop recording for any student
- Record both video and audio
- Download recordings for offline review
- Store recordings locally (demo mode)

### Activity Tracking
- Real-time activity feed including logins/logouts
- Severity-based notifications
- Browser notifications for high-priority events
- Activity history and timestamps

### Warning System
- Send warnings to students
- Track warning counts
- Monitor student behavior patterns

## How It Works

### Student Login Flow
1. Student enters credentials and clicks "Sign In"
2. Student is automatically added to the monitoring service
3. Admin dashboard immediately shows the new student
4. All student activities are tracked in real-time

### Exam Flow
1. **Start Exam**: Student begins exam with 3-hour timer
2. **Real-time Tracking**: Every answer, skip, and review mark is tracked
3. **Progress Monitoring**: Student sees live progress with question navigator
4. **Category Tracking**: Questions are categorized by subject area
5. **Submit Exam**: Final submission with comprehensive analytics

### Real-time Updates
- Students appear on admin dashboard as soon as they login
- All activities (tab switching, camera changes, etc.) are logged
- Admin receives instant notifications for suspicious activities
- Student status updates in real-time
- Exam progress tracked in real-time with detailed analytics

### Monitoring Integration
- **LoginPage.tsx**: Integrates with StudentMonitoringService
- **ExamPage.tsx**: Integrates with ExamService for real-time tracking
- **StudentMonitoringService.ts**: Tracks all student activities
- **ExamService.ts**: Tracks exam progress, answers, and performance
- **AdminPage.tsx**: Displays real-time student data
- **SubmittedPage.tsx**: Shows comprehensive exam results with real data
- **App.tsx**: Manages student lifecycle (login/logout/exam)

## Technical Details

### Monitoring Technologies
- **WebRTC**: For camera and microphone access
- **MediaRecorder API**: For recording exam sessions
- **AudioContext API**: For real-time audio analysis
- **Visibility API**: For tab switching detection
- **Browser Notifications**: For real-time alerts
- **Real-time Service**: Custom monitoring service for student tracking

### Security Features
- Camera and microphone permission management
- Secure media stream handling
- Local storage for recordings (demo mode)
- Permission-based access control
- Real-time student activity logging

### Browser Compatibility
- Chrome/Edge (recommended)
- Firefox
- Safari (limited support)

## File Structure

```
src/
├── components/
│   ├── AdminPage.tsx          # Main admin dashboard with real-time data
│   ├── AdminLogin.tsx         # Admin authentication
│   ├── LoginPage.tsx          # Student login (integrated with monitoring)
│   ├── Dashboard.tsx          # Student dashboard
│   ├── ExamPage.tsx           # Exam interface
│   ├── SubmittedPage.tsx      # Exam completion
│   └── CameraFeed.tsx         # Camera monitoring
├── services/
│   └── StudentMonitoringService.ts  # Real-time monitoring logic
├── data/
│   └── questions.ts           # Question bank
├── App.tsx                    # Main application with student lifecycle
└── main.tsx                   # Entry point
```

## Configuration

### Admin Credentials
Update the admin credentials in `src/components/AdminLogin.tsx`:
```typescript
if (formData.username === 'admin' && formData.password === 'admin123456') {
  // Change these credentials for production
}
```

### Monitoring Settings
Adjust monitoring parameters in `src/services/StudentMonitoringService.ts`:
```typescript
// Audio threshold for speaking detection
if (student && average > 30) { // Adjust this value

// Monitoring interval (in milliseconds)
this.monitoringInterval = setInterval(() => {
  // Currently set to 3000ms (3 seconds)
}, 3000);
```

## SubmittedPage Features

### Real-time Exam Data
- **Exact Question Counts**: Shows actual questions attempted, answered, and skipped
- **Category Breakdown**: Performance analysis by subject area (Data Structures, Algorithms, OOP, etc.)
- **Time Analytics**: Detailed time tracking for each question and total exam duration
- **Progress Visualization**: Visual progress bars and completion rates
- **Performance Metrics**: Answer success rate and overall completion percentage

### Question Summary Dashboard
- **Total Questions**: 70 questions from Computer Science Engineering
- **Questions Answered**: Count of questions with selected answers
- **Questions Skipped**: Count of questions marked as skipped
- **Questions Attempted**: Total questions interacted with (answered + skipped)
- **Completion Rate**: Percentage of total questions attempted
- **Answer Success Rate**: Percentage of attempted questions that were answered

### Category Performance Analysis
- **Subject-wise Breakdown**: Performance by 12 different subject categories
- **Attempted vs Answered**: Shows how many questions were attempted vs. actually answered per category
- **Progress Bars**: Visual representation of performance in each category
- **Sorted Display**: Categories sorted by most attempted questions

### Enhanced Security Verification
- **Camera Monitoring**: Confirms successful camera monitoring throughout exam
- **Face Detection**: Verifies face detection was active
- **Activity Logging**: Confirms no suspicious activity detected
- **Response Recording**: All answers recorded securely
- **Session Termination**: Exam session properly closed and recorded

### Real-time Data Integration
- **ExamService Integration**: Pulls real data from exam tracking service
- **Live Progress Tracking**: Shows actual student performance, not mock data
- **Time Calculations**: Real exam duration and time spent per question
- **Dynamic Updates**: All metrics update based on actual exam performance

## Production Considerations

### Security
- Implement proper server-side authentication
- Use secure WebSocket connections for real-time updates
- Store recordings on secure servers
- Implement proper user role management
- Add rate limiting for login attempts

### Performance
- Optimize video recording quality
- Implement proper cleanup for media streams
- Add connection pooling for multiple students
- Implement proper error handling and recovery
- Add pagination for large numbers of students

### Scalability
- Use WebRTC servers for large-scale deployments
- Implement proper load balancing
- Add database storage for recordings and logs
- Implement proper session management
- Add clustering for multiple admin instances

## Troubleshooting

### Camera/Microphone Issues
- Ensure HTTPS connection
- Check browser permissions
- Clear browser cache and cookies
- Try different browser

### Recording Issues
- Check available disk space
- Ensure proper codec support
- Check browser compatibility
- Verify media permissions

### Performance Issues
- Reduce monitoring frequency
- Lower video quality settings
- Close unnecessary browser tabs
- Check system resources

### Student Not Appearing
- Check browser console for errors
- Verify student login was successful
- Check monitoring service integration
- Refresh admin dashboard

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review browser compatibility requirements

---

**Note**: This is a demo application. For production use, implement proper security measures, server-side validation, and secure storage solutions.
