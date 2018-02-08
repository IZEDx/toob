
import * as React from "react";
import * as Radium from "radium";
import * as JSZip from "jszip";
import * as sanitize from "sanitize-filename";

import { SearchResult } from "./search";
import { IVideoEntry, VideoStatus } from "./videoentry";
import { saveToFile } from "../libs/utils";

interface BulkActionsProps {
    entries: SearchResult[];
    elements: IVideoEntry[]; 
}

class ButtonState {
    constructor(
        public hidden: boolean,
        public disabled: boolean,
        public text: string
    ) {}
}

interface BulkActionsState {
    saveMp4: ButtonState;
    saveMp3: ButtonState;
}

export const BulkActions = Radium(class extends React.Component<BulkActionsProps, BulkActionsState> {

    constructor(props: BulkActionsProps) {
        super(props);

        this.state = {
            saveMp3: new ButtonState(false, false, "Save all as MP3"),
            saveMp4: new ButtonState(false, false, "Save all as MP4")
        };
    }

    get style() {
        return {
            container: {
                backgroundColor: "rgba(45, 45, 45, 0.7)",
                padding: "0px 10px",
                borderTop: "solid 1px rgba(0, 0, 0, 0.5)",
                gridColumn: "1/span 2",
                boxSizing: "border-box",
                boxShadow: "0px -8px 30px -10px rgba(255, 255, 255, 0.03)",
                display: "flex" as "flex",
                justifyContent: "flex-end" as "flex-end",
            },
            button: (color: string = "#ffffff") => {return{
                border: "none",
                outline: "none",
                backgroundColor: "transparent",
                transition: "background-color 0.2s, opacity 0.2s",
                height: "75px",
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
            }},
            buttonText: {
                marginLeft: "5px",
                "@media screen and (max-width: 280px)": {
                    display: "none"
                }
            }
        }
    }

    componentDidMount() {
    }

    saveMp3() {
    }

    async saveMp4() {
        const zip = new JSZip();
        const promises : Promise<void>[] = [];
        for (const entry of this.props.entries) {
            promises.push((async () => {
                const el: IVideoEntry = this.props.elements[entry.id];
                if (el.state.status < VideoStatus.downloaded) {
                    await el.download();
                }
                zip.file(sanitize(entry.title) + ".mp4", el.video);
            })());
        }
        await Promise.all(promises);
        const archive = await zip.generateAsync({type:"blob"});
        saveToFile(archive, "toob.zip");
    }

    private renderButton(name: keyof BulkActionsState, icon: string, color?: string, disabled?: boolean) {
        const state = this.state[name];
        if (!(state instanceof ButtonState) || state.hidden) return;

        const style = this.style;
        return (
            <button
                key={"bulk"+name} 
                style={style.button(color)}
                onClick={() => this[name]()}
                disabled={state.disabled || disabled}
            >
                <i className={"fa fa-"+icon} aria-hidden="true"></i>
                <span style={style.buttonText}>{state.text}</span>
            </button>
        );
    }

    render() {
        const style = this.style;
        const disabled = this.props.entries.length === 0;
        return (
            <div style={style.container}>
                { this.renderButton("saveMp3", "music", "rgb(200, 200, 50)", disabled) }
                { this.renderButton("saveMp4", "film", "rgb(50, 200, 50)", disabled) }
            </div>
        );
    }
});