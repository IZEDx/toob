
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

    },
    title: {
        fontSize: "20px",
        fontFamily: "Montserrat, bold",
        textAlign: "left",
        lineHeight: "100px",
        verticalAlign: "center"
    },
    background: (thumbnail: string) => {return{
        zIndex: -1,
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
    }},
    buttonContainer: {
        justifySelf: "right"
    },
    button: () => {return{
        border: "none",
        outline: "none",
        backgroundColor: "transparent",
        transition: "background-color 0.2s, opacity 0.2s",
        height: "100px",
        margin: "none",
        padding: "10px 10px",
        color: "#ffffff",
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

interface ButtonState {
    hidden: boolean;
    disabled: boolean;
    text: string;
}

interface VideoEntryState {
    status: VideoStatus;
    download: ButtonState;
    convert: ButtonState;
    saveMp4: ButtonState;
    saveMp3: ButtonState;
}

export const VideoEntry = Radium(class extends React.Component<VideoEntryProps, VideoEntryState> {
    video: Uint8Array = null as any;
    audio: Uint8Array = null as any;

    constructor(props: VideoEntryProps) {
        super(props);

        this.state = {
            status: VideoStatus.added,
            download: {
                disabled: false,
                hidden: false,
                text: `Download`
            },
            convert: {
                disabled: false,
                hidden: true,
                text: `Convert to MP3`
            },
            saveMp4: {
                disabled: false,
                hidden: true,
                text: `Save as MP4`
            },
            saveMp3: {
                disabled: false,
                hidden: true,
                text: `Save as MP3`
            },
        };
    }

    async download() {
        this.setState({
            download: {
                disabled: true,
                hidden: false,
                text: "Downloading..."
            }
        });
        try {
            this.video = await downloadVideo(this.props.id);
            this.setState({
                status: VideoStatus.downloaded,
                download: {
                    disabled: true,
                    hidden: true,
                    text: ""
                },
                convert: {
                    disabled: false,
                    hidden: false,
                    text: "Convert to MP3"
                },
                saveMp4: {
                    disabled: false,
                    hidden: false,
                    text: "Save as MP4"
                }
            });
        } catch(err) {
            console.error(err);
            this.setState({
                download: {
                    disabled: false,
                    hidden: false,
                    text: "Download"
                }
            });
        }
    }

    async convert() {
        this.setState({
            convert: {
                disabled: true,
                hidden: false,
                text: "Converting..."
            }
        });
        try {
            const ffmpeg = FFmpegWorker.singleton();
            this.audio = await ffmpeg.convertToMp3(this.video);
            this.setState({
                status: VideoStatus.converted,
                convert: {
                    disabled: true,
                    hidden: true,
                    text: ""
                },
                saveMp3: {
                    disabled: false,
                    hidden: false,
                    text: "Save as MP3"
                }
            });
        } catch(err) {
            console.error(err);
            this.setState({
                convert: {
                    disabled: false,
                    hidden: false,
                    text: "Convert to MP3"
                }
            });
        }
    }

    async saveMp3() {
        saveToFile(this.audio, this.props.filename + ".mp3");
    }

    async saveMp4() {
        saveToFile(this.video, this.props.filename + ".mp4");
    }

    private renderDownloadButton() {
        if (!this.state.download.hidden) {
            return (
                <button
                    key={this.props.id+"download"} 
                    style={style.button()}
                    onClick={() => this.download()}
                    disabled={this.state.download.disabled}
                >
                    <i className="fa fa-download" aria-hidden="true"></i>
                    &nbsp; {this.state.download.text}
                </button>
            );
        } else {
            return;
        }
    }

    private renderConvertButton() {
        if (!this.state.convert.hidden) {
            return (
                <button
                    key={this.props.id+"convert"} 
                    style={style.button()}
                    onClick={() => this.convert()}
                    disabled={this.state.convert.disabled}
                >
                    <i className="fa fa-music" aria-hidden="true"></i>
                    &nbsp; {this.state.convert.text}
                </button>
            );
        } else {
            return;
        }
    }

    private renderSaveMp3Button() {
        if (!this.state.saveMp3.hidden) {
            return (
                <button
                    key={this.props.id+"saveMp3"} 
                    style={style.button()}
                    onClick={() => this.saveMp3()}
                    disabled={this.state.saveMp3.disabled}
                >
                    <i className="fa fa-music" aria-hidden="true"></i>
                    &nbsp; {this.state.saveMp3.text}
                </button>
            );
        }
    }

    private renderSaveMp4Button() {
        if (!this.state.saveMp4.hidden) {
            return (
                <button
                    key={this.props.id+"savemp4"} 
                    style={style.button()}
                    onClick={() => this.saveMp4()}
                    disabled={this.state.saveMp4.disabled}
                >
                    <i className="fa fa-film" aria-hidden="true"></i>
                    &nbsp; {this.state.saveMp4.text}
                </button>
            );
        } else {
            return <div />
        }
    }

    render() {
        return (
            <div style={style.entry}>
                <div style={style.background(this.props.thumbnail)} />
                <div style={style.title}>
                    {this.props.title}
                </div>
                <div style={style.buttonContainer}>
                    {this.renderDownloadButton()}
                    {this.renderConvertButton()}
                    {this.renderSaveMp3Button()}
                    {this.renderSaveMp4Button()}
                </div>
            </div>
        );
    }
});