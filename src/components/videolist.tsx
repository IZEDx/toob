
import * as React from "react";
import * as Radium from "radium";

const style = {
    container: {
        boxSizing: "border-box",
        gridColumn: "1/span 2",
        overflow: "auto" as "auto"
    },
    list: {

    },
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
    entryTitle: {
        fontSize: "20px",
        fontFamily: "Montserrat, bold",
        textAlign: "left",
        lineHeight: "100px",
        verticalAlign: "center"
    },
    entryBackground: {
        position: "absolute" as "absolute",
        left: "0",
        top: "0",
        width: "100%",
        height: "100%",
        backgroundSize: "cover",
        backgroundPosition: "center center",
        filter: "blur(2px) brightness(70%) grayscale(30%)",
        transition: "filter 0.2s",
        opacity: "0.2",
        ":hover": {
            filter: "blur(20px) brightness(20%) grayscale(80%)"
        }
    }
}

export interface VideoEntry {
    id: string;
    title: string;
    filename: string;
    thumbnail: string;
}

export interface VideoListProps {
    entries: VideoEntry[];
}

export const VideoList = Radium(class extends React.Component<VideoListProps> {

    renderListEntries() {
        console.log(this.props);
        return this.props.entries.map(entry => {
            const entryStyle = {
                backgroundImage: `url(${entry.thumbnail})`
            }
            console.log(entry);
            return (
                <div style={style.entry} key={entry.id}>
                    <div style={[style.entryBackground, entryStyle]} />
                    <div style={style.entryTitle}>
                        {entry.title}
                    </div>
                </div>
            );
        });
    }

    render() {
        return (
            <div style={style.container}>
                <div style={style.list}>
                    { this.renderListEntries() }
                </div>
            </div>
        );
    }
});