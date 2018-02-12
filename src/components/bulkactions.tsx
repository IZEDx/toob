
import * as React from "react";
import * as Radium from "radium";
import * as JSZip from "jszip";
import * as sanitize from "sanitize-filename";

import { SearchResult } from "./search";
import { IVideoEntry, VideoStatus } from "./videoentry";
import { saveToFile } from "../libs/utils";
import { RButton } from "./button";

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
            saveMp3: new ButtonState(false, false, "MP3"),
            saveMp4: new ButtonState(false, false, "MP4")
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
            
        }
    }

    async prepareAndZipVideos(mp3: boolean = false) : Promise<JSZip> {
        const zip = new JSZip();
        const promises : Promise<void>[] = [];
    
        for (const e of this.props.entries) {
            const entry = e;
    
            promises.push((async () => {
                const el: IVideoEntry = this.props.elements[entry.id];
    
                if (el.state.status < VideoStatus.downloaded) {
                    await el.download();
                }
    
                if (mp3 && el.state.status < VideoStatus.converting) {
                    await el.convert();
                }
    
                zip.file(sanitize(entry.title) + (mp3 ? ".mp3" : ".mp4"), (mp3 ? el.audio : el.video));
            })());
    
        }
    
        await Promise.all(promises);
        return zip;
    }

    async saveMp3() {

        this.setState({
            saveMp3: new ButtonState(false, true, "Waiting...")
        });

        const zip = await this.prepareAndZipVideos(true);

        this.setState({
            saveMp3: new ButtonState(false, true, "Zipping...")
        });

        saveToFile(await zip.generateAsync({type:"blob"}), "toobmp3.zip");

        this.setState({
            saveMp3: new ButtonState(false, false, "MP3")
        });
    }

    async saveMp4() {

        this.setState({
            saveMp4: new ButtonState(false, true, "Waiting...")
        });

        const zip = await this.prepareAndZipVideos();

        this.setState({
            saveMp4: new ButtonState(false, true, "Zipping...")
        });

        saveToFile(await zip.generateAsync({type:"blob"}), "toobmp4.zip");

        this.setState({
            saveMp4: new ButtonState(false, false, "MP4")
        });
    }

    render() {
        const style = this.style;
        const disabled = this.props.entries.length === 0;

        return (
            <div style={style.container}>
                <RButton icon="music" color="rgb(200,200,50)" disabled={disabled||this.state.saveMp3.disabled} onClick={this.saveMp3.bind(this)}> 
                    {this.state.saveMp3.text} 
                </RButton>
                <RButton icon="film" color="rgb(50,200,50)" disabled={disabled||this.state.saveMp4.disabled} onClick={this.saveMp4.bind(this)}>
                    {this.state.saveMp4.text} 
                </RButton>
            </div>
        );
    }
});