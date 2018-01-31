
import * as React from "react";
import * as Radium from "radium";

const style = {
    entry: {
        position: "relative" as "relative",
        width: "calc(100% - 31px)",
        height: "100px",
        margin: "15px 0px",
        padding: "0px 10px 0px 20px",
        borderTop: "solid 1px rgba(0, 0, 0, 0.3)",
        borderBottom: "solid 1px rgba(0, 0, 0, 0.3)",
        overflow: "hidden" as "hidden"
    },
    title: {
        fontSize: "20px",
        fontFamily: "Montserrat, bold",
        textAlign: "left",
        lineHeight: "100px",
        verticalAlign: "center"
    },
    background: (thumbnail: string) => {return{
        position: "absolute" as "absolute",
        left: "0",
        top: "0",
        width: "100%",
        height: "100%",
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundImage: `url(${thumbnail})`,
        filter: "blur(2px) brightness(70%) grayscale(30%)",
        transition: "filter 0.2s",
        opacity: 0.2,
        ":hover": {
            filter: "blur(20px) brightness(20%) grayscale(80%)"
        }
    };}
}

enum VideoStatus {

}

export interface VideoEntryProps {
    id: string;
    title: string;
    filename: string;
    thumbnail: string;
}

interface VideoEntryState {
    status: VideoStatus;
}

export const VideoEntry = Radium(class extends React.Component<VideoEntryProps, VideoEntryState> {
    render() {
        return (
            <div style={style.entry} key={this.props.id}>
                <div style={style.background(this.props.thumbnail)} />
                <div style={style.title}>
                    {this.props.title}
                </div>
            </div>
        );
    }
});