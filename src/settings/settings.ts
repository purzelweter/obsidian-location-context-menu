import { 
    App, 
    normalizePath,
    PluginSettingTab, 
    Setting,
    TAbstractFile,
    TFile,
    TFolder,
    Vault,
 } from "obsidian";
import LocationContextMenu from "../main";
import { Location } from "./location";
import { FolderSuggest } from "./suggest/folderSuggest";
import { ConfigCreator } from "./createConfig";

export interface Settings {
	isAutosuggestEnabled: boolean;
    autocompleteTriggerPhrase: string;
    sourceFile: string;
    locations: Location[];

    createConfigSourceFolder: string;
    createConfigTag: string;
}

export const DEFAULT_SETTINGS: Settings = {
	isAutosuggestEnabled: true, 
    autocompleteTriggerPhrase: "/geo",
    sourceFile: "",
    locations: [],

    createConfigSourceFolder: "",
    createConfigTag: "",
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
        
        this.addCreateConfigurationSetting();
        this.addConfigurationSetting();
    }

    addCreateConfigurationSetting(): void {
        new Setting(this.containerEl).setName("Create Configuration").setHeading();

        new Setting(this.containerEl)
            .setName("Folder")
            .setDesc("Select a source folder")
            .addSearch((cb) => {
                new FolderSuggest(this.app, cb.inputEl);
                cb.setPlaceholder("Example: folder1/folder2")
                    .onChange((newFolder) => {
                        this.plugin.settings.createConfigSourceFolder = newFolder;
                        this.plugin.saveSettings();
                    });
                // @ts-ignore
                cb.containerEl.addClass("templater_search");
            });

        new Setting(this.containerEl)
            .setName("Tag")
            .setDesc("Which string marks the content which should be inserted in the config?")
            .addText((text) => {
                text
                .setPlaceholder("geo:")
                .setValue(this.plugin.settings.createConfigTag)
                .onChange((newTag) => {
                    this.plugin.settings.createConfigTag = newTag.trim();
                    this.plugin.saveSettings();
                });
            });

        new Setting(this.containerEl)
            .addButton((cb) => {
                cb
                .setButtonText("Create configuration")
                .setCta()
                .onClick((mouseEvent) => {
                    const c = new ConfigCreator(this.app, this.plugin);
                    const locs = c.create();
                    this.plugin.settings.locations.push(...locs);
                    this.plugin.saveSettings();
                });
            });
    }

    addConfigurationSetting(): void {
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
                .addTextArea((text) =>
                    text
                    .setPlaceholder("Comma-separated list of names")
                    .setValue(location.names.join(","))
                    .onChange(async (value) => {
                        this.plugin.settings.locations[index].names = value.split(",").map((v) => v.trim());
                        await this.plugin.saveSettings();
                    })
                )

                .addTextArea((text) =>
                    text
                    .setPlaceholder("Coordinates")
                    .setValue(location.coordinates)
                    .onChange(async (value) => {
                        this.plugin.settings.locations[index].coordinates = value.trim();
                        await this.plugin.saveSettings();
                    })
                )

                .addExtraButton((cb) => {
                    cb.setIcon("cross")
                        .setTooltip("Delete")
                        .onClick(() => {
                            this.plugin.settings.locations.splice(
                                index,
                                1
                            );
                            this.plugin.saveSettings();
                            this.display();
                        });
                });
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