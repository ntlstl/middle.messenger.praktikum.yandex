import { WEB_SOCKET_URL } from '../utils/constants';
import { IMessage } from './Imessage';
import { store } from '../core/store';
import { ActionTypes } from '../core/types';

export default class WebSocketService {
  static _instance: WebSocketService;
  private _socket;
  userId: number;

  constructor(userId?: number, chatId?: number, chatToken?: string) {
    if (userId && chatId && chatToken) {
      this._socket?.close();
      // eslint-disable-next-line max-len
      this._socket = new WebSocket(`${WEB_SOCKET_URL}${userId}/${chatId}/${chatToken}`);
      this._socket.addEventListener('open', this.onOpen.bind(this));
      this._socket.addEventListener('message', this.onMessage.bind(this));
      this._socket.addEventListener('error', this.onError.bind(this));
      this._socket.addEventListener('close', this.onClose.bind(this));
    }
    if (WebSocketService._instance) {
      return WebSocketService._instance;
    }
    WebSocketService._instance = this;
    this.userId = Number(userId);
  }

  send(payload: IMessage): void {
    console.log('Message sent');
    this._socket?.send(JSON.stringify(payload));
  }

  onOpen(): void {
    console.log('Connection established');
    this.send({
      content: '0',
      type: 'get old'
    });
  }

  onMessage(event:  {[key:string]:string}): void {
    console.log('Data received: ', event);

    let data = JSON.parse(event.data);
    if (data.type === 'user connected') {
      return;
    }
    const configureData = (data: Record<string, unknown>) => ({
      ...data, 
      // incoming: data.user_id !== this.userId
    });
    if (Array.isArray(data)) {
      data = data.map((item: Record<string, unknown>) => configureData(item));
      data.reverse();
    } else {
      data = configureData(data);
    }
    store.dispatchAction(ActionTypes.GET_CHAT_MESSAGES, data);
  }

  onError(event: {[key:string]: object}): void {
    console.log('Error: ', event.message);
  }

  onClose(event: {[key:string]: object}): void {
    if (event.wasClean) {
      console.log('Connection closed');
    } else {
      console.log('Connection interrupted');
    }
    console.log(`Event code: ${event.code}`);
    console.log(`Event reason: ${event.reason}`);
  }
}
