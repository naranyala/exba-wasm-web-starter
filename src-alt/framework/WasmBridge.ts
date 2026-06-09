import { process_action, process_ir } from '../../public/wasm/wasm_logic.js';
import { BAEXError, BAEXErrorCode, mapIRError } from './errors';
import { pipe } from './Functional';
import type { IRBundle } from './generated/IRBundle';
import type { IRCommand, IRResult } from './generated/IRCommand';

/**
 * Type definition for a bridge call.
 * Maps a specific command type and payload to a promise of a result.
 */
export type BridgeCall = <T extends IRCommand['type'], P = any>(
  type: T,
  payload: P,
) => Promise<any>;

/**
 * A factory that creates a WASM bridge instance.
 * This handles the serialization of IR commands into JSON, invokes the WASM logic,
 * and maps any resulting WASM errors back into TypeScript BAEXError instances.
 *
 * @returns An object containing the `call` and `action` methods.
 */
export const createBridge = () => {
  /**
   * Executes a specific IR command via the WASM bridge.
   *
   * @param type - The type of IR command to execute.
   * @param payload - The data payload associated with the command.
   * @returns A promise resolving to the command result payload.
   * @throws {BAEXError} If the WASM logic returns an error or a bridge failure occurs.
   */
  const call: BridgeCall = async (type, payload) => {
    try {
      const command: IRCommand = { type, payload } as any;
      const commandJson = JSON.stringify(command);

      const rawResult: IRResult = await process_ir(commandJson);

      if (rawResult.type === 'Error') {
        throw mapIRError(rawResult.payload);
      }

      return rawResult.payload;
    } catch (e) {
      if (e instanceof BAEXError) throw e;

      throw new BAEXError(
        BAEXErrorCode.INTERNAL_ERROR,
        e instanceof Error
          ? e.message
          : 'Unknown error during WASM bridge call',
        e,
      );
    }
  };

  /**
   * Triggers a predefined action by its identifier and retrieves the resulting IR bundle.
   *
   * @param actionId - The unique identifier of the action to be processed.
   * @returns A promise resolving to the IRBundle containing the result.
   * @throws {BAEXError} If the action fails to process in the WASM core.
   */
  const action = async (actionId: string): Promise<IRBundle> => {
    try {
      return (await process_action(actionId)) as IRBundle;
    } catch (e) {
      throw new BAEXError(
        BAEXErrorCode.WASM_BRIDGE_ERROR,
        `Failed to process action ${actionId}: ${e instanceof Error ? e.message : 'Unknown error'}`,
        e,
      );
    }
  };

  return { call, action };
};

/**
 * The default singleton instance of the WASM Bridge.
 */
export const WasmBridge = createBridge();
