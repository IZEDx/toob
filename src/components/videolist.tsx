
import * as React from "react";
import * as Radium from "radium";

const style = {
    container: {
        boxSizing: "border-box",
        gridColumn: "1/span 2",
        overflow: "auto" as "auto"
    },
    list: {

    }
}


export interface VideoListProps {
}


export const VideoList = Radium(class extends React.Component<VideoListProps> {
    render() {
        return (
            <div style={style.container}>
                <div style={style.list}>
                    { this.props.children }
                </div>
            </div>
        );
    }
});
