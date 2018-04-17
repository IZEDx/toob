import '@stencil/core';
import { Component, Prop, Event, EventEmitter } from '@stencil/core';

@Component({
	tag: 'toob-button',
	styleUrl: 'toob-button.scss'
})
export class ToobButton {

    @Event() onClick: EventEmitter<MouseEvent>;

    @Prop() color?: string;
    @Prop() disabled?: boolean;
    @Prop() hidden?: boolean;
    @Prop() icon: string;

	componentDidLoad() {
	}

	render() {
		return this.hidden ? undefined : (
            <button
                onClick={(e) => this.onClick.emit(e)}
                disabled={this.disabled}
            >
                <i class={"fa fa-"+this.icon} aria-hidden="true"></i>
                <span><slot /></span>
            </button>
		);
	}
}
