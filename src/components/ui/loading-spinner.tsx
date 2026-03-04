import Image from "next/image";
import lingopancarLogo from "@/assets/lingopancarrr.png";
import { useEffect, useState } from "react";

const pleaseWaitMessages = [
	{ lang: "en", text: "Please wait" },
	{ lang: "tr", text: "Lütfen bekleyin" },
	{ lang: "de", text: "Bitte warten" },
	{ lang: "nl", text: "Even geduld" },
	{ lang: "jp", text: "お待ちください" },
	{ lang: "es", text: "Por favor espera" },
	{ lang: "pt", text: "Por favor aguarde" },
];

export default function LoadingSpinner() {
	const [message, setMessage] = useState(pleaseWaitMessages[0]);

	useEffect(() => {
		const randomMessage = pleaseWaitMessages[Math.floor(Math.random() * pleaseWaitMessages.length)];
		setMessage(randomMessage);
	}, []);

	return (
		<div className="flex flex-col items-center justify-center">
			<div className="relative animate-pulse-scale">
				<Image
					loading="eager"
					src={lingopancarLogo}
					alt="LingoPancar Loading"
					width={140}
					height={140}
					className="rounded-lg"
				/>
			</div>
			<p className="text-secondary dark:text-secondary mt-4 font-light" title={message.lang}>
				{message.text}
			</p>
		</div>
	);
}
