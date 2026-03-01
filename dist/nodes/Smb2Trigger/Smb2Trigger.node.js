"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Smb2Trigger = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const util_1 = require("util");
const helpers_1 = require("../Smb2/helpers");
const debug = (0, util_1.debuglog)('n8n-nodes-smb2');
class Smb2Trigger {
    constructor() {
        this.description = {
            displayName: 'Samba (SMB2) Trigger',
            name: 'smb2Trigger',
            icon: 'file:smb2.svg',
            group: ['trigger'],
            version: 1,
            description: 'Trigger a workflow on Samba (SMB2) filesystem changes',
            subtitle: '={{$parameter["event"]}}',
            defaults: {
                name: 'Samba (SMB2) Trigger',
            },
            credentials: [
                {
                    name: 'smb2Api',
                    required: true,
                },
            ],
            inputs: [],
            outputs: ['main'],
            properties: [
                {
                    displayName: 'Trigger On',
                    name: 'triggerOn',
                    type: 'options',
                    required: true,
                    default: 'specificFolder',
                    options: [
                        {
                            name: 'Changes Involving a Specific Folder',
                            value: 'specificFolder',
                        },
                    ],
                },
                {
                    displayName: 'Recursive',
                    name: 'recursive',
                    type: 'boolean',
                    default: false,
                },
                {
                    displayName: 'File',
                    name: 'fileToWatch',
                    type: 'resourceLocator',
                    default: { mode: 'list', value: '' },
                    required: true,
                    modes: [
                        {
                            displayName: 'File',
                            name: 'list',
                            type: 'list',
                            placeholder: 'Select a file...',
                            typeOptions: {
                                searchListMethod: 'fileSearch',
                                searchable: true,
                            },
                        },
                        {
                            displayName: 'Path',
                            name: 'path',
                            type: 'string',
                            placeholder: '/etc/hosts'
                        },
                    ],
                    displayOptions: {
                        show: {
                            triggerOn: ['specificFile'],
                        },
                    },
                },
                {
                    displayName: 'Watch For',
                    name: 'event',
                    type: 'options',
                    displayOptions: {
                        show: {
                            triggerOn: ['specificFile'],
                        },
                    },
                    required: true,
                    default: 'fileUpdated',
                    options: [
                        {
                            name: 'File Updated',
                            value: 'fileUpdated',
                        },
                    ],
                    description: 'When to trigger this node',
                },
                {
                    displayName: 'Folder',
                    name: 'folderToWatch',
                    type: 'resourceLocator',
                    default: { mode: 'path', value: '' },
                    required: true,
                    modes: [
                        {
                            displayName: 'By Path',
                            name: 'path',
                            type: 'string',
                            placeholder: '/home/user/',
                        },
                    ],
                    displayOptions: {
                        show: {
                            triggerOn: ['specificFolder'],
                        },
                    },
                },
                {
                    displayName: 'Watch For',
                    name: 'event',
                    type: 'options',
                    displayOptions: {
                        show: {
                            triggerOn: ['specificFolder'],
                        },
                    },
                    required: true,
                    default: 'fileCreated',
                    options: [
                        {
                            name: 'File Created',
                            value: 'fileCreated',
                            description: 'When a file is created in the watched folder',
                        },
                        {
                            name: 'File Deleted',
                            value: 'fileDeleted',
                            description: 'When a file is deleted in the watched folder',
                        },
                        {
                            name: 'File Updated',
                            value: 'fileUpdated',
                            description: 'When a file is updated in the watched folder',
                        },
                        {
                            name: 'Folder Created',
                            value: 'folderCreated',
                            description: 'When a folder is created in the watched folder',
                        },
                        {
                            name: 'Folder Deleted',
                            value: 'folderDeleted',
                            description: 'When a folder is deleted in the watched folder',
                        },
                        {
                            name: 'Folder Updated',
                            value: 'folderUpdated',
                            description: 'When a folder is updated in the watched folder',
                        },
                        {
                            name: 'Watch Folder Updated',
                            value: 'watchFolderUpdated',
                            description: 'When the watched folder itself is modified',
                        },
                    ],
                },
                {
                    displayName: "Changes within subfolders won't trigger this node",
                    name: 'asas',
                    type: 'notice',
                    displayOptions: {
                        show: {
                            triggerOn: ['specificFolder'],
                        },
                        hide: {
                            event: ['watchFolderUpdated'],
                        },
                    },
                    default: '',
                },
                {
                    displayName: 'Watch For',
                    name: 'event',
                    type: 'options',
                    displayOptions: {
                        show: {
                            triggerOn: ['anyFileFolder'],
                        },
                    },
                    required: true,
                    default: 'fileCreated',
                    options: [
                        {
                            name: 'File Created',
                            value: 'fileCreated',
                            description: 'When a file is created in the watched drive',
                        },
                        {
                            name: 'File Updated',
                            value: 'fileUpdated',
                            description: 'When a file is updated in the watched drive',
                        },
                        {
                            name: 'Folder Created',
                            value: 'folderCreated',
                            description: 'When a folder is created in the watched drive',
                        },
                        {
                            name: 'Folder Updated',
                            value: 'folderUpdated',
                            description: 'When a folder is updated in the watched drive',
                        },
                    ],
                    description: 'When to trigger this node',
                },
            ],
        };
    }
    async trigger() {
        const triggerOn = this.getNodeParameter('triggerOn');
        const event = this.getNodeParameter('event');
        const recursive = this.getNodeParameter('recursive');
        let client;
        let tree;
        let closeFunction;
        let path;
        try {
            ({ client, tree } = await helpers_1.connectToSmbServer.call(this));
            if (triggerOn === 'specificFolder' && event !== 'watchFolderUpdated') {
                path = this.getNodeParameter('folderToWatch', '', { extractValue: true });
            }
            else {
                path = this.getNodeParameter('folderToWatch', '', { extractValue: true });
            }
            const stopFunction = await tree.watchDirectory(path, (response) => {
                debug('Response: %s', JSON.stringify(response.body));
                const changeType = response.body.changeType;
                const eventMap = {
                    0x01: "fileCreated",
                    0x02: "fileDeleted",
                    0x03: "fileUpdated",
                    0x04: "folderCreated",
                    0x05: "folderDeleted",
                    0x06: "folderUpdated"
                };
                debug('Change type: %s | %s | %s', changeType, eventMap[changeType], event);
                if (eventMap[changeType] === event) {
                    this.emit([this.helpers.returnJsonArray(response.body)]);
                }
            }, recursive);
            closeFunction = async function () {
                await stopFunction();
                await client.close();
            };
        }
        catch (error) {
            debug('Connect error: ', error);
            const errorMessage = (0, helpers_1.getReadableError)(error);
            throw new n8n_workflow_1.NodeApiError(this.getNode(), error, { message: (`Failed to connect to SMB server: ${errorMessage}`) });
        }
        return {
            closeFunction,
        };
    }
}
exports.Smb2Trigger = Smb2Trigger;
//# sourceMappingURL=Smb2Trigger.node.js.map