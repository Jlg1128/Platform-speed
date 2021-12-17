import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {JS_OR_HTML_REG} from './const'

export enum TAG_OPEN_TYPE {
  OPEN = 'open',
  CLOSE = 'close',
}

const getFilePath = (editor: vscode.TextEditor | undefined, fileExtension: string) => {
  let activeFileName = editor ? editor.document.fileName : '';
  activeFileName = activeFileName.substring(0, activeFileName.lastIndexOf('.'));
  return activeFileName + fileExtension;
}

const escapeRegExp = function (str: string) { // Credit: XRegExp 0.6.1 (c) 2007-2008 Steven Levithan <http://stevenlevithan.com/regex/xregexp/> MIT License
  return str.replace(/[-[\]{}()*+?.\\^$|,#\s]/g, '\\$&');
};

// JS文件中判断当前位置是在open tag处还是在end tag处
const judgeTypeOfTag = function(componentName: string, currentLineText: string,  currentPosition: vscode.Position): TAG_OPEN_TYPE {
  let componentReg = new RegExp(`${escapeRegExp(componentName)}`, 'g');
  let componentMatch = null;
  let componentsIndexArr = [];
  while (componentMatch = componentReg.exec(currentLineText)) {
    componentsIndexArr.push(componentMatch.index);
  }
  if (componentsIndexArr.length !== 1 && Math.abs(componentsIndexArr[1] - currentPosition.character) < Math.abs(componentsIndexArr[0] - currentPosition.character)) {
    return TAG_OPEN_TYPE.CLOSE;
  } else {
    return TAG_OPEN_TYPE.OPEN;
  }
}

function traverse(filepath: string, componentName: string, excludeDirNames: string[] = []) {
  let tempFilePath = filepath;
  let temp: string[] = [filepath];
  while (temp.length) {
    // @ts-ignore
    tempFilePath = temp.pop();
    let fileStat = fs.statSync(tempFilePath);
    if (fileStat.isFile()) {
      let fileName = path.basename(tempFilePath);
      if (JS_OR_HTML_REG.test(fileName)) {
        let file = fs.readFileSync(tempFilePath, 'utf-8');
        let templateNameMatch = new RegExp(`name:\\s*['|"]${escapeRegExp(componentName)}['|"]`);
        if (templateNameMatch.test(file)) {
          return tempFilePath;
        }
      }
    }
    else {
      let dirNames = fs.readdirSync(tempFilePath);
      for (let dirname of dirNames) {
        if (!excludeDirNames.includes(dirname)) {
          temp.push(tempFilePath + '/' + dirname);
        }
      }
    }
  }
  return '';
}

function getComponentResolvePath(basedir: string | string[], componentName: string, excludeDirNames: string[]) {
  let resultFilePath = '';
  if (Array.isArray(basedir)) {
    for (let dirpath of basedir) {
      if ((resultFilePath = traverse(dirpath, componentName, excludeDirNames))) {
        return resultFilePath;
      }
    }
  } else {
    resultFilePath = traverse(basedir, componentName, excludeDirNames);
  }
  return resultFilePath;
}

// 获取指定范围的text
function getWiderRangeText(document: vscode.TextDocument, position: vscode.Position, leftadd: number, rightadd: number) {
  const lineNumber = position.line;
  const range = document.getWordRangeAtPosition(position)
  if (!range) {
    return '';
  }
  return document.getText(new vscode.Range(new vscode.Position(lineNumber, range.start.character - leftadd), new vscode.Position(lineNumber, range.end.character + rightadd)));
}
// const baseDir = path.join(__dirname, '/src/app/client/components');

export {
  getFilePath,
  escapeRegExp,
  getComponentResolvePath,
  getWiderRangeText,
  judgeTypeOfTag,
}