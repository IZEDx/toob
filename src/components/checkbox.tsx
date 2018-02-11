
import * as React from "react";
import * as Radium from "radium";

export interface CheckboxProps {
    label: string;
    checked?: boolean;
    onChanged: (checked: boolean) => void;
}

interface CheckboxState {
    checked: boolean
}

export class Checkbox extends React.Component<CheckboxProps, CheckboxState> {
    
    constructor(props: CheckboxProps) {
        super(props);

        this.state = {
            checked: !!props.checked
        };
    }

    getStyle() {
        return {
            button: {
                position: "relative" as "relative",
                paddingLeft: 35,
                boxSizing: "border-box",
                border: "none",
                outline: "none",
                backgroundColor: "transparent",
                color: "rgba(255,255,255,0.4)"
            },
            box: {
                position: "absolute" as "absolute",
                left: 5,
                top: 5,
                width: 25,
                height: 25,
                boxSizing: "border-box",
                border: "solid 0.5px rgba(255, 255,255, 0.2)",
                color: "rgba(255,255,255,0.5)",
                fontSize: "25px",
                lineHeight: "25px",
                verticalAlign: "center"
            }
        }
    }

    componentDidMount() {
    }

    handleClick() {
        this.props.onChanged(!this.state.checked)
        this.setState({
            checked: !this.state.checked
        });
        
    }

    render() {
        const style = this.getStyle();
        return (
            <button 
                style={style.button}
                onClick={this.handleClick.bind(this)}
            >
                <div style={style.box}>
                    { this.state.checked && <i className="fa fa-check"></i> || "" }
                </div>
                { this.props.label }
            </button>
        );
    }
}

export const RCheckbox = Radium(Checkbox);