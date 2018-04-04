
import * as React from "react";
import * as Radium from "radium";

const style = {
    header: {
        userSelect: "none" as "none",
        "@media screen and (max-width: 880px)": {
            width: "75px"
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
        "@media screen and (max-width: 880px)": {
            width: "100%"
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
        "@media screen and (max-width: 880px)": {
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