import { Component, h } from "preact";

export interface CheckboxProps {
    label: string;
    checked?: boolean;
    onChanged: (checked: boolean) => void;
}

interface CheckboxState {
    checked: boolean
}

export class Checkbox extends Component<CheckboxProps, CheckboxState> {
    
    constructor(props: CheckboxProps) {
        super(props);

        this.state = {
            checked: !!props.checked
        };
    }

    componentDidMount() {
    }

    handleClick() {
        const checked = !this.state.checked;
        this.setState({checked});
        this.props.onChanged(checked)
    }

    render() {
        return (
            <button 
                className="checkbox"
                onClick={this.handleClick.bind(this)}
            >
                <div className="box">
                    { this.state.checked && <i className="fa fa-check"></i> || "" }
                </div>
                { this.props.label }
            </button>
        );
    }
}
