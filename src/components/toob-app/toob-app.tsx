import '@stencil/core';
import { Component, State, Listen } from '@stencil/core';
import { SearchResult } from "../toob-search/toob-search";
import { ToobVideo, VideoStatus } from "../toob-video/toob-video";

interface AppSettings {
    autodownload: boolean;
    autoconvert: boolean;
}

@Component({
	tag: 'toob-app',
	styleUrl: 'toob-app.scss'
})
export class ToobApp {

    @State() entries: SearchResult[] = [];
    @State() settings: AppSettings = {
        autodownload: localStorage.getItem("autodownload") === "true",
        autoconvert: localStorage.getItem("autoconvert") === "true"   
    };

	componentDidLoad() {
	}

    @Listen("found")
    handleFound(result: SearchResult) {
        if (this.entries.find(e => e.id === result.id)) return;
        this.entries = [...this.entries, result]
    }

    @Listen("statusUpdate")
    handleStatusUpdate({video, status}: {video: ToobVideo, status: VideoStatus}) {
        switch (status) {
            case VideoStatus.added: this.settings.autodownload && video.download(); break;
            case VideoStatus.downloaded: this.settings.autoconvert && video.convert(); break;
            default: break;
        }
    }

    changeSetting<T extends keyof AppSettings>(key: T) {
        return (checked: boolean) => {
            const settings = Object.assign({}, this.settings);
            settings[key] = checked;
            localStorage.setItem(key, ""+checked);
            this.settings = settings;
        }
    }

	render() {
        const videoentries: JSX.Element[] = []
		return [
            <div class="background" />,
            <div class="body">
                <div class="background" />
                <div class="header">
                    <div class="icon" />
                    <div class="title" >toob.host</div>
                </div>
                <toob-search />
                <div class="settings">
                    <toob-checkbox checked={this.settings.autoconvert} onChanged={this.changeSetting("autoconvert")}>
                        Auto-Convert
                    </toob-checkbox>
                    <toob-checkbox checked={this.settings.autodownload} onChanged={this.changeSetting("autodownload")}>
                        Auto-Download
                    </toob-checkbox>
                </div>
                <toob-list>
                    { this.entries.map(entry => (
                        <toob-video data={entry} />
                    )) }
                </toob-list>
            </div>,
            <div class="footer">
                &copy; 2017-2018 <a href="https://ized.io/">ized.io</a>
            </div>
        ];
	}
}
