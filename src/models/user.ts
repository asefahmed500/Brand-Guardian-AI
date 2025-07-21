
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name?: string;
  email: string;
  emailVerified?: Date;
  image?: string;
  password?: string;
  role: 'user' | 'brand_manager' | 'admin';
  subscriptionPlan: 'free' | 'pro' | 'enterprise';
  monthlyAnalysisCount: number;
  analysisLimit: number;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  failedLoginAttempts: number;
  lockoutExpires?: Date;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  stripeCurrentPeriodEnd?: Date;
  achievements: string[];
  highScoreStreak: number;
}

const UserSchema: Schema<IUser> = new Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  emailVerified: { type: Date },
  image: { type: String },
  password: { type: String },
  role: { type: String, enum: ['user', 'brand_manager', 'admin'], default: 'user' },
  subscriptionPlan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
  monthlyAnalysisCount: { type: Number, default: 0 },
  analysisLimit: { type: Number, default: 5 }, // Default for free plan
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  failedLoginAttempts: { type: Number, default: 0 },
  lockoutExpires: { type: Date },
  stripeCustomerId: { type: String, unique: true, sparse: true },
  stripeSubscriptionId: { type: String, unique: true, sparse: true },
  stripePriceId: { type: String },
  stripeCurrentPeriodEnd: { type: Date },
  achievements: { type: [String], default: [] },
  highScoreStreak: { type: Number, default: 0 },
}, { timestamps: true });

UserSchema.pre('save', function (next) {
  if (this.isModified('subscriptionPlan') || this.isNew) {
    switch (this.subscriptionPlan) {
      case 'pro':
        this.analysisLimit = 100;
        break;
      case 'enterprise':
        this.analysisLimit = -1; // -1 for unlimited
        break;
      case 'free':
      default:
        this.analysisLimit = 5;
        break;
    }
  }
  next();
});

const UserModel: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default UserModel;
