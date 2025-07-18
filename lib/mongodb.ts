import { MongoClient, Db, Collection } from 'mongodb';
import { Asset, GameScene, Organization, TeamMember, Project } from '@/state/gameTypes';

// Game Engine Documents
export interface AssetDocument extends Asset {
  _id?: string;
}

export interface GameSceneDocument extends GameScene {
  _id?: string;
}

export interface OrganizationDocument extends Organization {
  _id?: string;
}

export interface TeamMemberDocument extends TeamMember {
  _id?: string;
}

export interface ProjectDocument extends Project {
  _id?: string;
}

// Variables de entorno
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'agi_3d_mvp';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// Cache de conexión para evitar múltiples conexiones
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    const client = new MongoClient(MONGODB_URI!);
    await client.connect();
    
    const db = client.db(DB_NAME);
    
    cachedClient = client;
    cachedDb = db;
    
    return { client, db };
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

// Utilidades para obtener colecciones

// Game Engine Collections
export async function getAssetsCollection(): Promise<Collection<AssetDocument>> {
  const { db } = await connectToDatabase();
  return db.collection<AssetDocument>('assets');
}

export async function getGameScenesCollection(): Promise<Collection<GameSceneDocument>> {
  const { db } = await connectToDatabase();
  return db.collection<GameSceneDocument>('game_scenes');
}

export async function getOrganizationsCollection(): Promise<Collection<OrganizationDocument>> {
  const { db } = await connectToDatabase();
  return db.collection<OrganizationDocument>('organizations');
}

export async function getTeamMembersCollection(): Promise<Collection<TeamMemberDocument>> {
  const { db } = await connectToDatabase();
  return db.collection<TeamMemberDocument>('team_members');
}

export async function getProjectsCollection(): Promise<Collection<ProjectDocument>> {
  const { db } = await connectToDatabase();
  return db.collection<ProjectDocument>('projects');
}

// Función para cerrar conexión (útil para cleanup)
export async function closeConnection() {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
  }
} 