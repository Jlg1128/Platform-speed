import * as vscode from 'vscode';
import { completionFuntionAndRefs } from './completionFuntionAndRefs';
import { ComponentRequire } from './componentRequire';
import componentRequireInsert from './componentRequireInsert';
import provideDefinition from './jumpExtension';

export function activate(context: vscode.ExtensionContext) {
    // 函数、组件、$refs跳转
    let jumpExtension = vscode.languages.registerDefinitionProvider(['javascript', 'html'], {provideDefinition});
    // 组件代码Snippets
    let _completionRequired = vscode.languages.registerCompletionItemProvider(['javascript', 'html'], new ComponentRequire());
    // 组件代码Snippets插入后引入requirepath
    let insertCommand = vscode.commands.registerCommand('insertrequire', ({compName, requirepath}) => {
        componentRequireInsert(compName, requirepath);
    })
    // 函数补全
    let completionJS = vscode.languages.registerCompletionItemProvider(['javascript', 'html'], new completionFuntionAndRefs(), '.');
    // vscode.window.showInformationMessage('Regular Extension is Running');

    context.subscriptions.push(jumpExtension);
    context.subscriptions.push(insertCommand);
    context.subscriptions.push(_completionRequired);
    context.subscriptions.push(completionJS);
}

export function deactivate() {
}