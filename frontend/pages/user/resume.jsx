import { useState, useRef } from 'react';
import Head from 'next/head';
import { FaFileAlt, FaUpload, FaDownload, FaTrash, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { withAuth } from '../../utils/withAuth';
import VerifyEmailGate from '../../components/VerifyEmailGate';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';
import { toast } from 'react-hot-toast';

function UserResume() {
  const { user, updateUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('File size must be less than 5MB');
      return;
    }

    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PDF or Word document');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    setUploading(true);
    try {
      const { data } = await api.post('/users/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      updateUser({ resumeUrl: data.data.resumeUrl, isProfileComplete: true }); // Assume completing resume might complete profile or just update it
      toast.success('Resume uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.error || 'Failed to upload resume');
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteResume = async () => {
    if (!confirm('Are you sure you want to delete your resume?')) return;

    try {
      await api.delete('/users/resume');
      updateUser({ resumeUrl: null });
      toast.success('Resume deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.error || 'Failed to delete resume');
    }
  };

  const hasResume = !!user?.resumeUrl;

  return (
    <DashboardLayout>
      <VerifyEmailGate>
        <Head>
          <title>My Resume - JobPulse</title>
        </Head>

        <div>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Resume Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Upload and manage your resume
            </p>
          </div>

          <div className="card max-w-2xl mx-auto">
            <div className="card-body p-8 sm:p-12 text-center">

              <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors ${hasResume ? 'bg-green-100 text-green-500' : 'bg-primary-50 dark:bg-primary-900/20 text-primary-500'
                }`}>
                {hasResume ? <FaCheckCircle className="text-5xl" /> : <FaFileAlt className="text-5xl" />}
              </div>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {hasResume ? 'Resume Uploaded' : 'Upload Your Resume'}
              </h3>

              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
                {hasResume
                  ? 'Your resume is ready for applications. You can update it by uploading a new one, or download the current version.'
                  : 'Upload your resume to make applying to jobs easier. Employers can view your resume when you apply.'}
              </p>

              {hasResume && (
                <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between max-w-md mx-auto border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center text-left">
                    <FaFileAlt className="text-gray-400 mr-3 text-xl" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                        {user.resumeUrl.split('/').pop()}
                      </p>
                      <p className="text-xs text-gray-500">Uploaded Resume</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <a
                      href={user.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-500 hover:text-primary-500 transition-colors"
                      title="Download"
                    >
                      <FaDownload />
                    </a>
                    <button
                      onClick={handleDeleteResume}
                      className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx"
              />

              <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={handleUploadClick}
                  disabled={uploading}
                  className="btn-primary flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FaUpload className="mr-2" />
                      {hasResume ? 'Upload New Version' : 'Upload Resume'}
                    </>
                  )}
                </button>
                {hasResume && (
                  <button
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = user.resumeUrl;
                      a.download = 'resume.pdf';
                      a.target = '_blank';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }}
                    className="btn-outline flex items-center justify-center"
                  >
                    <FaDownload className="mr-2" />
                    Download Resume
                  </button>
                )}
              </div>

              <p className="mt-6 text-xs text-gray-500 dark:text-gray-400">
                Supported formats: PDF, DOC, DOCX. Max file size: 5MB.
              </p>

              {hasResume && (
  <div className="mt-10 border-t border-gray-200 dark:border-gray-700 pt-10">
    <h3 className="text-xl font-semibold mb-6 flex items-center">
      <FaFileAlt className="mr-2 text-primary-500" />
      Resume Preview
    </h3>

    <div className="w-full h-[600px] rounded-xl overflow-hidden border">
      <iframe
        src={`https://docs.google.com/gview?url=${encodeURIComponent(
          user.resumeUrl
        )}&embedded=true`}
        className="w-full h-full"
        frameBorder="0"
        title="Resume Preview"
      />
    </div>
  </div>
)}

            </div>
          </div>
        </div>
      </VerifyEmailGate>
    </DashboardLayout>
  );
}

export default withAuth(UserResume, {
  requiredUserType: 'user',
  redirectTo: '/auth/login'
});
