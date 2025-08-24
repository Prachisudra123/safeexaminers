import { Student, IStudent } from '../models/Student';
import { Exam, IExam } from '../models/Exam';
import { StudentActivity, IStudentActivity } from '../models/StudentActivity';
import { Recording, IRecording } from '../models/Recording';
import bcrypt from 'bcryptjs';

export class MongoDBService {
  // Student Management
  async createStudent(enrollmentNo: string, name: string, password: string): Promise<IStudent> {
    try {
      // Check if student already exists
      const existingStudent = await Student.findOne({ enrollmentNo });
      if (existingStudent) {
        throw new Error('Student with this enrollment number already exists');
      }

      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create new student
      const student = new Student({
        enrollmentNo,
        name,
        passwordHash,
        isOnline: true,
        loginTime: new Date(),
        lastActivity: new Date()
      });

      await student.save();
      return student;
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  }

  async authenticateStudent(enrollmentNo: string, password: string): Promise<IStudent | null> {
    try {
      const student = await Student.findOne({ enrollmentNo });
      if (!student) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, student.passwordHash);
      if (!isPasswordValid) {
        return null;
      }

      // Update online status and login time
      student.isOnline = true;
      student.loginTime = new Date();
      student.lastActivity = new Date();
      await student.save();

      return student;
    } catch (error) {
      console.error('Error authenticating student:', error);
      return null;
    }
  }

  async updateStudentStatus(studentId: string, updates: Partial<IStudent>): Promise<IStudent | null> {
    try {
      const student = await Student.findByIdAndUpdate(
        studentId,
        { ...updates, lastActivity: new Date() },
        { new: true }
      );
      return student;
    } catch (error) {
      console.error('Error updating student status:', error);
      return null;
    }
  }

  async getStudentById(studentId: string): Promise<IStudent | null> {
    try {
      return await Student.findById(studentId);
    } catch (error) {
      console.error('Error getting student by ID:', error);
      return null;
    }
  }

  async getStudentByEnrollment(enrollmentNo: string): Promise<IStudent | null> {
    try {
      return await Student.findOne({ enrollmentNo });
    } catch (error) {
      console.error('Error getting student by enrollment:', error);
      return null;
    }
  }

  async getAllStudents(): Promise<IStudent[]> {
    try {
      return await Student.find().sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error getting all students:', error);
      return [];
    }
  }

  async getOnlineStudents(): Promise<IStudent[]> {
    try {
      return await Student.find({ isOnline: true }).sort({ lastActivity: -1 });
    } catch (error) {
      console.error('Error getting online students:', error);
      return [];
    }
  }

  async getStudentsInExam(): Promise<IStudent[]> {
    try {
      return await Student.find({ isInExam: true }).sort({ examStartTime: -1 });
    } catch (error) {
      console.error('Error getting students in exam:', error);
      return [];
    }
  }

  async logoutStudent(studentId: string): Promise<boolean> {
    try {
      await Student.findByIdAndUpdate(studentId, {
        isOnline: false,
        isCameraOn: false,
        isMicOn: false,
        isSpeaking: false,
        isTabActive: false,
        connectionQuality: 'disconnected',
        lastActivity: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error logging out student:', error);
      return false;
    }
  }

  // Exam Management
  async createExam(studentId: string): Promise<IExam> {
    try {
      const exam = new Exam({
        studentId,
        examStartTime: new Date(),
        totalQuestions: 70,
        categories: [
          'Data Structures', 'Algorithms', 'OOP', 'DBMS', 'Operating Systems',
          'Computer Networks', 'Software Engineering', 'Programming Languages',
          'Computer Architecture', 'Discrete Mathematics', 'Theory of Computation',
          'Web Technologies'
        ],
        answers: Array.from({ length: 70 }, (_, i) => ({
          questionId: i + 1,
          selectedAnswer: null,
          isAnswered: false,
          isSkipped: false,
          timeSpent: 0,
          category: this.getCategoryForQuestion(i + 1)
        }))
      });

      await exam.save();
      return exam;
    } catch (error) {
      console.error('Error creating exam:', error);
      throw error;
    }
  }

  async updateExamAnswer(examId: string, questionId: number, answer: string, isSkipped: boolean = false): Promise<boolean> {
    try {
      const exam = await Exam.findById(examId);
      if (!exam) return false;

      const questionIndex = questionId - 1;
      if (questionIndex >= 0 && questionIndex < exam.answers.length) {
        const question = exam.answers[questionIndex];
        
        if (isSkipped) {
          question.isSkipped = true;
          question.isAnswered = false;
          question.selectedAnswer = null;
        } else {
          question.isAnswered = true;
          question.isSkipped = false;
          question.selectedAnswer = answer;
        }

        question.timeSpent = Math.floor((Date.now() - exam.examStartTime.getTime()) / 1000);
        
        await exam.updateProgress();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating exam answer:', error);
      return false;
    }
  }

  async completeExam(examId: string): Promise<IExam | null> {
    try {
      const exam = await Exam.findById(examId);
      if (!exam) return null;

      await exam.completeExam();
      return exam;
    } catch (error) {
      console.error('Error completing exam:', error);
      return null;
    }
  }

  async getExamById(examId: string): Promise<IExam | null> {
    try {
      return await Exam.findById(examId).populate('studentId', 'name enrollmentNo');
    } catch (error) {
      console.error('Error getting exam by ID:', error);
      return null;
    }
  }

  async getStudentExams(studentId: string): Promise<IExam[]> {
    try {
      return await Exam.find({ studentId }).sort({ examStartTime: -1 });
    } catch (error) {
      console.error('Error getting student exams:', error);
      return [];
    }
  }

  async getCompletedExams(): Promise<IExam[]> {
    try {
      return await Exam.find({ status: 'completed' })
        .populate('studentId', 'name enrollmentNo')
        .sort({ examEndTime: -1 });
    } catch (error) {
      console.error('Error getting completed exams:', error);
      return [];
    }
  }

  // Activity Management
  async logActivity(studentId: string, type: string, details: string, severity: string, metadata: any = {}): Promise<IStudentActivity> {
    try {
      const activity = new StudentActivity({
        studentId,
        type,
        details,
        severity,
        metadata,
        timestamp: new Date()
      });

      await activity.save();
      return activity;
    } catch (error) {
      console.error('Error logging activity:', error);
      throw error;
    }
  }

  async getStudentActivities(studentId: string, limit: number = 50): Promise<IStudentActivity[]> {
    try {
      return await StudentActivity.getRecentActivities(studentId, limit);
    } catch (error) {
      console.error('Error getting student activities:', error);
      return [];
    }
  }

  async getRecentActivities(limit: number = 100): Promise<IStudentActivity[]> {
    try {
      return await StudentActivity.find()
        .sort({ timestamp: -1 })
        .limit(limit)
        .populate('studentId', 'name enrollmentNo');
    } catch (error) {
      console.error('Error getting recent activities:', error);
      return [];
    }
  }

  async getHighSeverityActivities(limit: number = 100): Promise<IStudentActivity[]> {
    try {
      return await StudentActivity.getHighSeverityActivities(limit);
    } catch (error) {
      console.error('Error getting high severity activities:', error);
      return [];
    }
  }

  // Recording Management
  async createRecording(studentId: string, examId: string | null, fileName: string, filePath: string, fileSize: number, mimeType: string): Promise<IRecording> {
    try {
      const recording = new Recording({
        studentId,
        examId,
        fileName,
        filePath,
        fileSize,
        mimeType,
        recordingStartTime: new Date(),
        status: 'recording'
      });

      await recording.save();
      return recording;
    } catch (error) {
      console.error('Error creating recording:', error);
      throw error;
    }
  }

  async completeRecording(recordingId: string): Promise<boolean> {
    try {
      const recording = await Recording.findById(recordingId);
      if (!recording) return false;

      await recording.completeRecording();
      return true;
    } catch (error) {
      console.error('Error completing recording:', error);
      return false;
    }
  }

  async getRecordingsByStudent(studentId: string, limit: number = 50): Promise<IRecording[]> {
    try {
      return await Recording.getRecordingsByStudent(studentId, limit);
    } catch (error) {
      console.error('Error getting recordings by student:', error);
      return [];
    }
  }

  async getAllRecordings(limit: number = 100): Promise<IRecording[]> {
    try {
      return await Recording.find({ status: { $ne: 'deleted' } })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('studentId', 'name enrollmentNo')
        .populate('examId', 'examStartTime score');
    } catch (error) {
      console.error('Error getting all recordings:', error);
      return [];
    }
  }

  async deleteRecording(recordingId: string): Promise<boolean> {
    try {
      await Recording.findByIdAndUpdate(recordingId, { status: 'deleted' });
      return true;
    } catch (error) {
      console.error('Error deleting recording:', error);
      return false;
    }
  }

  async incrementDownloadCount(recordingId: string): Promise<boolean> {
    try {
      const recording = await Recording.findById(recordingId);
      if (!recording) return false;

      await recording.incrementDownloadCount();
      return true;
    } catch (error) {
      console.error('Error incrementing download count:', error);
      return false;
    }
  }

  // Statistics and Analytics
  async getStudentStatistics(studentId: string) {
    try {
      const student = await Student.findById(studentId);
      if (!student) return null;

      const exams = await Exam.find({ studentId, status: 'completed' });
      const activities = await StudentActivity.countDocuments({ studentId });
      const recordings = await Recording.countDocuments({ studentId, status: { $ne: 'deleted' } });

      const totalScore = exams.reduce((sum, exam) => sum + (exam.score || 0), 0);
      const averageScore = exams.length > 0 ? totalScore / exams.length : 0;

      return {
        totalExams: exams.length,
        averageScore: Math.round(averageScore),
        lastExamScore: student.lastExamScore,
        lastExamDate: student.lastExamDate,
        totalTimeSpent: student.totalTimeSpent,
        activityCount: activities,
        recordingCount: recordings
      };
    } catch (error) {
      console.error('Error getting student statistics:', error);
      return null;
    }
  }

  async getSystemStatistics() {
    try {
      const totalStudents = await Student.countDocuments();
      const onlineStudents = await Student.countDocuments({ isOnline: true });
      const studentsInExam = await Student.countDocuments({ isInExam: true });
      const totalExams = await Exam.countDocuments({ status: 'completed' });
      const totalRecordings = await Recording.countDocuments({ status: { $ne: 'deleted' } });
      const totalActivities = await StudentActivity.countDocuments();

      // Calculate average score
      const completedExams = await Exam.find({ status: 'completed' });
      const totalScore = completedExams.reduce((sum, exam) => sum + (exam.score || 0), 0);
      const averageScore = completedExams.length > 0 ? totalScore / completedExams.length : 0;

      return {
        totalStudents,
        onlineStudents,
        studentsInExam,
        totalExams,
        totalRecordings,
        totalActivities,
        averageScore: Math.round(averageScore)
      };
    } catch (error) {
      console.error('Error getting system statistics:', error);
      return null;
    }
  }

  // Helper method
  private getCategoryForQuestion(questionId: number): string {
    if (questionId <= 5) return 'Data Structures';
    if (questionId <= 10) return 'Algorithms';
    if (questionId <= 15) return 'OOP';
    if (questionId <= 20) return 'DBMS';
    if (questionId <= 25) return 'Operating Systems';
    if (questionId <= 30) return 'Computer Networks';
    if (questionId <= 35) return 'Software Engineering';
    if (questionId <= 40) return 'Programming Languages';
    if (questionId <= 45) return 'Computer Architecture';
    if (questionId <= 50) return 'Discrete Mathematics';
    if (questionId <= 55) return 'Theory of Computation';
    if (questionId <= 60) return 'Web Technologies';
    if (questionId <= 65) return 'Computer Networks';
    if (questionId <= 70) return 'Software Engineering';
    return 'General';
  }
}

export const mongoDBService = new MongoDBService();
export default mongoDBService;
