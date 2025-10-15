// Credits go to Liam's Periodic Notes Plugin: https://github.com/liamcain/obsidian-periodic-notes
// Copied from Templater Plugin: https://github.com/SilentVoid13/Templater/

import { TAbstractFile, TFile } from "obsidian";
import { TextInputSuggest } from "./suggest";
import { get_tfiles_from_folder } from "src/utils/utils";
import LocationContextMenu from "src/main";
import { errorWrapperSync } from "src/utils/error";

export class FileSuggest extends TextInputSuggest<TFile> {
    constructor(
        public inputEl: HTMLInputElement,
        private plugin: LocationContextMenu,
    ) {
        super(plugin.app, inputEl);
    }

    getSuggestions(input_str: string): TFile[] {
        const all_files = errorWrapperSync(
            () => get_tfiles_from_folder(this.plugin.app),
            "get all tfiles"
        );
        if (!all_files) {
            return [];
        }

        const files: TFile[] = [];
        const lower_input_str = input_str.toLowerCase();

        all_files.forEach((file: TAbstractFile) => {
            if (
                file instanceof TFile &&
                file.path.toLowerCase().contains(lower_input_str)
            ) {
                files.push(file);
            }
        });

        return files;
    }

    renderSuggestion(file: TFile, el: HTMLElement): void {
        el.setText(file.path);
    }

    selectSuggestion(file: TFile): void {
        this.inputEl.value = file.path;
        this.inputEl.trigger("input");
        this.close();
    }
}
