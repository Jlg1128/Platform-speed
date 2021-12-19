import * as vscode from 'vscode';
import { getFilePath } from './util';
const htmlCompJSON = require('../snippets/platform-component-html.json');
const jsCompJSON = require('../snippets/platform-component-js.json');

const componentsMap = {
    html: JSON.parse(JSON.stringify(htmlCompJSON)),
    js: JSON.parse(JSON.stringify(jsCompJSON)),
}
export class ComponentRequire implements vscode.CompletionItemProvider {
    public components: any = {};
    public componentNames: string[] = [];

    public provideCompletionItems(document:vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.CompletionItem[] {
        let completionItems:vscode.CompletionItem[] = [];
        
        let currentInJS = /\.js$/.test(document.fileName);
        const components = currentInJS ? componentsMap.js : componentsMap.html;
        const componentNames = Object.keys(components);

        const triggerCharacter = context.triggerCharacter;
        if (!triggerCharacter || !['.', '/'].includes(triggerCharacter)) {
            this.components = components;
            this.componentNames = componentNames;
            this.componentNames.forEach((compName: string) => {
                let completionItem = new vscode.CompletionItem(compName, vscode.CompletionItemKind.Snippet);
                completionItem.insertText = this.components[compName].body;
                let jsFilePath = currentInJS ? document.fileName : getFilePath(document.fileName, '.js');
                // client/components目录下就不支持自动引入了，没法判断是否引入了组件
                if (jsFilePath && !jsFilePath.includes('/src/app/client/components')) {
                    completionItem.command = {title: 'insertrequire', command: 'insertrequire', tooltip: '这是tooltip', arguments: [{requirepath: this.components[compName].requirepath, compName, filepath: jsFilePath}]}
                }
                completionItems.push(completionItem);
            });
        }
        return completionItems;
    }
}

export default ComponentRequire;