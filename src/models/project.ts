
import mongoose, { Schema, Document, Model } from 'mongoose';

export const BrandFingerprintSchema = new Schema({
    primaryColors: [String],
    secondaryColors: [String],
    typographyStyle: String,
    logoPlacementPreferences: String,
    overallDesignAesthetic: String,
}, { _id: false });


export interface IProject extends Document {
  name: string;
  userId: string;
  brandDescription: string;
  logoDataUri: string;
  brandFingerprint: {
    primaryColors: string[];
    secondaryColors: string[];
    typographyStyle: string;
    logoPlacementPreferences: string;
    overallDesignAesthetic: string;
  };
  brandAssets: Schema.Types.ObjectId[];
}

const ProjectSchema: Schema<IProject> = new Schema({
  name: { type: String, required: true },
  userId: { type: String, required: true, index: true },
  brandDescription: { type: String, required: true },
  logoDataUri: { type: String, required: true },
  brandFingerprint: { type: BrandFingerprintSchema, required: true },
  brandAssets: [{ type: Schema.Types.ObjectId, ref: 'Asset' }],
}, { timestamps: true });


const ProjectModel: Model<IProject> = mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);

export default ProjectModel;
