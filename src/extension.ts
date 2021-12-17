// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { CompletionJS } from './completionJS';
import { CompletionHTML } from './completionHTML';
import provideDefinition from './jumpExtension';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let jumpExtension = vscode.languages.registerDefinitionProvider(['javascript', 'html'], {provideDefinition});

    let completionJS = vscode.languages.registerCompletionItemProvider({
        scheme: 'file',
        language: 'javascript'
    }, new CompletionJS(), '');
    let completionHTML = vscode.languages.registerCompletionItemProvider({
        scheme: 'file',
        language: 'html'
    }, new CompletionHTML(), '.');
    // vscode.window.showInformationMessage('Regular Extension is Running');

    context.subscriptions.push(jumpExtension);
    context.subscriptions.push(completionJS);
    context.subscriptions.push(completionHTML);
}

// this method is called when your extension is deactivated
export function deactivate() {
}