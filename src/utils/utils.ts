// Copied from Templater Plugin: https://github.com/SilentVoid13/Templater/

import { TemplaterError } from "./error";
import { 
    App, 
    normalizePath, 
    TAbstractFile, 
    TFile, 
    TFolder, 
    Vault, 
} from "obsidian";

export function get_tfiles_from_folder(app: App): Array<TFile> {
    const files: Array<TFile> = [];
    this.app.vault.getAllLoadedFiles().forEach((file: TAbstractFile) => {
        if (file instanceof TFile) {
            files.push(file);
        }
    });

    files.sort((a, b) => {
        return a.path.localeCompare(b.path);
    });

    return files;
}

export function resolve_tfolder(app: App, folder_str: string): TFolder {
    folder_str = normalizePath(folder_str);

    const folder = app.vault.getAbstractFileByPath(folder_str);
    if (!folder) {
        throw new TemplaterError(`Folder "${folder_str}" doesn't exist`);
    }
    if (!(folder instanceof TFolder)) {
        throw new TemplaterError(`${folder_str} is a file, not a folder`);
    }

    return folder;
}