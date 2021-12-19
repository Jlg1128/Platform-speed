import * as vscode from 'vscode';
import {TAG_MATCH} from './const'
import {getRelativeContent} from './util';

export class completionFuntionAndRefs implements vscode.CompletionItemProvider {
    private getRefs(content: string) {
        const completionItems:vscode.CompletionItem[] = [];
        // ref定义正则
        const regExp = /\bref\b\s*=\s*['|"]*(\w+)['|"]*\s*/g;
        
        let result;
        while((result = regExp.exec(content)) !== null) {
            const refName = result[1];
            
            let completionItem = new vscode.CompletionItem(refName, vscode.CompletionItemKind.Value);
            completionItems.push(completionItem);
        }

        return completionItems;
    }

    private getMethods(content: string, currentLine: vscode.TextLine, option: {fileResolvePath: string}) {
        const completionItems:vscode.CompletionItem[] = [];
        
        // 函数定义正则
        // const funcExp = /(\S+)\((.*)\)\s*{/g;
        const funcExp = /\s{1,}([a-zA-Z_]+)\((.*)\)\s*{/g;
        
        let result;
        while((result = funcExp.exec(content)) !== null) {
            const funcName = result[1];
            let params = result[2].split(',');
            params = params.map((p) => p.trim());
            
            // 生命周期函数过滤
            if (['config', 'init', 'destory', 'mount', 'enter', 'leave', 'mapState', 'mapTemporary'].indexOf(funcName) !== -1) {
                continue;
            }
            let completionItem = new vscode.CompletionItem(funcName, vscode.CompletionItemKind.Function);
            let snippet = `${funcName}(`;
            params.forEach((p, index) => {
                if ((TAG_MATCH.test(currentLine.text) || /\.html/.test(option.fileResolvePath)) && ['e', 'event', 'evt'].includes(p)) {
                    p = '$event';
                }
                // 处理包含$符的变量
                if (p.indexOf('$') !== -1) {
                    p = '\\' + p;
                }
                if (index === params.length - 1) {
                    snippet += `\${${index + 1}:${p}})`;
                } else {
                    snippet += `\${${index + 1}:${p}},`;
                }
            });
            completionItem.insertText = new vscode.SnippetString(snippet);
            completionItems.push(completionItem);
        }
        return completionItems;
    }
    
    public async provideCompletionItems(document:vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): Promise<vscode.CompletionItem[]> {
        let completionItems: vscode.CompletionItem[] = [];
        const triggerCharacter = context.triggerCharacter;
        
        // 触发条件为.时
        if (triggerCharacter === '.') {
            const fileResolvePath = document.fileName;
            const lineText = document.lineAt(position.line).text;
            const isRefs = lineText.match(/\$refs\./g);
            const isThis = lineText.match(/this\./g);
            const isCurrentInJS = /\.js$/.test(fileResolvePath);
            const currentLineText = document.lineAt(position);
            // ref匹配
            // 1.在html中匹配html文件
            // 2.在js中匹配js+html
            if(isRefs) {
                completionItems = this.getRefs(document.getText());
                if (isCurrentInJS) {
                    let tempDocument = await getRelativeContent(fileResolvePath);
                    if (tempDocument) {
                        completionItems = completionItems.concat(this.getRefs(tempDocument.getText()));
                    }
                }
            } else if (isThis) {
                // function匹配
                // 1.都匹配js文件
                if (isCurrentInJS) {
                    return this.getMethods(document.getText(), currentLineText, {fileResolvePath});
                } else {
                    let tempDocument = await getRelativeContent(document.fileName);
                    if (tempDocument) {
                        return this.getMethods(tempDocument.getText(), currentLineText, {fileResolvePath});
                    }
                }
            }
        }

        return completionItems;
    }
}