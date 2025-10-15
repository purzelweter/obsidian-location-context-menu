import { App, Plugin, MarkdownView } from 'obsidian';
import { LCMSettingsTab, Settings, DEFAULT_SETTINGS } from './settings/settings';
import LocationPickerModal from './modals/location-picker';
import LocationSuggest from './suggest/location-suggest';

export default class LocationContextMenu extends Plugin {
	public settings: Settings;

	async onload(): Promise<void> {
	    await this.loadSettings();

		this.addCommand({
			id: "location-picker",
			name: "Location picker",
			checkCallback: (checking: boolean) => {
				if (checking) {
					return !!this.app.workspace.getActiveViewOfType(MarkdownView);
				}
				new LocationPickerModal(this.app, this).open();
			},
			hotkeys: [],
		});

		this.addSettingTab(new LCMSettingsTab(this.app, this));
		this.registerEditorSuggest(new LocationSuggest(this.app, this));
	}

	onunload(): void {

	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}