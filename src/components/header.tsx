
import * as React from "react";
import * as Radium from "radium";

const style = {
    header: {
        borderRight: "solid 1px rgba(0,0,0,0.3)",
        userSelect: "none",
    },
    icon: {
        float: "left",
        marginLeft: "18px",
        marginRight: "-13px",
        height: "100%",
        width: "25%",
        backgroundImage: "url(./img/Logo_250.png)",
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center"
    },
    title: {
        display: "block",
        float: "left",
        height: "70px",
        width: "70%",
        textAlign: "center",
        lineHeight: "70px",
        fontSize: "33px",
        fontFamily: "Dhurjati, sans-serif",
        color: "#ffffff",
        verticalAlign: "center"
    }
}


export interface HeaderProps {
    name: string;
}

export const Header = Radium(class extends React.Component<HeaderProps> {

    render() {
        return (
            <div style={style.header}>
                <div style={style.icon} />
                <div style={style.title}>
                    {this.props.name}
                </div>
            </div>
        );

    }
});