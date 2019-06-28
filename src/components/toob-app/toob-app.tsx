import '@stencil/core';
import { Component, h, JSX, State, Listen } from '@stencil/core';
import { SearchResult } from "../toob-search/toob-search";
import { ToobVideo } from "../toob-video/toob-video";
import { VideoStatus } from "../../libs/youtube";

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
        return (event: CustomEvent<boolean>) => {
            const settings = Object.assign({}, this.settings);
            settings[key] = event.detail;
            localStorage.setItem(key, ""+event.detail);
            this.settings = settings;
        }
    }

	render() {
        const videoelements: JSX.Element[] = []
		return [
            <aside class="background" />,
            <main>
                <aside class="background" />
                <header>
                    <section class="icon" />
                    <section class="title" >toob.host</section>
                </header>
                <toob-search />
                <section class="settings">
                    <toob-checkbox checked={this.settings.autoconvert} onChanged={this.changeSetting("autoconvert")}>
                        Auto-Convert
                    </toob-checkbox>
                    <toob-checkbox checked={this.settings.autodownload} onChanged={this.changeSetting("autodownload")}>
                        Auto-Download
                    </toob-checkbox>
                </section>
                <section class="videos">
                    { this.entries.map(entry => {
                        const el = <toob-video data={entry} />;
                        videoelements.push(el);
                        return el;
                    }) }
                </section>
                <toob-bulkactions entries={this.entries} elements={videoelements} />
            </main>,
            <footer>
                &copy; 2017-2018 <a href="https://ized.io/">ized.io</a>
            </footer>
        ];
	}
}
