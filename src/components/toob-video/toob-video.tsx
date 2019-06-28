import '@stencil/core';
import { Component, h, State, Event, Prop, EventEmitter } from '@stencil/core';
import sanitize from "sanitize-filename";

import { FFmpegWorker } from "../../libs/ffmpeg";
import { saveToFile, downloadFile } from "../../libs/utils";

import { SearchResult } from "../toob-search/toob-search";
import { VideoStatus } from '../../libs/youtube';


class ButtonState {
    constructor(
        public hidden: boolean,
        public disabled: boolean,
        public text: string
    ) {}
}

@Component({
	tag: 'toob-video',
	styleUrl: 'toob-video.scss'
})
export class ToobVideo {
    video: Uint8Array|undefined;
    audio: Uint8Array|undefined;

    private progressBarTimer: number|undefined;
    private waitForStatusUpdate: Function[] = [];

    @Event() statusUpdate: EventEmitter<{video: ToobVideo, status: VideoStatus}>;
    @Prop() data: SearchResult;
    
    @State() status = VideoStatus.added;
    @State() downloadButton = new ButtonState(false, false, "Download");
    @State() saveMp3Button = new ButtonState(true, false, ".mp3");
    @State() saveMp4Button = new ButtonState(true, false, ".mp4");
    @State() progress = 0;

	async componentDidLoad() {
        if (this.video) {
            await this.download();
        }

        if (this.audio) {
            await this.convert();
        }

        this.statusUpdate.emit({video: this, status: this.status});
    }
    
    setStatus(status: VideoStatus) {
        this.status = status;
        this.waitForStatusUpdate.forEach(fn => setTimeout(fn, 0));
        this.waitForStatusUpdate = [];
        this.statusUpdate.emit({video: this, status: this.status});
    }

    async download() {
        
        if (this.status === VideoStatus.downloading) return new Promise(res => this.waitForStatusUpdate.push(res));
        if (this.status > VideoStatus.downloading) return;
        if (this.progressBarTimer) clearTimeout(this.progressBarTimer);
        
        this.setStatus(VideoStatus.downloading);
        this.downloadButton = new ButtonState(false, true, "Downloading...");

        try {
            if (!this.video) this.video = await downloadFile(this.data.file.url, e => {
                this.progress = 100 / e.total * e.loaded;
            });

            this.setStatus(VideoStatus.downloaded);
            this.downloadButton = new ButtonState(true, true, "");
            this.saveMp3Button = new ButtonState(false, false, ".mp3");
            this.saveMp4Button = new ButtonState(false, false, ".mp4");
        } catch(err) {
            console.error(err);
            this.setStatus(VideoStatus.added);
            this.downloadButton = new ButtonState(false, false, "Download");
        }

        this.progressBarTimer = setTimeout(() => this.progress = 0, 500) as any;
    }

    async convert() {

        if (this.status < VideoStatus.downloaded) await this.download();
        if (this.status === VideoStatus.converting)  return new Promise(res => this.waitForStatusUpdate.push(res));
        if (this.status > VideoStatus.converting || !this.video) return;
        if (this.progressBarTimer) clearTimeout(this.progressBarTimer);

        this.setStatus(VideoStatus.converting);
        this.saveMp3Button = new ButtonState(false, true, "Preparing...");
        this.progress = 0;

        try {
            if (!this.audio) {
                const ffmpeg = FFmpegWorker.singleton();
                let started = false;
                this.audio = await ffmpeg.convertToMp3(this.video, progress => {
                    if (!started) {
                        started = true;
                        this.saveMp3Button = new ButtonState(false, true, "Converting...");
                    } 
                    this.progress = progress;
                });
            }

            this.setStatus(VideoStatus.converted);
        } catch(err) {
            console.log(err);
            this.setStatus(VideoStatus.added);
        }

        this.saveMp3Button = new ButtonState(false, false, ".mp3");
        this.progressBarTimer = setTimeout(() => this.progress = 0, 500) as any;
    }

    async saveMp3() {
        if ( this.status < VideoStatus.converted ) await this.convert();
        if ( !this.audio ) return;
        saveToFile(this.audio, sanitize(this.data.title + ".mp3"));
    }

    async saveMp4() {
        if ( this.status < VideoStatus.downloaded ) await this.download();
        if ( !this.video ) return;
        saveToFile(this.video, sanitize(this.data.title) + ".mp4");
    }

	render() {
		return (
			<div>
			</div>
		);
	}
}
