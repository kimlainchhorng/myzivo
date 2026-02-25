/** Live chat stub */
export interface LiveChatSession { id: string; [key: string]: any; }
export interface LiveChatMessage { id: string; content: string; [key: string]: any; }

export function useLiveChat() {
  return { messages: [], sendMessage: async (_msg: string) => {}, isConnected: false, isLoading: false };
}
export function useActiveChatSession() { return { session: null, isLoading: false }; }
export function useChatSession(_id?: string) { return { session: null, isLoading: false }; }
export function useChatMessages(_id?: string) { return { messages: [], isLoading: false }; }
export function useCreateChatSession() { return { create: async () => null, isCreating: false }; }
export function useSendChatMessage() { return { send: async (_msg: string) => {}, isSending: false }; }
export function useEndChatSession() { return { end: async () => {}, isEnding: false }; }
export function useChatSessionRealtime(_id?: string) { return { session: null }; }
export function useChatMessagesRealtime(_id?: string) { return { messages: [] }; }
export function useUploadChatImage() { return { upload: async (_file: File) => "", isUploading: false }; }
