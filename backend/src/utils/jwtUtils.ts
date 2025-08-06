import jwt from 'jsonwebtoken';
import config from '../config/config';

interface JwtPayload {
  id: string;
  role: string;
}

/**
 * Generate a JWT token
 * @param id User ID
 * @param role User role
 * @returns JWT token
 */
export const generateToken = (id: string, role: string): string => {
  // @ts-ignore: Type compatibility issues with jsonwebtoken
  return jwt.sign(
    { id, role } as JwtPayload, 
    config.jwt.secret, 
    {
      expiresIn: config.jwt.expiresIn,
    }
  );
};

/**
 * Verify a JWT token
 * @param token JWT token
 * @returns Decoded token payload or null if invalid
 */
export const verifyToken = (token: string): JwtPayload | null => {
  try {
    // @ts-ignore: Type compatibility issues with jsonwebtoken
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};