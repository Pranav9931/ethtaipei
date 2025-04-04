import { ReactNode, useEffect } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'

const appId: string = import.meta.env.VITE_APP_WORLD_ID || undefined;

export default function MiniKitProvider({ children }: { children: ReactNode }) {
	useEffect(() => {
		MiniKit.install(appId);
	}, [])

	return <>{children}</>
}
