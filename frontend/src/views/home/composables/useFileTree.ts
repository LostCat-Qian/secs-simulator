import { ref } from 'vue';
import { Message, Modal, TreeNodeData } from '@arco-design/web-vue';
import { ipc } from '@/utils/ipcRenderer';
import { ipcApiRoute } from '@/api';
import type { SmlTreeNode } from '../types';

/**
 * Hook for managing file tree operations (SML files and folders)
 * @returns File tree state and methods
 */
export function useFileTree() {
  const fileTreeData = ref<SmlTreeNode[]>([]);
  const filePreviewContent = ref('');
  
  // State for file editing
  const editingFileName = ref('');
  const editingFileContent = ref('');
  const editingFilePath = ref('');
  const isCreateMode = ref(false);
  const creatingFolderPath = ref('');

  /**
   * Loads the file tree structure from backend.
   */
  const loadFileTree = async () => {
    if (!ipc) return;
    try {
      const result = await ipc.invoke(ipcApiRoute.smlFileTree, null);
      fileTreeData.value = Array.isArray(result) ? (result as SmlTreeNode[]) : [];
    } catch (error) {
      console.error('Failed to load file tree:', error);
      Message.error('Failed to load file tree');
    }
  };

  /**
   * Normalizes file path separators.
   */
  const normalizePath = (p: string | undefined | null) => {
    if (!p) return '';
    return String(p).replace(/\\/g, '/');
  };

  /**
   * Creates a new folder.
   * @param folderName Name of the new folder
   * @param parentPath Parent folder path (optional)
   */
  const createFolder = async (folderName: string, parentPath: string = '') => {
    const name = folderName.trim();
    if (!name) {
      Message.error('Folder name is required');
      return false;
    }
    if (/[\\/]/.test(name)) {
      Message.error('Folder name cannot contain / or \\');
      return false;
    }

    const folderPath = parentPath ? `${parentPath}/${name}` : name;

    // Check existence
    const exists = (() => {
      const search = (nodes: SmlTreeNode[]): boolean => {
        for (const node of nodes) {
          if (normalizePath(node.key as string) === normalizePath(folderPath)) {
            return true;
          }
          if (node.children && node.children.length > 0) {
            if (search(node.children as SmlTreeNode[])) {
              return true;
            }
          }
        }
        return false;
      };
      return search(fileTreeData.value);
    })();

    if (exists) {
      Message.error('Folder already exists');
      return false;
    }

    if (!ipc) {
      Message.error('Cannot create folder');
      return false;
    }

    try {
      await ipc.invoke(ipcApiRoute.smlFolderCreate, { folderPath });
      await loadFileTree();
      Message.success(`Folder "${name}" created successfully`);
      return true;
    } catch (error) {
      console.error('Failed to create folder:', error);
      Message.error('Failed to create folder');
      return false;
    }
  };

  /**
   * Loads file content for preview or editing.
   * @param node The file node
   */
  const loadFileContent = async (node: TreeNodeData) => {
    const target = node as SmlTreeNode;
    if ((target.isFolder && target.isFolder === true) || !target.key) {
      return;
    }
    editingFileName.value = String(target.title || '');
    editingFilePath.value = String(target.key || '');
    let content = '';
    if (ipc) {
      try {
        const result = await ipc.invoke(ipcApiRoute.smlFileContent, {
          filePath: editingFilePath.value
        });
        content = result ? String(result) : '';
      } catch (error) {
        console.error('Failed to load file content:', error);
        Message.error('Failed to load file content');
      }
    }
    if (!content) {
      content = `// ${editingFileName.value}\n`;
    }
    editingFileContent.value = content;
    filePreviewContent.value = content;
  };

  /**
   * Saves a file (create new or update existing).
   * @param payload Name and content of the file
   */
  const saveFile = async (payload: { name: string; content: string }) => {
    if (!ipc) {
      Message.error('Cannot save file');
      return false;
    }

    let name = payload.name?.trim() || editingFileName.value;
    const content = payload.content;

    if (!name) {
      Message.error('File name is required');
      return false;
    }

    if (isCreateMode.value && !name.toLowerCase().endsWith('.txt')) {
      name = `${name}.txt`;
    }

    const targetPath = (() => {
      if (!isCreateMode.value) {
        return editingFilePath.value;
      }
      if (!creatingFolderPath.value) {
        return name;
      }
      const base = normalizePath(creatingFolderPath.value);
      return `${base}/${name}`;
    })();

    if (isCreateMode.value) {
      const exists = (() => {
        const search = (nodes: SmlTreeNode[]): boolean => {
          for (const node of nodes) {
            if (normalizePath(node.key as string) === normalizePath(targetPath)) {
              return true;
            }
            if (node.children && node.children.length > 0) {
              if (search(node.children as SmlTreeNode[])) {
                return true;
              }
            }
          }
          return false;
        };
        return search(fileTreeData.value);
      })();

      if (exists) {
        Message.error('File already exists, please rename');
        return false;
      }
    }

    try {
      if (isCreateMode.value) {
        await ipc.invoke(ipcApiRoute.smlFileCreate, {
          filePath: targetPath,
          content
        });

        editingFileName.value = name;
        editingFilePath.value = targetPath || '';
        editingFileContent.value = content;
        filePreviewContent.value = content;

        await loadFileTree();
        Message.success(`File "${name}" created successfully`);
      } else {
        if (!targetPath) {
          Message.error('Cannot save file');
          return false;
        }

        await ipc.invoke(ipcApiRoute.smlFileSave, {
          filePath: targetPath,
          content
        });

        editingFileContent.value = content;
        filePreviewContent.value = content;
        Message.success(`File "${editingFileName.value}" saved successfully`);
      }
      return true;
    } catch (error) {
      console.error('Failed to save file:', error);
      Message.error('Failed to save file');
      return false;
    }
  };

  /**
   * Helper to remove a node from the tree recursively.
   */
  const removeNodeFromTree = (key: string) => {
    const remove = (nodes: SmlTreeNode[]): SmlTreeNode[] =>
      nodes
        .map((node) => {
          const current = { ...node };
          if (current.children && current.children.length > 0) {
            current.children = remove(current.children);
          }
          return current;
        })
        .filter((node) => node.key !== key);

    fileTreeData.value = remove(fileTreeData.value);
  };

  /**
   * Deletes a file or folder.
   * @param node The node to delete
   */
  const deleteNode = async (node: TreeNodeData) => {
    const target = node as SmlTreeNode;
    if (!target.key) return;

    const isFolder = target.isFolder;
    const typeText = isFolder ? 'Folder' : 'File';

    return new Promise<void>((resolve, reject) => {
      Modal.confirm({
        title: `Delete ${typeText}`,
        content: `Are you sure you want to delete ${typeText.toLowerCase()} "${target.title}"?`,
        okText: 'Delete',
        cancelText: 'Cancel',
        onOk: async () => {
          if (!ipc) {
            Message.error(`Cannot delete ${typeText.toLowerCase()}`);
            reject();
            return;
          }
          try {
            if (isFolder) {
              await ipc.invoke(ipcApiRoute.smlFolderDelete, {
                folderPath: target.key
              });
            } else {
              await ipc.invoke(ipcApiRoute.smlFileDelete, {
                filePath: target.key
              });
            }

            removeNodeFromTree(target.key as string);
            Message.success(`${typeText} deleted`);
            resolve();
          } catch (error) {
            console.error(`Failed to delete ${typeText.toLowerCase()}:`, error);
            Message.error(`Failed to delete ${typeText.toLowerCase()}`);
            reject(error);
          }
        }
      });
    });
  };

  /**
   * Prepares state for adding a new file.
   * @param folderPath The path where the file will be created
   */
  const prepareAddFile = (folderPath: string) => {
    creatingFolderPath.value = folderPath;
    editingFileName.value = '';
    editingFilePath.value = '';
    editingFileContent.value = '';
    isCreateMode.value = true;
  };

  /**
   * Prepares state for editing an existing file.
   * @param node The file node
   */
  const prepareEditFile = async (node: TreeNodeData) => {
    isCreateMode.value = false;
    await loadFileContent(node);
  };

  return {
    fileTreeData,
    filePreviewContent,
    editingFileName,
    editingFileContent,
    editingFilePath,
    isCreateMode,
    creatingFolderPath,
    loadFileTree,
    createFolder,
    loadFileContent,
    saveFile,
    deleteNode,
    prepareAddFile,
    prepareEditFile
  };
}
