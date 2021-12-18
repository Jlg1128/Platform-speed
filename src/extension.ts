import * as vscode from 'vscode';
import { CompletionJS } from './completionJS';
import { CompletionRequire } from './CompletionRequire';
import { CompletionHTML } from './completionHTML';
import componentRequireInsert from './componentRequireInsert';
import provideDefinition from './jumpExtension';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    // 函数或者组件跳转
    let jumpExtension = vscode.languages.registerDefinitionProvider(['javascript', 'html'], {provideDefinition});

    // 组件代码Snippets
    let _completionRequired = vscode.languages.registerCompletionItemProvider(['javascript', 'html'], new CompletionRequire());
    // 组件代码Snippets插入后触发
    let insertCommand = vscode.commands.registerCommand('insertrequire', ({compName, requirepath}) => {
        componentRequireInsert(compName, requirepath);
    })
    // 函数补全
    let completionJS = vscode.languages.registerCompletionItemProvider({
        scheme: 'file',
        language: 'javascript'
    }, new CompletionJS(), '.');
    // 函数补全
    let completionHTML = vscode.languages.registerCompletionItemProvider({
        scheme: 'file',
        language: 'html'
    }, new CompletionHTML(), '.');
    // vscode.window.showInformationMessage('Regular Extension is Running');

    context.subscriptions.push(jumpExtension);
    context.subscriptions.push(insertCommand);
    context.subscriptions.push(_completionRequired);
    context.subscriptions.push(completionJS);
    context.subscriptions.push(completionHTML);
}

// this method is called when your extension is deactivated
export function deactivate() {
}