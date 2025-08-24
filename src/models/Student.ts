import mongoose, { Document, Schema } from 'mongoose';

export interface IStudent extends Document {
  enrollmentNo: string;
  name: string;
  passwordHash: string;
  isOnline: boolean;
  isCameraOn: boolean;
  isMicOn: boolean;
  isSpeaking: boolean;
  isTabActive: boolean;
  lastActivity: Date;
  examStartTime: Date | null;
  warnings: number;
  currentTab: string;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'disconnected';
  loginTime: Date;
  isInExam: boolean;
  totalExamsTaken: number;
  averageScore: number;
  lastExamDate: Date | null;
  lastExamScore: number | null;
  totalTimeSpent: number; // in seconds
  activityCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>({
  enrollmentNo: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2
  },
  passwordHash: {
    type: String,
    required: true
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  isCameraOn: {
    type: Boolean,
    default: false
  },
  isMicOn: {
    type: Boolean,
    default: false
  },
  isSpeaking: {
    type: Boolean,
    default: false
  },
  isTabActive: {
    type: Boolean,
    default: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  examStartTime: {
    type: Date,
    default: null
  },
  warnings: {
    type: Number,
    default: 0,
    min: 0
  },
  currentTab: {
    type: String,
    default: 'Dashboard'
  },
  connectionQuality: {
    type: String,
    enum: ['excellent', 'good', 'poor', 'disconnected'],
    default: 'excellent'
  },
  loginTime: {
    type: Date,
    default: Date.now
  },
  isInExam: {
    type: Boolean,
    default: false
  },
  totalExamsTaken: {
    type: Number,
    default: 0,
    min: 0
  },
  averageScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  lastExamDate: {
    type: Date,
    default: null
  },
  lastExamScore: {
    type: Number,
    default: null,
    min: 0,
    max: 100
  },
  totalTimeSpent: {
    type: Number,
    default: 0,
    min: 0
  },
  activityCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  collection: 'students'
});

// Indexes for better performance
StudentSchema.index({ enrollmentNo: 1 });
StudentSchema.index({ isOnline: 1 });
StudentSchema.index({ isInExam: 1 });
StudentSchema.index({ lastActivity: 1 });
StudentSchema.index({ createdAt: 1 });

// Virtual for full name
StudentSchema.virtual('fullName').get(function() {
  return `${this.name} (${this.enrollmentNo})`;
});

// Method to update online status
StudentSchema.methods.updateOnlineStatus = function(isOnline: boolean) {
  this.isOnline = isOnline;
  this.lastActivity = new Date();
  if (isOnline) {
    this.loginTime = new Date();
  }
  return this.save();
};

// Method to update exam status
StudentSchema.methods.updateExamStatus = function(isInExam: boolean, examStartTime?: Date) {
  this.isInExam = isInExam;
  if (examStartTime) {
    this.examStartTime = examStartTime;
  } else {
    this.examStartTime = null;
  }
  this.lastActivity = new Date();
  return this.save();
};

// Method to add warning
StudentSchema.methods.addWarning = function() {
  this.warnings += 1;
  this.lastActivity = new Date();
  return this.save();
};

// Method to update activity count
StudentSchema.methods.incrementActivityCount = function() {
  this.activityCount += 1;
  this.lastActivity = new Date();
  return this.save();
};

export const Student = mongoose.model<IStudent>('Student', StudentSchema);
export default Student;
