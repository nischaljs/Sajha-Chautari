import {z, ZodSchema} from 'zod'

export const userSchema:ZodSchema =  z.object({
    email:z.string().email(),
    password:z.string().min(8,{message:"minimum length of 8 characters is required"})
})

export type userType = z.infer<typeof userSchema>


export const userUpdateSchema:ZodSchema = z.object ( {
    nickname:z.string().min(3),
    avatarId:z.string()
})

export type userUpdateType = z.infer<typeof userUpdateSchema>


export const createSpaceSchema = z.object({
    name:z.string(),
    mapId : z.string(),
    capacity :z.number()
})

export type createSpaceType = z.infer<typeof createSpaceSchema>