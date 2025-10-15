import { 
  App,
  Editor,
  EditorPosition,
  EditorSuggest,
  EditorSuggestContext,
  EditorSuggestTriggerInfo,
  TFile,
} from "obsidian";
import LocationContextMenu from "src/main";

interface ILocationCompletion {
  label: string;
}

export default class LocationSuggest extends EditorSuggest<ILocationCompletion> {
    app: App;
    private plugin: LocationContextMenu;

    constructor(app: App, plugin: LocationContextMenu) {
        super(app);
        this.app = app;
        this.plugin = plugin;
    }

    onTrigger(cursor: EditorPosition, editor: Editor, file: TFile): EditorSuggestTriggerInfo | null {
        if (!this.plugin.settings.isAutosuggestEnabled) {
            return null;
        }

        const triggerPhrase = this.plugin.settings.autocompleteTriggerPhrase;
        const startPos = this.context?.start || {
            line: cursor.line,
            ch: cursor.ch - triggerPhrase.length,
        };

        if (!editor.getRange(startPos, cursor).startsWith(triggerPhrase)) {
            return null;
        }

        const precedingChar = editor.getRange(
            {
                line: startPos.line,
                ch: startPos.ch - 1,
            },
            startPos
        );

        return {
            start: startPos,
            end: cursor,
            query: editor.getRange(startPos, cursor).substring(triggerPhrase.length),
        };
    }

    getSuggestions(context: EditorSuggestContext): ILocationCompletion[] {
        return this.plugin.settings.locations
            .map((loc) => loc.names.map((name) => ({label: `${name}`})))
            .flat()
            .filter((item) => item.label.toLowerCase().contains(context.query.toLowerCase()))
            .sort((a, b) => a.label > b.label ? 1 : -1);
    }

    renderSuggestion(suggestion: ILocationCompletion, el: HTMLElement): void {
        el.setText(suggestion.label);
    }

    selectSuggestion(suggestion: ILocationCompletion, evt: MouseEvent | KeyboardEvent): void {
        if (!this.context) {
            console.log("selectSuggestion, this.context is null");
            return;    
        }

        const { editor } = this.context;

        const locs = this.plugin.settings.locations
            .map((loc) => loc.names.map((name) => ({name: `${name}`, coordinates: `${loc.coordinates}`})))
            .flat()
            .filter((item) => item.name.toLowerCase().contains(suggestion.label.toLowerCase()))
        
        if (locs.length != 1) {
            return;
        }
        const loc = locs[0];
        
        const ret = `[${loc.name}](geo:${loc.coordinates})`;

        editor.replaceRange(ret, this.context.start, this.context.end);
    }
}