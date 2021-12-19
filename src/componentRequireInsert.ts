import * as vscode from 'vscode';
import { getCurrentProjectPath, getFilePath } from './util';
import * as fs from 'fs';

async function componentRequireInsert(compName: string, requirepath: string|string[]): Promise<void> {
  let projectPath = getCurrentProjectPath();
  if (!projectPath) {
    return;
  } else {
    let editor = vscode.window.activeTextEditor;
    if (editor) {
      let { document } = editor;
      let isCurrentInJS = /.js$/.test(document.fileName);
      let jsFilePath = document.fileName;
      let fileData = document.getText();
      if (!isCurrentInJS) {
        jsFilePath = getFilePath(editor.document.fileName, '.js')
        if (fs.existsSync(jsFilePath)) {
          let edit = new vscode.WorkspaceEdit();
          if (Array.isArray(requirepath)) {
            requirepath.forEach(item => insertByWorkspaceEdit(item, jsFilePath, edit));
          } else {
            insertByWorkspaceEdit(requirepath, jsFilePath, edit);
          }
        }
      } else {
        editor.edit((editBuilder) => {
          if (Array.isArray(requirepath)) {
            requirepath.forEach((item) => {
              insertByEditor(fileData, item, editBuilder)
            })
          } else {
            insertByEditor(fileData, requirepath, editBuilder)
          }
        })
      }
      // let needTraversePath = [projectPath + COMPONENT_DIR_PATH, projectPath + CONTAINER_COMPONENT_DIR_PATH];
      // let componentPath = getComponentResolvePath(needTraversePath, compName, EXCLUDE_TRAVERSE_DIRNAMES);
      // console.log('componentPath', componentPath);
    }
  }

  function insertByEditor(fileData: string, requirepath: string, editBuilder: vscode.TextEditorEdit) {
    if (!isRequireAlreadyIn(fileData, requirepath)) {
      // new Modal
      let newCompReg = /([\w-]+)\s{1,}new$/;
      requirepath = `require('${requirepath}');\n`;
      if (newCompReg.test(compName)) {
        // @ts-ignore
        compName = newCompReg.exec(compName)[1];
        requirepath = `const ${compName} = ` + requirepath;
      }
      editBuilder.insert(new vscode.Position(0, 0), requirepath);
    }
  }
  function insertByWorkspaceEdit(requirepath: string, filepath: string, edit: vscode.WorkspaceEdit) {
    let fileData = fs.readFileSync(filepath, 'utf-8');
    if (!isRequireAlreadyIn(fileData, requirepath)) {
      requirepath = `require('${requirepath}');\n`;
      edit.insert(vscode.Uri.file(filepath), new vscode.Position(0, 0), requirepath);
      vscode.workspace.applyEdit(edit);
    }
  }
  function isRequireAlreadyIn(fileData: string, requirepath: string): boolean {
    if (
      fileData.indexOf(requirepath) !== -1
      || fileData.indexOf(requirepath = requirepath.replace(/comp(?=\/)/, 'client/components')) !== -1
      || fileData.indexOf(requirepath.replace('client/components', '')) !== -1
      ) {
      return true;
    }
    return false;
  }
}

export default componentRequireInsert;