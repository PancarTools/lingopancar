import Image from "next/image";
import lingopancarLogo from "@/assets/lingopancarrr.png";
import LoadingText from "@/components/ui/loading-text";

export default function LoadingSpinner() {
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
			<LoadingText className="text-secondary dark:text-secondary mt-4 font-light" />
		</div>
	);
}
