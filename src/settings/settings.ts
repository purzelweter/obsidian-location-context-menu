import { App, PluginSettingTab, Setting } from "obsidian";
import LocationContextMenu from "../main";
import { FileSuggest } from "./suggest/fileSuggest";
import { Location } from "./location";
import { join } from "path";

export interface Settings {
	isAutosuggestEnabled: boolean;
    autocompleteTriggerPhrase: string;
    sourceFile: string;
    locations: Location[];
}

export const DEFAULT_SETTINGS: Settings = {
	isAutosuggestEnabled: true, 
    autocompleteTriggerPhrase: "/geo",
    sourceFile: "",
    locations: [],
};

export class LCMSettingsTab extends PluginSettingTab {
    app: App;
    plugin: LocationContextMenu;

    constructor(app: App, plugin: LocationContextMenu) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        containerEl.createEl("h2", {text: "Location Context Menu"});

        new Setting(this.containerEl).setName("General").setHeading();

        new Setting(containerEl)
            .setName("Enable location autosuggest")
            .setDesc(`Open the suggest menu with ${this.plugin.settings.autocompleteTriggerPhrase}`)
            .addToggle((toggle) =>
                toggle
                .setValue(this.plugin.settings.isAutosuggestEnabled)
                .onChange(async (value) => {
                    this.plugin.settings.isAutosuggestEnabled = value;
                    await this.plugin.saveSettings();
                })
            );
        
        new Setting(containerEl)
            .setName("Trigger phrase")
            .setDesc("Character(s) that will cause the date autosuggest to open")
            .addMomentFormat((text) =>
                text
                .setPlaceholder(DEFAULT_SETTINGS.autocompleteTriggerPhrase)
                .setValue(this.plugin.settings.autocompleteTriggerPhrase || "/geo")
                .onChange(async (value) => {
                    this.plugin.settings.autocompleteTriggerPhrase = value.trim();
                    await this.plugin.saveSettings();
                })
            );

        new Setting(containerEl)
            .setName("Key-Value file")
            .setDesc("")
            .addSearch((cb) => {
                new FileSuggest(cb.inputEl, this.plugin);
                cb.setPlaceholder("Example: folder1/key-value-file")
                    .setValue(this.plugin.settings.sourceFile)
                    .onChange((newFile) => {
                        this.plugin.settings.sourceFile = newFile;
                        this.plugin.saveSettings();
                    });
            });
        
        this.add_configuration_setting();
    }

    add_configuration_setting(): void {
        new Setting(this.containerEl).setName("Configuration").setHeading();

        const desc = document.createDocumentFragment();
        desc.createEl("p", 
            { text: "The configuration consists of key-content-pairs. The formatted result can be <code>[key](content)</code>" }
        );
        desc.createEl("p", 
            { text: "The <b>key</b> will be used to search for the content. It is a comma-separated list of strings." }
        );
        desc.createEl("p", 
            { text: "The <b>content</b> is the information, which should be linked to." }
        );

        new Setting(this.containerEl).setDesc(desc);

        this.plugin.settings.locations.forEach((location, index) => {
            const s = new Setting(this.containerEl)
                .addText((text) =>
                    text
                    .setPlaceholder("Comma-separated list of names")
                    .setValue(location.names.join(","))
                    .onChange(async (value) => {
                        this.plugin.settings.locations[index].names = value.split(",").map((v) => v.trim());
                        await this.plugin.saveSettings();
                    })
                )

                .addText((text) =>
                    text
                    .setPlaceholder("Coordinates")
                    .setValue(location.coordinates)
                    .onChange(async (value) => {
                        this.plugin.settings.locations[index].coordinates = value.trim();
                        await this.plugin.saveSettings();
                    })
                )

                s.infoEl.remove();
            }
        );
        

        new Setting(this.containerEl).addButton((cb) => {
            cb.setButtonText("Add new location")
                .setCta()
                .onClick(() => {
                    this.plugin.settings.locations.push(new Location("", [""]));
                    this.plugin.saveSettings();
                    // Force refresh
                    this.display();
                });
        });
    }
}