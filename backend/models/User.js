const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * @swagger
 * components:
 * schemas:
 * Education:
 * type: object
 * required:
 * - degree
 * - institution
 * - year
 * properties:
 * degree:
 * type: string
 * description: Degree obtained (e.g., "B.Sc. Computer Science").
 * maxLength: 100
 * institution:
 * type: string
 * description: Name of the educational institution.
 * maxLength: 200
 * year:
 * type: string
 * description: Graduation year or duration (e.g., "2020", "2018-2022").
 * maxLength: 10
 * description:
 * type: string
 * description: Additional description for education (e.g., GPA, honors).
 * maxLength: 500
 * Experience:
 * type: object
 * required:
 * - jobTitle
 * - company
 * - duration
 * properties:
 * jobTitle:
 * type: string
 * description: Title of the job (e.g., "Software Engineer").
 * maxLength: 100
 * company:
 * type: string
 * description: Name of the company.
 * maxLength: 200
 * duration:
 * type: string
 * description: Employment duration (e.g., "Jan 2020 - Dec 2022", "Current").
 * maxLength: 50
 * description:
 * type: string
 * description: Responsibilities and achievements in the role.
 * maxLength: 1000
 * User:
 * type: object
 * required:
 * - name
 * - email
 * - password
 * properties:
 * name:
 * type: string
 * description: Full name of the user.
 * maxLength: 100
 * email:
 * type: string
 * format: email
 * description: Unique email address of the user.
 * password:
 * type: string
 * format: password
 * description: User's password (hashed).
 * minLength: 6
 * phone:
 * type: string
 * description: User's phone number.
 * maxLength: 20
 * address:
 * type: string
 * description: User's physical address.
 * maxLength: 200
 * summary:
 * type: string
 * description: A brief professional summary.
 * maxLength: 1000
 * education:
 * type: array
 * items:
 * $ref: '#/components/schemas/Education'
 * description: Array of educational qualifications.
 * experience:
 * type: array
 * items:
 * $ref: '#/components/schemas/Experience'
 * description: Array of work experiences.
 * skills:
 * type: array
 * items:
 * type: string
 * format: mongoId
 * description: Array of references to Skill documents.
 * resumeUrl:
 * type: string
 * format: url
 * description: URL to the user's uploaded resume.
 * isVerified:
 * type: boolean
 * description: Indicates if the user's email is verified.
 * default: false
 * verificationToken:
 * type: string
 * description: Token for email verification.
 * resetPasswordToken:
 * type: string
 * description: Token for password reset.
 * resetPasswordExpire:
 * type: string
 * format: date-time
 * description: Expiration time for password reset token.
 * isProfileComplete:
 * type: boolean
 * description: Indicates if the user has completed their profile.
 * default: false
 * role:
 * type: string
 * enum: [user, admin] # 'user' now primarily means job seeker
 * default: user
 * example:
 * name: Jane Doe
 * email: jane.doe@example.com
 * phone: "123-456-7890"
 * address: "123 Main St, Anytown"
 * summary: "Experienced software developer with a focus on web technologies."
 * education:
 * - degree: "B.Sc. Computer Science"
 * institution: "University of Tech"
 * year: "2020"
 * experience:
 * - jobTitle: "Software Engineer"
 * company: "Tech Solutions Inc."
 * duration: "Jan 2021 - Present"
 * skills: ["60d5ec49b8a8b1a3d4f5e6a7"] # Example Skill ID
 * isVerified: true
 * isProfileComplete: false
 * role: user
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Do not return password by default
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  address: {
    type: String,
    trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters']
  },
  summary: {
    type: String,
    trim: true,
    maxlength: [1000, 'Summary cannot exceed 1000 characters']
  },
  education: [{
    degree: {
      type: String,
      required: [true, 'Degree is required'],
      trim: true,
      maxlength: [100, 'Degree cannot exceed 100 characters']
    },
    institution: {
      type: String,
      required: [true, 'Institution is required'],
      trim: true,
      maxlength: [200, 'Institution cannot exceed 200 characters']
    },
    year: {
      type: String, // Can be "2020", "2018-2022", etc.
      required: [true, 'Year is required'],
      trim: true,
      maxlength: [10, 'Year cannot exceed 10 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    }
  }],
  experience: [{
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [100, 'Job title cannot exceed 100 characters']
    },
    company: {
      type: String,
      required: [true, 'Company is required'],
      trim: true,
      maxlength: [200, 'Company cannot exceed 200 characters']
    },
    duration: {
      type: String, // Can be "Jan 2020 - Dec 2022", "Current", etc.
      required: [true, 'Duration is required'],
      trim: true,
      maxlength: [50, 'Duration cannot exceed 50 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    }
  }],
  skills: [{
    type: mongoose.Schema.ObjectId, // Reference to Skill model
    ref: 'Skill'
  }],
  resumeUrl: {
    type: String,
    trim: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    select: false
  },
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpire: {
    type: Date,
    select: false
  },
  isProfileComplete: {
    type: Boolean,
    default: false // Will be updated based on profileCompletion virtual
  },
  role: {
    type: String,
    enum: ['user', 'admin'], // 'user' represents a job seeker
    default: 'user'
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Virtual for profile completion percentage
userSchema.virtual('profileCompletion').get(function() {
  const totalRequiredFields = 6; // phone, address, summary, education, experience, skills
  let filledFields = 0;

  if (this.phone && this.phone.trim().length > 0) filledFields++;
  if (this.address && this.address.trim().length > 0) filledFields++;
  if (this.summary && this.summary.trim().length > 0) filledFields++;
  if (this.education && Array.isArray(this.education) && this.education.length > 0) filledFields++;
  if (this.experience && Array.isArray(this.experience) && this.experience.length > 0) filledFields++;
  if (this.skills && Array.isArray(this.skills) && this.skills.length > 0) filledFields++; // Now checking if skill IDs are present

  return Math.round((filledFields / totalRequiredFields) * 100);
});

// Enable virtuals when converting to Object or JSON
userSchema.set('toObject', { virtuals: true });
userSchema.set('toJSON', { virtuals: true });

// Pre-save hook to hash password before saving (only if modified)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next(); // Only hash if password was changed
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance methods
// Generate email verification token
userSchema.methods.generateVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  this.verificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  return verificationToken; // Return the unhashed token to be sent in email
};

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes from now
  return resetToken; // Return the unhashed token to be sent in email
};

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Clear verification token and set account as verified
userSchema.methods.clearVerificationToken = function() {
  this.verificationToken = undefined;
  this.isVerified = true;
};

// Clear password reset token fields
userSchema.methods.clearPasswordResetToken = function() {
  this.resetPasswordToken = undefined;
  this.resetPasswordExpire = undefined;
};


module.exports = mongoose.model('User', userSchema);
