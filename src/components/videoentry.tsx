
import * as React from "react";
import * as Radium from "radium";
import { downloadVideo } from "../libs/youtube";
import { FFmpegWorker } from "../libs/ffmpeg";
import { saveToFile } from "../libs/utils";

const style = {
    entry: {
        boxSizing: "border-box",
        position: "relative" as "relative",
        width: "calc(100%)",
        height: "100px",
        margin: "15px 0px",
        padding: "0px 15px",
        borderTop: "solid 1px rgba(0, 0, 0, 0.3)",
        borderBottom: "solid 1px rgba(0, 0, 0, 0.3)",
        overflow: "hidden" as "hidden",
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gridTemplateRows: "100px",
        transition: "background-color 0.2s",
        ":hover": {
            backgroundColor: "rgba(0,0,0,0.2)"
        }
    },
    title: {
        fontSize: "20px",
        fontFamily: "Montserrat, bold",
        textAlign: "left",
        lineHeight: "100px",
        verticalAlign: "center"
    },
    background: (thumbnail: string, hover: boolean = false) => {return{
        zIndex: -1,
        position: "absolute" as "absolute",
        left: "0",
        top: "0",
        width: "100%",
        height: "100%",
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundImage: `url(${thumbnail})`,
        filter: "blur(10px) brightness(70%) grayscale(40%)",
        opacity: 0.2
    }},
    buttonContainer: {
        justifySelf: "right"
    },
    button: (color: string = "#ffffff") => {return{
        border: "none",
        outline: "none",
        backgroundColor: "transparent",
        transition: "background-color 0.2s, opacity 0.2s",
        height: "100px",
        margin: "none",
        padding: "10px 10px",
        color: color,
        fontSize: "20px",
        textAlign: "center",
        boxSizing: "border-box",
        touchCallout: "none",
        userSelect: "none",
        ":hover": {
            backgroundColor: "rgba(255,255,255,0.1)",
            outline: "solid 1.5px rgba(0,0,0,0.2)",
            cursor: "pointer"
        },
        ":disabled": {
            opacity: "0.3",
            backgroundColor: "transparent",
            cursor: "default"
        }
    }}
}

enum VideoStatus {
    added, downloaded, converted
}

export interface VideoEntryProps {
    id: string;
    title: string;
    filename: string;
    thumbnail: string;
}

class ButtonState {
    constructor(
        public hidden: boolean,
        public disabled: boolean,
        public text: string
    ) {}
}

interface VideoEntryState {
    status: VideoStatus;
    download: ButtonState;
    convert: ButtonState;
    saveMp4: ButtonState;
    saveMp3: ButtonState;
}

export interface IVideoEntry extends React.Component<VideoEntryProps, VideoEntryState> {
    video: Uint8Array;
    audio: Uint8Array;
    download(): Promise<void>;
    convert(): Promise<void>;
    saveMp3(): Promise<void>;
    saveMp4(): Promise<void>;
}

export const VideoEntry = Radium(class extends React.Component<VideoEntryProps, VideoEntryState> implements IVideoEntry {
    video: Uint8Array = null as any;
    audio: Uint8Array = null as any;

    constructor(props: VideoEntryProps) {
        super(props);

        this.state = {
            status: VideoStatus.added,
            download: new ButtonState(false, false, "Download"),
            convert: new ButtonState(true, false, "Convert to MP3"),
            saveMp3: new ButtonState(true, false, "Save as MP3"),
            saveMp4: new ButtonState(true, false, "Save as MP4")
        };
    }

    async download() {
        this.setState({
            download: new ButtonState(false, true, "Downloading...")
        });
        try {
            this.video = await downloadVideo(this.props.id);
            this.setState({
                status: VideoStatus.downloaded,
                download: new ButtonState(true, true, ""),
                convert: new ButtonState(false, false, "Convert to MP3"),
                saveMp4: new ButtonState(false, false, "Save as MP4")
            });
        } catch(err) {
            console.error(err);
            this.setState({
                download: new ButtonState(false, false, "Download")
            });
        }
    }

    async convert() {
        this.setState({
            convert: new ButtonState(false, true, "Converting...")
        });
        try {
            const ffmpeg = FFmpegWorker.singleton();
            this.audio = await ffmpeg.convertToMp3(this.video);
            this.setState({
                status: VideoStatus.converted,
                convert: new ButtonState(true, true, ""),
                saveMp3: new ButtonState(false, false, "Save as MP3")
            });
        } catch(err) {
            console.error(err);
            this.setState({
                convert: new ButtonState(false, false, "Convert to MP3")
            });
        }
    }

    async saveMp3() {
        saveToFile(this.audio, this.props.filename + ".mp3");
    }

    async saveMp4() {
        saveToFile(this.video, this.props.filename + ".mp4");
    }

    private renderButton(name: keyof VideoEntryState, icon: string, color?: string) {
        const state = this.state[name];
        if (!(state instanceof ButtonState) || state.hidden) return;

        return (
            <button
                key={this.props.id+name} 
                style={style.button(color)}
                onClick={() => this[name]()}
                disabled={state.disabled}
            >
                <i className={"fa fa-"+icon} aria-hidden="true"></i>
                &nbsp; {state.text}
            </button>
        );
    }

    render() {
        return (
            <div style={style.entry}>
                <div style={style.background(this.props.thumbnail)} />
                <div style={style.title}>
                    {this.props.title}
                </div>
                <div style={style.buttonContainer}>
                    { this.renderButton("download", "music") }
                    { this.renderButton("convert", "music", "rgb(200, 200, 50)") }
                    { this.renderButton("saveMp3", "music", "rgb(200, 200, 50)") }
                    { this.renderButton("saveMp4", "film", "rgb(50, 200, 50)") }
                </div>
            </div>
        );
    }
});