import mongoose, { Document, Schema } from 'mongoose';

export interface IExamAnswer {
  questionId: number;
  selectedAnswer: string | null;
  isAnswered: boolean;
  isSkipped: boolean;
  timeSpent: number; // in seconds
  category: string;
}

export interface ICategoryPerformance {
  category: string;
  attempted: number;
  answered: number;
  skipped: number;
  score: number;
}

export interface IExam extends Document {
  studentId: mongoose.Types.ObjectId;
  examStartTime: Date;
  examEndTime: Date | null;
  totalQuestions: number;
  questionsAttempted: number;
  questionsAnswered: number;
  questionsSkipped: number;
  score: number | null;
  timeSpent: number; // total time in seconds
  answers: IExamAnswer[];
  categories: string[];
  categoryPerformance: ICategoryPerformance[];
  status: 'in_progress' | 'completed' | 'abandoned';
  recordingPath: string | null;
  recordingSize: number | null;
  warnings: number;
  createdAt: Date;
  updatedAt: Date;
}

const ExamAnswerSchema = new Schema<IExamAnswer>({
  questionId: {
    type: Number,
    required: true,
    min: 1
  },
  selectedAnswer: {
    type: String,
    default: null
  },
  isAnswered: {
    type: Boolean,
    default: false
  },
  isSkipped: {
    type: Boolean,
    default: false
  },
  timeSpent: {
    type: Number,
    default: 0,
    min: 0
  },
  category: {
    type: String,
    required: true
  }
});

const CategoryPerformanceSchema = new Schema<ICategoryPerformance>({
  category: {
    type: String,
    required: true
  },
  attempted: {
    type: Number,
    default: 0,
    min: 0
  },
  answered: {
    type: Number,
    default: 0,
    min: 0
  },
  skipped: {
    type: Number,
    default: 0,
    min: 0
  },
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
});

const ExamSchema = new Schema<IExam>({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  examStartTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  examEndTime: {
    type: Date,
    default: null
  },
  totalQuestions: {
    type: Number,
    required: true,
    default: 70
  },
  questionsAttempted: {
    type: Number,
    default: 0,
    min: 0
  },
  questionsAnswered: {
    type: Number,
    default: 0,
    min: 0
  },
  questionsSkipped: {
    type: Number,
    default: 0,
    min: 0
  },
  score: {
    type: Number,
    default: null,
    min: 0,
    max: 100
  },
  timeSpent: {
    type: Number,
    default: 0,
    min: 0
  },
  answers: [ExamAnswerSchema],
  categories: [{
    type: String,
    required: true
  }],
  categoryPerformance: [CategoryPerformanceSchema],
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'abandoned'],
    default: 'in_progress'
  },
  recordingPath: {
    type: String,
    default: null
  },
  recordingSize: {
    type: Number,
    default: null
  },
  warnings: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  collection: 'exams'
});

// Indexes for better performance
ExamSchema.index({ studentId: 1 });
ExamSchema.index({ status: 1 });
ExamSchema.index({ examStartTime: 1 });
ExamSchema.index({ examEndTime: 1 });
ExamSchema.index({ score: 1 });
ExamSchema.index({ createdAt: 1 });

// Virtual for exam duration
ExamSchema.virtual('duration').get(function() {
  if (this.examEndTime && this.examStartTime) {
    return Math.floor((this.examEndTime.getTime() - this.examStartTime.getTime()) / 1000);
  }
  return 0;
});

// Virtual for completion rate
ExamSchema.virtual('completionRate').get(function() {
  if (this.totalQuestions > 0) {
    return Math.round((this.questionsAttempted / this.totalQuestions) * 100);
  }
  return 0;
});

// Virtual for answer success rate
ExamSchema.virtual('answerSuccessRate').get(function() {
  if (this.questionsAttempted > 0) {
    return Math.round((this.questionsAnswered / this.questionsAttempted) * 100);
  }
  return 0;
});

// Method to update exam progress
ExamSchema.methods.updateProgress = function() {
  this.questionsAttempted = this.answers.filter(a => a.isAnswered || a.isSkipped).length;
  this.questionsAnswered = this.answers.filter(a => a.isAnswered).length;
  this.questionsSkipped = this.answers.filter(a => a.isSkipped).length;
  
  // Calculate score if completed
  if (this.status === 'completed' && this.totalQuestions > 0) {
    this.score = Math.round((this.questionsAnswered / this.totalQuestions) * 100);
  }
  
  return this.save();
};

// Method to complete exam
ExamSchema.methods.completeExam = function() {
  this.examEndTime = new Date();
  this.status = 'completed';
  this.timeSpent = Math.floor((this.examEndTime.getTime() - this.examStartTime.getTime()) / 1000);
  return this.updateProgress();
};

// Method to add warning
ExamSchema.methods.addWarning = function() {
  this.warnings += 1;
  return this.save();
};

export const Exam = mongoose.model<IExam>('Exam', ExamSchema);
export default Exam;
