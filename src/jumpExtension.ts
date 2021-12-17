import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { getFilePath, getComponentResolvePath, getWiderRangeText, judgeTypeOfTag, TAG_OPEN_TYPE, escapeRegExp } from './util';
import { NORMAL_HTMLELMENT_ARRAY, COMPONENT_DIR_PATH, TAG_MATCH, CONTAINER_COMPONENT_DIR_PATH, EXCLUDE_TRAVERSE_DIRNAMES, ENDTAG_MATCH } from './const';

/**
 * 查找文件定义的provider，匹配到了就return一个location，否则不做处理
 * 最终效果是，当按住Ctrl键时，如果return了一个location，字符串就会变成一个可以点击的链接，否则无任何效果
 * @param {*} document 
 * @param {*} position 
 * @param {*} token 
 */
async function provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) {
  const fileName = path.basename(document.fileName);
  const fileResolvePath = document.fileName;
  const workDir = path.dirname(fileName);
  const line = document.lineAt(position);
  const lineNumber = position.line;
  const range = document.getWordRangeAtPosition(position);
  let word = document.getText(document.getWordRangeAtPosition(position));
  // const projectPath = util.getProjectPath(document);
  // console.log('====== 进入 provideDefinition 方法 ======');
  // console.log('fileName: ' + fileName); // 文件名
  // console.log('fileResolvePath: ' + fileResolvePath); // 文件绝对路径
  // console.log('workDir: ' + workDir); // 当前文件所在目录
  console.log('word: ' + word); // 当前光标所在单词

  let wordSpaceFolders = vscode.workspace.workspaceFolders;
  if (!wordSpaceFolders || !wordSpaceFolders.length || !range) {
    return null;
  }

  let projectPath = wordSpaceFolders[0].uri.path;  // 当前工程目录

  let lineText = line.text;

  const funcNameMatch = /\.([a-zA-Z_]+)\s*\(/;

  let currentInJS = /.js$/.test(path.basename(fileResolvePath));
  let jsFilePath = currentInJS ? fileResolvePath : getFilePath(vscode.window.activeTextEditor, '.js');

  if (!fs.existsSync(jsFilePath)) {
    return;
  }

  // 左右各自扩张1，用来匹配.和函数的(
  let moreWiderRange = getWiderRangeText(document, position, 1, 1);
  let widerRangeHead = moreWiderRange[0];
  let widerRangeFoot = moreWiderRange[moreWiderRange.length - 1];
  console.log('moreWiderRange', moreWiderRange);

  const refsMatch = new RegExp(`(?:(\\$refs\\.${word})|(\\{\\s*${word}\\s*\\}\\s*=\\s*this\\.\\$refs))`);
  let currentLineText = document.lineAt(position).text;

  let jsFile: vscode.TextDocument | null = null;
  if (word === 'this') {
    jsFile = currentInJS ? document : await vscode.workspace.openTextDocument(jsFilePath);
    let componentMatch = new RegExp('[A-Z]{1}[a-z]+\\.extend\\(\\{').exec(jsFile.getText());
    let lineNumber = 0;
    if (componentMatch) {
      lineNumber = jsFile.positionAt(componentMatch.index).line;
    }
    return new vscode.Location(vscode.Uri.file(jsFilePath), new vscode.Position(lineNumber, 0));
  } else if (refsMatch.test(currentLineText)) {
    // 匹配 this.$refs.input 或者 const {input} = this.$refs
    let refComponentMatch = null;
    let content = document.getText();
    let filepath = '';
    if (refComponentMatch = new RegExp(`ref=['|"]?${word}['|"]?(?:>|\\s+)`).exec(content)) {
      // 先从当前文件匹配
      let position = document.positionAt(refComponentMatch.index);
      return new vscode.Location(vscode.Uri.file(fileResolvePath), new vscode.Position(position.line, position.character));
    } else {
      // 如果不在同一文件中，就在相对的文件中找。如果当前在js文件，则在html中找，如果在html文件，则在js上找。
      if (currentInJS) {
        filepath = getFilePath(vscode.window.activeTextEditor, '.html');
      } else {
        filepath = getFilePath(vscode.window.activeTextEditor, '.js');
      }
      if (fs.existsSync(filepath)) {
        let tempDocument = await vscode.workspace.openTextDocument(filepath);
        content = tempDocument.getText();
        if (refComponentMatch = new RegExp(`ref=['|"]?${word}['|"]?(?:>|\\s+)`).exec(content)) {
          let position = tempDocument.positionAt(refComponentMatch.index);
          return new vscode.Location(vscode.Uri.file(filepath), new vscode.Position(position.line, position.character));
        }
      }
    }
  } else if (funcNameMatch.test(lineText) && widerRangeHead === '.' && widerRangeFoot === '(') {
    // 匹配this.onChange()
    let funcName = word;
    jsFile = currentInJS ? document : await vscode.workspace.openTextDocument(jsFilePath);
    const text = jsFile.getText();
    let jsFunctionMatch = new RegExp(`\\n(?!\\n)(\\s*)${funcName}\\((.*)\\)\\s*{`).exec(text);
    if (jsFunctionMatch) {
      let emptyStrLen = jsFunctionMatch[1].length;
      let lineNumber = jsFile.positionAt(jsFunctionMatch.index).line;
      return new vscode.Location(vscode.Uri.file(jsFilePath), new vscode.Position(lineNumber + 1, emptyStrLen));
    }

  } else if (widerRangeHead === '<' || widerRangeFoot === '>' || TAG_MATCH.test(currentLineText)) {
    let componentFilePath = '';
    let tagMatchArr = TAG_MATCH.exec(currentLineText);
    if (!tagMatchArr) {
      return null;
    }
    let needTraversePath = [projectPath + COMPONENT_DIR_PATH, projectPath + CONTAINER_COMPONENT_DIR_PATH];
    let completeTag = tagMatchArr[1];
    // 如果选中了<r-table total={10}>里面的total也能进入这里
    // 所以要通过匹配完整的标签，校验标签中是否包含total，不包含或者标签是非Regular组件直接退出
    if (!completeTag.includes(word) || NORMAL_HTMLELMENT_ARRAY.includes(completeTag)) {
      return null;
    }

    // <r-auto-width-input>，在js中匹配选中的word是并不是完整的r-auto-width-input，在html中是完整的。
    // 所以在js中的组件需要自定义跳转
    if (currentInJS) {
      let isCloseTag = judgeTypeOfTag(completeTag, currentLineText, position) === TAG_OPEN_TYPE.CLOSE;
      let completeTagStartIdx = 0;
      if (isCloseTag) {
        tagMatchArr = new RegExp(`<\\/\\s*(${escapeRegExp(completeTag)})\\s*`).exec(currentLineText);
      }
      // @ts-ignore
      completeTagStartIdx = tagMatchArr[0].indexOf(completeTag)
      if (
        tagMatchArr && (componentFilePath = getComponentResolvePath(needTraversePath, completeTag, EXCLUDE_TRAVERSE_DIRNAMES))
      ) {
        let startCharcter = tagMatchArr.index + completeTagStartIdx; // 匹配内容包含</或者<，所以要加上这些字符的长度
        let endCharcter = startCharcter + completeTag.length;
        let selectRange = new vscode.Range(new vscode.Position(lineNumber, startCharcter), new vscode.Position(lineNumber, endCharcter));
        let link: vscode.LocationLink = { originSelectionRange: selectRange, targetUri: vscode.Uri.file(componentFilePath), targetRange: new vscode.Range(new vscode.Position(0, 0), new vscode.Position(5, 50)) };
        return [link];
      }
    } else if (componentFilePath = getComponentResolvePath(needTraversePath, completeTag, EXCLUDE_TRAVERSE_DIRNAMES)) {
      console.log('componentFilePath', componentFilePath);
      return new vscode.Location(vscode.Uri.file(componentFilePath), new vscode.Position(0, 0));
    }
  }
  return null;
}

export default provideDefinition;