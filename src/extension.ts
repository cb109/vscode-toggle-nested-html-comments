import * as vscode from 'vscode';

const HTML_COMMENT_START = '<!--';
const HTML_COMMENT_END = '-->';

let emmetBalanceOutwardOnSelectionChanged = false;

export function activate(context: vscode.ExtensionContext) {

	const config = vscode.workspace.getConfiguration('toggleNestedHtmlComments');
	const DISABLED_HTML_COMMENT_START = config.disabledHtmlCommentStart || '<!-#-';
	const DISABLED_HTML_COMMENT_END = config.disabledHtmlCommentEnd|| '-#->';

	let disposable = vscode.commands.registerCommand('vscode-toggle-nested-html-comments.toggleNestedHtmlComments', () => {

		var editor = vscode.window.activeTextEditor;
		if (!editor) {
				return;
		}
		var selection = editor.selection;
		var text = editor.document.getText(selection);

		const commented = text.trim().startsWith(HTML_COMMENT_START) && text.trim().endsWith(HTML_COMMENT_END);

		if (commented) {
			// Restore inner disabled html comments, then uncomment.
			text = text.replaceAll(DISABLED_HTML_COMMENT_START, HTML_COMMENT_START);
			text = text.replaceAll(DISABLED_HTML_COMMENT_END, HTML_COMMENT_END);
			editor.edit(builder => {
				builder.replace(editor.selection, text);
			});
			vscode.commands.executeCommand('editor.action.commentLine');
		}
		else {
			// Disable inner html comments, then outcomment.
			text = text.replaceAll(HTML_COMMENT_START, DISABLED_HTML_COMMENT_START);
			text = text.replaceAll(HTML_COMMENT_END, DISABLED_HTML_COMMENT_END);
			editor.edit(builder => {
				builder.replace(editor.selection, text);
			});
			emmetBalanceOutwardOnSelectionChanged = true;
			vscode.commands.executeCommand('editor.action.commentLine');
		}
	});

	context.subscriptions.push(disposable);

	// Make sure new start/end comment is also selected. We need to do this
	// delayed here, calling it directly after text replacement would use the
	// 'old' selection as a starting point instead of the replaced selection.
	context.subscriptions.push(
		vscode.window.onDidChangeTextEditorSelection(function(e) {
			if (emmetBalanceOutwardOnSelectionChanged) {
				vscode.commands.executeCommand('editor.emmet.action.balanceOut');
				emmetBalanceOutwardOnSelectionChanged = false;
			}
		})
	);
}

export function deactivate() {}
