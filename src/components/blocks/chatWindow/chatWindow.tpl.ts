import {compile} from 'handlebars';

const source = `
  <div class="board__header">
    <div class="header">
      <div class="header__image"></div>
      <p class="header__text"> {{ chatName }} </p>
      <button type="button" class="header__toggle toggle_button" />
      <button type="button" class="header_hidden header__link add_user" />
      <button type="button" class="header_hidden header__delete remove_user" />
    </div>      
  </div>

  <div class="board__main">
    {{{messageList}}}
  </div>
  <div class="board__footer">
    {{{boardForm}}}
  </div>
  {{{addPopup}}}
  {{{removePopup}}}
`;

export const tmp = compile(source);
