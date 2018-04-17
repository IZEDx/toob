import '@stencil/core';
import { Component, State, Event, EventEmitter } from '@stencil/core';

(function() {
    const cors_api_host = 'cors.ized.io';
    const cors_api_url = 'https://' + cors_api_host + '/';
    const slice = [].slice;
    const origin = window.location.protocol + '//' + window.location.host;
    const fetch = window.fetch;
    window.fetch = function() {
        const args = slice.call(arguments);
        const targetOrigin = /^https?:\/\/([^\/]+)/i.exec(args[0]);
        if (targetOrigin && targetOrigin[0].toLowerCase() !== origin &&
            targetOrigin[1] !== cors_api_host) {
            args[0] = cors_api_url + args[0];
        }
        return fetch.apply(this, args);
    };
})();

import { getInfo } from "ytdl-core";

export interface SearchResult {
    id: string;
    title: string;
    thumbnail: string;
    file: {
        url: string,
        format: string
    }
}

@Component({
	tag: 'toob-search',
	styleUrl: 'toob-search.scss'
})
export class ToobSearch {

    @Event() onSearching: EventEmitter<string>;
    @Event() onFound: EventEmitter<SearchResult>;

    @State() rotation = 0;

    private cooldownTimer: number|undefined;
    private spinTimer: number|undefined;
    private inputElement: HTMLInputElement|undefined;

	componentDidLoad() {
    }
    
    spinIcon(to?: number) {
        this.rotation = to !== undefined ? to : this.rotation + 360
    }

    async handleFocus() {
        this.spinIcon(-90);
    }

    async handleBlur() {
        this.spinIcon(0);
    }

    async handleChange(e: any) {
        const val: string = e.target.value;

        if (this.cooldownTimer) clearTimeout(this.cooldownTimer);
        await new Promise(res => this.cooldownTimer = setTimeout(res, 200) as any);

        if (this.spinTimer) clearInterval(this.spinTimer);
        this.spinTimer = setInterval(() => this.spinIcon(), 500) as any;

        try {
            this.onSearching.emit(val);

            const info = await getInfo(val);
            const format = info.formats.sort((a, b) => a.audioBitrate > b.audioBitrate ? -1 : 1)[0];
            if (format === undefined) {
                throw new Error("Video not downloadable.");
            }
            
            if (this.inputElement !== null) {
                this.inputElement.value = "";
                this.inputElement.focus();
            }
            
            this.onFound.emit({
                id: info.video_id, 
                title: info.title, 
                thumbnail: info.thumbnail_url,
                file: {
                    url: format.url,
                    format: format.container
                }
            });
        } catch(err) {
            console.error("Error getting info from YouTube: ", err);
        }

        if (this.spinTimer) clearInterval(this.spinTimer);
        setTimeout(() => this.spinIcon(0), 0);
    }

	render() {
		return (
			<div class="search">
                <i 
                    style={{transform: `rotateZ(${this.rotation}deg)`}}
                    class="fa fa-search icon" 
                    aria-hidden="true"
                ></i>
                <input 
                    ref={(el) => this.inputElement = el as HTMLInputElement}
                    placeholder="Youtube URL..."
                    class="input"
                    onChange={(e) => this.handleChange(e)}
                    onFocus={() => this.handleFocus()}
                    onBlur={() => this.handleBlur()}
                />
			</div>
		);
	}
}
