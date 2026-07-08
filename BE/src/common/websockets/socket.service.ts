import { Server as HttpServer } from 'http';

import { UserStatusEnum } from '@prisma/client';
import { verify } from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';

import { UsersRepository } from '@/modules/users/users.repository';

import { ITokenPayload } from '@/common/interfaces';
import { jwtConfig, appEnv } from '@/configs';

export class SocketService {
	private static instance: SocketService;
	private io: Server;
	private userRepository = new UsersRepository();

	private constructor(httpServer: HttpServer) {
		this.io = new Server(httpServer, {
			cors: {
				origin: appEnv.CORS_ORIGIN,
				credentials: true,
			},
		});

		this.setupMiddleware();
		this.setupListeners();
	}

	public static initialize(httpServer: HttpServer): SocketService {
		if (!SocketService.instance) {
			SocketService.instance = new SocketService(httpServer);
		}
		return SocketService.instance;
	}

	public static getInstance(): SocketService {
		if (!SocketService.instance) {
			throw new Error('SocketService is not initialized');
		}
		return SocketService.instance;
	}

	private setupMiddleware() {
		this.io.use(async (socket: Socket, next) => {
			try {
				// Allow taking token from handshake auth or cookie
				let token = socket.handshake.auth?.token;

				if (!token && socket.handshake.headers.cookie) {
					token = socket.handshake.headers.cookie
						.split('; ')
						.find((row) => row.startsWith('accessToken='))
						?.split('=')[1];
				}

				if (!token) {
					return next(new Error('Authentication error: No token provided'));
				}

				const payload = verify(
					token,
					jwtConfig.secretAccessToken,
				) as ITokenPayload;
				const user = await this.userRepository.findUser({
					userId: payload.userId,
					userStatus: UserStatusEnum.ACTIVE,
				});

				if (!user) {
					return next(
						new Error('Authentication error: User not found or inactive'),
					);
				}

				// Attach user info to socket
				socket.data.user = user;
				next();
			} catch (error) {
				next(new Error('Authentication error: Invalid token'));
			}
		});
	}

	private setupListeners() {
		this.io.on('connection', (socket: Socket) => {
			const userId = socket.data.user.id;
			console.log(`Socket connected: ${socket.id} (User: ${userId})`);

			// Join a private room for this user to enable targeted notifications
			socket.join(`user:${userId}`);

			socket.on('disconnect', () => {
				console.log(`Socket disconnected: ${socket.id}`);
			});
		});
	}

	/**
	 * Emit an event to a specific user's private room.
	 */
	public emitToUser(userId: string, event: string, data: any) {
		this.io.to(`user:${userId}`).emit(event, data);
	}

	/**
	 * Emit an event to all connected clients.
	 */
	public emitToAll(event: string, data: any) {
		this.io.emit(event, data);
	}
}
