
import * as React from "react";
import * as Radium from "radium";

const style = {
    header: {
        userSelect: "none" as "none",
        overflow: "hidden" as "hidden",
        "@media screen and (max-width: 768px)": {
            width: "92px"
        }
    },
    icon: {
        float: "left" as "left",
        marginLeft: "18px",
        marginRight: "-13px",
        height: "100%",
        width: "25%",
        backgroundImage: "url(./img/Logo_250.png)",
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat" as "no-repeat",
        backgroundPosition: "center",
        transition: "width 0.1s",
        "@media screen and (max-width: 768px)": {
            width: "calc(100% - 18px)"
        }
    },
    title: {
        display: "block",
        float: "left" as "left",
        height: "70px",
        width: "70%",
        textAlign: "center" as "center",
        lineHeight: "70px",
        fontSize: "33px",
        fontFamily: "Dhurjati, sans-serif",
        color: "#ffffff",
        verticalAlign: "center",
        "@media screen and (max-width: 770px)": {
            display: "none"
        }
    }
}


export const Header = Radium(class extends React.Component {

    render() {
        return (
            <div style={style.header}>
                <div style={style.icon} />
                <div style={style.title}>
                    {this.props.children}
                </div>
            </div>
        );

    }
});