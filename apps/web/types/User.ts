export interface User {
    id: string
    nickname: string
    email: string
    position?:{
        x:number,
        y:number
    }
}