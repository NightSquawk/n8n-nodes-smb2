import { type INodeType, type INodeTypeDescription, type ITriggerResponse, type ITriggerFunctions } from 'n8n-workflow';
export declare class Smb2Trigger implements INodeType {
    description: INodeTypeDescription;
    trigger(this: ITriggerFunctions): Promise<ITriggerResponse>;
}
