import mongoose, { Document, Schema } from 'mongoose';

export interface IRecording extends Document {
  studentId: mongoose.Types.ObjectId;
  examId: mongoose.Types.ObjectId | null;
  fileName: string;
  filePath: string;
  fileSize: number; // in bytes
  duration: number; // in seconds
  mimeType: string;
  recordingStartTime: Date;
  recordingEndTime: Date;
  status: 'recording' | 'completed' | 'failed' | 'deleted';
  metadata: {
    resolution?: string;
    frameRate?: number;
    audioChannels?: number;
    audioSampleRate?: number;
    bitrate?: number;
    quality?: string;
  };
  tags: string[];
  isPublic: boolean;
  downloadCount: number;
  lastDownloaded: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const RecordingSchema = new Schema<IRecording>({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  examId: {
    type: Schema.Types.ObjectId,
    ref: 'Exam',
    default: null
  },
  fileName: {
    type: String,
    required: true,
    trim: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: Number,
    required: true,
    min: 0
  },
  mimeType: {
    type: String,
    required: true,
    default: 'video/webm'
  },
  recordingStartTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  recordingEndTime: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['recording', 'completed', 'failed', 'deleted'],
    default: 'recording'
  },
  metadata: {
    resolution: {
      type: String,
      default: null
    },
    frameRate: {
      type: Number,
      default: null
    },
    audioChannels: {
      type: Number,
      default: null
    },
    audioSampleRate: {
      type: Number,
      default: null
    },
    bitrate: {
      type: Number,
      default: null
    },
    quality: {
      type: String,
      default: null
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  downloadCount: {
    type: Number,
    default: 0,
    min: 0
  },
  lastDownloaded: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  collection: 'recordings'
});

// Indexes for better performance
RecordingSchema.index({ studentId: 1 });
RecordingSchema.index({ examId: 1 });
RecordingSchema.index({ status: 1 });
RecordingSchema.index({ recordingStartTime: -1 });
RecordingSchema.index({ createdAt: -1 });
RecordingSchema.index({ fileSize: 1 });
RecordingSchema.index({ duration: 1 });

// Compound indexes for common queries
RecordingSchema.index({ studentId: 1, status: 1 });
RecordingSchema.index({ studentId: 1, createdAt: -1 });
RecordingSchema.index({ status: 1, createdAt: -1 });

// Virtual for file size in MB
RecordingSchema.virtual('fileSizeMB').get(function() {
  return (this.fileSize / (1024 * 1024)).toFixed(2);
});

// Virtual for file size in GB
RecordingSchema.virtual('fileSizeGB').get(function() {
  return (this.fileSize / (1024 * 1024 * 1024)).toFixed(2);
});

// Virtual for duration in minutes
RecordingSchema.virtual('durationMinutes').get(function() {
  return Math.floor(this.duration / 60);
});

// Virtual for duration in hours
RecordingSchema.virtual('durationHours').get(function() {
  return Math.floor(this.duration / 3600);
});

// Virtual for formatted duration
RecordingSchema.virtual('formattedDuration').get(function() {
  const hours = Math.floor(this.duration / 3600);
  const minutes = Math.floor((this.duration % 3600) / 60);
  const seconds = this.duration % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
});

// Method to complete recording
RecordingSchema.methods.completeRecording = function() {
  this.recordingEndTime = new Date();
  this.status = 'completed';
  this.duration = Math.floor((this.recordingEndTime.getTime() - this.recordingStartTime.getTime()) / 1000);
  return this.save();
};

// Method to mark as failed
RecordingSchema.methods.markAsFailed = function(error?: string) {
  this.status = 'failed';
  if (error) {
    this.metadata.error = error;
  }
  return this.save();
};

// Method to mark as deleted
RecordingSchema.methods.markAsDeleted = function() {
  this.status = 'deleted';
  return this.save();
};

// Method to increment download count
RecordingSchema.methods.incrementDownloadCount = function() {
  this.downloadCount += 1;
  this.lastDownloaded = new Date();
  return this.save();
};

// Method to add tag
RecordingSchema.methods.addTag = function(tag: string) {
  if (!this.tags.includes(tag)) {
    this.tags.push(tag);
  }
  return this.save();
};

// Method to remove tag
RecordingSchema.methods.removeTag = function(tag: string) {
  this.tags = this.tags.filter(t => t !== tag);
  return this.save();
};

// Static method to get recordings by student
RecordingSchema.statics.getRecordingsByStudent = function(studentId: string, limit: number = 50) {
  return this.find({ studentId, status: { $ne: 'deleted' } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('studentId', 'name enrollmentNo')
    .populate('examId', 'examStartTime score');
};

// Static method to get completed recordings
RecordingSchema.statics.getCompletedRecordings = function(limit: number = 100) {
  return this.find({ status: 'completed' })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('studentId', 'name enrollmentNo')
    .populate('examId', 'examStartTime score');
};

// Static method to get recordings by date range
RecordingSchema.statics.getRecordingsByDateRange = function(startDate: Date, endDate: Date, limit: number = 1000) {
  return this.find({
    createdAt: {
      $gte: startDate,
      $lte: endDate
    },
    status: { $ne: 'deleted' }
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('studentId', 'name enrollmentNo')
    .populate('examId', 'examStartTime score');
};

export const Recording = mongoose.model<IRecording>('Recording', RecordingSchema);
export default Recording;
