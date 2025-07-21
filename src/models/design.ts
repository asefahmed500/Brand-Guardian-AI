
import mongoose, { Schema, Document, Model } from 'mongoose';

export const FixSuggestionSchema = new Schema({
    description: { type: String, required: true },
    type: { type: String, required: true },
    details: {
        action: String,
        targetElement: String,
        property: String,
        newValue: String,
    }
}, { _id: false });

export interface IDesign extends Document {
  projectId: Schema.Types.ObjectId;
  userId: string;
  userName?: string;
  originalImageUrl: string;
  designContext: string;
  complianceScore: number;
  feedback: string;
  suggestedFixes: Array<{ description: string; type: string; details?: any }>;
  status: 'pending' | 'approved' | 'rejected';
  managerFeedback?: string;
  notes?: string;
  tags: string[];
  peerFeedbackRequested: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DesignSchema: Schema<IDesign> = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  userId: { type: String, required: true, index: true },
  userName: { type: String },
  originalImageUrl: { type: String, required: true },
  designContext: { type: String, required: true },
  complianceScore: { type: Number, required: true },
  feedback: { type: String, required: true },
  suggestedFixes: [FixSuggestionSchema],
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  managerFeedback: { type: String },
  notes: { type: String },
  tags: { type: [String], default: [] },
  peerFeedbackRequested: { type: Boolean, default: false },
}, { timestamps: true });


const DesignModel: Model<IDesign> = mongoose.models.Design || mongoose.model<IDesign>('Design', DesignSchema);

export default DesignModel;
