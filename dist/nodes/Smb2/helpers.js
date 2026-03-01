"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReadableError = getReadableError;
exports.connectToSmbServer = connectToSmbServer;
const node_smb2_1 = require("node-smb2");
const File_1 = __importDefault(require("node-smb2/dist/client/File"));
const Tree_1 = __importDefault(require("node-smb2/dist/client/Tree"));
const FilePipePrinterAccess_2 = __importDefault(require("node-smb2/dist/protocol/smb2/FilePipePrinterAccess"));
const n8n_workflow_1 = require("n8n-workflow");
const util_1 = require("util");
const debug = (0, util_1.debuglog)('n8n-nodes-smb2');
Tree_1.default.prototype.renameFile = async function (path, newPath) {
    const file = new File_1.default(this);
    this.registerFile(file);
    const desiredAccess = FilePipePrinterAccess_2.default.Delete |
        FilePipePrinterAccess_2.default.WriteAttributes |
        FilePipePrinterAccess_2.default.ReadAttributes |
        FilePipePrinterAccess_2.default.ReadControl |
        FilePipePrinterAccess_2.default.Synchronize;
    await file.open(path, { desiredAccess: desiredAccess });
    await file.rename(newPath);
    await file.close();
};
const SMB_ERROR_CODES = {
    3221225525: 'Access Denied - Check your permissions for this file/folder',
    3221225506: 'File/Path Not Found',
    3221225514: 'Invalid Parameter',
    3221225485: 'Sharing Violation - File is in use by another process',
    3221225524: 'Object Name Invalid',
    3221225534: 'Not Enough Quota',
    3221225581: 'Logon Failure - Check your username, password, and domain',
    3221226036: 'Bad Network Name - The specified share does not exist on the server',
    2147942402: 'Network Name Not Found - Share does not exist',
    2147942405: 'Network Path Not Found',
    5: 'Access Denied',
    32: 'Sharing Violation',
    53: 'Network Path Not Found',
    67: 'Network Name Not Found',
    87: 'Invalid Parameter',
    1314: 'Network Error',
};
function getReadableError(error) {
    var _a, _b, _c;
    if (!error)
        return 'Unknown error occurred';
    const errorCode = ((_a = error.header) === null || _a === void 0 ? void 0 : _a.status) || error.code || error.errno;
    if (errorCode && SMB_ERROR_CODES[errorCode]) {
        return `${SMB_ERROR_CODES[errorCode]} (Code: ${errorCode})`;
    }
    if (error.code === 'ECONNREFUSED') {
        return 'Could not connect to SMB server - Connection refused';
    }
    if (error.code === 'ETIMEDOUT') {
        return 'Connection to SMB server timed out';
    }
    if (error.code === 'ENOTFOUND') {
        return 'SMB server not found - Check the server address';
    }
    if (!error.message && ((_b = error.header) === null || _b === void 0 ? void 0 : _b.status)) {
        return `SMB server returned an error (Code: ${(_c = error.header) === null || _c === void 0 ? void 0 : _c.status})`;
    }
    return error.message || String(error);
}
async function connectToSmbServer() {
    try {
        const credentials = await this.getCredentials('smb2Api');
        let client = new node_smb2_1.Client(credentials.host, {
            port: credentials.port,
            connectTimeout: credentials.connectTimeout,
            requestTimeout: credentials.requestTimeout,
        });
        let session;
        let tree;
        const forceNtlmVersion = credentials.ntlmVersion && credentials.ntlmVersion !== 'auto'
            ? credentials.ntlmVersion
            : undefined;
        debug('Connecting to %s on %s as (%s\\%s) [connectTimeout: %s, requestTimeout: %s, ntlmVersion: %s]', credentials.share, credentials.host, credentials.domain, credentials.username, credentials.connectTimeout, credentials.requestTimeout, forceNtlmVersion || 'auto');
        debug('smb://%s:%s@%s/%s', credentials.username, credentials.password, credentials.host, credentials.share);
        session = await client.authenticate({
            domain: credentials.domain,
            username: credentials.username,
            password: credentials.password,
            forceNtlmVersion: forceNtlmVersion,
        });
        tree = await session.connectTree(credentials.share);
        return { client, session, tree };
    }
    catch (error) {
        debug('Connect error: ', error);
        const readableError = getReadableError(error);
        throw new n8n_workflow_1.NodeApiError(this.getNode(), error, { message: `Failed to connect to SMB server: ${readableError}` });
    }
}
//# sourceMappingURL=helpers.js.map