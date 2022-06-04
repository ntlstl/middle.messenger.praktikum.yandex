import {compile} from "handlebars";
import {tmp} from "./edit-pass.tpl";
import Block from '../../../core/block';
import {Props} from '../../../core/types';

interface IProfileEditPassOptions extends Props {
	type?: string;
	text?: string;
	class?: string;
}

export default class ProfileEditPass extends Block {
  constructor(props: IProfileEditPassOptions) {
    super(props);
    this.props = props;
  }
  public render() {
    return compile(tmp, 
    { noEscape: true })(this.props);
  }
}
