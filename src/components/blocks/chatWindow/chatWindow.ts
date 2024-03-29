import Block from '../../../core/block';
import { tmp } from './chatWindow.tpl';
import { chats } from '../../../api/ChatsAPI';
import { auth } from '../../../api/AuthAPI';
import { users } from '../../../api/UsersAPI';
import { AddUserForm } from '../../ui/forms/addUserForm';
import { router } from '../../../index';
import { BoardForm } from '../../ui/forms/boardForm';
import { CHATS } from '../../../utils/constants';
import { IChatWindow } from './IChatWindow';
import { IUser } from './IUser';
import { store } from '../../../core/store';
import { ActionTypes } from '../../../core/types';
import { MessageList } from '../messageList';
import WebSocketService from '../../../api/WebSocket';
import handleValidation from '../../../handles/handleValidation';

export class ChatWindow extends Block<IChatWindow> {
  constructor(props: IChatWindow) {
    super('div', {
      ...props,
      className: 'board',
      addPopup: new AddUserForm(),
      boardForm: new BoardForm(),
      events: {
        submit: (e: Event) => this._handleSubmit(e), 
        click: (e: Event) => this.handleClick(e)
      },
      handlers: [handleValidation]
    });
  }
  private _handleSubmit(e: Event) {
    e.preventDefault();
    const chatData: {users: Array<number>, chatId: number} = {
      users: [],
      chatId: Number(this.props.chatId)
    };
    const el: HTMLFormElement|null = e.target as HTMLFormElement;
    const button: HTMLFormElement|null = el.querySelector('.button') as HTMLFormElement;

    if (el) {
      if (el.name === 'message') {
        this.send(el);
      } else if (button?.textContent === 'Добавить') {
        this.searchUser(chatData).then(() => this.addUser(chatData));
      } else if (button?.textContent === 'Удалить') {
        this.searchUser(chatData).then(() => this.removeUser(chatData));
      }
      el.reset();
    }
  }

  openPopup(selector: string, label: string) {
    const popup = document.querySelector(selector) as HTMLElement;
    const button: HTMLElement = popup.querySelector('.button') as HTMLElement;

    if (button) {
      button.textContent = label;
    }
    popup.classList.add('popup_active');
  }

  closePopup() {
    const popup = document.querySelector('.popup_active') as HTMLElement;
    popup.classList.remove('popup_active');
  }

  handleClick(e: Event) {
    const el: HTMLElement|null = e.target as HTMLElement;
    const bt1 = document.querySelector('.add_user') as HTMLElement;
    const bt2 = document.querySelector('.remove_user') as HTMLElement;
    if (el) {
      if (el === document.querySelector('.toggle_button')) {
        if (bt1.classList.contains('header_hidden')) {
          bt1?.classList.remove('header_hidden');
          bt2?.classList.remove('header_hidden');
        } else {
          bt1?.classList.add('header_hidden');
          bt2?.classList.add('header_hidden');
        }
      }

      if (el === document.querySelector('.add_user')) {
        this.openPopup('.add-remove-user-popup', 'Добавить');
      }
  
      if (el.classList.contains('popup_active')) {
        this.closePopup();
        bt1?.classList.add('header_hidden');
        bt2.classList.add('header_hidden');
      }
  
      if (el === document.querySelector('.remove_user')) {
        this.openPopup('.add-remove-user-popup', 'Удалить');
      } 
    }
  }

  async componentDidMount() {
    await this.getChatToken();
    await this.getUserInfo();
    const {userId, chatId, chatToken } = this.props;
    this._connectToChat({userId, chatId, chatToken});
    store.subscribe(ActionTypes.GET_CHAT_MESSAGES, this.setmessageList.bind(this));
    store.dispatchAction(ActionTypes.GET_CHAT_TOKEN, chatToken);
  }

  setmessageList() {
    this.setProps({
      ...this.props,
      messageList: store.get('messageList')
    });
  }

  async getChatToken() {
    const result = await chats.getChatToken(this.props.chatId.toString());
    const token: {[key:string]:string} = result.response;
    this.setProps({...this.props, chatToken: JSON.parse(token).token});
  }

  async getUserInfo() {
    const result = await auth.getUser();
    const userInfo = JSON.parse(result.response);
    this.setProps({...this.props, userId: userInfo.id});
  }

  renderMessageList() {
    return new MessageList({...this.props}).render();
  }

  async addUser(data: {users: Array<Object>}) {
    if (data.users.length === 0) {
      alert('Пользователь не найден');
    }
    await chats.addUsers({ data });
    router.go(CHATS);
  }

  async removeUser(data: {users: Array<number>, chatId: number}) {
    if (data.users.length === 0) {
      alert('Пользователь не найден');
    }
    await chats.deleteUsers({data});
    router.go(CHATS);
  }

  async searchUser(data: {users: Array<number>, chatId: number}) {
    const userLoginInput: HTMLInputElement = document.querySelector('.add-remove-user')!;
    const userLogin = userLoginInput.value;
    const searchByLoginData = {
      login: userLogin
    };
    const result = await users.searchByLogin({data: searchByLoginData});
    const userDate: Array<User> = JSON.parse(result.response);
    const user: IUser = userDate[0];
    if (user) {
      return data.users.push(user.id);
    }
  }

  send(form: HTMLElement) {
    const data: {[key: string]: string} = {};
    Array.from(form.querySelectorAll('.input')).forEach((input: HTMLInputElement) => {
      const name = input.getAttribute('name');
      if (name) {
        data[name] = input.value;
      }
    });
    const { message } = data;
    this._sendChatMessage(message);
  }

  private _connectToChat(props: {userId: number, chatId: number, chatToken: string}) {
    const {userId, chatId, chatToken} = props;
    new WebSocketService(userId, chatId, chatToken);
  }
  
  private _sendChatMessage(message: string) {
    if (message === '') {
      return;
    }
    new WebSocketService().send({
      content: message,
      type: 'message',
    });
  }

  render() {
    const { chatName, addPopup, boardForm } = this.props;
    return tmp({
      chatName,
      boardForm: boardForm.render(),
      addPopup: addPopup.render(),
      messageList: this.renderMessageList()
    })
  }
}

