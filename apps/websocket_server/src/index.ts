import http from 'http';
import SocketService from './services/socket';


async function init(){
    const httpServer = await http.createServer();

    const socketService = new SocketService();

    const PORT = 8000;

    socketService.io.attach(httpServer);

    httpServer.listen(PORT,()=>{
        console.log(`http server started at ${PORT}`);
        
    })

    socketService.initListeners();
}

init();