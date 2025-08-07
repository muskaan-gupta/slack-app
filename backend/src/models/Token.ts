import mongoose, { Document, Schema } from 'mongoose';

interface IToken extends Document {
  teamId: string;
  teamName: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: Date;
}

const TokenSchema = new Schema<IToken>({
  teamId: { type: String, required: true },
  teamName: { type: String, required: true },
  userId: { type: String, required: true },
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  tokenExpiresAt: { type: Date, required: true }
}, { timestamps: true });

export const Token = mongoose.model<IToken>('Token', TokenSchema);   