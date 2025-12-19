import { connectDB, disconnectDB } from '../config/database';
import { mongoDBService } from '../services/MongoDBService';
import { pathToFileURL } from 'url';

async function testConnection() {
  try {
    console.log('🧪 Testing MongoDB connection...');
    
    // Connect to MongoDB
    await connectDB();
    console.log('✅ Connected to MongoDB successfully');
    
    // Test basic operations
    console.log('\n📊 Testing basic operations...');
    
    // Get system statistics
    const stats = await mongoDBService.getSystemStatistics();
    console.log('📈 System Statistics:', stats);
    
    // Test student creation
    console.log('\n👤 Testing student creation...');
    const testStudent = await mongoDBService.createStudent('TEST001', 'Test Student', 'testpass123');
    console.log('✅ Test student created:', testStudent.name);
    
    // Test activity logging
    console.log('\n📝 Testing activity logging...');
    const activity = await mongoDBService.logActivity(
      testStudent._id.toString(),
      'login',
      'Test activity logged',
      'low'
    );
    console.log('✅ Activity logged:', activity.details);
    
    // Test exam creation
    console.log('\n📚 Testing exam creation...');
    const exam = await mongoDBService.createExam(testStudent._id.toString());
    console.log('✅ Test exam created with ID:', exam._id);
    
    // Test recording creation
    console.log('\n🎥 Testing recording creation...');
    const recording = await mongoDBService.createRecording(
      testStudent._id.toString(),
      exam._id.toString(),
      'test_recording.webm',
      '/recordings/test_recording.webm',
      1024 * 1024 * 10, // 10MB
      'video/webm'
    );
    console.log('✅ Test recording created:', recording.fileName);
    
    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await mongoDBService.deleteRecording(recording._id.toString());
    await mongoDBService.logoutStudent(testStudent._id.toString());
    
    console.log('✅ Test data cleaned up');
    
    console.log('\n🎉 All tests passed! MongoDB is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await disconnectDB();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run test if this file is executed directly
// Run test if this file is executed directly (ESM compatible)
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  testConnection();
}

export { testConnection };
