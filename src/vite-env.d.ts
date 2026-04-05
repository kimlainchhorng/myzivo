/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_WEBRTC_TURN_URLS?: string;
	readonly VITE_WEBRTC_TURN_USERNAME?: string;
	readonly VITE_WEBRTC_TURN_CREDENTIAL?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
