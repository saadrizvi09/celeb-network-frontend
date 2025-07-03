
import { z } from 'zod';


export const signupSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters long")
    .max(50, "Username cannot exceed 50 characters"),
  password: z.string()
    .min(6, "Password must be at least 6 characters long")
    .max(100, "Password cannot exceed 100 characters"),
});

export const signinSchema = z.object({
  username: z.string()
    .min(1, "Username is required"),
  password: z.string()
    .min(1, "Password is required"),
});