import { 
    App,
    normalizePath,
    RegExpValue,
    TAbstractFile,
    TFile,
    TFolder,
    Vault, 
} from "obsidian";
import LocationContextMenu from "../main";
import { Location } from "./location";

export class ConfigCreator {
    app: App;
    plugin: LocationContextMenu;

    constructor(app: App, plugin: LocationContextMenu) {
        this.app = app;
        this.plugin = plugin;
    }

    create(): Location[] {
        console.log("begin creating config")
        const folder = this.resolve_tfolder(this.app, this.plugin.settings.createConfigSourceFolder);

        const files: Array<TFile> = [];
        Vault.recurseChildren(folder, (file: TAbstractFile) => {
            if (file instanceof TFile) {
                this.app.vault.process(file, (data) => {
                    console.log("process file");

                    const regexp = new RegExp(`\[(?<name>.*)\]\(geo:(?<coordinate>[0-9,\.]*)\)`, 'g');
                    const matches = regexp.exec(data);

                    console.log("matches");
                    console.log(matches);

                    if (matches?.groups) {
                        console.log(`Name: ${matches.groups.name}`);
                        console.log(`Coordinates: ${matches.groups.coordinates}`);
                    } else {
                        console.log("no matches");
                    }

                    return data;
                });
            }
        });

        

        return [];
    }

    resolve_tfolder(app: App, folder_str: string): TFolder {
        folder_str = normalizePath(folder_str);

        const folder = app.vault.getAbstractFileByPath(folder_str);
        if (!folder) {
            throw console.error(`Folder "${folder_str}" doesn't exist`);
        }
        if (!(folder instanceof TFolder)) {
            throw console.error(`${folder_str} is a file, not a folder`);
        }

        return folder;
    }
}