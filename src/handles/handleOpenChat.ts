import { ChatWindow } from '../components/blocks/chatWindow/chatWindow';
import { BoardForm } from '../components/ui/forms/boardForm';
import { Header } from '../components/blocks/header';
import { Popup } from '../components/ui/popup';
import { Form } from '../components/ui/forms/form';

export default function handleOpenChat(element: HTMLElement, className = '.card') {
  const card: Array<HTMLElement> = Array.from(element.querySelectorAll(className));
  card.forEach((item: HTMLElement) => {
    item.addEventListener('click', (evt: Event) => {
      evt.preventDefault();
      evt.stopPropagation();
      const el: HTMLElement|null = evt.target as HTMLElement
      
      if (el) {
        const container:HTMLElement|null = el.closest('.card');
        const x:HTMLElement|null = container?.querySelector('.card__title') as HTMLElement;
        const textContent: string = x?.textContent!;

        const chatWindow: ChatWindow = new ChatWindow({
          chatName: textContent,
          chatId: Number(container?.dataset.chatId),
          className: '',
          addPopup: new Popup(new Form(), ''),
          boardForm: new BoardForm(),
          events: {},
          header: new Header({chatName: textContent}),
          handlers: [],
          chatToken: '',
          userId: 0
        });

        const chatsPage = document.querySelector('.chat')!;
        const chooseChatWindow = document.querySelector('.board')!;
        chatsPage.removeChild(chooseChatWindow);
        chatsPage.appendChild(chatWindow.getContent()!);
      }
    });
  });
}