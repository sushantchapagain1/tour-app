import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide us your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: [true, 'A user must have a password'],
    minLength: [8, 'Password must be greater than 8'],
    select: false, //never show in output
  },
  confirmPassword: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function (el) {
        // validator function returns true or false if true than not show error
        // only works on create and save().
        return el === this.password;
      },
      message: 'Passwords donot match',
    },
  },
  passwordChangedAt: Date,
});

// pre save document mongoose middleware is called after submit and before saving to db.
userSchema.pre('save', async function (next) {
  // if password is modified only run
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10); //12 is best practice cz more than that high cpu usages
  // not saving to db is setting it to undefined.
  this.confirmPassword = undefined;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }
  // False means NOT changed
  return false;
};

const User = mongoose.model('User', userSchema);
export default User;
