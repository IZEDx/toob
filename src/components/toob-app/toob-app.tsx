import '@stencil/core';
import { Component, State, Listen } from '@stencil/core';
import { SearchResult } from "../toob-search/toob-search";

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

    @Listen("onFound")
    handleFound(result: SearchResult) {
        if (this.entries.find(e => e.id === result.id)) return;
        this.entries = [...this.entries, result]
    }

	render() {
		return (
			<div>
			</div>
		);
	}
}
