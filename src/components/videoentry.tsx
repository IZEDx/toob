
import * as React from "react";
import * as Radium from "radium";
import * as sanitize from "sanitize-filename";

import { FFmpegWorker } from "../libs/ffmpeg";
import { saveToFile, downloadFile } from "../libs/utils";
import { parse, IParseResult } from "../libs/parser"; 
import { SearchResult } from "./search";
import { RButton } from "./button";

const style = {
    entry: {
        boxSizing: "border-box" as "border-box",
        position: "relative" as "relative",
        width: "calc(100% - 2px)",
        height: "100px",
        margin: "15px 1px",
        padding: "0px 14px",
        borderTop: "solid 1px rgba(0, 0, 0, 0.3)",
        borderBottom: "solid 1px rgba(0, 0, 0, 0.3)",
        overflow: "hidden" as "hidden",
        display: "flex",
        flexDirection: "row" as "row",
        flexWrap: "nowrap" as "nowrap",
        flexAlign: "stretch" as "stretch",
        justifyContent: "stretch" as "stretch",
        backgroundColor: "rgba(24, 25, 26, 0.5)",
        transition: "background-color linear 0.2s",
        ":hover": {
            backgroundColor: "rgba(0,0,0,0.6)"
        }
    },
    title: {
        fontSize: "22px",
        fontFamily: "Montserrat, bold",
        textAlign: "left" as "left",
        lineHeight: "100px",
        verticalAlign: "center",
        flexShrink: 1,
        flexGrow: 1
    },
    interprets: {
        fontSize: "17px",
        marginRight: "10px",
        opacity: 0.8
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
        filter: "blur(15px)",
        opacity: 0.5
    }},
    progressbar: (progress: number) => {return{
        zIndex: 0,
        position: "absolute" as "absolute",
        left: "0",
        bottom: "0",
        width: progress+"%",
        height: "3px",
        backgroundColor: "rgba(50, 220, 50, 0.35)",
        transition: "width 0.5s linear"
    }},
    buttonContainer: {
        flexShrink: 0,
        backfaceVisibility: "hidden" as "hidden",
        perspective: 1000,
        transform: "translate3d(0,0,0)"
    }
}

export enum VideoStatus {
    added, downloading, downloaded, converting, converted
}

class ButtonState {
    constructor(
        public hidden: boolean,
        public disabled: boolean,
        public text: string
    ) {}
}

interface VideoEntryProps {
    onStatusUpdate?: (video: IVideoEntry, status: VideoStatus) => void;
}

interface VideoEntryState {
    status: VideoStatus;
    download: ButtonState;
    saveMp4: ButtonState;
    saveMp3: ButtonState;
    progress: number;
}

export interface IVideoEntry extends React.Component<SearchResult, VideoEntryState> {
    video: Uint8Array|null;
    audio: Uint8Array|null;
    download(): Promise<void>;
    convert(): Promise<void>;
    saveMp3(): Promise<void>;
    saveMp4(): Promise<void>;
}


export const VideoEntry = Radium(class extends React.Component<SearchResult&VideoEntryProps, VideoEntryState> implements IVideoEntry {
    video: Uint8Array|null = null;
    audio: Uint8Array|null = null;
    private titlestring = "";
    private onStatusUpdate = () => {};
    title: IParseResult|string = "";
    private progressBarTimer: number|null = null;

    constructor(props: SearchResult&VideoEntryProps) {
        super(props);

        this.state = {
            status: VideoStatus.added,
            download: new ButtonState(false, false, "Download"),
            saveMp3: new ButtonState(true, false, ".mp3"),
            saveMp4: new ButtonState(true, false, ".mp4"),
            progress: 0
        };

        setImmediate(async () => {
            if (this.video) {
                await this.download();
            }

            if (this.audio) {
                await this.convert();
            }
        });
    }

    componentDidMount() {
        if ( this.props.onStatusUpdate ) {
            this.props.onStatusUpdate(this, this.state.status);
        }
    }

    private updateState(state: any): Promise<void> {
        return new Promise((resolve, reject) => 
            this.setState(state, () => {
                if ( this.props.onStatusUpdate !== undefined && state.status !== undefined ) {
                    this.props.onStatusUpdate(this, state.status);
                    this.onStatusUpdate();
                }
                resolve();
            }));
    }

    async download() {
        if (this.state.status === VideoStatus.downloading) {
            return new Promise<void>(res => {
                this.onStatusUpdate = () => {
                    this.onStatusUpdate = () => {};
                    res();
                }
            });
        }

        this.updateState({
            status: VideoStatus.downloading,
            download: new ButtonState(false, true, "Downloading...")
        });
        
        try {
            if (!this.video) {
                this.video = await downloadFile(this.props.file.url, e => {
                    this.updateState({
                        progress: 100 / e.total * e.loaded
                    });
                });
            }

            this.updateState({
                status: VideoStatus.downloaded,
                download: new ButtonState(true, true, ""),
                saveMp3: new ButtonState(false, false, ".mp3"),
                saveMp4: new ButtonState(false, false, ".mp4")
            });
        } catch(err) {
            console.error(err);

            this.updateState({
                download: new ButtonState(false, false, "Download")
            });
        }
        if (this.progressBarTimer) {
            clearTimeout(this.progressBarTimer);
        }
        this.progressBarTimer = setTimeout(() => {
            this.updateState({
                progress: 0
            });
        }, 500) as any;
    }

    async convert(): Promise<void> {
        if (this.state.status === VideoStatus.converting) {
            return new Promise<void>(res => {
                this.onStatusUpdate = () => {
                    this.onStatusUpdate = () => {};
                    res();
                }
            });
        }

        if (this.state.status <= VideoStatus.downloading) {
            await this.download();
        }

        if (!this.video) {
            return;
        }

        if (this.progressBarTimer) {
            clearTimeout(this.progressBarTimer);
        }

        this.updateState({
            status: VideoStatus.converting,
            saveMp3: new ButtonState(false, true, "Waiting..."),
            progress: 0
        });

        try {
            if (!this.audio) {
                const ffmpeg = FFmpegWorker.singleton();
                let started = false;
                this.audio = await ffmpeg.convertToMp3(this.video, progress => {
                    if (!started) {
                        started = true;
                        this.updateState({
                            saveMp3: new ButtonState(false, true, "Converting..."),
                            progress
                        });
                    } else {
                        this.updateState({
                            progress
                        });
                    }
                });
            }

            this.updateState({
                status: VideoStatus.converted,
                saveMp3: new ButtonState(false, false, ".mp3")
            });
        } catch(err) {
            console.error(err);
            
            this.updateState({
                status: VideoStatus.downloaded,
                saveMp3: new ButtonState(false, false, ".mp3")
            });
        }
        setTimeout(() => {
            this.updateState({
                progress: 0
            });
        }, 500) as any;
    }

    async saveMp3() {
       if ( this.state.status < VideoStatus.converted ) {
            if ( this.state.status < VideoStatus.converting ) {
                await this.convert();
            } else {
                await new Promise(res => {
                    this.onStatusUpdate = () => {
                        this.onStatusUpdate = () => {};
                        res();
                    }
                });
            }
        }

        if ( !this.audio ) {
            return;
        }

        if ( typeof this.title === "string" ) {

            saveToFile(this.audio, sanitize(this.props.title + ".mp3"));

        } else {
            
            const tags = this.title.tags
                .filter(s => s.toLowerCase().indexOf("remix") !== -1)
                .map(s => `(${s})`)
                .join(" ");

            saveToFile(this.audio, sanitize(`${this.title.interprets.join(" & ")} - ${(this.title.title + " " + tags).trim()}.mp3`));
        }
    }

    async saveMp4() {
        if ( !this.video ) {
            return;
        }
        saveToFile(this.video, sanitize(this.props.title) + ".mp4");
    }

    renderTitle() {
        if (typeof this.title !== "string") {
            return (
                <div style={style.title}> 
                    <span style={style.interprets}>
                        {this.title.interprets.join(", ")}
                    </span>
                    {this.title.title}
                </div>
            );
        } else {
            return (
                <div style={style.title}>
                    {this.title}
                </div>
            );
        }
    }

    render() {
        if ( this.props.title !== this.titlestring ) {
            this.titlestring = this.props.title;
            this.title = parse(this.titlestring);
        }
        return (
            <div style={style.entry}>
                <div style={style.background(this.props.thumbnail)} />
                <div style={style.progressbar(this.state.progress)} />
                { this.renderTitle() }
                <div style={style.buttonContainer}>
                    <RButton 
                        icon="download" 
                        onClick={this.download.bind(this)} 
                        disabled={this.state.download.disabled} 
                        hidden={this.state.download.hidden}
                    >
                        { this.state.download.text }
                    </RButton>
                    <RButton 
                        icon="music" 
                        color="rgb(200, 200, 50)"
                        onClick={this.saveMp3.bind(this)} 
                        disabled={this.state.saveMp3.disabled} 
                        hidden={this.state.saveMp3.hidden}
                    >
                        { this.state.saveMp3.text }
                    </RButton>
                    <RButton 
                        icon="film" 
                        color="rgb(50, 200, 50)"
                        onClick={this.saveMp4.bind(this)} 
                        disabled={this.state.saveMp4.disabled} 
                        hidden={this.state.saveMp4.hidden}
                    >
                        { this.state.saveMp4.text }
                    </RButton>
                </div>
            </div>
        );
    }
});