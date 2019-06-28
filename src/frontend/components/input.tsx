import { Component, h } from "preact";

export interface InputProps {
    placeholder?: string;
    type?: string;
    value?: string;
    onChanged: (value: string) => void;
    onSubmit: () => void;
}

interface InputState {
    value: string;
}

export class Input extends Component<InputProps, InputState> {
    
    constructor(props: InputProps) {
        super(props);
        this.state = {value: this.props.value || ""};
    }

    onChanged(value: string)
    {
        this.setState({value});
        this.props.onChanged(value);
    }

    render() {
        return (
            <input 
                type={this.props.type || "text"} placeholder={this.props.placeholder || ""}
                value={this.props.value || this.state.value} 
                onChange={(evt: any) => this.onChanged(evt.target.value)}
                onKeyUp={e => e.keyCode === 13 && this.props.onSubmit()} 
            />
        );
    }
}
