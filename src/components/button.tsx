
import * as React from "react";
import * as Radium from "radium";

export interface ButtonProps {
    onClick?(): void;
    color?: string;
    disabled?: boolean;
    hidden?: boolean;
    icon: string;
}

interface ButtonState {
}

export class Button extends React.Component<ButtonProps, ButtonState> {
    private element : HTMLButtonElement|null = null;

    constructor(props: ButtonProps) {
        super(props);

        this.state = {};
    }

    getStyle() {
        return {
            button: (color: string = "#ffffff") => {return{
                position: "relative" as "relative",
                border: "none",
                outline: "none",
                backgroundColor: "transparent",
                transition: "background-color 0.2s, opacity 0.2s",
                height: "100%",
                margin: "none",
                minWidth: "60px",
                padding: "10px 10px",
                color: "rgba(255,255,255,1)",
                fontSize: "20px",
                textAlign: "center" as "center",
                textShadow: "0px 0px 10px rgba(0,0,0,0.4)",
                boxSizing: "border-box" as "border-box",
                touchCallout: "none",
                userSelect: "none" as "none",
                opacity: 0.7,
                ":hover": {
                    opacity: 1,
                    backgroundColor: "rgba(255,255,255,0.04)",
                    outline: "solid 1.5px rgba(255,255,255,0.1)",
                    textShadow: "0px 0px 5px rgba(0,0,0,0.6)",
                    cursor: "pointer"
                },
                ":disabled": {
                    opacity: 0.3,
                    backgroundColor: "transparent",
                    cursor: "default"
                }
            }},
            icon: {
                display: "none",
                position: "absolute" as "absolute",
                left: "50%",
                top: "50%",
                fontSize: "18px",
                transform: "translate(-50%, -50%) scale(2.5)",
                opacity: 0.6,
                "@media screen and (max-width: 768px)": {
                    display: "block"
                }
            },
            buttonText: {
                marginLeft: "5px",
                "@media screen and (max-width: 768px)": {
                    display: "none"
                }
            }
        }
    }

    render() {
        if (this.props.hidden) {
            return null;
        }
        const style = this.getStyle();
        return (
            <button
                ref={(el) => this.element = el}
                style={style.button(this.props.color)}
                onClick={this.props.onClick}
                disabled={this.props.disabled}
            >
                <i style={style.icon} className={"fa fa-"+this.props.icon} aria-hidden="true"></i>
                <span style={style.buttonText}>{this.props.children}</span>
            </button>
        );
    }
}

export const RButton = Radium(Button);