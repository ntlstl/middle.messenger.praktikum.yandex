import Block from '../../../../core/block';
import { tmp } from './error.tpl';

export class Error404 extends Block {
  constructor() {
    super('main', {})
  }

  render() {
    return tmp({
      code: 404,
      text: 'Не туда попали',
      link: 'Назад к чатам'
    });
  }
}
