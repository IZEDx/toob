
import * as React from "react";
import * as Radium from "radium";

import { Header, Search, SearchResult, VideoList, VideoEntry } from ".";
import { RCheckbox, BulkActions, IVideoEntry, VideoStatus } from ".";

import { Style } from "@libs/utils";



const style = {
    container: {
        position: Style.absolute,
        boxSizing: Style.borderBox,
        left: 0,
        top: 0,
        width: "100vw",
        height: "100vh",
        display: "grid",
        gridTemplate: "[app] auto / [app] auto",
        "@media only screen and (min-width: 768px)": {
            background: "linear-gradient(to bottom, #2D1313 150px, #131313 40%)",
            gridTemplate: "75px [app] auto 30px 45px / 100px [app] auto 100px",
        }
    },  
    background: {
        display: "none",
        "@media only screen and (min-width: 768px)": {
            display: "block",
            zIndex: 0,
            position: Style.absolute,
            boxSizing: Style.borderBox,
            left: 0,
            top: 0,
            width: "100vw",
            height: "100vh",
            opacity: 0.7,
            backgroundImage: "url(https://source.unsplash.com/daily?nature,mountain)",
            backgroundSize: "cover",
            backgroundPosition: "center center",
            filter: "blur(4px) grayscale(60%)",
        },
    },
    app: {
        position: Style.relative,
        gridArea: "app",
        display: "grid",
        width: "100%",
        justifySelf: "center",
        fontSize: "12px",
        fontFamily: "Montserrat, bold",
        backgroundColor: "rgba(24, 25, 26, 1)",
        gridTemplateRows: "75px 45px auto 75px",
        gridTemplateColumns: "110px auto",
        "@media screen and (min-width: 768px)": {
            zIndex: 1,
            maxWidth: "1150px",
            gridTemplateColumns: "200px auto",
            boxShadow: "0px 15px 40px -3px rgba(0, 0, 0, 0.1)",
            border: "solid 0.5px rgba(255, 255, 255, 0.1)",
            backgroundColor: "rgba(24, 25, 26, 0.97)"
        }
    },
    appbg: {
        zIndex: -1,
        display: "none",
        "@media screen and (min-width: 768px)": {
            display: "block",
            position: Style.absolute,
            backgroundImage: "url(./img/Background_cropped.png)",	
            backgroundRepeat: "no-repeat" as "no-repeat",	
            backgroundPosition: "calc(0% - 200px) calc(100% + 200px)",	
            backgroundSize: "contain",
            width: "100%",
            height: "100%", 
            backfaceVisibility: "hidden" as "hidden",
            perspective: 1000,
            transform: "translate3d(0,0,0)",
        }
    },
    settings: {
        display: "flex" as "flex",
        justifyContent: "flex-end" as "flex-end",
        gridColumn: "1/span 2",
        padding: "5px"
    },
    footer: {
        display: "none",
        "@media screen and (min-width: 768px)": {
            gridArea: "3 / 2 / span 1 / span 1",
            display: "block",
            maxWidth: "1150px",
            width: "100%",
            justifySelf: "center",
            textAlign: "right",
            padding: "3px",
            fontSize: "14px",
            fontFamily: "Montserrat, bold",
            opacity: "0.35",
            color: "#ffffff",
        }
    }
}

interface AppSettings {
    autodownload: boolean;
    autoconvert: boolean;
}

export interface AppState {
    entries: SearchResult[];
    settings: AppSettings;
}

export const App = Radium(class extends React.Component<{}, AppState> {

    constructor(props: {}) {
        super(props);

        this.state = {
            entries: [],
            settings: {
                autodownload: localStorage.getItem("autodownload") === "true",
                autoconvert: localStorage.getItem("autoconvert") === "true"
            }
        }
    }

    handleSearching(value: string) {
    }

    handleFound(result: SearchResult) {
        if ( this.state.entries.find(e => e.id === result.id) !== undefined ) {
            return;
        }
        const entries = this.state.entries.slice();
        entries.push(result);
        this.setState({entries});
    }

    handleStatusUpdate(video: IVideoEntry, status: VideoStatus) {
        switch (status) {
            case VideoStatus.added: this.state.settings.autodownload && video.download(); break;
            case VideoStatus.downloaded: this.state.settings.autoconvert && video.convert(); break;
            default: break;
        }
    }

    changeSetting<T extends keyof AppSettings>(setting: T) {
        return (checked: boolean) => {
            const settings = Object.assign({}, this.state.settings);
            settings[setting] = checked;
            localStorage.setItem(setting, ""+checked);
            this.setState({ settings });
        }
    }

    render() {
        const videoentries: IVideoEntry[] = []
        return (
            <div style={style.container}>
                <div style={style.background} />
                <div style={style.app}>
                    <div style={style.appbg} />
                    <Header>toob.host</Header>
                    <Search 
                        onSearching={this.handleSearching.bind(this)}
                        onFound={this.handleFound.bind(this)}
                    />
                    <div style={style.settings}>
                        <RCheckbox label="Auto-Convert" checked={this.state.settings.autoconvert} onChanged={this.changeSetting.bind(this)("autoconvert")} />
                        <div style={{width: 20}} />
                        <RCheckbox label="Auto-Download" checked={this.state.settings.autodownload} onChanged={this.changeSetting.bind(this)("autodownload")} />
                    </div>
                    <VideoList>
                        { this.state.entries.map(entry => 
                            <VideoEntry 
                                key={entry.id}
                                ref={el => videoentries[entry.id] = el}
                                id={entry.id}
                                title={entry.title} 
                                thumbnail={entry.thumbnail}
                                file={entry.file} 
                                onStatusUpdate={this.handleStatusUpdate.bind(this)}
                            />
                        ) }
                    </VideoList>
                    <BulkActions entries={this.state.entries} elements={videoentries} />
                </div>
                <div style={style.footer}>
                    &copy; 2017-2018 <a href="https://ized.io/" style={{color: "#ffffff"}}>ized.io</a>
                </div>
            </div>
        );
    }
});