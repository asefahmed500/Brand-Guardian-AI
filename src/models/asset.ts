
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAsset extends Document {
  projectId: Schema.Types.ObjectId;
  name: string;
  type: 'icon' | 'image' | 'logo';
  dataUri: string;
  tags: string[];
  aiSummary: string;
}

const AssetSchema: Schema<IAsset> = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['icon', 'image', 'logo'], required: true },
  dataUri: { type: String, required: true },
  tags: { type: [String], default: [] },
  aiSummary: { type: String },
}, { timestamps: true });

const AssetModel: Model<IAsset> = mongoose.models.Asset || mongoose.model<IAsset>('Asset', AssetSchema);

export default AssetModel;
