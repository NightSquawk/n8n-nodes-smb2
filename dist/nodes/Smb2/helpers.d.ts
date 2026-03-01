import { Client } from "node-smb2";
import Session from "node-smb2/dist/client/Session";
import Tree from "node-smb2/dist/client/Tree";
import { IExecuteFunctions, ITriggerFunctions } from "n8n-workflow";
export declare function getReadableError(error: any): string;
export declare function connectToSmbServer(this: IExecuteFunctions | ITriggerFunctions): Promise<{
    client: Client;
    session: Session;
    tree: Tree;
}>;
