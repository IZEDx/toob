
import * as React from "react";
import * as Radium from "radium";
import { FocusEvent } from "react";

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

const style = {
    search: {
        position: "relative" as "relative",
        height: "55px",
        backgroundColor: "rgba(150, 150, 150, 0.15)",
        padding: "10px 30px",
        borderLeft: "solid 1px rgba(0, 0, 0, 0.5)",
        borderBottom: "solid 1px rgba(0, 0, 0, 0.5)",
        boxShadow: "inset 5px -20px 40px -10px rgba(0, 0, 0, 0.17)",
        overflow: "hidden" as "hidden",
        ":focus>.icon": {
            transform: "rotateZ(45) scale(1.5)"
        }
    },
    icon: (rotation: number = 0) => {return{
        position: "absolute" as "absolute",
        right: "20px",
        lineHeight: "55px",
        verticalAlign: "center",
        height: "55px",
        fontSize: "100px",
        color: "rgba(255,255,255,0.15)",
        transition: "transform 0.5s ease-in",
        transform: `rotateZ(${rotation}deg)`
    }},
    input: {
        height: "22px",
        width: "100%",
        paddingTop: "17px",
        lineHeight: "20px",
        background: "transparent",
        fontSize: "20px",
        fontFamily: "Montserrat, bold",
        color: "#e0e2e4",
        border: "none",
        verticalAlign: "bottom",
        ":focus": {
            outline: "none"
        }
    }
}

export interface SearchResult {
    id: string;
    title: string;
    thumbnail: string;
    file: {
        url: string,
        format: string
    }
}

export interface SearchProps {
    onSearching: (value: string) => void;
    onFound: (result: SearchResult) => void;
}

export interface SearchState {
    rotation: number;
}

export const Search = Radium(class extends React.Component<SearchProps, SearchState> {
    private waitTimer: number|null = null;
    private spinTimer: number|null = null;
    private inputElement: HTMLInputElement|null = null;

    constructor(props: SearchProps) {
        super(props);
        this.state = {
            rotation: 0
        };
    }

    spinIcon(to?: number) {
        this.setState({
            rotation: to !== undefined ? to : this.state.rotation + 360
        });
    }

    async handleFocus(e: FocusEvent<HTMLInputElement>) {
        this.spinIcon(-90);
    }

    async handleBlur(e: FocusEvent<HTMLInputElement>) {
        this.spinIcon(0);
    }

    async handleChange(e: {target: any}) {
        const val = e.target.value;
        
        if (this.waitTimer !== null) {
            clearTimeout(this.waitTimer);
        }

        await new Promise(resolve => {
            this.waitTimer = setTimeout(resolve, 200);
        })

        if (this.spinTimer) clearInterval(this.spinTimer);
        this.spinTimer = setInterval(this.spinIcon.bind(this), 500);

        try {
            this.props.onSearching(val);
            const info = await getInfo(val);
            const format = info.formats.sort((a, b) => a.audioBitrate > b.audioBitrate ? -1 : 1)[0];
            if (format === undefined) {
                throw new Error("Video not downloadable.");
            }
            
            if (this.inputElement !== null) {
                this.inputElement.value = "";
                this.inputElement.focus();
            }

            this.props.onFound({
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
        (async () => this.spinIcon(0))();
    }

    render() {
        return (
            <div style={style.search}>
                <i style={style.icon(this.state.rotation)} className="fa fa-search" aria-hidden="true"></i>
                <input 
                    ref={(el) => this.inputElement = el}
                    placeholder="Youtube URL..."
                    style={style.input}
                    onChange={this.handleChange.bind(this)}
                    onFocus={this.handleFocus.bind(this)}
                    onBlur={this.handleBlur.bind(this)}
                />
            </div>
        );
    }
});