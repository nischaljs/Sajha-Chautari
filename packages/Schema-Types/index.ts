import { number, z, ZodSchema } from "zod";

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
  public:z.boolean()
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
  static: z.string().transform((value)=>{
    if(value ==='true') return true;
    if(value==='false') return false;
    throw new Error('Static must be a valid boolean string ("true" or "false")');
  }),
  width: z.string().transform((value)=>{
    const numberValue = Number(value);
    if(isNaN(numberValue)){
      throw new Error("width should be a number ");
    }
    return numberValue;
  }),
  height: z.string().transform((val)=>{
    const numberVal = Number(val);
    if(isNaN(numberVal)){
      throw new Error("Height needs to be a number");
    }
    return numberVal;
  }),
});

export type addElementAdminType = z.infer<typeof addElementAdminSchema>;

export const createAvtarSchema = z.object({
  imageUrl: z.string(),
  name: z.string(),
});
export const createMapSchema = z.object({
  name: z.string(),
  width: z.string().transform((val) => {
    const numberValue = Number(val);
    if (isNaN(numberValue)) {
      throw new Error('Width must be a valid number');
    }
    return numberValue;
  }),
  height: z.string().transform((val) => {
    const numberValue = Number(val);
    if (isNaN(numberValue)) {
      throw new Error('Height must be a valid number');
    }
    return numberValue;
  }),
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


