import { useSyncDemo } from '@tldraw/sync'
import { Link } from 'react-router-dom'
import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'

export default function WhiteBoard() {
	const store = useSyncDemo({ roomId: window.location.pathname.split('/')[2] })
	return (
		<div className='h-[95vh]' style={{ position: 'fixed', inset: 0 }}>
			<Link className='pl-5 py-2 text-sm underline' to={'/'}>Home</Link>
			<Tldraw store={store} />
		</div>
	)
}