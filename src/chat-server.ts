import * as express from 'express';
import { createServer, Server } from 'https';
import * as socketIo from 'socket.io'; // new
import { readFileSync } from 'fs'
export class ChatServer {

    public static readonly PORT:number = 5000;
    private app: express.Application;
    private port: string | number;
    private server: Server;
    private io: SocketIO.Server;
    private socketsArray = [];
    private keyserver: Buffer;
    private certserver: Buffer;
    constructor() {
        this.createApp();
        this.config();
        this.createServer();
        this.sockets();
        this.listen();
    }

    
    private createApp(): void {
        this.app = express();
        this.app.use(express.static('public'));
    }

    private config(): void {
        this.port = process.env.PORT || ChatServer.PORT;
    }

    private listen(): void {
        
        this.server.listen(this.port, () => {
            console.log('Running server on port %s', this.port);
        });

        this.io.on('connection', (socket) => {
            socket.broadcast.emit('add-users', {
                users: [socket.id]
            });

            socket.on('disconnect', () => {
                this.socketsArray.splice(this.socketsArray.indexOf(socket.id), 1);
                this.io.emit('remove-user', socket.id);
            });

            socket.on('make-offer', (data) => {
                socket.to(data.to).emit('offer-made', {
                    offer: data.offer,
                    socket: socket.id
                });
            });

            socket.on('make-answer', (data) => {
                socket.to(data.to).emit('answer-made', {
                    socket: socket.id,
                    answer: data.answer
                });
            });

        });
    }

    private createServer(): void {

        this.keyserver = readFileSync('./server.key');
        this.certserver = readFileSync('./server.cert');
        this.server = createServer(
            {
                key: this.keyserver,
                cert: this.certserver,
            },            
            this.app);
    }

     
    private sockets(): void {
        this.io = socketIo(this.server);
    }

    public getApp(): express.Application {
        return this.app;
    }
}