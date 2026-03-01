"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Smb2Api = void 0;
class Smb2Api {
    constructor() {
        this.name = 'smb2Api';
        this.displayName = 'Samba (SMB2) API';
        this.properties = [
            {
                displayName: 'Server',
                name: 'host',
                type: 'string',
                required: true,
                default: '',
            },
            {
                displayName: 'User Name',
                name: 'username',
                type: 'string',
                required: true,
                default: '',
            },
            {
                displayName: 'Password',
                name: 'password',
                type: 'string',
                typeOptions: {
                    password: true,
                },
                noDataExpression: true,
                required: true,
                default: '',
            },
            {
                displayName: 'Domain',
                name: 'domain',
                type: 'string',
                default: '',
            },
            {
                displayName: 'NTLM Version',
                name: 'ntlmVersion',
                type: 'options',
                description: 'Force a specific NTLM version for authentication. Use NTLMv2 for modern Windows servers.',
                default: 'auto',
                options: [
                    {
                        name: 'Auto-detect (Recommended)',
                        value: 'auto',
                    },
                    {
                        name: 'NTLMv1',
                        value: 'v1',
                    },
                    {
                        name: 'NTLMv2',
                        value: 'v2',
                    },
                ],
            },
            {
                displayName: 'Port',
                name: 'port',
                type: 'number',
                default: 445,
            },
            {
                displayName: 'Share Name',
                name: 'share',
                type: 'string',
                required: true,
                default: '',
            },
            {
                displayName: 'Connect Timeout',
                name: 'connectTimeout',
                type: 'number',
                description: 'Connection timeout in ms',
                default: 15000,
            },
            {
                displayName: 'Request Timeout',
                name: 'requestTimeout',
                description: 'Request timeout in ms',
                type: 'number',
                default: 15000,
            },
        ];
    }
}
exports.Smb2Api = Smb2Api;
//# sourceMappingURL=Smb2Api.credentials.js.map