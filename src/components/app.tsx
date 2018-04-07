
import * as React from "react";
import * as Radium from "radium";

import { Header } from "./header";
import { Search, SearchResult } from "./search";
import { VideoList } from "./videolist";
import { VideoEntry, IVideoEntry, VideoStatus } from "./videoentry";
import { RCheckbox } from "./checkbox";
import { BulkActions } from "./bulkactions";



const style = {
    container: {
        background: "linear-gradient(to bottom, #AD2332 150px, #232323 150px)",
        //backgroundImage: "url(./img/bg.jpeg)",
        //backgroundRepeat: "no-repeat",
        //backgroundSize: "cover",
        position: "absolute" as "absolute",
        left: 0,
        top: 0,
        width: "100vw",
        height: "100vh",
        transition: "padding 0.4s",
        paddingLeft: "100px",
        paddingTop: "75px",
        paddingRight: "100px",
        paddingBottom: "75px",
        boxSizing: "border-box" as "border-box",
        "@media only screen and (max-height: 768px)": {
            paddingTop: 0,
            paddingBottom: 0
        },
        "@media only screen and (max-width: 768px)": {
            padding: 0
        }
    },
    app: {
        maxWidth: "1150px",
        width: "100%",
        height: "100%",
        marginLeft: "50%",
        transform: "translateX(-50%)",
        border: "solid 0.5px rgba(255, 255, 255, 0.1)",
        fontSize: "12px",
        fontFamily: "Montserrat, bold",
        boxShadow: "0px 15px 40px -6px rgba(0, 0, 0, 0.05)",
        backgroundColor: "rgba(24, 25, 26, 1)",
        display: "grid",
        gridTemplateColumns: "200px auto",
        gridTemplateRows: "75px 45px auto 75px",
        "@media screen and (max-width: 768px)": {
            gridTemplateColumns: "110px auto",
            border: "none" as "none"
        }
    },
    appbg: {
        zIndex: -1,
        position: "absolute" as "absolute",
        //backdropFilter: "blur(30px)",
        //backdropFilter: "grayscale(50%) blur(15px)",
        backgroundImage: "url(./img/Background_cropped.png",	
        backgroundRepeat: "no-repeat" as "no-repeat",	
        backgroundPosition: "calc(0% - 200px) calc(100% + 200px)",	
        backgroundSize: "contain",
        width: "100%",
        height: "100%", 
        backfaceVisibility: "hidden" as "hidden",
        perspective: 1000,
        transform: "translate3d(0,0,0)"
    },
    settings: {
        display: "flex" as "flex",
        justifyContent: "flex-end" as "flex-end",
        gridColumn: "1/span 2",
        padding: "5px"
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
            <Radium.StyleRoot style={style.container}>
                <Radium.StyleRoot style={style.app}>
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
                </Radium.StyleRoot>
            </Radium.StyleRoot>
        );

    }
});