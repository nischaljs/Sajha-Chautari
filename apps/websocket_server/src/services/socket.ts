import {Server} from 'socket.io';

class SocketService{
    private _io:Server;
    constructor(){
        console.log("initialized socket server");

        this._io = new Server({
            cors:{
                origin:"*",
                allowedHeaders:["*"]
            }
        })
    }
    public initListeners(){
        const io = this._io;


        io.on("connect",async(socket)=>{
            console.log(`userId ${socket.id} connected`);


            socket.on('event:message',(msg)=>{
                console.log("message received",msg);
                io.emit("message",JSON.stringify(msg));
            })

            socket.on("disconnect",() =>{
                console.log(`userId ${socket.id} disconnected`);
                
            });
        });
    }

    get io() {
        return this._io;
    }
}


export default SocketService;





