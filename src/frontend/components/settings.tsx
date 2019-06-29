
import { h, Component } from "preact";
import { Input } from "./input";
import { Checkbox } from "./checkbox";


const defaultSettings = {
    autoDownload: false,
    color: "#FD1222",
    bgtag: "mountain"
}

export type SettingValues = typeof defaultSettings;

export type SettingKeys = keyof SettingValues;

export type SettingsState = { 
    [P in SettingKeys]: SettingValues[P];
};

export interface SettingsProps
{
    onClose(): void;
    onChange<P extends SettingKeys>(setting: P, value: SettingValues[P]): void;
}

export class Settings extends Component<SettingsProps, SettingsState> {

    constructor(props: SettingsProps) {
        super(props);
        this.state = this.loadSettings();
    }

    loadSettings()
    {
        const state = {} as SettingsState;
        for (const key in defaultSettings)
        {
            let val = (defaultSettings as any)[key] as string|boolean|number;

            if (typeof val === "string" ) val = localStorage.getItem(key) || val;
            if (typeof val === "boolean") val = (localStorage.getItem(key) === "true") || val;
            if (typeof val === "number") val = localStorage.getItem(key) || val;

            (state as any)[key] = val;
            setTimeout(() => this.props.onChange(key as any, val), 0);
        }
        return state;
    }

    updateSetting<P extends SettingKeys>(setting: P, value: SettingValues[P])
    {
        this.setState({
            [setting]: value
        } as any);
        this.props.onChange(setting, value);
        localStorage.setItem(setting, ""+value);
    }

    render() {
        return (
            <div className="settings">
                <div className="setting">
                    <Checkbox 
                        label="Auto-Download" 
                        checked={this.state.autoDownload} 
                        onChanged={val => this.updateSetting("autoDownload", val)}
                    />
                </div>
                <div className="setting">
                    <Input 
                        type="text" 
                        placeholder="Color" 
                        value={this.state.color} 
                        onChanged={val => this.updateSetting("color", val)} 
                        onSubmit={() => this.updateSetting("color", this.state.color)} 
                    />
                </div>
                <div className="setting">
                    <Input 
                        type="text" 
                        placeholder="Background Tag" 
                        value={this.state.bgtag} 
                        onChanged={val => this.updateSetting("bgtag", val)} 
                        onSubmit={() => this.updateSetting("bgtag", this.state.bgtag)} 
                    />
                </div>
            </div>
        );
    }
}