import { z, ZodSchema } from "zod";

export const userSchema: ZodSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, { message: "minimum length of 8 characters is required" }),
});

export type userType = z.infer<typeof userSchema>;

export const userUpdateSchema: ZodSchema = z.object({
  nickname: z.string().min(3),
  avatarId: z.string(),
});

export type userUpdateType = z.infer<typeof userUpdateSchema>;

export const createSpaceSchema = z.object({
  name: z.string(),
  mapId: z.string(),
  capacity: z.number(),
});

export type createSpaceType = z.infer<typeof createSpaceSchema>;

export const addELementSchema = z.object({
  elementId: z.string(),
  x: z.number(),
  y: z.number(),
});

export type addElementType = z.infer<typeof addELementSchema>;

export const addElementAdminSchema = z.object({
  name: z.string(),
  imageUrl: z.string(),
  static: z.boolean(),
  width: z.number(),
  height: z.number(),
});

export type addElementAdminType = z.infer<typeof addElementAdminSchema>;

export const createAvtarSchema = z.object({
  imageUrl: z.string(),
  name: z.string(),
});

export const createMapSchema = z.object({
  name: z.string(),
  thumbnail: z.string(),
  width: z.number(),
  height: z.number(),
  dropX: z.number(),
  dropY: z.number(),
});

const elementSchema = z.object({
  elementId: z.string(),
  x: z.number(),
  y: z.number(),
});

export const addMapElementSchema = z.object({
  mapId: z.string(),
  defaultElements: z.array(elementSchema),
});


export interface UserInfo{
  id:string,
  email:string,
  nickname:string | null,
  avatarId:string|null,
}