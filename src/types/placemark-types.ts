import { Types } from "mongoose";

export type AuthProvider = "local" | "github" | "google";

export interface IUser {
  firstName?: string;
  lastName?: string;
  email?: string;
  emailVerified: boolean;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
  _id: Types.ObjectId;
};

export interface IAuthIdentity {
  user: Types.ObjectId;
  provider: AuthProvider;
  providerUserId: string;
  passwordHash?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
  _id: Types.ObjectId;
};

export interface ILocation {
  title?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  category?: string;
  img?: string;
  visibility?: string;
  userid?: Types.ObjectId;
  _id: Types.ObjectId;
}

export type UpdateLocationDTO = {
  _id: Types.ObjectId;
} & Partial<Omit<ILocation, "_id" | "userid">>;

export interface CreateLocationDTO {
  title: string;
  latitude: number;
  longitude: number;
  description?: string;
  category: string;
  visibility: string;
}

export interface IReview {
  locationid: Types.ObjectId;
  userid: Types.ObjectId;
  rating?: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
  _id: Types.ObjectId;
}

export type Db = {
  userStore: any,
  locationStore: any,
  authStore: any,
  reviewStore: any,
};
