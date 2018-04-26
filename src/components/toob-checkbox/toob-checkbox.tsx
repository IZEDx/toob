import '@stencil/core';
import { Component, State, Prop, Event, Listen, EventEmitter } from '@stencil/core';


@Component({
	tag: 'toob-checkbox',
	styleUrl: 'toob-checkbox.scss'
})
export class ToobCheckbox {

    @Event() changed: EventEmitter<boolean>;

    @Prop() checked? = false;
    @State() value = false;

	componentDidLoad() {
        this.value = !!this.checked
    }

    @Listen("click")
    handleClick() {
        this.value = !this.value;
        this.changed.emit(this.value);
    }
        
	render() {
		return (
            <button>
                <div class="checkbox">
                    { this.value && <i class="fa fa-check"></i> || "" }
                </div>
                <slot />
            </button>
		);
	}
}
