import { App, MarkdownView, Modal, Setting } from "obsidian";
import type LocationContextMenu from "../main";

export default class LocationPickerModal extends Modal {
  plugin: LocationContextMenu;

  constructor(app: App, plugin: LocationContextMenu) {
    super(app);
    this.plugin = plugin;
  }

  onOpen(): void {
    this.contentEl.createEl("form", {}, (formEl) => {
      const dateInputEl = new Setting(formEl)
        .setName("Date")
        .setDesc("Desc")
        .addText((textEl) => {
          textEl.setPlaceholder("Today");

          window.setTimeout(() => textEl.inputEl.focus(), 10);
        });
    });
  }
}
