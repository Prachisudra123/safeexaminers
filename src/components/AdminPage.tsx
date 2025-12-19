import React, { useState, useEffect, useRef } from 'react';
import { Users, Mic, MicOff, Camera, CameraOff, Download, AlertTriangle, Eye, Volume2, VolumeX, Bell, Wifi, WifiOff, Clock, UserCheck, Headphones, X, BookOpen, Trophy, Activity } from 'lucide-react';
import { studentMonitoringService, StudentStatus, StudentActivity } from '../services/StudentMonitoringService';
import { examService } from '../services/ExamService';

interface AdminPageProps {
  onLogout: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ onLogout }) => {
  const [students, setStudents] = useState<StudentStatus[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentStatus | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState<{ 
    id: string; 
    studentId: string; 
    timestamp: Date; 
    duration: number;
    blob: Blob | string;
    studentName: string;
    enrollmentNo: string;
  }[]>([]);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isListeningToStudent, setIsListeningToStudent] = useState(false);
  const [recentActivities, setRecentActivities] = useState<StudentActivity[]>([]);
  const [showNotifications, setShowNotifications] = useState(true);
  const [lastStudentAppeared, setLastStudentAppeared] = useState<StudentStatus | null>(null);
  const [selectedStudentActivities, setSelectedStudentActivities] = useState<StudentActivity[]>([]);
  const [liveStreams, setLiveStreams] = useState<{ [studentId: string]: MediaStream }>({});
  const [isViewingLive, setIsViewingLive] = useState<{ [studentId: string]: boolean }>({});
  const [snapshots, setSnapshots] = useState<{ 
    id: string; 
    studentId: string; 
    timestamp: Date; 
    imageUrl: string; 
    studentName: string; 
    enrollmentNo: string;
  }[]>([]);
  const [examHistory, setExamHistory] = useState<{ 
    studentId: string; 
    examDate: Date; 
    score: number; 
    duration: number; 
    questionsAnswered: number; 
    totalQuestions: number;
    studentName: string;
    enrollmentNo: string;
  }[]>([]);
  const [activeExams, setActiveExams] = useState<{ 
    studentId: string; 
    startTime: Date; 
    currentQuestion: number; 
    timeRemaining: number;
    studentName: string;
    enrollmentNo: string;
  }[]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingStartTime = useRef<number>(0);
  const studentAudioRef = useRef<HTMLAudioElement | null>(null);
  const studentStreamRef = useRef<MediaStream | null>(null);
  const videoRefs = useRef<{ [studentId: string]: HTMLVideoElement | null }>({});
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Subscribe to monitoring service updates
  useEffect(() => {
    const unsubscribeStatus = studentMonitoringService.onStatusUpdate((statuses) => {
      setStudents(statuses);
      
      // Track the last student who appeared
      if (statuses.length > 0) {
        const latestStudent = statuses[statuses.length - 1];
        if (latestStudent && (!lastStudentAppeared || latestStudent.id !== lastStudentAppeared.id)) {
          setLastStudentAppeared(latestStudent);
        }
      }
    });

    const unsubscribeActivity = studentMonitoringService.onActivity((activity) => {
      setRecentActivities(prev => [activity, ...prev.slice(0, 19)]); // Keep last 20 activities
      
      // Add to selected student activities if it matches
      if (selectedStudent && activity.studentId === selectedStudent.id) {
        setSelectedStudentActivities(prev => [activity, ...prev.slice(0, 19)]);
      }
      
      // Show notification for high severity activities
      if (activity.severity === 'high' && showNotifications) {
        showBrowserNotification(activity);
      }
    });

    // Load existing recordings from localStorage
    const loadExistingRecordings = () => {
      try {
        const storedRecordings = JSON.parse(localStorage.getItem('examRecordings') || '[]');
        if (storedRecordings.length > 0) {
          // Convert stored recordings to the correct format
          const formattedRecordings = storedRecordings.map((recording: any) => ({
            id: recording.id,
            studentId: recording.studentId,
            timestamp: new Date(recording.timestamp),
            duration: recording.duration,
            blob: recording.blob, // This will be a string URL from localStorage
            studentName: recording.studentName || 'Unknown Student',
            enrollmentNo: recording.enrollmentNo || 'N/A'
          }));
          setRecordings(formattedRecordings);
        }
      } catch (error) {
        console.error('Error loading recordings from localStorage:', error);
      }
    };

    loadExistingRecordings();



    return () => {
      unsubscribeStatus();
      unsubscribeActivity();
    };
  }, [showNotifications, lastStudentAppeared, selectedStudent]);

  const showBrowserNotification = (activity: StudentActivity) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const student = students.find(s => s.id === activity.studentId);
      new Notification('Exam Alert', {
        body: `${student?.name || 'Student'}: ${activity.details}`,
        icon: '/vite.svg',
        tag: `activity-${activity.studentId}`
      });
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setShowNotifications(true);
      }
    }
  };

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Audio monitoring setup
  useEffect(() => {
    if (isAudioEnabled && selectedStudent) {
      startAudioMonitoring();
    } else {
      stopAudioMonitoring();
    }

    return () => stopAudioMonitoring();
  }, [isAudioEnabled, selectedStudent]);

  const startAudioMonitoring = async () => {
    if (!selectedStudent) return;
    
    try {
      const success = await studentMonitoringService.startAudioMonitoring(selectedStudent.id);
      if (success) {
        // Start audio level monitoring
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        
        microphone.connect(analyser);
        analyser.fftSize = 256;
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const updateAudioLevel = () => {
          if (analyser) {
            analyser.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b) / bufferLength;
            setAudioLevel(average);
          }
          requestAnimationFrame(updateAudioLevel);
        };
        
        updateAudioLevel();
      }
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopAudioMonitoring = () => {
    studentMonitoringService.stopAudioMonitoring();
    setAudioLevel(0);
  };

  // Function to listen to student's audio
  const startListeningToStudent = async () => {
    if (!selectedStudent) return;

    try {
      // Request access to student's microphone (this would be the student's actual audio in a real implementation)
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        } 
      });
      
      studentStreamRef.current = stream;
      
      // Create audio element to play student's audio
      if (studentAudioRef.current) {
        studentAudioRef.current.srcObject = stream;
        studentAudioRef.current.play();
        setIsListeningToStudent(true);
      }
      
      // Record activity
      studentMonitoringService.recordActivity(
        selectedStudent.id, 
        'speaking', 
        `Admin started listening to ${selectedStudent.name}`, 
        'low'
      );
      
    } catch (error) {
      console.error('Error listening to student audio:', error);
      alert('Unable to access student audio. Please ensure permissions are granted.');
    }
  };

  const stopListeningToStudent = () => {
    if (studentStreamRef.current) {
      studentStreamRef.current.getTracks().forEach(track => track.stop());
      studentStreamRef.current = null;
    }
    
    if (studentAudioRef.current) {
      studentAudioRef.current.pause();
      studentAudioRef.current.srcObject = null;
    }
    
    setIsListeningToStudent(false);
    
    // Record activity
    if (selectedStudent) {
      studentMonitoringService.recordActivity(
        selectedStudent.id, 
        'silent', 
        `Admin stopped listening to ${selectedStudent.name}`, 
        'low'
      );
    }
  };

  const startRecording = async () => {
    if (!selectedStudent) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 }, 
        audio: true 
      });
      
      // Try different MIME types for better compatibility
      let mimeType = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8,opus';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/mp4';
      }
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: mimeType,
        videoBitsPerSecond: 2500000, // 2.5 Mbps for good quality
        audioBitsPerSecond: 128000   // 128 kbps for audio
      });

      const chunks: Blob[] = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const recordingId = `recording_${Date.now()}`;
        const duration = Math.floor((Date.now() - recordingStartTime.current) / 1000);
        
        // Create recording object
        const newRecording = {
          id: recordingId,
          studentId: selectedStudent.id,
          timestamp: new Date(),
          duration: duration,
          blob: blob,
          studentName: selectedStudent.name,
          enrollmentNo: selectedStudent.enrollmentNo
        };
        
        setRecordings(prev => [...prev, newRecording]);

        // Store recording in localStorage for demo purposes
        const recordings = JSON.parse(localStorage.getItem('examRecordings') || '[]');
        recordings.push({
          ...newRecording,
          timestamp: newRecording.timestamp.toISOString(),
          blob: URL.createObjectURL(blob),
          studentName: selectedStudent.name,
          enrollmentNo: selectedStudent.enrollmentNo
        });
        localStorage.setItem('examRecordings', JSON.stringify(recordings));
        
        // Show success message
        alert(`Recording saved successfully! Duration: ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`);
      };

      mediaRecorderRef.current.start(1000); // Collect data every second
      setIsRecording(true);
      recordingStartTime.current = Date.now();
      
      // Record activity
      studentMonitoringService.recordActivity(
        selectedStudent.id,
        'camera_on',
        `Admin started recording ${selectedStudent.name}'s exam session`,
        'medium'
      );
      
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Unable to start recording. Please ensure camera and microphone permissions are granted.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const downloadRecording = (recordingId: string, quality: 'original' | 'compressed' = 'original') => {
    // First try to find in current recordings state
    let recording = recordings.find(r => r.id === recordingId);
    
    if (!recording) {
      // Fallback to localStorage
      const storedRecordings = JSON.parse(localStorage.getItem('examRecordings') || '[]');
      recording = storedRecordings.find((r: any) => r.id === recordingId);
    }
    
    if (recording) {
      try {
        // Create blob URL if needed
        let blobUrl: string;
        let fileName: string;
        
        if (recording.blob instanceof Blob) {
          blobUrl = URL.createObjectURL(recording.blob);
        } else {
          blobUrl = recording.blob; // It's already a string URL
        }
        
        // Generate filename based on quality
        const baseFileName = `exam_recording_${recording.studentName || recording.studentId}_${recording.timestamp.toLocaleDateString().replace(/\//g, '-')}_${recording.timestamp.toLocaleTimeString().replace(/:/g, '-')}`;
        
        if (quality === 'compressed') {
          fileName = `${baseFileName}_compressed.webm`;
        } else {
          fileName = `${baseFileName}_original.webm`;
        }
        
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up blob URL if we created one
        if (recording.blob instanceof Blob) {
          URL.revokeObjectURL(blobUrl);
        }
        
        // Record download activity with quality info
        if (selectedStudent) {
          studentMonitoringService.recordActivity(
            selectedStudent.id,
            'camera_on',
            `Admin downloaded ${quality} quality recording of ${recording.studentName || 'student'}'s exam session`,
            'low'
          );
        }
        
        // Show success message with quality info
        alert(`Recording downloaded successfully as ${quality} quality!`);
      } catch (error) {
        console.error('Error downloading recording:', error);
        alert('Error downloading recording. Please try again.');
      }
    } else {
      alert('Recording not found. It may have been removed.');
    }
  };

  const sendWarning = (studentId: string) => {
    studentMonitoringService.sendWarning(studentId);
  };

  const deleteRecording = (recordingId: string) => {
    if (window.confirm('Are you sure you want to delete this recording? This action cannot be undone.')) {
      // Remove from current state
      setRecordings(prev => prev.filter(r => r.id !== recordingId));
      
      // Remove from localStorage
      try {
        const storedRecordings = JSON.parse(localStorage.getItem('examRecordings') || '[]');
        const updatedRecordings = storedRecordings.filter((r: any) => r.id !== recordingId);
        localStorage.setItem('examRecordings', JSON.stringify(updatedRecordings));
        
        // Record activity
        if (selectedStudent) {
          studentMonitoringService.recordActivity(
            selectedStudent.id,
            'camera_off',
            `Admin deleted recording ${recordingId}`,
            'medium'
          );
        }
      } catch (error) {
        console.error('Error deleting recording from localStorage:', error);
      }
    }
  };



  const refreshMonitoringData = () => {
    // Force refresh of student data
    const currentStudents = studentMonitoringService.getAllStudentStatuses();
    setStudents(currentStudents);
    
    // Refresh activities
    setRecentActivities([]);
    
    // Show success message
    alert('Monitoring data refreshed successfully!');
  };

  const disconnectAllStudents = () => {
    if (window.confirm('Are you sure you want to disconnect all students? This will simulate a network issue.')) {
      students.forEach(student => {
        studentMonitoringService.disconnectStudent(student.id);
      });
      alert('All students have been disconnected.');
    }
  };

  const reconnectAllStudents = () => {
    students.forEach(student => {
      studentMonitoringService.reconnectStudent(student.id);
    });
    alert('All students have been reconnected.');
  };

  const getStatusColor = (student: StudentStatus) => {
    if (!student.isOnline) return 'text-red-500';
    if (student.warnings > 0) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusIcon = (student: StudentStatus) => {
    if (!student.isOnline) return <WifiOff className="h-4 w-4" />;
    if (student.warnings > 0) return <AlertTriangle className="h-4 w-4" />;
    return <Wifi className="h-4 w-4" />;
  };

  const getConnectionQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'poor': return 'text-yellow-500';
      case 'disconnected': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getConnectionQualityIcon = (quality: string) => {
    switch (quality) {
      case 'excellent': return <Wifi className="h-4 w-4" />;
      case 'good': return <Wifi className="h-4 w-4" />;
      case 'poor': return <Wifi className="h-4 w-4" />;
      case 'disconnected': return <WifiOff className="h-4 w-4" />;
      default: return <Wifi className="h-4 w-4" />;
    }
  };

  // Calculate statistics
  const totalStudents = students.length;
  const studentsInExam = students.filter(s => s.isInExam).length;
  const studentsOnline = students.filter(s => s.isOnline).length;
  const studentsWithWarnings = students.filter(s => s.warnings > 0).length;
  const totalExamsTaken = students.reduce((sum, s) => sum + s.totalExamsTaken, 0);
  const averageScore = students.length > 0 ? students.reduce((sum, s) => sum + s.averageScore, 0) / students.length : 0;

  // Format time
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  // Live streaming functions
  const startLiveView = async (studentId: string) => {
    try {
      // Request access to student's camera and microphone
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 }, 
        audio: true 
      });
      
      setLiveStreams(prev => ({ ...prev, [studentId]: stream }));
      setIsViewingLive(prev => ({ ...prev, [studentId]: true }));
      
      // Record activity
      studentMonitoringService.recordActivity(
        studentId,
        'camera_on',
        `Admin started live viewing ${students.find(s => s.id === studentId)?.name || 'student'}`,
        'medium'
      );
      
    } catch (error) {
      console.error('Error starting live view:', error);
      alert('Unable to start live view. Please ensure camera and microphone permissions are granted.');
    }
  };

  const stopLiveView = (studentId: string) => {
    const stream = liveStreams[studentId];
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setLiveStreams(prev => {
        const newStreams = { ...prev };
        delete newStreams[studentId];
        return newStreams;
      });
      setIsViewingLive(prev => ({ ...prev, [studentId]: false }));
      
      // Record activity
      studentMonitoringService.recordActivity(
        studentId,
        'camera_off',
        `Admin stopped live viewing ${students.find(s => s.id === studentId)?.name || 'student'}`,
        'medium'
      );
    }
  };

  const takeSnapshot = (studentId: string) => {
    const video = videoRefs.current[studentId];
    const canvas = canvasRef.current;
    
    if (video && canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        const imageUrl = canvas.toDataURL('image/png');
        const snapshotId = `snapshot_${Date.now()}`;
        const student = students.find(s => s.id === studentId);
        
        const newSnapshot = {
          id: snapshotId,
          studentId,
          timestamp: new Date(),
          imageUrl,
          studentName: student?.name || 'Unknown Student',
          enrollmentNo: student?.enrollmentNo || 'N/A'
        };
        
        setSnapshots(prev => [...prev, newSnapshot]);
        
        // Save to localStorage
        const storedSnapshots = JSON.parse(localStorage.getItem('examSnapshots') || '[]');
        storedSnapshots.push({
          ...newSnapshot,
          timestamp: newSnapshot.timestamp.toISOString()
        });
        localStorage.setItem('examSnapshots', JSON.stringify(storedSnapshots));
        
        // Record activity
        studentMonitoringService.recordActivity(
          studentId,
          'camera_on',
          `Admin took snapshot of ${student?.name || 'student'}`,
          'low'
        );
        
        alert('Snapshot captured successfully!');
      }
    }
  };

  const downloadSnapshot = (snapshotId: string) => {
    const snapshot = snapshots.find(s => s.id === snapshotId);
    if (snapshot) {
      const link = document.createElement('a');
      link.href = snapshot.imageUrl;
      link.download = `snapshot_${snapshot.studentName}_${snapshot.timestamp.toLocaleDateString().replace(/\//g, '-')}_${snapshot.timestamp.toLocaleTimeString().replace(/:/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const deleteSnapshot = (snapshotId: string) => {
    if (window.confirm('Are you sure you want to delete this snapshot?')) {
      setSnapshots(prev => prev.filter(s => s.id !== snapshotId));
      
      // Remove from localStorage
      const storedSnapshots = JSON.parse(localStorage.getItem('examSnapshots') || '[]');
      const updatedSnapshots = storedSnapshots.filter((s: any) => s.id !== snapshotId);
      localStorage.setItem('examSnapshots', JSON.stringify(updatedSnapshots));
    }
  };

  // Enhanced exam tracking functions
  const updateExamHistory = () => {
    const history = students
      .filter(s => s.examHistory.length > 0)
      .flatMap(s => s.examHistory.map(exam => ({
        studentId: s.id,
        examDate: exam.examDate,
        score: exam.score || 0,
        duration: exam.examDuration,
        questionsAnswered: exam.questionsAnswered,
        totalQuestions: exam.totalQuestions,
        studentName: s.name,
        enrollmentNo: s.enrollmentNo
      })))
      .sort((a, b) => b.examDate.getTime() - a.examDate.getTime());
    
    setExamHistory(history);
  };

  const updateActiveExams = () => {
    const active = students
      .filter(s => s.isInExam && s.examStartTime)
      .map(s => ({
        studentId: s.id,
        startTime: s.examStartTime!,
        currentQuestion: 1, // Default to 1 since it's not in StudentStatus
        timeRemaining: 0, // Default to 0 since it's not in StudentStatus
        studentName: s.name,
        enrollmentNo: s.enrollmentNo
      }));
    
    setActiveExams(active);
  };

  // Load snapshots from localStorage
  useEffect(() => {
    try {
      const storedSnapshots = JSON.parse(localStorage.getItem('examSnapshots') || '[]');
      if (storedSnapshots.length > 0) {
        const formattedSnapshots = storedSnapshots.map((snapshot: any) => ({
          ...snapshot,
          timestamp: new Date(snapshot.timestamp)
        }));
        setSnapshots(formattedSnapshots);
      }
    } catch (error) {
      console.error('Error loading snapshots from localStorage:', error);
    }
  }, []);

  // Update exam data when students change
  useEffect(() => {
    updateExamHistory();
    updateActiveExams();
  }, [students]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hidden audio element for student audio */}
      <audio ref={studentAudioRef} autoPlay muted={false} />
      
      {/* Hidden canvas for snapshots */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={refreshMonitoringData}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition duration-200 flex items-center space-x-2 text-sm"
                title="Refresh monitoring data"
              >
                <Activity className="h-4 w-4" />
                <span>Refresh</span>
              </button>

              <button
                onClick={disconnectAllStudents}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-lg transition duration-200 flex items-center space-x-2 text-sm"
                title="Simulate network disconnection for all students"
              >
                <WifiOff className="h-4 w-4" />
                <span>Disconnect All</span>
              </button>
              <button
                onClick={reconnectAllStudents}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition duration-200 flex items-center space-x-2 text-sm"
                title="Reconnect all students"
              >
                <Wifi className="h-4 w-4" />
                <span>Reconnect All</span>
              </button>
              <button
                onClick={() => {
                  // Export all student data
                  const exportData = {
                    timestamp: new Date().toISOString(),
                    totalStudents: students.length,
                    students: students.map(s => ({
                      name: s.name,
                      enrollmentNo: s.enrollmentNo,
                      totalExams: s.totalExamsTaken,
                      averageScore: s.averageScore,
                      lastExamScore: s.lastExamScore,
                      totalTimeSpent: s.totalTimeSpent,
                      activityCount: s.activityCount,
                      examHistory: s.examHistory
                    }))
                  };
                  
                  const dataStr = JSON.stringify(exportData, null, 2);
                  const dataBlob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(dataBlob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `student_data_export_${new Date().toISOString().split('T')[0]}.json`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg transition duration-200 flex items-center space-x-2 text-sm"
                title="Export all student data"
              >
                <Download className="h-4 w-4" />
                <span>Export Data</span>
              </button>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 rounded-lg transition duration-200 ${
                  showNotifications 
                    ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={showNotifications ? 'Disable Notifications' : 'Enable Notifications'}
              >
                <Bell className="h-5 w-5" />
              </button>
              <button
                onClick={onLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Recently Logged Students */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <UserCheck className="h-5 w-5 mr-2 text-blue-600" />
                Recently Logged Students
              </h3>
              <div className="text-sm text-gray-500">Showing latest logins</div>
            </div>
            {(() => {
              const recentStudents = [...students]
                .sort((a, b) => b.loginTime.getTime() - a.loginTime.getTime())
                .slice(0, 6);
              if (recentStudents.length === 0) {
                return (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No recent logins yet</p>
                    <p className="text-gray-400 text-xs mt-1">Newly logged students will appear here</p>
                  </div>
                );
              }
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentStudents.map((student) => {
                    const isLiveViewing = isViewingLive[student.id];
                    const progress = examService.getExamProgress(student.id);
                    return (
                      <div key={student.id} className="rounded-lg p-4 border bg-white hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">{student.name}</h4>
                            <p className="text-sm text-gray-500">{student.enrollmentNo}</p>
                            <p className="text-xs text-gray-400">Login: {student.loginTime.toLocaleTimeString()}</p>
                          </div>
                          <div className="text-right">
                            <div className={`text-xs font-medium ${getConnectionQualityColor(student.connectionQuality)}`}>{student.connectionQuality}</div>
                            {student.isInExam && (
                              <div className="text-[10px] text-purple-700 font-medium">In Exam</div>
                            )}
                          </div>
                        </div>

                        {/* Live video preview */}
                        <div className={`relative mb-3 rounded overflow-hidden border ${isLiveViewing ? 'border-green-300' : 'border-gray-200'}`}>
                          {isLiveViewing ? (
                            <video
                              ref={(el) => {
                                videoRefs.current[student.id] = el;
                                if (el && liveStreams[student.id]) {
                                  el.srcObject = liveStreams[student.id];
                                }
                              }}
                              autoPlay
                              muted
                              className="w-full h-40 object-cover"
                              onLoadedMetadata={() => {
                                if (videoRefs.current[student.id]) {
                                  videoRefs.current[student.id]!.play();
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-40 flex items-center justify-center bg-gray-50 text-gray-400 text-sm">
                              No live video
                            </div>
                          )}
                          {isLiveViewing && (
                            <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center space-x-1">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                              <span>LIVE</span>
                            </div>
                          )}
                        </div>

                        {/* Exam progress + restrictions */}
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">Restrictions (warnings)</span>
                            <span className="text-xs font-semibold text-red-700">{student.warnings}</span>
                          </div>
                          {progress ? (
                            <div>
                              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                <span>Answered</span>
                                <span>{progress.questionsAnswered}/{progress.totalQuestions}</span>
                              </div>
                              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                <div
                                  className="bg-green-500 h-2"
                                  style={{ width: `${(progress.questionsAnswered / progress.totalQuestions) * 100}%` }}
                                />
                              </div>
                              <div className="mt-1 flex justify-between text-[10px] text-gray-500">
                                <span>Attempted: {progress.questionsAttempted}</span>
                                <span>Skipped: {progress.questionsSkipped}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-gray-500">No exam progress yet</div>
                          )}
                        </div>

                        {/* Controls */}
                        <div className="grid grid-cols-3 gap-2">
                          {!isLiveViewing ? (
                            <button
                              onClick={() => startLiveView(student.id)}
                              className="px-2 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-xs"
                            >
                              Start Live
                            </button>
                          ) : (
                            <button
                              onClick={() => stopLiveView(student.id)}
                              className="px-2 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs"
                            >
                              Stop Live
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedStudent(student)}
                            className="px-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => sendWarning(student.id)}
                            className="px-2 py-2 border border-yellow-300 text-yellow-700 rounded text-xs hover:bg-yellow-50"
                          >
                            Warn
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
        {/* Real-time Status Bar */}
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">
                  {students.filter(s => s.isOnline).length} Students Online
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">
                  {students.filter(s => s.isInExam).length} Taking Exams
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">
                  {Object.keys(liveStreams).length} Live Monitoring
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">
                  {recordings.length} Recordings Available
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Last Student Appeared Alert */}
        {lastStudentAppeared && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-800">
                  New Student Logged In
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  <strong>{lastStudentAppeared.name}</strong> ({lastStudentAppeared.enrollmentNo}) 
                  logged in at {lastStudentAppeared.loginTime.toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={() => setLastStudentAppeared(null)}
                className="text-blue-400 hover:text-blue-600"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Online</p>
                <p className="text-2xl font-bold text-gray-900">{studentsOnline}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Exam</p>
                <p className="text-2xl font-bold text-gray-900">{studentsInExam}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Warnings</p>
                <p className="text-2xl font-bold text-gray-900">{studentsWithWarnings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Exams</p>
                <p className="text-2xl font-bold text-gray-900">{totalExamsTaken}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Trophy className="h-6 w-6 text-pink-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Score</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(averageScore)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Students Currently Taking Exams - Enhanced Live Monitoring */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-purple-600" />
                Students Currently Taking Exams - Live Monitoring
              </h3>
              <div className="text-sm text-purple-600 font-medium">
                {students.filter(s => s.isInExam).length} Active Exam Sessions
              </div>
            </div>
            {(() => {
              const studentsInExam = students.filter(s => s.isInExam);
              if (studentsInExam.length === 0) {
                return (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No students are currently taking exams</p>
                    <p className="text-gray-400 text-xs mt-1">Students will appear here when they start their exams</p>
                  </div>
                );
              }
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {studentsInExam.map((student) => {
                    const progress = examService.getExamProgress(student.id);
                    const examDuration = student.examStartTime 
                      ? Math.floor((Date.now() - student.examStartTime.getTime()) / (1000 * 60))
                      : 0;
                    const isLiveViewing = isViewingLive[student.id];
                    
                    return (
                      <div key={student.id} className={`rounded-lg p-4 border transition-all duration-200 ${
                        isLiveViewing 
                          ? 'bg-green-50 border-green-300 shadow-lg' 
                          : 'bg-purple-50 border-purple-200 hover:shadow-md'
                      }`}>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{student.name}</h4>
                            <p className="text-sm text-gray-500">{student.enrollmentNo}</p>
                            {isLiveViewing && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                                🔴 LIVE MONITORING
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-purple-600">{examDuration}m</div>
                            <div className="text-xs text-gray-500">Duration</div>
                          </div>
                        </div>
                        
                        {/* Real-time Status Indicators */}
                        <div className="space-y-2 text-sm mb-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Camera:</span>
                            <div className="flex items-center space-x-2">
                              <span className={`font-medium ${student.isCameraOn ? 'text-green-600' : 'text-red-600'}`}>
                                {student.isCameraOn ? 'Active' : 'Inactive'}
                              </span>
                              {student.isCameraOn ? (
                                <Camera className="h-4 w-4 text-green-500" />
                              ) : (
                                <CameraOff className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Microphone:</span>
                            <div className="flex items-center space-x-2">
                              <span className={`font-medium ${student.isMicOn ? 'text-green-600' : 'text-red-600'}`}>
                                {student.isMicOn ? 'Active' : 'Inactive'}
                              </span>
                              {student.isMicOn ? (
                                <Mic className="h-4 w-4 text-green-500" />
                              ) : (
                                <MicOff className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Connection:</span>
                            <div className="flex items-center space-x-2">
                              <span className={`font-medium ${getConnectionQualityColor(student.connectionQuality)}`}>
                                {student.connectionQuality}
                              </span>
                              {getConnectionQualityIcon(student.connectionQuality)}
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Current Tab:</span>
                            <span className="font-medium text-blue-600 text-xs max-w-24 truncate">
                              {student.currentTab}
                            </span>
                          </div>
                        </div>

                          {/* Exam Progress Summary */}
                          {progress && (
                            <div className="mb-4 bg-white/70 rounded-lg p-3 border border-purple-200">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-purple-700">Exam Progress</span>
                                <span className="text-xs text-gray-600">
                                  {progress.questionsAnswered}/{progress.totalQuestions} answered
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                <div
                                  className="bg-green-500 h-2"
                                  style={{ width: `${(progress.questionsAnswered / progress.totalQuestions) * 100}%` }}
                                />
                              </div>
                              <div className="mt-2 flex justify-between text-[10px] text-gray-600">
                                <span>Attempted: {progress.questionsAttempted}</span>
                                <span>Skipped: {progress.questionsSkipped}</span>
                              </div>
                            </div>
                          )}
                        
                        {/* Live Monitoring Controls */}
                        <div className="space-y-2 mb-4">
                          {!isLiveViewing ? (
                            <button
                              onClick={() => startLiveView(student.id)}
                              className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition duration-200 text-sm flex items-center justify-center space-x-2"
                            >
                              <Camera className="h-4 w-4" />
                              <span>Start Live Monitoring</span>
                            </button>
                          ) : (
                            <div className="space-y-2">
                              <button
                                onClick={() => takeSnapshot(student.id)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition duration-200 text-sm flex items-center justify-center space-x-2"
                              >
                                📸 Take Snapshot
                              </button>
                              <button
                                onClick={() => stopLiveView(student.id)}
                                className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition duration-200 text-sm flex items-center justify-center space-x-2"
                              >
                                <X className="h-4 w-4" />
                                <span>Stop Live Monitoring</span>
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedStudent(student)}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition duration-200 text-sm"
                          >
                            Detailed View
                          </button>
                          <button
                            onClick={() => sendWarning(student.id)}
                            className="px-3 py-2 border border-yellow-300 text-yellow-700 rounded-lg hover:bg-yellow-50 transition duration-200 text-sm"
                          >
                            Warn
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Students Who Completed Exams */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
              Students Who Completed Exams
            </h3>
            {(() => {
              const studentsWithExams = students.filter(s => s.examHistory.length > 0);
              if (studentsWithExams.length === 0) {
                return (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No students have completed exams yet</p>
                  </div>
                );
              }
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {studentsWithExams.map((student) => {
                    const lastExam = student.examHistory[student.examHistory.length - 1];
                    return (
                      <div key={student.id} className="bg-gray-50 rounded-lg p-4 border">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{student.name}</h4>
                            <p className="text-sm text-gray-500">{student.enrollmentNo}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">{lastExam.score}%</div>
                            <div className="text-xs text-gray-500">Last Score</div>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Exams:</span>
                            <span className="font-medium">{student.totalExamsTaken}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Average Score:</span>
                            <span className="font-medium">{Math.round(student.averageScore)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Last Exam:</span>
                            <span className="font-medium">{lastExam.examDate.toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Time:</span>
                            <span className="font-medium">{formatTime(student.totalTimeSpent)}</span>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="text-xs text-gray-500">
                            <span className="font-medium">Performance:</span> {lastExam.questionsAnswered}/{lastExam.totalQuestions} questions answered
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Enhanced Student List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Students</h2>
              {students.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No students logged in yet</p>
                  <p className="text-gray-400 text-xs mt-1">Students will appear here when they login</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => {
                        setSelectedStudent(student);
                        // Filter activities for selected student
                        const studentActivities = recentActivities.filter(a => a.studentId === student.id);
                        setSelectedStudentActivities(studentActivities);
                      }}
                      className={`p-3 rounded-lg border cursor-pointer transition duration-200 ${
                        selectedStudent?.id === student.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(student)}`}>
                            {getStatusIcon(student)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{student.name}</p>
                            <p className="text-sm text-gray-500">{student.enrollmentNo}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {student.isCameraOn ? (
                            <Camera className="h-4 w-4 text-green-500" />
                          ) : (
                            <CameraOff className="h-4 w-4 text-red-500" />
                          )}
                          {student.isMicOn ? (
                            <Mic className="h-4 w-4 text-green-500" />
                          ) : (
                            <MicOff className="h-4 w-4 text-red-500" />
                          )}
                          {student.warnings > 0 && (
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                              {student.warnings} warnings
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className={`${getConnectionQualityColor(student.connectionQuality)} flex items-center space-x-1`}>
                          {getConnectionQualityIcon(student.connectionQuality)}
                          <span>{student.connectionQuality}</span>
                        </span>
                        <span className="text-gray-500">
                          {student.currentTab}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        <span>Login: {student.loginTime.toLocaleTimeString()}</span>
                        {student.isInExam && (
                          <span className="ml-2 text-purple-600">• In Exam</span>
                        )}
                      </div>
                      {/* Enhanced Student Info */}
                      <div className="mt-2 text-xs text-gray-500 space-y-1">
                        <div className="flex justify-between">
                          <span>Exams Taken:</span>
                          <span className="font-medium">{student.totalExamsTaken}</span>
                        </div>
                        {student.lastExamScore !== null && (
                          <div className="flex justify-between">
                            <span>Last Score:</span>
                            <span className="font-medium">{student.lastExamScore}%</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Activities:</span>
                          <span className="font-medium">{student.activityCount}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {recentActivities.map((activity, index) => {
                  const student = students.find(s => s.id === activity.studentId);
                  return (
                    <div key={index} className={`p-3 rounded-lg border-l-4 ${
                      activity.severity === 'high' ? 'border-l-red-500 bg-red-50' :
                      activity.severity === 'medium' ? 'border-l-yellow-500 bg-yellow-50' :
                      'border-l-green-500 bg-green-50'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {student?.name || 'Unknown Student'}
                          </p>
                          <p className="text-xs text-gray-600">{activity.details}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          activity.severity === 'high' ? 'bg-red-100 text-red-800' :
                          activity.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {activity.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  );
                })}
                {recentActivities.length === 0 && (
                  <p className="text-gray-500 text-sm text-center py-4">No recent activities</p>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Student Monitoring */}
          <div className="lg:col-span-3">
            {selectedStudent ? (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Monitoring: {selectedStudent.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Enrollment: {selectedStudent.enrollmentNo} | 
                      Connection: <span className={`${getConnectionQualityColor(selectedStudent.connectionQuality)}`}>
                        {selectedStudent.connectionQuality}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    {/* Audio Level Monitor Toggle */}
                    <button
                      onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                      className={`p-2 rounded-lg transition duration-200 ${
                        isAudioEnabled 
                          ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title="Toggle Audio Level Monitoring"
                    >
                      {isAudioEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                    </button>

                    {/* Listen to Student Audio */}
                    {!isListeningToStudent ? (
                      <button
                        onClick={startListeningToStudent}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center space-x-2"
                        title="Listen to Student Audio"
                      >
                        <Headphones className="h-4 w-4" />
                        <span>Listen</span>
                      </button>
                    ) : (
                      <button
                        onClick={stopListeningToStudent}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center space-x-2"
                        title="Stop Listening to Student Audio"
                      >
                        <X className="h-4 w-4" />
                        <span>Stop</span>
                      </button>
                    )}

                    {/* Recording Controls */}
                    {!isRecording ? (
                      <button
                        onClick={startRecording}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center space-x-2"
                        title="Start recording student's exam session"
                      >
                        <Camera className="h-4 w-4" />
                        <span>Start Recording</span>
                      </button>
                    ) : (
                      <button
                        onClick={stopRecording}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center space-x-2"
                        title="Stop recording and save"
                      >
                        <Camera className="h-4 w-4" />
                        <span>Stop Recording</span>
                      </button>
                    )}
                    
                    {/* Recording Status */}
                    {isRecording && (
                      <div className="flex items-center space-x-2 px-3 py-2 bg-red-100 text-red-800 rounded-lg">
                        <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium">Recording...</span>
                        <span className="text-xs">
                          {Math.floor((Date.now() - recordingStartTime.current) / 1000)}s
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Enhanced Status Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${selectedStudent.isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm font-medium">Status</span>
                    </div>
                    <p className="text-lg font-semibold mt-1">
                      {selectedStudent.isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      {selectedStudent.isCameraOn ? (
                        <Camera className="h-4 w-4 text-green-500" />
                      ) : (
                        <CameraOff className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm font-medium">Camera</span>
                    </div>
                    <p className="text-lg font-semibold mt-1">
                      {selectedStudent.isCameraOn ? 'Active' : 'Inactive'}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      {selectedStudent.isMicOn ? (
                        <Mic className="h-4 w-4 text-green-500" />
                      ) : (
                        <MicOff className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm font-medium">Microphone</span>
                    </div>
                    <p className="text-lg font-semibold mt-1">
                      {selectedStudent.isMicOn ? 'Active' : 'Inactive'}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">Warnings</span>
                    </div>
                    <p className="text-lg font-semibold mt-1">{selectedStudent.warnings}</p>
                  </div>
                </div>

                {/* Enhanced Student Information */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">Current Tab</span>
                    <p className="text-lg font-semibold mt-1">{selectedStudent.currentTab}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">Last Activity</span>
                    <p className="text-lg font-semibold mt-1">
                      {selectedStudent.lastActivity.toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">Login Time</span>
                    <p className="text-lg font-semibold mt-1">
                      {selectedStudent.loginTime.toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">Total Activities</span>
                    <p className="text-lg font-semibold mt-1">{selectedStudent.activityCount}</p>
                  </div>
                </div>

                {/* Exam History Section */}
                {selectedStudent.examHistory.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 text-indigo-600" />
                      Exam History
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-indigo-600">{selectedStudent.totalExamsTaken}</div>
                          <div className="text-sm text-gray-600">Total Exams</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{Math.round(selectedStudent.averageScore)}%</div>
                          <div className="text-sm text-gray-600">Average Score</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{formatTime(selectedStudent.totalTimeSpent)}</div>
                          <div className="text-sm text-gray-600">Total Time</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {selectedStudent.lastExamScore !== null ? `${selectedStudent.lastExamScore}%` : 'N/A'}
                          </div>
                          <div className="text-sm text-gray-600">Last Score</div>
                        </div>
                      </div>
                      
                      {/* Recent Exam Details */}
                      <div className="space-y-2">
                        {selectedStudent.examHistory.slice(-3).reverse().map((exam, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                            <div>
                              <span className="text-sm font-medium text-gray-900">
                                Exam {exam.examId.slice(-8)} - {exam.examDate.toLocaleDateString()}
                              </span>
                              <div className="text-xs text-gray-500">
                                {exam.questionsAnswered}/{exam.totalQuestions} answered • {formatTime(exam.examDuration)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-600">{exam.score}%</div>
                              <div className="text-xs text-gray-500">Score</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Exam Status */}
                {selectedStudent.isInExam && selectedStudent.examStartTime && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">Current Exam Status</span>
                    </div>
                    <p className="text-lg font-semibold text-purple-900 mt-1">
                      Exam Duration: {Math.floor((Date.now() - (selectedStudent.examStartTime?.getTime() || Date.now())) / (1000 * 60))} minutes
                    </p>
                    {(() => {
                      const progress = examService.getExamProgress(selectedStudent.id);
                      if (!progress) return null;
                      return (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-purple-800 mb-1">
                            <span>Answered: {progress.questionsAnswered}</span>
                            <span>Attempted: {progress.questionsAttempted}</span>
                            <span>Skipped: {progress.questionsSkipped}</span>
                          </div>
                          <div className="w-full bg-purple-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-purple-600 h-2"
                              style={{ width: `${(progress.questionsAnswered / progress.totalQuestions) * 100}%` }}
                            />
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Audio Level Monitor */}
                {isAudioEnabled && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Audio Level Monitor</h3>
                    <div className="bg-gray-100 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-2">
                        <Mic className="h-5 w-5 text-blue-500" />
                        <span className="text-sm font-medium">Real-time Audio Level</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <div 
                          className="bg-blue-500 h-4 rounded-full transition-all duration-100"
                          style={{ width: `${(audioLevel / 255) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0</span>
                        <span>50</span>
                        <span>100</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Student Activities */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-blue-600" />
                    Student Activities
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedStudentActivities.map((activity, index) => (
                      <div key={index} className={`p-3 rounded-lg border-l-4 ${
                        activity.severity === 'high' ? 'border-l-red-500 bg-red-50' :
                        activity.severity === 'medium' ? 'border-l-yellow-500 bg-yellow-50' :
                        'border-l-green-500 bg-green-50'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{activity.details}</p>
                            <p className="text-xs text-gray-500">{activity.timestamp.toLocaleTimeString()}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            activity.severity === 'high' ? 'bg-red-100 text-red-800' :
                            activity.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {activity.type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                    {selectedStudentActivities.length === 0 && (
                      <p className="text-gray-500 text-sm text-center py-4">No activities recorded for this student</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => sendWarning(selectedStudent.id)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center space-x-2"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <span>Send Warning</span>
                  </button>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition duration-200"
                  >
                    Close Monitoring
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Student Selected</h3>
                <p className="text-gray-500">Select a student from the list to start monitoring</p>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Recordings Section */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Camera className="h-5 w-5 mr-2 text-blue-600" />
                Exam Recordings & Monitoring
              </h2>
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-500">
                  {recordings.length} recording{recordings.length !== 1 ? 's' : ''} available
                </div>
                {recordings.length > 0 && (
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete all recordings? This action cannot be undone.')) {
                        setRecordings([]);
                        localStorage.removeItem('examRecordings');
                        alert('All recordings have been deleted.');
                      }
                    }}
                    className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition duration-200"
                    title="Clear all recordings"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
            
            {/* Recording Statistics */}
            {recordings.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="text-sm text-blue-600 font-medium">Total Recordings</div>
                  <div className="text-2xl font-bold text-blue-800">{recordings.length}</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="text-sm text-green-600 font-medium">Total Duration</div>
                  <div className="text-2xl font-bold text-green-800">
                    {Math.floor(recordings.reduce((sum, r) => sum + r.duration, 0) / 60)}m
                  </div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <div className="text-sm text-purple-600 font-medium">Students Recorded</div>
                  <div className="text-2xl font-bold text-purple-800">
                    {new Set(recordings.map(r => r.studentId)).size}
                  </div>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                  <div className="text-sm text-orange-600 font-medium">Total Size</div>
                  <div className="text-2xl font-bold text-orange-800">
                    {(() => {
                      const totalSize = recordings.reduce((sum, r) => {
                        if (r.blob instanceof Blob) {
                          return sum + r.blob.size;
                        }
                        return sum;
                      }, 0);
                      return `${(totalSize / (1024 * 1024)).toFixed(1)} MB`;
                    })()}
                  </div>
                </div>
              </div>
            )}
            
            {recordings.length === 0 ? (
              <div className="text-center py-8">
                <Camera className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No recordings available yet</p>
                <p className="text-gray-400 text-xs mt-1">Start recording a student's exam session to capture video</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Recording Categories */}
                <div className="flex space-x-2 mb-4">
                  <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg border border-blue-200">
                    All Recordings
                  </button>
                  <button className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-200">
                    Today
                  </button>
                  <button className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-200">
                    This Week
                  </button>
                  <button className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-200">
                    By Student
                  </button>
                </div>
                
                {/* Recordings Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recordings.map((recording) => {
                    const student = students.find(s => s.id === recording.studentId);
                    return (
                      <div key={recording.id} className="bg-gray-50 rounded-lg p-4 border hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {recording.studentName || student?.name || 'Unknown Student'}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {recording.enrollmentNo || student?.enrollmentNo || 'N/A'}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-blue-600">
                              {Math.floor(recording.duration / 60)}:{(recording.duration % 60).toString().padStart(2, '0')}
                            </div>
                            <div className="text-xs text-gray-500">Duration</div>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm mb-4">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Recorded:</span>
                            <span className="font-medium">{recording.timestamp.toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Time:</span>
                            <span className="font-medium">{recording.timestamp.toLocaleTimeString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">File Size:</span>
                            <span className="font-medium">
                              {recording.blob instanceof Blob 
                                ? `${(recording.blob.size / (1024 * 1024)).toFixed(2)} MB`
                                : 'Unknown'
                              }
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Quality:</span>
                            <span className="font-medium text-green-600">HD (720p)</span>
                          </div>
                        </div>
                        
                        {/* Download Options */}
                        <div className="space-y-2 mb-4">
                          <div className="text-xs font-medium text-gray-600">Download Options:</div>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => downloadRecording(recording.id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs transition duration-200 flex items-center justify-center space-x-1"
                              title="Download original quality"
                            >
                              <Download className="h-3 w-3" />
                              <span>Original</span>
                            </button>
                            <button
                              onClick={() => downloadRecording(recording.id, 'compressed')}
                              className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs transition duration-200 flex items-center justify-center space-x-1"
                              title="Download compressed version"
                            >
                              <Download className="h-3 w-3" />
                              <span>Compressed</span>
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              // Preview functionality could be added here
                              alert('Preview functionality coming soon!');
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200 text-sm flex items-center justify-center space-x-2"
                            title="Preview recording"
                          >
                            <Eye className="h-4 w-4" />
                            <span>Preview</span>
                          </button>
                          <button
                            onClick={() => deleteRecording(recording.id)}
                            className="px-3 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition duration-200 text-sm"
                            title="Delete recording"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Exam History & Analytics */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-indigo-600" />
              Exam History & Analytics
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Exam History */}
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-3">Recent Exam Completions</h3>
                {examHistory.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No exam history available</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {examHistory.slice(0, 10).map((exam, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3 border">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">{exam.studentName}</h4>
                            <p className="text-sm text-gray-500">{exam.enrollmentNo}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">{exam.score}%</div>
                            <div className="text-xs text-gray-500">Score</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-gray-600">Date:</span>
                            <div className="font-medium">{exam.examDate.toLocaleDateString()}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Duration:</span>
                            <div className="font-medium">{formatTime(exam.duration)}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Questions:</span>
                            <div className="font-medium">{exam.questionsAnswered}/{exam.totalQuestions}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Exam Sessions */}
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-3">Currently Active Exams</h3>
                {activeExams.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No active exam sessions</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {activeExams.map((exam, index) => {
                      const examDuration = Math.floor((Date.now() - exam.startTime.getTime()) / (1000 * 60));
                      return (
                        <div key={index} className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-medium text-gray-900">{exam.studentName}</h4>
                              <p className="text-sm text-gray-500">{exam.enrollmentNo}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-purple-600">{examDuration}m</div>
                              <div className="text-xs text-gray-500">Duration</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-600">Started:</span>
                              <div className="font-medium">{exam.startTime.toLocaleTimeString()}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Question:</span>
                              <div className="font-medium">{exam.currentQuestion}</div>
                            </div>
                          </div>
                          <div className="mt-2 pt-2 border-t border-purple-200">
                            <button
                              onClick={() => {
                                const student = students.find(s => s.id === exam.studentId);
                                if (student) {
                                  setSelectedStudent(student);
                                }
                              }}
                              className="w-full px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition duration-200"
                            >
                              Monitor Student
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Live Student Monitoring & Recording Section */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Camera className="h-5 w-5 mr-2 text-purple-600" />
                Live Student Monitoring & Recording
              </h2>
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-500">
                  {Object.keys(liveStreams).length} active live stream{Object.keys(liveStreams).length !== 1 ? 's' : ''}
                </div>
                <div className="text-sm text-gray-500">
                  {recordings.length} recording{recordings.length !== 1 ? 's' : ''} available
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Live Streams with Enhanced Controls */}
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center justify-between">
                  <span>Active Live Streams</span>
                  {Object.keys(liveStreams).length > 0 && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      🔴 LIVE
                    </span>
                  )}
                </h3>
                {Object.keys(liveStreams).length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No active live streams</p>
                    <p className="text-gray-400 text-xs mt-1">Start live viewing students to monitor their exam sessions</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(liveStreams).map(([studentId, stream]) => {
                      const student = students.find(s => s.id === studentId);
                      const examDuration = student?.examStartTime 
                        ? Math.floor((Date.now() - student.examStartTime.getTime()) / (1000 * 60))
                        : 0;
                      
                      return (
                        <div key={studentId} className="bg-green-50 rounded-lg p-4 border border-green-200 shadow-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-medium text-gray-900">{student?.name || 'Unknown Student'}</h4>
                              <p className="text-sm text-gray-500">{student?.enrollmentNo || 'N/A'}</p>
                              <p className="text-xs text-green-600 font-medium">Exam Duration: {examDuration}m</p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => takeSnapshot(studentId)}
                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition duration-200 flex items-center space-x-1"
                                title="Take snapshot"
                              >
                                <span>📸</span>
                                <span>Snapshot</span>
                              </button>
                              <button
                                onClick={() => startRecording()}
                                className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 transition duration-200 flex items-center space-x-1"
                                title="Start recording"
                              >
                                <span>🔴</span>
                                <span>Record</span>
                              </button>
                              <button
                                onClick={() => stopLiveView(studentId)}
                                className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 transition duration-200"
                                title="Stop live view"
                              >
                                Stop
                              </button>
                            </div>
                          </div>
                          
                          {/* Live Video Stream */}
                          <div className="relative mb-3">
                            <video
                              ref={(el) => {
                                videoRefs.current[studentId] = el;
                                if (el) {
                                  el.srcObject = stream;
                                }
                              }}
                              autoPlay
                              muted
                              className="w-full h-48 object-cover rounded border"
                              onLoadedMetadata={() => {
                                if (videoRefs.current[studentId]) {
                                  videoRefs.current[studentId]!.play();
                                }
                              }}
                            />
                            {/* Live Indicator Overlay */}
                            <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center space-x-1">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                              <span>LIVE</span>
                            </div>
                            
                            {/* Recording Status Overlay */}
                            {isRecording && selectedStudent?.id === studentId && (
                              <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center space-x-1">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                <span>REC</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Real-time Status */}
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div className="text-center">
                              <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
                                student?.isCameraOn ? 'bg-green-500' : 'bg-red-500'
                              }`}></div>
                              <span className="text-gray-600">Camera</span>
                            </div>
                            <div className="text-center">
                              <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
                                student?.isMicOn ? 'bg-green-500' : 'bg-red-500'
                              }`}></div>
                              <span className="text-gray-600">Mic</span>
                            </div>
                            <div className="text-center">
                              <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${
                                student?.isTabActive ? 'bg-green-500' : 'bg-red-500'
                              }`}></div>
                              <span className="text-gray-600">Tab</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Live Monitoring Controls & Quick Actions */}
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-3">Quick Actions & Monitoring</h3>
                <div className="space-y-4">
                  {/* Students Available for Live Monitoring */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">Students in Exam</h4>
                    <div className="space-y-2">
                      {students.filter(s => s.isInExam).map((student) => (
                        <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 text-sm">{student.name}</h5>
                            <p className="text-xs text-gray-500">{student.enrollmentNo}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`w-2 h-2 rounded-full ${
                                student.isCameraOn ? 'bg-green-500' : 'bg-red-500'
                              }`}></span>
                              <span className="text-xs text-gray-600">
                                {student.isCameraOn ? 'Camera Active' : 'Camera Inactive'}
                              </span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            {isViewingLive[student.id] ? (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                🔴 Live
                              </span>
                            ) : (
                              <button
                                onClick={() => startLiveView(student.id)}
                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition duration-200"
                              >
                                Start Live
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      {students.filter(s => s.isInExam).length === 0 && (
                        <div className="text-center py-6 bg-gray-50 rounded-lg">
                          <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500 text-xs">No students currently taking exams</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Quick Recording Actions */}
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Quick Recording</h4>
                    <div className="space-y-2">
                      {selectedStudent ? (
                        <div className="text-sm">
                          <p className="text-blue-700">Selected: <strong>{selectedStudent.name}</strong></p>
                          <div className="flex space-x-2 mt-2">
                            {!isRecording ? (
                              <button
                                onClick={startRecording}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-xs transition duration-200 flex items-center space-x-1"
                              >
                                <span>🔴</span>
                                <span>Start Recording</span>
                              </button>
                            ) : (
                              <button
                                onClick={stopRecording}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-xs transition duration-200 flex items-center space-x-1"
                              >
                                <span>⏹️</span>
                                <span>Stop Recording</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-blue-600 text-xs">Select a student to start recording</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Snapshots Section */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                📸 Exam Snapshots
              </h2>
              <div className="text-sm text-gray-500">
                {snapshots.length} snapshot{snapshots.length !== 1 ? 's' : ''} captured
              </div>
            </div>
            
            {snapshots.length === 0 ? (
              <div className="text-center py-8">
                <Camera className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No snapshots captured yet</p>
                <p className="text-gray-400 text-xs mt-1">Take snapshots during live monitoring to capture exam moments</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {snapshots.map((snapshot) => (
                  <div key={snapshot.id} className="bg-gray-50 rounded-lg p-4 border hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{snapshot.studentName}</h4>
                        <p className="text-sm text-gray-500">{snapshot.enrollmentNo}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">
                          {snapshot.timestamp.toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {snapshot.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <img 
                        src={snapshot.imageUrl} 
                        alt={`Snapshot of ${snapshot.studentName}`}
                        className="w-full h-32 object-cover rounded border"
                      />
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => downloadSnapshot(snapshot.id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition duration-200 text-sm flex items-center justify-center space-x-2"
                        title="Download snapshot"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </button>
                      <button
                        onClick={() => deleteSnapshot(snapshot.id)}
                        className="px-3 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition duration-200 text-sm"
                        title="Delete snapshot"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
