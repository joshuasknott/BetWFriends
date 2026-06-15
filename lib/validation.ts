import { z } from "zod";

export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Enter a valid email");

export const registerSchema = z
  .object({
    name: z.string().min(1, "Tell us your name").max(40, "That's a bit long"),
    email: emailSchema,
    password: z.string().min(6, "At least 6 characters"),
  })
  .required();

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const createGroupSchema = z.object({
  name: z.string().min(1, "Give your group a name").max(50),
  description: z.string().max(200).optional().or(z.literal("")),
  emoji: z.string().min(1).max(8),
  color: z.string().min(1),
});

export const joinGroupSchema = z.object({
  inviteCode: z
    .string()
    .min(1, "Enter an invite code")
    .transform((v) => v.trim().toUpperCase()),
});

export const createBetSchema = z.object({
  groupId: z.string().min(1),
  title: z.string().min(1, "What's the bet?").max(140, "Keep it snappy"),
  description: z.string().max(500).optional().or(z.literal("")),
  amount: z.number().int().min(0, "Amount must be 0 or more"), // pence
  // number of hours the bet stays open
  durationHours: z.number().min(1, "At least 1 hour").max(24 * 90, "Too long"),
  yesLabel: z.string().min(1).max(40).default("Yes"),
  noLabel: z.string().min(1).max(40).default("No"),
});

export const topUpSchema = z.object({
  amount: z.number().int().min(100, "Minimum £1").max(100000, "Maximum £1000"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type JoinGroupInput = z.infer<typeof joinGroupSchema>;
export type CreateBetInput = z.infer<typeof createBetSchema>;
export type TopUpInput = z.infer<typeof topUpSchema>;
